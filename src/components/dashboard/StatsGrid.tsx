import type { ElementType } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsGridProps {
  stats: {
    label: string;
    value: string | number;
    icon: ElementType;
    trend?: string;
    trendDirection?: 'up' | 'down' | 'neutral';
    color?: string;
  }[];
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        const TrendIcon =
          stat.trendDirection === 'down' ? TrendingDown : TrendingUp;
        const trendColor =
          stat.trendDirection === 'down' ? 'text-red-400' : 'text-emerald-400';

        return (
          <div
            key={stat.label}
            className={`glass rounded-xl p-5 card-hover stat-card animate-fade-up`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: stat.color
                    ? `${stat.color}20`
                    : 'rgba(99, 102, 241, 0.12)',
                }}
              >
                <Icon
                  size={20}
                  style={{ color: stat.color ?? '#6366F1' }}
                />
              </div>
              {stat.trend && (
                <span
                  className={`text-xs font-medium flex items-center gap-1 ${trendColor}`}
                >
                  <TrendIcon size={12} /> {stat.trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold mb-0.5">{stat.value}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
