import { supabase } from '@/lib/supabase';
import { composeEmergencySMS, sendSupervisorSMS } from '@/lib/api/notifications';
import { sendEmergencyEmail } from '@/lib/api/email';
import { logResponseEvent } from '@/lib/api/sosTimeline';
import type { SOSEvent, SOSEventWithDetails, Worker } from '@/types/database';

/**
 * Trigger an SOS event.
 *
 * Inserts the event (with worker_id when the worker identified themselves on
 * the kiosk, null when the anonymous fallback fired), logs an emergency
 * alert for history/analytics, and — as the primary real-time channel —
 * dispatches an SMS to the assigned site supervisor via the notification
 * service, carrying the worker's name and medical details (or
 * "Unidentified worker"), the site name, live heat index, and location.
 */
export async function triggerSOS(
  workerId: string | null,
  siteId: string,
  latitude?: number,
  longitude?: number,
  description?: string
): Promise<SOSEvent> {
  // Look up site, worker, and live heat index for the alert message and SMS
  // payload. Failures here must never block the SOS insert itself.
  let siteName = 'Unknown site';
  let siteRegion: string | null = null;
  let worker: Worker | null = null;
  let heatIndex: number | null = null;
  let riskLevel: string | null = null;
  let temperature: number | null = null;
  let supervisorName: string | null = null;
  let supervisorPhone: string | null = null;
  try {
    const [siteRes, workerRes, weatherRes, supRes] = await Promise.all([
      supabase.from('kiln_sites').select('name, region, address').eq('id', siteId).maybeSingle(),
      workerId
        ? supabase.from('workers').select('*').eq('id', workerId).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from('weather_readings')
        .select('heat_index, risk_level, temperature_c')
        .eq('site_id', siteId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('supervisors')
        .select('user:users(name, phone)')
        .eq('site_id', siteId)
        .limit(1)
        .maybeSingle(),
    ]);
    siteName = siteRes.data?.name ?? siteName;
    siteRegion = siteRes.data?.region ?? siteRes.data?.address ?? null;
    worker = (workerRes.data as Worker | null) ?? null;
    heatIndex = weatherRes.data?.heat_index ?? null;
    riskLevel = weatherRes.data?.risk_level ?? null;
    temperature = weatherRes.data?.temperature_c ?? null;
    const supUser = supRes.data?.user as { name?: string; phone?: string } | null;
    supervisorName = supUser?.name ?? null;
    supervisorPhone = supUser?.phone ?? null;
  } catch (err) {
    console.error('SOS enrichment lookup failed:', err);
  }

  const workerName = worker?.name ?? 'Unidentified worker';

  const { data, error } = await supabase
    .from('sos_events')
    .insert({
      worker_id: workerId ?? null,
      site_id: siteId,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      description: description ?? null,
      status: 'triggered',
      triggered_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // Also create a corresponding emergency alert
  await supabase.from('alerts').insert({
    site_id: siteId,
    worker_id: workerId ?? null,
    alert_type: 'sos',
    severity: 'emergency',
    message: `🚨 SOS triggered by ${workerName} at ${siteName}${description ? ': ' + description : ''}`,
    status: 'active',
  });

  // Primary real-time notification: SMS to the assigned site supervisor.
  const smsText = composeEmergencySMS({
    workerName,
    siteName,
    siteLocation: siteRegion ?? 'On-site GPS attached',
    heatIndex,
    riskLevel,
    triggeredAt: data.triggered_at,
  });

  const incidentLocation =
    siteRegion ??
    (latitude != null && longitude != null ? `${latitude}, ${longitude}` : 'On-site GPS attached');

  // Dispatch both supervisor channels in parallel: SMS/WhatsApp (Twilio) and
  // email (Resend). Neither may block or fail the SOS itself.
  const [smsResult, emailResult] = await Promise.all([
    sendSupervisorSMS({
      sms_text: smsText,
      supervisor_phone: supervisorPhone,
      sos_id: data.id,
      worker_id: workerId,
      worker_name: workerName,
      blood_group: worker?.blood_group ?? null,
      medical_conditions: worker?.medical_conditions ?? [],
      emergency_contact_name: worker?.emergency_contact_name ?? null,
      emergency_contact_phone: worker?.emergency_contact_phone ?? null,
      site_id: siteId,
      site_name: siteName,
      heat_index: heatIndex,
      risk_level: riskLevel,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      triggered_at: data.triggered_at,
      description: description ?? null,
    }),
    sendEmergencyEmail({
      siteId,
      siteName,
      location: incidentLocation,
      heatIndex,
      temperature,
      incidentTime: data.triggered_at,
      workerId,
      workerName,
    }),
  ]);

  // Map the real Twilio dispatch result onto the timeline SMS step.
  const smsFailed = smsResult.status === 'failed' || smsResult.status === 'not_configured';
  const smsDelivered = smsResult.status === 'delivered' || smsResult.status === 'queued';
  const smsDeliveryStatus =
    smsResult.status === 'delivered'
      ? 'Delivered'
      : smsResult.status === 'queued'
        ? 'Sent'
        : smsResult.status === 'not_configured'
          ? 'No recipient'
          : 'Failed';
  const smsReason =
    smsResult.status === 'failed'
      ? smsResult.error
      : smsResult.status === 'not_configured'
        ? 'No supervisor phone registered for this site'
        : undefined;
  // The kiosk is anonymous and can't read supervisor details (RLS), so prefer
  // the recipient the send-sms function resolved and returned server-side.
  const smsRecipientName = (smsDelivered && smsResult.recipientName) || supervisorName || 'Site Supervisor';
  const smsRecipientPhone = (smsDelivered && smsResult.to) || supervisorPhone || 'Not on file';

  // Map the email dispatch result onto the timeline EMAIL_SENT step.
  const emailSent = emailResult.status === 'sent';
  const emailConfigured = emailResult.status !== 'not_configured';
  const emailRecipient = (emailSent ? emailResult.to : (emailResult.status === 'failed' ? emailResult.to : null)) ?? null;
  const emailRecipientName = (emailSent && emailResult.recipientName) || supervisorName || 'Site Supervisor';

  // Record the opening stages of the emergency response timeline so the
  // Admin Dashboard shows the live workflow. Never let this block the SOS.
  try {
    await logResponseEvent(data.id, 'SOS_TRIGGERED', { workerName });
    if (latitude != null && longitude != null) {
      await logResponseEvent(data.id, 'LOCATION_CAPTURED', {
        location: siteName,
        latitude,
        longitude,
      });
    }
    if (heatIndex != null) {
      await logResponseEvent(data.id, 'HEAT_INDEX_RECORDED', {
        heat_index: heatIndex,
        risk_level: riskLevel,
      });
    }
    await logResponseEvent(
      data.id,
      'SMS_SENT',
      {
        recipient: smsRecipientName,
        phone: smsRecipientPhone,
        provider: 'Twilio',
        delivery_status: smsDeliveryStatus,
        ...(smsReason ? { reason: smsReason } : {}),
      },
      smsFailed ? 'failed' : 'completed'
    );
    // Only record EMAIL_SENT once the email provider is configured; before
    // that the step stays pending rather than showing a false failure.
    if (emailConfigured) {
      await logResponseEvent(
        data.id,
        'EMAIL_SENT',
        {
          recipient: emailRecipient ?? emailRecipientName,
          recipient_name: emailRecipientName,
          provider: 'Resend',
          delivery_status: emailSent ? 'Sent' : 'Failed',
          ...(emailResult.status === 'failed' ? { reason: emailResult.error } : {}),
        },
        emailSent ? 'completed' : 'failed'
      );
    }
  } catch (err) {
    console.error('Failed to log SOS response timeline:', err);
  }

  return data;
}

/** Get active SOS events for a site */
export async function getActiveSOS(siteId: string): Promise<SOSEventWithDetails[]> {
  const { data, error } = await supabase
    .from('sos_events')
    .select('*, worker:workers(*), site:kiln_sites(*)')
    .eq('site_id', siteId)
    .in('status', ['triggered', 'responding'])
    .order('triggered_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as SOSEventWithDetails[];
}

/** Get active SOS events across all sites (admin) */
export async function getAllActiveSOS(): Promise<SOSEventWithDetails[]> {
  const { data, error } = await supabase
    .from('sos_events')
    .select('*, worker:workers(*), site:kiln_sites(*)')
    .in('status', ['triggered', 'responding'])
    .order('triggered_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as SOSEventWithDetails[];
}

/** Get SOS event history across all sites (admin) */
export async function getAllSOSHistory(limit = 50): Promise<SOSEventWithDetails[]> {
  const { data, error } = await supabase
    .from('sos_events')
    .select('*, worker:workers(*), site:kiln_sites(*)')
    .order('triggered_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as SOSEventWithDetails[];
}

/** Respond to an SOS event */
export async function respondToSOS(sosId: string, respondedBy: string): Promise<SOSEvent> {
  const { data, error } = await supabase
    .from('sos_events')
    .update({
      status: 'responding',
      responded_by: respondedBy,
    })
    .eq('id', sosId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Resolve an SOS event */
export async function resolveSOS(sosId: string): Promise<SOSEvent> {
  const { data, error } = await supabase
    .from('sos_events')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
    })
    .eq('id', sosId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Get SOS event history */
export async function getSOSHistory(siteId: string, limit = 20): Promise<SOSEventWithDetails[]> {
  const { data, error } = await supabase
    .from('sos_events')
    .select('*, worker:workers(*), site:kiln_sites(*)')
    .eq('site_id', siteId)
    .order('triggered_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as SOSEventWithDetails[];
}
