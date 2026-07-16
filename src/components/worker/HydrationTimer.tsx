import { Droplets, Play, Pause, RotateCcw } from 'lucide-react';
import { useHydration } from '@/hooks/useHydration';

interface HydrationTimerProps {
  onLogBreak?: () => void;
}

export default function HydrationTimer({ onLogBreak }: HydrationTimerProps) {
  const { secondsRemaining, isRunning, breaksTaken, start, pause, logBreak } =
    useHydration();

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isExpired = secondsRemaining === 0 && isRunning;

  // Progress percentage (inverted: 100% when full, 0% when expired)
  const totalSeconds = 30 * 60; // 30 minutes
  const progress = (secondsRemaining / totalSeconds) * 100;

  const handleLogBreak = () => {
    logBreak();
    onLogBreak?.();
  };

  return (
    <div className="glass rounded-2xl p-6 card-hover">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
          <Droplets size={20} className="text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold">Hydration Timer</h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            {breaksTaken} water breaks taken
          </p>
        </div>
      </div>

      {/* Timer display */}
      <div className="text-center mb-4">
        <p
          className={`text-5xl font-bold font-mono tracking-wider ${
            isExpired ? 'text-red-400 animate-pulse' : 'text-blue-400'
          }`}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          {isExpired
            ? '⚠️ Time to drink water!'
            : isRunning
              ? 'until next water break'
              : 'Timer paused'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-4">
        <div
          className={`progress-bar-fill ${
            isExpired
              ? 'bg-red-500'
              : progress > 50
                ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                : progress > 20
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                  : 'bg-gradient-to-r from-red-500 to-orange-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isRunning ? (
          <button
            onClick={start}
            className="flex-1 btn-primary py-2.5 rounded-xl flex items-center justify-center gap-2"
          >
            <Play size={16} />
            {secondsRemaining < totalSeconds ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex-1 btn-secondary py-2.5 rounded-xl flex items-center justify-center gap-2"
          >
            <Pause size={16} />
            Pause
          </button>
        )}
        <button
          onClick={handleLogBreak}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm ${
            isExpired
              ? 'btn-primary bg-gradient-to-r from-blue-600 to-cyan-600 shadow-blue-500/30'
              : 'btn-secondary'
          }`}
        >
          <RotateCcw size={16} />
          Log Water Break
        </button>
      </div>
    </div>
  );
}
