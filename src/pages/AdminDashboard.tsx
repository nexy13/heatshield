import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShieldAlert,
  AlertOctagon,
  MapPin,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Droplets,
  UserRound,
} from 'lucide-react';
import { useAlerts } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import { getActiveSites } from '@/lib/api/sites';
import { getAllAlerts } from '@/lib/api/alerts';
import { getAllSitesLatestWeather } from '@/lib/api/weather';
import { supabase } from '@/lib/supabase';
import type { KilnSite, WeatherReading, AlertWithDetails } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Spinner from '@/components/ui/Spinner';
import StatsGrid from '@/components/dashboard/StatsGrid';

interface SiteStatusRow {
  site: KilnSite;
  weather: (WeatherReading & { site_name?: string }) | null;
  workersCount: number;
  supervisorName: string;
}

const RISK_BADGES: Record<string, { label: string; className: string }> = {
  low: { label: 'Safe', className: 'badge-success' },
  moderate: { label: 'Caution', className: 'badge-warning' },
  high: { label: 'High Risk', className: 'badge-orange' },
  extreme: { label: 'Extreme', className: 'badge-danger' },
  danger: { label: 'Danger', className: 'badge-danger badge-live' },
};

const SEVERITY_BADGE: Record<string, string> = {
  emergency: 'badge-danger badge-live',
  critical: 'badge-orange',
  warning: 'badge-warning',
  info: 'badge-info',
};

export default function AdminDashboard() {
  const { addToast } = useAlerts();
  const { profile } = useAuth();
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
      <Card className="p-10 text-center max-w-md mx-auto mt-16" hoverable={false} style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'var(--emergency-bg)' }}>
        <AlertOctagon size={32} className="mx-auto mb-4" style={{ color: 'var(--emergency)' }} />
        <h3 className="font-serif text-xl font-bold mb-2">Connection Error</h3>
        <p className="text-sm text-[var(--text-muted)]">{error}</p>
      </Card>
    );
  }

  const totalWorkers = siteStatuses.reduce((acc, curr) => acc + curr.workersCount, 0);
  const activeAlertsList = alerts.filter(a => a.status === 'active');
  const activeAlertsCount = activeAlertsList.length;
  const activeSOSCount = activeAlertsList.filter(a => a.alert_type === 'sos').length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const adminName = profile?.name || 'System Admin';

  return (
    <div className="space-y-8 animate-fade-up">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="text-left">
          <p className="eyebrow mb-1.5 flex items-center gap-2">
            <span className="pulse-dot" style={{ background: 'var(--safe)' }} />
            Live · Administration
          </p>
          <h2 className="page-title">{greeting}, {adminName}</h2>
          <p className="page-subtitle">Today's Operations Overview — real-time status across every kiln site</p>
        </div>
        <p className="text-xs font-semibold text-[var(--text-muted)] tracking-wide shrink-0">
          {new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── METRICS ── */}
      <StatsGrid
        stats={[
          {
            label: 'Total workers',
            value: totalWorkers,
            icon: Users,
            color: '#2563EB',
            spark: [totalWorkers * 0.7, totalWorkers * 0.75, totalWorkers * 0.85, totalWorkers * 0.8, totalWorkers * 0.92, totalWorkers || 1],
          },
          {
            label: 'Active sites',
            value: siteStatuses.length,
            icon: MapPin,
            color: '#16A34A',
            spark: [1, 2, 2, siteStatuses.length * 0.7 || 1, siteStatuses.length * 0.9 || 1, siteStatuses.length || 1],
          },
          {
            label: 'Active warnings',
            value: activeAlertsCount,
            icon: AlertOctagon,
            color: activeAlertsCount > 0 ? '#EA580C' : '#64748B',
          },
          {
            label: 'SOS active',
            value: activeSOSCount,
            icon: ShieldAlert,
            color: activeSOSCount > 0 ? '#DC2626' : '#64748B',
          },
        ]}
      />

      {/* ── KILN SITES ── */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="text-left">
            <h3 className="font-serif text-lg font-bold text-[var(--text)]">Kiln sites</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Roster, hydration cadence, and live heat index per site</p>
          </div>
          <Link to="/admin/sites" className="hero-cta-link text-xs font-semibold">
            Manage sites <ArrowUpRight size={14} />
          </Link>
        </div>

        <Card className="overflow-hidden p-0" hoverable={false}>
          <Table>
            <TableHeader>
              <TableRow>
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
                      <div className="flex items-center gap-3">
                        <div
                          className="icon-chip"
                          style={{ width: 34, height: 34, background: 'var(--accent-light)', color: 'var(--info)' }}
                        >
                          <MapPin size={15} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-[var(--text)] leading-tight">{site.name}</p>
                          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{site.region || '—'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <UserRound size={13} className={supervisorName === 'Unassigned' ? 'text-[var(--text-light)]' : 'text-[var(--text-muted)]'} />
                        <span className={supervisorName === 'Unassigned' ? 'text-[var(--text-light)] italic' : ''}>{supervisorName}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-[var(--text-secondary)] font-medium">
                      {workersCount} {workersCount === 1 ? 'worker' : 'workers'}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <Droplets size={13} style={{ color: 'var(--info)' }} />
                        {site.hydration_interval_min || 30} min
                      </span>
                    </TableCell>
                    <TableCell>
                      {weather ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="font-mono font-bold text-[var(--text)]">
                            {Math.round(weather.heat_index)}°C
                          </span>
                          <span className={`badge ${risk.className}`}>{risk.label}</span>
                        </span>
                      ) : (
                        <span className="badge badge-neutral">No data</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to={`/kiosk/${site.id}`}
                        target="_blank"
                        className="btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1"
                      >
                        Kiosk <ArrowUpRight size={12} />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
              {siteStatuses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="p-12 text-center text-[var(--text-muted)]">
                    No active sites yet. <Link to="/admin/sites" className="underline font-semibold" style={{ color: 'var(--info)' }}>Add your first site</Link>.
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
            <h3 className="font-serif text-lg font-bold text-[var(--text)]">Alert stream</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Recent alerts across all sites</p>
          </div>
          <Link to="/admin/alerts" className="hero-cta-link text-xs font-semibold">
            All alerts <ArrowUpRight size={14} />
          </Link>
        </div>

        {alerts.length > 0 ? (
          <Card className="overflow-hidden p-0" hoverable={false}>
            <div className="divide-y divide-[var(--border)]">
              {alerts.slice(0, 8).map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-[var(--accent-light)]"
                >
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`badge ${SEVERITY_BADGE[alert.severity] ?? 'badge-neutral'}`}>{alert.severity}</span>
                      <span className="text-[11px] text-[var(--text-light)] font-medium">
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-secondary)] leading-snug">{alert.message}</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
                      <MapPin size={10} /> {alert.site?.name ?? 'Platform'}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {alert.status === 'active' ? (
                      <Button
                        onClick={() => handleResolveAlert(alert.id)}
                        variant="secondary"
                        className="py-1.5 px-3 text-xs"
                      >
                        Resolve
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--safe)' }}>
                        <CheckCircle2 size={13} /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="empty-state">
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
        )}
      </div>
    </div>
  );
}
