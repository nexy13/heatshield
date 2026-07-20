// ============================================
// HeatShield — Supervisor Notification Service
//
// The primary real-time channel for a worker emergency is an SMS to the
// assigned site supervisor, routed through the n8n → SMS gateway webhook
// (VITE_N8N_SOS_WEBHOOK_URL). The in-app alert stream remains the
// system-of-record for history, analytics, and compliance.
//
// When no gateway is configured the service degrades gracefully: the
// message is still composed (so the UI flow and payload stay identical)
// and the dispatch is skipped without surfacing an error to the kiosk.
// ============================================

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

export type SMSDispatchResult = 'dispatched' | 'not_configured';

/**
 * Dispatch the emergency SMS to the assigned supervisor via the SMS
 * gateway webhook. Fire-and-forget: a routing failure must never make
 * the SOS itself appear to have failed on the kiosk.
 */
export function sendSupervisorSMS(
  payload: Record<string, unknown> & { sms_text: string }
): SMSDispatchResult {
  const webhookUrl = import.meta.env.VITE_N8N_SOS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.info(
      '[HeatShield] SMS gateway not configured — supervisor SMS composed but not dispatched:\n',
      payload.sms_text
    );
    return 'not_configured';
  }

  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((err) => console.error('Supervisor SMS dispatch failed:', err));

  return 'dispatched';
}
