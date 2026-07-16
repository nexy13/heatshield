import { supabase } from '@/lib/supabase';
import type { Alert, AlertWithDetails } from '@/types/database';

/** Get alerts for a site */
export async function getSiteAlerts(
  siteId: string,
  status?: string,
  limit = 50
): Promise<AlertWithDetails[]> {
  let query = supabase
    .from('alerts')
    .select('*, site:kiln_sites(*), worker:workers(*, user:users(*))')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as AlertWithDetails[];
}

/** Get recent alerts across all sites (admin) */
export async function getAllAlerts(limit = 100): Promise<AlertWithDetails[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*, site:kiln_sites(*), worker:workers(*, user:users(*))')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as AlertWithDetails[];
}

/** Acknowledge an alert */
export async function acknowledgeAlert(alertId: string): Promise<Alert> {
  const { data, error } = await supabase
    .from('alerts')
    .update({ status: 'acknowledged' })
    .eq('id', alertId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Resolve an alert */
export async function resolveAlert(
  alertId: string,
  resolvedBy: string,
  actionTaken?: string
): Promise<Alert> {
  const { data, error } = await supabase
    .from('alerts')
    .update({
      status: 'resolved',
      resolved_by: resolvedBy,
      action_taken: actionTaken ?? null,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', alertId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Get active alert count for a site */
export async function getActiveAlertCount(siteId: string): Promise<number> {
  const { count, error } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('site_id', siteId)
    .eq('status', 'active');

  if (error) throw error;
  return count ?? 0;
}
