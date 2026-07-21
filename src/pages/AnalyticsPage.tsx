import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Thermometer, Droplets, ShieldAlert, Timer, MessageSquare, Siren, CheckCircle2, AlertTriangle, ClipboardList } from 'lucide-react';
import StatsGrid from '@/components/dashboard/StatsGrid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import { getAllLatestReports } from '@/lib/api/reports';
import { getRecentIncidents, type IncidentView } from '@/lib/api/sosTimeline';
import { useRealtime } from '@/hooks/useRealtime';
import type { ComplianceReport } from '@/types/database';

function fmtSecs(s: number | null): string {
  if (s == null) return '—';
  if (s < 90) return `${Math.round(s)}s`;
  return `${(s / 60).toFixed(1)} min`;
}

function isToday(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).toDateString() === new Date().toDateString();
}

function mean(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Emergency-response KPIs derived live from SOS incidents + their timelines. */
function EmergencyKPIs() {
  const [incidents, setIncidents] = useState<IncidentView[]>([]);

  const load = useCallback(async () => {
    try {
      setIncidents(await getRecentIncidents(50));
    } catch (err) {
      console.error('Failed to load emergency analytics:', err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useRealtime({ table: 'sos_events', onData: load });
  useRealtime({ table: 'sos_response_events', onData: load });

  const responseTimes = incidents
    .map((i) => i.responseSeconds)
    .filter((v): v is number => v != null);
  const smsTimes = incidents
    .map((i) => {
      const sms = i.events.find((e) => e.event === 'SMS_SENT' && e.status === 'completed');
      const t = sms?.details?.delivery_time_sec;
      return typeof t === 'number' ? t : null;
    })
    .filter((v): v is number => v != null);

  const avgResponse = mean(responseTimes);
  const avgSms = mean(smsTimes);
  const sosToday = incidents.filter((i) => isToday(i.triggeredAt)).length;
  const resolvedToday = incidents.filter((i) => i.status === 'resolved' && isToday(i.resolvedAt)).length;
  const pending = incidents.filter((i) => i.status !== 'resolved').length;

  return (
    <div className="space-y-4">
      <div className="text-left">
        <h3 className="font-serif text-lg font-bold text-[var(--text)] flex items-center gap-2">
          <span className="icon-chip" style={{ width: 30, height: 30, background: 'var(--emergency-bg)', color: 'var(--emergency)' }}>
            <Siren size={15} />
          </span>
          Emergency response
        </h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Live SOS workflow performance across every site</p>
      </div>
      <StatsGrid
        stats={[
          { label: 'Avg Response Time', value: fmtSecs(avgResponse), icon: Timer, color: '#2563EB' },
          { label: 'Avg SMS Delivery', value: fmtSecs(avgSms), icon: MessageSquare, color: '#16A34A' },
          { label: 'SOS Today', value: sosToday, icon: Siren, color: '#DC2626' },
          { label: 'Resolved Today', value: resolvedToday, icon: CheckCircle2, color: '#16A34A' },
          { label: 'Pending Emergencies', value: pending, icon: AlertTriangle, color: pending > 0 ? '#EA580C' : '#64748B' },
        ]}
      />
    </div>
  );
}

const WEEKDAY_LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Date#getDay(): 0=Sun..6=Sat
const GRADE_SCORE: Record<string, number> = { A: 95, B: 85, C: 75, D: 65, F: 50 };

interface DayBucket {
  /** Local calendar-date key, matched against row timestamps via toDateString(). */
  key: string;
  label: string;
}

/** The last 7 local calendar days, oldest first, ending today. */
function last7DayBuckets(): DayBucket[] {
  const buckets: DayBucket[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    buckets.push({ key: d.toDateString(), label: WEEKDAY_LETTER[d.getDay()] });
  }
  return buckets;
}

function sevenDaysAgoIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function heatColor(val: number): string {
  if (val > 52) return 'var(--emergency)';
  if (val > 48) return 'var(--high)';
  return 'var(--info)';
}

interface WeatherPoint { heat_index: number; recorded_at: string; }
interface ShiftPoint { id: string; worker_id: string; water_breaks_taken: number; start_time: string; }
interface HydrationPoint { shift_id: string | null; water_ml: number; logged_at: string; }

/** System-wide compliance/heat/hydration metrics, computed live from real tables. */
function SystemMetrics() {
  const [reports, setReports] = useState<(ComplianceReport & { site_name?: string })[]>([]);
  const [sosTotal, setSosTotal] = useState(0);
  const [sosDaily, setSosDaily] = useState<number[]>([]);
  const [weather, setWeather] = useState<WeatherPoint[]>([]);
  const [shifts, setShifts] = useState<ShiftPoint[]>([]);
  const [hydrationLogs, setHydrationLogs] = useState<HydrationPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const buckets = last7DayBuckets();

  const load = useCallback(async () => {
    try {
      const since = sevenDaysAgoIso();
      const [reportsRes, sosCountRes, sosRecentRes, weatherRes, shiftsRes, hydrationRes] = await Promise.all([
        getAllLatestReports(),
        supabase.from('sos_events').select('id', { count: 'exact', head: true }),
        supabase.from('sos_events').select('triggered_at').gte('triggered_at', since),
        supabase.from('weather_readings').select('heat_index, recorded_at').gte('recorded_at', since),
        supabase.from('shifts').select('id, worker_id, water_breaks_taken, start_time').gte('start_time', since),
        supabase.from('hydration_logs').select('shift_id, water_ml, logged_at').gte('logged_at', since),
      ]);

      setReports(reportsRes);
      setSosTotal(sosCountRes.count ?? 0);

      const dailyBuckets = last7DayBuckets();
      setSosDaily(
        dailyBuckets.map(
          (b) => (sosRecentRes.data ?? []).filter((r) => new Date(r.triggered_at).toDateString() === b.key).length
        )
      );
      setWeather((weatherRes.data ?? []) as WeatherPoint[]);
      setShifts((shiftsRes.data ?? []) as ShiftPoint[]);
      setHydrationLogs((hydrationRes.data ?? []) as HydrationPoint[]);
    } catch (err) {
      console.error('Failed to load system analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useRealtime({ table: 'weather_readings', onData: load });
  useRealtime({ table: 'compliance_reports', onData: load });
  useRealtime({ table: 'sos_events', onData: load });

  // ── Heat exposure: real daily average from weather_readings ──
  const weatherByDay = buckets.map((b) => {
    const vals = weather.filter((w) => new Date(w.recorded_at).toDateString() === b.key).map((w) => w.heat_index);
    return vals.length ? mean(vals) : null;
  });
  const peakHeatIndex = weather.length ? Math.max(...weather.map((w) => w.heat_index)) : null;
  const heatSpark = weatherByDay.filter((v): v is number => v != null);
  const heatScaleMax = Math.max(75, Math.ceil(((peakHeatIndex ?? 0) + 10) / 5) * 5);

  // ── Hydration compliance: real daily rate from shifts (water_breaks_taken) ──
  const hydrationByDay = buckets.map((b) => {
    const dayShifts = shifts.filter((s) => new Date(s.start_time).toDateString() === b.key);
    if (dayShifts.length === 0) return null;
    const totalWorkers = new Set(dayShifts.map((s) => s.worker_id)).size;
    const withBreaks = new Set(dayShifts.filter((s) => s.water_breaks_taken > 0).map((s) => s.worker_id)).size;
    return totalWorkers ? Math.round((withBreaks / totalWorkers) * 100) : null;
  });
  const hasShiftData = shifts.length > 0;

  // ── Avg hydration volume per shift (ml logged against that shift → L) ──
  const litersByShift = new Map<string, number>();
  for (const log of hydrationLogs) {
    if (!log.shift_id) continue;
    litersByShift.set(log.shift_id, (litersByShift.get(log.shift_id) ?? 0) + log.water_ml);
  }
  const avgHydrationLiters = shifts.length
    ? mean(shifts.map((s) => (litersByShift.get(s.id) ?? 0) / 1000))
    : null;

  // ── Compliance score: latest grade per site, mapped to a numeric score ──
  const avgComplianceScore = reports.length
    ? Math.round(mean(reports.map((r) => GRADE_SCORE[r.compliance_grade ?? ''] ?? 70)) ?? 0)
    : null;

  if (loading) {
    return <Spinner label="Loading system analytics..." />;
  }

  return (
    <>
      <StatsGrid
        stats={[
          {
            label: 'Avg Compliance Score',
            value: avgComplianceScore != null ? `${avgComplianceScore}%` : 'No data',
            icon: TrendingUp,
            color: '#16A34A',
          },
          {
            label: 'Total SOS Events',
            value: sosTotal,
            icon: ShieldAlert,
            color: '#DC2626',
            spark: sosDaily.length > 1 ? sosDaily : undefined,
          },
          {
            label: 'Avg Hydration / Shift',
            value: avgHydrationLiters != null ? `${avgHydrationLiters.toFixed(1)}L` : 'No data',
            icon: Droplets,
            color: '#2563EB',
          },
          {
            label: 'Peak Heat Index (7d)',
            value: peakHeatIndex != null ? `${Math.round(peakHeatIndex)}°C` : 'No data',
            icon: Thermometer,
            color: '#EA580C',
            spark: heatSpark.length > 1 ? heatSpark : undefined,
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── Heat exposure chart ── */}
        <Card className="h-80 flex flex-col p-6" hoverable={false}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif font-bold text-[var(--text)] flex items-center gap-2.5 text-left">
              <span className="icon-chip" style={{ width: 32, height: 32, background: 'var(--high-bg)', color: 'var(--high)' }}>
                <Thermometer size={16} />
              </span>
              Heat Exposure Trends
            </h3>
            <Badge variant="neutral">Weekly</Badge>
          </div>
          <div className="flex-1 relative flex items-end justify-between px-2 pb-6 pt-8 gap-2">
            {/* Threshold line at 52° */}
            <div
              className="absolute left-0 right-0 border-t border-dashed pointer-events-none"
              style={{ bottom: `${6 + (52 / heatScaleMax) * 70}%`, borderColor: 'rgba(220, 38, 38, 0.35)' }}
            >
              <span className="absolute -top-2.5 right-0 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--emergency)' }}>
                Danger 52°
              </span>
            </div>
            {buckets.map((b, i) => {
              const val = weatherByDay[i];
              return (
                <div key={b.key} className="relative group flex-1 h-full flex flex-col justify-end items-center">
                  {val != null ? (
                    <div
                      className="w-full max-w-10 rounded-t-md transition-all duration-300 group-hover:opacity-85 animate-fade-up"
                      style={{
                        height: `${(val / heatScaleMax) * 100}%`,
                        background: `linear-gradient(to top, color-mix(in srgb, ${heatColor(val)} 65%, transparent), ${heatColor(val)})`,
                        animationDelay: `${i * 0.06}s`,
                      }}
                    />
                  ) : (
                    <div
                      className="w-full max-w-10 h-[3px] rounded-full"
                      style={{ background: 'var(--border)' }}
                      title="No readings recorded"
                    />
                  )}
                  <span className="absolute -bottom-6 text-[11px] text-[var(--text-muted)] font-semibold">
                    {b.label}
                  </span>
                  {val != null && (
                    <div
                      className="absolute -top-1 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-lg text-[11px] font-bold text-white pointer-events-none z-10"
                      style={{ background: 'var(--navy-900)', boxShadow: 'var(--shadow-md)' }}
                    >
                      {val.toFixed(1)}°C
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Hydration compliance chart ── */}
        <Card className="h-80 flex flex-col p-6" hoverable={false}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif font-bold text-[var(--text)] flex items-center gap-2.5 text-left">
              <span className="icon-chip" style={{ width: 32, height: 32, background: 'var(--info-bg)', color: 'var(--info)' }}>
                <Droplets size={16} />
              </span>
              Hydration Compliance
            </h3>
            <Badge variant="neutral">Weekly</Badge>
          </div>
          {hasShiftData ? (
            <div className="flex-1 relative flex items-end justify-between px-2 pb-6 pt-8 gap-2">
              {buckets.map((b, i) => {
                const val = hydrationByDay[i];
                return (
                  <div key={b.key} className="relative group flex-1 h-full flex flex-col justify-end items-center">
                    {val != null ? (
                      <div
                        className="w-full max-w-10 rounded-t-md transition-all duration-300 group-hover:opacity-85 animate-fade-up"
                        style={{
                          height: `${val}%`,
                          background: val < 70
                            ? 'linear-gradient(to top, rgba(220, 38, 38, 0.6), var(--emergency))'
                            : 'linear-gradient(to top, rgba(37, 99, 235, 0.55), var(--info))',
                          animationDelay: `${i * 0.06}s`,
                        }}
                      />
                    ) : (
                      <div
                        className="w-full max-w-10 h-[3px] rounded-full"
                        style={{ background: 'var(--border)' }}
                        title="No shifts logged"
                      />
                    )}
                    <span className="absolute -bottom-6 text-[11px] text-[var(--text-muted)] font-semibold">
                      {b.label}
                    </span>
                    {val != null && (
                      <div
                        className="absolute -top-1 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-lg text-[11px] font-bold text-white pointer-events-none z-10"
                        style={{ background: 'var(--navy-900)', boxShadow: 'var(--shadow-md)' }}
                      >
                        {val}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <span className="icon-chip" style={{ width: 40, height: 40, background: 'var(--info-bg)', color: 'var(--info)' }}>
                <ClipboardList size={18} />
              </span>
              <p className="text-sm font-semibold text-[var(--text)]">No hydration data logged yet</p>
              <p className="text-xs text-[var(--text-muted)] max-w-xs">
                This chart populates automatically once workers start logging shifts with water breaks.
              </p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-left">
        <p className="eyebrow mb-1.5">Insights</p>
        <h2 className="page-title">Safety Analytics</h2>
        <p className="page-subtitle">System-wide trends and heat exposure metrics</p>
      </div>

      <EmergencyKPIs />
      <SystemMetrics />
    </div>
  );
}
