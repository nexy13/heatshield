import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/** Normalise a phone number to E.164, defaulting to India (+91). */
function toE164(raw: string): string | null {
  const t = (raw ?? "").trim();
  if (!t) return null;
  if (t.startsWith("+")) return t.replace(/\s+/g, "");
  const digits = t.replace(/\D/g, "");
  if (digits.length === 10) return "+91" + digits;                    // 9876543210
  if (digits.length === 11 && digits.startsWith("0")) return "+91" + digits.slice(1); // 09876543210
  if (digits.length === 12 && digits.startsWith("91")) return "+" + digits;           // 919876543210
  if (digits.length > 0) return "+" + digits;
  return null;
}

/** Resolve a site's registered supervisor (phone + name) using the service
 *  role, so it works even for the anonymous public kiosk (RLS bypassed). */
async function resolveSiteSupervisor(
  siteId: string
): Promise<{ phone: string | null; name: string | null }> {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
  const { data } = await admin
    .from("supervisors")
    .select("user:users(name, phone)")
    .eq("site_id", siteId)
    .limit(1)
    .maybeSingle();
  const user = (data?.user as { name?: string; phone?: string } | null) ?? null;
  return { phone: user?.phone ?? null, name: user?.name ?? null };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, site_id, message, channel } = await req.json();

    if (!message) {
      return json({ success: false, error: "'message' is required." });
    }

    const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const token = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_FROM_NUMBER");
    const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");
    // e.g. "whatsapp:+14155238886" (Twilio WhatsApp sandbox or an approved sender)
    const whatsappFromRaw = Deno.env.get("TWILIO_WHATSAPP_FROM");
    const whatsappFrom = whatsappFromRaw
      ? (whatsappFromRaw.startsWith("whatsapp:") ? whatsappFromRaw : `whatsapp:${whatsappFromRaw}`)
      : null;

    const hasSms = !!fromNumber || !!messagingServiceSid;
    if (!sid || !token || (!hasSms && !whatsappFrom)) {
      return json({
        success: false,
        error:
          "Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and a sender (TWILIO_WHATSAPP_FROM for WhatsApp, or TWILIO_FROM_NUMBER / TWILIO_MESSAGING_SERVICE_SID for SMS).",
      });
    }

    // Channel: explicit 'sms' forces SMS; otherwise prefer WhatsApp when a
    // WhatsApp sender is configured (reliable for Indian numbers), else SMS.
    const useWhatsApp = channel === "sms" ? false : (!!whatsappFrom && (channel === "whatsapp" || channel === undefined || !hasSms));

    // Resolve the recipient: an explicit `to` wins; otherwise look up the
    // site's registered supervisor server-side (works for the anon kiosk).
    let recipientRaw: string | null = to ? String(to) : null;
    let recipientName: string | null = null;
    if (!recipientRaw && site_id) {
      const sup = await resolveSiteSupervisor(String(site_id));
      recipientRaw = sup.phone;
      recipientName = sup.name;
    }

    if (!recipientRaw) {
      return json({
        success: false,
        error: site_id
          ? "No supervisor phone registered for this site."
          : "No recipient: provide 'to' or 'site_id'.",
      });
    }

    const toNumber = toE164(recipientRaw);
    if (!toNumber) {
      return json({ success: false, error: `Invalid recipient number: "${recipientRaw}".` });
    }

    // Build the Twilio request for the chosen channel.
    const form = new URLSearchParams({ Body: String(message) });
    if (useWhatsApp) {
      form.set("To", `whatsapp:${toNumber}`);
      form.set("From", whatsappFrom!);
    } else {
      form.set("To", toNumber);
      if (messagingServiceSid) form.set("MessagingServiceSid", messagingServiceSid);
      else form.set("From", fromNumber!);
    }

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
    const usedChannel = useWhatsApp ? "whatsapp" : "sms";

    if (!res.ok) {
      return json({
        success: false,
        error: data?.message ?? `Twilio error ${res.status}`,
        code: data?.code ?? null,
        channel: usedChannel,
        to: toNumber,
        recipient_name: recipientName,
      });
    }

    return json({
      success: true,
      sid: data.sid,
      status: data.status, // queued | sending | sent | delivered ...
      channel: usedChannel,
      to: toNumber,
      recipient_name: recipientName,
    });
  } catch (error) {
    return json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});
