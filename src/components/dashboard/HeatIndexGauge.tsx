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
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Map heat index to 0-100% (0°C to 60°C range)
  const percentage = useMemo(() => {
    const clamped = Math.min(Math.max(heatIndex, 0), 60);
    return (clamped / 60) * 100;
  }, [heatIndex]);

  const dashOffset = circumference - (percentage / 100) * circumference * 0.75; // 270° arc

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-[135deg]"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(148, 163, 184, 0.1)"
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
            stroke={threshold.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="gauge-ring"
            style={{
              filter: `drop-shadow(0 0 8px ${threshold.color}40)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold"
            style={{ color: threshold.color }}
          >
            {Math.round(heatIndex)}°
          </span>
          <span className="text-xs text-[var(--color-text-muted)] mt-1">Heat Index</span>
        </div>
      </div>

      {/* Risk label */}
      <div
        className="px-4 py-1.5 rounded-full text-sm font-semibold"
        style={{
          background: threshold.bgColor,
          color: threshold.color,
        }}
      >
        {label}
      </div>

      {/* Action text */}
      <p className="text-xs text-center text-[var(--color-text-muted)] max-w-[200px]">
        {threshold.action}
      </p>
    </div>
  );
}
