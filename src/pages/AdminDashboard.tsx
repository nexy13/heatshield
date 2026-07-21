import { useState, useEffect, useCallback } from 'react';
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
  Siren,
  CalendarDays,
} from 'lucide-react';
import { useAlerts } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import { getActiveSites } from '@/lib/api/sites';
import { getAllAlerts } from '@/lib/api/alerts';
import { getAllSitesLatestWeather } from '@/lib/api/weather';
import { getRecentIncidents, type IncidentView } from '@/lib/api/sosTimeline';
import { useRealtime } from '@/hooks/useRealtime';
import { supabase } from '@/lib/supabase';
import type { KilnSite, WeatherReading, AlertWithDetails } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Spinner from '@/components/ui/Spinner';
import StatsGrid from '@/components/dashboard/StatsGrid';
import IncidentCard from '@/components/dashboard/IncidentCard';

interface SiteStatusRow {
  site: KilnSite;
  weather: (WeatherReading & { site_name?: string }) | null;
  workersCount: number;
  supervisorName: string;
}

const RISK_BADGES: Record<string, { label: string; variant: BadgeVariant; live?: boolean }> = {
  low: { label: 'Safe', variant: 'success' },
  moderate: { label: 'Caution', variant: 'warning' },
  high: { label: 'High Risk', variant: 'orange' },
  extreme: { label: 'Extreme', variant: 'danger' },
  danger: { label: 'Danger', variant: 'danger', live: true },
};

const SEVERITY_BADGE: Record<string, { variant: BadgeVariant; live?: boolean }> = {
  emergency: { variant: 'danger', live: true },
  critical: { variant: 'orange' },
  warning: { variant: 'warning' },
  info: { variant: 'info' },
};

/** Consistent section header used across the dashboard. */
function SectionHeader({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  to,
  linkLabel,
}: {
  icon: typeof MapPin;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  to: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="text-left flex items-center gap-3">
        <span className="icon-chip" style={{ width: 34, height: 34, background: iconBg, color: iconColor }}>
          <Icon size={16} />
        </span>
        <div>
          <h3 className="font-serif font-bold text-[var(--text)]" style={{ fontSize: 'var(--text-lg)' }}>{title}</h3>
          <p className="text-[var(--text-muted)] mt-0.5" style={{ fontSize: 'var(--text-xs)' }}>{subtitle}</p>
        </div>
      </div>
      <Link to={to} className="hero-cta-link text-xs font-semibold shrink-0">
        {linkLabel} <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}

export default function AdminDashboard() {
  const { addToast } = useAlerts();
  const { profile } = useAuth();
  const [siteStatuses, setSiteStatuses] = useState<SiteStatusRow[]>([]);
  const [alerts, setAlerts] = useState<AlertWithDetails[]>([]);
  const [incidents, setIncidents] = useState<IncidentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const actorName = profile?.name || 'System Admin';

  const reloadIncidents = useCallback(async () => {
    try {
      setIncidents(await getRecentIncidents(12));
    } catch (err) {
      console.error('Failed to load emergency incidents:', err);
    }
  }, []);

  // Live-refresh the emergency timeline as SOS events and response steps change.
  useRealtime({ table: 'sos_events', onData: reloadIncidents });
  useRealtime({ table: 'sos_response_events', onData: reloadIncidents });

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const sites = await getActiveSites();
      const activeAlerts = await getAllAlerts(50);
      setAlerts(activeAlerts);

      const weatherReadings = await getAllSitesLatestWeather();
      const weatherMap = new Map(weatherReadings.map(w => [w.site_id, w]));

      await reloadIncidents();

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
  const activeSOSCount = incidents.filter(i => i.status !== 'resolved').length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const adminName = profile?.name || 'System Admin';

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── HERO HEADER (control-room) ── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 lg:p-7"
        style={{ background: 'linear-gradient(135deg, var(--navy-900), var(--navy-850))', boxShadow: 'var(--shadow-lg)' }}
      >
        <div aria-hidden="true" className="absolute rounded-full" style={{ width: 360, height: 360, top: '-40%', right: '-8%', background: 'radial-gradient(circle, rgba(37,99,235,0.28), transparent 68%)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="text-left">
            <p className="mb-2 flex items-center gap-2 font-semibold uppercase" style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.14em', color: '#93C5FD' }}>
              <span className="pulse-dot" style={{ background: 'var(--safe)', width: 7, height: 7 }} />
              Live · Administration
            </p>
            <h2 className="font-serif font-bold text-white leading-tight" style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', letterSpacing: '-0.02em' }}>
              {greeting}, {adminName}
            </h2>
            <p className="mt-1.5" style={{ fontSize: 'var(--text-sm)', color: 'rgba(226,232,240,0.72)' }}>
              Today's operations overview — real-time status across every kiln site.
            </p>
          </div>
          <span
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 shrink-0"
            style={{ background: 'rgba(148,163,184,0.12)', border: '1px solid rgba(148,163,184,0.18)', color: '#E2E8F0', fontSize: 'var(--text-xs)', fontWeight: 600 }}
          >
            <CalendarDays size={14} style={{ color: '#93C5FD' }} />
            {new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
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

      {/* ── EMERGENCY RESPONSE TIMELINE (promoted) ── */}
      <div className="space-y-4">
        <SectionHeader
          icon={Siren}
          iconBg="var(--emergency-bg)"
          iconColor="var(--emergency)"
          title="Emergency response"
          subtitle="Live SOS incidents with full response timeline — trigger to rescue"
          to="/admin/alerts"
          linkLabel="All incidents"
        />

        {incidents.length > 0 ? (
          <div className="space-y-3">
            {incidents.map((incident, i) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                actorName={actorName}
                onAction={reloadIncidents}
                defaultExpanded={i === 0 && incident.status !== 'resolved'}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center" hoverable={false}>
            <ShieldCheck size={28} className="mx-auto mb-3" style={{ color: 'var(--safe)' }} />
            <p className="font-serif text-lg font-bold text-[var(--text)]">No SOS incidents</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">All workers are operating safely across every site.</p>
          </Card>
        )}
      </div>

      {/* ── KILN SITES ── */}
      <div className="space-y-4">
        <SectionHeader
          icon={MapPin}
          iconBg="var(--brand-tint)"
          iconColor="var(--brand)"
          title="Kiln sites"
          subtitle="Roster, hydration cadence, and live heat index per site"
          to="/admin/sites"
          linkLabel="Manage sites"
        />

        <Card className="overflow-hidden p-0" hoverable={false}>
          <div className="overflow-x-auto">
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
                            style={{ width: 34, height: 34, background: 'var(--brand-tint)', color: 'var(--brand)' }}
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
                            <Badge variant={risk.variant} live={risk.live}>{risk.label}</Badge>
                          </span>
                        ) : (
                          <Badge variant="neutral">No data</Badge>
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
          </div>
        </Card>
      </div>

      {/* ── ALERT STREAM ── */}
      <div className="space-y-4">
        <SectionHeader
          icon={AlertOctagon}
          iconBg="var(--high-bg)"
          iconColor="var(--high)"
          title="Alert stream"
          subtitle="Recent alerts across all sites"
          to="/admin/alerts"
          linkLabel="All alerts"
        />

        {alerts.length > 0 ? (
          <Card className="overflow-hidden p-0" hoverable={false}>
            <div className="divide-y divide-[var(--border)]">
              {alerts.slice(0, 8).map((alert) => {
                const sev = SEVERITY_BADGE[alert.severity] ?? { variant: 'neutral' as BadgeVariant };
                return (
                  <div
                    key={alert.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-[var(--accent-light)]"
                  >
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge variant={sev.variant} live={sev.live}>{alert.severity}</Badge>
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
                );
              })}
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
            <Badge variant="success" className="mt-5" dot>Systems Nominal</Badge>
          </div>
        )}
      </div>
    </div>
  );
}
