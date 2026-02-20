-- enable_realtime_notifications.sql
-- Memungkinkan Notifikasi Realtime pada App Next.js Admin

-- 1. Mengaktifkan Supabase Realtime Publication untuk tabel `orders`
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 2. Mengaktifkan Supabase Realtime Publication untuk tabel `profiles` 
-- (agar notifikasi pengguna baru juga bisa dikirim saat ada row ditambahkan)
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
