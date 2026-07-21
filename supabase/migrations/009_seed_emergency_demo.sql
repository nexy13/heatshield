-- ============================================
-- HeatShield — Emergency Response demo data
-- ============================================
-- Realistic demo incidents so the Admin Dashboard emergency timeline is
-- populated for a live walkthrough. Idempotent: fixed UUIDs + guards mean
-- re-running (or `supabase db reset`) never duplicates. Times are relative
-- to apply-time so the incidents always read as "recent / today".
--
-- Showcases every timeline state:
--   • Anekal      — in progress, awaiting supervisor acknowledgement
--   • Jigani      — fully resolved (all 7 steps green)
--   • Bommasandra — SMS delivery FAILED (red step)
--   • Attibele    — just triggered, SMS in progress

-- 1. Demo kiln sites (Bengaluru brick-kiln belt).
INSERT INTO public.kiln_sites (id, name, address, latitude, longitude, region, status) VALUES
  ('d0000001-0001-0001-0001-000000000001', 'Anekal Brick Industries',      'Anekal, Bengaluru Rural District, Karnataka',   12.7110, 77.6970, 'Anekal · East Bengaluru',          'active'),
  ('d0000001-0001-0001-0001-000000000002', 'Jigani Eco Bricks',            'Jigani Industrial Area, Bengaluru, Karnataka',  12.7861, 77.6390, 'Jigani · South Bengaluru',         'active'),
  ('d0000001-0001-0001-0001-000000000003', 'Bommasandra Kilns',            'Bommasandra Industrial Estate, Bengaluru',      12.8167, 77.6980, 'Bommasandra · South Bengaluru',    'active'),
  ('d0000001-0001-0001-0001-000000000004', 'Attibele Clay Works',          'Attibele, Bengaluru Rural District, Karnataka', 12.7789, 77.7710, 'Attibele · South Bengaluru',       'active'),
  ('d0000001-0001-0001-0001-000000000005', 'Electronic City Brick Works',  'Electronic City Phase 2, Bengaluru, Karnataka', 12.8450, 77.6600, 'Electronic City · South Bengaluru','active')
ON CONFLICT (id) DO NOTHING;

-- 2. Demo SOS incidents (anonymous — worker name carried in the timeline).
INSERT INTO public.sos_events (id, worker_id, site_id, latitude, longitude, status, description, responded_by, triggered_at, resolved_at) VALUES
  ('e1000001-0001-0001-0001-000000000001', NULL, 'd0000001-0001-0001-0001-000000000001', 12.7110, 77.6970, 'responding', 'SOS for Ravi Kumar', NULL, NOW() - INTERVAL '12 minutes', NULL),
  ('e1000001-0001-0001-0001-000000000002', NULL, 'd0000001-0001-0001-0001-000000000002', 12.7861, 77.6390, 'resolved',   'SOS for Lakshmi Devi', NULL, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '108 minutes'),
  ('e1000001-0001-0001-0001-000000000003', NULL, 'd0000001-0001-0001-0001-000000000003', 12.8167, 77.6980, 'triggered',  'SOS for Manoj Yadav', NULL, NOW() - INTERVAL '26 minutes', NULL),
  ('e1000001-0001-0001-0001-000000000004', NULL, 'd0000001-0001-0001-0001-000000000004', 12.7789, 77.7710, 'triggered',  'SOS for Suresh Prasad', NULL, NOW() - INTERVAL '3 minutes', NULL)
ON CONFLICT (id) DO NOTHING;

-- 3. Response-event timelines (guarded per incident so re-runs are safe).
DO $$
DECLARE
  sms_supervisor JSONB := jsonb_build_object('recipient','Ramesh Gowda','phone','+91 98861 04452','provider','HeatShield SMS Gateway');
BEGIN
  -- Incident 1 — Anekal — in progress, awaiting supervisor acknowledgement.
  IF NOT EXISTS (SELECT 1 FROM public.sos_response_events WHERE incident_id = 'e1000001-0001-0001-0001-000000000001') THEN
    INSERT INTO public.sos_response_events (incident_id, event, status, details, event_at) VALUES
      ('e1000001-0001-0001-0001-000000000001', 'SOS_TRIGGERED',       'completed', jsonb_build_object('workerName','Ravi Kumar'), NOW() - INTERVAL '12 minutes'),
      ('e1000001-0001-0001-0001-000000000001', 'LOCATION_CAPTURED',   'completed', jsonb_build_object('location','Anekal Brick Industries','latitude',12.7110,'longitude',77.6970), NOW() - INTERVAL '12 minutes' + INTERVAL '4 seconds'),
      ('e1000001-0001-0001-0001-000000000001', 'HEAT_INDEX_RECORDED', 'completed', jsonb_build_object('heat_index',68,'risk_level','danger'), NOW() - INTERVAL '12 minutes' + INTERVAL '7 seconds'),
      ('e1000001-0001-0001-0001-000000000001', 'SMS_SENT',            'completed', sms_supervisor || jsonb_build_object('delivery_status','Delivered','delivery_time_sec',21), NOW() - INTERVAL '12 minutes' + INTERVAL '21 seconds');
  END IF;

  -- Incident 2 — Jigani — fully resolved (all seven steps).
  IF NOT EXISTS (SELECT 1 FROM public.sos_response_events WHERE incident_id = 'e1000001-0001-0001-0001-000000000002') THEN
    INSERT INTO public.sos_response_events (incident_id, event, status, details, event_at) VALUES
      ('e1000001-0001-0001-0001-000000000002', 'SOS_TRIGGERED',           'completed', jsonb_build_object('workerName','Lakshmi Devi'), NOW() - INTERVAL '120 minutes'),
      ('e1000001-0001-0001-0001-000000000002', 'LOCATION_CAPTURED',       'completed', jsonb_build_object('location','Jigani Eco Bricks','latitude',12.7861,'longitude',77.6390), NOW() - INTERVAL '120 minutes' + INTERVAL '5 seconds'),
      ('e1000001-0001-0001-0001-000000000002', 'HEAT_INDEX_RECORDED',     'completed', jsonb_build_object('heat_index',61,'risk_level','extreme'), NOW() - INTERVAL '120 minutes' + INTERVAL '8 seconds'),
      ('e1000001-0001-0001-0001-000000000002', 'SMS_SENT',                'completed', sms_supervisor || jsonb_build_object('delivery_status','Delivered','delivery_time_sec',19), NOW() - INTERVAL '120 minutes' + INTERVAL '19 seconds'),
      ('e1000001-0001-0001-0001-000000000002', 'SUPERVISOR_ACKNOWLEDGED', 'completed', jsonb_build_object('by','Ramesh Gowda'), NOW() - INTERVAL '118 minutes'),
      ('e1000001-0001-0001-0001-000000000002', 'RESCUE_DISPATCHED',       'completed', jsonb_build_object('team','Site Rescue Unit A','eta_min',4), NOW() - INTERVAL '115 minutes'),
      ('e1000001-0001-0001-0001-000000000002', 'WORKER_SAFE',             'completed', jsonb_build_object('outcome','Moved to cooling shelter, rehydrated, stable'), NOW() - INTERVAL '108 minutes');
  END IF;

  -- Incident 3 — Bommasandra — SMS delivery FAILED.
  IF NOT EXISTS (SELECT 1 FROM public.sos_response_events WHERE incident_id = 'e1000001-0001-0001-0001-000000000003') THEN
    INSERT INTO public.sos_response_events (incident_id, event, status, details, event_at) VALUES
      ('e1000001-0001-0001-0001-000000000003', 'SOS_TRIGGERED',       'completed', jsonb_build_object('workerName','Manoj Yadav'), NOW() - INTERVAL '26 minutes'),
      ('e1000001-0001-0001-0001-000000000003', 'LOCATION_CAPTURED',   'completed', jsonb_build_object('location','Bommasandra Kilns','latitude',12.8167,'longitude',77.6980), NOW() - INTERVAL '26 minutes' + INTERVAL '5 seconds'),
      ('e1000001-0001-0001-0001-000000000003', 'HEAT_INDEX_RECORDED', 'completed', jsonb_build_object('heat_index',55,'risk_level','danger'), NOW() - INTERVAL '26 minutes' + INTERVAL '9 seconds'),
      ('e1000001-0001-0001-0001-000000000003', 'SMS_SENT',            'failed',    sms_supervisor || jsonb_build_object('delivery_status','Failed','reason','Carrier timeout — gateway did not acknowledge'), NOW() - INTERVAL '26 minutes' + INTERVAL '35 seconds');
  END IF;

  -- Incident 4 — Attibele — just triggered, SMS in progress.
  IF NOT EXISTS (SELECT 1 FROM public.sos_response_events WHERE incident_id = 'e1000001-0001-0001-0001-000000000004') THEN
    INSERT INTO public.sos_response_events (incident_id, event, status, details, event_at) VALUES
      ('e1000001-0001-0001-0001-000000000004', 'SOS_TRIGGERED',       'completed', jsonb_build_object('workerName','Suresh Prasad'), NOW() - INTERVAL '3 minutes'),
      ('e1000001-0001-0001-0001-000000000004', 'LOCATION_CAPTURED',   'completed', jsonb_build_object('location','Attibele Clay Works','latitude',12.7789,'longitude',77.7710), NOW() - INTERVAL '3 minutes' + INTERVAL '4 seconds'),
      ('e1000001-0001-0001-0001-000000000004', 'HEAT_INDEX_RECORDED', 'completed', jsonb_build_object('heat_index',49,'risk_level','extreme'), NOW() - INTERVAL '3 minutes' + INTERVAL '7 seconds');
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
