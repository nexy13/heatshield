import { useEffect, useState } from 'react';
import {
  Users,
  AlertTriangle,
  Siren,
  Thermometer,
  Clock,
} from 'lucide-react';
import StatsGrid from '@/components/dashboard/StatsGrid';
import HeatIndexGauge from '@/components/dashboard/HeatIndexGauge';
import AlertFeed from '@/components/dashboard/AlertFeed';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import type { Alert, RiskLevel } from '@/types/database';

// Demo data
const demoWorkers = [
  { name: 'Raju Kumar', status: 'active', heatExposure: 'High', hydration: '2.5L', shift: '6h 20m' },
  { name: 'Suresh Yadav', status: 'active', heatExposure: 'Extreme', hydration: '1.8L', shift: '4h 15m' },
  { name: 'Mohan Singh', status: 'break', heatExposure: 'Moderate', hydration: '3.0L', shift: '5h 45m' },
  { name: 'Amit Patel', status: 'active', heatExposure: 'High', hydration: '2.1L', shift: '3h 30m' },
  { name: 'Vikram Sharma', status: 'sos', heatExposure: 'Danger', hydration: '1.2L', shift: '7h 10m' },
  { name: 'Deepak Verma', status: 'active', heatExposure: 'Moderate', hydration: '2.8L', shift: '2h 55m' },
];

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Active' },
  break: { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'On Break' },
  sos: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'SOS!' },
};

const demoAlerts: Alert[] = [
  {
    id: 'sup-a1', site_id: 's1', shift_id: null, worker_id: null,
    alert_type: 'sos', severity: 'emergency',
    message: '🚨 SOS from Vikram Sharma — Location: Kiln Section B, High heat exposure for 7+ hours.',
    status: 'active', action_taken: null, resolved_by: null,
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), resolved_at: null,
  },
  {
    id: 'sup-a2', site_id: 's1', shift_id: null, worker_id: null,
    alert_type: 'heat_warning', severity: 'critical',
    message: '🔴 Heat index at 52.8°C — DANGER zone. Consider halting operations.',
    status: 'active', action_taken: null, resolved_by: null,
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), resolved_at: null,
  },
  {
    id: 'sup-a3', site_id: 's1', shift_id: null, worker_id: null,
    alert_type: 'hydration', severity: 'warning',
    message: '💧 Suresh Yadav has not taken a water break in 45 minutes.',
    status: 'active', action_taken: null, resolved_by: null,
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(), resolved_at: null,
  },
];

export default function SupervisorDashboard() {
  useAuth();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAlerts(demoAlerts);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Spinner label="Loading site overview..." />;

  const activeWorkers = demoWorkers.filter((w) => w.status === 'active').length;
  const sosCount = demoWorkers.filter((w) => w.status === 'sos').length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-1">
          Site Overview 👔
        </h2>
        <p className="text-[var(--color-text-muted)]">
          Rajput Brick Works — Real-time worker safety monitoring
        </p>
      </div>

      {/* Stats */}
      <StatsGrid
        stats={[
          { label: 'Active Workers', value: activeWorkers, icon: Users, color: '#22c55e' },
          { label: 'Active Alerts', value: alerts.filter((a) => a.status === 'active').length, icon: AlertTriangle, color: '#f97316' },
          { label: 'SOS Events', value: sosCount, icon: Siren, color: '#ef4444' },
          { label: 'Heat Index', value: '52.8°C', icon: Thermometer, color: '#ef4444' },
        ]}
      />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Worker List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users size={18} className="text-orange-400" />
            Workers on Shift ({demoWorkers.length})
          </h3>

          <div className="space-y-3">
            {demoWorkers.map((worker, i) => {
              const style = statusStyles[worker.status] ?? statusStyles.active;
              return (
                <div
                  key={worker.name}
                  className={`glass rounded-xl p-4 card-hover flex items-center justify-between gap-4 animate-fade-up ${
                    worker.status === 'sos' ? 'border border-red-500/30' : ''
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${style.bg} ${style.text}`}
                    >
                      {worker.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{worker.name}</p>
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                        <Clock size={12} /> {worker.shift}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-[var(--color-text-muted)] hidden sm:block">
                      {worker.hydration}
                    </span>
                    <span className={`badge ${style.bg} ${style.text}`}>
                      {worker.status === 'sos' && <Siren size={10} />}
                      {style.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts + Gauge */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 flex items-center justify-center">
            <HeatIndexGauge heatIndex={52.8} riskLevel={'danger' as RiskLevel} size={160} />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-400" />
              Alerts
            </h3>
            <AlertFeed alerts={alerts} maxItems={5} />
          </div>
        </div>
      </div>
    </div>
  );
}
