import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { site_id, report_date } = await req.json();
    const dateStr = report_date || new Date().toISOString().split('T')[0];

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch site
    const { data: site } = await supabaseClient
      .from("kiln_sites")
      .select("*")
      .eq("id", site_id)
      .single();

    if (!site) throw new Error("Site not found");

    // Gather metrics for the day
    const nextDay = new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Total workers on shift today
    const { data: shifts } = await supabaseClient
      .from("shifts")
      .select("worker_id, water_breaks_taken")
      .eq("site_id", site_id)
      .gte("start_time", dateStr)
      .lt("start_time", nextDay);

    const totalWorkers = new Set(shifts?.map((s) => s.worker_id)).size;
    const workersWithBreaks = new Set(shifts?.filter((s) => (s.water_breaks_taken || 0) > 0).map((s) => s.worker_id)).size;

    // 2. SOS Events
    const { count: sosCount } = await supabaseClient
      .from("sos_events")
      .select("*", { count: 'exact', head: true })
      .eq("site_id", site_id)
      .gte("triggered_at", dateStr)
      .lt("triggered_at", nextDay);

    // 3. Alerts
    const { count: alertCount } = await supabaseClient
      .from("alerts")
      .select("*", { count: 'exact', head: true })
      .eq("site_id", site_id)
      .gte("created_at", dateStr)
      .lt("created_at", nextDay);

    // 4. Avg Heat Index
    const { data: weather } = await supabaseClient
      .from("weather_readings")
      .select("heat_index")
      .eq("site_id", site_id)
      .gte("recorded_at", dateStr)
      .lt("recorded_at", nextDay);

    const avgHeatIndex = weather && weather.length > 0 
      ? weather.reduce((sum, w) => sum + (w.heat_index || 0), 0) / weather.length
      : 0;

    // Calculate Grade
    let grade = "C";
    const hydrationRate = totalWorkers > 0 ? workersWithBreaks / totalWorkers : 1;
    
    if (hydrationRate >= 0.9 && (sosCount || 0) === 0 && (alertCount || 0) < 3) grade = "A";
    else if (hydrationRate >= 0.7 && (sosCount || 0) <= 1) grade = "B";
    else if (hydrationRate < 0.4 || (sosCount || 0) > 3) grade = "F";
    else if (hydrationRate < 0.6) grade = "D";

    // Insert Report
    const { data: report, error: reportError } = await supabaseClient
      .from("compliance_reports")
      .insert({
        site_id,
        report_date: dateStr,
        total_workers: totalWorkers,
        workers_with_water_breaks: workersWithBreaks,
        sos_events_count: sosCount || 0,
        alerts_triggered: alertCount || 0,
        avg_heat_index: Number(avgHeatIndex.toFixed(1)),
        compliance_grade: grade,
      })
      .select()
      .single();

    if (reportError) throw reportError;

    return new Response(JSON.stringify({ success: true, report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
