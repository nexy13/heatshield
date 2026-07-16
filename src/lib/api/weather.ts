import { supabase } from '@/lib/supabase';
import type { WeatherReading } from '@/types/database';

/** Get latest weather reading for a site */
export async function getLatestWeather(siteId: string): Promise<WeatherReading | null> {
  const { data, error } = await supabase
    .from('weather_readings')
    .select('*')
    .eq('site_id', siteId)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/** Get weather history for a site (last N hours) */
export async function getWeatherHistory(
  siteId: string,
  hoursBack = 24
): Promise<WeatherReading[]> {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('weather_readings')
    .select('*')
    .eq('site_id', siteId)
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Get latest weather for all active sites (admin overview) */
export async function getAllSitesLatestWeather(): Promise<
  (WeatherReading & { site_name?: string })[]
> {
  // Use a subquery approach: get latest per site
  const { data: sites, error: sitesError } = await supabase
    .from('kiln_sites')
    .select('id, name')
    .eq('status', 'active');

  if (sitesError) throw sitesError;
  if (!sites || sites.length === 0) return [];

  const readings: (WeatherReading & { site_name?: string })[] = [];

  for (const site of sites) {
    const reading = await getLatestWeather(site.id);
    if (reading) {
      readings.push({ ...reading, site_name: site.name });
    }
  }

  return readings;
}
