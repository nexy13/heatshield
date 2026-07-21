-- ============================================
-- HeatShield — Emergency Response Timeline
-- ============================================
-- Records the step-by-step response workflow for each SOS incident so the
-- Admin Dashboard can render a live emergency timeline:
--   SOS_TRIGGERED -> LOCATION_CAPTURED -> HEAT_INDEX_RECORDED -> SMS_SENT
--   -> SUPERVISOR_ACKNOWLEDGED -> RESCUE_DISPATCHED -> WORKER_SAFE
--
-- Each row is one completed (or failed) step; the UI derives the full
-- 7-stage timeline (completed / current / pending / failed) from the rows
-- present for an incident. Rows are append-only.

CREATE TABLE IF NOT EXISTS public.sos_response_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES public.sos_events(id) ON DELETE CASCADE,
  event TEXT NOT NULL CHECK (event IN (
    'SOS_TRIGGERED',
    'LOCATION_CAPTURED',
    'HEAT_INDEX_RECORDED',
    'SMS_SENT',
    'SUPERVISOR_ACKNOWLEDGED',
    'RESCUE_DISPATCHED',
    'WORKER_SAFE'
  )),
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('completed', 'current', 'pending', 'failed')),
  details JSONB DEFAULT '{}'::jsonb,
  event_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sos_response_events_incident
  ON public.sos_response_events(incident_id);
CREATE INDEX IF NOT EXISTS idx_sos_response_events_event_at
  ON public.sos_response_events(event_at);

-- ---- Row Level Security ----
-- Mirrors the permissive posture of sos_events (the kiosk triggers SOS and
-- logs the opening steps anonymously; admins/supervisors append later steps).
ALTER TABLE public.sos_response_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read sos response events" ON public.sos_response_events;
DROP POLICY IF EXISTS "Public insert sos response events" ON public.sos_response_events;

CREATE POLICY "Public read sos response events" ON public.sos_response_events
  FOR SELECT USING (true);

CREATE POLICY "Public insert sos response events" ON public.sos_response_events
  FOR INSERT WITH CHECK (true);

-- ---- Realtime ----
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'sos_response_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_response_events;
  END IF;
END $$;

-- Ask PostgREST to reload its schema cache immediately.
NOTIFY pgrst, 'reload schema';
