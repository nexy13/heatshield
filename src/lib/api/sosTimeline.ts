// ============================================
// HeatShield — Emergency Response Timeline API
// ============================================
// Reads SOS incidents and their step-by-step response events, and assembles
// the 7-stage emergency timeline the Admin Dashboard renders. Response rows
// are append-only; the "current" (in-progress) stage is derived, not stored.

import { supabase } from '@/lib/supabase';
import type {
  ResponseEventType,
  ResponseStepStatus,
  SOSResponseEvent,
  SOSEventWithDetails,
  SOSStatus,
} from '@/types/database';

/** Canonical order of the emergency workflow. */
export const RESPONSE_STEPS: ResponseEventType[] = [
  'SOS_TRIGGERED',
  'LOCATION_CAPTURED',
  'HEAT_INDEX_RECORDED',
  'SMS_SENT',
  'EMAIL_SENT',
  'SUPERVISOR_ACKNOWLEDGED',
  'RESCUE_DISPATCHED',
  'WORKER_SAFE',
];

/** Short human label for each stage. */
export const STEP_LABELS: Record<ResponseEventType, string> = {
  SOS_TRIGGERED: 'SOS Triggered',
  LOCATION_CAPTURED: 'Location Captured',
  HEAT_INDEX_RECORDED: 'Heat Index Recorded',
  SMS_SENT: 'SMS Sent to Supervisor',
  EMAIL_SENT: 'Email Sent to Supervisor',
  SUPERVISOR_ACKNOWLEDGED: 'Supervisor Acknowledged',
  RESCUE_DISPATCHED: 'Rescue Team Dispatched',
  WORKER_SAFE: 'Worker Marked Safe',
};

export interface TimelineStep {
  event: ResponseEventType;
  status: ResponseStepStatus;
  at: string | null;
  details: Record<string, unknown> | null;
}

export interface IncidentView {
  id: string;
  siteName: string;
  region: string | null;
  workerName: string;
  triggeredAt: string;
  resolvedAt: string | null;
  status: SOSStatus;
  latitude: number | null;
  longitude: number | null;
  heatIndex: number | null;
  riskLevel: string | null;
  supervisorName: string | null;
  supervisorPhone: string | null;
  supervisorEmail: string | null;
  smsStatus: string | null;
  smsFailReason: string | null;
  emailStatus: string | null;
  emailFailReason: string | null;
  priority: 'Critical' | 'High' | 'Elevated';
  currentEvent: ResponseEventType | null;
  currentStageLabel: string;
  responseSeconds: number | null;
  timeline: TimelineStep[];
  events: SOSResponseEvent[];
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null;
}
function num(v: unknown): number | null {
  return typeof v === 'number' && !Number.isNaN(v) ? v : null;
}

/** Derive the worker's display name from the trigger event, the joined
 *  worker record, or the "SOS for <name>" description fallback. */
function deriveWorkerName(incident: SOSEventWithDetails, byEvent: Partial<Record<ResponseEventType, SOSResponseEvent>>): string {
  const fromEvent = str(byEvent.SOS_TRIGGERED?.details?.workerName);
  if (fromEvent) return fromEvent;
  if (incident.worker?.name) return incident.worker.name;
  const desc = incident.description ?? '';
  const m = desc.match(/SOS for (.+)/i);
  if (m) return m[1].trim();
  return 'Unidentified worker';
}

/** Assemble the full 7-stage timeline for one incident from its raw rows. */
export function buildTimeline(incident: SOSEventWithDetails, rawEvents: SOSResponseEvent[]): IncidentView {
  const events = [...rawEvents].sort(
    (a, b) => new Date(a.event_at).getTime() - new Date(b.event_at).getTime()
  );
  const byEvent: Partial<Record<ResponseEventType, SOSResponseEvent>> = {};
  for (const e of events) byEvent[e.event] = e;

  const resolved = incident.status === 'resolved';
  const hasLocation = incident.latitude != null && incident.longitude != null;

  const timeline: TimelineStep[] = RESPONSE_STEPS.map((event) => {
    const row = byEvent[event];
    if (row) {
      return { event, status: row.status, at: row.event_at, details: row.details };
    }
    // No explicit row — derive a sensible status.
    if (event === 'SOS_TRIGGERED') {
      return { event, status: 'completed', at: incident.triggered_at, details: null };
    }
    if (event === 'LOCATION_CAPTURED' && hasLocation) {
      return {
        event,
        status: 'completed',
        at: incident.triggered_at,
        details: { latitude: incident.latitude, longitude: incident.longitude },
      };
    }
    // A closed incident is treated as fully completed.
    if (resolved) {
      return { event, status: 'completed', at: incident.resolved_at, details: null };
    }
    return { event, status: 'pending', at: null, details: null };
  });

  // The first pending step becomes the live "current" stage.
  let currentEvent: ResponseEventType | null = null;
  if (!resolved) {
    const idx = timeline.findIndex((s) => s.status === 'pending');
    if (idx !== -1) {
      timeline[idx].status = 'current';
      currentEvent = timeline[idx].event;
    }
  }

  const heatDetails = byEvent.HEAT_INDEX_RECORDED?.details;
  const smsDetails = byEvent.SMS_SENT?.details;
  const emailDetails = byEvent.EMAIL_SENT?.details;
  const ackAt = byEvent.SUPERVISOR_ACKNOWLEDGED?.event_at ?? null;

  const riskLevel = str(heatDetails?.risk_level);
  const priority: IncidentView['priority'] =
    riskLevel === 'danger' || riskLevel === 'extreme'
      ? 'Critical'
      : riskLevel === 'high'
        ? 'High'
        : 'High';

  const currentStageLabel = resolved
    ? 'Resolved · Worker Safe'
    : currentEvent
      ? STEP_LABELS[currentEvent]
      : 'In Progress';

  const responseSeconds =
    ackAt != null
      ? Math.max(0, Math.round((new Date(ackAt).getTime() - new Date(incident.triggered_at).getTime()) / 1000))
      : null;

  return {
    id: incident.id,
    siteName: incident.site?.name ?? 'Unknown site',
    region: incident.site?.region ?? null,
    workerName: deriveWorkerName(incident, byEvent),
    triggeredAt: incident.triggered_at,
    resolvedAt: incident.resolved_at,
    status: incident.status,
    latitude: incident.latitude,
    longitude: incident.longitude,
    heatIndex: num(heatDetails?.heat_index),
    riskLevel,
    supervisorName: str(smsDetails?.recipient),
    supervisorPhone: str(smsDetails?.phone),
    supervisorEmail: str(emailDetails?.recipient),
    smsStatus: str(smsDetails?.delivery_status),
    smsFailReason: str(smsDetails?.reason),
    emailStatus: str(emailDetails?.delivery_status),
    emailFailReason: str(emailDetails?.reason),
    priority,
    currentEvent,
    currentStageLabel,
    responseSeconds,
    timeline,
    events,
  };
}

/** Fetch recent SOS incidents with their full response timelines (admin). */
export async function getRecentIncidents(limit = 12): Promise<IncidentView[]> {
  const { data: incidents, error } = await supabase
    .from('sos_events')
    .select('*, worker:workers(*), site:kiln_sites(*)')
    .order('triggered_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  const list = (incidents ?? []) as unknown as SOSEventWithDetails[];
  if (list.length === 0) return [];

  const ids = list.map((i) => i.id);
  const { data: eventRows, error: evErr } = await supabase
    .from('sos_response_events')
    .select('*')
    .in('incident_id', ids);

  if (evErr) throw evErr;
  const rows = (eventRows ?? []) as SOSResponseEvent[];

  const byIncident = new Map<string, SOSResponseEvent[]>();
  for (const r of rows) {
    const arr = byIncident.get(r.incident_id) ?? [];
    arr.push(r);
    byIncident.set(r.incident_id, arr);
  }

  return list.map((incident) => buildTimeline(incident, byIncident.get(incident.id) ?? []));
}

/** Append one response step to an incident (append-only, deduped by event). */
export async function logResponseEvent(
  incidentId: string,
  event: ResponseEventType,
  details: Record<string, unknown> = {},
  status: ResponseStepStatus = 'completed'
): Promise<void> {
  const { data: existing } = await supabase
    .from('sos_response_events')
    .select('id')
    .eq('incident_id', incidentId)
    .eq('event', event)
    .limit(1)
    .maybeSingle();

  if (existing) return; // already logged

  const { error } = await supabase.from('sos_response_events').insert({
    incident_id: incidentId,
    event,
    status,
    details,
    event_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/** Admin action: supervisor has acknowledged the emergency. */
export async function acknowledgeIncident(incidentId: string, byName: string): Promise<void> {
  await logResponseEvent(incidentId, 'SUPERVISOR_ACKNOWLEDGED', { by: byName });
  await supabase.from('sos_events').update({ status: 'responding', responded_by: byName }).eq('id', incidentId);
}

/** Admin action: rescue team dispatched to the site. */
export async function dispatchRescue(incidentId: string): Promise<void> {
  await logResponseEvent(incidentId, 'RESCUE_DISPATCHED', { team: 'Site Rescue Unit', eta_min: 5 });
  await supabase.from('sos_events').update({ status: 'responding' }).eq('id', incidentId);
}

/** Admin action: worker confirmed safe — closes the incident. */
export async function markWorkerSafe(incidentId: string): Promise<void> {
  await logResponseEvent(incidentId, 'WORKER_SAFE', { outcome: 'Worker moved to safety and stabilized' });
  await supabase
    .from('sos_events')
    .update({ status: 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', incidentId);
}
