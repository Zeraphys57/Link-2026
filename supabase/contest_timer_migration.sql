-- LINK 2026 — Timer Kompetisi
-- Jalankan di Supabase SQL Editor SETELAH schema.sql dan admin_features.sql.
-- Menambahkan kolom ts_value + int_value ke app_settings, lalu seed row contest_timer.

alter table public.app_settings
  add column if not exists ts_value timestamptz;

alter table public.app_settings
  add column if not exists int_value integer;

-- Seed default: durasi 4 jam (14400 detik). Belum dimulai (ts_value null).
insert into public.app_settings (key, int_value)
values ('contest_timer', 14400)
on conflict (key) do nothing;
