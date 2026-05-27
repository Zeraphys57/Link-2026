-- LINK 2026 — Leaderboard hide toggle (admin-only)
-- Jalankan di Supabase SQL Editor SETELAH admin_features.sql.
--
-- Menambahkan satu row di app_settings: `leaderboard_hidden`.
-- - false (default) = leaderboard terlihat oleh peserta seperti biasa.
-- - true  = tab Leaderboard di dashboard peserta menampilkan placeholder
--   "dikunci panitia" — biar surprise di akhir lomba sementara panitia
--   masih menyelesaikan koreksi.
--
-- Panitia & admin TETAP melihat leaderboard penuh apa pun nilai toggle ini.
-- RLS untuk update di-handle oleh policy `app_settings_update_admin` yang
-- sudah dibuat di admin_features.sql — tidak perlu policy baru.

insert into public.app_settings (key, bool_value)
values ('leaderboard_hidden', false)
on conflict (key) do nothing;
