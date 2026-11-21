/**
 * ============================================================
 * v37.js — Digital Product Hub v3.7 (publik & portal member)
 * ------------------------------------------------------------
 * Berkas BARU. Berkas lama (core.js, public.js, member.js, custom.js, v34.js, v36.js) TIDAK diubah —
 * fitur v3.7 dipasang dari sini, jadi mudah dibatalkan (hapus tag <script> berkas ini di index.html).
 *
 * 1. Sesi member 3 jam tanpa aktivitas (keluar otomatis) + perpanjangan token saat aktif
 * 2. Navigasi member pindah ke SIDEBAR (desktop: bisa diciutkan · HP: laci geser)
 * 3. Login member: Sign in with Google (utama) · PIN (cadangan) · pemulihan akun lewat nomor HP
 * 4. Pendaftaran member: bukti invoice Lynk.id wajib (PNG/JPG/PDF ≤ 2 MB)
 * 5. Master Prompt · Bank Skill · Library Aplikasi
 * 6. Tur panduan interaktif untuk login pertama
 * 7. Kecepatan: muat data lebih awal saat kursor/jari menyentuh menu + saat browser senggang
 * ============================================================
 */

const V37 = { copied: {}, lib: null, q: { prompts: '', skills: '', apps: '' }, cat: { prompts: 'all', skills: 'all', apps: 'all' }, needLogin: '', open: {} };
const V37_READ = { libraryHome: 1, libraryAdmin: 1, registrationsAdmin: 1, regProofFile: 1, authAdmin: 1 };
const V37_IDLE_MS = 3 * 3600000;
const V37_PROOF_MB = 2;

function v7icon(n, cls) { return '<i data-lucide="' + n + '" class="' + (cls || 'w-4 h-4') + '"></i>'; }
function v7has(sel) { const e = document.querySelector(sel); return !!(e && e.offsetParent !== null && e.getClientRects().length); }


// ════════════════════════════════════════════════════════════
// 1. SESI 3 JAM + KAIT API (tanpa mengubah core.js)
// ════════════════════════════════════════════════════════════
const Idle = {
  KEY: 'v37:act', last: Date.now(), _saved: 0,
  read() { const v = Number(Store.get(this.KEY, 0)) || 0; return v; },
  mark(force) {
    this.last = Date.now();
    if (force || this.last - this._saved > 15000) { this._saved = this.last; Store.set(this.KEY, this.last); }
  },
  /** Pengguna berinteraksi dalam 10 menit terakhir → server boleh memperpanjang sesi. */
  active() { return Date.now() - this.last < 600000; },
  check() {
    if (AppState.role !== ROLE_MEMBER) return;
    const last = Math.max(this.last, this.read());
    if (Date.now() - last > V37_IDLE_MS) this.expire();
  },
  expire() {
    if (AppState.role !== ROLE_MEMBER) return;
    api('logout', {}, { silentAuth: true });
    clearSession();
    if (window.Swal && Swal.isVisible()) Swal.close();
    go('login');
    Swal.fire({ icon: 'info', title: 'Sesi berakhir', text: 'Demi keamanan, Anda keluar otomatis setelah 3 jam tanpa aktivitas. Silakan masuk kembali.', confirmButtonText: 'Masuk lagi' });
  },
  init() {
    const mark = () => Idle.mark();
    ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach(ev => window.addEventListener(ev, mark, { passive: true, capture: true }));
    setInterval(() => Idle.check(), 30000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') Idle.check(); });
    // Tab lain: ikut aktif / ikut memakai token terbaru / ikut keluar
    window.addEventListener('storage', e => {
      if (e.key === LS_PREFIX + Idle.KEY) { const v = Number(JSON.parse(e.newValue || '0')) || 0; if (v > Idle.last) Idle.last = v; }
      if (e.key === LS_PREFIX + 'session' && AppState.role === ROLE_MEMBER) {
        const s = Store.get('session', null);
        if (!s) { clearSession(); go('login'); }
        else if (s.email === AppState.email && s.token) AppState.token = s.token;
      }
    });
  }
};

// Saat halaman dibuka: sesi member yang sudah menganggur > 3 jam dibuang SEBELUM aplikasi memuatnya.
(function () {
  const s = Store.get('session', null);
  if (s && s.role === ROLE_MEMBER) {
    const last = Idle.read();
    if (last && Date.now() - last > V37_IDLE_MS) { Store.del('session'); Store.set('v37:idleOut', 1); }
    else if (last) Idle.last = Math.max(last, Date.now() - 1);          // membuka halaman = aktivitas
  }
})();

// Aksi baca v3.7 ikut mekanisme "satu permintaan untuk permintaan kembar" milik core.js
(function () { const t = READ_ACTIONS.test.bind(READ_ACTIONS); READ_ACTIONS.test = a => !!V37_READ[a] || t(a); })();

// Kait apiOnce: (1) tanda "pengguna aktif" → server memperpanjang token, (2) simpan token baru, (3) garis progres untuk aksi simpan
const _apiOnce37 = apiOnce;
apiOnce = async function (action, data, opts) {                       // eslint-disable-line no-global-assign
  const tok = AppState.token, member = AppState.role === ROLE_MEMBER;
  const write = !READ_ACTIONS.test(action) && action !== 'drain' && action !== 'logout';
  if (write) Bar.start();
  let j;
  try { j = await _apiOnce37(action, member && tok && Idle.active() ? Object.assign({}, data || {}, { _ua: 1 }) : data, opts); }
  finally { if (write) Bar.done(); }
  if (j && j.tk && member && AppState.token === tok && AppState.role === ROLE_MEMBER) {
    AppState.token = j.tk;
    const s = Store.get('session', null);
    if (s && s.email === AppState.email) { s.token = j.tk; Store.set('session', s); }
  }
  if (action === 'redeem' && j && j.success && j.data && j.data.needLogin) V37.needLogin = j.data.email || '';
  return j;
};

// Login berhasil = aktivitas
const _saveSession37 = saveSession;
saveSession = function (d) { _saveSession37(d); Idle.mark(true); };   // eslint-disable-line no-global-assign

/** Garis progres tipis di atas layar selama aksi simpan berjalan. */
const Bar = {
  n: 0, el: null,
  start() { this.n++; if (!this.el) { this.el = document.createElement('div'); this.el.className = 'v7-bar'; document.body.appendChild(this.el); } this.el.classList.remove('is-done'); void this.el.offsetWidth; this.el.classList.add('is-on'); },
  done() { this.n = Math.max(0, this.n - 1); if (!this.n && this.el) { this.el.classList.add('is-done'); setTimeout(() => { if (!Bar.n && Bar.el) Bar.el.classList.remove('is-on', 'is-done'); }, 350); } }
};

// Panel admin: modul v3.7 ikut dimuat bersama modul admin lain
AdminBundle.files.push('js/admin-v37.js');


// ════════════════════════════════════════════════════════════
// 2. SIDEBAR MEMBER
// ════════════════════════════════════════════════════════════
MEMBER_MENU.splice(4, 0,
  { id: 'prompts', icon: 'sparkles', label: 'Master Prompt' },
  { id: 'skills', icon: 'zap', label: 'Bank Skill' },
  { id: 'apps', icon: 'app-window', label: 'Library Aplikasi' });

const MSB_GROUPS = [
  { label: 'Belajar', ids: ['home', 'library', 'jalur', 'bootcamp'] },
  { label: 'Sumber Daya AI', ids: ['prompts', 'skills', 'apps'] },
  { label: 'Komunitas & Layanan', ids: ['karya', 'guides', 'custom', 'orders', 'helpdesk'] }
];

const Msb = {
  built: false,
  build() {
    if (this.built) return;
    this.built = true;
    const a = document.createElement('aside');
    a.id = 'msb'; a.className = 'msb'; a.setAttribute('aria-label', 'Menu member');
    a.innerHTML = '<div class="msb-brand"><button type="button" class="msb-logo" id="msbBrand" onclick="Msb.go(\'home\')"></button>' +
      '<button type="button" class="msb-toggle" onclick="Msb.toggle()" title="Ciutkan / lebarkan menu" aria-label="Ciutkan atau lebarkan menu">' + v7icon('sidebar', 'w-[18px] h-[18px]') + '</button>' +
      '<button type="button" class="msb-x" onclick="Msb.close()" aria-label="Tutup menu">' + v7icon('x', 'w-5 h-5') + '</button></div>' +
      '<nav class="msb-nav" id="msbNav"></nav>' +
      '<div class="msb-foot"><button type="button" class="sidebar-link" onclick="Msb.close();Tour.start(true)" title="Tur Panduan">' + v7icon('compass', 'w-[18px] h-[18px]') + '<span class="msb-label">Tur Panduan</span></button>' +
      '<button type="button" class="sidebar-link" onclick="Msb.close();openPinDialog()" title="PIN & Keamanan" data-tour="pin">' + v7icon('fingerprint', 'w-[18px] h-[18px]') + '<span class="msb-label">PIN & Keamanan</span></button>' +
      '<button type="button" class="msb-user" onclick="Msb.close();openProfileDialog()" title="Profil"><span class="msb-ava" id="msbAva">U</span><span class="msb-label msb-who"><b id="msbName"></b><small id="msbMail"></small></span></button></div>';
    document.body.appendChild(a);
    const s = document.createElement('div'); s.id = 'msbScrim'; s.className = 'msb-scrim'; s.onclick = () => Msb.close();
    document.body.appendChild(s);
    const inner = document.querySelector('#topnav .topnav-inner');
    if (inner) {
      const b = document.createElement('button');
      b.type = 'button'; b.id = 'msbBurger'; b.className = 'icon-btn msb-burger'; b.title = 'Menu'; b.setAttribute('aria-label', 'Buka menu');
      b.innerHTML = v7icon('menu', 'w-5 h-5'); b.onclick = () => Msb.open();
      inner.insertBefore(b, inner.firstChild);
      const t = document.createElement('p'); t.id = 'msbTitle'; t.className = 'msb-title';
      inner.insertBefore(t, document.getElementById('topnavMenu'));
    }
    if (Store.get('v37:msbMini', false)) document.body.classList.add('msb-mini');
    window.addEventListener('hashchange', () => Msb.close());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') Msb.close(); });
  },
  render() {
    this.build();
    const s = (AppState.m && AppState.m.settings) || {};
    const pending = ((AppState.m && AppState.m.orders) || []).filter(o => o.Status === 'Pending').length;
    const by = {}; MEMBER_MENU.forEach(m => { by[m.id] = m; });
    const used = {};
    const link = m => { used[m.id] = 1; return '<button type="button" class="sidebar-link" data-nav="' + m.id + '" title="' + esc(m.label) + '" onclick="Msb.go(\'' + m.id + '\')">' +
      v7icon(m.icon, 'w-[18px] h-[18px]') + '<span class="msb-label">' + esc(m.label) + '</span>' +
      (m.id === 'orders' ? '<span class="nav-badge" data-badge="orders"' + (pending ? '' : ' hidden') + '>' + pending + '</span>' : '') + '</button>'; };
    let html = MSB_GROUPS.map(g => { const items = g.ids.map(id => by[id]).filter(Boolean); return items.length ? '<p class="msb-group">' + g.label + '</p>' + items.map(link).join('') : ''; }).join('');
    const rest = MEMBER_MENU.filter(m => !used[m.id]);                    // menu yang ditambahkan modul lain kelak tetap tampil
    if (rest.length) html += '<p class="msb-group">Lainnya</p>' + rest.map(link).join('');
    document.getElementById('msbNav').innerHTML = html;
    document.getElementById('msbBrand').innerHTML = brandLogoHtml(34) + '<span class="msb-label truncate">' + esc(s.appName || Store.get('brandName', '') || 'Digital Product Hub') + '</span>';
    const p = Member.profile();
    document.getElementById('msbAva').textContent = initial(p.nickname || AppState.email);
    document.getElementById('msbName').textContent = p.nickname || String(AppState.email || '').split('@')[0];
    document.getElementById('msbMail').textContent = AppState.email || '';
    this.title(AppState.currentPage);
  },
  title(name) {
    const t = document.getElementById('msbTitle'); if (!t) return;
    const m = MEMBER_MENU.filter(x => x.id === name)[0], def = Pages[name];
    t.textContent = m ? m.label : (def && def.layout === 'member' && def.title ? def.title : '');
  },
  go(id) { this.close(); go(id); },
  open() { this.build(); document.getElementById('msb').classList.add('is-open'); document.getElementById('msbScrim').classList.add('is-open'); },
  close() { const a = document.getElementById('msb'); if (a) { a.classList.remove('is-open'); document.getElementById('msbScrim').classList.remove('is-open'); } },
  toggle() { const on = document.body.classList.toggle('msb-mini'); Store.set('v37:msbMini', on); },
  mobile() { return window.innerWidth < 1024; }
};

// renderTopnav lama tetap dipakai (logo, avatar, lencana pesanan) → lalu sidebar digambar
const _renderTopnav37 = renderTopnav;
renderTopnav = function () {                                           // eslint-disable-line no-global-assign
  _renderTopnav37();
  const nav = document.getElementById('topnav');
  if (!nav || nav.hidden) return;
  Msb.render();
  updateActiveNav(AppState.currentPage);
  refreshIcons();
};
const _updateActiveNav37 = updateActiveNav;
updateActiveNav = function (name) { _updateActiveNav37(name); Msb.title(name); };   // eslint-disable-line no-global-assign


// ════════════════════════════════════════════════════════════
// 3. LOGIN: Google (utama) · PIN (cadangan) · pemulihan akun
// ════════════════════════════════════════════════════════════
function authInfo37() { return (AppState.pub && AppState.pub.auth37) || { google: true, pin: true, legacy: false }; }

/** Pesan gagal login yang sama untuk Google & PIN. */
function loginFail37(res, email) {
  const code = res.data && res.data.code;
  email = (res.data && res.data.email) || email || '';
  if (code === 'NOT_REGISTERED') {
    Swal.fire({ icon: 'warning', title: 'Email belum terdaftar', text: res.message, showDenyButton: true, showCancelButton: true,
      confirmButtonText: 'Redeem Kode Akses', denyButtonText: 'Daftar Member', cancelButtonText: 'Tutup' })
      .then(r => { if (r.isConfirmed) openRedeemDialog(email); else if (r.isDenied) openRegisterDialog(email); });
  } else if (code === 'PENDING') {
    Swal.fire({ icon: 'info', title: 'Menunggu persetujuan', text: res.message, confirmButtonText: 'OK', showDenyButton: true, denyButtonText: 'Tanya Admin' })
      .then(r => { if (r.isDenied) askAdmin('WhatsApp', 'Status pendaftaran ' + email); });
  } else if (code === 'REJECTED') {
    Swal.fire({ icon: 'warning', title: 'Pendaftaran belum disetujui', text: res.message, showDenyButton: true, showCancelButton: true,
      confirmButtonText: 'Ajukan Ulang', denyButtonText: 'Tanya Admin', cancelButtonText: 'Tutup' })
      .then(r => { if (r.isConfirmed) openRegisterDialog(email, 'Perbaiki data Anda lalu kirim ulang pendaftaran beserta bukti invoice.'); else if (r.isDenied) askAdmin('WhatsApp', 'Status pendaftaran ' + email); });
  } else if (code === 'NO_PIN') {
    Swal.fire({ icon: 'info', title: 'Akun belum punya PIN', text: res.message, showCancelButton: true, confirmButtonText: 'Buat PIN lewat nomor HP', cancelButtonText: 'Tutup' })
      .then(r => { if (r.isConfirmed) openRecoverDialog(email); });
  } else Swal.fire({ icon: 'error', title: 'Gagal masuk', text: res.message });
}

/** Satu tombol Google dipakai dua tab: kotaknya dipindah ke tab yang sedang dibuka. */
Login._moveGsi = function () {
  const slot = document.getElementById(this.tab === 'admin' ? 'gsiSlotAdmin' : 'gsiSlotMember');
  const box = document.getElementById('gsiButton'), st = document.getElementById('gsiStatus');
  if (slot && box && box.parentNode !== slot) { slot.appendChild(box); if (st) slot.appendChild(st); }
};
const _switchTab37 = Login.switchTab;
Login.switchTab = function (t) {
  _switchTab37.call(this, t);
  this._moveGsi();
  this.initGoogle();
  if (t === 'member') warmUpServer('pub');
};
const _onGoogle37 = Login.onGoogle;
Login.onGoogle = async function (resp) {
  if (Login.tab === 'admin') return _onGoogle37(resp);
  const st = document.getElementById('gsiStatus');
  if (st) st.innerHTML = '<span class="spinner-inline"></span> Memverifikasi akun Google…';
  const res = await api('loginMemberGoogle', { credential: resp.credential });
  if (st) st.innerHTML = '';
  if (!res.success) return loginFail37(res);
  Login.pushHistory(res.data.email);
  onMemberLogin(res.data);
  showToast('Berhasil masuk', res.message, 'success');
};
Login.showPin = function (on) {
  const f = document.getElementById('pinForm'), b = document.getElementById('pinOpen');
  if (!f) return;
  f.hidden = !on; if (b) b.hidden = on;
  if (on) { const h = this.getHistory()[0], e = document.getElementById('pinEmail'); if (e && !e.value && h) e.value = h; (e && !e.value ? e : document.getElementById('pinCode')).focus(); }
};
Login.pick = function (email) { const i = document.getElementById('pinEmail'); if (i) { Login.showPin(true); i.value = email; document.getElementById('pinCode').focus(); } };
Login.submitPin = async function (e) {
  e.preventDefault();
  const email = document.getElementById('pinEmail').value.trim().toLowerCase(), pin = document.getElementById('pinCode').value.trim();
  const err = document.getElementById('pinErr'); err.hidden = true;
  const say = m => { err.textContent = m; err.hidden = false; };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return say('Email tidak valid.');
  if (!/^\d{6}$/.test(pin)) return say('PIN terdiri dari 6 angka.');
  const res = await withBusy(e.submitter || document.querySelector('#pinForm button[type=submit]'), 'Memeriksa…', () => api('loginMemberPin', { email: email, pin: pin }));
  if (!res.success) {
    const c = res.data && res.data.code;
    document.getElementById('pinCode').value = '';
    if (c === 'PIN_WRONG' || c === 'PIN_LOCKED') return say(res.message);
    return loginFail37(res, email);
  }
  Login.pushHistory(email);
  onMemberLogin(res.data);
  showToast('Berhasil masuk', res.message, 'success');
};
Login.submitLegacy = async function (e) {
  e.preventDefault();
  const email = document.getElementById('legacyEmail').value.trim().toLowerCase();
  const res = await withBusy(e.submitter, 'Memeriksa…', () => api('loginMember', { email: email }));
  if (!res.success) return loginFail37(res, email);
  Login.pushHistory(email); onMemberLogin(res.data); showToast('Berhasil masuk', res.message, 'success');
};
Login.renderLegacy = function () {
  const box = document.getElementById('legacyBox'); if (!box) return;
  box.hidden = !authInfo37().legacy;
};

registerPage('login', {
  layout: 'public', auth: 'guest', title: 'Masuk',
  template: () =>
    '<div class="min-h-[calc(100dvh-64px)] flex items-center justify-center px-4 py-10 dot-grid">' +
      '<div class="w-full max-w-md">' +
        '<div class="app-card rounded-2xl overflow-hidden">' +
          '<div class="px-8 pt-8 pb-6 text-center">' +
            '<div id="loginBrand" class="mx-auto w-14 h-14"></div>' +
            '<h1 class="mt-4 text-2xl font-bold tracking-tight text-main">Selamat Datang</h1>' +
            '<p class="mt-1 text-sm text-muted">Masuk untuk mengakses kelas & aplikasi Anda.</p>' +
          '</div>' +
          '<div class="px-8"><div class="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-2">' +
            '<button type="button" id="tabMember" onclick="Login.switchTab(\'member\')" class="login-tab login-tab-active">Member</button>' +
            '<button type="button" id="tabAdmin" onclick="Login.switchTab(\'admin\')" class="login-tab">Admin / Superadmin</button>' +
          '</div></div>' +
          '<div id="formMember" class="px-8 py-6 v7-login">' +
            '<p class="v7-login-lead">' + v7icon('shield-check', 'w-4 h-4') + '<span>Gunakan akun Google dengan <b>email yang terdaftar</b> sebagai member.</span></p>' +
            '<div id="gsiSlotMember" class="v7-gsi"><div id="gsiButton" class="flex justify-center min-h-[44px]"></div><p id="gsiStatus" class="text-center text-sm text-muted"></p></div>' +
            '<div class="v7-or"><span>atau</span></div>' +
            '<button type="button" id="pinOpen" class="btn-ghost w-full" onclick="Login.showPin(true)">' + v7icon('fingerprint') + ' Masuk dengan PIN</button>' +
            '<form id="pinForm" class="v7-pin" hidden onsubmit="Login.submitPin(event)" autocomplete="off">' +
              '<div><label class="form-label" for="pinEmail">Email terdaftar</label><input id="pinEmail" type="email" required autocomplete="username" autocapitalize="off" spellcheck="false" class="form-input" placeholder="nama@email.com"></div>' +
              '<div><label class="form-label" for="pinCode">PIN (6 angka)</label><input id="pinCode" type="password" required inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="current-password" class="form-input v7-pin-input" placeholder="••••••"></div>' +
              '<p id="pinErr" class="v7-err" hidden></p>' +
              '<button type="submit" class="btn-primary w-full">' + v7icon('log-in') + ' Masuk</button>' +
              '<div class="v7-pin-links"><button type="button" onclick="openRecoverDialog(document.getElementById(\'pinEmail\').value)">Lupa / belum punya PIN?</button><button type="button" onclick="Login.showPin(false)">Tutup</button></div>' +
            '</form>' +
            '<div id="emailHistory" class="mt-1"></div>' +
            '<div id="legacyBox" class="v7-legacy" hidden><p>' + v7icon('alert-triangle', 'w-4 h-4') + ' Mode transisi aktif — masuk dengan email saja masih diizinkan sementara.</p>' +
              '<form class="flex gap-2" onsubmit="Login.submitLegacy(event)"><input id="legacyEmail" type="email" required class="form-input" placeholder="nama@email.com"><button type="submit" class="btn-ghost !w-auto">Masuk</button></form></div>' +
            '<div class="v7-login-foot"><button type="button" onclick="openRedeemDialog()" class="btn-ghost w-full">' + v7icon('key-round') + ' Punya Kode Akses? Redeem di sini</button>' +
            '<p class="text-center text-xs text-muted">Belum punya akun? <button type="button" class="text-accent font-semibold" onclick="openRegisterDialog()">Daftar sebagai member</button> · <button type="button" class="text-accent font-semibold" onclick="openRecoverDialog()">Pulihkan akun</button></p></div>' +
          '</div>' +
          '<div id="formAdmin" class="px-8 py-6 space-y-4" hidden>' +
            '<div class="text-center"><div class="w-12 h-12 mx-auto rounded-2xl grid place-items-center" style="background:var(--accent-soft);color:var(--accent)"><i data-lucide="shield-check" class="w-6 h-6"></i></div>' +
            '<p class="mt-3 text-sm text-muted">Khusus Superadmin & Tim Admin. Masuk dengan akun Google yang terdaftar (OAuth 2.0).</p></div>' +
            '<div id="gsiSlotAdmin" class="v7-gsi"></div>' +
          '</div>' +
          '<div class="px-8 pb-6 text-center"><button type="button" class="text-sm text-muted hover:text-main inline-flex items-center gap-1" onclick="go(\'explore\')"><i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali ke beranda</button></div>' +
        '</div>' +
        '<p class="v7-login-note">' + v7icon('clock', 'w-3.5 h-3.5') + ' Demi keamanan, sesi member berakhir otomatis setelah 3 jam tanpa aktivitas.</p>' +
      '</div>' +
    '</div>',
  show: () => {
    document.getElementById('loginBrand').innerHTML = brandLogoHtml(56);
    Login.renderHistory();
    Login.renderLegacy();
    Login._moveGsi();
    warmUpServer(Login.tab === 'admin' ? 'admin' : 'pub');
    Login.initGoogle();
    if (Store.get('v37:idleOut', 0)) {
      Store.del('v37:idleOut');
      showToast('Sesi berakhir', 'Anda keluar otomatis setelah 3 jam tanpa aktivitas. Silakan masuk kembali.', 'warning');
    }
  }
});

// Info cara login datang bersama data publik → perbarui kotak mode transisi bila berubah
const _pubPrefetch37 = Public.prefetch;
Public.prefetch = function (force) { return _pubPrefetch37.call(this, force).then(r => { Login.renderLegacy(); return r; }); };

// Redeem untuk akun lama tanpa login: akses diberikan, lalu diarahkan ke halaman masuk
const _openRedeem37 = openRedeemDialog;
openRedeemDialog = async function (prefill) {                          // eslint-disable-line no-global-assign
  V37.needLogin = '';
  await _openRedeem37(prefill);
  if (V37.needLogin && !AppState.role) { const em = V37.needLogin; V37.needLogin = ''; go('login'); setTimeout(() => { const i = document.getElementById('pinEmail'); if (i) i.value = em; }, 80); }
};

/** Pemulihan akun: nomor HP → email tersamar → email + nomor HP cocok → PIN baru dikirim ke email. */
async function openRecoverDialog(prefillEmail) {
  const R = { step: 1, wa: '', hints: [] };
  const body = () => R.step === 1
    ? '<p class="text-sm text-muted">Masukkan nomor HP/WhatsApp yang terdaftar di akun Anda.</p>' +
      '<div><label class="form-label" for="rcWa">No. HP / WhatsApp</label><input id="rcWa" class="form-input" inputmode="tel" autocomplete="tel" placeholder="0878… atau +60…" value="' + esc(R.wa) + '"></div>'
    : '<div class="notice notice-success">' + v7icon('check-circle-2', 'w-5 h-5 flex-none') + '<div class="flex-1 text-sm">Nomor ditemukan. Akun terhubung ke email:<br><b class="mono">' + R.hints.map(esc).join('</b> · <b class="mono">') + '</b></div></div>' +
      '<div><label class="form-label" for="rcEmail">Tulis lengkap email akun Anda</label><input id="rcEmail" type="email" class="form-input" autocomplete="email" placeholder="nama@email.com" value="' + esc(typeof prefillEmail === 'string' ? prefillEmail : '') + '">' +
      '<p class="text-xs text-muted mt-1">Bila cocok, PIN baru dikirim ke email tersebut. Tidak ingat emailnya? Hubungi Admin.</p></div>';
  const paint = () => { const b = document.getElementById('rcBox'); if (b) { b.innerHTML = body(); refreshIcons(); const i = b.querySelector('input'); if (i) i.focus(); } Swal.getConfirmButton().textContent = R.step === 1 ? 'Lanjut' : 'Kirim PIN Baru'; };
  const r = await Swal.fire({
    title: 'Pulihkan Akun / Buat PIN', showCancelButton: true, cancelButtonText: 'Batal', confirmButtonText: 'Lanjut', focusConfirm: false,
    html: '<div id="rcBox" style="text-align:left;display:grid;gap:12px"></div>', didOpen: paint,
    preConfirm: async () => {
      if (R.step === 1) {
        const wa = normWa(document.getElementById('rcWa').value);
        if (!isValidWa(wa)) return Swal.showValidationMessage(WA_INVALID);
        Swal.showLoading();
        const res = await api('recoverAccount', { whatsapp: wa });
        Swal.hideLoading();
        if (!res.success) return Swal.showValidationMessage(res.message);
        R.wa = wa; R.hints = res.data.hints || []; R.step = 2; Swal.resetValidationMessage(); paint();
        return false;
      }
      const email = document.getElementById('rcEmail').value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return Swal.showValidationMessage('Email tidak valid.');
      Swal.showLoading();
      const res = await api('recoverAccount', { whatsapp: R.wa, email: email });
      if (!res.success) { Swal.hideLoading(); return Swal.showValidationMessage(res.message); }
      return { res: res, email: email };
    },
    allowOutsideClick: () => !Swal.isLoading()
  });
  if (!r.isConfirmed || !r.value) return;
  await Swal.fire({ icon: 'success', title: 'PIN baru terkirim', text: r.value.res.message, confirmButtonText: 'Masuk dengan PIN' });
  if (!AppState.role) { go('login'); setTimeout(() => { Login.showPin(true); const i = document.getElementById('pinEmail'); if (i) { i.value = r.value.email; document.getElementById('pinCode').focus(); } }, 80); }
}

/** Member: ganti PIN sendiri (menu sidebar "PIN & Keamanan"). */
async function openPinDialog() {
  const has = V37.lib && V37.lib.me && V37.lib.me.hasPin;
  const r = await Swal.fire({
    title: 'PIN & Keamanan', showCancelButton: true, cancelButtonText: 'Tutup', confirmButtonText: has ? 'Ganti PIN' : 'Buat PIN', focusConfirm: false,
    html: '<div style="text-align:left;display:grid;gap:12px">' +
      '<div class="notice">' + v7icon('shield-check', 'w-5 h-5 flex-none') + '<div class="flex-1 text-sm">Login utama: <b>Masuk dengan Google</b>. PIN adalah cadangan bila Google bermasalah. Sesi berakhir otomatis setelah 3 jam tanpa aktivitas.</div></div>' +
      '<p class="text-sm text-muted">Status: ' + (has ? '<b style="color:var(--success)">PIN sudah aktif</b>' : '<b style="color:var(--warning)">Belum ada PIN</b>') + '</p>' +
      '<div><label class="form-label" for="npA">PIN baru (6 angka)</label><input id="npA" type="password" inputmode="numeric" maxlength="6" autocomplete="new-password" class="form-input v7-pin-input" placeholder="••••••"></div>' +
      '<div><label class="form-label" for="npB">Ulangi PIN baru</label><input id="npB" type="password" inputmode="numeric" maxlength="6" autocomplete="new-password" class="form-input v7-pin-input" placeholder="••••••"></div></div>',
    preConfirm: () => {
      const a = document.getElementById('npA').value.trim(), b = document.getElementById('npB').value.trim();
      if (!/^\d{6}$/.test(a)) return Swal.showValidationMessage('PIN harus 6 angka.');
      if (a !== b) return Swal.showValidationMessage('Kedua PIN tidak sama.');
      Swal.showLoading();
      return api('changePin', { pin: a }).then(res => { if (!res.success) { Swal.hideLoading(); Swal.showValidationMessage(res.message); return false; } return res; });
    },
    allowOutsideClick: () => !Swal.isLoading()
  });
  if (!r.isConfirmed || !r.value) return;
  if (V37.lib && V37.lib.me) { V37.lib.me.hasPin = true; Lib.persist(); }
  showToast('PIN tersimpan', r.value.message, 'success');
}


// ════════════════════════════════════════════════════════════
// 4. PENDAFTARAN MEMBER + BUKTI INVOICE LYNK.ID (wajib)
// ════════════════════════════════════════════════════════════
const RG = { file: null };
function rgPick(input) {
  const f = input.files && input.files[0], box = document.getElementById('rgProofInfo');
  RG.file = null;
  if (!f) { box.innerHTML = ''; return; }
  const okType = /\.(png|jpe?g|pdf)$/i.test(f.name) && (!f.type || /^(image\/(png|jpeg)|application\/pdf)$/i.test(f.type));
  if (!okType) { input.value = ''; box.innerHTML = '<p class="v7-err">Format harus PNG, JPG, atau PDF.</p>'; return; }
  if (f.size > V37_PROOF_MB * 1048576) { input.value = ''; box.innerHTML = '<p class="v7-err">Ukuran ' + fmtBytes(f.size) + ' — maksimal ' + V37_PROOF_MB + ' MB. Perkecil berkas lalu pilih lagi.</p>'; return; }
  RG.file = f;
  box.innerHTML = '<p class="v7-file">' + v7icon(/pdf$/i.test(f.name) ? 'file-text' : 'image', 'w-4 h-4') + ' <b class="truncate">' + esc(f.name) + '</b> <span>' + fmtBytes(f.size) + '</span></p>';
  refreshIcons();
}
openRegisterDialog = async function (prefillEmail, reason) {           // eslint-disable-line no-global-assign
  const saved = Store.get('lead', {});
  RG.file = null;
  const r = await Swal.fire({
    title: 'Daftar sebagai Member', confirmButtonText: 'Kirim Pendaftaran', showCancelButton: true, cancelButtonText: 'Batal', focusConfirm: false, width: 540,
    html: '<div style="text-align:left;display:grid;gap:12px">' +
      '<p class="text-sm text-muted">' + esc(reason || 'Isi data berikut dan lampirkan bukti invoice Lynk.id. Akun aktif setelah disetujui Admin — kabar & PIN login dikirim lewat email.') + '</p>' +
      '<div><label class="form-label">Nama Lengkap *</label><input id="rgName" class="form-input" value="' + esc(saved.name || '') + '"></div>' +
      '<div><label class="form-label">Email *</label><input id="rgEmail" type="email" class="form-input" value="' + esc(typeof prefillEmail === 'string' ? prefillEmail : (saved.email || '')) + '" autocomplete="off">' +
      '<p class="text-xs text-muted mt-1">Disarankan email Google (Gmail) agar bisa <b>Masuk dengan Google</b>.</p></div>' +
      '<div><label class="form-label">No. WhatsApp *</label><input id="rgWa" class="form-input" inputmode="tel" autocomplete="tel" placeholder="0878… atau +60…" value="' + esc(saved.whatsapp || '') + '"></div>' +
      '<div><label class="form-label">Profesi *</label><input id="rgProf" class="form-input" placeholder="mis. Guru, Pemilik Usaha"></div>' +
      '<div><label class="form-label">Bukti Invoice Lynk.id *</label>' +
        '<label class="v7-drop" for="rgProof">' + v7icon('upload-cloud', 'w-6 h-6') + '<span><b>Pilih berkas bukti</b><small>PNG, JPG, atau PDF · maks. ' + V37_PROOF_MB + ' MB</small></span></label>' +
        '<input id="rgProof" type="file" class="hidden" accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf" onchange="rgPick(this)"><div id="rgProofInfo"></div></div>' +
      '<div><label class="form-label">Keperluan (opsional)</label><input id="rgNote" class="form-input" placeholder="mis. Sudah beli Kelas Metode 3"></div></div>',
    didOpen: refreshIcons,
    preConfirm: async () => {
      const v = { fullName: document.getElementById('rgName').value.trim(), email: document.getElementById('rgEmail').value.trim().toLowerCase(),
        whatsapp: normWa(document.getElementById('rgWa').value), profession: document.getElementById('rgProf').value.trim(), note: document.getElementById('rgNote').value.trim() };
      if (v.fullName.length < 3) return Swal.showValidationMessage('Nama lengkap minimal 3 karakter.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) return Swal.showValidationMessage('Email tidak valid.');
      if (!isValidWa(v.whatsapp)) return Swal.showValidationMessage(WA_INVALID);
      if (v.profession.length < 2) return Swal.showValidationMessage('Profesi wajib diisi.');
      if (!RG.file) return Swal.showValidationMessage('Bukti invoice Lynk.id wajib diunggah (PNG, JPG, atau PDF · maks. ' + V37_PROOF_MB + ' MB).');
      Swal.showLoading();
      try { v.proof = { base64: await readFileAsBase64(RG.file, V37_PROOF_MB), fileName: RG.file.name, mimeType: RG.file.type || '' }; }
      catch (e) { Swal.hideLoading(); return Swal.showValidationMessage(e.message); }
      const res = await api('register', v, { timeout: 120000 });
      if (!res.success) { Swal.hideLoading(); return Swal.showValidationMessage(res.message); }
      return res;
    },
    allowOutsideClick: () => !Swal.isLoading()
  });
  if (!r.isConfirmed || !r.value) return;
  Swal.fire({ icon: 'success', title: 'Pendaftaran terkirim', text: r.value.message });
};


// ════════════════════════════════════════════════════════════
// 5. PUSTAKA: Master Prompt · Bank Skill · Library Aplikasi
// ════════════════════════════════════════════════════════════
const LIB_KIND = {
  prompts: { title: 'Master Prompt', eyebrow: 'Sumber Daya AI', icon: 'sparkles', sub: 'Kumpulan prompt AI siap pakai untuk semua member. Klik sekali untuk menyalin, lalu tempel di ChatGPT, Claude, atau Gemini.', empty: 'Prompt belum tersedia', emptySub: 'Admin sedang menyiapkan koleksi prompt. Silakan cek kembali nanti.' },
  skills: { title: 'Bank Skill', eyebrow: 'Sumber Daya AI', icon: 'zap', sub: 'Berkas skill AI siap unduh. Sebagian terbuka untuk semua member, sebagian khusus pemilik kelas/bootcamp tertentu.', empty: 'Skill belum tersedia', emptySub: 'Admin sedang menyiapkan berkas skill.' },
  apps: { title: 'Library Aplikasi', eyebrow: 'Sumber Daya AI', icon: 'app-window', sub: 'Source code aplikasi web siap pasang (.zip). Tombol unduh aktif sesuai kelas/bootcamp yang Anda miliki.', empty: 'Aplikasi belum tersedia', emptySub: 'Admin sedang menyiapkan koleksi aplikasi.' }
};
const Lib = {
  _p: null,
  key() { return userKey('lib37'); },
  persist() { if (V37.lib) Store.set(this.key(), { t: Date.now(), h: hashData(V37.lib), data: V37.lib }); },
  /** Tampil dari cache seketika → segarkan di latar (hanya render ulang bila data berubah). */
  load(freshMs) {
    if (this._p) return this._p;
    this._p = swr(this.key(), 'libraryHome', {}, (d, fromCache, changed) => {
      if (fromCache && V37.lib) return;                                  // data di memori sudah tampil → jangan digambar ulang (mis. saat prefetch)
      const first = !V37.lib;
      V37.lib = d;
      if (first || changed) Lib.paint();
      Tour.maybe();
    }, { fresh: freshMs || 0, toastError: false, onError: res => Lib.paint(res.message) }).finally(() => { Lib._p = null; });
    return this._p;
  },
  paint(err) { ['prompts', 'skills', 'apps'].forEach(k => { if (document.getElementById('lib-' + k)) renderLib(k, err); }); },
  items(kind) { return (V37.lib && V37.lib[kind]) || []; },
  find(kind, id) { return this.items(kind).filter(x => x.id === id)[0]; }
};
['prompts', 'skills', 'apps'].forEach(kind => registerPage(kind, {
  title: LIB_KIND[kind].title,
  template: () => '<div class="page-wrap" id="lib-' + kind + '">' + skeletonRows(5) + '</div>',
  show: () => {
    if (!V37.lib) { const c = Store.get(Lib.key(), null); if (c && c.data) V37.lib = c.data; }
    if (V37.lib) renderLib(kind);
    Lib.load(20000);
  }
}));

function libFilter(kind) {
  const q = V37.q[kind].trim().toLowerCase(), cat = V37.cat[kind];
  return Lib.items(kind).filter(x => (cat === 'all' || (x.category || 'Umum') === cat) &&
    (!q || (x.title + ' ' + (x.description || '') + ' ' + (x.category || '') + ' ' + (x.tags || []).join(' ') + ' ' + (kind === 'prompts' ? x.body || '' : '')).toLowerCase().indexOf(q) > -1));
}
function renderLib(kind, err) {
  const root = document.getElementById('lib-' + kind); if (!root) return;
  const K = LIB_KIND[kind];
  if (!V37.lib) { root.innerHTML = err ? errorState(err, 'Lib.load()') : skeletonRows(5); refreshIcons(); return; }
  const all = Lib.items(kind);
  const cats = []; all.forEach(x => { const c = x.category || 'Umum'; if (cats.indexOf(c) === -1) cats.push(c); });
  if (V37.cat[kind] !== 'all' && cats.indexOf(V37.cat[kind]) === -1) V37.cat[kind] = 'all';
  const head = '<div class="v7-head"><div class="min-w-0"><p class="sec35-eyebrow">' + K.eyebrow + '</p><h1 class="page-title mt-1">' + K.title + '</h1><p class="page-sub">' + K.sub + '</p></div>' +
    (all.length ? '<label class="v7-search">' + v7icon('search', 'w-4 h-4') + '<input type="search" placeholder="Cari ' + K.title.toLowerCase() + '…" value="' + esc(V37.q[kind]) + '" oninput="V37.q.' + kind + '=this.value;renderLibList(\'' + kind + '\')" aria-label="Cari"></label>' : '') + '</div>';
  if (!all.length) { root.innerHTML = head + emptyState(K.icon, K.empty, K.emptySub); refreshIcons(); return; }
  const chips = cats.length > 1 ? '<div class="v7-chips">' + ['all'].concat(cats).map(c => '<button type="button" class="chip' + (V37.cat[kind] === c ? ' chip-active' : '') + '" onclick="V37.cat.' + kind + '=' + jsArg(c) + ';renderLib(\'' + kind + '\')">' + (c === 'all' ? 'Semua' : esc(c)) + '</button>').join('') + '</div>' : '';
  root.innerHTML = head + chips + '<div id="lib-' + kind + '-list"></div>';
  renderLibList(kind);
}
function renderLibList(kind) {
  const box = document.getElementById('lib-' + kind + '-list'); if (!box) return;
  const list = libFilter(kind);
  if (!list.length) { box.innerHTML = emptyState('search-x', 'Tidak ada hasil', 'Coba kata kunci atau kategori lain.'); refreshIcons(); return; }
  box.innerHTML = '<div class="v7-grid' + (kind === 'prompts' ? ' is-prompt' : '') + '">' + list.map(x => kind === 'prompts' ? promptCard(x) : fileCard(kind, x)).join('') + '</div>';
  refreshIcons();
}
function libTags(x) { return (x.tags || []).length ? '<div class="v7-tags">' + x.tags.map(t => '<span>#' + esc(t) + '</span>').join('') + '</div>' : ''; }

function promptCard(x) {
  const open = !!V37.open[x.id], long = (x.body || '').length > 320 || (x.body || '').split('\n').length > 7;
  const ok = Date.now() - (V37.copied[x.id] || 0) < 1800;
  return '<article class="v7-card v7-prompt spot" id="pc-' + esc(x.id) + '"><div class="v7-card-top"><span class="badge badge-ai">' + esc(x.category || 'Umum') + '</span>' +
      '<button type="button" class="v7-copy' + (ok ? ' is-ok' : '') + '" onclick="copyPrompt(' + jsArg(x.id) + ',this)" title="Salin prompt">' + v7icon(ok ? 'check' : 'copy') + '<span>' + (ok ? 'Tersalin' : 'Salin') + '</span></button></div>' +
    '<h3>' + esc(x.title) + '</h3>' + (x.description ? '<p class="v7-desc">' + esc(x.description) + '</p>' : '') +
    '<pre class="v7-body' + (open || !long ? ' is-open' : '') + '">' + esc(x.body) + '</pre>' +
    (long ? '<button type="button" class="v7-more" onclick="V37.open[' + jsArg(x.id) + ']=!V37.open[' + jsArg(x.id) + '];renderLibList(\'prompts\')">' + (open ? 'Ciutkan' : 'Lihat selengkapnya') + '</button>' : '') +
    libTags(x) + '</article>';
}
/** Salin 1 klik: tombol langsung berubah "Tersalin" (tanpa menunggu server). */
function copyPrompt(id, btn) {
  const x = Lib.find('prompts', id); if (!x) return;
  const done = () => { V37.copied[id] = Date.now(); if (!btn) return; btn.classList.add('is-ok'); btn.innerHTML = v7icon('check') + '<span>Tersalin</span>'; refreshIcons(); clearTimeout(btn._t); btn._t = setTimeout(() => { btn.classList.remove('is-ok'); btn.innerHTML = v7icon('copy') + '<span>Salin</span>'; refreshIcons(); }, 1800); };
  const fb = () => { const ta = document.createElement('textarea'); ta.value = x.body; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { showToast('Gagal menyalin', 'Blok teks prompt lalu salin manual.', 'error'); } ta.remove(); };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(x.body).then(done, fb); else fb();
}

function fileCard(kind, x) {
  const app = kind === 'apps', open = !!V37.open[x.id];
  const access = x.accessMode === 'restricted'
    ? (x.allowed ? '<span class="badge badge-success">' + v7icon('unlock', 'w-3.5 h-3.5') + ' Akses Anda aktif</span>' : '<span class="badge badge-warning">' + v7icon('lock', 'w-3.5 h-3.5') + ' Khusus pemilik kelas</span>')
    : '<span class="badge badge-document">' + v7icon('users', 'w-3.5 h-3.5') + ' Semua member</span>';
  const need = !x.allowed && (x.need || []).length ? '<div class="v7-need"><p>Terbuka otomatis bila Anda memiliki salah satu:</p>' + x.need.map(n =>
      '<button type="button" onclick="' + (n.type === 'product' ? 'go(\'product\',' + jsArg(n.id) + ')' : 'go(\'bootcamp\')') + '">' + v7icon(n.type === 'product' ? 'graduation-cap' : 'calendar-days', 'w-3.5 h-3.5') + ' ' + esc(n.title) + '</button>').join('') + '</div>'
    : (!x.allowed ? '<div class="v7-need"><p>Akses berkas ini diatur Admin. Hubungi Admin untuk informasi.</p></div>' : '');
  return '<article class="v7-card v7-file-card spot' + (x.allowed ? '' : ' is-locked') + '">' +
    (app ? '<div class="v7-thumb">' + (x.thumb ? img(x.thumb, x.title, 'loading="lazy"', x.title.charAt(0)) : '<span>' + v7icon('app-window', 'w-9 h-9') + '</span>') + '</div>' : '') +
    '<div class="v7-card-top">' + (app ? '' : '<span class="v7-ic">' + v7icon('zap', 'w-5 h-5') + '</span>') + '<div class="v7-badges"><span class="badge badge-ai">' + esc(x.category || 'Umum') + '</span>' + access + '</div></div>' +
    '<h3>' + esc(x.title) + (x.version ? ' <small>v' + esc(String(x.version).replace(/^v/i, '')) + '</small>' : '') + '</h3>' +
    (x.description ? '<p class="v7-desc">' + esc(x.description) + '</p>' : '') +
    (x.fileName ? '<p class="v7-meta">' + v7icon(app ? 'file-archive' : 'file', 'w-3.5 h-3.5') + ' <span class="truncate">' + esc(x.fileName) + '</span>' + (x.fileSize ? ' · ' + esc(x.fileSize) : '') + '</p>' : '') +
    libTags(x) + need +
    (x.guide ? '<button type="button" class="v7-more" onclick="V37.open[' + jsArg(x.id) + ']=!V37.open[' + jsArg(x.id) + '];renderLibList(\'' + kind + '\')">' + (open ? 'Tutup panduan' : (app ? 'Panduan pasang' : 'Cara pakai')) + '</button>' + (open ? '<pre class="v7-body is-open">' + esc(x.guide) + '</pre>' : '') : '') +
    '<div class="v7-actions">' +
      (x.allowed ? '<button type="button" class="btn-primary" onclick="libDownload(\'' + kind + '\',' + jsArg(x.id) + ',this)"' + (x.hasFile ? '' : ' disabled') + '>' + v7icon('download') + ' ' + (app ? 'Unduh .zip' : 'Unduh Skill') + '</button>'
                 : '<button type="button" class="btn-ghost" disabled>' + v7icon('lock') + ' Terkunci</button>') +
      (app && x.demoUrl ? '<button type="button" class="btn-ghost" onclick="openLink(' + jsArg(x.demoUrl) + ')">' + v7icon('external-link') + ' Demo</button>' : '') +
    '</div></article>';
}
async function libDownload(kind, id, btn) {
  const res = await withBusy(btn, 'Menyiapkan…', () => api('libraryDownload', { id: id }));
  if (!res.success) {
    if (res.data && res.data.code === 'FORBIDDEN') { Swal.fire({ icon: 'info', title: 'Belum ada akses', text: res.message }); Lib.load(); }
    else showToast('Gagal mengunduh', res.message, 'error');
    return;
  }
  clickLink(res.data.url, true);
  showToast('Unduhan dimulai', res.data.fileName || 'Berkas dibuka di tab baru.', 'success');
}


// ════════════════════════════════════════════════════════════
// 6. TUR PANDUAN (login pertama) — sorot elemen satu per satu
// ════════════════════════════════════════════════════════════
const Tour = {
  i: 0, steps: [], on: false, el: null, _tries: 0,
  all() {
    const nick = Member.profile().nickname || '';
    return [
      { title: 'Selamat datang' + (nick ? ', ' + nick : '') + '! 👋', text: 'Tampilan portal diperbarui. Ikuti tur singkat ini (±1 menit) untuk mengenal menu barunya. Anda bisa melewatinya kapan saja.' },
      { sel: '#msbBurger', mobile: true, title: 'Tombol menu', text: 'Di HP, ketuk tombol ini untuk membuka menu samping.' },
      { sel: '#msbNav', drawer: true, title: 'Menu kini di samping', text: 'Semua menu dikelompokkan di sidebar: Belajar, Sumber Daya AI, serta Komunitas & Layanan. Di komputer, sidebar bisa diciutkan lewat ikon di pojok atasnya.' },
      { sel: '#msb [data-nav="library"]', drawer: true, title: 'Kelas Saya', text: 'Semua kelas, aplikasi, dan dokumen yang sudah Anda miliki ada di sini.' },
      { sel: '#msb [data-nav="prompts"]', drawer: true, title: 'Master Prompt', text: 'Kumpulan prompt AI siap pakai. Cukup klik tombol Salin — langsung tempel di ChatGPT, Claude, atau Gemini.' },
      { sel: '#msb [data-nav="skills"]', drawer: true, title: 'Bank Skill', text: 'Unduh berkas skill AI. Sebagian untuk semua member, sebagian terbuka otomatis sesuai kelas yang Anda miliki.' },
      { sel: '#msb [data-nav="apps"]', drawer: true, title: 'Library Aplikasi', text: 'Source code aplikasi web siap pasang (.zip) — tombol unduh aktif sesuai kelas/bootcamp Anda.' },
      { sel: '#msb [data-nav="helpdesk"]', drawer: true, title: 'Butuh bantuan?', text: 'Buka Helpdesk untuk panduan & jawaban cepat, atau hubungi Admin dari sana.' },
      { sel: '#msb [data-tour="pin"]', drawer: true, title: 'PIN & Keamanan', text: 'Login utama memakai Google. Buat/ganti PIN 6 angka di sini sebagai cadangan bila Google bermasalah.' },
      { sel: '#topnav .btn-amber', title: 'Redeem Kode', text: 'Punya kode akses baru dari Lynk.id? Tukarkan di sini kapan saja.' },
      { sel: '#avatar', title: 'Profil Anda', text: 'Perbarui nama panggilan dan nomor WhatsApp. Nomor ini dipakai untuk memulihkan akun bila lupa PIN.' },
      { title: 'Siap digunakan 🎉', text: 'Demi keamanan, sesi berakhir otomatis setelah 3 jam tanpa aktivitas. Tur ini bisa diulang dari menu "Tur Panduan" di bagian bawah sidebar.' }
    ];
  },
  key() { return userKey('tour37'); },
  /** Tampil otomatis sekali: server belum mencatat tur selesai & tidak ada dialog lain yang terbuka. */
  maybe() {
    if (this.on || AppState.role !== ROLE_MEMBER || !V37.lib || !V37.lib.me || V37.lib.me.tourDone || Store.get(this.key(), 0)) return;
    if (AppState.currentPage !== 'home' || (window.Swal && Swal.isVisible()) || !document.getElementById('msb')) {
      if (this._tries++ < 40) { clearTimeout(this._t); this._t = setTimeout(() => Tour.maybe(), 1500); }
      return;
    }
    this.start(false);
  },
  start(manual) {
    if (AppState.role !== ROLE_MEMBER) return;
    Msb.build();
    this.steps = this.all().filter(s => !s.mobile || Msb.mobile());
    this.i = 0; this.on = true; this.manual = !!manual;
    if (!this.el) {
      this.el = document.createElement('div'); this.el.className = 'v7-tour'; this.el.setAttribute('role', 'dialog'); this.el.setAttribute('aria-modal', 'true');
      this.el.innerHTML = '<div class="v7-tour-hole"></div><div class="v7-tour-pop"><p class="v7-tour-n"></p><h3></h3><p class="v7-tour-t"></p>' +
        '<div class="v7-tour-b"><button type="button" class="v7-tour-skip" onclick="Tour.end(true)">Lewati</button><span class="flex-1"></span>' +
        '<button type="button" class="btn-ghost !w-auto" onclick="Tour.go(-1)">Kembali</button><button type="button" class="btn-primary !w-auto" onclick="Tour.go(1)">Lanjut</button></div></div>';
      document.body.appendChild(this.el);
      window.addEventListener('resize', () => { if (Tour.on) Tour.show(); });
      document.addEventListener('keydown', e => { if (!Tour.on) return; if (e.key === 'Escape') Tour.end(true); else if (e.key === 'ArrowRight' || e.key === 'Enter') Tour.go(1); else if (e.key === 'ArrowLeft') Tour.go(-1); });
    }
    this.el.classList.add('is-on');
    document.body.classList.add('v7-touring');
    this.show();
  },
  go(d) {
    let n = this.i + d;
    // lewati langkah yang elemennya tidak ada / tidak terlihat di ukuran layar ini
    while (n >= 0 && n < this.steps.length && this.steps[n].sel && !this.visible(this.steps[n])) n += d;
    if (n >= this.steps.length) return this.end(false);
    if (n < 0) return;
    this.i = n; this.show();
  },
  visible(s) {
    if (s.drawer && Msb.mobile()) return !!document.querySelector(s.sel);
    return v7has(s.sel);
  },
  show() {
    const s = this.steps[this.i]; if (!s) return this.end(false);
    const hole = this.el.querySelector('.v7-tour-hole'), pop = this.el.querySelector('.v7-tour-pop');
    if (s.drawer && Msb.mobile()) Msb.open(); else if (Msb.mobile()) Msb.close();
    pop.querySelector('.v7-tour-n').textContent = 'Langkah ' + (this.i + 1) + ' dari ' + this.steps.length;
    pop.querySelector('h3').textContent = s.title;
    pop.querySelector('.v7-tour-t').textContent = s.text;
    const btns = pop.querySelectorAll('.v7-tour-b button');
    btns[1].style.visibility = this.i ? 'visible' : 'hidden';
    btns[2].textContent = this.i === this.steps.length - 1 ? 'Selesai' : (this.i ? 'Lanjut' : 'Mulai Tur');
    const place = () => {
      const t = s.sel ? document.querySelector(s.sel) : null;
      const vw = window.innerWidth, vh = window.innerHeight;
      if (!t || !t.getClientRects().length) {                           // langkah tanpa target → kartu di tengah
        hole.style.cssText = 'left:50%;top:50%;width:0;height:0;';
        pop.style.cssText = 'left:50%;top:50%;transform:translate(-50%,-50%);';
        return;
      }
      if (t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      const r = t.getBoundingClientRect(), pad = 6;
      const x = Math.max(4, r.left - pad), y = Math.max(4, r.top - pad), w = Math.min(vw - x - 4, r.width + pad * 2), h = Math.min(vh - y - 4, r.height + pad * 2);
      hole.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;';
      pop.style.cssText = 'left:0;top:0;transform:none;visibility:hidden;';
      const pw = pop.offsetWidth, ph = pop.offsetHeight, gap = 14;
      let px, py;
      if (x + w + gap + pw <= vw - 8) { px = x + w + gap; py = y + h / 2 - ph / 2; }            // kanan
      else if (y + h + gap + ph <= vh - 8) { px = x + w / 2 - pw / 2; py = y + h + gap; }        // bawah
      else if (y - gap - ph >= 8) { px = x + w / 2 - pw / 2; py = y - gap - ph; }                // atas
      else if (x - gap - pw >= 8) { px = x - gap - pw; py = y + h / 2 - ph / 2; }                // kiri
      else { px = vw / 2 - pw / 2; py = vh - ph - 12; }
      px = Math.max(8, Math.min(vw - pw - 8, px)); py = Math.max(8, Math.min(vh - ph - 8, py));
      pop.style.cssText = 'left:' + px + 'px;top:' + py + 'px;transform:none;';
    };
    place();
    clearTimeout(this._pt); this._pt = setTimeout(() => { if (Tour.on && Tour.steps[Tour.i] === s) place(); }, 320);   // setelah laci selesai bergeser
  },
  end(skipped) {
    if (!this.on) return;
    this.on = false;
    this.el.classList.remove('is-on');
    document.body.classList.remove('v7-touring');
    if (Msb.mobile()) Msb.close();
    Store.set(this.key(), 1);
    if (V37.lib && V37.lib.me && !V37.lib.me.tourDone) { V37.lib.me.tourDone = true; Lib.persist(); api('tourDone', {}, { silentAuth: true }); }
    if (skipped && !this.manual) showToast('Tur dilewati', 'Bisa dibuka lagi dari menu "Tur Panduan" di sidebar.', 'info');
  }
};


// ════════════════════════════════════════════════════════════
// 7. KECEPATAN: data dimuat SEBELUM menu diklik
// ════════════════════════════════════════════════════════════
const Pre = {
  t: null, last: {},
  member: {
    prompts: () => Lib.load(60000), skills: () => Lib.load(60000), apps: () => Lib.load(60000),
    jalur: () => swr(userKey('paths'), 'learningPaths', {}, () => {}, { fresh: 60000, toastError: false })
  },
  admin: { dashboard: 'dashboard', products: 'productsAdmin', keys: 'keysAdmin', orders: 'ordersAdmin', crm: 'crm', custom: 'customAdmin', bootcamps: 'bootcampsAdmin',
    showcase: 'showcaseAdmin', guides: 'guidesAdmin', announcements: 'announcementsAdmin', helpdesk: 'helpdeskAdmin', settings: 'settingsAdmin', notif: 'notifConfig', blast: 'blastAdmin',
    library: 'libraryAdmin', registrations: 'registrationsAdmin', security: 'authAdmin' },
  /** Kursor/jari menyentuh menu → ambil datanya lebih dulu (maks. 1× per 20 detik per menu). */
  hit(nav) {
    if (!nav || Date.now() - (this.last[nav] || 0) < 20000) return;
    if (nav.indexOf('admin-') === 0) {
      if (!isStaff() || typeof Admin === 'undefined' || !Admin.booted) return;
      const a = this.admin[nav.slice(6)];
      if (!a || !ADMIN_RENDER[a] || Admin.isFresh(a, 30000)) return;
      this.last[nav] = Date.now();
      Admin.fetch(a);
    } else if (AppState.role === ROLE_MEMBER) {
      this.last[nav] = Date.now();
      if (this.member[nav]) this.member[nav]();
      else if (typeof Member !== 'undefined') Member.softRefresh();
    }
  },
  init() {
    const on = e => {
      const el = e.target && e.target.closest ? e.target.closest('[data-nav]') : null;
      if (!el) return;
      clearTimeout(Pre.t);
      const nav = el.dataset.nav;
      Pre.t = setTimeout(() => Pre.hit(nav), e.type === 'touchstart' ? 0 : 120);
    };
    document.addEventListener('pointerover', on, { passive: true });
    document.addEventListener('touchstart', on, { passive: true });
    document.addEventListener('focusin', on);
  },
  /** Setelah beranda tampil & browser senggang → siapkan data menu yang paling sering dibuka. */
  idle() {
    if (AppState.role !== ROLE_MEMBER) return;
    const run = window.requestIdleCallback || (fn => setTimeout(fn, 1200));
    run(() => { if (AppState.role !== ROLE_MEMBER) return; Lib.load(300000); Pre.member.jalur(); });
  }
};

// Data pustaka & tur disiapkan begitu member masuk / halaman dibuka
const _onMemberLogin37 = onMemberLogin;
onMemberLogin = function (d) { _onMemberLogin37(d); V37.lib = null; Tour._tries = 0; Pre.idle(); };   // eslint-disable-line no-global-assign
const _clearSession37 = clearSession;
clearSession = function () { _clearSession37(); V37.lib = null; V37.open = {}; Msb.close(); if (Tour.on) { Tour.on = false; if (Tour.el) Tour.el.classList.remove('is-on'); document.body.classList.remove('v7-touring'); } };   // eslint-disable-line no-global-assign

document.addEventListener('DOMContentLoaded', () => {
  Idle.init();
  Pre.init();
  if (AppState.role === ROLE_MEMBER) { Idle.mark(true); Pre.idle(); }
});
