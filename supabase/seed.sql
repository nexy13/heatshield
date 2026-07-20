-- ============================================
-- HeatShield — Seed Data
-- Run this AFTER 001_initial_schema.sql
-- Demo deployment: Bengaluru (Karnataka) brick kiln belt
-- Safe to re-run: every block is guarded or upserts.
-- ============================================

-- ============================================
-- 1. KILN SITES — Bengaluru region
--    5 active sites + 4 onboarding (inactive) sites
-- ============================================
INSERT INTO public.kiln_sites (id, name, address, latitude, longitude, region, status) VALUES
  ('aaaa0001-0001-0001-0001-000000000001', 'Anekal Brick Industries',         'Anekal, Bengaluru Rural District, Karnataka',        12.7110, 77.6970, 'East Bengaluru',  'active'),
  ('aaaa0001-0001-0001-0001-000000000002', 'Jigani Eco Bricks',               'Jigani Industrial Area, Bengaluru Urban, Karnataka', 12.7861, 77.6390, 'South Bengaluru', 'active'),
  ('aaaa0001-0001-0001-0001-000000000003', 'Bommasandra Kilns',               'Bommasandra Industrial Estate, Bengaluru, Karnataka',12.8167, 77.6980, 'South Bengaluru', 'active'),
  ('aaaa0001-0001-0001-0001-000000000004', 'Attibele Clay Works',             'Attibele, Bengaluru Rural District, Karnataka',      12.7789, 77.7710, 'South Bengaluru', 'active'),
  ('aaaa0001-0001-0001-0001-000000000005', 'Chandapura Brick Industries',     'Chandapura, Anekal Road, Bengaluru, Karnataka',      12.8010, 77.7060, 'South Bengaluru', 'active'),
  ('aaaa0001-0001-0001-0001-000000000006', 'Sarjapura Brick Works',           'Sarjapura, Bengaluru, Karnataka',                    12.8590, 77.7860, 'East Bengaluru',  'inactive'),
  ('aaaa0001-0001-0001-0001-000000000007', 'Haragadde Kilns',                 'Haragadde, Jigani Road, Bengaluru, Karnataka',       12.7420, 77.6650, 'South Bengaluru', 'inactive'),
  ('aaaa0001-0001-0001-0001-000000000008', 'Electronic City Clay Industries', 'Electronic City Phase 2, Bengaluru, Karnataka',      12.8450, 77.6600, 'South Bengaluru', 'inactive'),
  ('aaaa0001-0001-0001-0001-000000000009', 'Hosur Road Brick Works',          'Hosur Road, Bengaluru, Karnataka',                   12.8330, 77.6770, 'South Bengaluru', 'inactive')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  region = EXCLUDED.region,
  status = EXCLUDED.status;

-- Rename any legacy demo sites that survive from an older deployment
UPDATE public.kiln_sites SET name = 'Anekal Brick Industries',  address = 'Anekal, Bengaluru Rural District, Karnataka', region = 'East Bengaluru',  latitude = 12.7110, longitude = 77.6970 WHERE name ILIKE '%bihar%';
UPDATE public.kiln_sites SET name = 'Jigani Eco Bricks',        address = 'Jigani Industrial Area, Bengaluru Urban, Karnataka', region = 'South Bengaluru', latitude = 12.7861, longitude = 77.6390 WHERE name ILIKE '%rajput%';
UPDATE public.kiln_sites SET name = 'Bommasandra Kilns',        address = 'Bommasandra Industrial Estate, Bengaluru, Karnataka', region = 'South Bengaluru', latitude = 12.8167, longitude = 77.6980 WHERE name ILIKE '%sharma%';
UPDATE public.kiln_sites SET region = CASE region
    WHEN 'North Zone' THEN 'North Bengaluru'
    WHEN 'West Zone'  THEN 'West Bengaluru'
    WHEN 'East Zone'  THEN 'East Bengaluru'
    ELSE 'South Bengaluru'
  END
WHERE region IN ('North Zone', 'West Zone', 'East Zone', 'South Zone');

-- ============================================
-- 2. WORKERS — realistic rosters per site
--    Active sites: 42 / 36 / 51 / 28 / 18 (175 on active sites)
--    Onboarding sites: 22 / 15 / 31 / 19
--    Guarded per-site: only fills sites that have no workers yet.
-- ============================================
DO $$
DECLARE
  site_ids UUID[] := ARRAY[
    'aaaa0001-0001-0001-0001-000000000001',
    'aaaa0001-0001-0001-0001-000000000002',
    'aaaa0001-0001-0001-0001-000000000003',
    'aaaa0001-0001-0001-0001-000000000004',
    'aaaa0001-0001-0001-0001-000000000005',
    'aaaa0001-0001-0001-0001-000000000006',
    'aaaa0001-0001-0001-0001-000000000007',
    'aaaa0001-0001-0001-0001-000000000008',
    'aaaa0001-0001-0001-0001-000000000009'
  ]::uuid[];
  worker_counts INT[] := ARRAY[42, 36, 51, 28, 18, 22, 15, 31, 19];
  first_names TEXT[] := ARRAY[
    'Ravi','Muniraju','Venkatesh','Lakshmamma','Shivanna','Krishnappa','Gangamma','Narayana',
    'Byrappa','Nagesh','Puttaswamy','Sarala','Yellamma','Devaraj','Chandrappa','Muthu',
    'Anand','Rajesh','Siddaraju','Manjula','Kempamma','Somashekar','Nagaraj','Rathnamma'
  ];
  last_names TEXT[] := ARRAY['Gowda','Reddy','Naik','Shetty','M','K','R','S','Achari','Kumar','Swamy','Urs'];
  blood_groups TEXT[] := ARRAY['A+','B+','O+','AB+','O-','A-'];
  i INT;
  j INT;
  n INT := 0;
BEGIN
  FOR i IN 1..array_length(site_ids, 1) LOOP
    IF NOT EXISTS (SELECT 1 FROM public.workers w WHERE w.site_id = site_ids[i]) THEN
      FOR j IN 1..worker_counts[i] LOOP
        n := n + 1;
        INSERT INTO public.workers (
          site_id, name, phone, address, total_family_members,
          emergency_contact_name, emergency_contact_phone,
          blood_group, medical_conditions, status
        ) VALUES (
          site_ids[i],
          first_names[1 + ((n - 1) % 24)] || ' ' || last_names[1 + (((n - 1) / 24) % 12)],
          '+91 9' || lpad((700000000 + n * 137)::text, 9, '0'),
          'Kiln Workers Colony, ' ||
            (SELECT split_part(ks.address, ',', 1) FROM public.kiln_sites ks WHERE ks.id = site_ids[i]) ||
            ', Bengaluru',
          2 + (n % 5),
          first_names[1 + ((n + 6) % 24)] || ' ' || last_names[1 + (((n + 4) / 24) % 12)],
          '+91 9' || lpad((800000000 + n * 211)::text, 9, '0'),
          blood_groups[1 + (n % 6)],
          CASE WHEN n % 17 = 0 THEN '["Asthma"]'::jsonb
               WHEN n % 23 = 0 THEN '["Hypertension"]'::jsonb
               ELSE '[]'::jsonb END,
          'active'
        );
      END LOOP;
    ELSE
      n := n + worker_counts[i];
    END IF;
  END LOOP;
END $$;

-- ============================================
-- 3. WEATHER READINGS — active heatwave conditions
--    Air 39–43°C · Humidity 48–61% · Heat Index 61–68°C
-- ============================================

-- Recent history for Anekal (trend on the kiosk/dashboard)
INSERT INTO public.weather_readings (site_id, temperature_c, humidity_pct, heat_index, wind_speed_kmh, condition, risk_level, recorded_at) VALUES
  ('aaaa0001-0001-0001-0001-000000000001', 40.5, 50.0, 61.5, 10.0, 'Clear', 'danger', NOW() - INTERVAL '45 minutes'),
  ('aaaa0001-0001-0001-0001-000000000001', 41.2, 51.0, 64.2,  9.0, 'Clear', 'danger', NOW() - INTERVAL '20 minutes')
ON CONFLICT DO NOTHING;

-- Latest reading per site
INSERT INTO public.weather_readings (site_id, temperature_c, humidity_pct, heat_index, wind_speed_kmh, condition, risk_level, recorded_at) VALUES
  ('aaaa0001-0001-0001-0001-000000000001', 42.0, 52.0, 66.0,  9.0, 'Clear',         'danger',   NOW()),
  ('aaaa0001-0001-0001-0001-000000000002', 41.0, 48.0, 64.0, 11.0, 'Haze',          'danger',   NOW()),
  ('aaaa0001-0001-0001-0001-000000000003', 43.0, 57.0, 68.0,  7.0, 'Clear',         'danger',   NOW()),
  ('aaaa0001-0001-0001-0001-000000000004', 39.0, 61.0, 61.0, 12.0, 'Partly Cloudy', 'danger',   NOW()),
  ('aaaa0001-0001-0001-0001-000000000005', 39.0, 48.0, 51.8, 13.0, 'Haze',          'extreme',  NOW()),
  ('aaaa0001-0001-0001-0001-000000000006', 34.0, 52.0, 39.4, 14.0, 'Partly Cloudy', 'high',     NOW()),
  ('aaaa0001-0001-0001-0001-000000000007', 33.0, 48.0, 36.8, 12.0, 'Cloudy',        'high',     NOW()),
  ('aaaa0001-0001-0001-0001-000000000008', 32.5, 54.0, 37.6, 10.0, 'Partly Cloudy', 'high',     NOW()),
  ('aaaa0001-0001-0001-0001-000000000009', 31.0, 46.0, 31.5, 15.0, 'Cloudy',        'moderate', NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. ALERTS — live incident narrative
--    2 active (1 heat warning + 1 SOS) + history
-- ============================================
INSERT INTO public.alerts (site_id, alert_type, severity, message, status, created_at, resolved_at)
SELECT v.site_id::uuid, v.alert_type, v.severity, v.message, v.status, v.created_at, v.resolved_at
FROM (VALUES
  ('aaaa0001-0001-0001-0001-000000000001', 'heat_warning', 'critical',
   'Heat Index crossed 65°C at Anekal Brick Industries. Mandatory rest cycles are in effect.',
   'active', NOW() - INTERVAL '25 minutes', NULL::timestamptz),
  ('aaaa0001-0001-0001-0001-000000000002', 'sos', 'emergency',
   'Worker SOS received from Jigani Eco Bricks — emergency SMS sent to supervisor Manjunath H.',
   'active', NOW() - INTERVAL '12 minutes', NULL::timestamptz),
  ('aaaa0001-0001-0001-0001-000000000003', 'heat_warning', 'warning',
   'High temperature detected at Bommasandra Kilns — supervisor Harish Gowda notified via SMS.',
   'acknowledged', NOW() - INTERVAL '1 hour 10 minutes', NULL::timestamptz),
  ('aaaa0001-0001-0001-0001-000000000004', 'hydration', 'info',
   'Hydration reminder — all 28 workers at Attibele Clay Works notified for mandatory water break.',
   'resolved', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 40 minutes'),
  ('aaaa0001-0001-0001-0001-000000000005', 'heat_warning', 'warning',
   'Heat index rising at Chandapura Brick Industries — hydration interval tightened to 30 minutes.',
   'resolved', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours')
) AS v(site_id, alert_type, severity, message, status, created_at, resolved_at)
WHERE NOT EXISTS (SELECT 1 FROM public.alerts);

-- Matching active SOS event for the Jigani emergency
INSERT INTO public.sos_events (worker_id, site_id, latitude, longitude, status, description, triggered_at)
SELECT w.id, w.site_id, 12.7861, 77.6390, 'triggered',
       'SOS from kiosk — worker reported dizziness and heat cramps',
       NOW() - INTERVAL '12 minutes'
FROM public.workers w
WHERE w.site_id = 'aaaa0001-0001-0001-0001-000000000002'
  AND NOT EXISTS (SELECT 1 FROM public.sos_events)
LIMIT 1;

-- ============================================
-- 5. COMPLIANCE REPORTS — yesterday's grades
-- ============================================
INSERT INTO public.compliance_reports
  (site_id, report_date, total_workers, workers_with_water_breaks, sos_events_count, alerts_triggered, avg_heat_index, compliance_grade)
VALUES
  ('aaaa0001-0001-0001-0001-000000000001', CURRENT_DATE - 1, 42, 42, 0, 1, 64.2, 'A'),
  ('aaaa0001-0001-0001-0001-000000000002', CURRENT_DATE - 1, 36, 34, 1, 2, 63.1, 'A'),
  ('aaaa0001-0001-0001-0001-000000000003', CURRENT_DATE - 1, 51, 46, 0, 2, 66.8, 'B'),
  ('aaaa0001-0001-0001-0001-000000000004', CURRENT_DATE - 1, 28, 26, 0, 1, 60.4, 'B'),
  ('aaaa0001-0001-0001-0001-000000000005', CURRENT_DATE - 1, 18, 15, 0, 1, 51.2, 'C')
ON CONFLICT (site_id, report_date) DO NOTHING;

-- ============================================
-- 6. DEMO LOGIN ACCOUNTS (dev/demo environments ONLY)
--    Password for every account: HeatShield@2026
--
--    Creates auth.users rows directly; the handle_new_user()
--    trigger then auto-creates the public.users profiles.
--    Skip this section in production.
-- ============================================
INSERT INTO auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
   confirmation_token, email_change, email_change_token_new, recovery_token)
SELECT
  '00000000-0000-0000-0000-000000000000', v.id::uuid, 'authenticated', 'authenticated',
  v.email, crypt('HeatShield@2026', gen_salt('bf')), NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', v.name, 'role', v.user_role),
  NOW(), NOW(), '', '', '', ''
FROM (VALUES
  ('bbbb0002-0002-0002-0002-000000000001', 'admin@heatshield.com',        'System Admin',  'admin'),
  ('bbbb0002-0002-0002-0002-000000000002', 'ramesh.gowda@heatshield.com', 'Ramesh Gowda',  'supervisor'),
  ('bbbb0002-0002-0002-0002-000000000003', 'manjunath.h@heatshield.com',  'Manjunath H',   'supervisor'),
  ('bbbb0002-0002-0002-0002-000000000004', 'harish.gowda@heatshield.com', 'Harish Gowda',  'supervisor'),
  ('bbbb0002-0002-0002-0002-000000000005', 'suresh.kumar@heatshield.com', 'Suresh Kumar',  'supervisor'),
  ('bbbb0002-0002-0002-0002-000000000006', 'praveen.kumar@heatshield.com','Praveen Kumar', 'supervisor')
) AS v(id, email, name, user_role)
WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = v.email);

-- Email-provider identities (required for password sign-in on newer GoTrue)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT uuid_generate_v4(), au.id, au.id::text,
       jsonb_build_object('sub', au.id::text, 'email', au.email, 'email_verified', true),
       'email', NOW(), NOW(), NOW()
FROM auth.users au
WHERE au.email IN (
  'admin@heatshield.com', 'ramesh.gowda@heatshield.com', 'manjunath.h@heatshield.com',
  'harish.gowda@heatshield.com', 'suresh.kumar@heatshield.com', 'praveen.kumar@heatshield.com'
)
AND NOT EXISTS (SELECT 1 FROM auth.identities i WHERE i.user_id = au.id AND i.provider = 'email');

-- Contact numbers + site assignments on the profiles
UPDATE public.users u SET phone = v.phone, site_id = v.site_id::uuid, language_pref = 'en'
FROM (VALUES
  ('admin@heatshield.com',         '+91 98450 10001', NULL),
  ('ramesh.gowda@heatshield.com',  '+91 98450 20002', 'aaaa0001-0001-0001-0001-000000000001'),
  ('manjunath.h@heatshield.com',   '+91 98450 30003', 'aaaa0001-0001-0001-0001-000000000002'),
  ('harish.gowda@heatshield.com',  '+91 98450 40004', 'aaaa0001-0001-0001-0001-000000000003'),
  ('suresh.kumar@heatshield.com',  '+91 98450 50005', 'aaaa0001-0001-0001-0001-000000000004'),
  ('praveen.kumar@heatshield.com', '+91 98450 60006', 'aaaa0001-0001-0001-0001-000000000005')
) AS v(email, phone, site_id)
WHERE u.email = v.email;

-- Supervisor ↔ site assignments (SMS routing target for SOS)
INSERT INTO public.supervisors (user_id, site_id)
SELECT u.id, u.site_id
FROM public.users u
WHERE u.role = 'supervisor' AND u.site_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- DONE!
--   Sites: 9 Bengaluru kiln sites (5 active)
--   Workers: 262 across all sites (175 on active sites)
--   Weather: live heatwave (heat index 61–68°C on active sites)
--   Alerts: 2 active (1 heat critical, 1 SOS) + history
--   Logins: admin@heatshield.com / HeatShield@2026 (+ 5 supervisors)
-- ============================================
