-- ============================================
-- HeatShield — Email notification step on the SOS timeline
-- ============================================
-- Adds EMAIL_SENT to the response-event workflow so the emergency timeline
-- can show whether the supervisor was emailed (alongside the SMS step).
-- The users table already carries email + phone, so no schema change there.

ALTER TABLE public.sos_response_events
  DROP CONSTRAINT IF EXISTS sos_response_events_event_check;

ALTER TABLE public.sos_response_events
  ADD CONSTRAINT sos_response_events_event_check CHECK (event IN (
    'SOS_TRIGGERED',
    'LOCATION_CAPTURED',
    'HEAT_INDEX_RECORDED',
    'SMS_SENT',
    'EMAIL_SENT',
    'SUPERVISOR_ACKNOWLEDGED',
    'RESCUE_DISPATCHED',
    'WORKER_SAFE'
  ));

-- Backfill EMAIL_SENT on the existing demo incidents so the timeline reads
-- coherently (guarded per incident; safe to re-run).
DO $$
DECLARE
  demo_email TEXT := 'ramesh.gowda@heatshield.demo';
BEGIN
  -- Incident 1 — Anekal — email delivered.
  IF NOT EXISTS (SELECT 1 FROM public.sos_response_events WHERE incident_id = 'e1000001-0001-0001-0001-000000000001' AND event = 'EMAIL_SENT') THEN
    INSERT INTO public.sos_response_events (incident_id, event, status, details, event_at) VALUES
      ('e1000001-0001-0001-0001-000000000001', 'EMAIL_SENT', 'completed',
       jsonb_build_object('recipient', demo_email, 'provider', 'Resend', 'delivery_status', 'Sent'),
       NOW() - INTERVAL '12 minutes' + INTERVAL '24 seconds');
  END IF;

  -- Incident 2 — Jigani — email delivered (fully resolved incident).
  IF NOT EXISTS (SELECT 1 FROM public.sos_response_events WHERE incident_id = 'e1000001-0001-0001-0001-000000000002' AND event = 'EMAIL_SENT') THEN
    INSERT INTO public.sos_response_events (incident_id, event, status, details, event_at) VALUES
      ('e1000001-0001-0001-0001-000000000002', 'EMAIL_SENT', 'completed',
       jsonb_build_object('recipient', demo_email, 'provider', 'Resend', 'delivery_status', 'Sent'),
       NOW() - INTERVAL '120 minutes' + INTERVAL '22 seconds');
  END IF;

  -- Incident 3 — Bommasandra — email failed (comms outage: SMS also failed).
  IF NOT EXISTS (SELECT 1 FROM public.sos_response_events WHERE incident_id = 'e1000001-0001-0001-0001-000000000003' AND event = 'EMAIL_SENT') THEN
    INSERT INTO public.sos_response_events (incident_id, event, status, details, event_at) VALUES
      ('e1000001-0001-0001-0001-000000000003', 'EMAIL_SENT', 'failed',
       jsonb_build_object('recipient', demo_email, 'provider', 'Resend', 'delivery_status', 'Failed', 'reason', 'SMTP relay timeout — provider did not accept'),
       NOW() - INTERVAL '26 minutes' + INTERVAL '40 seconds');
  END IF;

  -- Incident 4 — Attibele — just triggered; notifications still pending (no row).
END $$;

NOTIFY pgrst, 'reload schema';
