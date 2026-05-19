-- LINK 2026 Competitive Programming Competition
-- Run this in your Supabase SQL Editor

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ====================
-- TABLES
-- ====================

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('peserta', 'panitia')),
  display_name text not null,
  team_name text,
  created_at timestamptz not null default now()
);

create table public.problems (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  level text not null check (level in ('easy', 'medium', 'hard', 'super')),
  points integer not null check (points > 0),
  created_by uuid not null references public.profiles(id),
  created_by_name text not null,
  is_taken boolean not null default false,
  taken_by_team text,
  taken_by_user_id uuid references public.profiles(id),
  taken_at timestamptz,
  status text not null default 'available'
    check (status in ('available', 'in_progress', 'submitted', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

create table public.submissions (
  id uuid default uuid_generate_v4() primary key,
  problem_id uuid not null references public.problems(id),
  team_name text not null,
  user_id uuid not null references public.profiles(id),
  started_at timestamptz not null,
  submitted_at timestamptz,
  duration_seconds integer,
  graded_by uuid references public.profiles(id),
  graded_at timestamptz,
  verdict text check (verdict in ('accepted', 'rejected')),
  notes text,
  answer text,
  points_awarded integer,
  created_at timestamptz not null default now()
);

-- ====================
-- ROW LEVEL SECURITY
-- ====================

alter table public.profiles enable row level security;
alter table public.problems enable row level security;
alter table public.submissions enable row level security;

-- Profiles
create policy "profiles_select_all" on public.profiles
  for select using (true);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Problems
create policy "problems_select_all" on public.problems
  for select using (true);

create policy "problems_insert_panitia" on public.problems
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'panitia'
    )
  );

-- Peserta can claim available problems OR update their own in-progress/submitted problems
create policy "problems_update_peserta" on public.problems
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'peserta'
    ) and (
      (status = 'available' and is_taken = false) or
      taken_by_user_id = auth.uid()
    )
  );

-- Panitia can update problems they created (grade, reset on rejection)
create policy "problems_update_panitia" on public.problems
  for update using (
    created_by = auth.uid() and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'panitia'
    )
  );

-- Submissions
create policy "submissions_select_all" on public.submissions
  for select using (true);

create policy "submissions_insert_peserta" on public.submissions
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'peserta'
    )
  );

-- Peserta can update their own ungraded submissions (to add submitted_at)
create policy "submissions_update_peserta" on public.submissions
  for update using (
    auth.uid() = user_id and verdict is null
  );

-- Panitia can grade any submission
create policy "submissions_update_panitia" on public.submissions
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'panitia'
    )
  );

-- ====================
-- REALTIME
-- ====================

alter publication supabase_realtime add table public.problems;
alter publication supabase_realtime add table public.submissions;
