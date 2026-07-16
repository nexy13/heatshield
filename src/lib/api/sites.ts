import { supabase } from '@/lib/supabase';
import type { KilnSite } from '@/types/database';

/** Get all kiln sites */
export async function getAllSites(): Promise<KilnSite[]> {
  const { data, error } = await supabase
    .from('kiln_sites')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Get active kiln sites */
export async function getActiveSites(): Promise<KilnSite[]> {
  const { data, error } = await supabase
    .from('kiln_sites')
    .select('*')
    .eq('status', 'active')
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Get a single site by ID */
export async function getSiteById(siteId: string): Promise<KilnSite | null> {
  const { data, error } = await supabase
    .from('kiln_sites')
    .select('*')
    .eq('id', siteId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/** Create a new kiln site */
export async function createSite(
  site: Omit<KilnSite, 'id' | 'created_at'>
): Promise<KilnSite> {
  const { data, error } = await supabase
    .from('kiln_sites')
    .insert(site)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update a kiln site */
export async function updateSite(
  siteId: string,
  updates: Partial<Omit<KilnSite, 'id' | 'created_at'>>
): Promise<KilnSite> {
  const { data, error } = await supabase
    .from('kiln_sites')
    .update(updates)
    .eq('id', siteId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
