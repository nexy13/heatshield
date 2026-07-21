-- ============================================
-- HeatShield — Workers are profile-only (no public.users row)
-- ============================================
-- Root cause of "Failed to save worker" (manual + bulk import):
-- the old worker API wrote a row into public.users for every worker, but
-- public.users has TWO constraints that make that impossible by design:
--   1. CHECK (role IN ('supervisor','admin'))  -> rejects role='worker' (23514)
--   2. FK users_id_fkey: users.id REFERENCES auth.users(id)
--      -> rejects the random UUID of a worker who has no auth login (23503)
--
-- public.users is reserved for auth-backed platform accounts (admin /
-- supervisor), created via Supabase Auth signup. Workers are field laborers
-- with no login ("No Auth Accounts Created" on the intake form) and now live
-- ONLY in public.workers — which already holds all their data and is what
-- every other table (shifts, alerts, sos_events, health/hydration logs)
-- references. The fix is in src/lib/api/workers.ts; no schema change to
-- users is needed, so its constraints stay intact for real accounts.
--
-- This drops the interim policy from 006, which tried to let supervisors
-- INSERT worker rows into public.users. It is now unnecessary (we never do
-- that) and was in any case inert — such an insert still failed the
-- role CHECK and the auth.users FK above.

DROP POLICY IF EXISTS "supervisors_insert_site_workers" ON public.users;

-- Ask PostgREST to reload its schema cache immediately.
NOTIFY pgrst, 'reload schema';
