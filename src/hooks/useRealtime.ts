import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type PostgresEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions<T> {
  /** Table name to subscribe to */
  table: string;
  /** Postgres change event to listen for */
  event?: PostgresEvent;
  /** Filter in the format "column=eq.value" */
  filter?: string;
  /** Schema (default: 'public') */
  schema?: string;
  /** Callback when a change is received */
  onData?: (payload: RealtimePostgresChangesPayload<T>) => void;
}

/**
 * Hook for Supabase Realtime subscriptions.
 * Automatically subscribes on mount and cleans up on unmount.
 */
export function useRealtime<T extends Record<string, unknown> = Record<string, unknown>>({
  table,
  event = '*',
  filter,
  schema = 'public',
  onData,
}: UseRealtimeOptions<T>) {
  const [latestPayload, setLatestPayload] =
    useState<RealtimePostgresChangesPayload<T> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const handlePayload = useCallback(
    (payload: RealtimePostgresChangesPayload<T>) => {
      setLatestPayload(payload);
      onData?.(payload);
    },
    [onData]
  );

  useEffect(() => {
    const channelName = `realtime:${schema}:${table}:${event}:${filter ?? 'all'}`;

    const channelConfig: Record<string, unknown> = {
      event,
      schema,
      table,
    };
    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as never,
        channelConfig,
        handlePayload as never
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, event, filter, schema, handlePayload]);

  return { latestPayload };
}
