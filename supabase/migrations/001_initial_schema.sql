-- ============================================
-- HeatShield — Full Database Schema
-- Paste this ENTIRE script into Supabase SQL Editor and click "Run"
-- Safe to re-run: tables use IF NOT EXISTS, policies are dropped and recreated.
-- ============================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- 2. Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('supervisor', 'admin')),
  language_pref TEXT DEFAULT 'hi',
  avatar_url TEXT,
  site_id UUID,
  age INT,
  health_flags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upgrade path: add columns if the table pre-exists without them
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS site_id UUID;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age INT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS health_flags JSONB DEFAULT '[]';

-- Upgrade path: only 'supervisor' and 'admin' can log in
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('supervisor', 'admin'));

-- 3. Kiln Sites table
CREATE TABLE IF NOT EXISTS public.kiln_sites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  region TEXT,
  owner_id UUID REFERENCES public.users(id),
  hydration_interval_min INT DEFAULT 30,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Workers table
CREATE TABLE IF NOT EXISTS public.workers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID REFERENCES public.kiln_sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  total_family_members INT DEFAULT 0,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  blood_group TEXT,
  medical_conditions JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Supervisors table
CREATE TABLE IF NOT EXISTS public.supervisors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  site_id UUID REFERENCES public.kiln_sites(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Shifts table
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.kiln_sites(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated')),
  avg_heat_index FLOAT,
  water_breaks_taken INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Weather Readings table
CREATE TABLE IF NOT EXISTS public.weather_readings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID REFERENCES public.kiln_sites(id) ON DELETE CASCADE,
  temperature_c FLOAT NOT NULL,
  humidity_pct FLOAT NOT NULL,
  heat_index FLOAT NOT NULL,
  wind_speed_kmh FLOAT,
  condition TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high', 'extreme', 'danger')),
  raw_api_response JSONB,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Health Logs table
CREATE TABLE IF NOT EXISTS public.health_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
  body_temp_c FLOAT,
  heart_rate_bpm INT,
  symptoms TEXT,
  reported_by TEXT CHECK (reported_by IN ('self', 'supervisor', 'system')),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID REFERENCES public.kiln_sites(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES public.workers(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('heat_warning', 'hydration', 'sos', 'compliance', 'system')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'emergency')),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  action_taken TEXT,
  resolved_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 10. SOS Events table
CREATE TABLE IF NOT EXISTS public.sos_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.kiln_sites(id),
  latitude FLOAT,
  longitude FLOAT,
  status TEXT DEFAULT 'triggered' CHECK (status IN ('triggered', 'responding', 'resolved', 'false_alarm')),
  description TEXT,
  responded_by UUID REFERENCES public.users(id),
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 11. Hydration Logs table
CREATE TABLE IF NOT EXISTS public.hydration_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
  water_ml INT NOT NULL DEFAULT 250,
  reminder_type TEXT CHECK (reminder_type IN ('scheduled', 'manual', 'system')),
  was_reminded BOOLEAN DEFAULT false,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Notifications Log table
CREATE TABLE IF NOT EXISTS public.notifications_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  channel TEXT CHECK (channel IN ('push', 'sms', 'whatsapp', 'in_app')),
  title TEXT,
  body TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Compliance Reports table
CREATE TABLE IF NOT EXISTS public.compliance_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID REFERENCES public.kiln_sites(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  total_workers INT DEFAULT 0,
  workers_with_water_breaks INT DEFAULT 0,
  sos_events_count INT DEFAULT 0,
  alerts_triggered INT DEFAULT 0,
  avg_heat_index FLOAT,
  compliance_grade TEXT CHECK (compliance_grade IN ('A', 'B', 'C', 'D', 'F')),
  details JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, report_date)
);

-- ============================================
-- HELPER FUNCTIONS FOR RLS (SECURITY DEFINER)
-- These bypass RLS internally, which prevents the
-- "infinite recursion detected in policy" (42P17) error
-- that occurs when a policy on public.users queries public.users.
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT role FROM public.users WHERE id = (SELECT auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.user_role() TO anon, authenticated;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiln_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;

-- ---- Users Policies ----
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Users can update themselves" ON public.users;
DROP POLICY IF EXISTS "Users can insert themselves" ON public.users;
DROP POLICY IF EXISTS "users_select_own_or_admin" ON public.users;
DROP POLICY IF EXISTS "users_update_own_or_admin" ON public.users;
DROP POLICY IF EXISTS "users_insert_self_or_admin" ON public.users;
DROP POLICY IF EXISTS "users_delete_admin" ON public.users;

CREATE POLICY "users_select_own_or_admin" ON public.users
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "users_update_own_or_admin" ON public.users
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "users_insert_self_or_admin" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "users_delete_admin" ON public.users
  FOR DELETE USING (public.is_admin());

-- ---- Kiln Sites Policies ----
DROP POLICY IF EXISTS "Public read sites" ON public.kiln_sites;
DROP POLICY IF EXISTS "Admins can manage sites" ON public.kiln_sites;
DROP POLICY IF EXISTS "Supervisors can update own site" ON public.kiln_sites;

CREATE POLICY "Public read sites" ON public.kiln_sites
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage sites" ON public.kiln_sites
  FOR ALL USING (public.is_admin());

-- Supervisors may edit their assigned site (e.g. hydration reminder interval)
CREATE POLICY "Supervisors can update own site" ON public.kiln_sites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.supervisors s
      WHERE s.user_id = auth.uid() AND s.site_id = kiln_sites.id
    )
  );

-- ---- Workers Policies ----
DROP POLICY IF EXISTS "Public read workers" ON public.workers;
DROP POLICY IF EXISTS "Supervisors manage site workers" ON public.workers;
DROP POLICY IF EXISTS "Admins manage all workers" ON public.workers;

CREATE POLICY "Public read workers" ON public.workers
  FOR SELECT USING (true);

CREATE POLICY "Supervisors manage site workers" ON public.workers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.supervisors s
      WHERE s.user_id = auth.uid() AND s.site_id = workers.site_id
    )
  );

CREATE POLICY "Admins manage all workers" ON public.workers
  FOR ALL USING (public.is_admin());

-- ---- Supervisors Policies ----
DROP POLICY IF EXISTS "Supervisors can read own record" ON public.supervisors;
DROP POLICY IF EXISTS "Supervisors can insert own record" ON public.supervisors;
DROP POLICY IF EXISTS "Admins can manage supervisors" ON public.supervisors;

CREATE POLICY "Supervisors can read own record" ON public.supervisors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Supervisors can insert own record" ON public.supervisors
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage supervisors" ON public.supervisors
  FOR ALL USING (public.is_admin());

-- ---- Shifts Policies ----
DROP POLICY IF EXISTS "Supervisors can manage site shifts" ON public.shifts;
DROP POLICY IF EXISTS "Admins can manage all shifts" ON public.shifts;

CREATE POLICY "Supervisors can manage site shifts" ON public.shifts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.supervisors s
      WHERE s.user_id = auth.uid() AND s.site_id = shifts.site_id
    )
  );

CREATE POLICY "Admins can manage all shifts" ON public.shifts
  FOR ALL USING (public.is_admin());

-- ---- Weather Readings Policies ----
DROP POLICY IF EXISTS "Public read weather" ON public.weather_readings;

CREATE POLICY "Public read weather" ON public.weather_readings
  FOR SELECT USING (true);

-- ---- Health Logs Policies ----
DROP POLICY IF EXISTS "Supervisors can manage site health logs" ON public.health_logs;
DROP POLICY IF EXISTS "Admins can manage all health logs" ON public.health_logs;

CREATE POLICY "Supervisors can manage site health logs" ON public.health_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workers w
      JOIN public.supervisors s ON s.site_id = w.site_id
      WHERE w.id = worker_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all health logs" ON public.health_logs
  FOR ALL USING (public.is_admin());

-- ---- Alerts Policies ----
DROP POLICY IF EXISTS "Public read alerts" ON public.alerts;
DROP POLICY IF EXISTS "Public insert alerts" ON public.alerts;
DROP POLICY IF EXISTS "Supervisors and admins can update alerts" ON public.alerts;

CREATE POLICY "Public read alerts" ON public.alerts
  FOR SELECT USING (true);

CREATE POLICY "Public insert alerts" ON public.alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Supervisors and admins can update alerts" ON public.alerts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.supervisors s WHERE s.user_id = auth.uid() AND s.site_id = alerts.site_id
    ) OR public.is_admin()
  );

-- ---- SOS Events Policies ----
DROP POLICY IF EXISTS "Public insert SOS events" ON public.sos_events;
DROP POLICY IF EXISTS "Public read SOS events" ON public.sos_events;
DROP POLICY IF EXISTS "Supervisors and admins can update SOS events" ON public.sos_events;

CREATE POLICY "Public insert SOS events" ON public.sos_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read SOS events" ON public.sos_events
  FOR SELECT USING (true);

CREATE POLICY "Supervisors and admins can update SOS events" ON public.sos_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.supervisors s WHERE s.user_id = auth.uid() AND s.site_id = sos_events.site_id
    ) OR public.is_admin()
  );

-- ---- Hydration Logs Policies ----
DROP POLICY IF EXISTS "Public select hydration logs" ON public.hydration_logs;
DROP POLICY IF EXISTS "Public insert hydration logs" ON public.hydration_logs;
DROP POLICY IF EXISTS "Supervisors can manage site hydration logs" ON public.hydration_logs;

CREATE POLICY "Public select hydration logs" ON public.hydration_logs
  FOR SELECT USING (true);

CREATE POLICY "Public insert hydration logs" ON public.hydration_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Supervisors can manage site hydration logs" ON public.hydration_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workers w
      JOIN public.supervisors s ON s.site_id = w.site_id
      WHERE w.id = worker_id AND s.user_id = auth.uid()
    )
  );

-- ---- Notifications Log Policies ----
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications_log;

CREATE POLICY "Users can read own notifications" ON public.notifications_log
  FOR SELECT USING (user_id = auth.uid());

-- ---- Compliance Reports Policies ----
DROP POLICY IF EXISTS "Admins and NGO can read compliance reports" ON public.compliance_reports;
DROP POLICY IF EXISTS "Admins can read compliance reports" ON public.compliance_reports;

CREATE POLICY "Admins can read compliance reports" ON public.compliance_reports
  FOR SELECT USING (public.is_admin());

-- ============================================
-- AUTH TRIGGER (auto-create profile on signup)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta_role TEXT;
BEGIN
  meta_role := COALESCE(NEW.raw_user_meta_data->>'role', 'supervisor');
  -- Only roles the users.role CHECK constraint accepts; anything else
  -- (e.g. legacy 'worker' accounts) falls back to 'supervisor'.
  IF meta_role NOT IN ('supervisor', 'admin') THEN
    meta_role := 'supervisor';
  END IF;

  INSERT INTO public.users (id, name, email, phone, role, language_pref)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'User'),
    COALESCE(NEW.email, NEW.id::text || '@guest.heatshield.app'),
    NEW.phone,
    meta_role,
    COALESCE(NEW.raw_user_meta_data->>'language_pref', 'hi')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate heat index from temperature and humidity
CREATE OR REPLACE FUNCTION public.calculate_heat_index(temp_c FLOAT, humidity FLOAT)
RETURNS FLOAT AS $$
DECLARE
  temp_f FLOAT;
  hi_f FLOAT;
  hi_c FLOAT;
BEGIN
  -- Convert Celsius to Fahrenheit
  temp_f := (temp_c * 9.0 / 5.0) + 32.0;

  -- Rothfusz regression equation
  hi_f := -42.379
    + 2.04901523 * temp_f
    + 10.14333127 * humidity
    - 0.22475541 * temp_f * humidity
    - 0.00683783 * temp_f * temp_f
    - 0.05481717 * humidity * humidity
    + 0.00122874 * temp_f * temp_f * humidity
    + 0.00085282 * temp_f * humidity * humidity
    - 0.00000199 * temp_f * temp_f * humidity * humidity;

  -- Convert back to Celsius
  hi_c := (hi_f - 32.0) * 5.0 / 9.0;

  RETURN ROUND(hi_c::numeric, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to determine risk level from heat index
CREATE OR REPLACE FUNCTION public.get_risk_level(heat_index FLOAT)
RETURNS TEXT AS $$
BEGIN
  IF heat_index < 27 THEN RETURN 'low';
  ELSIF heat_index < 32 THEN RETURN 'moderate';
  ELSIF heat_index < 40 THEN RETURN 'high';
  ELSIF heat_index < 52 THEN RETURN 'extreme';
  ELSE RETURN 'danger';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- REALTIME (best-effort; ignore if already added)
-- ============================================

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
  EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_events;
  EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.weather_readings;
  EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
END $$;

-- ============================================
-- DONE! All tables, policies, triggers & functions created.
-- ============================================
