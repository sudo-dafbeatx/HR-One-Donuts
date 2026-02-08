# 💰 Payment Protection System - Developer Guide

## 📋 Cara Kerja

Website ini dilengkapi dengan **payment protection system** yang secara otomatis akan:

1. Menampilkan halaman "License Expired" jika melewati tanggal pembayaran
2. Memblokir akses ke seluruh website
3. Mengarahkan user untuk menghubungi developer

## 🔧 Cara Update Setelah Client Bayar

### Opsi 1: Edit File Middleware (Hardcoded)

**File:** `src/middleware.ts`

```typescript
// Ubah tanggal ini setelah client bayar
const NEXT_PAYMENT_DUE = new Date("2026-03-14"); // ⬅️ UPDATE INI
```

**Workflow:**

```bash
# 1. Edit file
# 2. Commit & push
git add src/middleware.ts
git commit -m "Update payment due date to March 2026"
git push origin main

# 3. Redeploy di Vercel
# (Auto-deploy jika sudah connect GitHub)
```

### Opsi 2: Environment Variable (Vercel)

> **Note:** Opsi ini untuk future improvement. Saat ini menggunakan Opsi 1.

1. Login ke Vercel Dashboard
2. Pilih project "HR-One-Donuts"
3. Settings → Environment Variables
4. Update `NEXT_PAYMENT_DUE` → `2026-03-14`
5. Redeploy

## 📅 Schedule Pembayaran Bulanan

| Bulan    | Due Date   | Action After Payment   |
| -------- | ---------- | ---------------------- |
| Feb 2026 | 2026-02-14 | Update ke `2026-03-14` |
| Mar 2026 | 2026-03-14 | Update ke `2026-04-14` |
| Apr 2026 | 2026-04-14 | Update ke `2026-05-14` |
| ...      | ...        | ...                    |

## 🚨 Emergency: Client Tidak Bayar

**Website akan otomatis disable pada tanggal due date.**

Tidak perlu action apa-apa, sistem akan otomatis:

1. Redirect ke `/license-expired`
2. Tampilkan pesan pembayaran
3. Berikan kontak developer (WhatsApp/Email)

## ✅ Testing Sebelum Deploy

```bash
# 1. Set tanggal kemarin untuk testing
# src/middleware.ts
const NEXT_PAYMENT_DUE = new Date('2026-02-07'); // Yesterday

# 2. Run dev server
npm run dev

# 3. Buka browser → http://localhost:3000
# Harus redirect ke /license-expired

# 4. Restore tanggal yang benar sebelum push
const NEXT_PAYMENT_DUE = new Date('2026-02-14');
```

## 📝 Customization

### Update Kontak Developer

**File:** `src/app/license-expired/page.tsx`

```typescript
// WhatsApp
href = "https://wa.me/6285810658117?text=...";

// Email
href = "mailto:developer@youremail.com?subject=...";
```

### Update Pesan

Edit file `src/app/license-expired/page.tsx`:

- Ubah teks peringatan
- Ubah icon
- Ubah warna theme

## 🔒 Keamanan

### Jangan Kasih Akses ke:

- ❌ File `src/middleware.ts`
- ❌ Vercel dashboard
- ❌ GitHub repository (set private)
- ❌ Environment variables

### Yang Aman Dikasih ke Client:

- ✅ Production URL website
- ✅ Admin login credentials (Supabase)
- ✅ Tutorial cara pakai

## 🎯 Tips

1. **Reminder untuk Client:** Set calendar reminder H-3 sebelum due date untuk tagih client
2. **Proof of Payment:** Minta bukti transfer sebelum extend license
3. **Contract:** Buat kontrak tertulis tentang payment terms
4. **Auto-Invoice:** Gunakan payment gateway untuk auto-recurring billing (future)

## 💡 Future Improvements

- [ ] Remote license server (agar tidak perlu redeploy)
- [ ] Grace period 3 hari (warning dulu, baru disable)
- [ ] Email notification auto ke client H-7 sebelum expire
- [ ] Integration dengan payment gateway (Midtrans/Xendit)
- [ ] License key validation dari database

## 🆘 Troubleshooting

**Q: Website masih bisa diakses padahal sudah expired**

- Clear browser cache
- Check tanggal server (bukan local time)
- Verify deployment completed di Vercel

**Q: Client komplain tidak bisa akses setelah bayar**

- Pastikan sudah update NEXT_PAYMENT_DUE
- Pastikan sudah redeploy
- Check Vercel deployment logs

**Q: Ingin disable protection sementara**

```typescript
// src/middleware.ts
// Comment bagian ini:
// if (currentDate >= NEXT_PAYMENT_DUE) {
//   return NextResponse.redirect(new URL('/license-expired', request.url));
// }
```

---

**Developer:** Your Name  
**Contact:** your-whatsapp | your-email  
**Last Updated:** Feb 8, 2026
