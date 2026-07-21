import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// WMO weather codes -> human-readable condition (used by Open-Meteo)
const WMO_CONDITIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

function conditionFromCode(code: number | undefined): string {
  if (code === undefined) return "Unknown";
  return WMO_CONDITIONS[code] ?? "Unknown";
}

/** NOAA/NWS Rothfusz regression — same formula used client-side in src/lib/utils/heatIndex.ts */
function calculateHeatIndexC(tempC: number, humidityPct: number): number {
  const T = (tempC * 9) / 5 + 32;
  const RH = humidityPct;

  if (T < 80) {
    const simple = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + RH * 0.094);
    return ((simple - 32) * 5) / 9;
  }

  let HI =
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    0.00683783 * T * T -
    0.05481717 * RH * RH +
    0.00122874 * T * T * RH +
    0.00085282 * T * RH * RH -
    0.00000199 * T * T * RH * RH;

  if (RH < 13 && T >= 80 && T <= 112) {
    HI -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
  } else if (RH > 85 && T >= 80 && T <= 87) {
    HI += ((RH - 85) / 10) * ((87 - T) / 5);
  }

  return ((HI - 32) * 5) / 9;
}

function riskLevelFromHeatIndex(heatIndexC: number): string {
  if (heatIndexC >= 52) return "danger";
  if (heatIndexC >= 40) return "extreme";
  if (heatIndexC >= 32) return "high";
  if (heatIndexC >= 27) return "moderate";
  return "low";
}

/** Normalise a phone number to E.164, defaulting to India (+91). */
function toE164(raw: string): string | null {
  const t = (raw ?? "").trim();
  if (!t) return null;
  if (t.startsWith("+")) return t.replace(/\s+/g, "");
  const digits = t.replace(/\D/g, "");
  if (digits.length === 10) return "+91" + digits;
  if (digits.length === 11 && digits.startsWith("0")) return "+91" + digits.slice(1);
  if (digits.length === 12 && digits.startsWith("91")) return "+" + digits;
  if (digits.length > 0) return "+" + digits;
  return null;
}

/** Send a message via Twilio (WhatsApp when configured, else SMS) using the
 *  shared function secrets. Returns null on success or an error string. */
async function sendTwilioSMS(to: string, message: string): Promise<string | null> {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_FROM_NUMBER");
  const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");
  const whatsappFromRaw = Deno.env.get("TWILIO_WHATSAPP_FROM");
  const whatsappFrom = whatsappFromRaw
    ? (whatsappFromRaw.startsWith("whatsapp:") ? whatsappFromRaw : `whatsapp:${whatsappFromRaw}`)
    : null;
  const hasSms = !!fromNumber || !!messagingServiceSid;
  if (!sid || !token || (!hasSms && !whatsappFrom)) return "Twilio not configured";

  const toNumber = toE164(to);
  if (!toNumber) return `Invalid recipient number: ${to}`;

  const form = new URLSearchParams({ Body: message });
  if (whatsappFrom) {
    form.set("To", `whatsapp:${toNumber}`);
    form.set("From", whatsappFrom);
  } else {
    form.set("To", toNumber);
    if (messagingServiceSid) form.set("MessagingServiceSid", messagingServiceSid);
    else form.set("From", fromNumber!);
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${sid}:${token}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      }
    );
    const data = await res.json();
    if (!res.ok) return data?.message ?? `Twilio error ${res.status}`;
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

/** Compose the supervisor-facing heat alert SMS. */
function composeHeatSMS(siteName: string, heatIndex: number, riskLevel: string): string {
  const action =
    riskLevel === "danger"
      ? "STOP all work. Move workers to shade and hydrate immediately."
      : "Reduce shifts, enforce 30-min rest cycles, ensure water access.";
  const time = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
  const label = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
  return [
    "HEATSHIELD HEAT ALERT",
    "",
    `Site: ${siteName}`,
    `Heat Index: ${Math.round(heatIndex)}C (${label})`,
    `Action: ${action}`,
    `Time: ${time}`,
  ].join("\n");
}

interface OpenMeteoCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  weather_code: number;
  time: string;
}

/** Fetch live current-weather from Open-Meteo (free, no API key required). */
async function fetchLiveWeather(
  lat: number,
  lon: number
): Promise<{ current: OpenMeteoCurrent; raw: Record<string, unknown> }> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&timezone=Asia%2FKolkata`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed: ${res.status} ${res.statusText}`);
  }
  const raw = await res.json();
  if (!raw.current) {
    throw new Error("Open-Meteo response missing 'current' block");
  }
  return { current: raw.current as OpenMeteoCurrent, raw };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: sites, error: sitesError } = await supabaseClient
      .from("kiln_sites")
      .select("id, name, latitude, longitude")
      .eq("status", "active");

    if (sitesError) throw sitesError;

    const results = [];
    const errors: { site_id: string; site_name: string; error: string }[] = [];

    for (const site of sites) {
      if (!site.latitude || !site.longitude) continue;

      try {
        const { current, raw } = await fetchLiveWeather(site.latitude, site.longitude);

        const temperature_c = current.temperature_2m;
        const humidity_pct = current.relative_humidity_2m;
        const wind_speed_kmh = current.wind_speed_10m;
        const condition = conditionFromCode(current.weather_code);
        const heatIndexC = calculateHeatIndexC(temperature_c, humidity_pct);
        const riskLevel = riskLevelFromHeatIndex(heatIndexC);

        const { data: reading, error: readingError } = await supabaseClient
          .from("weather_readings")
          .insert({
            site_id: site.id,
            temperature_c: Number(temperature_c.toFixed(1)),
            humidity_pct: Number(humidity_pct.toFixed(1)),
            heat_index: Number(heatIndexC.toFixed(1)),
            wind_speed_kmh: Number(wind_speed_kmh.toFixed(1)),
            condition,
            risk_level: riskLevel,
            raw_api_response: raw,
          })
          .select()
          .single();

        if (readingError) throw readingError;
        results.push(reading);

        // Escalate when conditions are extreme/dangerous: SMS the site's
        // registered supervisor + log an alert for the dashboard. Throttled
        // so a site that stays hot doesn't text the supervisor every run.
        if (riskLevel === "extreme" || riskLevel === "danger") {
          const COOLDOWN_HOURS = 3;
          const since = new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000).toISOString();

          const { data: recentAlert } = await supabaseClient
            .from("alerts")
            .select("id")
            .eq("site_id", site.id)
            .eq("alert_type", "heat_warning")
            .gte("created_at", since)
            .limit(1)
            .maybeSingle();

          if (!recentAlert) {
            const hi = Number(heatIndexC.toFixed(1));
            const severity = riskLevel === "danger" ? "emergency" : "critical";

            // Log the alert (appears in the dashboard alert stream).
            await supabaseClient.from("alerts").insert({
              site_id: site.id,
              alert_type: "heat_warning",
              severity,
              message: `🌡 Heat index ${Math.round(hi)}°C (${riskLevel}) at ${site.name} — ${
                riskLevel === "danger"
                  ? "STOP work, evacuate to shade"
                  : "reduce shifts, mandatory rest cycles"
              }.`,
              status: "active",
            });

            // SMS the assigned supervisor's registered number.
            const { data: supervisor } = await supabaseClient
              .from("supervisors")
              .select("user:users(phone)")
              .eq("site_id", site.id)
              .limit(1)
              .maybeSingle();
            const supervisorPhone =
              (supervisor?.user as { phone?: string } | null)?.phone ?? "";

            if (supervisorPhone) {
              const smsErr = await sendTwilioSMS(
                supervisorPhone,
                composeHeatSMS(site.name, hi, riskLevel)
              );
              if (smsErr) console.error(`Heat SMS failed for ${site.name}:`, smsErr);
            }

            // Optional legacy n8n mirror.
            const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL_HEAT_ALERT");
            if (n8nWebhookUrl) {
              await fetch(n8nWebhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  site_id: site.id,
                  site_name: site.name,
                  heat_index: hi,
                  risk_level: riskLevel,
                  supervisor_phone: supervisorPhone,
                }),
              }).catch(console.error);
            }
          }
        }
      } catch (siteErr) {
        console.error(`Failed to fetch/store weather for site ${site.name}:`, siteErr);
        errors.push({
          site_id: site.id,
          site_name: site.name,
          error: siteErr instanceof Error ? siteErr.message : String(siteErr),
        });
      }
    }

    return new Response(JSON.stringify({ success: true, results, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
