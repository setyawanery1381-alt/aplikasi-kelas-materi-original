# Produk Digital - By Sangcreator Tech

Website portal kelas, bootcamp, etalase pameran karya, dan area member materi digital (dengan branding **By Sangcreator Tech** dan panel CMS untuk merevisi seluruh konten secara live).

---

## 🌟 Fitur Utama & Tampilan Lengkap

1. **Area Member (Tampilan Persis Screenshot):**
   - **Sidebar Navigasi Kiri (`#msb`):**
     - **Belajar:** Beranda (`#/home`), Kelas Saya (`#/library`), Jalur Belajar (`#/jalur`), Bootcamp (`#/bootcamp`).
     - **Sumber Daya AI:** Master Prompt (`#/prompts`), Bank Skill (`#/skills`), Library Aplikasi (`#/apps`).
     - **Komunitas & Layanan:** Pameran Karya (`#/karya`), Tur Panduan, PIN & Keamanan.
     - **User Card:** Eko (`setyawanery1381@gmail.com`).
   - **Bilah Atas (Topbar):** Brand name, Breadcrumb `Beranda`, Tombol `Redeem Kode`, Toggle Dark/Light Mode, Logout, Avatar.
   - **Pita Pengumuman Biru:** Pengumuman terkini dengan tombol `[Lihat]` dan dismiss `[X]`.
   - **Hero Card:** Status *Profil Lengkap & Terverifikasi*, Salam *"Selamat datang kembali, Eko!"*, tombol *Lanjut Belajar* & *Katalog*.
   - **3 Stat Cards Interaktif:**
     - *Inventaris Akses:* 7 Produk Dimiliki (Siap dipelajari).
     - *Program Bootcamp:* 1 Bootcamp Aktif (Hadir 0/4).
     - *Status Pesanan:* 0 Menunggu (Tidak ada pesanan tertunda).
   - **Filter & Pencarian:** Tab *[Semua 8]*, *[Kelas 7]*, *[Dokumen 1]* dan kolom pencarian instan.
   - **Grid Materi & Produk:** 8 produk/kelas lengkap dengan badge *Dimiliki* / *Terkunci*, tag *KELAS* / *DOKUMEN*, dan thumbnail gambar.
   - **Kartu Profil Member Samping:** Profil Eko, WhatsApp, dan tombol *Pengaturan Akun*.

2. **Panel Revisi Admin (CMS Langsung di Browser):**
   - Terdapat tombol melayang **`[Revisi Website]`** di pojok kanan bawah.
   - Admin dapat mengubah **SECARA LANGSUNG**:
     - **Identitas & Header:** Nama Website, Slogan, No WhatsApp, Email, Link Toko Lynk.id, URL Logo, Judul & Subtitle.
     - **Pengumuman Beranda:** Aktifkan/nonaktifkan banner, ganti judul pengumuman, isi pesan, dan link YouTube/materi.
     - **Produk & Kelas (Materi):** Tambah materi baru, edit judul/harga/status (Dimiliki atau Terkunci)/gambar, atau hapus produk.
     - **Program Bootcamp:** Ubah nama batch, harga, kuota peserta, poster, dan nama 4 sesi pertemuan.
     - **Pameran Karya (Showcase):** Tambah & kurasi karya alumni/member.
     - **Data Profil Member:** Ganti nama, email, dan WhatsApp member.
   - Semua revisi tersimpan otomatis ke `localStorage` dan langsung diperbarui di layar tanpa restart!

3. **Selector Mode Cepat (Floating Bar):**
   - 👤 **Mode Member:** Melihat tampilan portal member Eko persis seperti di screenshot.
   - 🛠️ **Mode Superadmin:** Masuk ke panel kontrol admin lengkap (`admin.js`).
   - 🌐 **Mode Publik:** Melihat landing page katalog terbuka untuk pengunjung baru.

---

## 📁 Struktur Direktori

```text
├── index.html           # File utama portal SPA (Single Page Application)
├── vercel.json          # Konfigurasi deploy Vercel
├── package.json         # Konfigurasi project & npm start
├── server.js            # Local server ringan (Node.js)
├── css/
│   ├── base.css         # Styling dasar & variabel warna CSS
│   ├── app.css          # Desain komponen & layout portal
│   ├── v35.css          # Desain hero video, kartu interaktif, tema biru royal
│   ├── v36.css          # Kurikulum, timeline sesi bootcamp, showcase karya
│   ├── v37.css          # Sidebar member, tour guide, pustaka AI, dark mode
│   └── tw.css           # Tailwind CSS bundle
└── js/
    ├── config.js        # Konfigurasi endpoint Apps Script
    ├── cms-engine.js    # Engine data lokal, CMS Revisi Website & Interceptor
    ├── icons.js         # Lucide icons bundle (ringan & cepat)
    ├── core.js          # Core router SPA, session, modal, caching
    ├── public.js        # Modul landing page publik, checkout & redeem
    ├── member.js        # Modul area member, dashboard, katalog materi
    ├── custom.js        # Modul order aplikasi custom
    ├── v34.js, v36.js, v37.js # Modul ekstensi v3.4 - v3.7
    └── admin*.js        # Seluruh modul manajemen Superadmin & Admin
```

---

## 🚀 Cara Menjalankan

### Opsi 1: Menjalankan Server Lokal (Node.js)
Jalankan perintah berikut di terminal:
```bash
node server.js
```
Lalu buka browser Anda di:
`http://localhost:3000/#/home`

### Opsi 2: Buka Langsung Tanpa Server
Buka berkas `index.html` langsung di browser Chrome/Edge/Firefox favorit Anda.

---

## 🌐 Deploy ke Hosting Publik
- **Vercel:** Import folder ini ke dasbor Vercel atau jalankan `vercel --prod` via terminal.
- **GitHub Pages:** Unggah seluruh file ke branch `main` repositori GitHub Anda.
