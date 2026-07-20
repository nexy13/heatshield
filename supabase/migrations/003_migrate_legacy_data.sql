-- ============================================
-- HeatShield — Migrate legacy (v1) data to the v2 schema
-- The v1 live DB had: profiles, sites, shifts, readings, alerts (old shapes).
-- Run AFTER 001_initial_schema.sql. Safe to re-run (all steps guarded).
--
-- NOTE (applied to live DB on 2026-07-19): the legacy `alerts`, `shifts`,
-- and `readings` tables were empty and were dropped BEFORE running 001 so
-- the v2 tables with those names could be created. The guarded drops in
-- step 1 below reproduce that for any environment still on the v1 schema.
-- ============================================

-- 1. Drop EMPTY legacy tables whose names collide with the v2 schema.
--    Identified by v1-only columns so v2 tables are never touched.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='alerts' AND column_name='reading_id') THEN
    IF (SELECT count(*) FROM public.alerts) = 0 THEN
      DROP TABLE public.alerts CASCADE;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='shifts')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='shifts' AND column_name='status') THEN
    IF (SELECT count(*) FROM public.shifts) = 0 THEN
      DROP TABLE public.shifts CASCADE;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='readings') THEN
    IF (SELECT count(*) FROM public.readings) = 0 THEN
      DROP TABLE public.readings CASCADE;
    END IF;
  END IF;
END $$;

-- 2. Migrate legacy sites -> kiln_sites (IDs preserved).
--    Legacy zone labels are remapped onto the Bengaluru kiln belt:
--    coordinates and region names become Bengaluru clusters.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='sites') THEN
    INSERT INTO public.kiln_sites (id, name, address, latitude, longitude, region, status)
    SELECT
      s.id,
      s.name,
      s.location,
      CASE s.zone
        WHEN 'North Zone' THEN 12.8590  -- Sarjapura
        WHEN 'West Zone'  THEN 12.7861  -- Jigani
        WHEN 'East Zone'  THEN 12.7110  -- Anekal
        ELSE 12.8167                    -- Bommasandra
      END,
      CASE s.zone
        WHEN 'North Zone' THEN 77.7860
        WHEN 'West Zone'  THEN 77.6390
        WHEN 'East Zone'  THEN 77.6970
        ELSE 77.6980
      END,
      CASE s.zone
        WHEN 'North Zone' THEN 'East Bengaluru'
        WHEN 'West Zone'  THEN 'South Bengaluru'
        WHEN 'East Zone'  THEN 'East Bengaluru'
        ELSE 'South Bengaluru'
      END,
      'active'
    FROM public.sites s
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 3. Backfill public.users from legacy profiles + auth.users.
--    Legacy 'worker' accounts are real logins: the project owner becomes
--    admin, everyone else becomes a supervisor of their old site.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='profiles') THEN
    INSERT INTO public.users (id, name, email, phone, role, language_pref, site_id, age, health_flags)
    SELECT
      p.id,
      p.name,
      au.email,
      p.phone,
      CASE WHEN au.email = 'nexy132005@gmail.com' THEN 'admin' ELSE 'supervisor' END,
      'hi',
      p.site_id,
      p.age,
      COALESCE(p.health_flags, '[]'::jsonb)
    FROM public.profiles p
    JOIN auth.users au ON au.id = p.id
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 4. Supervisor site assignments for backfilled supervisor users.
INSERT INTO public.supervisors (user_id, site_id)
SELECT u.id, u.site_id
FROM public.users u
WHERE u.role = 'supervisor' AND u.site_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 5. Seed one current weather reading per site that has none,
--    so dashboards render meaningful data immediately.
INSERT INTO public.weather_readings (site_id, temperature_c, humidity_pct, heat_index, wind_speed_kmh, condition, risk_level, recorded_at)
SELECT
  ks.id,
  v.temp, v.hum,
  public.calculate_heat_index(v.temp, v.hum),
  v.wind, v.cond,
  public.get_risk_level(public.calculate_heat_index(v.temp, v.hum)),
  NOW()
FROM public.kiln_sites ks
JOIN LATERAL (
  VALUES (42.5::float, 55.0::float, 8.5::float, 'Haze')
) AS v(temp, hum, wind, cond) ON true
WHERE NOT EXISTS (SELECT 1 FROM public.weather_readings wr WHERE wr.site_id = ks.id);

-- 6. Tear down the legacy v1 tables now that their data is migrated.
--    Guarded by v1-only columns so v2 tables are never touched.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='profiles' AND column_name='health_flags')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='profiles' AND column_name='email') THEN
    DROP TABLE public.profiles CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='sites' AND column_name='zone')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='sites' AND column_name='latitude') THEN
    DROP TABLE public.sites CASCADE;
  END IF;
END $$;

-- Legacy v1 helper functions, unused by the v2 schema.
DROP FUNCTION IF EXISTS public.is_admin_of_site(uuid);
DROP FUNCTION IF EXISTS public.is_admin_of_site();
DROP FUNCTION IF EXISTS public.rls_auto_enable();

-- Ask PostgREST to reload its schema cache immediately.
NOTIFY pgrst, 'reload schema';
