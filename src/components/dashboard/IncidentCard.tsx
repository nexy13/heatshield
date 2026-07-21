import { useState } from 'react';
import {
  Siren,
  MapPin,
  Thermometer,
  UserRound,
  UserCheck,
  Ambulance,
  ShieldCheck,
  Timer,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import type { ResponseEventType } from '@/types/database';
import {
  acknowledgeIncident,
  dispatchRescue,
  markWorkerSafe,
  type IncidentView,
} from '@/lib/api/sosTimeline';
import { formatTime, formatRelativeTime } from '@/lib/utils/formatters';
import EmergencyTimeline from './EmergencyTimeline';

/** Friendly present-tense label for the live/current stage. */
const ACTIVE_LABELS: Record<ResponseEventType, string> = {
  SOS_TRIGGERED: 'SOS Triggered',
  LOCATION_CAPTURED: 'Capturing Location',
  HEAT_INDEX_RECORDED: 'Recording Heat Index',
  SMS_SENT: 'Notifying Supervisor',
  EMAIL_SENT: 'Emailing Supervisor',
  SUPERVISOR_ACKNOWLEDGED: 'Supervisor Responding',
  RESCUE_DISPATCHED: 'Dispatching Rescue',
  WORKER_SAFE: 'Confirming Safety',
};

function formatDur(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec === 0 ? `${m}m` : `${m}m ${sec}s`;
}

function stepDone(incident: IncidentView, event: ResponseEventType): boolean {
  const step = incident.timeline.find((s) => s.event === event);
  return step?.status === 'completed';
}

interface Props {
  incident: IncidentView;
  actorName: string;
  onAction: () => void;
  defaultExpanded?: boolean;
}

export default function IncidentCard({ incident, actorName, onAction, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [busy, setBusy] = useState(false);

  const resolved = incident.status === 'resolved';
  const priorityColor = incident.priority === 'Critical' ? 'var(--emergency)' : 'var(--high)';
  const statusColor = resolved ? 'var(--safe)' : 'var(--info)';
  const statusLabel = resolved
    ? 'Resolved · Worker Safe'
    : incident.currentEvent
      ? ACTIVE_LABELS[incident.currentEvent]
      : 'In Progress';

  // Next admin action along the workflow.
  const nextAction: { label: string; run: () => Promise<void>; icon: typeof UserCheck } | null = resolved
    ? null
    : !stepDone(incident, 'SUPERVISOR_ACKNOWLEDGED')
      ? { label: 'Mark Supervisor Responded', run: () => acknowledgeIncident(incident.id, actorName), icon: UserCheck }
      : !stepDone(incident, 'RESCUE_DISPATCHED')
        ? { label: 'Mark Rescue Dispatched', run: () => dispatchRescue(incident.id), icon: Ambulance }
        : { label: 'Mark Worker Safe', run: () => markWorkerSafe(incident.id), icon: ShieldCheck };

  const runAction = async () => {
    if (!nextAction || busy) return;
    setBusy(true);
    try {
      await nextAction.run();
      onAction();
    } catch (err) {
      console.error('Incident action failed:', err);
    } finally {
      setBusy(false);
    }
  };

  const responseLabel =
    incident.responseSeconds != null
      ? formatDur(incident.responseSeconds)
      : resolved
        ? '—'
        : 'Live';

  return (
    <div
      className={`incident-card${resolved ? '' : ' incident-card-active'}`}
      style={!resolved ? { borderColor: `color-mix(in srgb, ${priorityColor} 30%, var(--border))` } : undefined}
    >
      {/* ── Collapsed summary ── */}
      <button className="incident-summary" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
        <div className="incident-icon" style={{ background: `color-mix(in srgb, ${priorityColor} 12%, transparent)`, color: priorityColor }}>
          <Siren size={18} />
          {!resolved && <span className="incident-icon-ping" style={{ borderColor: priorityColor }} />}
        </div>

        <div className="incident-main">
          <div className="incident-line1">
            <span className="badge" style={{ background: `color-mix(in srgb, ${priorityColor} 12%, transparent)`, color: priorityColor, border: `1px solid color-mix(in srgb, ${priorityColor} 26%, transparent)` }}>
              {incident.priority}
            </span>
            <span className="incident-title">Worker SOS</span>
            <span className="incident-site"><MapPin size={11} /> {incident.siteName}</span>
          </div>
          <div className="incident-line2">
            <span className="incident-meta"><UserRound size={12} /> {incident.workerName}</span>
            {incident.heatIndex != null && (
              <span className="incident-meta"><Thermometer size={12} /> {Math.round(incident.heatIndex)}°C</span>
            )}
            <span className="incident-meta"><Timer size={12} /> {responseLabel}</span>
            <span className="incident-meta incident-meta-dim">{formatRelativeTime(incident.triggeredAt)} · {formatTime(incident.triggeredAt)}</span>
          </div>
        </div>

        <div className="incident-right">
          <span className="incident-status" style={{ color: statusColor, background: `color-mix(in srgb, ${statusColor} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${statusColor} 26%, transparent)` }}>
            {!resolved && <span className="pulse-dot" style={{ background: statusColor, width: 6, height: 6 }} />}
            {statusLabel}
          </span>
          <span className="incident-toggle">
            View Timeline
            <ChevronDown size={14} className={`incident-chevron${expanded ? ' incident-chevron-open' : ''}`} />
          </span>
        </div>
      </button>

      {/* ── Expandable timeline ── */}
      <div className={`incident-expand${expanded ? ' incident-expand-open' : ''}`}>
        <div className="incident-expand-inner">
          <div className="incident-timeline-wrap">
            <EmergencyTimeline steps={incident.timeline} />

            {/* Supervisor / SMS detail strip */}
            <div className="incident-detail-strip">
              <div>
                <span className="incident-detail-k">Assigned Supervisor</span>
                <span className="incident-detail-v">{incident.supervisorName ?? '—'}</span>
              </div>
              <div>
                <span className="incident-detail-k">Contact</span>
                <span className="incident-detail-v">{incident.supervisorPhone ?? '—'}</span>
              </div>
              <div>
                <span className="incident-detail-k">Email Alert</span>
                <span className="incident-detail-v" style={{ wordBreak: 'break-all' }}>
                  {incident.supervisorEmail ?? '—'}
                  {incident.emailStatus && (
                    <span
                      className="incident-email-tag"
                      style={{
                        color: /fail/i.test(incident.emailStatus) ? 'var(--emergency)' : 'var(--safe)',
                      }}
                    >
                      {/fail/i.test(incident.emailStatus) ? '❌' : '✓'} {incident.emailStatus}
                    </span>
                  )}
                </span>
              </div>
              <div>
                <span className="incident-detail-k">Current Stage</span>
                <span className="incident-detail-v" style={{ color: statusColor }}>{statusLabel}</span>
              </div>
              <div>
                <span className="incident-detail-k">Response Time</span>
                <span className="incident-detail-v">{responseLabel}</span>
              </div>
            </div>

            {/* Admin actions */}
            {nextAction && (
              <div className="incident-actions">
                <button className="incident-action-btn" onClick={runAction} disabled={busy}>
                  {busy ? <Loader2 size={15} className="spin" /> : <nextAction.icon size={15} />}
                  {nextAction.label}
                </button>
              </div>
            )}
            {resolved && (
              <div className="incident-resolved-note">
                <ShieldCheck size={15} style={{ color: 'var(--safe)' }} />
                Incident resolved — worker confirmed safe.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
