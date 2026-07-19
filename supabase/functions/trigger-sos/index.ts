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
    const { worker_id, site_id, latitude, longitude, description } = await req.json();

    if (!worker_id && !site_id) {
      throw new Error("worker_id or site_id is required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let siteName = "Unknown Site";
    let workerName = "Unidentified worker";
    let emergencyContact = "";
    let resolvedSiteId = site_id;

    if (worker_id) {
      const { data: worker, error: workerError } = await supabaseClient
        .from("workers")
        .select("*, site:kiln_sites(*)")
        .eq("id", worker_id)
        .single();

      if (!workerError && worker) {
        workerName = worker.name;
        emergencyContact = worker.emergency_contact_phone || "";
        resolvedSiteId = worker.site_id;
        if (worker.site) {
          siteName = worker.site.name;
        }
      }
    }

    if (resolvedSiteId && siteName === "Unknown Site") {
      const { data: site } = await supabaseClient
        .from("kiln_sites")
        .select("name")
        .eq("id", resolvedSiteId)
        .single();
      if (site) {
        siteName = site.name;
      }
    }

    // Insert SOS Event
    const { data: sosEvent, error: sosError } = await supabaseClient
      .from("sos_events")
      .insert({
        worker_id: worker_id || null,
        site_id: resolvedSiteId,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        description: description ?? null,
        status: "triggered",
      })
      .select()
      .single();

    if (sosError) throw sosError;

    // Create system alert
    await supabaseClient.from("alerts").insert({
      site_id: resolvedSiteId,
      worker_id: worker_id || null,
      alert_type: "sos",
      severity: "emergency",
      message: `🚨 SOS triggered by ${workerName} at ${siteName}${description ? ': ' + description : ''}`,
      status: "active",
    });

    // Trigger n8n webhook for SMS routing
    const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL_SOS");
    if (n8nWebhookUrl) {
      // Find supervisor of this site
      const { data: supervisor } = await supabaseClient
        .from("supervisors")
        .select("user_id, user:users(id, phone)")
        .eq("site_id", resolvedSiteId)
        .limit(1)
        .maybeSingle();

      const supervisorPhone = (supervisor?.user as any)?.phone ?? "";
      const supervisorUserId = supervisor?.user_id ?? "";

      await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sos_id: sosEvent.id,
          worker_name: workerName,
          site_name: siteName,
          latitude,
          longitude,
          triggered_at: sosEvent.triggered_at,
          supervisor_phone: supervisorPhone,
          supervisor_user_id: supervisorUserId,
          emergency_contact_phone: emergencyContact,
        }),
      }).catch(console.error);
    }

    return new Response(JSON.stringify({ success: true, sosEvent }), {
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
