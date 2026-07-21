import { supabase } from '@/lib/supabase';
import type { Worker } from '@/types/database';

export type WorkerWithSiteName = Worker & { site: { id: string; name: string } | null };

/** Get all workers across all sites, with their site name (admin) */
export async function getAllWorkers(): Promise<WorkerWithSiteName[]> {
  const { data, error } = await supabase
    .from('workers')
    .select('*, site:kiln_sites(id, name)')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as WorkerWithSiteName[];
}

/** Get all active workers at a site */
export async function getSiteWorkers(siteId: string): Promise<Worker[]> {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('site_id', siteId)
    .eq('status', 'active')
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Get worker by ID */
export async function getWorkerById(workerId: string): Promise<Worker | null> {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('id', workerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/** Create worker.
 *  Workers are field laborers with NO login account — they live only in
 *  public.workers, never in public.users (which is reserved for auth-backed
 *  admin/supervisor accounts created via Supabase Auth signup). */
export async function createWorker(
  worker: Omit<Worker, 'id' | 'created_at'>
): Promise<Worker> {
  const { data, error } = await supabase
    .from('workers')
    .insert(worker)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update worker details */
export async function updateWorker(
  workerId: string,
  updates: Partial<Omit<Worker, 'id' | 'created_at'>>
): Promise<Worker> {
  const { data, error } = await supabase
    .from('workers')
    .update(updates)
    .eq('id', workerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Delete worker */
export async function deleteWorker(workerId: string): Promise<void> {
  const { error } = await supabase
    .from('workers')
    .delete()
    .eq('id', workerId);

  if (error) throw error;
}

/** Get active worker count for a site */
export async function getSiteWorkerCount(siteId: string): Promise<number> {
  const { count, error } = await supabase
    .from('workers')
    .select('*', { count: 'exact', head: true })
    .eq('site_id', siteId)
    .eq('status', 'active');

  if (error) throw error;
  return count ?? 0;
}

/** Bulk insert workers (roster CSV import).
 *  Like createWorker, these go only into public.workers — no login accounts. */
export async function bulkInsertWorkers(workers: Omit<Worker, 'id' | 'created_at'>[]): Promise<Worker[]> {
  const { data, error } = await supabase
    .from('workers')
    .insert(workers)
    .select();

  if (error) throw error;
  return data ?? [];
}
