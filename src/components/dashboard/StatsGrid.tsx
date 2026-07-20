import type { ElementType } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import CountUp from '@/components/ui/CountUp';
import Sparkline from '@/components/ui/Sparkline';

interface StatsGridProps {
  stats: {
    label: string;
    value: string | number;
    icon: ElementType;
    trend?: string;
    trendDirection?: 'up' | 'down' | 'neutral';
    color?: string;
    /** Optional mini trend chart data */
    spark?: number[];
  }[];
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trendDirection === 'down' ? TrendingDown : TrendingUp;
        const trendColor =
          stat.trendDirection === 'down' ? 'var(--emergency)' : 'var(--safe)';
        const accent = stat.color ?? '#2563EB';

        return (
          <div
            key={stat.label}
            className="kpi-card animate-fade-up"
            style={{ animationDelay: `${i * 0.08}s`, ['--kpi-accent' as string]: accent }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="icon-chip"
                style={{
                  background: `color-mix(in srgb, ${accent} 12%, transparent)`,
                  color: accent,
                }}
              >
                <Icon size={18} strokeWidth={2.25} />
              </div>
              {stat.trend && (
                <span
                  className="text-xs font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{
                    color: trendColor,
                    background: `color-mix(in srgb, ${trendColor} 10%, transparent)`,
                  }}
                >
                  <TrendIcon size={12} /> {stat.trend}
                </span>
              )}
            </div>

            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p
                  className="font-serif text-[1.75rem] font-bold leading-none mb-1.5"
                  style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}
                >
                  <CountUp value={stat.value} />
                </p>
                <p className="text-[0.8125rem] font-medium text-[var(--text-muted)] truncate">
                  {stat.label}
                </p>
              </div>
              {stat.spark && stat.spark.length > 1 && (
                <div className="shrink-0 mb-0.5">
                  <Sparkline data={stat.spark} color={accent} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
