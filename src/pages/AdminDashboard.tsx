import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShieldAlert,
  AlertOctagon,
  MapPin,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { useAlerts } from '@/context/AlertContext';
import { getActiveSites } from '@/lib/api/sites';
import { getAllAlerts } from '@/lib/api/alerts';
import { getAllSitesLatestWeather } from '@/lib/api/weather';
import { supabase } from '@/lib/supabase';
import type { KilnSite, WeatherReading, AlertWithDetails } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Spinner from '@/components/ui/Spinner';

interface SiteStatusRow {
  site: KilnSite;
  weather: (WeatherReading & { site_name?: string }) | null;
  workersCount: number;
  supervisorName: string;
}

const RISK_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  low: { label: 'Low', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  moderate: { label: 'Moderate', bg: 'bg-yellow-500/12', text: 'text-amber-600' },
  high: { label: 'High', bg: 'bg-amber-500/14', text: 'text-amber-700' },
  extreme: { label: 'Extreme', bg: 'bg-red-500/10', text: 'text-red-500' },
  danger: { label: 'Danger', bg: 'bg-red-600', text: 'text-white' },
};

const SEVERITY_BADGE: Record<string, string> = {
  emergency: 'badge-danger',
  critical: 'badge-warning',
  warning: 'badge-warning',
  info: 'badge-info',
};

export default function AdminDashboard() {
  const { addToast } = useAlerts();
  const [siteStatuses, setSiteStatuses] = useState<SiteStatusRow[]>([]);
  const [alerts, setAlerts] = useState<AlertWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const sites = await getActiveSites();
      const activeAlerts = await getAllAlerts(50);
      setAlerts(activeAlerts);

      const weatherReadings = await getAllSitesLatestWeather();
      const weatherMap = new Map(weatherReadings.map(w => [w.site_id, w]));

      const statuses: SiteStatusRow[] = await Promise.all(
        sites.map(async (site) => {
          const { count } = await supabase
            .from('workers')
            .select('*', { count: 'exact', head: true })
            .eq('site_id', site.id)
            .eq('status', 'active');

          const { data: supervisor } = await supabase
            .from('supervisors')
            .select('user:users(name)')
            .eq('site_id', site.id)
            .limit(1)
            .maybeSingle();

          return {
            site,
            weather: weatherMap.get(site.id) || null,
            workersCount: count || 0,
            supervisorName: (supervisor?.user as { name?: string } | null)?.name || 'Unassigned',
          };
        })
      );

      setSiteStatuses(statuses);
      setError(null);
    } catch (err) {
      console.error(err);
      const msg = 'Failed to fetch global system analytics';
      setError(msg);
      addToast({ title: 'Error', message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
      loadAdminData();
      addToast({ title: 'Success', message: 'Alert marked resolved', type: 'success' });
    } catch (err) {
      console.error(err);
      addToast({ title: 'Error', message: 'Failed to resolve alert', type: 'error' });
    }
  };

  if (loading && siteStatuses.length === 0) {
    return <Spinner label="Loading system overview..." />;
  }

  if (error) {
    return (
      <Card className="p-10 text-center max-w-md mx-auto mt-16 border-red-500/20 bg-red-500/5" hoverable={false}>
        <AlertOctagon size={32} className="mx-auto mb-4 text-red-500" />
        <h3 className="font-serif text-xl mb-2">Connection Error</h3>
        <p className="text-sm text-[var(--color-text-muted)]">{error}</p>
      </Card>
    );
  }

  const totalWorkers = siteStatuses.reduce((acc, curr) => acc + curr.workersCount, 0);
  const activeAlertsList = alerts.filter(a => a.status === 'active');
  const activeAlertsCount = activeAlertsList.length;
  const activeSOSCount = activeAlertsList.filter(a => a.alert_type === 'sos').length;

  const metrics = [
    { label: 'Total workers', value: totalWorkers, icon: Users, color: 'text-[var(--text)]' },
    { label: 'Active mills', value: siteStatuses.length, icon: MapPin, color: 'text-[var(--text)]' },
    { label: 'Active warnings', value: activeAlertsCount, icon: AlertOctagon, color: activeAlertsCount > 0 ? 'text-amber-600 font-semibold' : 'text-[var(--text)]' },
    { label: 'SOS active', value: activeSOSCount, icon: ShieldAlert, color: activeSOSCount > 0 ? 'text-red-500 font-bold' : 'text-[var(--text)]' },
  ];

  return (
    <div className="space-y-10 animate-fade-up">
      {/* ── HEADER ── */}
      <div>
        <p className="section-label mb-2 text-left">Administration</p>
        <h2 className="font-serif text-3xl font-normal tracking-tight text-[var(--text)] text-left leading-tight">
          System Health Overview
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1 text-left">
          Live status across every mill on the platform
        </p>
      </div>

      {/* ── METRICS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-5 flex flex-col justify-between" hoverable={false}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)]">
                {label}
              </span>
              <Icon size={16} className={color} />
            </div>
            <p className={`font-serif text-4xl text-left font-normal tracking-tight ${color}`}>
              {value}
            </p>
          </Card>
        ))}
      </div>

      {/* ── MILL SITES ── */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="text-left">
            <h3 className="font-serif text-xl font-normal text-[var(--text)]">Mill sites</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Roster, hydration cadence, and live heat index per mill</p>
          </div>
          <Link to="/admin/sites" className="hero-cta-link text-xs">
            Manage sites <ArrowUpRight size={14} />
          </Link>
        </div>

        <Card className="overflow-hidden p-0" hoverable={false}>
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--color-bg-secondary)] hover:bg-transparent">
                <TableHead>Site</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Roster</TableHead>
                <TableHead>Hydration</TableHead>
                <TableHead>Heat index</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {siteStatuses.map(({ site, weather, workersCount, supervisorName }) => {
                const risk = RISK_BADGES[weather?.risk_level ?? 'low'] ?? RISK_BADGES.low;
                return (
                  <TableRow key={site.id}>
                    <TableCell>
                      <p className="font-semibold text-left text-[var(--text)]">{site.name}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] text-left">{site.region || '—'}</p>
                    </TableCell>
                    <TableCell className={supervisorName === 'Unassigned' ? 'text-[var(--text-light)]' : 'text-[var(--color-text-secondary)]'}>
                      {supervisorName}
                    </TableCell>
                    <TableCell className="text-[var(--color-text-secondary)]">
                      {workersCount} {workersCount === 1 ? 'worker' : 'workers'}
                    </TableCell>
                    <TableCell className="text-[var(--color-text-secondary)]">
                      {site.hydration_interval_min || 30} min
                    </TableCell>
                    <TableCell>
                      {weather ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="font-semibold text-[var(--text)]">
                            {Math.round(weather.heat_index)}°C
                          </span>
                          <span className={`badge ${risk.bg} ${risk.text}`}>{risk.label}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--text-light)]">No data</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to={`/kiosk/${site.id}`}
                        target="_blank"
                        className="btn-secondary py-1.5 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                      >
                        Kiosk <ArrowUpRight size={12} />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
              {siteStatuses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="p-12 text-center text-[var(--color-text-muted)]">
                    No active mills yet. <Link to="/admin/sites" className="underline text-[var(--accent-teal)]">Add your first site</Link>.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* ── ALERT STREAM ── */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="text-left">
            <h3 className="font-serif text-xl font-normal text-[var(--text)]">Alert stream</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Recent alerts across all mills</p>
          </div>
          <Link to="/admin/alerts" className="hero-cta-link text-xs">
            All alerts <ArrowUpRight size={14} />
          </Link>
        </div>

        {alerts.length > 0 ? (
          <Card className="overflow-hidden p-0" hoverable={false}>
            <div className="divide-y divide-[var(--color-border)]">
              {alerts.slice(0, 8).map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-[var(--color-bg-secondary)]/30 transition-colors"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${SEVERITY_BADGE[alert.severity] ?? 'badge-neutral'}`}>{alert.severity}</span>
                      <span className="text-[10px] text-[var(--color-text-light)]">
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">{alert.message}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{alert.site?.name ?? 'Platform'}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {alert.status === 'active' ? (
                      <Button
                        onClick={() => handleResolveAlert(alert.id)}
                        variant="secondary"
                        className="py-1.5 px-3 rounded-lg text-xs font-semibold"
                      >
                        Resolve
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                        <CheckCircle2 size={13} /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-10 text-center" hoverable={false}>
            <CheckCircle2 size={24} className="mx-auto mb-3 text-[var(--color-text-light)]" />
            <p className="text-sm text-[var(--color-text-muted)] font-medium">The alert stream is clear.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
