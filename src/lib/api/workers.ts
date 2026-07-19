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

/** Create worker */
export async function createWorker(
  worker: Omit<Worker, 'id' | 'created_at'>
): Promise<Worker> {
  const id = crypto.randomUUID();
  const email = `${id}@heatshield.local`;

  // Insert into public.users table (no auth row)
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id,
      name: worker.name,
      email,
      phone: worker.phone,
      role: 'worker' as any,
      site_id: worker.site_id,
      health_flags: worker.medical_conditions || []
    });

  if (userError) throw userError;

  // Insert into public.workers table
  const { data, error } = await supabase
    .from('workers')
    .insert({
      id,
      ...worker
    })
    .select()
    .single();

  if (error) {
    // Rollback user creation on worker failure
    await supabase.from('users').delete().eq('id', id);
    throw error;
  }
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

  // Sync details to public.users table
  const userUpdates: any = {};
  if (updates.name !== undefined) userUpdates.name = updates.name;
  if (updates.phone !== undefined) userUpdates.phone = updates.phone;
  if (updates.site_id !== undefined) userUpdates.site_id = updates.site_id;
  if (updates.medical_conditions !== undefined) userUpdates.health_flags = updates.medical_conditions;

  if (Object.keys(userUpdates).length > 0) {
    const { error: userError } = await supabase
      .from('users')
      .update(userUpdates)
      .eq('id', workerId);
    if (userError) {
      console.error('Failed to sync worker update to users table:', userError);
    }
  }

  return data;
}

/** Delete worker */
export async function deleteWorker(workerId: string): Promise<void> {
  const { error } = await supabase
    .from('workers')
    .delete()
    .eq('id', workerId);

  if (error) throw error;

  // Cleanup matching user record
  const { error: userError } = await supabase
    .from('users')
    .delete()
    .eq('id', workerId);
  if (userError) {
    console.error('Failed to cleanup user record for worker:', userError);
  }
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

/** Bulk insert workers */
export async function bulkInsertWorkers(workers: Omit<Worker, 'id' | 'created_at'>[]): Promise<Worker[]> {
  const workerInserts = workers.map(w => {
    const id = crypto.randomUUID();
    return {
      id,
      worker: { id, ...w },
      user: {
        id,
        name: w.name,
        email: `${id}@heatshield.local`,
        phone: w.phone || null,
        role: 'worker' as any,
        site_id: w.site_id,
        health_flags: w.medical_conditions || []
      }
    };
  });

  const usersPayload = workerInserts.map(x => x.user);
  const workersPayload = workerInserts.map(x => x.worker);

  const { error: usersError } = await supabase
    .from('users')
    .insert(usersPayload);

  if (usersError) throw usersError;

  const { data, error: workersError } = await supabase
    .from('workers')
    .insert(workersPayload)
    .select();

  if (workersError) {
    const ids = workerInserts.map(x => x.id);
    await supabase.from('users').delete().in('id', ids);
    throw workersError;
  }

  return data ?? [];
}
