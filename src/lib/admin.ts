// Akun panitia yang berperan sebagai ADMIN. Hanya akun ini yang bisa:
// - melihat & menilai/mengedit soal panitia lain
// - mengaktifkan/menonaktifkan mode "sembunyikan soal Final"
//
// Catatan: nilai email ini juga dipakai di supabase/admin_features.sql
// (RLS policy). Kalau email admin berubah, ubah di KEDUA tempat.
export const ADMIN_EMAIL = 'bryanjacquellino5757@gmail.com'

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && email.trim().toLowerCase() === ADMIN_EMAIL
}
