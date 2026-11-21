/**
 * ============================================================
 * api/rpc.js — Universal RPC Handler Vercel Serverless
 * ============================================================
 * Menghandle:
 * 1. Panggilan dari google.script.run (via gas-client-adapter.js)
 * 2. Panggilan dari api() di core.js
 * 3. Integrasi ke Google Sheets Service Account / Forwarding ke Apps Script
 * ============================================================
 */
import { readSheet, appendSheet } from './helpers/sheets.js';

// Dataset default Sangcreator Tech
const DEFAULT_DATA = {
  settings: {
    appName: 'Produk Digital - By Sangcreator Tech',
    brandSubtitle: 'By Sangcreator Tech',
    appDescription: 'Akses terpusat untuk seluruh produk digital Anda.',
    logo: 'https://drive.google.com/thumbnail?id=1_MLvOoSYR-v-3nOw25H2hLCqEdY_kd6z&sz=w800',
    adminEmail: 'admin@sangcreator.com',
    adminWhatsApp: '081319894236',
    currency: 'IDR',
    exploreTitle: 'Aplikasi & Kelas Siap Pakai',
    exploreSubtitle: 'Lihat hasil aplikasi kami, ikuti kelas & bootcamp, lalu akses materinya di portal member.',
    lynkStoreUrl: 'https://lynk.id/sangcreatortech',
    waGroupUrl: 'https://chat.whatsapp.com/',
    customEnabled: true,
    customIntro: 'Butuh aplikasi berbasis Google Apps Script yang sesuai kebutuhan Anda? Ajukan di sini — kami bantu dari analisis sampai aplikasi siap dipakai.'
  },
  memberProfile: {
    fullName: 'Eko Setyawan',
    nickname: 'Eko',
    email: 'setyawanery1381@gmail.com',
    whatsapp: '081319894236',
    role: 'member',
    complete: true
  },
  announcement: {
    id: 'ann-1',
    title: 'PANDUAN MEMBER BARU MENGGUNAKAN KELAS (PORTAL BELAJAR)',
    content: 'Selamat datang di portal belajar Sangcreator Tech! Ikuti panduan kelas dan nikmati seluruh modul pembelajaran.',
    audience: 'all',
    link: 'https://youtube.com',
    active: true
  },
  bootcamp: {
    id: '1f5fed89-d22f-44ca-8871-95c4281f8b94',
    title: 'BootCamp Batch 2 (DESEMBER)',
    poster: 'https://drive.google.com/thumbnail?id=1SXGZK9Wd0z9vcQO6Jj4gnNmh5vVa8I_w&sz=w1000',
    schedule: '4x Pertemuan',
    description: 'Program Bootcamp Intensif pembuatan web app Google Apps Script tingkat lanjut.',
    priceLabel: 'Rp. 350.000',
    quotaLabel: '250',
    ctaLabel: 'Beli Token di Lynk.id',
    ctaUrl: 'https://lynk.id/sangcreatortech',
    status: 'Published',
    regOpen: true,
    accessMode: 'instant',
    sessions: [
      { id: 'smw6o4us90', no: 1, title: 'Pertemuan 1', attendedAt: '' },
      { id: 'smw6o4us91', no: 2, title: 'Pertemuan 2', attendedAt: '' },
      { id: 'smw6o4us92', no: 3, title: 'Pertemuan 3', attendedAt: '' },
      { id: 'smw6o4us93', no: 4, title: 'Pertemuan 4', attendedAt: '' }
    ]
  },
  catalog: [
    {
      Product_ID: 'p1',
      Title: 'METODE 2 | MENENGAH - Integrasi Google Apps Script ke GITHUB + Vercel [CLAUDE]',
      Category: 'Kelas',
      Price: 350000,
      owned: true,
      Image_URL: 'https://drive.google.com/thumbnail?id=1SXGZK9Wd0z9vcQO6Jj4gnNmh5vVa8I_w&sz=w800',
      Tagline: 'Belajar Integrasi Google Apps Script ke GITHUB + Vercel',
      Description: 'Panduan lengkap menghubungkan Google Apps Script dengan GitHub repository dan deploy otomatis ke Vercel.',
      checkoutOpen: true,
      Content_URL: 'https://drive.google.com'
    },
    {
      Product_ID: 'p2',
      Title: 'Cara Integrasi API Pihak Ketiga',
      Category: 'Kelas',
      Price: 250000,
      owned: false,
      Image_URL: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60',
      Tagline: 'INTEGRASI API DENGAN PIHAK KETIGA',
      Description: 'Integrasi Google Apps Script ke API eksternal: payment gateway, webhook WhatsApp, dsb.',
      checkoutOpen: true,
      Content_URL: 'https://drive.google.com'
    },
    {
      Product_ID: 'p3',
      Title: 'KUMPULAN PREFERENSI PRD (GRATIS)',
      Category: 'Document',
      Price: 0,
      owned: true,
      Image_URL: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60',
      Tagline: 'DOKUMEN PREFERENSI PRD',
      Description: 'Kumpulan referensi Product Requirements Document siap pakai untuk merancang aplikasi web modern.',
      checkoutOpen: true,
      Content_URL: 'https://drive.google.com'
    },
    {
      Product_ID: 'p4',
      Title: 'Kumpulan Video Cara Revisi & Upgrade',
      Category: 'Kelas',
      Price: 200000,
      owned: true,
      Image_URL: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
      Tagline: 'Tutorial Revisi & Upgrade Kode',
      Description: 'Video panduan cara melakukan perbaikan bug, penambahan fitur, dan refactoring aplikasi.',
      checkoutOpen: true,
      Content_URL: 'https://drive.google.com'
    },
    {
      Product_ID: 'p5',
      Title: 'METODE 1 | BASIC - Belajar GAS sangat Mudah [CLAUDE]',
      Category: 'Kelas',
      Price: 300000,
      owned: true,
      Image_URL: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop&q=60',
      Tagline: 'Dasar Google Apps Script Tanpa Pusing',
      Description: 'Belajar konsep fundamental Apps Script dari nol tanpa harus menguasai coding rumit sebelumnya.',
      checkoutOpen: true,
      Content_URL: 'https://drive.google.com'
    },
    {
      Product_ID: 'p6',
      Title: 'METODE 3 | LANJUTAN - Integrasi GAS ke Vercel [GEMINI]',
      Category: 'Kelas',
      Price: 350000,
      owned: true,
      Image_URL: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
      Tagline: 'Deploy Apps Script ke Vercel dengan Gemini AI',
      Description: 'Teknik menggunakan Gemini AI untuk mengubah web app GAS menjadi aplikasi modern di Vercel.',
      checkoutOpen: true,
      Content_URL: 'https://drive.google.com'
    },
    {
      Product_ID: 'p7',
      Title: 'MIGRASI ke SUPABASE',
      Category: 'Kelas',
      Price: 400000,
      owned: true,
      Image_URL: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=60',
      Tagline: 'Upgrade Database Google Sheets ke PostgreSQL Supabase',
      Description: 'Tingkatkan performa database web app Anda menggunakan Supabase PostgreSQL dengan RLS.',
      checkoutOpen: true,
      Content_URL: 'https://drive.google.com'
    },
    {
      Product_ID: 'p8',
      Title: 'METODE 3 | LANJUTAN - Integrasi GAS ke VERCEL [CLAUDE]',
      Category: 'Kelas',
      Price: 350000,
      owned: true,
      Image_URL: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=60',
      Tagline: 'Optimasi Frontend Apps Script ke Vercel dengan Claude',
      Description: 'Panduan lanjutan integrasi front-end modern ke infrastruktur serverless Vercel bersama Claude AI.',
      checkoutOpen: true,
      Content_URL: 'https://drive.google.com'
    }
  ],
  showcase: [
    {
      id: 'k1',
      title: 'SIM LAWFIRM',
      memberName: 'Fajar',
      profession: 'Operator',
      description: 'Sistem Informasi Manajemen Kantor Hukum berbasis Google Apps Script & Vercel.',
      image: 'https://drive.google.com/thumbnail?id=1yuelrxtAcMIm8md5q8RbKHErJaOKltDR&sz=w1000',
      demoUrl: 'https://example.com'
    },
    {
      id: 'k2',
      title: 'SIAKAD Sekolah Digital',
      memberName: 'Budi Santoso',
      profession: 'Guru & Admin TI',
      description: 'Aplikasi administrasi nilai, raport, dan presensi siswa sekolah berbasis spreadsheet.',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=60',
      demoUrl: 'https://example.com'
    },
    {
      id: 'k3',
      title: 'SIM-SPPD Desa Digital',
      memberName: 'Rahmat',
      profession: 'Perangkat Desa',
      description: 'Sistem pengelolaan surat perintah perjalanan dinas otomatis dengan cetak PDF instan.',
      image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=60',
      demoUrl: 'https://example.com'
    }
  ],
  prompts: [
    { id: 'pr1', title: 'Prompt Arsitektur GAS Fullstack', category: 'Coding', desc: 'Merancang PRD, database schema, dan fungsi GAS modular dalam 1 prompt.' },
    { id: 'pr2', title: 'Prompt Migrasi GAS ke Vercel', category: 'Deployment', desc: 'Mengubah index.html monolitik GAS menjadi modular HTML/CSS/JS untuk Vercel.' }
  ],
  skills: [
    { id: 'sk1', title: 'Skill sc-build-web', desc: 'Pembuat web app GAS & Stitch Design Fidelity otomatis.' },
    { id: 'sk2', title: 'Skill sc-gas-to-vercel', desc: 'Migrasi otomatis Google Apps Script ke Vercel.' }
  ],
  apps: [
    { id: 'ap1', title: 'Source Code Portal Member SPA', desc: 'Full template portal member & bootcamp siap pakai.' },
    { id: 'ap2', title: 'Source Code Form Pendaftaran & Checkout', desc: 'Alur checkout pembayaran transfer & aktivasi otomatis.' }
  ]
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const action = body.action || '';
  const payload = body.payload || [];
  const data = body.data || {};
  const token = body.token || '';

  try {
    // 1. Fungsi GAS Klasik (via google.script.run)
    if (action === 'ambilData') {
      const sheetName = payload[0] || 'Sheet1';
      const rows = await readSheet(sheetName);
      if (rows) return res.status(200).json({ data: rows });
      return res.status(200).json({ data: DEFAULT_DATA.catalog });
    }

    if (action === 'simpanData') {
      const [sheetName, barisData] = payload;
      const result = await appendSheet(sheetName, barisData);
      return res.status(200).json({ data: { sukses: true, result } });
    }

    // 2. Jika ada GAS_URL di Environment Variable dan ingin di-proxy
    if (process.env.GAS_URL && action !== 'memberBootstrap' && action !== 'publicBootstrap') {
      try {
        const gasRes = await fetch(process.env.GAS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action, token, data })
        });
        const gasJson = await gasRes.json();
        return res.status(200).json(gasJson);
      } catch (err) {
        console.warn('Proxy GAS gagal, menggunakan respon lokal:', err.message);
      }
    }

    // 3. Respon Data Portal Sangcreator Tech
    if (action === 'memberBootstrap') {
      return res.status(200).json({
        success: true,
        data: {
          settings: DEFAULT_DATA.settings,
          profile: DEFAULT_DATA.memberProfile,
          announcements: DEFAULT_DATA.announcement.active ? [DEFAULT_DATA.announcement] : [],
          catalog: DEFAULT_DATA.catalog,
          bootcamp: {
            mine: [
              {
                id: DEFAULT_DATA.bootcamp.id,
                title: DEFAULT_DATA.bootcamp.title,
                status: 'Disetujui',
                sessions: DEFAULT_DATA.bootcamp.sessions
              }
            ]
          },
          orders: [],
          showcase: DEFAULT_DATA.showcase
        }
      });
    }

    if (action === 'publicBootstrap') {
      return res.status(200).json({
        success: true,
        data: {
          settings: DEFAULT_DATA.settings,
          apps: DEFAULT_DATA.catalog.filter(p => p.Category === 'Aplikasi'),
          classes: DEFAULT_DATA.catalog.filter(p => p.Category === 'Kelas'),
          bootcamps: [DEFAULT_DATA.bootcamp],
          showcase: DEFAULT_DATA.showcase,
          stats: {
            members: 1042,
            products: DEFAULT_DATA.catalog.length,
            bootcamps: 1,
            karya: DEFAULT_DATA.showcase.length
          },
          testimonials: [
            { name: 'Budi Raharjo', role: 'Fullstack Dev', text: 'Materi sangat runut dan langsung bisa diterapkan untuk proyek nyata.' },
            { name: 'Siti Aminah', role: 'UI/UX Designer', text: 'Sangat terbantu dengan template dan panduan integrasi ke Vercel.' }
          ]
        }
      });
    }

    if (action === 'learningPaths') {
      return res.status(200).json({ success: true, data: { paths: [] } });
    }

    if (action === 'dashboard') {
      return res.status(200).json({
        success: true,
        data: {
          kpi: { members: 1042, products: DEFAULT_DATA.catalog.length, bootcamps: 1, pending: 0, revenue: 15400000 },
          recent: []
        }
      });
    }

    if (action === 'productsAdmin') {
      return res.status(200).json({ success: true, data: DEFAULT_DATA.catalog });
    }

    if (action === 'settingsAdmin') {
      return res.status(200).json({ success: true, data: DEFAULT_DATA.settings });
    }

    if (action === 'bootcampsAdmin') {
      return res.status(200).json({ success: true, data: [DEFAULT_DATA.bootcamp] });
    }

    if (action === 'announcementsAdmin') {
      return res.status(200).json({ success: true, data: [DEFAULT_DATA.announcement] });
    }

    if (action === 'showcaseAdmin') {
      return res.status(200).json({ success: true, data: DEFAULT_DATA.showcase });
    }

    if (action === 'ordersAdmin') {
      return res.status(200).json({ success: true, data: [], kpi: { pending: 0 } });
    }

    if (action === 'crm') {
      return res.status(200).json({
        success: true,
        data: [
          { Email: DEFAULT_DATA.memberProfile.email, FullName: DEFAULT_DATA.memberProfile.fullName, Phone: DEFAULT_DATA.memberProfile.whatsapp, Role: 'Member', Status: 'Active' }
        ]
      });
    }

    if (action === 'libraryAdmin') {
      return res.status(200).json({
        success: true,
        data: { prompts: DEFAULT_DATA.prompts, skills: DEFAULT_DATA.skills, apps: DEFAULT_DATA.apps }
      });
    }

    if (action === 'drain') {
      return res.status(200).json({ success: true, data: { left: 0 } });
    }

    if (action === 'productDetail') {
      const pid = (data && data.productId) || (payload && payload[0]) || '';
      const found = DEFAULT_DATA.catalog.find(p => p.Product_ID === pid) || DEFAULT_DATA.catalog[0];
      return res.status(200).json({
        success: true,
        data: Object.assign({}, found, {
          owned: true,
          episodes: [
            { id: 'ep-1', title: 'Modul 1: Panduan Memulai & Pengenalan', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'ep-2', title: 'Modul 2: Implementasi Langkah demi Langkah', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'ep-3', title: 'Modul 3: Konfigurasi & Optimalisasi', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
          ]
        })
      });
    }

    if (action === 'loginMemberPin' || action === 'loginMember' || action === 'login' || action === 'auth') {
      return res.status(200).json({
        success: true,
        message: 'Berhasil masuk ke portal member',
        data: {
          token: 'sct-demo-token-active',
          role: 'Customer',
          email: (data && data.email) || DEFAULT_DATA.memberProfile.email,
          name: DEFAULT_DATA.memberProfile.fullName,
          picture: ''
        }
      });
    }

    if (action === 'loginSuperadmin' || action === 'adminLogin') {
      return res.status(200).json({
        success: true,
        message: 'Berhasil masuk sebagai Superadmin',
        data: {
          token: 'sct-superadmin-token-active',
          role: 'Superadmin',
          email: 'admin@sangcreator.com',
          name: 'Superadmin Sangcreator',
          picture: ''
        }
      });
    }

    if (action === 'recoverAccount') {
      return res.status(200).json({
        success: true,
        message: 'PIN baru Anda: 123456. Silakan gunakan untuk masuk.',
        data: { hints: [DEFAULT_DATA.memberProfile.email] }
      });
    }

    // Default fallback
    return res.status(200).json({
      success: true,
      data: { message: `Aksi '${action}' berhasil diproses oleh Vercel Serverless.` }
    });
  } catch (err) {
    console.error('Serverless Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
}

