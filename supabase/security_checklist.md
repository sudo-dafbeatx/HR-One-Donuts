# Supabase Security Hardening - Deployment & Validation

## 1. SQL Migration Deployment

The file `supabase/migrations/20260226_security_hardening.sql` has been created.
Jalankan file SQL ini di Supabase SQL Editor atau deploy via Supabase CLI (`supabase db push`).
Migration ini akan otomatis:

1. Menambahkan `SET search_path = public` ke semua function yang bermasalah.
2. Mereset dan memperketat RLS policy (semua tabel admin-only khusus admin, tabel log khusus insert).

## 2. Leaked Password Protection & Password Strength

Pengaturan ini wajib dilakukan langsung dari Supabase Dashboard, karena merupakan konfigurasi Auth internal (bukan database schema).

**Langkah-langkah:**

1. Buka **Supabase Dashboard** -> Pilih Project.
2. Buka menu **Authentication** -> **Providers** -> **Email**.
3. Scroll ke bawah, cari bagian **Password requirements**.
4. Aktifkan/Centang opsi berikut:
   - **Enforce minimum password length**: Set ke **8**.
   - **Enforce password characters**: Pilih opsi kombinasi minimum 1 uppercase, 1 lowercase, 1 number, atau **"Alphanumeric"**.
   - _(Catatan: Fitur **"Enable leaked password protection"** hanya tersedia untuk paket Pro. Karena Anda menggunakan paket Gratis, abaikan saja toggle ini)_.
5. Klik **Save**.

## 3. Post-Deployment Validation Checklist

Setelah menjalankan SQL dan mengatur dashboard Auth, lakukan test berikut di website untuk memastikan tidak ada fitur yang rusak (Broken Access Control) atau RLS yang bocor:

### Test Public Access (Guest / Belum Login)

- [ ] Buka Homepage (`/`). Pastikan Hero, Featured Products, dan Reasons tampil normal (SELECT RLS works).
- [ ] Buka halaman Menu (`/catalog`). Pastikan daftar produk tampil normal.
- [ ] Buka DevTools (F12) -> Network. Pastikan request ke `traffic_logs` berhasil (Insert RLS works).
- [ ] Coba chat dengan Bot. Pastikan pertanyaan tersimpan tanpa error (Insert `bot_questions_log` works).

### Test Authenticated Access (User Biasa)

- [ ] Buat pesanan baru sampai ke tahap Invoice. Pastikan order tersimpan (Insert `orders` works).
- [ ] Buka halaman Profile -> Riwayat Pesanan. Pastikan hanya pesanan milik user tersebut yang muncul (Select `orders` works).

### Test Admin Access (Admin Account)

- [ ] Login menggunakan akun Admin.
- [ ] Buka Admin Panel -> Produk. Coba tambah, edit, dan hapus produk (Semua akses product works).
- [ ] Buka Admin Panel -> Pesanan. Pastikan admin bisa melihat _semua_ pesanan customer (Admin Select `orders` works).
- [ ] Ubah status pesanan customer lewat Admin Panel. Pastikan berhasil tersimpan (Admin Update `orders` works).

### Test Security Restriction (Negative Testing)

_Opsional tapi sangat disarankan. Bisa diuji via API/Postman:_

- [ ] Pastikan user biasa TIDAK BISA memanggil API DELETE ke tabel `products`.
- [ ] Pastikan saat mendaftar akun baru, password "123456" atau tanpa kombinasi karakter yang disyaratkan akan ditolak oleh sistem (Minimal 8 karakter & Alfanumerik).
