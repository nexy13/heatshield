import { formatRelativeTime } from '@/lib/utils/formatters';
import { AlertTriangle, Bell, Siren, Droplets, Shield, ShieldCheck } from 'lucide-react';
import type { Alert } from '@/types/database';

interface AlertFeedProps {
  alerts: Alert[];
  maxItems?: number;
  onAcknowledge?: (id: string) => void;
}

const typeIcons = {
  heat_warning: AlertTriangle,
  hydration: Droplets,
  sos: Siren,
  compliance: Shield,
  system: Bell,
};

const severityConfig: Record<
  string,
  { accent: string; badge: string; label: string; animate?: boolean }
> = {
  info:      { accent: 'var(--info)',      badge: 'badge-info',    label: 'Info' },
  warning:   { accent: 'var(--caution)',   badge: 'badge-warning', label: 'Warning' },
  critical:  { accent: 'var(--high)',      badge: 'badge-orange',  label: 'Critical', animate: true },
  emergency: { accent: 'var(--emergency)', badge: 'badge-danger',  label: 'Emergency', animate: true },
};

export default function AlertFeed({ alerts, maxItems = 10, onAcknowledge }: AlertFeedProps) {
  const displayed = alerts.slice(0, maxItems);

  if (displayed.length === 0) {
    return (
      <div className="empty-state animate-fade-up" style={{ padding: '4.5rem 2rem' }}>
        <div className="empty-shield" aria-hidden="true">
          <span className="empty-shield-ring" />
          <span className="empty-shield-ring" />
          <div className="empty-shield-core">
            <ShieldCheck size={42} strokeWidth={1.75} />
          </div>
        </div>
        <p className="font-serif text-xl font-bold text-[var(--text)]">No active incidents</p>
        <p className="text-sm text-[var(--text-muted)] mt-1.5 max-w-xs leading-relaxed">
          All monitored kiln sites are operating safely.
        </p>
        <span className="badge badge-success mt-5">
          <span className="status-dot" style={{ background: 'var(--safe)' }} />
          Systems Nominal
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline rail */}
      <div
        className="absolute left-[19px] top-3 bottom-3 w-px hidden sm:block"
        style={{ background: 'linear-gradient(180deg, var(--border), transparent)' }}
        aria-hidden="true"
      />

      <div className="space-y-3">
        {displayed.map((alert, i) => {
          const Icon = typeIcons[alert.alert_type] ?? Bell;
          const config = severityConfig[alert.severity] ?? severityConfig.info;
          return (
            <div
              key={alert.id}
              className="relative flex gap-3 sm:gap-4 animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}
            >
              {/* Timeline node */}
              <div
                className={`relative z-10 shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-1 ${
                  config.animate && alert.status === 'active' ? 'badge-live' : ''
                }`}
                style={{
                  background: `color-mix(in srgb, ${config.accent} 12%, var(--bg-white))`,
                  border: `1px solid color-mix(in srgb, ${config.accent} 28%, transparent)`,
                  color: config.accent,
                }}
              >
                <Icon size={17} strokeWidth={2.25} />
              </div>

              {/* Card */}
              <div
                className="card card-hover flex-1 min-w-0 p-4"
                style={
                  config.animate && alert.status === 'active'
                    ? { borderColor: `color-mix(in srgb, ${config.accent} 30%, var(--border))` }
                    : undefined
                }
              >
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className={`badge ${config.badge}`}>
                    {alert.status === 'active' && config.animate && (
                      <span className="status-dot" style={{ background: config.accent }} />
                    )}
                    {config.label}
                  </span>
                  <span className="badge badge-neutral">{alert.alert_type.replace('_', ' ')}</span>
                  <span className="text-xs text-[var(--text-light)] ml-auto font-medium">
                    {formatRelativeTime(alert.created_at)}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{alert.message}</p>
                {alert.status === 'active' && onAcknowledge && (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="btn-secondary mt-3 px-3 py-1.5 text-xs"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
