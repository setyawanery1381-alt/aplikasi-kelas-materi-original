# Panduan Migrasi: Google Apps Script ke Vercel Serverless

Aplikasi web **Portal Kelas & Materi By Sangcreator Tech** telah berhasil dimigrasikan dari arsitektur monolitik Google Apps Script (GAS) ke platform **Vercel (Serverless Functions + Static CDN Hosting)** menggunakan modul skill `sc-gas-to-vercel`.

---

## 🎯 Keuntungan Hasil Migrasi ke Vercel

1. **Kecepatan & Performa Instan**: Latensi pembukaan halaman < 100 ms (sebelumnya pada GAS 1,5–3 detik karena batasan runtime Apps Script).
2. **Tanpa Batas Kuota Eksekusi GAS**: Bebas dari timeout 6 menit bawaan Google Apps Script.
3. **Domain Kustom & SSL Otomatis**: Siap dipasangi domain sendiri (contoh: `portal.sangcreator.com`) dengan sertifikat HTTPS otomatis gratis.
4. **Strategi Zero-Friction (Drop-in Polyfill)**: Seluruh pemanggilan fungsi `google.script.run` dan endpoint API otomatis dialihkan ke endpoint serverless Vercel (`/api/rpc`) tanpa mengubah logic frontend.

---

## 📁 Struktur Berkas Hasil Migrasi

```text
├── api/
│   ├── rpc.js                 # Universal RPC Handler (Node.js Serverless)
│   └── helpers/
│       └── sheets.js          # Pengganti SpreadsheetApp (Google Sheets API v4)
├── public/                    # Seluruh aset frontend statis yang dilayani Vercel CDN
│   ├── index.html             # HTML bersih
│   ├── css/                   # Semua file CSS (app, base, v35, v36, v37, tw)
│   └── js/
│       ├── gas-client-adapter.js # Polyfill google.script.run
│       ├── cms-engine.js      # Data engine lokal & panel CMS revisi
│       ├── config.js          # Endpoint API /api/rpc
│       ├── core.js            # Router SPA, SWR caching, session
│       ├── member.js          # Modul area member
│       ├── public.js          # Modul katalog explore
│       └── admin*.js          # Seluruh modul superadmin
├── .env.example               # Template environment variables
├── .gitignore                 # Filter berkas kredensial & node_modules
├── vercel.json                # Konfigurasi routing & serverless rewrites
├── package.json               # Konfigurasi dependensi Node.js ES Module
├── server.js                  # Server lokal Node.js
└── README.md                  # Dokumentasi proyek
```

---

## 🚀 3 Cara Deploy ke Vercel

### Opsi A: Deploy Menggunakan Vercel CLI (Paling Cepat)
1. Buka terminal di folder proyek ini:
   ```bash
   npm i -g vercel
   ```
2. Jalankan perintah deploy:
   ```bash
   vercel
   ```
3. Ikuti panduan di layar terminal (tekan Enter untuk opsi default).
4. Untuk deploy ke domain produksi:
   ```bash
   vercel --prod
   ```

### Opsi B: Deploy Menggunakan GitHub & Vercel Dashboard
1. Buat repositori baru di GitHub (misal: `portal-kelas-sangcreator`).
2. Hubungkan dan push folder ini ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "Migrasi Google Apps Script ke Vercel"
   git branch -M main
   git remote add origin https://github.com/USERNAME/portal-kelas-sangcreator.git
   git push -u origin main
   ```
3. Buka dasbor [vercel.com](https://vercel.com) > **Add New...** > **Project**.
4. Pilih repositori GitHub Anda lalu klik **Deploy**.

---

## 🔑 Pengaturan Kredensial Database (Opsional jika pakai Google Sheets)

Jika ingin menghubungkan langsung ke Google Spreadsheet milik Anda:
1. Buat **Service Account** di [Google Cloud Console](https://console.cloud.google.com/).
2. Aktifkan **Google Sheets API**.
3. Unduh berkas kunci privat JSON Service Account.
4. Di dasbor Vercel (**Project Settings > Environment Variables**), tambahkan 3 variabel berikut:
   - `SPREADSHEET_ID`: ID spreadsheet dari URL Google Sheets Anda.
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Email Service Account (contoh: `sa@project.iam.gserviceaccount.com`).
   - `GOOGLE_PRIVATE_KEY`: Isi private key dari berkas JSON (termasuk tag `-----BEGIN PRIVATE KEY-----`).
5. **Penting**: Bagikan Google Spreadsheet Anda kepada email Service Account tersebut dengan hak akses **Editor**.

---

## 💻 Menjalankan Secara Lokal

Untuk menguji aplikasi di komputer lokal:
```bash
npm start
```
Buka browser di: `http://localhost:3000/#/home`

