import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Thermometer,
  Droplets,
  Siren,
  Wind,
  CloudSun,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import HeatIndexGauge from '@/components/dashboard/HeatIndexGauge';
import StatsGrid from '@/components/dashboard/StatsGrid';
import HydrationTimer from '@/components/worker/HydrationTimer';
import AlertFeed from '@/components/dashboard/AlertFeed';
import Spinner from '@/components/ui/Spinner';
import type { WeatherReading, Alert } from '@/types/database';
import type { RiskLevel } from '@/types/database';
import { formatTemp, formatHumidity } from '@/lib/utils/formatters';

// Demo data for when Supabase is not connected
const demoWeather: WeatherReading = {
  id: 'demo-1',
  site_id: 'demo-site',
  temperature_c: 44.0,
  humidity_pct: 52.0,
  heat_index: 52.8,
  wind_speed_kmh: 7.0,
  condition: 'Haze',
  risk_level: 'danger',
  raw_api_response: null,
  recorded_at: new Date().toISOString(),
};

const demoAlerts: Alert[] = [
  {
    id: 'demo-a1',
    site_id: 'demo-site',
    shift_id: null,
    worker_id: null,
    alert_type: 'heat_warning',
    severity: 'critical',
    message: '🔴 Heat index has reached EXTREME levels (52.8°C). Mandatory 30-min rest cycles required.',
    status: 'active',
    action_taken: null,
    resolved_by: null,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'demo-a2',
    site_id: 'demo-site',
    shift_id: null,
    worker_id: null,
    alert_type: 'hydration',
    severity: 'warning',
    message: '💧 Hydration reminder: Drink at least 250ml of water now. Stay in shade for 10 minutes.',
    status: 'active',
    action_taken: null,
    resolved_by: null,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'demo-a3',
    site_id: 'demo-site',
    shift_id: null,
    worker_id: null,
    alert_type: 'system',
    severity: 'info',
    message: '📡 Weather station sync complete. Next reading in 15 minutes.',
    status: 'active',
    action_taken: null,
    resolved_by: null,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
];

export default function WorkerDashboard() {
  const { profile } = useAuth();
  const [weather, setWeather] = useState<WeatherReading | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use demo data since Supabase may not be configured
    const timer = setTimeout(() => {
      setWeather(demoWeather);
      setAlerts(demoAlerts);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;

  const w = weather ?? demoWeather;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-1">
          Hello, {profile?.name ?? 'Worker'} 👷
        </h2>
        <p className="text-[var(--color-text-muted)]">
          Stay safe, stay hydrated. Here's your safety overview.
        </p>
      </div>

      {/* Quick Action: SOS */}
      <Link
        to="/worker/sos"
        className="block glass rounded-2xl p-5 border border-red-500/20 hover:border-red-500/40 transition-colors card-hover"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center">
              <Siren size={24} className="text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-red-400">Emergency SOS</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Tap to send an emergency alert with your location
              </p>
            </div>
          </div>
          <ArrowRight size={20} className="text-red-400" />
        </div>
      </Link>

      {/* Heat Index + Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge */}
        <div className="glass rounded-2xl p-6 flex items-center justify-center">
          <HeatIndexGauge
            heatIndex={w.heat_index}
            riskLevel={(w.risk_level ?? 'moderate') as RiskLevel}
            size={180}
          />
        </div>

        {/* Weather details */}
        <div className="lg:col-span-2">
          <StatsGrid
            stats={[
              {
                label: 'Temperature',
                value: formatTemp(w.temperature_c),
                icon: Thermometer,
                color: '#ef4444',
              },
              {
                label: 'Humidity',
                value: formatHumidity(w.humidity_pct),
                icon: Droplets,
                color: '#3b82f6',
              },
              {
                label: 'Wind Speed',
                value: `${w.wind_speed_kmh ?? 0} km/h`,
                icon: Wind,
                color: '#06b6d4',
              },
              {
                label: 'Condition',
                value: w.condition ?? 'Unknown',
                icon: CloudSun,
                color: '#f59e0b',
              },
            ]}
          />
        </div>
      </div>

      {/* Hydration Timer + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HydrationTimer />

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Siren size={18} className="text-indigo-400" />
            Recent Alerts
          </h3>
          <AlertFeed alerts={alerts} maxItems={5} />
        </div>
      </div>
    </div>
  );
}
