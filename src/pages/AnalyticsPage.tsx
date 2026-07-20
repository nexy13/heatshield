import { TrendingUp, Thermometer, Droplets, ShieldAlert } from 'lucide-react';
import StatsGrid from '@/components/dashboard/StatsGrid';
import { Card } from '@/components/ui/Card';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const HEAT_DATA = [61, 64, 66, 68, 67, 65, 63];
const HYDRATION_DATA = [90, 88, 91, 93, 89, 92, 94];
/** Chart y-axis ceiling (°C) — keeps heatwave peaks inside the plot */
const HEAT_SCALE_MAX = 75;

function heatColor(val: number): string {
  if (val > 52) return 'var(--emergency)';
  if (val > 48) return 'var(--high)';
  return 'var(--info)';
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-left">
        <p className="eyebrow mb-1.5">Insights</p>
        <h2 className="page-title">Safety Analytics</h2>
        <p className="page-subtitle">System-wide trends and heat exposure metrics</p>
      </div>

      <StatsGrid
        stats={[
          { label: 'Avg Compliance Score', value: '91%', icon: TrendingUp, color: '#16A34A', trend: '+3%', trendDirection: 'up', spark: [88, 90, 88, 91, 93, 91] },
          { label: 'Total SOS Events', value: 3, icon: ShieldAlert, color: '#DC2626', trend: '-2', trendDirection: 'up', spark: [8, 6, 7, 5, 4, 3] },
          { label: 'Avg Hydration / Shift', value: '2.8L', icon: Droplets, color: '#2563EB', trend: '+0.2L', trendDirection: 'up', spark: [2.4, 2.6, 3.0, 2.6, 2.7, 2.8] },
          { label: 'Peak Heat Index', value: '68°C', icon: Thermometer, color: '#EA580C', spark: [61, 64, 66, 68, 67, 65] },
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
            <span className="badge badge-neutral">Weekly</span>
          </div>
          <div className="flex-1 relative flex items-end justify-between px-2 pb-6 pt-8 gap-2">
            {/* Threshold line at 52° */}
            <div
              className="absolute left-0 right-0 border-t border-dashed pointer-events-none"
              style={{ bottom: `${6 + (52 / HEAT_SCALE_MAX) * 70}%`, borderColor: 'rgba(220, 38, 38, 0.35)' }}
            >
              <span className="absolute -top-2.5 right-0 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--emergency)' }}>
                Danger 52°
              </span>
            </div>
            {HEAT_DATA.map((val, i) => (
              <div key={i} className="relative group flex-1 h-full flex flex-col justify-end items-center">
                <div
                  className="w-full max-w-10 rounded-t-md transition-all duration-300 group-hover:opacity-85 animate-fade-up"
                  style={{
                    height: `${(val / HEAT_SCALE_MAX) * 100}%`,
                    background: `linear-gradient(to top, color-mix(in srgb, ${heatColor(val)} 65%, transparent), ${heatColor(val)})`,
                    animationDelay: `${i * 0.06}s`,
                  }}
                />
                <span className="absolute -bottom-6 text-[11px] text-[var(--text-muted)] font-semibold">
                  {DAYS[i]}
                </span>
                <div
                  className="absolute -top-1 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-lg text-[11px] font-bold text-white pointer-events-none z-10"
                  style={{ background: 'var(--navy-900)', boxShadow: 'var(--shadow-md)' }}
                >
                  {val}°C
                </div>
              </div>
            ))}
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
            <span className="badge badge-neutral">Weekly</span>
          </div>
          <div className="flex-1 relative flex items-end justify-between px-2 pb-6 pt-8 gap-2">
            {HYDRATION_DATA.map((val, i) => (
              <div key={i} className="relative group flex-1 h-full flex flex-col justify-end items-center">
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
                <span className="absolute -bottom-6 text-[11px] text-[var(--text-muted)] font-semibold">
                  {DAYS[i]}
                </span>
                <div
                  className="absolute -top-1 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-lg text-[11px] font-bold text-white pointer-events-none z-10"
                  style={{ background: 'var(--navy-900)', boxShadow: 'var(--shadow-md)' }}
                >
                  {val}%
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
