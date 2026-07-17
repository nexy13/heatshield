-- ============================================
-- HeatShield AI — Phase 1 Supabase Setup
-- Paste this ENTIRE script into Supabase SQL Editor and click "Run"
-- ============================================

-- 1. Drop old tables in order of dependency to avoid foreign key issues
DROP TABLE IF EXISTS public.shifts CASCADE;
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.readings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.sites CASCADE;

DROP TABLE IF EXISTS public.compliance_reports CASCADE;
DROP TABLE IF EXISTS public.notifications_log CASCADE;
DROP TABLE IF EXISTS public.hydration_logs CASCADE;
DROP TABLE IF EXISTS public.sos_events CASCADE;
DROP TABLE IF EXISTS public.health_logs CASCADE;
DROP TABLE IF EXISTS public.weather_readings CASCADE;
DROP TABLE IF EXISTS public.workers CASCADE;
DROP TABLE IF EXISTS public.supervisors CASCADE;
DROP TABLE IF EXISTS public.kiln_sites CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Create 'sites' table
CREATE TABLE public.sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  zone TEXT NOT NULL
);

-- 3. Create 'profiles' table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('worker', 'admin')),
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  age INT,
  health_flags JSONB DEFAULT '[]'::jsonb,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create 'readings' table
CREATE TABLE public.readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  temp NUMERIC NOT NULL,
  humidity NUMERIC NOT NULL,
  wbgt NUMERIC NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('safe', 'caution', 'danger'))
);

-- 5. Create 'alerts' table
CREATE TABLE public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reading_id UUID REFERENCES public.readings(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('danger', 'sos')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 6. Create 'shifts' table
CREATE TABLE public.shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  end_time TIMESTAMPTZ
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- ---- 1. Sites Policies ----
CREATE POLICY "Allow select on sites" ON public.sites 
  FOR SELECT TO authenticated, anon USING (true);

-- Helper function to check if user is admin of site (Security Definer avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin_of_site(admin_id UUID, target_site_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = admin_id AND role = 'admin' AND site_id = target_site_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---- 2. Profiles Policies ----
CREATE POLICY "Allow profile insert" ON public.profiles 
  FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Worker own profile select" ON public.profiles 
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Worker own profile update" ON public.profiles 
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admin site profiles select" ON public.profiles 
  FOR SELECT TO authenticated USING (
    public.is_admin_of_site(auth.uid(), site_id)
  );

CREATE POLICY "Admin site profiles update" ON public.profiles 
  FOR UPDATE TO authenticated USING (
    public.is_admin_of_site(auth.uid(), site_id)
  );

-- ---- 3. Readings Policies ----
CREATE POLICY "Worker own readings select" ON public.readings 
  FOR SELECT TO authenticated USING (auth.uid() = worker_id);

CREATE POLICY "Worker own readings update" ON public.readings 
  FOR UPDATE TO authenticated USING (auth.uid() = worker_id);

CREATE POLICY "Admin site readings select" ON public.readings 
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_p
      JOIN public.profiles worker_p ON worker_p.site_id = admin_p.site_id
      WHERE admin_p.id = auth.uid() AND admin_p.role = 'admin' AND worker_p.id = public.readings.worker_id
    )
  );

CREATE POLICY "Admin site readings update" ON public.readings 
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_p
      JOIN public.profiles worker_p ON worker_p.site_id = admin_p.site_id
      WHERE admin_p.id = auth.uid() AND admin_p.role = 'admin' AND worker_p.id = public.readings.worker_id
    )
  );

-- ---- 4. Alerts Policies ----
CREATE POLICY "Worker own alerts select" ON public.alerts 
  FOR SELECT TO authenticated USING (auth.uid() = worker_id);

CREATE POLICY "Worker own alerts update" ON public.alerts 
  FOR UPDATE TO authenticated USING (auth.uid() = worker_id);

CREATE POLICY "Admin site alerts select" ON public.alerts 
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_p
      JOIN public.profiles worker_p ON worker_p.site_id = admin_p.site_id
      WHERE admin_p.id = auth.uid() AND admin_p.role = 'admin' AND worker_p.id = public.alerts.worker_id
    )
  );

CREATE POLICY "Admin site alerts update" ON public.alerts 
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_p
      JOIN public.profiles worker_p ON worker_p.site_id = admin_p.site_id
      WHERE admin_p.id = auth.uid() AND admin_p.role = 'admin' AND worker_p.id = public.alerts.worker_id
    )
  );

-- ---- 5. Shifts Policies ----
CREATE POLICY "Worker own shifts select" ON public.shifts 
  FOR SELECT TO authenticated USING (auth.uid() = worker_id);

CREATE POLICY "Worker own shifts update" ON public.shifts 
  FOR UPDATE TO authenticated USING (auth.uid() = worker_id);

CREATE POLICY "Worker own shifts insert" ON public.shifts 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Admin site shifts select" ON public.shifts 
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND site_id = public.shifts.site_id
    )
  );

CREATE POLICY "Admin site shifts update" ON public.shifts 
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND site_id = public.shifts.site_id
    )
  );

CREATE POLICY "Admin site shifts insert" ON public.shifts 
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND site_id = public.shifts.site_id
    )
  );

-- ============================================
-- SEED DATA
-- ============================================
INSERT INTO public.sites (name, location, zone) VALUES
('Rajput Brick Works', 'Uttar Pradesh, India', 'North Zone'),
('Sharma Kilns Pvt Ltd', 'Haryana, India', 'West Zone'),
('Bihar Brick Industries', 'Bihar, India', 'East Zone');
