/* TokenNyala v4 — ID/EN dictionary + apply/format (docs/v4/microcopy.md is the copy source).
   Every entry is [ID, EN]. {name} = variable. Keys used through data-i18n* attributes or TN.i18n.t('key').
   data-i18n-html is only for trusted dictionary markup (<mark>, <strong>, {switch}). */
window.TN = window.TN || {};
TN.i18n = (() => {
  'use strict';

  const D = {
    /* ---- global ---- */
    'skip': ['Lewati ke konten utama', 'Skip to main content'],
    'brand.home': ['TokenNyala — ke atas', 'TokenNyala — back to top'],
    'nav.aria': ['Navigasi utama', 'Main navigation'],
    'nav.services': ['Layanan', 'Services'],
    'nav.pricing': ['Harga', 'Pricing'],
    'nav.templates': ['Template', 'Templates'],
    'nav.learn': ['Belajar', 'Learn'],
    'nav.faq': ['FAQ', 'FAQ'],
    'nav.signin': ['Masuk', 'Sign in'],
    'menu.open': ['Buka menu', 'Open menu'],
    'menu.close': ['Tutup menu', 'Close menu'],
    'lang.aria': ['Pilih bahasa', 'Choose language'],
    'cta.start': ['Mulai bangun', 'Start building'],
    'cta.pricing': ['Lihat harga', 'See pricing'],
    'cta.topup': ['Isi saldo', 'Top up'],
    'label.estimate': ['Perkiraan', 'Estimate'],
    'label.perMonth': ['/bulan', '/month'],
    'footer.tagline': ['Idemu nyala, dari prompt sampai online.', 'Your idea, switched on — from prompt to online.'],
    'footer.prototype': ['Prototype interaktif — tidak ada transaksi, layanan, atau data nyata. Semua harga adalah contoh.', 'Interactive prototype — no real transactions, services, or data. All prices are examples.'],
    'footer.explore': ['Jelajahi', 'Explore'],
    'footer.help': ['Bantuan & legal', 'Help & legal'],
    'footer.team': ['Untuk tim', 'For teams'],
    'footer.terms': ['Syarat & Ketentuan', 'Terms & Conditions'],
    'footer.privacy': ['Kebijakan Privasi', 'Privacy Policy'],
    'status.on': ['Nyala', 'On'],
    'status.off': ['Belum online', 'Not online'],

    /* ---- hero ---- */
    'hero.kicker': ['Untuk ide, prototype, dan proyekmu', 'For your ideas, prototypes, and projects'],
    'hero.title': ['Idemu {switch} <mark>nyala</mark>, dari prompt sampai online.', 'Your idea, {switch} switched <mark>on</mark> — from prompt to online.'],
    'hero.lead': ['AI untuk membangun, cloud untuk menjalankan. Pilih tujuanmu, kami rangkai layanannya — dibayar dari satu saldo Rupiah.', "AI to build it, cloud to run it. Pick your goal and we'll put the services together — all paid from one Rupiah balance."],
    'hero.trustAria': ['Keunggulan', 'Highlights'],
    'hero.trust1': ['Bayar Rupiah', 'Pay in Rupiah'],
    'hero.trust2': ['Tanpa kartu kredit', 'No credit card'],
    'hero.trust3': ['Mulai {rp}', 'From {rp}'],
    'board.aria': ['Ilustrasi: satu proyek dari prompt sampai online', 'Illustration: one project from prompt to online'],
    'board.title': ['Dari prompt sampai online', 'From prompt to online'],
    'board.step1': ['Prompt', 'Prompt'],
    'board.prompt': ['Buat landing page event yang hangat dan simpel', 'Make a warm, simple event landing page'],
    'board.step2': ['Membangun', 'Building'],
    'board.building': ['Membangun komponen…', 'Building components…'],
    'board.step3': ['Online', 'Online'],
    'board.balance': ['Saldo {a} → sisa {b}', 'Balance {a} → {b} left'],
    'board.note': ['Contoh', 'Example'],

    /* ---- story ---- */
    'story.kicker': ['Kode sudah jadi.', 'The code is done.'],
    'story.title': ['Tapi belum bisa dibuka orang lain.', 'But nobody else can open it yet.'],
    'story.body': ['Di TokenNyala, proyekmu online dalam beberapa ketukan — lengkap dengan alamat sendiri.', 'On TokenNyala, your project goes online in a few taps — with its own address.'],
    'story.before': ['Sebelum', 'Before'],
    'story.beforeNote': ['Hanya bisa dibuka di laptopmu.', 'Only opens on your laptop.'],
    'story.after': ['Sesudah', 'After'],
    'story.afterNote': ['Bisa dibuka siapa saja, dari HP mana saja.', 'Anyone can open it, from any phone.'],

    /* ---- recipes ---- */
    'recipe.kicker': ['Mau bikin apa?', 'What are you building?'],
    'recipe.title': ['Mulai dari <mark>tujuanmu</mark>, bukan dari menu.', 'Start from your <mark>goal</mark>, not a menu.'],
    'recipe.lead': ['Pilih tujuan. Kami tunjukkan layanan yang dibutuhkan dan total per bulannya.', "Pick a goal. We'll show the services you need and the monthly total."],
    'recipe.chipsAria': ['Pilih tujuan', 'Choose a goal'],
    'recipe.short.portofolio': ['Landing page', 'Landing page'],
    'recipe.short.chatbot-wa': ['Chatbot WA', 'WhatsApp bot'],
    'recipe.short.web-klien': ['Web klien', 'Client site'],
    'recipe.short.otomasi-tim': ['Otomasi tim', 'Team automation'],
    'recipe.short.ai-coding': ['AI coding saja', 'AI for coding'],
    'recipe.name.portofolio': ['Landing page / portofolio', 'Landing page / portfolio'],
    'recipe.name.chatbot-wa': ['Chatbot WhatsApp', 'WhatsApp chatbot'],
    'recipe.name.web-klien': ['Website klien dengan form', 'Client website with a form'],
    'recipe.name.otomasi-tim': ['Otomasi untuk tim', 'Team automation'],
    'recipe.name.ai-coding': ['AI untuk tool coding saja', 'AI for coding tools only'],
    'recipe.desc.portofolio': ['Online dengan alamat sendiri, plus AI untuk terus memperbaikinya.', 'Online with your own address, plus AI to keep improving it.'],
    'recipe.desc.chatbot-wa': ['Balas pesan pelanggan otomatis, 24 jam.', 'Reply to customers automatically, 24/7.'],
    'recipe.desc.web-klien': ['Website, data pendaftar, email, dan alamat .com untuk satu klien.', 'Website, sign-up data, email, and a .com address for one client.'],
    'recipe.desc.otomasi-tim': ['Workflow n8n dengan AI, data, dan email untuk tim kecil.', 'n8n workflows with AI, data, and email for a small team.'],
    'recipe.desc.ai-coding': ['Pakai saldomu untuk AI di Cursor, Lovable, Cline, dan tool lain.', 'Use your balance for AI in Cursor, Lovable, Cline, and other tools.'],
    'recipe.approx': ['Perkiraan per bulan', 'Estimated per month'],
    'recipe.firstMonth': ['Bulan pertama {rp} — termasuk biaya tahunan (alamat web)', 'First month {rp} — includes the yearly cost (web address)'],
    'recipe.itemsAria': ['Isi resep', "What's included"],
    'recipe.costsAria': ['Rincian biaya', 'Cost breakdown'],
    'recipe.suggest.one': ['Isi {rp} → cukup ±{n} bulan', 'Top up {rp} → lasts ±{n} month'],
    'recipe.suggest.many': ['Isi {rp} → cukup ±{n} bulan', 'Top up {rp} → lasts ±{n} months'],
    'recipe.suggestNote': ['Saldo masuk {rp} termasuk bonus.', 'You get {rp} including the bonus.'],
    'recipe.cta': ['Nyalakan resep ini', 'Switch on this recipe'],
    'recipe.edit': ['Ubah di kalkulator', 'Adjust in the calculator'],
    'recipe.note': ['Perkiraan. Pemakaian AI bergantung pada model, panjang prompt, dan jumlah pesan.', 'Estimate. AI usage depends on the model, prompt length, and message volume.'],
    'recipe.aiOnlyTitle': ['Isi saldo, pakai di tool coding-mu', 'Top up, use it in your coding tools'],
    'recipe.aiOnlyRow': ['Isi {rp} → {range} sesi kecil', 'Top up {rp} → {range} small sessions'],
    'recipe.aiOnlyCta': ['Ambil API key', 'Get an API key'],
    'recipe.announce': ['{name}: perkiraan {rp} per bulan', '{name}: about {rp} per month'],
    'cost.fixed': ['Biaya tetap', 'Fixed cost'],
    'cost.usage': ['Perkiraan pakai', 'Estimated usage'],
    'cost.yearly': ['Tahunan', 'Yearly'],
    'item.ai.sesi': ['AI untuk tool-mu', 'AI for your tools'],
    'item.ai.pesan': ['AI untuk balasan chatbot', 'AI for chatbot replies'],
    'item.ai.tugas': ['AI untuk langkah otomasi', 'AI for automation steps'],
    'item.domainName': ['Alamat web .{ext}', 'Web address .{ext}'],
    'item.domainFirst': ['{rp} tahun pertama, lalu {renew}/tahun', '{rp} first year, then {renew}/year'],
    'item.domainYear': ['{rp} / tahun', '{rp} / year'],
    'item.sized': ['{size} · {rp} / 30 hari', '{size} · {rp} / 30 days'],
    'item.capacity': ['{size} · {cap} · {rp} / 30 hari', '{size} · {cap} · {rp} / 30 days'],
    'item.free': ['{quota} · gratis', '{quota} · free'],
    'item.usage': ['{qty} · ±{rp}', '{qty} · ±{rp}'],
    'unit.sesi': ['±{n} sesi kecil', '±{n} small sessions'],
    'unit.pesan': ['±{n} pesan chatbot', '±{n} chatbot messages'],
    'unit.tugas': ['±{n} tugas otomasi', '±{n} automation tasks'],
    'size.coba': ['Coba-coba', 'Starter'],
    'size.rutin': ['Rutin', 'Steady'],
    'size.ramai': ['Ramai', 'Busy'],
    'size.kecil': ['Kecil', 'Small'],
    'size.sedang': ['Sedang', 'Medium'],
    'size.besar': ['Besar', 'Large'],
    'email.quota.day': ['{n} email/hari', '{n} emails/day'],
    'email.quota.month': ['{n} email/bulan', '{n} emails/month'],
    'tpl.wa-bot.name': ['Chatbot WhatsApp', 'WhatsApp chatbot'],
    'tpl.n8n.name': ['Otomasi n8n', 'n8n automation'],

    /* ---- how it works ---- */
    'how.kicker': ['Cara kerja', 'How it works'],
    'how.title': ['Tiga langkah, dari tujuan sampai online.', 'Three steps, from goal to online.'],
    'how.1.title': ['Pilih tujuanmu', 'Pick your goal'],
    'how.1.body': ['Landing page, chatbot, atau otomasi. Kami siapkan resepnya.', 'A landing page, chatbot, or automation. We prepare the recipe.'],
    'how.2.title': ['Isi saldo Rupiah', 'Top up in Rupiah'],
    'how.2.body': ['QRIS, e-wallet, atau virtual account. Total terlihat sebelum bayar.', 'QRIS, e-wallet, or virtual account. See the total before you pay.'],
    'how.3.title': ['Nyala & online', 'Switch on & go online'],
    'how.3.body': ['Proyekmu jalan dengan alamat sendiri. Pantau saldo kapan saja.', 'Your project runs at its own address. Check your balance anytime.'],

    /* ---- services ---- */
    'svc.kicker': ['Semua layanan', 'All services'],
    'svc.title': ['Semua yang dibutuhkan proyekmu, di <mark>satu tempat</mark>.', 'Everything your project needs, in <mark>one place</mark>.'],
    'svc.lead': ['Nama yang mudah dipahami lebih dulu. Istilah teknisnya tetap ada, kecil di bawahnya.', 'Plain names first. The technical term is still there, in small print below.'],
    'svc.group.build': ['Bangun dengan AI', 'Build with AI'],
    'svc.group.run': ['Jalankan', 'Run'],
    'svc.group.store': ['Simpan', 'Store'],
    'svc.group.connect': ['Hubungkan', 'Connect'],
    'svc.ai.name': ['AI untuk tool-mu', 'AI for your tools'],
    'svc.chat.name': ['Coba AI', 'Try AI'],
    'svc.hosting.name': ['Online-kan proyekmu', 'Put your project online'],
    'svc.apps.name': ['Asisten & otomasi siap pakai', 'Ready-made assistants & automations'],
    'svc.server.name': ['Server sendiri', 'Your own server'],
    'svc.database.name': ['Tempat simpan data', 'Data storage'],
    'svc.storage.name': ['Tempat simpan file', 'File storage'],
    'svc.domain.name': ['Alamat web', 'Web address'],
    'svc.email.name': ['Email dari domainmu', 'Email from your domain'],
    'svc.payments.name': ['Terima pembayaran', 'Accept payments'],
    'svc.ai.tech': ['AI API · kompatibel OpenAI', 'AI API · OpenAI-compatible'],
    'svc.chat.tech': ['Chat playground', 'Chat playground'],
    'svc.hosting.tech': ['Hosting aplikasi', 'App hosting'],
    'svc.apps.tech': ['Aplikasi sekali klik', 'One-click apps'],
    'svc.server.tech': ['VPS', 'VPS'],
    'svc.database.tech': ['Database terkelola', 'Managed database'],
    'svc.storage.tech': ['Object storage · kompatibel S3', 'Object storage · S3-compatible'],
    'svc.domain.tech': ['Domain', 'Domain'],
    'svc.email.tech': ['Email API & SMTP', 'Email API & SMTP'],
    'svc.payments.tech': ['Payment gateway QRIS', 'QRIS payment gateway'],
    'svc.ai.desc': ['Pakai Claude, GPT, Gemini, dan lainnya di tool coding favoritmu.', 'Use Claude, GPT, Gemini, and more in your favorite coding tools.'],
    'svc.chat.desc': ['Coba dan bandingkan model sebelum dipakai.', 'Try and compare models before you commit.'],
    'svc.hosting.desc': ['Hasil Lovable, Bolt, atau GitHub jadi link yang bisa dibuka siapa saja.', 'Turn Lovable, Bolt, or GitHub projects into a link anyone can open.'],
    'svc.apps.desc': ['Chatbot, otomasi, dan agent AI — tinggal pilih, langsung jalan.', 'Chatbots, automations, and AI agents — pick one and it runs.'],
    'svc.server.desc': ['Kontrol penuh untuk yang butuh lebih.', 'Full control when you need more.'],
    'svc.database.desc': ['Simpan data pendaftar, pesanan, atau pelanggan.', 'Keep sign-ups, orders, or customer data.'],
    'svc.storage.desc': ['Simpan foto, dokumen, dan file upload.', 'Store photos, documents, and uploads.'],
    'svc.domain.desc': ['Nama proyekmu di internet.', "Your project's name on the internet."],
    'svc.email.desc': ['Kirim notifikasi dan struk dari alamatmu sendiri.', 'Send notifications and receipts from your own address.'],
    'svc.payments.desc': ['Terima pembayaran QRIS di proyekmu.', 'Accept QRIS payments in your project.'],
    'svc.from.usage': ['Sesuai pakai', 'Pay as you go'],
    'svc.from.aiRate': ['≈ {n} sesi kecil / {rp}', '≈ {n} small sessions / {rp}'],
    'svc.from.sameBalance': ['Dari saldo yang sama', 'From the same balance'],
    'svc.from.per30': ['Mulai {rp} / 30 hari', 'From {rp} / 30 days'],
    'svc.from.firstYear': ['Mulai {rp} tahun pertama', 'From {rp} first year'],
    'svc.from.free': ['Gratis · {n} email/hari', 'Free · {n} emails/day'],
    'svc.from.percent': ['{rp}/bulan · {pct}% per transaksi', '{rp}/month · {pct}% per transaction'],
    'svc.cta': ['Lihat semua harga', 'See all prices'],

    /* ---- one balance ---- */
    'wallet.kicker': ['Satu saldo', 'One balance'],
    'wallet.title': ['Satu saldo Rupiah untuk <mark>semuanya</mark>.', 'One Rupiah balance for <mark>everything</mark>.'],
    'wallet.lead': ['Isi sekali, pakai untuk hosting, otomasi, data, alamat web, dan AI. Tanpa kartu kredit, tanpa dolar, tanpa saldo kedua.', 'Top up once and use it for hosting, automations, data, web addresses, and AI. No credit card, no dollars, no second balance.'],
    'wallet.fixed': ['<strong>Biaya tetap</strong> dipotong per 30 hari — hosting, otomasi, data.', '<strong>Fixed costs</strong> are charged every 30 days — hosting, automations, data.'],
    'wallet.usage': ['<strong>Biaya pakai</strong> sesuai pemakaian — AI.', '<strong>Usage costs</strong> follow what you use — AI.'],
    'wallet.until': ['Kami beri tahu saldo cukup sampai kapan.', 'We tell you how long your balance will last.'],
    'wallet.chipsAria': ['Aturan saldo', 'Balance rules'],
    'wallet.chip1': ['1 kredit = Rp1', '1 credit = Rp1'],
    'wallet.chip2': ['Termasuk PPN', 'Tax included'],
    'wallet.chip3': ['Tidak kedaluwarsa', 'Never expires'],
    'wallet.chip4': ['Tanpa USD', 'No USD'],
    'wallet.card': ['Contoh: satu landing page event', 'Example: one event landing page'],
    'wallet.in': ['Isi {rp} + bonus {bonus}', 'Top up {rp} + {bonus} bonus'],
    'wallet.balance': ['Saldo', 'Balance'],
    'wallet.line.hosting': ['Online-kan · 30 hari', 'Put online · 30 days'],
    'wallet.line.domain': ['Alamat web · tahun pertama', 'Web address · first year'],
    'wallet.line.ai': ['AI · {n} sesi kecil', 'AI · {n} small sessions'],
    'wallet.left': ['Sisa saldo', 'Balance left'],
    'wallet.leftNote': ['Sisa saldo tetap bisa dipakai untuk AI atau bulan berikutnya.', 'What is left stays available for AI or next month.'],
  };

  const LANG_KEY = 'tn-lang';
  const storage = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked: language just isn't remembered */ } },
  };
  const listeners = [];
  let lang = 'id';

  const fill = (s, vars = {}) => s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  /** t('key', {vars}) — falls back to ID, then to the key itself (visible in QA). */
  function t(key, vars) {
    const e = D[key];
    if (!e) { console.warn('[i18n] missing key', key); return key; }
    return fill(e[lang === 'en' ? 1 : 0] || e[0], vars);
  }

  const locale = () => (lang === 'en' ? 'en-US' : 'id-ID');
  const num = (n) => new Intl.NumberFormat(locale(), { maximumFractionDigits: 2 }).format(n);
  /** Rp15.000 / Rp15,000 */
  const rp = (n) => (n < 0 ? '−' : '') + 'Rp' + num(Math.abs(n));
  /** Rounded to thousands, half-up: Rp34 rb / Rp34K */
  const rpK = (n) => 'Rp' + num(Math.floor(n / 1000 + 0.5)) + (lang === 'en' ? 'K' : ' rb');

  /** Apply dictionary to static markup under root. */
  function apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml).replace('{switch}', '<span class="switch switch--inline" data-on aria-hidden="true"><i></i></span>');
    });
    root.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder)));
  }

  function setLang(next, { save = true } = {}) {
    lang = next === 'en' ? 'en' : 'id';
    document.documentElement.lang = lang;
    apply();
    document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    if (save) storage.set(LANG_KEY, lang);
    listeners.forEach((fn) => fn(lang));
  }

  return {
    dict: D, t, fill, num, rp, rpK, apply, setLang, storage,
    get lang() { return lang; },
    onChange(fn) { listeners.push(fn); },
    init() { setLang(storage.get(LANG_KEY) === 'en' ? 'en' : 'id', { save: false }); },
  };
})();
