// ============================================
// HeatShield — Supervisor Notification Service
//
// The primary real-time channel for a worker emergency is an SMS to the
// assigned site supervisor's registered phone number, sent via the
// `send-sms` Supabase Edge Function (which calls Twilio server-side so the
// credentials never reach the browser). The in-app alert stream remains the
// system-of-record for history, analytics, and compliance.
//
// When no recipient phone or SMS gateway is configured the service degrades
// gracefully: the message is still composed (so the UI flow and payload stay
// identical) and the dispatch is skipped without surfacing an error.
// ============================================

import { supabase } from '@/lib/supabase';

export interface EmergencySMSContext {
  workerName: string;
  siteName: string;
  /** Human-readable location, e.g. "Anekal, Bengaluru" */
  siteLocation: string;
  heatIndex: number | null;
  riskLevel: string | null;
  /** ISO timestamp of the SOS trigger */
  triggeredAt: string;
}

/** Compose the supervisor-facing emergency SMS body. */
export function composeEmergencySMS(ctx: EmergencySMSContext): string {
  const heatLine =
    ctx.heatIndex != null
      ? `${Math.round(ctx.heatIndex)}°C${
          ctx.riskLevel
            ? ` (${ctx.riskLevel.charAt(0).toUpperCase() + ctx.riskLevel.slice(1)})`
            : ''
        }`
      : 'Unavailable';

  const time = new Date(ctx.triggeredAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return [
    'HEATSHIELD EMERGENCY ALERT',
    '',
    'Worker Emergency',
    '',
    `Site: ${ctx.siteName}`,
    `Location: ${ctx.siteLocation}`,
    `Heat Index: ${heatLine}`,
    `Time: ${time}`,
    '',
    'Action Required: Immediate assistance requested by a worker.',
    'Open dashboard for details.',
  ].join('\n');
}

export type SMSDispatchResult =
  | { status: 'delivered'; sid: string; to?: string; recipientName?: string | null }
  | { status: 'queued'; sid: string; to?: string; recipientName?: string | null }
  | { status: 'failed'; error: string }
  | { status: 'not_configured' };

/**
 * Dispatch the emergency SMS to the assigned supervisor's registered phone
 * via the `send-sms` Edge Function (Twilio). Never throws — a routing
 * failure is returned as a result so the SOS itself still succeeds.
 *
 * The recipient is resolved SERVER-SIDE from `site_id` (so it works for the
 * anonymous public kiosk, whose RLS can't read supervisor phones); an
 * explicit `supervisor_phone` is used as a hint when available.
 */
export async function sendSupervisorSMS(
  payload: Record<string, unknown> & { sms_text: string }
): Promise<SMSDispatchResult> {
  const to = (payload.supervisor_phone as string | null | undefined) ?? null;
  const siteId = (payload.site_id as string | null | undefined) ?? null;

  // Optional legacy channel: mirror the payload to an n8n webhook if one is set.
  const webhookUrl = import.meta.env.VITE_N8N_SOS_WEBHOOK_URL;
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.error('n8n SMS mirror failed:', err));
  }

  if (!to && !siteId) {
    console.info('[HeatShield] No recipient or site for supervisor SMS — not sent.');
    return { status: 'not_configured' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: { to, site_id: siteId, message: payload.sms_text },
    });
    if (error) throw error;

    if (data?.success) {
      return {
        status: data.status === 'delivered' ? 'delivered' : 'queued',
        sid: String(data.sid ?? ''),
        to: data.to ?? undefined,
        recipientName: data.recipient_name ?? null,
      };
    }
    return { status: 'failed', error: String(data?.error ?? 'SMS gateway error') };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'SMS dispatch failed';
    console.error('Supervisor SMS dispatch failed:', msg);
    return { status: 'failed', error: msg };
  }
}
