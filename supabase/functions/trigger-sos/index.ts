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
    const { worker_id, latitude, longitude, description } = await req.json();

    if (!worker_id) {
      throw new Error("worker_id is required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get worker details
    const { data: worker, error: workerError } = await supabaseClient
      .from("workers")
      .select("*, user:users(*), site:kiln_sites(*)")
      .eq("id", worker_id)
      .single();

    if (workerError || !worker) throw new Error("Worker not found");

    // Insert SOS Event
    const { data: sosEvent, error: sosError } = await supabaseClient
      .from("sos_events")
      .insert({
        worker_id,
        site_id: worker.site_id,
        latitude,
        longitude,
        description,
        status: "triggered",
      })
      .select()
      .single();

    if (sosError) throw sosError;

    // Create system alert
    await supabaseClient.from("alerts").insert({
      site_id: worker.site_id,
      worker_id: worker.id,
      alert_type: "sos",
      severity: "emergency",
      message: `🚨 SOS triggered by ${worker.user.name}${description ? ': ' + description : ''}`,
      status: "active",
    });

    // Trigger n8n webhook for SMS routing
    const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL_SOS");
    if (n8nWebhookUrl) {
      // Find site supervisor
      const { data: supervisor } = await supabaseClient
        .from("users")
        .select("id, phone")
        .eq("role", "supervisor")
        .limit(1) // Ideally filtered by site_id, but simplified for MVP
        .single();

      await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sos_id: sosEvent.id,
          worker_name: worker.user.name,
          site_name: worker.site.name,
          latitude,
          longitude,
          triggered_at: sosEvent.triggered_at,
          supervisor_phone: supervisor?.phone ?? "",
          supervisor_user_id: supervisor?.id ?? "",
          emergency_contact_phone: worker.emergency_contact_phone,
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
