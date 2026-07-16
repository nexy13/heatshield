import { TrendingUp, Thermometer, Droplets, ShieldAlert } from 'lucide-react';
import StatsGrid from '@/components/dashboard/StatsGrid';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold mb-1">Safety Analytics</h2>
        <p className="text-[var(--color-text-muted)] text-sm">System-wide trends and heat exposure metrics</p>
      </div>

      <StatsGrid
        stats={[
          { label: 'Avg Compliance Score', value: '88%', icon: TrendingUp, color: '#22c55e', trend: '+4%', trendDirection: 'up' },
          { label: 'Total SOS Events', value: 3, icon: ShieldAlert, color: '#ef4444', trend: '-2', trendDirection: 'up' },
          { label: 'Avg Hydration / Shift', value: '2.4L', icon: Droplets, color: '#3b82f6', trend: '+0.2L', trendDirection: 'up' },
          { label: 'Peak Heat Index', value: '54.2°C', icon: Thermometer, color: '#6366F1' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 h-80 flex flex-col">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <Thermometer size={18} className="text-indigo-400" /> Heat Exposure Trends (Weekly)
          </h3>
          <div className="flex-1 border-b border-l border-[var(--color-border)] relative flex items-end justify-between px-4 pb-4 pt-10 mt-auto">
            {/* Mock Chart bars */}
            {[45, 48, 52, 54, 50, 47, 44].map((val, i) => (
              <div key={i} className="relative group w-8 sm:w-12">
                <div 
                  className="w-full rounded-t-sm transition-all duration-500 hover:opacity-80"
                  style={{ 
                    height: `${(val / 60) * 100}%`,
                    background: val > 50 ? 'linear-gradient(to top, #ef4444, #6366F1)' : 'linear-gradient(to top, #6366F1, #818CF8)'
                  }}
                />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[var(--color-text-muted)]">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded text-xs">
                  {val}°C
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 h-80 flex flex-col">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <Droplets size={18} className="text-blue-400" /> Hydration Compliance
          </h3>
          <div className="flex-1 border-b border-l border-[var(--color-border)] relative flex items-end justify-between px-4 pb-4 pt-10 mt-auto">
            {/* Mock Chart bars */}
            {[75, 82, 60, 55, 78, 85, 90].map((val, i) => (
              <div key={i} className="relative group w-8 sm:w-12">
                <div 
                  className="w-full rounded-t-sm transition-all duration-500 hover:opacity-80"
                  style={{ 
                    height: `${val}%`,
                    background: val < 70 ? 'linear-gradient(to top, #ef4444, #f87171)' : 'linear-gradient(to top, #3b82f6, #60a5fa)'
                  }}
                />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[var(--color-text-muted)]">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded text-xs">
                  {val}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
