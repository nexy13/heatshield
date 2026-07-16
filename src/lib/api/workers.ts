import { supabase } from '@/lib/supabase';
import type { Worker, WorkerWithUser } from '@/types/database';

/** Get worker profile by user ID */
export async function getWorkerByUserId(userId: string): Promise<Worker | null> {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

/** Get all workers at a site (for supervisors) */
export async function getSiteWorkers(siteId: string): Promise<WorkerWithUser[]> {
  const { data, error } = await supabase
    .from('workers')
    .select('*, user:users(*)')
    .eq('site_id', siteId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as WorkerWithUser[];
}

/** Update worker profile */
export async function updateWorkerProfile(
  workerId: string,
  updates: Partial<Pick<Worker, 'emergency_contact_name' | 'emergency_contact_phone' | 'blood_group' | 'medical_conditions'>>
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

/** Get total active worker count for a site */
export async function getSiteWorkerCount(siteId: string): Promise<number> {
  const { count, error } = await supabase
    .from('workers')
    .select('*', { count: 'exact', head: true })
    .eq('site_id', siteId)
    .eq('status', 'active');

  if (error) throw error;
  return count ?? 0;
}
