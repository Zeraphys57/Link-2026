-- Multi-claim migration: shift from global problem lock to per-team state via submissions.
-- Run this ONCE in Supabase SQL Editor.

-- 1. Reset stale problem-level lock state.
--    The columns (status, is_taken, taken_by_*) stay in schema but the app no longer
--    reads/writes them. Reset to defaults so any UI that still reads them shows
--    a clean state. Leaderboard (which reads submissions) is unaffected.
update public.problems set
  is_taken         = false,
  taken_by_team    = null,
  taken_by_user_id = null,
  taken_at         = null,
  status           = 'available';

-- 2. Drop the obsolete RLS policy. Peserta no longer updates the problems table
--    on claim/submit. Keeping the policy isn't harmful, but removing it makes
--    the intent explicit.
drop policy if exists "problems_update_peserta" on public.problems;

-- 3. Sanity check — no rows should still report a global lock.
select count(*) as still_locked
from public.problems
where status <> 'available' or is_taken = true or taken_by_team is not null;
-- expected: still_locked = 0
