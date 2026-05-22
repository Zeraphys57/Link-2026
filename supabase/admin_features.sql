-- LINK 2026 — Fitur Admin
-- Jalankan di Supabase SQL Editor SETELAH schema.sql.
-- Menambahkan: tabel pengaturan aplikasi (toggle global) + kebijakan admin.
--
-- Email admin di bawah harus sama dengan ADMIN_EMAIL di src/lib/admin.ts.

-- ====================
-- APP SETTINGS (toggle global)
-- ====================
create table if not exists public.app_settings (
  key text primary key,
  bool_value boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Baris untuk mode "sembunyikan soal Final" (peserta hanya lihat soal Challenge).
-- Default true = soal Final disembunyikan (sesuai kondisi saat ini).
insert into public.app_settings (key, bool_value)
values ('challenge_only', true)
on conflict (key) do nothing;

alter table public.app_settings enable row level security;

-- Semua orang boleh membaca pengaturan (peserta perlu tahu mode aktif).
drop policy if exists "app_settings_select_all" on public.app_settings;
create policy "app_settings_select_all" on public.app_settings
  for select using (true);

-- Hanya admin yang boleh mengubah pengaturan.
drop policy if exists "app_settings_update_admin" on public.app_settings;
create policy "app_settings_update_admin" on public.app_settings
  for update
  using (auth.jwt() ->> 'email' = 'bryanjacquellino5757@gmail.com')
  with check (auth.jwt() ->> 'email' = 'bryanjacquellino5757@gmail.com');

-- ====================
-- ADMIN: boleh mengedit soal panitia mana pun
-- (policy problems_update_panitia bawaan hanya untuk created_by = diri sendiri)
-- ====================
drop policy if exists "problems_update_admin" on public.problems;
create policy "problems_update_admin" on public.problems
  for update
  using (auth.jwt() ->> 'email' = 'bryanjacquellino5757@gmail.com')
  with check (auth.jwt() ->> 'email' = 'bryanjacquellino5757@gmail.com');

-- ====================
-- REALTIME
-- ====================
do $$
begin
  alter publication supabase_realtime add table public.app_settings;
exception when duplicate_object then null;
end $$;
