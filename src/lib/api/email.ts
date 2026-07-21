// ============================================
// HeatShield — Emergency Email Service
//
// Thin, provider-agnostic client layer over the `send-email` Edge Function.
// The frontend NEVER talks to the email provider directly — the function
// holds the API key and resolves the supervisor's email server-side. Swapping
// providers (Resend / SendGrid / SMTP) is a backend change only; this layer
// and the UI stay identical.
// ============================================

import { supabase } from '@/lib/supabase';

export interface EmergencyEmailInput {
  /** Site whose registered supervisor should be emailed (resolved server-side). */
  siteId: string;
  siteName: string;
  location: string;
  heatIndex: number | null;
  temperature: number | null;
  incidentTime: string;
  workerId: string | null;
  workerName: string | null;
  /** Optional explicit recipient (overrides the site-supervisor lookup). */
  to?: string | null;
}

export type EmailDispatchResult =
  | { status: 'sent'; id: string | null; to?: string; recipientName?: string | null }
  | { status: 'failed'; error: string; to?: string }
  | { status: 'not_configured' };

/**
 * Send the emergency SOS email to the site's assigned supervisor.
 * Never throws — failures are returned so the SOS workflow always continues.
 */
export async function sendEmergencyEmail(input: EmergencyEmailInput): Promise<EmailDispatchResult> {
  if (!input.to && !input.siteId) {
    return { status: 'not_configured' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: input.to ?? null,
        site_id: input.siteId,
        incident: {
          siteName: input.siteName,
          location: input.location,
          heatIndex: input.heatIndex,
          temperature: input.temperature,
          incidentTime: input.incidentTime,
          workerId: input.workerId ?? 'Anonymous',
          workerName: input.workerName ?? 'Unidentified worker',
        },
      },
    });
    if (error) throw error;

    if (data?.success) {
      return {
        status: 'sent',
        id: data.id ?? null,
        to: data.to ?? undefined,
        recipientName: data.recipient_name ?? null,
      };
    }
    const errMsg = String(data?.error ?? 'Email service error');
    // Treat an unconfigured provider as "not configured" (pending) rather than
    // a hard failure, so the timeline doesn't show a scary error before setup.
    if (/not configured/i.test(errMsg)) return { status: 'not_configured' };
    return { status: 'failed', error: errMsg, to: data?.to };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Email dispatch failed';
    console.error('Emergency email dispatch failed:', msg);
    return { status: 'failed', error: msg };
  }
}
