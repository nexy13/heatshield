-- ============================================
-- HeatShield — Fix kiln_sites delete cascade
-- shifts.site_id and sos_events.site_id were created without an
-- ON DELETE action, so they default to NO ACTION (restrict). Every
-- other table referencing kiln_sites (workers, supervisors,
-- weather_readings, alerts, compliance_reports) cascades on delete;
-- these two didn't, which could block deleting a kiln site.
-- Safe to re-run.
-- ============================================

ALTER TABLE public.shifts DROP CONSTRAINT IF EXISTS shifts_site_id_fkey;
ALTER TABLE public.shifts
  ADD CONSTRAINT shifts_site_id_fkey
  FOREIGN KEY (site_id) REFERENCES public.kiln_sites(id) ON DELETE CASCADE;

ALTER TABLE public.sos_events DROP CONSTRAINT IF EXISTS sos_events_site_id_fkey;
ALTER TABLE public.sos_events
  ADD CONSTRAINT sos_events_site_id_fkey
  FOREIGN KEY (site_id) REFERENCES public.kiln_sites(id) ON DELETE CASCADE;
