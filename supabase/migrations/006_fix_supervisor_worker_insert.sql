-- ============================================
-- HeatShield — Fix: supervisors could not add workers
-- ============================================
-- createWorker() / bulkInsertWorkers() (src/lib/api/workers.ts) create a
-- profile-only row in public.users for each worker (no auth account —
-- see WorkerIntakeForm's "No Auth Accounts Created" note) before writing
-- to public.workers. The only INSERT policy on public.users was
-- "auth.uid() = id OR is_admin()", so a supervisor creating a new worker
-- (a fresh UUID that isn't their own auth.uid()) was rejected by RLS —
-- breaking both the manual form and CSV bulk import for every supervisor.
--
-- This adds a narrow INSERT policy: a supervisor may only insert a
-- role='worker' user row scoped to a site they actually supervise.

DROP POLICY IF EXISTS "supervisors_insert_site_workers" ON public.users;

CREATE POLICY "supervisors_insert_site_workers" ON public.users
  FOR INSERT WITH CHECK (
    role = 'worker'
    AND site_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.supervisors s
      WHERE s.user_id = auth.uid() AND s.site_id = users.site_id
    )
  );
