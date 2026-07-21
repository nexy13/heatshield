-- ============================================
-- HeatShield — Live weather scheduling
-- Makes check-heat-index run automatically so kiln_sites (incl. Anekal,
-- Chandapura, Jigani, Bommasandra, Attibele) get a fresh live reading
-- on a fixed cadence instead of only when someone calls the function
-- by hand. See supabase/functions/check-heat-index/index.ts.
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Re-running this migration should not create duplicate jobs.
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'heatshield-check-heat-index';

-- Every 15 minutes, invoke the check-heat-index Edge Function, which
-- fetches live temperature/humidity from Open-Meteo for every active
-- site, computes heat index + risk level, and inserts a new row into
-- weather_readings (broadcast live to the dashboard/kiosk via
-- Supabase Realtime, already enabled on that table).
--
-- The anon key below is the same public, RLS-protected key already
-- shipped to every browser via VITE_SUPABASE_ANON_KEY — it is only
-- used here to satisfy the Edge Function gateway's auth check.
SELECT cron.schedule(
  'heatshield-check-heat-index',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://rhoinjlfldrlogzdzbba.supabase.co/functions/v1/check-heat-index',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJob2luamxmbGRybG9nemR6YmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTcyNzUsImV4cCI6MjA5OTc5MzI3NX0.7_5wVim8ooR-sgN91j6aVeiNRexNEFnaxR5y0C8IOOQ'
    ),
    body := '{}'::jsonb
  );
  $$
);
