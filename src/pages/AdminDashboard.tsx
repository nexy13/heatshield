import { useEffect, useState } from 'react';
import {
  MapPin,
  Users,
  AlertTriangle,
  Siren,
} from 'lucide-react';
import StatsGrid from '@/components/dashboard/StatsGrid';
import AlertFeed from '@/components/dashboard/AlertFeed';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import type { Alert } from '@/types/database';

// Demo site data
const demoSites = [
  { name: 'Rajput Brick Works', region: 'Uttar Pradesh', workers: 24, heatIndex: 52.8, grade: 'C', status: 'danger' },
  { name: 'Sharma Kilns Pvt Ltd', region: 'Haryana', workers: 18, heatIndex: 41.2, grade: 'B', status: 'extreme' },
  { name: 'Bihar Brick Industries', region: 'Bihar', workers: 32, heatIndex: 43.5, grade: 'B', status: 'extreme' },
];

const gradeColors: Record<string, string> = {
  A: 'text-emerald-400 bg-emerald-500/15',
  B: 'text-blue-400 bg-blue-500/15',
  C: 'text-amber-400 bg-amber-500/15',
  D: 'text-orange-400 bg-orange-500/15',
  F: 'text-red-400 bg-red-500/15',
};

const riskColors: Record<string, string> = {
  low: 'text-emerald-400',
  moderate: 'text-yellow-400',
  high: 'text-orange-400',
  extreme: 'text-red-400',
  danger: 'text-red-500 font-bold',
};

const demoAlerts: Alert[] = [
  {
    id: 'admin-a1', site_id: 's1', shift_id: null, worker_id: null,
    alert_type: 'sos', severity: 'emergency',
    message: '🚨 SOS at Rajput Brick Works — Worker Vikram Sharma requires immediate assistance.',
    status: 'active', action_taken: null, resolved_by: null,
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(), resolved_at: null,
  },
  {
    id: 'admin-a2', site_id: 's2', shift_id: null, worker_id: null,
    alert_type: 'compliance', severity: 'warning',
    message: '⚠️ Sharma Kilns — Only 60% of workers took mandatory water breaks today.',
    status: 'active', action_taken: null, resolved_by: null,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), resolved_at: null,
  },
  {
    id: 'admin-a3', site_id: 's1', shift_id: null, worker_id: null,
    alert_type: 'heat_warning', severity: 'critical',
    message: '🔴 Rajput Brick Works heat index at DANGER level (52.8°C) — Operations should be halted.',
    status: 'active', action_taken: null, resolved_by: null,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), resolved_at: null,
  },
];

export default function AdminDashboard() {
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

  if (loading) return <Spinner label="Loading system overview..." />;

  const totalWorkers = demoSites.reduce((s, site) => s + site.workers, 0);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-1">
          System Overview 🛡️
        </h2>
        <p className="text-[var(--color-text-muted)]">
          Monitor all kiln sites, workers, and safety compliance across the platform.
        </p>
      </div>

      {/* System Stats */}
      <StatsGrid
        stats={[
          { label: 'Active Sites', value: demoSites.length, icon: MapPin, color: '#f97316' },
          { label: 'Total Workers', value: totalWorkers, icon: Users, color: '#3b82f6' },
          { label: 'Active Alerts', value: alerts.filter((a) => a.status === 'active').length, icon: AlertTriangle, color: '#eab308' },
          { label: 'SOS Today', value: 1, icon: Siren, color: '#ef4444' },
        ]}
      />

      {/* Sites + Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Site Cards */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin size={18} className="text-orange-400" />
            Kiln Sites ({demoSites.length})
          </h3>

          <div className="space-y-4">
            {demoSites.map((site, i) => (
              <div
                key={site.name}
                className="glass rounded-2xl p-5 card-hover animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-lg">{site.name}</h4>
                    <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {site.region}
                    </p>
                  </div>
                  <span className={`badge ${gradeColors[site.grade]}`}>
                    Grade {site.grade}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Workers</p>
                    <p className="text-lg font-bold flex items-center gap-1">
                      <Users size={14} className="text-blue-400" /> {site.workers}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Heat Index</p>
                    <p className={`text-lg font-bold ${riskColors[site.status]}`}>
                      {site.heatIndex}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Risk Level</p>
                    <span
                      className={`badge ${
                        site.status === 'danger'
                          ? 'badge-danger'
                          : site.status === 'extreme'
                            ? 'badge-warning'
                            : 'badge-success'
                      }`}
                    >
                      {site.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Progress bar for compliance */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
                    <span>Compliance Score</span>
                    <span>{site.grade === 'A' ? '95%' : site.grade === 'B' ? '78%' : '62%'}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-bar-fill ${
                        site.grade === 'A'
                          ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                          : site.grade === 'B'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                            : 'bg-gradient-to-r from-amber-500 to-orange-400'
                      }`}
                      style={{
                        width: site.grade === 'A' ? '95%' : site.grade === 'B' ? '78%' : '62%',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-400" />
            System Alerts
          </h3>
          <AlertFeed alerts={alerts} maxItems={10} />
        </div>
      </div>
    </div>
  );
}
