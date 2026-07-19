import { supabase } from '@/lib/supabase';
import type { Shift, ShiftWithWorker } from '@/types/database';

/** Get active shift for a worker */
export async function getActiveShift(workerId: string): Promise<Shift | null> {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('worker_id', workerId)
    .eq('status', 'active')
    .order('start_time', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/** Get shift history for a worker */
export async function getWorkerShifts(workerId: string, limit = 20): Promise<Shift[]> {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('worker_id', workerId)
    .order('start_time', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/** Get all active shifts at a site (for supervisors) */
export async function getSiteActiveShifts(siteId: string): Promise<ShiftWithWorker[]> {
  const { data, error } = await supabase
    .from('shifts')
    .select('*, worker:workers(*)')
    .eq('site_id', siteId)
    .eq('status', 'active')
    .order('start_time', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as ShiftWithWorker[];
}

/** Start a new shift */
export async function startShift(workerId: string, siteId: string): Promise<Shift> {
  const { data, error } = await supabase
    .from('shifts')
    .insert({
      worker_id: workerId,
      site_id: siteId,
      start_time: new Date().toISOString(),
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** End a shift */
export async function endShift(shiftId: string): Promise<Shift> {
  const { data, error } = await supabase
    .from('shifts')
    .update({
      end_time: new Date().toISOString(),
      status: 'completed',
    })
    .eq('id', shiftId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Log a water break on a shift */
export async function logWaterBreak(shiftId: string, currentBreaks: number): Promise<void> {
  const { error } = await supabase
    .from('shifts')
    .update({ water_breaks_taken: currentBreaks + 1 })
    .eq('id', shiftId);

  if (error) throw error;
}
