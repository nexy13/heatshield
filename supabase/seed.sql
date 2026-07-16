-- ============================================
-- HeatShield AI — Seed Data
-- Run this AFTER 001_initial_schema.sql
-- ============================================

-- Sample Kiln Sites
INSERT INTO public.kiln_sites (id, name, address, latitude, longitude, region, status) VALUES
  ('aaaa0001-0001-0001-0001-000000000001', 'Rajput Brick Works', 'Village Kheri, Firozabad, UP', 27.1534, 78.3957, 'Uttar Pradesh', 'active'),
  ('aaaa0001-0001-0001-0001-000000000002', 'Sharma Kilns Pvt Ltd', 'Bahadurgarh Road, Jhajjar, HR', 28.6925, 76.6536, 'Haryana', 'active'),
  ('aaaa0001-0001-0001-0001-000000000003', 'Bihar Brick Industries', 'Muzaffarpur-Patna Highway, BR', 26.1209, 85.3647, 'Bihar', 'active')
ON CONFLICT DO NOTHING;

-- Sample Weather Readings
INSERT INTO public.weather_readings (site_id, temperature_c, humidity_pct, heat_index, wind_speed_kmh, condition, risk_level, recorded_at) VALUES
  ('aaaa0001-0001-0001-0001-000000000001', 42.5, 55.0, 51.2, 8.5, 'Haze', 'extreme', NOW() - INTERVAL '30 minutes'),
  ('aaaa0001-0001-0001-0001-000000000001', 43.1, 58.0, 53.4, 6.2, 'Haze', 'danger', NOW() - INTERVAL '15 minutes'),
  ('aaaa0001-0001-0001-0001-000000000001', 44.0, 52.0, 52.8, 7.0, 'Clear', 'danger', NOW()),
  ('aaaa0001-0001-0001-0001-000000000002', 38.5, 45.0, 41.2, 12.0, 'Partly Cloudy', 'extreme', NOW()),
  ('aaaa0001-0001-0001-0001-000000000003', 35.2, 70.0, 43.5, 5.0, 'Humid', 'extreme', NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- NOTE: Workers, supervisors, and shifts require
-- auth.users entries. Create users via Supabase Auth
-- (sign up flow) first, then their profiles will be
-- auto-created by the handle_new_user() trigger.
--
-- For testing, manually insert into public.users:
-- ============================================

-- DONE!
