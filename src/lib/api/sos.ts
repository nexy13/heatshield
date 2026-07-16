import { supabase } from '@/lib/supabase';
import type { SOSEvent, SOSEventWithDetails } from '@/types/database';

/** Trigger an SOS event */
export async function triggerSOS(
  workerId: string,
  siteId: string,
  latitude?: number,
  longitude?: number,
  description?: string
): Promise<SOSEvent> {
  const { data, error } = await supabase
    .from('sos_events')
    .insert({
      worker_id: workerId,
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
    worker_id: workerId,
    alert_type: 'sos',
    severity: 'emergency',
    message: `🚨 SOS triggered by worker${description ? ': ' + description : ''}`,
    status: 'active',
  });

  return data;
}

/** Get active SOS events for a site */
export async function getActiveSOS(siteId: string): Promise<SOSEventWithDetails[]> {
  const { data, error } = await supabase
    .from('sos_events')
    .select('*, worker:workers(*, user:users(*)), site:kiln_sites(*)')
    .eq('site_id', siteId)
    .in('status', ['triggered', 'responding'])
    .order('triggered_at', { ascending: false });

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
    .select('*, worker:workers(*, user:users(*)), site:kiln_sites(*)')
    .eq('site_id', siteId)
    .order('triggered_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as SOSEventWithDetails[];
}
