import {
  Siren,
  MapPin,
  Thermometer,
  MessageSquare,
  Mail,
  UserCheck,
  Ambulance,
  ShieldCheck,
  Check,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { ResponseEventType, ResponseStepStatus } from '@/types/database';
import { STEP_LABELS, type TimelineStep } from '@/lib/api/sosTimeline';
import { formatTime } from '@/lib/utils/formatters';

const STEP_ICONS: Record<ResponseEventType, LucideIcon> = {
  SOS_TRIGGERED: Siren,
  LOCATION_CAPTURED: MapPin,
  HEAT_INDEX_RECORDED: Thermometer,
  SMS_SENT: MessageSquare,
  EMAIL_SENT: Mail,
  SUPERVISOR_ACKNOWLEDGED: UserCheck,
  RESCUE_DISPATCHED: Ambulance,
  WORKER_SAFE: ShieldCheck,
};

const STATUS_COLOR: Record<ResponseStepStatus, string> = {
  completed: 'var(--safe)',
  current: 'var(--info)',
  pending: 'var(--text-light)',
  failed: 'var(--emergency)',
};

const s = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v : null);
const n = (v: unknown): number | null => (typeof v === 'number' && !Number.isNaN(v) ? v : null);

/** Build the human description shown under each timeline step. */
function describe(step: TimelineStep): string {
  const d = step.details ?? {};
  switch (step.event) {
    case 'SOS_TRIGGERED':
      return s(d.workerName) ? `${s(d.workerName)} pressed the SOS button.` : 'Worker pressed the SOS button.';
    case 'LOCATION_CAPTURED': {
      if (step.status === 'pending') return 'Awaiting GPS fix.';
      const loc = s(d.location);
      const lat = n(d.latitude);
      const lng = n(d.longitude);
      const coords = lat != null && lng != null ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : null;
      return [loc, coords].filter(Boolean).join(' · ') || 'GPS location captured.';
    }
    case 'HEAT_INDEX_RECORDED': {
      if (step.status === 'pending') return 'Reading pending.';
      const hi = n(d.heat_index);
      const risk = s(d.risk_level);
      if (hi == null) return 'Heat index recorded.';
      return `${Math.round(hi)}°C${risk ? ` · ${risk.charAt(0).toUpperCase()}${risk.slice(1)}` : ''}`;
    }
    case 'SMS_SENT': {
      if (step.status === 'pending') return 'Dispatching alert to supervisor…';
      if (step.status === 'failed') return s(d.reason) ?? 'SMS delivery failed.';
      const who = s(d.recipient);
      const phone = s(d.phone);
      const status = s(d.delivery_status) ?? 'Sent';
      return [who ? `To ${who}` : null, phone, status].filter(Boolean).join(' · ');
    }
    case 'EMAIL_SENT': {
      if (step.status === 'pending') return 'Emailing supervisor…';
      const email = s(d.recipient);
      if (step.status === 'failed') {
        return [email, s(d.reason) ?? 'Email delivery failed.'].filter(Boolean).join(' · ');
      }
      const status = s(d.delivery_status) ?? 'Sent';
      return [email ? `To ${email}` : null, status].filter(Boolean).join(' · ');
    }
    case 'SUPERVISOR_ACKNOWLEDGED':
      if (step.status === 'completed') return s(d.by) ? `Acknowledged by ${s(d.by)}.` : 'Supervisor acknowledged.';
      if (step.status === 'current') return 'Awaiting supervisor acknowledgement…';
      return 'Pending';
    case 'RESCUE_DISPATCHED': {
      if (step.status === 'completed') {
        const team = s(d.team);
        const eta = n(d.eta_min);
        return [team, eta != null ? `ETA ${eta} min` : null].filter(Boolean).join(' · ') || 'Rescue team dispatched.';
      }
      if (step.status === 'current') return 'Coordinating rescue team…';
      return 'Waiting';
    }
    case 'WORKER_SAFE':
      if (step.status === 'completed') return s(d.outcome) ?? 'Worker confirmed safe.';
      if (step.status === 'current') return 'Confirming worker safety…';
      return 'Pending';
    default:
      return '';
  }
}

const STATUS_TAG: Record<ResponseStepStatus, string> = {
  completed: 'Completed',
  current: 'In Progress',
  pending: 'Pending',
  failed: 'Failed',
};

export default function EmergencyTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="etl">
      {steps.map((step, i) => {
        const color = STATUS_COLOR[step.status];
        const Icon = STEP_ICONS[step.event];
        const isCurrent = step.status === 'current';
        const isLast = i === steps.length - 1;
        return (
          <li
            key={step.event}
            className="etl-step animate-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* Node + connector */}
            <div className="etl-rail">
              <span
                className={`etl-node${isCurrent ? ' etl-node-current' : ''}`}
                style={{
                  color,
                  borderColor: color,
                  background: `color-mix(in srgb, ${color} 14%, var(--bg-card))`,
                  ...(isCurrent ? { ['--etl-pulse' as string]: color } : {}),
                }}
              >
                {step.status === 'completed' ? (
                  <Check size={13} strokeWidth={3} />
                ) : step.status === 'failed' ? (
                  <X size={13} strokeWidth={3} />
                ) : (
                  <Icon size={13} strokeWidth={2.5} />
                )}
              </span>
              {!isLast && (
                <span
                  className="etl-line"
                  style={{
                    background:
                      step.status === 'completed'
                        ? 'var(--safe)'
                        : 'var(--border-strong)',
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div className="etl-body">
              <div className="etl-head">
                <span className="etl-title" style={isCurrent ? { color: 'var(--info)' } : undefined}>
                  {STEP_LABELS[step.event]}
                </span>
                <span
                  className="etl-tag"
                  style={{
                    color,
                    background: `color-mix(in srgb, ${color} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${color} 26%, transparent)`,
                  }}
                >
                  {isCurrent && <span className="pulse-dot" style={{ background: color, width: 5, height: 5 }} />}
                  {STATUS_TAG[step.status]}
                </span>
              </div>
              <p className="etl-desc">{describe(step)}</p>
              {step.at && (step.status === 'completed' || step.status === 'failed') && (
                <span className="etl-time">{formatTime(step.at)}</span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
