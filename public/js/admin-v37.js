/**
 * ============================================================
 * admin-v37.js — Panel Admin v3.7 (berkas BARU, dimuat bersama modul admin lain)
 * ------------------------------------------------------------
 * 1. Pustaka AI        : Master Prompt · Bank Skill · Library Aplikasi (+ hak unduh per kelas/bootcamp)
 * 2. Pendaftar & Bukti : lihat bukti invoice Lynk.id → setujui / tolak
 * 3. Keamanan Login    : status PIN member · reset PIN · kirim PIN bertahap · mode transisi
 * Semua aksi simpan/hapus/setujui memakai TAMPILAN OPTIMISTIS: layar berubah seketika,
 * server menyusul di latar; bila server menolak, tampilan dikembalikan & pesan galat muncul.
 * ============================================================
 */

// ── Menu & label log ──
(function () {
  const add = (group, item, afterId) => {
    const g = ADMIN_MENU.filter(x => x.group === group)[0]; if (!g || g.items.some(x => x.id === item.id)) return;
    const i = g.items.map(x => x.id).indexOf(afterId);
    g.items.splice(i > -1 ? i + 1 : g.items.length, 0, item);
  };
  add('Member & Transaksi', { id: 'registrations', icon: 'user-check', label: 'Pendaftar & Bukti', badge: true }, 'crm');
  add('Member & Transaksi', { id: 'security', icon: 'fingerprint', label: 'Keamanan Login' }, 'access');
  add('Konten', { id: 'library', icon: 'sparkles', label: 'Pustaka AI' }, 'paths');
  Object.assign(ACTION_LABELS, { PIN_SENT: 'PIN Dikirim', PIN_RESET: 'PIN Direset Admin', PIN_RECOVER: 'Pemulihan Akun', PIN_CHANGE: 'PIN Diganti Member', PIN_BLAST_START: 'Kirim PIN Bertahap Dimulai',
    PIN_BLAST_STOP: 'Kirim PIN Bertahap Dihentikan', PIN_BLAST_RUN: 'PIN Bertahap Terkirim', RECOVER_FAILED: 'Pemulihan Gagal', AUTH_MODE: 'Mode Login Diubah',
    LIB_SAVE: 'Pustaka Disimpan', LIB_DELETE: 'Pustaka Dihapus', LIB_DOWNLOAD: 'Unduh Pustaka', LIB_DENIED: 'Unduh Pustaka Ditolak', REGISTER_REQUEST: 'Pendaftaran Masuk', REG_APPROVE: 'Pendaftaran Disetujui', REG_REJECT: 'Pendaftaran Ditolak' });
  const menu = document.getElementById('sidebarMenu'); if (menu) menu.dataset.ready = '';      // gambar ulang bila sidebar sudah tampil
})();

// Data menu v3.7 ikut disiapkan saat browser senggang; lencana pendaftar ikut KPI dashboard
const _extra37 = Admin.extra;
Admin.extra = function () { return _extra37.call(this).concat(['registrationsAdmin', 'libraryAdmin']); };
const _dashBadges37 = setDashBadges;
setDashBadges = function (k) { _dashBadges37(k); setNavBadge('registrations', (k && k.pendingReg) || 0); };   // eslint-disable-line no-global-assign

const A7 = { tab: 'prompt', q: '', secQ: '', secF: 'all', secPage: 1, it: null, busyUp: false };
const A7_KIND = {
  prompt: { label: 'Master Prompt', icon: 'sparkles', one: 'Prompt' },
  skill: { label: 'Bank Skill', icon: 'zap', one: 'Skill' },
  app: { label: 'Library Aplikasi', icon: 'app-window', one: 'Aplikasi' }
};
function a7uid() { return 'L' + (window.crypto && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').slice(0, 20) : Date.now().toString(36) + Math.random().toString(36).slice(2, 10)); }
function a7keep(action) { const d = AppState.a[action]; if (d) Store.set(Admin.key(action), { t: Date.now(), h: hashData(d), data: d }); }
function a7sqlHint(res) { return res && res.data && res.data.code === 'SQL_V37'; }


// ════════════════════════════════════════════════════════════
// 1. PUSTAKA AI
// ════════════════════════════════════════════════════════════
adminRoute('library', {
  title: 'Pustaka AI',
  template: () => '<div class="page-wrap-fluid">' + adminHead('Pustaka AI', 'Master Prompt untuk semua member, serta Bank Skill & Library Aplikasi dengan hak unduh per kelas/bootcamp.',
    '<button class="btn-ghost !w-auto" onclick="Admin.fetch(\'libraryAdmin\',{_fresh:true})"><i data-lucide="refresh-cw" class="w-4 h-4"></i> Segarkan</button>' +
    '<button class="btn-primary !w-auto" onclick="editLib37()"><i data-lucide="plus" class="w-4 h-4"></i> Tambah</button>') +
    '<div id="a7LibRoot">' + skeletonRows(5) + '</div></div>',
  show: () => Admin.load('libraryAdmin').then(res => { if (res && !res.success && !AppState.a.libraryAdmin) { const r = document.getElementById('a7LibRoot'); if (r) { r.innerHTML = errorState(res.message, 'route()'); refreshIcons(); } } })
});

ADMIN_RENDER.libraryAdmin = function (d) {
  const root = document.getElementById('a7LibRoot'); if (!root || !d) return;
  const count = k => d.items.filter(x => x.kind === k).length;
  root.innerHTML = '<div class="flex flex-wrap items-center justify-between gap-3 mb-4"><div class="seg">' + Object.keys(A7_KIND).map(k =>
      '<button class="' + (A7.tab === k ? 'is-active' : '') + '" onclick="A7.tab=\'' + k + '\';ADMIN_RENDER.libraryAdmin(AppState.a.libraryAdmin)">' + A7_KIND[k].label + ' (' + count(k) + ')</button>').join('') + '</div>' +
    '<label class="v7-search"><i data-lucide="search" class="w-4 h-4"></i><input id="a7LibQ" type="search" placeholder="Cari judul / kategori…" value="' + esc(A7.q) + '" oninput="A7.q=this.value;a7LibList()"></label></div>' +
    '<div id="a7LibList"></div>';
  a7LibList();
};
function a7LibList() {
  const d = AppState.a.libraryAdmin, box = document.getElementById('a7LibList'); if (!d || !box) return;
  const q = A7.q.trim().toLowerCase(), K = A7_KIND[A7.tab];
  const P = {}, B = {}; d.products.forEach(p => { P[p.id] = p.title; }); d.bootcamps.forEach(b => { B[b.id] = b.title; });
  const list = d.items.filter(x => x.kind === A7.tab && (!q || (x.title + ' ' + x.category + ' ' + x.description + ' ' + (x.tags || []).join(' ')).toLowerCase().indexOf(q) > -1));
  if (!list.length) { box.innerHTML = emptyState(K.icon, q ? 'Tidak ada hasil' : 'Belum ada ' + K.label, q ? 'Coba kata kunci lain.' : 'Klik "Tambah" untuk membuat yang pertama.'); refreshIcons(); return; }
  box.innerHTML = '<div class="a7-list">' + list.map(x => {
    const acc = x.kind === 'prompt' || x.accessMode !== 'restricted' ? '<span class="badge badge-document">Semua member</span>'
      : x.productIds.map(id => '<span class="badge badge-warning" title="Kelas">' + esc(shortText(P[id] || '(kelas dihapus)', 26)) + '</span>').concat(x.bootIds.map(id => '<span class="badge badge-video" title="Bootcamp">' + esc(shortText(B[id] || '(bootcamp dihapus)', 26)) + '</span>')).join('');
    const sub = x.kind === 'prompt' ? shortText(x.body, 110) : ((x.fileName || (x.fileUrl ? 'Link berkas' : 'Belum ada berkas')) + (x.fileSize ? ' · ' + x.fileSize : '') + (x.version ? ' · v' + String(x.version).replace(/^v/i, '') : ''));
    return '<div class="a7-row' + (x._saving ? ' is-saving' : '') + (x.status === 'Draft' ? ' is-draft' : '') + '"><span class="v7-ic"><i data-lucide="' + K.icon + '" class="w-5 h-5"></i></span>' +
      '<div class="a7-main"><b>' + esc(x.title) + '</b><small>' + (x.category ? esc(x.category) + ' · ' : '') + esc(sub) + '</small></div>' +
      '<div class="a7-badges">' + acc + (x.status === 'Draft' ? '<span class="badge badge-document">Draf</span>' : '<span class="badge badge-success">Tayang</span>') + '</div>' +
      '<div class="a7-act"><button class="btn-icon" title="' + (x.status === 'Draft' ? 'Tayangkan' : 'Jadikan draf') + '" onclick="toggleLib37(' + jsArg(x.id) + ')"><i data-lucide="' + (x.status === 'Draft' ? 'eye' : 'archive') + '" class="w-4 h-4"></i></button>' +
      '<button class="btn-icon" title="Ubah" onclick="editLib37(' + jsArg(x.id) + ')"><i data-lucide="pencil" class="w-4 h-4"></i></button>' +
      '<button class="btn-icon" title="Hapus" onclick="deleteLib37(' + jsArg(x.id) + ')"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div></div>';
  }).join('') + '</div>';
  refreshIcons();
}

/** Bentuk data yang dikirim ke server dari satu item. */
function a7payload(x) {
  return { id: x._new ? '' : x.id, newId: x._new ? x.id : '', kind: x.kind, title: x.title, category: x.category, description: x.description, body: x.body, fileId: x.fileId, fileName: x.fileName,
    fileSize: x.fileSize, fileUrl: x.fileUrl, version: x.version, demoUrl: x.demoUrl, thumbFileId: x.thumbFileId, tags: x.tags, accessMode: x.accessMode, productIds: x.productIds, bootIds: x.bootIds, sort: x.sort, status: x.status };
}
/** Simpan optimistis: daftar langsung berubah → server → bila gagal, dikembalikan. */
async function a7commit(next, undoMsg) {
  const d = AppState.a.libraryAdmin; if (!d) return;
  const snap = d.items.slice(), i = d.items.map(x => x.id).indexOf(next.id);
  const row = Object.assign({}, next, { _saving: true, updatedAt: new Date().toISOString() });
  if (i > -1) d.items[i] = row; else d.items.unshift(row);
  if (A7.tab !== next.kind) A7.tab = next.kind;
  ADMIN_RENDER.libraryAdmin(d);
  const res = await api('saveLibraryItem', a7payload(next));
  const cur = AppState.a.libraryAdmin; if (!cur) return res;
  if (!res.success) {
    cur.items = snap; ADMIN_RENDER.libraryAdmin(cur);
    Swal.fire({ icon: 'error', title: undoMsg || 'Gagal menyimpan', text: res.message + (a7sqlHint(res) ? '' : ' Perubahan dibatalkan.'), showCancelButton: !next._toggle, confirmButtonText: next._toggle ? 'OK' : 'Buka lagi formulir', cancelButtonText: 'Tutup' })
      .then(r => { if (r.isConfirmed && !next._toggle) editLib37(next.id, next); });
    return res;
  }
  const j = cur.items.map(x => x.id).indexOf(next.id);
  if (j > -1) cur.items[j] = res.data.item; else cur.items.unshift(res.data.item);
  a7keep('libraryAdmin'); ADMIN_RENDER.libraryAdmin(cur);
  showToast('Tersimpan', res.message, 'success');
  return res;
}
function toggleLib37(id) {
  const x = (AppState.a.libraryAdmin.items || []).filter(i => i.id === id)[0]; if (!x || x._saving) return;
  a7commit(Object.assign({}, x, { status: x.status === 'Draft' ? 'Published' : 'Draft', _toggle: true }), 'Gagal mengubah status');
}
async function deleteLib37(id) {
  const d = AppState.a.libraryAdmin, x = d.items.filter(i => i.id === id)[0]; if (!x) return;
  const q = await Swal.fire({ icon: 'warning', title: 'Hapus "' + x.title + '"?', text: x.kind === 'prompt' ? 'Prompt dihapus dari portal member.' : 'Berkasnya ikut dipindah ke tempat sampah Drive. Member tidak bisa lagi mengunduhnya.', showCancelButton: true, confirmButtonText: 'Hapus', cancelButtonText: 'Batal' });
  if (!q.isConfirmed) return;
  const snap = d.items.slice();
  d.items = d.items.filter(i => i.id !== id); ADMIN_RENDER.libraryAdmin(d);                    // hilang seketika
  const res = await api('deleteLibraryItem', { id: id });
  if (!res.success) { const cur = AppState.a.libraryAdmin; if (cur) { cur.items = snap; ADMIN_RENDER.libraryAdmin(cur); } showToast('Gagal menghapus', res.message + ' Item dikembalikan.', 'error'); return; }
  a7keep('libraryAdmin'); showToast('Dihapus', res.message, 'success');
}

/** Unggah berkas dari formulir (skill: bebas format · aplikasi: wajib .zip · sampul: gambar). */
async function a7upload(input, what) {
  const f = input.files && input.files[0]; if (!f) return;
  const it = A7.it, info = document.getElementById(what === 'thumb' ? 'a7ThumbInfo' : 'a7FileInfo');
  const fail = m => { input.value = ''; info.innerHTML = '<p class="v7-err">' + esc(m) + '</p>'; };
  if (what === 'file' && it.kind === 'app' && !/\.zip$/i.test(f.name)) return fail('Library Aplikasi hanya menerima berkas .zip.');
  if (what === 'thumb' && !/^image\//.test(f.type)) return fail('Sampul harus berupa gambar (JPG/PNG/WEBP).');
  const max = what === 'thumb' ? 5 : 25;
  if (f.size > max * 1048576) return fail('Ukuran ' + fmtBytes(f.size) + ' — maksimal ' + max + ' MB.' + (what === 'file' ? ' Untuk berkas lebih besar, unggah ke Google Drive lalu tempel link-nya.' : ''));
  A7.busyUp = true; const ok = Swal.getConfirmButton(); if (ok) ok.disabled = true;
  info.innerHTML = '<p class="v7-file"><span class="spinner-inline"></span> Mengunggah ' + esc(f.name) + ' (' + fmtBytes(f.size) + ')…</p>';
  let res;
  try {
    const b64 = await readFileAsBase64(f, max);
    res = await api('upload', { kind: what === 'thumb' ? 'libthumb' : (it.kind === 'app' ? 'applib' : 'skill'), base64: b64, fileName: f.name, mimeType: f.type || 'application/octet-stream' }, { timeout: 300000 });
  } catch (e) { res = { success: false, message: e.message }; }
  A7.busyUp = false; if (ok) ok.disabled = false;
  if (!res.success) return fail(res.message);
  if (what === 'thumb') { it.thumbFileId = res.data.fileId; it.thumb = res.data.viewUrl; }
  else { it.fileId = res.data.fileId; it.fileName = f.name; it.fileSize = fmtBytes(f.size); it.fileUrl = ''; const u = document.getElementById('a7Url'); if (u) u.value = ''; }
  a7fileInfo();
}
function a7fileInfo() {
  const it = A7.it, a = document.getElementById('a7FileInfo'), b = document.getElementById('a7ThumbInfo');
  if (a) a.innerHTML = it.fileId ? '<p class="v7-file"><i data-lucide="check-circle-2" class="w-4 h-4"></i> <b class="truncate">' + esc(it.fileName || 'Berkas terunggah') + '</b> <span>' + esc(it.fileSize || '') + '</span></p>' : '';
  if (b) b.innerHTML = it.thumbFileId ? '<p class="v7-file"><i data-lucide="image" class="w-4 h-4"></i> <b class="truncate">Sampul terpasang</b> <span><button type="button" class="underline" onclick="A7.it.thumbFileId=\'\';A7.it.thumb=\'\';a7fileInfo()">hapus</button></span></p>' : '';
  refreshIcons();
}
function a7accessUi() { const on = document.getElementById('a7Acc') && document.getElementById('a7Acc').value === 'restricted'; const p = document.getElementById('a7PickBox'); if (p) p.hidden = !on; }

async function editLib37(id, draft) {
  const d = AppState.a.libraryAdmin; if (!d) return;
  const cur = draft || (id ? d.items.filter(x => x.id === id)[0] : null);
  const kind = cur ? cur.kind : A7.tab, K = A7_KIND[kind];
  const it = A7.it = Object.assign({ id: a7uid(), _new: true, kind: kind, title: '', category: '', description: '', body: '', fileId: '', fileName: '', fileSize: '', fileUrl: '', version: '', demoUrl: '',
    thumbFileId: '', thumb: '', tags: [], accessMode: 'all', productIds: [], bootIds: [], sort: 0, status: 'Published' }, cur ? JSON.parse(JSON.stringify(cur)) : {});
  delete it._saving; delete it._toggle;
  const file = kind !== 'prompt';
  const pick = '<div id="a7PickBox" class="a7-pick"' + (it.accessMode === 'restricted' ? '' : ' hidden') + '><p>Kelas / Produk</p>' +
    (d.products.length ? d.products.map(p => '<label><input type="checkbox" data-pid="' + esc(p.id) + '"' + (it.productIds.indexOf(p.id) > -1 ? ' checked' : '') + '> ' + esc(p.title) + ' <span class="text-xs text-muted">(' + esc(catLabel(p.category)) + ')</span></label>').join('') : '<label class="text-muted">Belum ada produk.</label>') +
    '<p>Bootcamp</p>' + (d.bootcamps.length ? d.bootcamps.map(b => '<label><input type="checkbox" data-bid="' + esc(b.id) + '"' + (it.bootIds.indexOf(b.id) > -1 ? ' checked' : '') + '> ' + esc(b.title) + '</label>').join('') : '<label class="text-muted">Belum ada bootcamp.</label>') + '</div>';
  const r = await Swal.fire({
    title: (cur && !cur._new ? 'Ubah ' : 'Tambah ') + K.one, width: 720, showCancelButton: true, confirmButtonText: 'Simpan', cancelButtonText: 'Batal', focusConfirm: false,
    html: '<div class="a7-form pform">' +
      '<div class="g2"><div><label class="form-label">Judul *</label><input id="a7Title" class="form-input" maxlength="140" value="' + esc(it.title) + '" placeholder="' + (kind === 'prompt' ? 'mis. Prompt Riset Pasar' : kind === 'skill' ? 'mis. Skill Penulis Proposal' : 'mis. Aplikasi Kasir Sederhana') + '"></div>' +
        '<div><label class="form-label">Kategori</label><input id="a7Cat" class="form-input" maxlength="60" value="' + esc(it.category) + '" placeholder="mis. Marketing" list="a7CatList"><datalist id="a7CatList">' +
        d.items.filter(x => x.kind === kind).map(x => x.category).filter((c, i, a) => c && a.indexOf(c) === i).map(c => '<option value="' + esc(c) + '">').join('') + '</datalist></div></div>' +
      '<div><label class="form-label">Deskripsi singkat</label><input id="a7Desc" class="form-input" maxlength="600" value="' + esc(it.description) + '" placeholder="Untuk apa & kapan dipakai"></div>' +
      (file ? '<div><label class="form-label">' + (kind === 'app' ? 'Berkas aplikasi (.zip) *' : 'Berkas skill *') + '</label><div class="a7-up"><label class="btn-ghost !w-auto" for="a7File"><i data-lucide="upload-cloud" class="w-4 h-4"></i> Pilih berkas</label>' +
          '<input id="a7File" type="file" class="hidden"' + (kind === 'app' ? ' accept=".zip,application/zip"' : '') + ' onchange="a7upload(this,\'file\')"><div id="a7FileInfo" style="flex:1;min-width:0"></div></div>' +
          '<p class="text-xs text-muted mt-1">Maks. 25 MB. Berkas lebih besar? Unggah ke Google Drive lalu isi link di bawah.</p>' +
          '<input id="a7Url" class="form-input mt-2" value="' + esc(it.fileUrl) + '" placeholder="atau link berkas — https://drive.google.com/…"></div>' +
        '<div class="g2"><div><label class="form-label">Versi</label><input id="a7Ver" class="form-input" maxlength="30" value="' + esc(it.version) + '" placeholder="mis. 1.0"></div>' +
          (kind === 'app' ? '<div><label class="form-label">Link demo</label><input id="a7Demo" class="form-input" value="' + esc(it.demoUrl) + '" placeholder="https://…"></div>' : '<div></div>') + '</div>' +
        (kind === 'app' ? '<div><label class="form-label">Gambar sampul</label><div class="a7-up"><label class="btn-ghost !w-auto" for="a7Thumb"><i data-lucide="image-plus" class="w-4 h-4"></i> Pilih gambar</label><input id="a7Thumb" type="file" class="hidden" accept="image/*" onchange="a7upload(this,\'thumb\')"><div id="a7ThumbInfo" style="flex:1;min-width:0"></div></div></div>' : '')
        : '') +
      '<div><label class="form-label">' + (kind === 'prompt' ? 'Isi prompt *' : kind === 'skill' ? 'Cara pakai (tampil ke semua member)' : 'Panduan pasang (hanya tampil ke member yang berhak)') + '</label>' +
        '<textarea id="a7Body" class="form-input" placeholder="' + (kind === 'prompt' ? 'Tulis prompt lengkap. Gunakan [kurung siku] untuk bagian yang diganti member.' : 'Langkah-langkah singkat…') + '">' + esc(it.body) + '</textarea></div>' +
      (file ? '<div><label class="form-label">Siapa yang boleh mengunduh?</label><select id="a7Acc" class="form-input" onchange="a7accessUi()"><option value="all"' + (it.accessMode !== 'restricted' ? ' selected' : '') + '>Semua member</option>' +
          '<option value="restricted"' + (it.accessMode === 'restricted' ? ' selected' : '') + '>Hanya pemilik kelas / peserta bootcamp tertentu</option></select>' +
          '<p class="text-xs text-muted mt-1">Member cukup memiliki <b>salah satu</b> kelas/bootcamp yang dicentang. Akses terbuka otomatis saat ia memilikinya.</p>' + pick + '</div>' : '') +
      '<div class="g2"><div><label class="form-label">Tag (pisahkan koma)</label><input id="a7Tags" class="form-input" value="' + esc((it.tags || []).join(', ')) + '" placeholder="riset, konten"></div>' +
        '<div class="grid2"><div><label class="form-label">Urutan</label><input id="a7Sort" type="number" class="form-input" value="' + (it.sort || '') + '"></div>' +
        '<div><label class="form-label">Status</label><select id="a7Status" class="form-input"><option value="Published"' + (it.status !== 'Draft' ? ' selected' : '') + '>Tayang</option><option value="Draft"' + (it.status === 'Draft' ? ' selected' : '') + '>Draf</option></select></div></div></div>' +
      '</div>',
    didOpen: () => { a7fileInfo(); refreshIcons(); },
    preConfirm: () => {
      if (A7.busyUp) return Swal.showValidationMessage('Tunggu unggahan berkas selesai.');
      const v = id2 => { const e = document.getElementById(id2); return e ? e.value.trim() : ''; };
      it.title = v('a7Title'); it.category = v('a7Cat'); it.description = v('a7Desc'); it.body = document.getElementById('a7Body').value;
      it.tags = v('a7Tags').split(',').map(s => s.trim().replace(/^#/, '')).filter(Boolean).slice(0, 12); it.sort = Number(v('a7Sort')) || 0; it.status = v('a7Status') === 'Draft' ? 'Draft' : 'Published';
      if (it.title.length < 3) return Swal.showValidationMessage('Judul minimal 3 karakter.');
      if (kind === 'prompt' && it.body.trim().length < 10) return Swal.showValidationMessage('Isi prompt minimal 10 karakter.');
      if (file) {
        it.version = v('a7Ver'); it.fileUrl = v('a7Url'); it.demoUrl = v('a7Demo');
        if (it.fileUrl) { if (!/^https:\/\/\S+$/i.test(it.fileUrl)) return Swal.showValidationMessage('Link berkas harus diawali https://'); if (!it.fileId) { it.fileName = it.fileName && !it.fileSize ? it.fileName : (it.fileUrl.split('/').pop().split('?')[0] || 'Berkas').slice(0, 80); it.fileSize = ''; } }
        if (!it.fileId && !it.fileUrl) return Swal.showValidationMessage(kind === 'app' ? 'Unggah berkas .zip aplikasi atau isi link berkasnya.' : 'Unggah berkas skill atau isi link berkasnya.');
        if (it.demoUrl && !/^https:\/\/\S+$/i.test(it.demoUrl)) return Swal.showValidationMessage('Link demo harus diawali https://');
        it.accessMode = v('a7Acc') === 'restricted' ? 'restricted' : 'all';
        it.productIds = it.accessMode === 'restricted' ? Array.from(document.querySelectorAll('#a7PickBox [data-pid]:checked')).map(e => e.dataset.pid) : [];
        it.bootIds = it.accessMode === 'restricted' ? Array.from(document.querySelectorAll('#a7PickBox [data-bid]:checked')).map(e => e.dataset.bid) : [];
        if (it.accessMode === 'restricted' && !it.productIds.length && !it.bootIds.length) return Swal.showValidationMessage('Centang minimal satu kelas atau bootcamp, atau pilih "Semua member".');
      }
      return it;
    },
    allowOutsideClick: () => !A7.busyUp
  });
  if (!r.isConfirmed || !r.value) return;
  a7commit(r.value);                                                    // dialog sudah tertutup → daftar langsung berubah
}


// ════════════════════════════════════════════════════════════
// 2. PENDAFTAR & BUKTI INVOICE
// ════════════════════════════════════════════════════════════
adminRoute('registrations', {
  title: 'Pendaftar & Bukti',
  template: () => '<div class="page-wrap-fluid">' + adminHead('Pendaftar & Bukti Invoice', 'Periksa bukti invoice Lynk.id tiap pendaftar, lalu setujui atau tolak. Saat disetujui, PIN login otomatis dikirim ke email member.',
    '<button class="btn-ghost !w-auto" onclick="Admin.fetch(\'registrationsAdmin\',{_fresh:true})"><i data-lucide="refresh-cw" class="w-4 h-4"></i> Segarkan</button>') +
    '<div id="a7RegRoot">' + skeletonRows(5) + '</div></div>',
  show: () => Admin.load('registrationsAdmin')
});
ADMIN_RENDER.registrationsAdmin = function (d) {
  if (d) setNavBadge('registrations', d.pending || 0);
  const root = document.getElementById('a7RegRoot'); if (!root || !d) return;
  if (!d.list.length) { root.innerHTML = emptyState('user-check', 'Belum ada pendaftar', 'Pendaftar baru dari formulir "Daftar sebagai member" akan muncul di sini beserta bukti invoice-nya.'); refreshIcons(); return; }
  root.innerHTML = '<div class="a7-list">' + d.list.map(x => {
    const pend = x.status === 'Pending';
    return '<div class="a7-row' + (x._saving ? ' is-saving' : '') + '"><span class="cell-avatar">' + esc(initial(x.fullName || x.email)) + '</span>' +
      '<div class="a7-main"><b>' + esc(x.fullName || x.email) + '</b><small>' + esc(x.email) + (x.whatsapp ? ' · ' + esc(x.whatsapp) : '') + (x.profession ? ' · ' + esc(x.profession) : '') + '</small>' +
        '<small>' + timeAgo(x.createdAt) + (x.note ? ' · “' + esc(shortText(x.note, 80)) + '”' : '') + '</small></div>' +
      '<div class="a7-badges">' + statusBadge(x.status === 'Active' ? 'Active' : x.status) + (x.proof ? '' : '<span class="badge badge-error">Tanpa bukti</span>') + '</div>' +
      '<div class="a7-act">' + (x.proof ? '<button class="btn-ghost !w-auto !py-1.5" onclick="viewProof37(' + jsArg(x.proof.id) + ',' + jsArg(x.fullName || x.email) + ')"><i data-lucide="eye" class="w-4 h-4"></i> Bukti</button>' : '') +
        (x.whatsapp ? '<button class="btn-icon" title="Chat WhatsApp" onclick="openLink(waLink(' + jsArg(x.whatsapp) + '))"><i data-lucide="message-circle" class="w-4 h-4"></i></button>' : '') +
        (pend || x.status === 'Rejected' ? '<button class="btn-primary !w-auto !py-1.5" onclick="decideReg37(' + jsArg(x.id) + ',true)"><i data-lucide="check" class="w-4 h-4"></i> Setujui</button>' : '') +
        (pend ? '<button class="btn-icon" title="Tolak" onclick="decideReg37(' + jsArg(x.id) + ',false)"><i data-lucide="x" class="w-4 h-4"></i></button>' : '') + '</div></div>';
  }).join('') + '</div>';
  refreshIcons();
};
async function viewProof37(proofId, name) {
  Swal.fire({ title: 'Bukti — ' + name, width: 760, showConfirmButton: false, showCloseButton: true, html: '<div id="a7ProofBox" class="text-center py-8"><span class="spinner-inline"></span> Memuat bukti…</div>' });
  const res = await api('regProofFile', { id: proofId }, { timeout: 60000 });
  const box = document.getElementById('a7ProofBox'); if (!box) return;
  if (!res.success) { box.innerHTML = '<p class="v7-err">' + esc(res.message) + '</p>'; return; }
  const d = res.data;
  box.className = 'text-center';
  box.innerHTML = (d.mime === 'application/pdf' ? '<iframe class="a7-proof-pdf" title="Bukti PDF" src="' + esc(d.dataUrl) + '"></iframe>' : '<img class="a7-proof" alt="Bukti invoice" src="' + esc(d.dataUrl) + '">') +
    '<p class="text-xs text-muted mt-3">' + esc(d.name) + ' · ' + esc(d.email) + ' · <a class="underline" download="' + esc(d.name) + '" href="' + esc(d.dataUrl) + '">Unduh</a></p>';
}
async function decideReg37(id, approve) {
  const d = AppState.a.registrationsAdmin, x = d && d.list.filter(i => i.id === id)[0]; if (!x || x._saving) return;
  let reason = '';
  if (approve) {
    const q = await Swal.fire({ icon: 'question', title: 'Setujui ' + (x.fullName || x.email) + '?', html: x.proof ? 'Akun diaktifkan dan <b>PIN login dikirim ke email</b> ' + esc(x.email) + '.' : '<b>Pendaftar ini tidak melampirkan bukti.</b> Tetap setujui?', showCancelButton: true, confirmButtonText: 'Setujui', cancelButtonText: 'Batal' });
    if (!q.isConfirmed) return;
  } else {
    const q = await Swal.fire({ title: 'Tolak pendaftaran?', input: 'text', inputLabel: 'Alasan (dikirim ke pendaftar, opsional)', inputPlaceholder: 'mis. Bukti invoice tidak terbaca', showCancelButton: true, confirmButtonText: 'Tolak', cancelButtonText: 'Batal' });
    if (!q.isConfirmed) return;
    reason = q.value || '';
  }
  const prev = { status: x.status, pending: d.pending };
  x.status = approve ? 'Active' : 'Rejected'; x._saving = true;                                // berubah seketika
  d.pending = d.list.filter(i => i.status === 'Pending').length;
  ADMIN_RENDER.registrationsAdmin(d);
  const res = await api('approveRegistration', { id: id, approve: approve, reason: reason });
  delete x._saving;
  if (!res.success) { x.status = prev.status; d.pending = prev.pending; ADMIN_RENDER.registrationsAdmin(d); showToast('Gagal', res.message + ' Status dikembalikan.', 'error'); return; }
  a7keep('registrationsAdmin'); ADMIN_RENDER.registrationsAdmin(d);
  showToast(approve ? 'Disetujui' : 'Ditolak', res.message, 'success');
  Admin.stale.crm = 1; Admin.stale.authAdmin = 1;
  Admin.fetch('dashboard');
}


// ════════════════════════════════════════════════════════════
// 3. KEAMANAN LOGIN
// ════════════════════════════════════════════════════════════
adminRoute('security', {
  title: 'Keamanan Login',
  template: () => '<div class="page-wrap-fluid">' + adminHead('Keamanan Login Member', 'Member masuk dengan Google (utama) atau PIN 6 angka (cadangan). Sesi member berakhir otomatis setelah 3 jam tanpa aktivitas.',
    '<button class="btn-ghost !w-auto" onclick="Admin.fetch(\'authAdmin\',{_fresh:true})"><i data-lucide="refresh-cw" class="w-4 h-4"></i> Segarkan</button>') +
    '<div id="a7SecRoot">' + skeletonRows(6) + '</div></div>',
  show: () => {
    Admin.load('authAdmin');
    clearInterval(AppState.timers.pin37);
    AppState.timers.pin37 = setInterval(() => { const d = AppState.a.authAdmin; if (AppState.currentPage === 'admin-security' && d && d.job && d.job.on && Activity.due('pin37', 45000, 120000)) Admin.fetch('authAdmin'); }, 15000);
  },
  leave: () => clearInterval(AppState.timers.pin37)
});
ADMIN_RENDER.authAdmin = function (d) {
  const root = document.getElementById('a7SecRoot'); if (!root || !d) return;
  const s = d.stats, j = d.job || {}, pct = s.active ? Math.round(s.withPin / s.active * 100) : 0;
  const days = s.withoutPin ? Math.ceil(s.withoutPin / Math.max(1, d.emailQuota - 15)) : 0;
  root.innerHTML = '<div class="a7-stats">' + kpi('Member aktif', s.active.toLocaleString('id-ID'), 'users') + kpi('Sudah punya PIN', s.withPin.toLocaleString('id-ID'), 'shield-check', '#10B981', pct + '% dari member aktif') +
      kpi('Belum punya PIN', s.withoutPin.toLocaleString('id-ID'), 'shield-alert', '#F59E0B', 'Tetap bisa masuk lewat Google') + kpi('Sisa kuota email hari ini', String(d.emailQuota), 'mail', '#3B82F6', 'Gmail gratis 100/hari · Workspace 1.500/hari') + '</div>' +
    (d.googleReady ? '' : '<div class="notice notice-error mb-5"><i data-lucide="alert-triangle" class="w-5 h-5 flex-none"></i><div class="flex-1 text-sm"><b>Google Client ID belum terpasang di server.</b> Tombol "Masuk dengan Google" belum berfungsi untuk member.</div></div>') +
    '<div class="a7-box"><h3><i data-lucide="send" class="w-5 h-5"></i> Kirim PIN ke member yang belum punya</h3>' +
      '<p>PIN dibuat acak per member dan dikirim ke emailnya <b>sekali</b>, sedikit demi sedikit tiap 10 menit agar tidak melebihi kuota email harian. Bila kuota menipis, pengiriman berhenti sendiri dan lanjut otomatis esok hari.' +
      (s.withoutPin && !j.on ? ' Perkiraan selesai: ±' + days + ' hari dengan kuota saat ini.' : '') + '</p>' +
      (j.on ? '<div class="notice notice-success mb-3"><span class="spinner-inline"></span><div class="flex-1 text-sm"><b>Sedang berjalan</b> — ' + (j.sent || 0) + ' terkirim' + (j.failed ? ', ' + j.failed + ' gagal' : '') + ' · sisa ' + s.withoutPin + ' member' +
          (j.lastRun ? ' · putaran terakhir ' + timeAgo(j.lastRun) : '') + (j.note ? '<br>' + esc(j.note) : '') + '</div></div>'
        : (j.done || j.note ? '<div class="notice mb-3"><i data-lucide="info" class="w-5 h-5 flex-none"></i><div class="flex-1 text-sm">' + esc(j.note || 'Selesai.') + (j.sent ? ' Total terkirim: ' + j.sent + '.' : '') + '</div></div>' : '')) +
      (d.isSuper ? '<div class="flex flex-wrap items-center gap-2">' + (j.on ? '<button class="btn-danger !w-auto" onclick="pinBlast37(\'stop\',this)"><i data-lucide="pause" class="w-4 h-4"></i> Hentikan</button>'
          : '<select id="a7PerRun" class="form-input !w-auto"><option value="10">10 email / 10 menit</option><option value="20" selected>20 email / 10 menit</option><option value="40">40 email / 10 menit</option></select>' +
            '<button class="btn-primary !w-auto" onclick="pinBlast37(\'start\',this)"' + (s.withoutPin ? '' : ' disabled') + '><i data-lucide="send" class="w-4 h-4"></i> Mulai kirim bertahap (' + s.withoutPin + ')</button>') + '</div>'
        : '<p class="text-xs text-muted" style="margin:0">Tombol mulai/henti khusus Superadmin.</p>') + '</div>' +
    '<div class="a7-box"><h3><i data-lucide="key-round" class="w-5 h-5"></i> Reset PIN member</h3><p>PIN baru tampil sekali di layar Anda dan dikirim ke email member. Gunakan bila member lupa PIN dan tidak bisa memulihkan sendiri lewat nomor HP.</p>' +
      '<div class="flex flex-wrap items-center gap-2 mb-3"><label class="v7-search" style="max-width:360px"><i data-lucide="search" class="w-4 h-4"></i><input type="search" placeholder="Cari nama / email / WhatsApp…" value="' + esc(A7.secQ) + '" oninput="A7.secQ=this.value;A7.secPage=1;a7SecList()"></label>' +
      '<div class="seg">' + [['all', 'Semua'], ['no', 'Belum punya PIN'], ['yes', 'Sudah punya']].map(f => '<button class="' + (A7.secF === f[0] ? 'is-active' : '') + '" onclick="A7.secF=\'' + f[0] + '\';A7.secPage=1;ADMIN_RENDER.authAdmin(AppState.a.authAdmin)">' + f[1] + '</button>').join('') + '</div></div>' +
      '<div id="a7SecList"></div></div>' +
    (d.isSuper ? '<div class="a7-box"><h3><i data-lucide="shield-alert" class="w-5 h-5"></i> Mode transisi (darurat)</h3><p>Bila dinyalakan, member bisa masuk <b>hanya dengan email</b> seperti versi lama — tanpa Google maupun PIN. Tidak aman; nyalakan hanya sementara bila ada kendala massal, lalu matikan kembali.</p>' +
      '<button class="' + (d.legacy ? 'btn-danger' : 'btn-ghost') + ' !w-auto" onclick="authMode37(' + (d.legacy ? 'false' : 'true') + ',this)"><i data-lucide="' + (d.legacy ? 'lock' : 'unlock') + '" class="w-4 h-4"></i> ' + (d.legacy ? 'Matikan mode transisi (kembali aman)' : 'Nyalakan mode transisi') + '</button>' +
      (d.legacy ? ' <span class="badge badge-error" style="margin-left:.5rem">SEDANG MENYALA</span>' : '') + '</div>' : '');
  a7SecList();
};
function a7SecList() {
  const d = AppState.a.authAdmin, box = document.getElementById('a7SecList'); if (!d || !box) return;
  const q = A7.secQ.trim().toLowerCase();
  const list = d.members.filter(m => (A7.secF === 'all' || (A7.secF === 'no' ? !m.hasPin : m.hasPin)) && (!q || (m.email + ' ' + m.name + ' ' + m.wa).toLowerCase().indexOf(q) > -1));
  const per = 25, pages = Math.max(1, Math.ceil(list.length / per)); if (A7.secPage > pages) A7.secPage = pages;
  const view = list.slice((A7.secPage - 1) * per, A7.secPage * per);
  if (!list.length) { box.innerHTML = '<p class="text-sm text-muted py-4 text-center">Tidak ada member yang cocok.</p>'; return; }
  box.innerHTML = '<div class="a7-list">' + view.map(m => '<div class="a7-row"><span class="cell-avatar">' + esc(initial(m.name || m.email)) + '</span>' +
      '<div class="a7-main"><b>' + esc(m.name || m.email.split('@')[0]) + '</b><small>' + esc(m.email) + (m.wa ? ' · ' + esc(m.wa) : '') + '</small></div>' +
      '<div class="a7-badges">' + (m.status !== 'Active' ? statusBadge(m.status) : '') + (m.hasPin ? '<span class="badge badge-success" title="' + (m.pinSetAt ? 'Dibuat ' + esc(fmtDateTime(m.pinSetAt)) : '') + '">PIN aktif</span>' : '<span class="badge badge-warning">Belum ada PIN</span>') + '</div>' +
      '<div class="a7-act"><button class="btn-ghost !w-auto !py-1.5" onclick="resetPin37(' + jsArg(m.email) + ')"><i data-lucide="key-round" class="w-4 h-4"></i> ' + (m.hasPin ? 'Reset PIN' : 'Buat PIN') + '</button></div></div>').join('') + '</div>' +
    '<div class="flex items-center justify-between gap-3 mt-3 text-sm text-muted"><span>' + list.length.toLocaleString('id-ID') + ' member</span>' +
      (pages > 1 ? '<span class="flex items-center gap-2"><button class="btn-icon" ' + (A7.secPage <= 1 ? 'disabled' : '') + ' onclick="A7.secPage--;a7SecList()" title="Sebelumnya"><i data-lucide="chevron-left" class="w-4 h-4"></i></button>Hal. ' + A7.secPage + ' / ' + pages +
        '<button class="btn-icon" ' + (A7.secPage >= pages ? 'disabled' : '') + ' onclick="A7.secPage++;a7SecList()" title="Berikutnya"><i data-lucide="chevron-right" class="w-4 h-4"></i></button></span>' : '') + '</div>';
  refreshIcons();
}
async function resetPin37(email) {
  const d = AppState.a.authAdmin, m = d && d.members.filter(x => x.email === email)[0]; if (!m) return;
  const q = await Swal.fire({ icon: 'question', title: (m.hasPin ? 'Reset' : 'Buat') + ' PIN untuk ' + (m.name || email) + '?', showCancelButton: true, confirmButtonText: m.hasPin ? 'Reset PIN' : 'Buat PIN', cancelButtonText: 'Batal',
    html: '<div style="text-align:left;display:grid;gap:10px"><p class="text-sm text-muted">' + (m.hasPin ? 'PIN lama langsung tidak berlaku. ' : '') + 'PIN baru ditampilkan sekali di layar ini.</p>' +
      '<label class="flex items-center gap-2 text-sm"><input id="rpMail" type="checkbox" checked> Kirim PIN baru ke email ' + esc(email) + '</label>' +
      '<label class="flex items-center gap-2 text-sm"><input id="rpOut" type="checkbox"> Keluarkan member dari semua perangkat</label></div>',
    preConfirm: () => ({ notify: document.getElementById('rpMail').checked, signOut: document.getElementById('rpOut').checked }) });
  if (!q.isConfirmed) return;
  Swal.fire({ title: 'Membuat PIN…', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  const res = await api('resetMemberPin', { email: email, notify: q.value.notify, signOut: q.value.signOut });
  if (!res.success) { Swal.fire({ icon: 'error', title: 'Gagal', text: res.message }); return; }
  m.hasPin = true; m.pinSetAt = new Date().toISOString();                                     // daftar & angka statistik ikut berubah tanpa memuat ulang
  d.stats.withPin = d.members.filter(x => x.hasPin && (x.status === 'Active' || !x.status)).length; d.stats.withoutPin = d.stats.active - d.stats.withPin;
  a7keep('authAdmin'); ADMIN_RENDER.authAdmin(d);
  const r = res.data, text = 'Halo ' + (r.name || '') + ', PIN login portal Anda: ' + r.pin + '. Masuk: pilih "Masuk dengan PIN", isi email ' + r.email + ' dan PIN tersebut. Jangan bagikan PIN ini.';
  window._pin37 = { pin: r.pin, text: text };
  Swal.fire({ icon: r.emailed || !q.value.notify ? 'success' : 'warning', title: 'PIN baru', confirmButtonText: 'Selesai',
    html: '<p class="text-sm text-muted">' + esc(res.message) + '</p><div class="a7-pinshow"><small class="text-muted">' + esc(r.email) + '</small><b>' + esc(r.pin) + '</b></div>' +
      '<div class="flex flex-wrap justify-center gap-2"><button type="button" class="btn-ghost !w-auto" onclick="copyText(_pin37.pin)"><i data-lucide="copy" class="w-4 h-4"></i> Salin PIN</button>' +
      (r.wa ? '<button type="button" class="btn-ghost !w-auto" onclick="openLink(waLink(' + jsArg(r.wa) + ',_pin37.text))"><i data-lucide="message-circle" class="w-4 h-4"></i> Kirim via WhatsApp</button>' : '') + '</div>' +
      '<p class="text-xs text-muted mt-3">PIN tidak disimpan dalam bentuk asli dan tidak bisa dilihat lagi setelah dialog ini ditutup.</p>', didOpen: refreshIcons }).then(() => { window._pin37 = null; });
}
async function pinBlast37(action, btn) {
  const d = AppState.a.authAdmin;
  if (action === 'start') {
    const per = Number((document.getElementById('a7PerRun') || {}).value) || 20;
    const q = await Swal.fire({ icon: 'question', title: 'Mulai kirim PIN bertahap?', showCancelButton: true, confirmButtonText: 'Mulai', cancelButtonText: 'Batal',
      html: '<p class="text-sm text-muted">' + d.stats.withoutPin + ' member aktif akan menerima email berisi PIN login — ' + per + ' email tiap 10 menit. Member yang sudah punya PIN tidak dikirimi lagi.</p>' });
    if (!q.isConfirmed) return;
    const res = await withBusy(btn, 'Memulai…', () => api('pinBlast', { action: 'start', perRun: per }, { timeout: 120000 }));
    toastRes(res, 'Pengiriman dimulai');
  } else {
    d.job.on = false; ADMIN_RENDER.authAdmin(d);                                               // berhenti seketika di layar
    const res = await api('pinBlast', { action: 'stop' });
    toastRes(res, 'Dihentikan');
  }
  Admin.fetch('authAdmin', { _fresh: true });
}
async function authMode37(on, btn) {
  if (on) {
    const q = await Swal.fire({ icon: 'warning', title: 'Nyalakan mode transisi?', text: 'Siapa pun yang tahu email member bisa masuk tanpa Google/PIN selama mode ini menyala. Gunakan hanya dalam keadaan darurat.', showCancelButton: true, confirmButtonText: 'Ya, nyalakan sementara', cancelButtonText: 'Batal' });
    if (!q.isConfirmed) return;
  }
  const d = AppState.a.authAdmin, prev = d.legacy;
  d.legacy = on; ADMIN_RENDER.authAdmin(d);
  const res = await api('setAuthMode', { legacy: on });
  if (!res.success) { d.legacy = prev; ADMIN_RENDER.authAdmin(d); }
  else { a7keep('authAdmin'); Public.prefetch(true); }
  toastRes(res);
}
