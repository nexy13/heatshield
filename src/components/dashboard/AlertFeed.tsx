import { formatRelativeTime } from '@/lib/utils/formatters';
import { AlertTriangle, Bell, Siren, Droplets, Shield } from 'lucide-react';
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

const severityStyles = {
  info: 'border-l-blue-500 bg-blue-500/5',
  warning: 'border-l-amber-500 bg-amber-500/5',
  critical: 'border-l-orange-500 bg-orange-500/5',
  emergency: 'border-l-red-500 bg-red-500/5',
};

const severityBadge = {
  info: 'badge-info',
  warning: 'badge-warning',
  critical: 'badge-warning',
  emergency: 'badge-danger',
};

export default function AlertFeed({ alerts, maxItems = 10, onAcknowledge }: AlertFeedProps) {
  const displayed = alerts.slice(0, maxItems);

  if (displayed.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <Shield size={40} className="mx-auto text-emerald-400 mb-3 opacity-60" />
        <p className="text-sm text-[var(--color-text-muted)]">No active alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayed.map((alert, i) => {
        const Icon = typeIcons[alert.alert_type] ?? Bell;
        return (
          <div
            key={alert.id}
            className={`glass rounded-xl p-4 border-l-4 card-hover animate-fade-up ${severityStyles[alert.severity]}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`badge ${severityBadge[alert.severity]}`}>
                    {alert.severity}
                  </span>
                  <span className="badge badge-neutral">{alert.alert_type.replace('_', ' ')}</span>
                  <span className="text-xs text-[var(--color-text-muted)] ml-auto">
                    {formatRelativeTime(alert.created_at)}
                  </span>
                </div>
                <p className="text-sm">{alert.message}</p>
                {alert.status === 'active' && onAcknowledge && (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="mt-2 text-xs btn-secondary px-3 py-1 rounded-lg"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
