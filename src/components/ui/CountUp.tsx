import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  /** Target value. Non-numeric strings are rendered as-is (no animation). */
  value: string | number;
  duration?: number;
  className?: string;
}

/** Animated counter — counts from 0 to the target value on mount / change. */
export default function CountUp({ value, duration = 900, className = '' }: CountUpProps) {
  const numericMatch = typeof value === 'number'
    ? { num: value, prefix: '', suffix: '', decimals: Number.isInteger(value) ? 0 : 1 }
    : parseNumeric(String(value));

  const [display, setDisplay] = useState(numericMatch ? 0 : value);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!numericMatch) {
      setDisplay(value);
      return;
    }
    const { num, decimals } = numericMatch;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Number((num * eased).toFixed(decimals)));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [String(value), duration]);

  if (!numericMatch) return <span className={className}>{value}</span>;

  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {numericMatch.prefix}
      {typeof display === 'number' ? display.toLocaleString() : display}
      {numericMatch.suffix}
    </span>
  );
}

function parseNumeric(raw: string): { num: number; prefix: string; suffix: string; decimals: number } | null {
  const match = raw.match(/^([^\d-]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const num = parseFloat(match[2]);
  if (isNaN(num)) return null;
  const decimals = match[2].includes('.') ? match[2].split('.')[1].length : 0;
  return { num, prefix: match[1], suffix: match[3], decimals };
}
