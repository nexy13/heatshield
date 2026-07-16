import { supabase } from '@/lib/supabase';
import type { ComplianceReport } from '@/types/database';

/** Get compliance reports for a site */
export async function getSiteReports(
  siteId: string,
  limit = 30
): Promise<ComplianceReport[]> {
  const { data, error } = await supabase
    .from('compliance_reports')
    .select('*')
    .eq('site_id', siteId)
    .order('report_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/** Get latest compliance report for a site */
export async function getLatestReport(siteId: string): Promise<ComplianceReport | null> {
  const { data, error } = await supabase
    .from('compliance_reports')
    .select('*')
    .eq('site_id', siteId)
    .order('report_date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/** Get all latest reports (admin overview) */
export async function getAllLatestReports(): Promise<
  (ComplianceReport & { site_name?: string })[]
> {
  const { data: sites, error: sitesError } = await supabase
    .from('kiln_sites')
    .select('id, name')
    .eq('status', 'active');

  if (sitesError) throw sitesError;
  if (!sites || sites.length === 0) return [];

  const reports: (ComplianceReport & { site_name?: string })[] = [];

  for (const site of sites) {
    const report = await getLatestReport(site.id);
    if (report) {
      reports.push({ ...report, site_name: site.name });
    }
  }

  return reports;
}

/** Get aggregate stats across all sites */
export async function getSystemStats(): Promise<{
  totalSites: number;
  totalWorkers: number;
  activeAlerts: number;
  sosToday: number;
}> {
  const [
    { count: totalSites },
    { count: totalWorkers },
    { count: activeAlerts },
    { count: sosToday },
  ] = await Promise.all([
    supabase.from('kiln_sites').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('workers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase
      .from('sos_events')
      .select('*', { count: 'exact', head: true })
      .gte('triggered_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);

  return {
    totalSites: totalSites ?? 0,
    totalWorkers: totalWorkers ?? 0,
    activeAlerts: activeAlerts ?? 0,
    sosToday: sosToday ?? 0,
  };
}
