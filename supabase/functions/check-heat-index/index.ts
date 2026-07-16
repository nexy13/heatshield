import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch active kiln sites
    const { data: sites, error: sitesError } = await supabaseClient
      .from("kiln_sites")
      .select("id, name, location_lat, location_lng")
      .eq("status", "active");

    if (sitesError) throw sitesError;

    const results = [];

    // For each site, calculate heat index (demo values for now, would connect to weather API like OpenWeather)
    for (const site of sites) {
      if (!site.location_lat || !site.location_lng) continue;

      // Mock weather data based on current conditions in typical kiln regions (summer)
      const baseTemp = 40 + Math.random() * 5; // 40-45C
      const humidity = 40 + Math.random() * 30; // 40-70%
      
      // Rothfusz regression equation for heat index
      const T = (baseTemp * 9) / 5 + 32; // Convert to F
      const RH = humidity;
      let HI = 
        -42.379 + 2.04901523 * T + 10.14333127 * RH - 
        0.22475541 * T * RH - 0.00683783 * T * T - 
        0.05481717 * RH * RH + 0.00122874 * T * T * RH + 
        0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;

      // Convert back to Celsius
      let heatIndexC = (HI - 32) * 5 / 9;

      // Determine risk level
      let riskLevel = "low";
      if (heatIndexC >= 54) riskLevel = "danger";
      else if (heatIndexC >= 41) riskLevel = "extreme";
      else if (heatIndexC >= 32) riskLevel = "high";
      else if (heatIndexC >= 27) riskLevel = "moderate";

      // Insert weather reading
      const { data: reading, error: readingError } = await supabaseClient
        .from("weather_readings")
        .insert({
          site_id: site.id,
          temperature_c: Number(baseTemp.toFixed(1)),
          humidity_pct: Number(humidity.toFixed(1)),
          heat_index: Number(heatIndexC.toFixed(1)),
          risk_level: riskLevel,
        })
        .select()
        .single();

      if (readingError) throw readingError;
      results.push(reading);

      // Trigger n8n webhook if risk is extreme or danger
      if (riskLevel === "extreme" || riskLevel === "danger") {
        const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL_HEAT_ALERT");
        if (n8nWebhookUrl) {
          // Find supervisor phone
          const { data: supervisor } = await supabaseClient
            .from("users")
            .select("phone")
            .eq("role", "supervisor")
            .limit(1)
            .single();

          await fetch(n8nWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              site_id: site.id,
              site_name: site.name,
              heat_index: Number(heatIndexC.toFixed(1)),
              risk_level: riskLevel,
              supervisor_phone: supervisor?.phone ?? "",
            }),
          }).catch(console.error);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
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
