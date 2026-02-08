# 🚀 Vercel Deployment + License Control

## 📋 Step-by-Step Deploy ke Vercel

### 1. Deploy Website

1. Buka https://vercel.com
2. Login dengan GitHub account `sudo-dafbeatx`
3. Klik **"Add New Project"**
4. Import repository: `sudo-dafbeatx/HR-One-Donuts`
5. Configure Project:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### 2. Setup Environment Variables

Di halaman **Environment Variables**, tambahkan:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://tevgavoyeisjrjksxbme.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_nffQJkQhRKc54390s5UoEA_wiNsJvaj

# WhatsApp (Optional)
NEXT_PUBLIC_WHATSAPP_PHONE=62895351251395

# License Control (CRITICAL - Default ACTIVE)
LICENSE_STATUS=ACTIVE
```

6. Klik **"Deploy"**
7. Tunggu 2-3 menit
8. Website live! 🎉

---

## 🔒 Cara Enable/Disable Website (Sekali Klik)

### ❌ Untuk DISABLE Website (Client belum bayar)

1. Login ke Vercel: https://vercel.com
2. Pilih project **"HR-One-Donuts"**
3. Klik tab **"Settings"**
4. Klik menu **"Environment Variables"**
5. Cari variable **`LICENSE_STATUS`**
6. Klik **"Edit"**
7. Ubah value dari `ACTIVE` → `EXPIRED`
8. Klik **"Save"**
9. Klik tab **"Deployments"**
10. Klik tombol **"Redeploy"** (icon 3 titik di deployment teratas)
11. **DONE!** Website langsung block dalam 1-2 menit

### ✅ Untuk ENABLE Website (Client sudah bayar)

1. Login ke Vercel
2. Pilih project **"HR-One-Donuts"**
3. Settings → Environment Variables
4. Edit `LICENSE_STATUS`
5. Ubah dari `EXPIRED` → `ACTIVE`
6. Save
7. Redeploy
8. **DONE!** Website langsung aktif lagi

---

## 🎯 Total Waktu: 30 Detik!

**Client TIDAK TAHU:**

- ❌ Client tidak punya akses Vercel dashboard
- ❌ Client tidak bisa lihat environment variables
- ❌ Client tidak bisa deploy sendiri
- ❌ Variable `LICENSE_STATUS` tidak terlihat di code

**Anda FULL CONTROL:**

- ✅ Hanya Anda yang bisa enable/disable
- ✅ Disable tanpa perlu edit code
- ✅ Enable kembali instant setelah client bayar
- ✅ Client hanya lihat website jadi aktif/nonaktif

---

## 📱 Workflow Bulanan

```
Day 1-13: Website ACTIVE (LICENSE_STATUS=ACTIVE)
Day 14:   Client belum bayar? → Set LICENSE_STATUS=EXPIRED → Redeploy
          Website langsung block!

Client WA: "Mas, website tidak bisa dibuka!"
Anda:      "Silakan bayar dulu Rp XXX untuk bulan ini"

Client:    Transfer bukti pembayaran
Anda:      Vercel → LICENSE_STATUS=ACTIVE → Redeploy
          "Sudah aktif kembali Pak/Bu"
```

---

## 🔧 Advanced: Auto-Disable dengan GitHub Actions (Optional)

Jika ingin lebih otomatis:

1. Buat GitHub Actions yang jalan setiap tanggal 14
2. Action otomatis update `LICENSE_STATUS=EXPIRED` via Vercel API
3. Website auto-disable setiap tanggal 14

**File:** `.github/workflows/auto-disable.yml`

```yaml
name: Auto Disable License
on:
  schedule:
    - cron: "0 0 14 * *" # Setiap tanggal 14, jam 00:00 UTC
  workflow_dispatch: # Manual trigger

jobs:
  disable:
    runs-on: ubuntu-latest
    steps:
      - name: Disable License via Vercel API
        run: |
          # Call Vercel API to update env variable
          # (Need Vercel API token)
```

---

## 🆘 Troubleshooting

**Q: Setelah edit env variable, website masih aktif?**

- Pastikan sudah **Redeploy** (bukan hanya save)
- Vercel butuh redeploy untuk apply env changes

**Q: Cara kasih akses Vercel ke client?**

- **JANGAN!** Kalau client punya akses, mereka bisa aktifkan sendiri
- Cukup kasih production URL saja

**Q: Client minta source code di GitHub?**

- Set repo ke **Private** (Settings → Danger Zone → Change visibility)
- Atau fork repo, kasih fork yang sudah di-clean (tanpa middleware)

**Q: CLIENT TIDAK BOLEH TAHU sistem license ini ada**

- ✅ Jangan share file `VERCEL_SETUP.md` ini
- ✅ Jangan share access Vercel
- ✅ Jangan commit `DEVELOPER_GUIDE.md` ke repo client
- ✅ File `middleware.ts` terlihat innocent (pakai env variable)

---

## 🎁 Bonus: Custom Domain

Setelah deploy, atur custom domain client:

1. Vercel Dashboard → Settings → Domains
2. Add domain: `donatkeluarga.com`
3. Update DNS di domain provider (ikuti instruksi Vercel)
4. Done! Website live di domain client

**Tapi ingat:** Domain tetap di bawah Vercel account Anda, bukan client!

---

**Deploy sekarang, kontrol selamanya!** 🚀
