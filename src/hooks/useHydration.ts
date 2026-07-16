import { useState, useEffect, useCallback, useRef } from 'react';
import { HYDRATION_REMINDER_INTERVAL_MIN } from '@/lib/utils/constants';

interface UseHydrationReturn {
  /** Seconds remaining until next reminder */
  secondsRemaining: number;
  /** Whether the timer is running */
  isRunning: boolean;
  /** Total breaks taken this session */
  breaksTaken: number;
  /** Start the hydration timer */
  start: () => void;
  /** Pause the timer */
  pause: () => void;
  /** Reset and record a water break */
  logBreak: () => void;
}

/**
 * Hydration reminder countdown timer.
 * Counts down from HYDRATION_REMINDER_INTERVAL_MIN and triggers a reminder.
 */
export function useHydration(): UseHydrationReturn {
  const intervalMinutes = HYDRATION_REMINDER_INTERVAL_MIN;
  const totalSeconds = intervalMinutes * 60;

  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [breaksTaken, setBreaksTaken] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const logBreak = useCallback(() => {
    setBreaksTaken((prev) => prev + 1);
    setSecondsRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Timer expired — trigger reminder
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, clearTimer]);

  return {
    secondsRemaining,
    isRunning,
    breaksTaken,
    start,
    pause,
    logBreak,
  };
}
