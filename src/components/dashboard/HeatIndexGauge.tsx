import { useMemo } from 'react';
import { getThresholdForHeatIndex, getRiskLabel } from '@/lib/utils/heatIndex';
import type { RiskLevel } from '@/types/database';

interface HeatIndexGaugeProps {
  heatIndex: number;
  riskLevel: RiskLevel;
  size?: number;
}

export default function HeatIndexGauge({
  heatIndex,
  riskLevel,
  size = 200,
}: HeatIndexGaugeProps) {
  const threshold = getThresholdForHeatIndex(heatIndex);
  const label = getRiskLabel(riskLevel);

  // SVG gauge calculations
  const strokeWidth = 13;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Map heat index to 0-100% (0°C to 60°C range)
  const percentage = useMemo(() => {
    const clamped = Math.min(Math.max(heatIndex, 0), 60);
    return (clamped / 60) * 100;
  }, [heatIndex]);

  const dashOffset = circumference - (percentage / 100) * circumference * 0.75; // 270° arc
  const gradientId = `gauge-grad-${riskLevel}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-[135deg]"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={threshold.color} stopOpacity="0.55" />
              <stop offset="100%" stopColor={threshold.color} />
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--bg-muted)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />
          {/* Value arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="gauge-ring"
            style={{
              filter: `drop-shadow(0 0 10px ${threshold.color}50)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-serif text-[2.625rem] font-bold leading-none"
            style={{ color: threshold.color, letterSpacing: '-0.03em' }}
          >
            {Math.round(heatIndex)}°
          </span>
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] mt-1.5">
            Heat Index
          </span>
        </div>
      </div>

      {/* Risk label */}
      <div
        className="px-4 py-1.5 rounded-full text-sm font-bold tracking-wide"
        style={{
          background: threshold.bgColor,
          color: threshold.color,
          border: `1px solid color-mix(in srgb, ${threshold.color} 25%, transparent)`,
        }}
      >
        {label}
      </div>

      {/* Action text */}
      <p className="text-xs text-center text-[var(--text-muted)] max-w-[210px] leading-relaxed">
        {threshold.action}
      </p>
    </div>
  );
}
