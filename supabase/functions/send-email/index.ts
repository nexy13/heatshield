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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface IncidentData {
  siteName?: string;
  location?: string;
  heatIndex?: number | string | null;
  temperature?: number | string | null;
  incidentTime?: string;
  workerId?: string | null;
  workerName?: string | null;
}

/** Parse EMAIL_FROM ("Name <email>" or "email") into name + email parts. */
function parseFrom(raw: string): { name: string; email: string } {
  const m = raw.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
  if (m) return { name: m[1] || "HeatShield", email: m[2].trim() };
  return { name: "HeatShield", email: raw.trim() };
}

/** Resolve a site's registered supervisor (name + email) with the service
 *  role, so it works for the anonymous public kiosk (RLS bypassed). */
async function resolveSiteSupervisor(
  siteId: string
): Promise<{ email: string | null; name: string | null }> {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
  const { data } = await admin
    .from("supervisors")
    .select("user:users(name, email)")
    .eq("site_id", siteId)
    .limit(1)
    .maybeSingle();
  const user = (data?.user as { name?: string; email?: string } | null) ?? null;
  return { email: user?.email ?? null, name: user?.name ?? null };
}

function fmt(v: unknown): string {
  if (v == null || v === "") return "—";
  return String(v);
}

/** Build the emergency email (subject + text + html) per the HeatShield template. */
function composeEmergencyEmail(supervisorName: string, incident: IncidentData) {
  const subject = "🚨 HEATSHIELD Emergency Alert - Worker SOS Triggered";
  const time = incident.incidentTime
    ? new Date(incident.incidentTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })
    : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

  const rows: [string, string][] = [
    ["Site", fmt(incident.siteName)],
    ["Location", fmt(incident.location)],
    ["Heat Index", incident.heatIndex != null && incident.heatIndex !== "" ? `${incident.heatIndex}°C` : "—"],
    ["Temperature", incident.temperature != null && incident.temperature !== "" ? `${incident.temperature}°C` : "—"],
    ["Time", time],
    ["Worker ID", fmt(incident.workerId)],
  ];

  const text = [
    `Hello ${supervisorName},`,
    ``,
    `A worker has triggered an emergency SOS.`,
    ``,
    ...rows.map(([k, v]) => `${k}: ${v}`),
    ``,
    `Immediate assistance is required.`,
    `Please log in to the HeatShield Dashboard to acknowledge the incident.`,
    ``,
    `Thank you,`,
    `HeatShield Emergency Monitoring System`,
  ].join("\n");

  const rowsHtml = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.04em">${k}</td><td style="padding:6px 14px;color:#0b1526;font-size:15px;font-weight:600">${v}</td></tr>`
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#f4f6fa;font-family:Inter,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#dc2626;color:#fff;padding:18px 22px;border-radius:14px 14px 0 0">
      <div style="font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;opacity:.85">HeatShield · Emergency</div>
      <div style="font-size:20px;font-weight:800;margin-top:4px">🚨 Worker SOS Triggered</div>
    </div>
    <div style="background:#fff;border:1px solid #e3e8f0;border-top:none;border-radius:0 0 14px 14px;padding:22px">
      <p style="font-size:15px;color:#0b1526;margin:0 0 6px">Hello <strong>${supervisorName}</strong>,</p>
      <p style="font-size:15px;color:#3d4a61;margin:0 0 16px">A worker has triggered an emergency SOS. Immediate assistance is required.</p>
      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border:1px solid #e3e8f0;border-radius:10px">${rowsHtml}</table>
      <p style="font-size:14px;color:#3d4a61;margin:18px 0 0">Please log in to the <strong>HeatShield Dashboard</strong> to acknowledge the incident.</p>
      <p style="font-size:13px;color:#94a3b8;margin:18px 0 0">Thank you,<br/>HeatShield Emergency Monitoring System</p>
    </div>
  </div></body></html>`;

  return { subject, text, html };
}

/** Send via SendGrid. Returns { ok, id?, error? }. Free tier supports Single
 *  Sender Verification (verify one address, no domain) — sends to anyone. */
async function sendViaSendgrid(
  apiKey: string,
  from: { name: string; email: string },
  to: string,
  subject: string,
  text: string,
  html: string
): Promise<{ ok: boolean; id?: string | null; error?: string }> {
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from.email, name: from.name },
      subject,
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html },
      ],
    }),
  });
  if (res.status === 202) {
    return { ok: true, id: res.headers.get("x-message-id") };
  }
  let msg = `SendGrid error ${res.status}`;
  try {
    const body = await res.json();
    msg = body?.errors?.[0]?.message ?? msg;
  } catch { /* non-JSON body */ }
  return { ok: false, error: msg };
}

/** Send via Resend. Returns { ok, id?, error? }. */
async function sendViaResend(
  apiKey: string,
  fromRaw: string,
  to: string,
  subject: string,
  text: string,
  html: string
): Promise<{ ok: boolean; id?: string | null; error?: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromRaw, to: [to], subject, html, text }),
  });
  const body = await res.json();
  if (res.ok) return { ok: true, id: body?.id ?? null };
  return { ok: false, error: body?.message ?? body?.error?.message ?? `Resend error ${res.status}` };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, site_id, incident } = await req.json();

    const sendgridKey = Deno.env.get("SENDGRID_API_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const fromRaw = Deno.env.get("EMAIL_FROM"); // "HeatShield <you@gmail.com>"
    // Provider: explicit override, else prefer whichever key is configured.
    const provider = (Deno.env.get("EMAIL_PROVIDER")?.toLowerCase()) ||
      (sendgridKey ? "sendgrid" : resendKey ? "resend" : null);

    if (!provider || !fromRaw || (provider === "sendgrid" && !sendgridKey) || (provider === "resend" && !resendKey)) {
      return json({
        success: false,
        error: "Email not configured. Set EMAIL_FROM and a provider key (SENDGRID_API_KEY or RESEND_API_KEY) as function secrets.",
      });
    }

    // Resolve the recipient: explicit `to` wins, else the site's supervisor.
    let recipient: string | null = to ? String(to) : null;
    let recipientName = "Supervisor";
    if (!recipient && site_id) {
      const sup = await resolveSiteSupervisor(String(site_id));
      recipient = sup.email;
      if (sup.name) recipientName = sup.name;
    }

    if (!recipient) {
      return json({
        success: false,
        error: site_id ? "No supervisor email registered for this site." : "No recipient: provide 'to' or 'site_id'.",
      });
    }
    if (!EMAIL_RE.test(recipient)) {
      return json({ success: false, error: `Invalid recipient email: "${recipient}".`, to: recipient });
    }

    const { subject, text, html } = composeEmergencyEmail(recipientName, (incident ?? {}) as IncidentData);

    const result =
      provider === "sendgrid"
        ? await sendViaSendgrid(sendgridKey!, parseFrom(fromRaw), recipient, subject, text, html)
        : await sendViaResend(resendKey!, fromRaw, recipient, subject, text, html);

    if (!result.ok) {
      return json({ success: false, error: result.error, provider, to: recipient, recipient_name: recipientName });
    }

    return json({
      success: true,
      id: result.id ?? null,
      status: "sent",
      provider,
      to: recipient,
      recipient_name: recipientName,
    });
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});
