/**
 * ============================================================
 * cms-engine.js — Engine Data & Panel Revisi Admin Sangcreator Tech
 * ============================================================
 * Menyediakan:
 * 1. Mock/Local Network Interceptor untuk GAS API
 * 2. Area Member (tampilan persis screenshot Eko dengan sidebar menu lengkap)
 * 3. Mode Admin untuk merevisi SEMUA konten website secara live & tersimpan permanen
 * 4. Branding baru: "By Sangcreator Tech"
 * ============================================================
 */

(function () {
  const CMS_KEY = 'sct_portal_cms_data_v2';

  // 1. DATA DEFAULT PERSIS SEPERTI SCREENSHOT
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
      role: 'Customer',
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
      ],
      v36: {
        summary: '',
        highlightLabel: 'BATCH 2',
        outline: [
          { id: 'smw6o4us90', no: 1, title: 'Pertemuan 1', materials: 1, tasks: 0 },
          { id: 'smw6o4us91', no: 2, title: 'Pertemuan 2', materials: 0, tasks: 0 },
          { id: 'smw6o4us92', no: 3, title: 'Pertemuan 3', materials: 0, tasks: 0 },
          { id: 'smw6o4us93', no: 4, title: 'Pertemuan 4', materials: 0, tasks: 0 }
        ],
        family: '1f5fed89-d22f-44ca-8871-95c4281f8b94',
        totalMaterials: 1,
        totalTasks: 0,
        ended: false,
        hasCert: true
      }
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

  // 2. CMS OBJECT
  window.CMS = {
    data: null,

    init() {
      try {
        const raw = localStorage.getItem(CMS_KEY);
        if (raw) {
          this.data = JSON.parse(raw);
        } else {
          this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
          this.save();
        }
      } catch (e) {
        this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      }

      if (!this.data.settings.appName.includes('Sangcreator')) {
        this.data.settings.appName = 'Produk Digital - By Sangcreator Tech';
        this.data.settings.brandSubtitle = 'By Sangcreator Tech';
        this.save();
      }

      // Set tema default gelap seperti di screenshot
      try {
        if (!localStorage.getItem('dph3:theme')) {
          localStorage.setItem('dph3:theme', JSON.stringify('dark'));
        }
      } catch (e) { /* */ }

      // Pastikan ada sesi awal (member Eko - Customer)
      let s = null;
      try {
        const v = localStorage.getItem('dph3:session');
        if (v) s = JSON.parse(v);
      } catch (e) { /* */ }

      if (!s || !s.role || s.role === 'member') {
        const initSession = {
          token: 'sct-demo-token-active',
          role: 'Customer',
          email: this.data.memberProfile.email,
          name: this.data.memberProfile.fullName,
          picture: ''
        };
        try { localStorage.setItem('dph3:session', JSON.stringify(initSession)); } catch (e) {}
      }

      // Default route ke #/home jika belum ada hash atau tersasar ke #/login
      if (!location.hash || location.hash === '#' || location.hash === '#/' || location.hash === '#/login') {
        location.hash = '#/home';
      }

      this.installNetworkHook();
      this.applyData();
      this.injectControls();
    },

    save() {
      try {
        localStorage.setItem(CMS_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.warn('Gagal menyimpan CMS data:', e);
      }
    },

    resetToDefault() {
      if (confirm('Kembalikan semua konten ke pengaturan default By Sangcreator Tech?')) {
        this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        this.save();
        this.applyData();
        if (typeof showToast === 'function') showToast('Reset Berhasil', 'Data kembali ke default Sangcreator Tech.', 'success');
        setTimeout(() => location.reload(), 400);
      }
    },

    applyData() {
      const d = this.data;
      if (!d) return;

      if (typeof AppState !== 'undefined') {
        // Data Member
        AppState.m = AppState.m || {};
        AppState.m.settings = d.settings;
        AppState.m.profile = d.memberProfile;
        AppState.m.announcements = d.announcement.active ? [d.announcement] : [];
        AppState.m.catalog = d.catalog;
        AppState.m.bootcamp = {
          mine: [
            {
              id: '1f5fed89-d22f-44ca-8871-95c4281f8b94',
              title: d.bootcamp.title,
              status: 'Disetujui',
              sessions: d.bootcamp.sessions
            }
          ]
        };
        AppState.m.orders = [];
        AppState.m.showcase = d.showcase;

        // Data Publik
        AppState.pub = AppState.pub || {};
        AppState.pub.settings = d.settings;
        AppState.pub.apps = d.catalog.filter(p => p.Category === 'Aplikasi');
        AppState.pub.classes = d.catalog.filter(p => p.Category === 'Kelas');
        AppState.pub.bootcamps = [d.bootcamp];
        AppState.pub.showcase = d.showcase;
        AppState.pub.stats = {
          members: 1042,
          products: d.catalog.length,
          bootcamps: 1,
          karya: d.showcase.length
        };

        // Data Admin
        AppState.a = AppState.a || {};
        AppState.a.settingsAdmin = d.settings;
        AppState.a.productsAdmin = d.catalog;
        AppState.a.bootcampsAdmin = [d.bootcamp];
        AppState.a.announcementsAdmin = [d.announcement];
        AppState.a.showcaseAdmin = d.showcase;

        try { localStorage.setItem('dph3:brandName', JSON.stringify(d.settings.appName)); } catch (e) {}
        document.title = d.settings.appName;
      }
    },

    installNetworkHook() {
      const origFetch = window.fetch;
      const self = this;

      window.fetch = async function (url, opts) {
        const urlStr = String(url || '');
        if (urlStr.includes('script.google.com') && opts && opts.method === 'POST') {
          let body = {};
          try { body = JSON.parse(opts.body); } catch (e) {}
          const act = body.action || '';
          const mockRes = self.handleApiAction(act, body.data || {}, body.token || '');
          if (mockRes) {
            return new Response(JSON.stringify(mockRes), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        return origFetch.apply(this, arguments);
      };
    },

    handleApiAction(action, data, token) {
      const d = this.data;

      if (action === 'memberBootstrap') {
        return {
          success: true,
          data: {
            settings: d.settings,
            profile: d.memberProfile,
            announcements: d.announcement.active ? [d.announcement] : [],
            catalog: d.catalog,
            bootcamp: {
              mine: [
                {
                  id: '1f5fed89-d22f-44ca-8871-95c4281f8b94',
                  title: d.bootcamp.title,
                  status: 'Disetujui',
                  sessions: d.bootcamp.sessions
                }
              ]
            },
            orders: [],
            showcase: d.showcase
          }
        };
      }

      if (action === 'publicBootstrap') {
        return {
          success: true,
          data: {
            settings: d.settings,
            apps: d.catalog.filter(p => p.Category === 'Aplikasi'),
            classes: d.catalog.filter(p => p.Category === 'Kelas'),
            bootcamps: [d.bootcamp],
            showcase: d.showcase,
            stats: { members: 1042, products: d.catalog.length, bootcamps: 1, karya: d.showcase.length },
            testimonials: [
              { name: 'Budi Raharjo', role: 'Fullstack Dev', text: 'Materi sangat runut dan langsung bisa diterapkan untuk proyek nyata.' },
              { name: 'Siti Aminah', role: 'UI/UX Designer', text: 'Sangat terbantu dengan template dan panduan integrasi ke Vercel.' }
            ]
          }
        };
      }

      if (action === 'learningPaths') {
        return { success: true, data: { paths: [] } };
      }

      if (action === 'dashboard') {
        return {
          success: true,
          data: {
            kpi: { members: 1042, products: d.catalog.length, bootcamps: 1, pending: 0, revenue: 15400000 },
            recent: []
          }
        };
      }

      if (action === 'productsAdmin') {
        return { success: true, data: d.catalog };
      }

      if (action === 'settingsAdmin') {
        return { success: true, data: d.settings };
      }

      if (action === 'bootcampsAdmin') {
        return { success: true, data: [d.bootcamp] };
      }

      if (action === 'announcementsAdmin') {
        return { success: true, data: [d.announcement] };
      }

      if (action === 'showcaseAdmin') {
        return { success: true, data: d.showcase };
      }

      if (action === 'ordersAdmin') {
        return { success: true, data: [], kpi: { pending: 0 } };
      }

      if (action === 'crm') {
        return {
          success: true,
          data: [
            { Email: d.memberProfile.email, FullName: d.memberProfile.fullName, Phone: d.memberProfile.whatsapp, Role: 'Member', Status: 'Active' }
          ]
        };
      }

      if (action === 'libraryAdmin') {
        return { success: true, data: { prompts: d.prompts, skills: d.skills, apps: d.apps } };
      }

      if (action === 'drain') {
        return { success: true, data: { left: 0 } };
      }

      // Simpan aksi admin
      if (action === 'productSave') {
        const p = data.product;
        if (p) {
          const idx = d.catalog.findIndex(x => x.Product_ID === p.Product_ID);
          if (idx >= 0) d.catalog[idx] = Object.assign(d.catalog[idx], p);
          else d.catalog.unshift(p);
          this.save();
          this.applyData();
        }
        return { success: true, message: 'Produk berhasil disimpan' };
      }

      if (action === 'settingsSave') {
        Object.assign(d.settings, data.settings || {});
        this.save();
        this.applyData();
        return { success: true, message: 'Pengaturan berhasil disimpan' };
      }

      return null;
    },

    switchMode(mode) {
      if (mode === 'member') {
        const s = {
          token: 'sct-demo-token-active',
          role: 'Customer',
          email: this.data.memberProfile.email,
          name: this.data.memberProfile.fullName,
          picture: ''
        };
        try { localStorage.setItem('dph3:session', JSON.stringify(s)); } catch (e) {}
        AppState.role = 'Customer';
        AppState.token = 'sct-demo-token-active';
        AppState.email = this.data.memberProfile.email;
        AppState.name = this.data.memberProfile.fullName;
        if (typeof showToast === 'function') showToast('Mode Member Aktif', 'Beralih ke tampilan Member Portal.', 'info');
        go('home');
      } else if (mode === 'admin') {
        const s = {
          token: 'sct-admin-token-active',
          role: 'Superadmin',
          email: 'admin@sangcreator.com',
          name: 'Super Admin Sangcreator',
          picture: ''
        };
        try { localStorage.setItem('dph3:session', JSON.stringify(s)); } catch (e) {}
        AppState.role = 'Superadmin';
        AppState.token = 'sct-admin-token-active';
        AppState.email = 'admin@sangcreator.com';
        AppState.name = 'Super Admin Sangcreator';
        if (typeof showToast === 'function') showToast('Mode Admin Aktif', 'Beralih ke Panel Superadmin.', 'info');
        go('admin/dashboard');
      } else if (mode === 'public') {
        try { localStorage.removeItem('dph3:session'); } catch (e) {}
        AppState.role = null;
        AppState.token = null;
        if (typeof showToast === 'function') showToast('Mode Publik Aktif', 'Beralih ke Halaman Depan / Explore.', 'info');
        go('explore');
      }
      setTimeout(() => location.reload(), 300);
    },

    openEditor(tab) {
      this.renderEditorModal(tab || 'identity');
    },

    renderEditorModal(activeTab) {
      let modal = document.getElementById('sctCmsModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'sctCmsModal';
        modal.className = 'modal-backdrop is-open';
        document.body.appendChild(modal);
      }
      modal.hidden = false;

      const d = this.data;
      const tabs = [
        { id: 'identity', label: 'Identitas & Header', icon: 'building-2' },
        { id: 'announcement', label: 'Pengumuman Beranda', icon: 'megaphone' },
        { id: 'products', label: 'Produk & Kelas (' + d.catalog.length + ')', icon: 'package' },
        { id: 'bootcamp', label: 'Program Bootcamp', icon: 'calendar' },
        { id: 'showcase', label: 'Pameran Karya', icon: 'trophy' },
        { id: 'profile', label: 'Profil Member (Eko)', icon: 'user' }
      ];

      modal.innerHTML = `
        <div class="modal-panel" style="max-width:850px;max-height:92vh;display:flex;flex-direction:column;border-radius:18px;box-shadow:0 25px 60px rgba(0,0,0,0.5);border:1px solid rgba(59,130,246,0.3)">
          <div class="modal-head" style="background:#1E293B;border-bottom:1px solid #334155;padding:16px 20px;">
            <div class="flex items-center gap-3">
              <span style="background:#2563EB;color:#fff;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:700;">CMS ADMIN</span>
              <div>
                <h3 class="text-base font-bold text-white">Revisi Konten Website · By Sangcreator Tech</h3>
                <p class="text-xs text-slate-400">Edit seluruh teks, materi, pengumuman, dan gambar secara instan.</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="btn-ghost !py-1 !px-2.5 text-xs text-amber-400 border border-amber-500/30 hover:bg-amber-500/10" onclick="CMS.resetToDefault()">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Reset Default
              </button>
              <button type="button" class="icon-btn" onclick="document.getElementById('sctCmsModal').hidden=true" aria-label="Tutup"><i data-lucide="x" class="w-5 h-5 text-white"></i></button>
            </div>
          </div>

          <div style="background:#0F172A;border-bottom:1px solid #334155;padding:8px 16px;display:flex;gap:6px;overflow-x:auto;">
            ${tabs.map(t => `
              <button type="button" class="btn-ghost !text-xs !py-1.5 !px-3" style="${activeTab === t.id ? 'background:#2563EB;color:#fff;font-weight:600;' : 'color:#94A3B8;'}" onclick="CMS.renderEditorModal('${t.id}')">
                <i data-lucide="${t.icon}" class="w-3.5 h-3.5"></i> ${t.label}
              </button>
            `).join('')}
          </div>

          <div class="modal-body" style="background:#0F172A;color:#E2E8F0;padding:20px;overflow-y:auto;flex:1;">
            ${this.renderTabContent(activeTab)}
          </div>

          <div class="modal-foot" style="background:#1E293B;border-top:1px solid #334155;padding:12px 20px;">
            <div class="text-xs text-slate-400 flex items-center gap-1.5">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i> Perubahan tersimpan live ke browser LocalStorage
            </div>
            <div class="flex gap-2">
              <button type="button" class="btn-ghost !w-auto !py-2 !px-4 text-sm text-slate-300" onclick="document.getElementById('sctCmsModal').hidden=true">Batal</button>
              <button type="button" class="btn-primary !w-auto !py-2 !px-5 text-sm font-semibold" onclick="CMS.saveForm('${activeTab}')">
                <i data-lucide="save" class="w-4 h-4"></i> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      `;

      if (typeof refreshIcons === 'function') refreshIcons();
    },

    renderTabContent(tab) {
      const d = this.data;
      const s = d.settings;

      if (tab === 'identity') {
        return `
          <div class="space-y-4">
            <div>
              <label class="form-label text-slate-300 font-semibold text-xs">Nama Website / Portal</label>
              <input id="cmsAppName" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(s.appName)}">
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="form-label text-slate-300 font-semibold text-xs">Slogan / Kicker Brand</label>
                <input id="cmsBrandSub" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(s.brandSubtitle || 'By Sangcreator Tech')}">
              </div>
              <div>
                <label class="form-label text-slate-300 font-semibold text-xs">WhatsApp Admin</label>
                <input id="cmsWhatsApp" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(s.adminWhatsApp)}">
              </div>
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="form-label text-slate-300 font-semibold text-xs">Email Admin</label>
                <input id="cmsEmail" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(s.adminEmail)}">
              </div>
              <div>
                <label class="form-label text-slate-300 font-semibold text-xs">Link Lynk.id / Toko Digital</label>
                <input id="cmsLynk" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(s.lynkStoreUrl)}">
              </div>
            </div>
            <div>
              <label class="form-label text-slate-300 font-semibold text-xs">URL Logo Website</label>
              <input id="cmsLogo" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(s.logo)}">
            </div>
            <div>
              <label class="form-label text-slate-300 font-semibold text-xs">Judul Eksplorasi (Halaman Publik)</label>
              <input id="cmsExpTitle" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(s.exploreTitle)}">
            </div>
            <div>
              <label class="form-label text-slate-300 font-semibold text-xs">Deskripsi Eksplorasi</label>
              <textarea id="cmsExpSub" rows="2" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff">${esc(s.exploreSubtitle)}</textarea>
            </div>
          </div>
        `;
      }

      if (tab === 'announcement') {
        const a = d.announcement;
        return `
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 rounded-lg" style="background:#1E293B;border:1px solid #334155">
              <div>
                <b class="text-sm text-white">Status Banner Pengumuman</b>
                <p class="text-xs text-slate-400">Tampilkan pita pengumuman biru di atas halaman beranda member.</p>
              </div>
              <label class="switch">
                <input type="checkbox" id="cmsAnnActive" ${a.active ? 'checked' : ''}>
                <span class="slider round"></span>
              </label>
            </div>
            <div>
              <label class="form-label text-slate-300 font-semibold text-xs">Judul Pengumuman</label>
              <input id="cmsAnnTitle" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(a.title)}">
            </div>
            <div>
              <label class="form-label text-slate-300 font-semibold text-xs">Isi Pengumuman Lengkap</label>
              <textarea id="cmsAnnContent" rows="3" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff">${esc(a.content)}</textarea>
            </div>
            <div>
              <label class="form-label text-slate-300 font-semibold text-xs">Link Tujuan (YouTube / Panduan)</label>
              <input id="cmsAnnLink" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(a.link || '')}">
            </div>
          </div>
        `;
      }

      if (tab === 'products') {
        return `
          <div>
            <div class="flex items-center justify-between mb-4">
              <p class="text-xs text-slate-400">Kelola 8 produk & materi yang tampil di Beranda dan Kelas Saya.</p>
              <button type="button" class="btn-primary !py-1 !px-3 text-xs" onclick="CMS.addProduct()">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i> Tambah Produk Baru
              </button>
            </div>
            <div class="space-y-3" id="cmsProductList">
              ${d.catalog.map(p => `
                <div class="p-3.5 rounded-xl border border-slate-700 bg-slate-800/80 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                  <div class="flex gap-3 items-center min-w-0 flex-1">
                    <img src="${esc(p.Image_URL)}" class="w-14 h-10 object-cover rounded-md flex-none border border-slate-600" onerror="this.src='https://placehold.co/120x80/1e293b/fff?text=Materi'">
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5 mb-1">
                        <span class="badge ${p.Category === 'Document' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'} text-[10px] px-1.5 py-0.5 rounded font-bold">${esc(p.Category)}</span>
                        <span class="badge ${p.owned ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'} text-[10px] px-1.5 py-0.5 rounded font-semibold">${p.owned ? '✓ Dimiliki' : '🔒 Terkunci'}</span>
                      </div>
                      <p class="text-xs font-bold text-white truncate">${esc(p.Title)}</p>
                      <p class="text-[11px] text-slate-400 truncate">${esc(p.Tagline || p.Description)}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 flex-none w-full md:w-auto justify-end">
                    <button type="button" class="btn-ghost !py-1 !px-2.5 text-xs text-slate-200 border border-slate-600" onclick="CMS.editProduct('${p.Product_ID}')">
                      <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Edit
                    </button>
                    <button type="button" class="btn-ghost !py-1 !px-2.5 text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/30" onclick="CMS.deleteProduct('${p.Product_ID}')">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      if (tab === 'bootcamp') {
        const b = d.bootcamp;
        return `
          <div class="space-y-4">
            <div>
              <label class="form-label text-slate-300 font-semibold text-xs">Nama Program Bootcamp</label>
              <input id="cmsBootTitle" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(b.title)}">
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="form-label text-slate-300 font-semibold text-xs">Biaya / Harga</label>
                <input id="cmsBootPrice" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(b.priceLabel)}">
              </div>
              <div>
                <label class="form-label text-slate-300 font-semibold text-xs">Kuota Peserta</label>
                <input id="cmsBootQuota" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(b.quotaLabel)}">
              </div>
            </div>
            <div>
              <label class="form-label text-slate-300 font-semibold text-xs">URL Poster Thumbnail</label>
              <input id="cmsBootPoster" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(b.poster)}">
            </div>
            <div>
              <label class="form-label text-slate-300 font-semibold text-xs">Link Pembelian Token Lynk.id</label>
              <input id="cmsBootCta" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(b.ctaUrl)}">
            </div>
            <div>
              <label class="form-label text-slate-300 font-semibold text-xs">Sesi Pertemuan (4 Sesi)</label>
              <div class="space-y-2 mt-2">
                ${b.sessions.map((ses, i) => `
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-400 font-bold w-20">Sesi ${ses.no}:</span>
                    <input class="form-input cms-boot-ses" data-idx="${i}" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(ses.title)}">
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }

      if (tab === 'showcase') {
        return `
          <div>
            <div class="flex items-center justify-between mb-4">
              <p class="text-xs text-slate-400">Etalase karya alumni yang dipamerkan di halaman depan dan galeri karya.</p>
              <button type="button" class="btn-primary !py-1 !px-3 text-xs" onclick="CMS.addShowcase()">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i> Tambah Karya
              </button>
            </div>
            <div class="space-y-3">
              ${d.showcase.map(k => `
                <div class="p-3.5 rounded-xl border border-slate-700 bg-slate-800/80 flex gap-3 items-center justify-between">
                  <div class="flex items-center gap-3 min-w-0">
                    <img src="${esc(k.image)}" class="w-12 h-12 object-cover rounded-lg border border-slate-600" onerror="this.src='https://placehold.co/100/1e293b/fff?text=Karya'">
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-white truncate">${esc(k.title)}</p>
                      <p class="text-[11px] text-slate-400">Oleh: ${esc(k.memberName)} (${esc(k.profession)})</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 flex-none">
                    <button type="button" class="btn-ghost !py-1 !px-2.5 text-xs text-rose-400 border border-rose-500/30" onclick="CMS.deleteShowcase('${k.id}')">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      if (tab === 'profile') {
        const p = d.memberProfile;
        return `
          <div class="space-y-4">
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="form-label text-slate-300 font-semibold text-xs">Nama Lengkap Member</label>
                <input id="cmsProfFull" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(p.fullName)}">
              </div>
              <div>
                <label class="form-label text-slate-300 font-semibold text-xs">Nama Panggilan</label>
                <input id="cmsProfNick" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(p.nickname)}">
              </div>
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="form-label text-slate-300 font-semibold text-xs">Email Member</label>
                <input id="cmsProfEmail" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(p.email)}">
              </div>
              <div>
                <label class="form-label text-slate-300 font-semibold text-xs">No. WhatsApp</label>
                <input id="cmsProfWa" class="form-input" style="background:#1E293B;border-color:#334155;color:#fff" value="${esc(p.whatsapp)}">
              </div>
            </div>
          </div>
        `;
      }

      return '';
    },

    saveForm(tab) {
      const d = this.data;

      if (tab === 'identity') {
        d.settings.appName = document.getElementById('cmsAppName').value.trim() || 'Produk Digital - By Sangcreator Tech';
        d.settings.brandSubtitle = document.getElementById('cmsBrandSub').value.trim() || 'By Sangcreator Tech';
        d.settings.adminWhatsApp = document.getElementById('cmsWhatsApp').value.trim();
        d.settings.adminEmail = document.getElementById('cmsEmail').value.trim();
        d.settings.lynkStoreUrl = document.getElementById('cmsLynk').value.trim();
        d.settings.logo = document.getElementById('cmsLogo').value.trim();
        d.settings.exploreTitle = document.getElementById('cmsExpTitle').value.trim();
        d.settings.exploreSubtitle = document.getElementById('cmsExpSub').value.trim();
      } else if (tab === 'announcement') {
        d.announcement.active = document.getElementById('cmsAnnActive').checked;
        d.announcement.title = document.getElementById('cmsAnnTitle').value.trim();
        d.announcement.content = document.getElementById('cmsAnnContent').value.trim();
        d.announcement.link = document.getElementById('cmsAnnLink').value.trim();
      } else if (tab === 'bootcamp') {
        d.bootcamp.title = document.getElementById('cmsBootTitle').value.trim();
        d.bootcamp.priceLabel = document.getElementById('cmsBootPrice').value.trim();
        d.bootcamp.quotaLabel = document.getElementById('cmsBootQuota').value.trim();
        d.bootcamp.poster = document.getElementById('cmsBootPoster').value.trim();
        d.bootcamp.ctaUrl = document.getElementById('cmsBootCta').value.trim();
        const sesInputs = document.querySelectorAll('.cms-boot-ses');
        sesInputs.forEach(inp => {
          const idx = parseInt(inp.dataset.idx, 10);
          if (d.bootcamp.sessions[idx]) d.bootcamp.sessions[idx].title = inp.value.trim();
        });
      } else if (tab === 'profile') {
        d.memberProfile.fullName = document.getElementById('cmsProfFull').value.trim();
        d.memberProfile.nickname = document.getElementById('cmsProfNick').value.trim();
        d.memberProfile.email = document.getElementById('cmsProfEmail').value.trim();
        d.memberProfile.whatsapp = document.getElementById('cmsProfWa').value.trim();
      }

      this.save();
      this.applyData();

      document.getElementById('sctCmsModal').hidden = true;

      if (typeof renderHome === 'function' && document.getElementById('homeRoot')) renderHome();
      if (typeof renderExplore === 'function' && document.getElementById('exploreRoot')) renderExplore();
      if (typeof renderPubnav === 'function') renderPubnav();
      if (typeof Msb !== 'undefined' && Msb.render) Msb.render();
      if (typeof renderTopnav === 'function') renderTopnav();

      if (typeof showToast === 'function') {
        showToast('Tersimpan!', 'Perubahan website berhasil diperbarui.', 'success');
      } else {
        alert('Perubahan berhasil disimpan!');
      }
    },

    addProduct() {
      const title = prompt('Judul Produk / Materi Baru:');
      if (!title) return;
      const cat = prompt('Kategori (Kelas / Document / Aplikasi):', 'Kelas') || 'Kelas';
      const id = 'p_' + Date.now();
      this.data.catalog.unshift({
        Product_ID: id,
        Title: title,
        Category: cat,
        Price: 250000,
        owned: true,
        Image_URL: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
        Tagline: 'Materi Baru By Sangcreator Tech',
        Description: 'Deskripsi lengkap materi baru.',
        checkoutOpen: true,
        Content_URL: 'https://drive.google.com'
      });
      this.save();
      this.applyData();
      this.renderEditorModal('products');
      if (typeof renderHome === 'function' && document.getElementById('homeRoot')) renderHome();
    },

    editProduct(id) {
      const p = this.data.catalog.find(x => x.Product_ID === id);
      if (!p) return;
      const newTitle = prompt('Judul Produk:', p.Title);
      if (newTitle === null) return;
      p.Title = newTitle.trim() || p.Title;
      const ownedStr = confirm('Apakah materi ini statusnya DIMILIKI oleh member? (OK = Dimiliki, Cancel = Terkunci)');
      p.owned = ownedStr;
      const newImg = prompt('URL Gambar Thumbnail:', p.Image_URL);
      if (newImg !== null && newImg.trim()) p.Image_URL = newImg.trim();
      this.save();
      this.applyData();
      this.renderEditorModal('products');
      if (typeof renderHome === 'function' && document.getElementById('homeRoot')) renderHome();
    },

    deleteProduct(id) {
      if (!confirm('Hapus produk ini dari katalog?')) return;
      this.data.catalog = this.data.catalog.filter(x => x.Product_ID !== id);
      this.save();
      this.applyData();
      this.renderEditorModal('products');
      if (typeof renderHome === 'function' && document.getElementById('homeRoot')) renderHome();
    },

    addShowcase() {
      const title = prompt('Judul Karya:');
      if (!title) return;
      const member = prompt('Nama Pembuat:', 'Alumni') || 'Alumni';
      this.data.showcase.unshift({
        id: 'k_' + Date.now(),
        title: title,
        memberName: member,
        profession: 'Developer',
        description: 'Aplikasi web yang dibuat oleh member.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
        demoUrl: 'https://example.com'
      });
      this.save();
      this.applyData();
      this.renderEditorModal('showcase');
      if (typeof renderHome === 'function' && document.getElementById('homeRoot')) renderHome();
    },

    deleteShowcase(id) {
      if (!confirm('Hapus karya ini dari showcase?')) return;
      this.data.showcase = this.data.showcase.filter(x => x.id !== id);
      this.save();
      this.applyData();
      this.renderEditorModal('showcase');
      if (typeof renderHome === 'function' && document.getElementById('homeRoot')) renderHome();
    },

    injectControls() {
      if (document.getElementById('sctFloatingBar')) return;

      const bar = document.createElement('div');
      bar.id = 'sctFloatingBar';
      bar.style.cssText = `
        position: fixed;
        bottom: 22px;
        right: 22px;
        z-index: 99999;
        display: flex;
        gap: 8px;
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(14px);
        border: 1px solid rgba(59, 130, 246, 0.45);
        box-shadow: 0 16px 40px rgba(0,0,0,0.5);
        padding: 6px 12px;
        border-radius: 9999px;
        align-items: center;
      `;

      bar.innerHTML = `
        <span style="font-size:11px;font-weight:800;color:#60A5FA;letter-spacing:0.5px;padding-left:4px;">
          SANGCREATOR TECH
        </span>
        <button type="button" class="btn-primary !py-1.5 !px-3.5 !text-xs !rounded-full shadow hover:scale-105 transition-all" onclick="CMS.openEditor('identity')" title="Buka Panel Revisi Admin">
          <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Revisi Website
        </button>
        <div style="width:1px;height:16px;background:#334155;margin:0 2px;"></div>
        <select id="sctModeSelector" onchange="CMS.switchMode(this.value)" style="background:#1E293B;color:#F8FAFC;font-size:11px;font-weight:600;border-radius:9999px;border:1px solid #334155;padding:4px 10px;cursor:pointer;outline:none;">
          <option value="member" ${typeof AppState !== 'undefined' && AppState.role === 'Customer' ? 'selected' : ''}>👤 Mode Member</option>
          <option value="admin" ${typeof AppState !== 'undefined' && (AppState.role === 'Admin' || AppState.role === 'Superadmin') ? 'selected' : ''}>🛠️ Mode Superadmin</option>
          <option value="public" ${typeof AppState === 'undefined' || !AppState.role ? 'selected' : ''}>🌐 Mode Publik</option>
        </select>
      `;

      document.body.appendChild(bar);
      if (typeof refreshIcons === 'function') refreshIcons();
    }
  };

  CMS.init();
})();
