/* TokenNyala v3 — interactions. See docs/technical-spec.md */
(() => {
  'use strict';

  const LANG_KEY = 'tn-lang';

  /* ---------- Copy (ID default, EN) ---------- */
  const copy = {
    id: {
      skipLink: 'Lewati ke konten utama',
      brandAria: 'TokenNyala — kembali ke atas',
      navAria: 'Navigasi utama',
      navMobileAria: 'Navigasi mobile',
      navHow: 'Cara kerja',
      navPackages: 'Paket',
      navModels: 'Model AI',
      navFaq: 'FAQ',
      navCta: 'Isi saldo',
      langAria: 'Pilih bahasa',
      langLabel: 'Bahasa',
      menuOpen: 'Buka menu',
      menuClose: 'Tutup menu',
      footerTagline: 'Saldo AI untuk ide yang siap menjadi proyek.',
      footerExplore: 'Jelajahi',
      footerLegal: 'Bantuan & legal',
      footerTerms: 'Syarat & Ketentuan',
      footerPrivacy: 'Kebijakan Privasi',
      footerContact: 'Hubungi kami',
      footerPrototype: 'Konsep interaktif — tidak ada transaksi nyata. Tautan legal adalah contoh.',

      heroEyebrow: 'Untuk ide, prototype, dan proyekmu',
      heroTitleA: 'Mulai vibecoding.',
      heroTitleB: 'Jangan berhenti di tengah jalan.',
      heroLead: 'Isi saldo AI dengan mudah, pilih nominal sesuai proyek, dan lanjutkan membangun—tanpa harus memahami istilah teknis dulu.',
      heroCta: 'Isi saldo',
      heroSecondary: 'Lihat cara kerjanya',
      heroTrustAria: 'Keunggulan',
      trustLocal: 'Bayar lokal',
      trustFast: 'Saldo aktif cepat',
      trustReceipt: 'Lihat bukti transaksi',
      boardCaption: 'Ilustrasi: proyek sedang dibangun dengan bantuan AI, saldo menunjukkan status.',
      boardProject: 'Event Landing Page',
      boardTag: 'Proyek',
      boardPrompt: 'Buat hero lebih hangat dan sederhana',
      boardCoding: 'Menulis komponen…',
      boardPreview: 'Halaman event siap',
      boardBalance: 'Saldo aktif',
      boardStatusOff: 'Belum nyala',
      boardStatusOn: 'Nyala',
      boardEstimateOff: 'Pilih paket untuk menyalakan saldo',
      boardEstimateOn: 'Estimasi: {estimate}',

      howKicker: 'Cara kerja',
      howTitle: 'Dari ide ke proyek, tanpa langkah yang membingungkan.',
      howStepsAria: 'Tiga langkah',
      step1Title: 'Pilih tujuanmu',
      step1Body: 'Belajar, bikin prototype, atau kerjakan proyek. Kami sarankan paket yang pas.',
      step1ChipsAria: 'Pilihan tujuan',
      intentLearn: 'Belajar',
      intentPrototype: 'Prototype',
      intentWork: 'Kerja',
      step2Title: 'Bayar dengan mudah',
      step2Body: 'Gunakan QRIS, e-wallet, atau virtual account. Rincian biaya terlihat sebelum bayar.',
      step2ChipsAria: 'Keunggulan pembayaran',
      step2Chip1: 'Nominal jelas',
      step2Chip2: 'Biaya tambahan Rp0',
      step2Chip3: 'Metode lokal',
      step3Title: 'Lanjutkan membangun',
      step3Body: 'Saldo siap dipakai dan momentum proyek tidak terputus.',
      step3ChipsAria: 'Setelah top up',
      step3Chip1: 'Status saldo',
      step3Chip2: 'Riwayat pembelian',
      step3Chip3: 'Kembali ke proyek',

      pkgKicker: 'Paket',
      pkgTitle: 'Berapa yang ingin kamu nyalakan?',
      pkgLead: 'Pilih tujuanmu, kami tunjukkan paket yang paling pas. Semua paket bisa dipakai untuk semua model AI.',
      intentTabsAria: 'Pilih tujuan',
      pkgListAria: 'Pilihan paket',
      recoTitle: 'Paling pas untuk {intent}: {name} · {price}',
      recoIntent_learn: 'belajar',
      recoIntent_prototype: 'prototype',
      recoIntent_work: 'kerja',
      reco_learn: 'Titik awal yang ringan untuk belajar dan proyek pertama.',
      reco_prototype: 'Cukup untuk iterasi satu prototype aktif.',
      reco_work: 'Untuk proyek berkelanjutan dan kebutuhan klien.',
      pkgChoose: 'Pilih {price}',
      pkgChosen: 'Paket {price} dipilih',
      badgeRecommended: 'Paling pas',
      badgeSelected: 'Dipilih',
      pkgFor_learn: 'Belajar dan mencoba pertama kali',
      pkgFor_prototype: 'Membuat satu prototype aktif',
      pkgFor_work: 'Freelancer atau proyek berkelanjutan',
      pkgHelper_learn: 'Cocok untuk memahami alur atau menyelesaikan satu mini-task.',
      pkgHelper_prototype: 'Cocok untuk iterasi tampilan, prompt, dan perbaikan singkat.',
      pkgHelper_work: 'Cocok saat kamu mulai mengerjakan kebutuhan klien atau banyak iterasi.',
      pkgBonus: 'Bonus',
      pkgTotal: 'Total saldo',
      pkgCredits: 'kredit',
      estimateLabel: 'Estimasi',
      pkgSessions_learn: '20–30 sesi kecil',
      pkgSessions_prototype: '40–60 sesi kecil',
      pkgSessions_work: '100+ sesi kecil',
      creditRules: '1 kredit = Rp1 · Sudah termasuk PPN · Tidak kedaluwarsa',
      seeModels: 'Lihat model yang bisa dipakai',
      estimateDisclaimer: 'Estimasi bergantung pada model, panjang prompt, tipe tugas, dan format output.',
      pkgAnnounce: 'Paket {name} dipilih. Saldo {credit} kredit.',

      coTitle: 'Ringkas top up',
      coClose: 'Tutup checkout',
      coNotice: 'Ini adalah checkout simulasi. Tidak ada transaksi atau penarikan dana nyata.',
      coPackageLegend: 'Paket',
      coBreakdownAria: 'Rincian biaya',
      coNominal: 'Nominal paket',
      coBonus: 'Bonus kredit',
      coFee: 'Biaya tambahan',
      coTotal: 'Total bayar',
      coCreditNote: 'Saldo masuk {credit} kredit · 1 kredit = Rp1 · Sudah termasuk PPN',
      coContactLabel: 'Email atau nomor HP',
      coContactHelp: 'Bukti pembelian dikirim ke sini.',
      coContactPlaceholder: 'nama@email.com atau 0812xxxxxxxx',
      errContactEmpty: 'Masukkan email atau nomor HP agar bukti pembelian bisa dikirim.',
      errEmailInvalid: 'Format email belum sesuai. Coba cek lagi alamatnya.',
      errPhoneInvalid: 'Nomor HP belum sesuai. Gunakan format 08xx atau +628xx.',
      coMethodLegend: 'Pilih metode pembayaran',
      methodQrisHint: 'Pindai dari aplikasi bank atau e-wallet',
      methodEwalletHint: 'DANA, GoPay, OVO',
      methodVaHint: 'Transfer dari bank mana pun',
      errMethod: 'Pilih satu metode pembayaran untuk melanjutkan.',
      coSubmit: 'Lanjut bayar {total}',
      coPayTitle_qris: 'Pindai QRIS',
      coPayBody_qris: 'Pindai kode contoh ini untuk melihat alurnya. Kode ini tidak bisa dipakai membayar.',
      coPayTitle_va: 'Transfer ke virtual account',
      coPayBody_va: 'Nomor contoh dibuat di perangkatmu dan tidak terhubung ke bank.',
      coPayTitle_ewallet: 'Bayar dengan e-wallet',
      coPayBody_ewallet: 'Pilih aplikasi untuk menyetujui pembayaran (simulasi).',
      coWaiting: 'Menunggu pembayaran {total}',
      coQrAria: 'Kode QR contoh, tidak bisa dipindai',
      coVaLabel: 'Nomor virtual account',
      coPaid: 'Saya sudah bayar',
      coChecking: 'Memeriksa pembayaran…',
      coSimFail: 'Simulasikan pembayaran gagal',
      coBack: 'Ubah data',
      coCopy: 'Salin',
      coCopied: 'Tersalin',
      successTitle: 'Saldo nyala!',
      successBody: 'Paket {name} ({price}) sudah tercatat di simulasi ini. Bukti pembelian dikirim ke {contact}.',
      successKeyLabel: 'API key kamu',
      successCopyKey: 'Salin API key',
      successGuide: 'Lihat panduan pasang',
      successWarning: 'Simpan API key seperti kata sandi. Jangan dibagikan.',
      successNotice: 'Prototype — tidak ada transaksi nyata.',
      failTitle: 'Pembayaran belum berhasil',
      failBody: 'Tidak ada saldo yang terpotong pada prototipe ini. Pilih metode lain atau coba lagi.',
      failRetry: 'Coba lagi',

      pkgEstimate_learn: 'sekitar 20–30 sesi kecil',
      pkgEstimate_prototype: 'sekitar 40–60 sesi kecil',
      pkgEstimate_work: '100+ sesi kecil'
    },
    en: {
      skipLink: 'Skip to main content',
      brandAria: 'TokenNyala — back to top',
      navAria: 'Main navigation',
      navMobileAria: 'Mobile navigation',
      navHow: 'How it works',
      navPackages: 'Packages',
      navModels: 'AI models',
      navFaq: 'FAQ',
      navCta: 'Top up',
      langAria: 'Choose language',
      langLabel: 'Language',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      footerTagline: 'AI balance for ideas that are ready to become projects.',
      footerExplore: 'Explore',
      footerLegal: 'Help & legal',
      footerTerms: 'Terms',
      footerPrivacy: 'Privacy Policy',
      footerContact: 'Contact us',
      footerPrototype: 'Interactive concept — no real transactions. Legal links are placeholders.',

      heroEyebrow: 'For ideas, prototypes, and projects',
      heroTitleA: 'Start vibe\u2011coding.', // non-breaking hyphen
      heroTitleB: 'Keep building without interruptions.',
      heroLead: 'Top up AI credit in a simple flow, choose an amount that fits your project, and keep moving—without learning technical terms first.',
      heroCta: 'Top up balance',
      heroSecondary: 'How it works',
      heroTrustAria: 'Highlights',
      trustLocal: 'Local payment',
      trustFast: 'Fast activation',
      trustReceipt: 'Clear receipts',
      boardCaption: 'Illustration: a project being built with AI, with the balance showing its status.',
      boardProject: 'Event Landing Page',
      boardTag: 'Project',
      boardPrompt: 'Make the hero warmer and simpler',
      boardCoding: 'Writing component…',
      boardPreview: 'Event page ready',
      boardBalance: 'Active balance',
      boardStatusOff: 'Not on yet',
      boardStatusOn: 'On',
      boardEstimateOff: 'Choose a package to switch your balance on',
      boardEstimateOn: 'Estimate: {estimate}',

      howKicker: 'How it works',
      howTitle: 'From idea to project, without confusing steps.',
      howStepsAria: 'Three steps',
      step1Title: 'Choose your goal',
      step1Body: 'Learn, build a prototype, or work on a project. We suggest the right package.',
      step1ChipsAria: 'Goal options',
      intentLearn: 'Learn',
      intentPrototype: 'Prototype',
      intentWork: 'Work',
      step2Title: 'Pay easily',
      step2Body: 'Use QRIS, e-wallet, or virtual account. See every fee before you pay.',
      step2ChipsAria: 'Payment highlights',
      step2Chip1: 'Clear amounts',
      step2Chip2: 'Rp0 extra fees',
      step2Chip3: 'Local methods',
      step3Title: 'Keep building',
      step3Body: 'Your balance is ready and your project keeps its momentum.',
      step3ChipsAria: 'After topping up',
      step3Chip1: 'Balance status',
      step3Chip2: 'Purchase history',
      step3Chip3: 'Back to your project',

      pkgKicker: 'Packages',
      pkgTitle: 'How much do you want to switch on?',
      pkgLead: "Pick your goal and we'll show the package that fits. Every package works with every AI model.",
      intentTabsAria: 'Choose your goal',
      pkgListAria: 'Package options',
      recoTitle: 'Best fit for {intent}: {name} · {price}',
      recoIntent_learn: 'learning',
      recoIntent_prototype: 'prototyping',
      recoIntent_work: 'work',
      reco_learn: 'A light start for learning and your first project.',
      reco_prototype: 'Enough to iterate on one active prototype.',
      reco_work: 'For ongoing projects and client work.',
      pkgChoose: 'Choose {price}',
      pkgChosen: '{price} package selected',
      badgeRecommended: 'Best fit',
      badgeSelected: 'Selected',
      pkgFor_learn: 'Learning and first tries',
      pkgFor_prototype: 'Building one active prototype',
      pkgFor_work: 'Freelancers and ongoing projects',
      pkgHelper_learn: 'Good for understanding the flow or finishing one mini-task.',
      pkgHelper_prototype: 'Good for iterating on UI, prompts, and quick fixes.',
      pkgHelper_work: 'Good when you start client work or need many iterations.',
      pkgBonus: 'Bonus',
      pkgTotal: 'Total balance',
      pkgCredits: 'credits',
      estimateLabel: 'Estimate',
      pkgSessions_learn: '20–30 small sessions',
      pkgSessions_prototype: '40–60 small sessions',
      pkgSessions_work: '100+ small sessions',
      creditRules: '1 credit = Rp1 · Tax included · Never expires',
      seeModels: 'See available models',
      estimateDisclaimer: 'Estimates depend on the model, prompt length, task type, and output format.',
      pkgAnnounce: '{name} package selected. Balance {credit} credits.',

      coTitle: 'Top-up summary',
      coClose: 'Close checkout',
      coNotice: 'This is a simulated checkout. No real transaction or charge happens.',
      coPackageLegend: 'Package',
      coBreakdownAria: 'Price breakdown',
      coNominal: 'Package price',
      coBonus: 'Bonus credit',
      coFee: 'Extra fees',
      coTotal: 'Total to pay',
      coCreditNote: 'You receive {credit} credits · 1 credit = Rp1 · Tax included',
      coContactLabel: 'Email or phone number',
      coContactHelp: "We'll send your receipt here.",
      coContactPlaceholder: 'name@email.com or 0812xxxxxxxx',
      errContactEmpty: 'Enter your email or phone number so we can send your receipt.',
      errEmailInvalid: "That email doesn't look right. Please check it again.",
      errPhoneInvalid: "That phone number doesn't look right. Use 08xx or +628xx.",
      coMethodLegend: 'Choose a payment method',
      methodQrisHint: 'Scan from any bank or e-wallet app',
      methodEwalletHint: 'DANA, GoPay, OVO',
      methodVaHint: 'Transfer from any bank',
      errMethod: 'Choose a payment method to continue.',
      coSubmit: 'Continue to pay {total}',
      coPayTitle_qris: 'Scan the QRIS code',
      coPayBody_qris: "Scan this sample code to see the flow. It can't be used to pay.",
      coPayTitle_va: 'Transfer to the virtual account',
      coPayBody_va: "This sample number is generated on your device and isn't linked to a bank.",
      coPayTitle_ewallet: 'Pay with an e-wallet',
      coPayBody_ewallet: 'Choose an app to approve the payment (simulation).',
      coWaiting: 'Waiting for a payment of {total}',
      coQrAria: 'Sample QR code, cannot be scanned',
      coVaLabel: 'Virtual account number',
      coPaid: "I've paid",
      coChecking: 'Checking payment…',
      coSimFail: 'Simulate a failed payment',
      coBack: 'Edit details',
      coCopy: 'Copy',
      coCopied: 'Copied',
      successTitle: 'Your balance is on!',
      successBody: '{name} package ({price}) is recorded in this simulation. Receipt sent to {contact}.',
      successKeyLabel: 'Your API key',
      successCopyKey: 'Copy API key',
      successGuide: 'See setup guide',
      successWarning: "Keep your API key like a password. Don't share it.",
      successNotice: 'Prototype — no real transaction.',
      failTitle: "Payment didn't go through",
      failBody: 'Nothing was charged in this prototype. Choose another method or try again.',
      failRetry: 'Try again',

      pkgEstimate_learn: 'about 20–30 small sessions',
      pkgEstimate_prototype: 'about 40–60 small sessions',
      pkgEstimate_work: '100+ small sessions'
    }
  };

  /* ---------- Data (docs/technical-spec.md → Interactive Data Model) ---------- */
  const packages = {
    learn: { id: 'learn', name: 'Mulai', amount: 50000, bonus: 5000 },
    prototype: { id: 'prototype', name: 'Bangun', amount: 100000, bonus: 15000 },
    work: { id: 'work', name: 'Scale', amount: 250000, bonus: 50000 }
  };
  const METER_MAX_CREDIT = 300000; // largest package incl. bonus → 100%

  const state = { lang: 'id', menuOpen: false, intent: 'learn', selectedPackage: null };
  const t = (key) => copy[state.lang][key] ?? copy.id[key] ?? key;

  /* ---------- Storage (wrapped: may be unavailable) ---------- */
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* ignore */ } }
  };

  /* ---------- Language ---------- */
  function setLanguage(lang) {
    if (!copy[lang]) return;
    state.lang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
    });
    document.querySelectorAll('[data-lang]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });

    syncMenuLabel();
    renderPrices();
    renderPackages();
    renderHeroBalance();
    renderCheckout();
    storage.set(LANG_KEY, lang);
  }

  /* ---------- Formatting ---------- */
  const number = (n) => new Intl.NumberFormat(state.lang === 'en' ? 'en-US' : 'id-ID').format(n);
  const rupiah = (n) => 'Rp' + number(n);

  function renderPrices() {
    document.querySelectorAll('[data-price]').forEach((el) => { el.textContent = rupiah(Number(el.dataset.price)); });
    document.querySelectorAll('[data-credit]').forEach((el) => { el.textContent = number(Number(el.dataset.credit)); });
    // Compact form for tight spaces (<640px): Rp100rb / Rp100K
    document.querySelectorAll('[data-price-short]').forEach((el) => {
      el.textContent = 'Rp' + number(Number(el.dataset.priceShort) / 1000) + (state.lang === 'en' ? 'K' : 'rb');
    });
  }
  const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? '');

  /* ---------- Hero balance board ----------
     Off until a package is chosen (docs/hero-and-journey-spec.md → Visual Animation).
     Call selectPackage(id) from the package picker / checkout. */
  function renderHeroBalance() {
    const root = document.querySelector('[data-hero-balance]');
    if (!root) return;
    const pkg = packages[state.selectedPackage];
    const credit = pkg ? pkg.amount + pkg.bonus : 0;

    root.dataset.state = pkg ? 'on' : 'off';
    root.querySelector('[data-hero-amount]').textContent = rupiah(credit);
    root.querySelector('[data-hero-status]').textContent = t(pkg ? 'boardStatusOn' : 'boardStatusOff');
    root.querySelector('[data-hero-meter]').style.width = pkg ? `${Math.round((credit / METER_MAX_CREDIT) * 100)}%` : '0%';
    root.querySelector('[data-hero-estimate]').textContent = pkg
      ? fill(t('boardEstimateOn'), { estimate: t(`pkgEstimate_${pkg.id}`) })
      : t('boardEstimateOff');
  }

  /* ---------- Package picker ---------- */
  const tabs = [...document.querySelectorAll('[role="tab"][data-intent]')];
  const panel = document.getElementById('paket-panel');
  const announcer = document.querySelector('[data-pkg-announce]');

  function renderPackages() {
    const reco = packages[state.intent];

    tabs.forEach((tab) => {
      const active = tab.dataset.intent === state.intent;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active) panel?.setAttribute('aria-labelledby', tab.id);
    });

    document.querySelectorAll('[data-package]').forEach((card) => {
      const id = card.dataset.package;
      card.dataset.recommended = String(id === reco.id);
      card.dataset.selected = String(id === state.selectedPackage);
      const cta = card.querySelector('[data-pkg-cta]');
      if (cta) {
        cta.textContent = fill(t(id === state.selectedPackage ? 'pkgChosen' : 'pkgChoose'), { price: rupiah(packages[id].amount) });
      }
    });

    const set = (sel, text) => { const el = document.querySelector(sel); if (el) el.textContent = text; };
    set('[data-reco-title]', fill(t('recoTitle'), { intent: t(`recoIntent_${reco.id}`), name: reco.name, price: rupiah(reco.amount) }));
    set('[data-reco-body]', t(`reco_${reco.id}`));
    set('[data-reco-cta]', fill(t(reco.id === state.selectedPackage ? 'pkgChosen' : 'pkgChoose'), { price: rupiah(reco.amount) }));
  }

  function setIntent(id, { focus = false } = {}) {
    if (!packages[id]) return;
    state.intent = id;
    renderPackages();
    if (focus) tabs.find((tab) => tab.dataset.intent === id)?.focus();
  }

  function selectPackage(id, { announce = true } = {}) {
    if (!packages[id]) return;
    state.selectedPackage = id;
    renderPackages();
    renderHeroBalance();
    renderCheckout();
    const pkg = packages[id];
    if (announce && announcer) announcer.textContent = fill(t('pkgAnnounce'), { name: pkg.name, credit: number(pkg.amount + pkg.bonus) });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setIntent(tab.dataset.intent));
    tab.addEventListener('keydown', (event) => {
      const last = tabs.length - 1;
      const target = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last }[event.key];
      if (target === undefined) return;
      event.preventDefault();
      setIntent(tabs[target].dataset.intent, { focus: true });
    });
  });

  document.querySelectorAll('[data-choose-package]').forEach((btn) => {
    btn.addEventListener('click', () => openCheckout(btn.dataset.choosePackage, btn));
  });
  document.querySelector('[data-choose-recommended]')?.addEventListener('click', (event) => openCheckout(state.intent, event.currentTarget));

  /* ---------- Checkout (docs/technical-spec.md → Checkout Modal, Form Validation) ---------- */
  const dialog = document.getElementById('checkout');
  const form = dialog?.querySelector('form');
  const contactInput = document.getElementById('co-contact');
  const PAY_DELAY = 600; // spec: no simulated delay above 600ms
  const checkout = { step: 'form', method: null, contact: '', opener: null, apiKey: '', va: '' };

  const randomDigits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
  const randomHex = (n) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => (b % 16).toString(16)).join('');

  /** Email or Indonesian mobile number. Returns { ok, type, value, error }. */
  function parseContact(raw) {
    const value = raw.trim();
    if (!value) return { ok: false, error: 'errContactEmpty' };
    if (value.includes('@')) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? { ok: true, type: 'email', value }
        : { ok: false, error: 'errEmailInvalid' };
    }
    const digits = value.replace(/[\s.-]/g, '');
    if (!/^(\+62|62|0)8[1-9][0-9]{7,10}$/.test(digits)) return { ok: false, error: 'errPhoneInvalid' };
    return { ok: true, type: 'phone', value: '+62' + digits.replace(/^(\+62|62|0)/, '') };
  }

  function setFieldError(name, key) {
    const message = dialog.querySelector(`[data-error-for="${name}"]`);
    if (message) {
      message.textContent = key ? t(key) : '';
      message.dataset.key = key || '';
      message.classList.toggle('hidden', !key);
    }
    if (name === 'contact') contactInput?.setAttribute('aria-invalid', String(Boolean(key)));
    if (name === 'method') dialog.querySelectorAll('[name="co-method"]').forEach((r) => r.setAttribute('aria-invalid', String(Boolean(key))));
  }

  function renderQr() {
    const svg = dialog.querySelector('[data-co-qr]');
    if (!svg || svg.childElementCount) return;
    const size = 25; let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="currentColor"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="currentColor"/>`;
    const inFinder = (x, y) => (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16);
    let cells = '';
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!inFinder(x, y) && rnd() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1" fill="currentColor"/>`;
    svg.classList.add('text-xl-dark');
    svg.innerHTML = cells + finder(0, 0) + finder(18, 0) + finder(0, 18);
  }

  function renderCheckout() {
    if (!dialog) return;
    const pkg = packages[state.selectedPackage] || packages[state.intent];
    const total = rupiah(pkg.amount);
    const set = (sel, text) => { const el = dialog.querySelector(sel); if (el) el.textContent = text; };

    dialog.querySelectorAll('[name="co-package"]').forEach((r) => { r.checked = r.value === pkg.id; });
    set('[data-co-nominal]', total);
    set('[data-co-bonus]', '+' + rupiah(pkg.bonus));
    set('[data-co-total]', total);
    set('[data-co-credit-note]', fill(t('coCreditNote'), { credit: number(pkg.amount + pkg.bonus) }));
    set('[data-co-submit]', fill(t('coSubmit'), { total }));
    set('[data-co-title]', t('coTitle'));

    const m = checkout.method;
    if (m) {
      set('[data-co-pay-title]', t(`coPayTitle_${m}`));
      set('[data-co-pay-body]', t(`coPayBody_${m}`));
    }
    set('[data-co-waiting]', fill(t('coWaiting'), { total }));
    set('[data-co-va]', checkout.va.replace(/(\d{4})(?=\d)/g, '$1 '));
    set('[data-co-key]', checkout.apiKey ? checkout.apiKey.slice(0, 8) + '••••••••••••' + checkout.apiKey.slice(-4) : '');
    set('[data-co-success-body]', fill(t('successBody'), { name: pkg.name, price: total, contact: checkout.contact }));
    // re-translate visible error messages
    dialog.querySelectorAll('[data-error-for]').forEach((el) => { if (el.dataset.key) el.textContent = t(el.dataset.key); });
  }

  function showStep(step) {
    checkout.step = step;
    dialog.dataset.step = step;
    dialog.querySelectorAll('[data-step-panel]').forEach((panel) => { panel.hidden = panel.dataset.stepPanel !== step; });
    if (step === 'pay') {
      dialog.querySelectorAll('[data-pay-method]').forEach((el) => { el.hidden = el.dataset.payMethod !== checkout.method; });
      dialog.querySelector('[data-pay-footer]').hidden = checkout.method === 'ewallet';
      if (checkout.method === 'qris') renderQr();
    }
    renderCheckout();
    const focusTarget = { form: '#co-title', pay: '#co-pay-title', success: '#co-success-title', failed: '#co-failed-title' }[step];
    const el = dialog.querySelector(focusTarget);
    if (el) { if (!el.hasAttribute('tabindex')) el.tabIndex = -1; el.focus(); }
  }

  function openCheckout(packageId, opener = document.activeElement) {
    if (!dialog) return;
    if (state.menuOpen) setMenu(false);
    selectPackage(packageId || state.selectedPackage || state.intent, { announce: false });
    checkout.opener = opener;
    showStep('form');
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('overflow-hidden');
    dialog.querySelector('#co-title')?.focus();
  }

  function closeCheckout() { if (dialog?.open) dialog.close(); }

  dialog?.addEventListener('close', () => {
    document.documentElement.classList.remove('overflow-hidden');
    if (checkout.step !== 'form') { // fresh form next time; keep contact
      checkout.method = null;
      dialog.querySelectorAll('[name="co-method"]').forEach((r) => { r.checked = false; });
    }
    // Return focus to the opener; if it is no longer visible (e.g. inside the closed mobile menu), use the menu button.
    const opener = checkout.opener;
    const visible = (el) => el && document.contains(el) && el.getClientRects().length > 0;
    if (visible(opener)) opener.focus();
    else if (opener && visible(menuButton)) menuButton.focus();
  });

  // Close on backdrop click — only when the press both started and ended on the backdrop.
  let pressedBackdrop = false;
  dialog?.addEventListener('pointerdown', (event) => { pressedBackdrop = event.target === dialog; });
  dialog?.addEventListener('click', (event) => { if (pressedBackdrop && event.target === dialog) closeCheckout(); pressedBackdrop = false; });
  dialog?.querySelector('[data-co-close]')?.addEventListener('click', closeCheckout);

  dialog?.querySelectorAll('[name="co-package"]').forEach((radio) => {
    radio.addEventListener('change', () => selectPackage(radio.value, { announce: false }));
  });
  dialog?.querySelectorAll('[name="co-method"]').forEach((radio) => {
    radio.addEventListener('change', () => { checkout.method = radio.value; setFieldError('method', null); });
  });
  contactInput?.addEventListener('blur', () => {
    if (!contactInput.value.trim()) return; // don't scold an untouched field
    const result = parseContact(contactInput.value);
    setFieldError('contact', result.ok ? null : result.error);
  });
  contactInput?.addEventListener('input', () => {
    if (contactInput.getAttribute('aria-invalid') === 'true' && parseContact(contactInput.value).ok) setFieldError('contact', null);
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const contact = parseContact(contactInput.value);
    setFieldError('contact', contact.ok ? null : contact.error);
    setFieldError('method', checkout.method ? null : 'errMethod');
    if (!contact.ok) { contactInput.focus(); return; }
    if (!checkout.method) { dialog.querySelector('[name="co-method"]')?.focus(); return; }
    checkout.contact = contact.value;
    checkout.va = '8808' + randomDigits(12);
    showStep('pay');
  });

  dialog?.querySelectorAll('[data-co-paid]').forEach((btn) => {
    btn.addEventListener('click', () => {
      dialog.querySelectorAll('[data-co-paid]').forEach((b) => { b.disabled = true; });
      dialog.querySelector('[data-co-live]').textContent = t('coChecking');
      const label = dialog.querySelector('[data-pay-footer] [data-co-paid]');
      if (label && btn === label) label.textContent = t('coChecking');
      setTimeout(() => {
        dialog.querySelectorAll('[data-co-paid]').forEach((b) => { b.disabled = false; });
        if (label) label.textContent = t('coPaid');
        checkout.apiKey = 'tn-demo-' + randomHex(24);
        showStep('success');
        dialog.querySelector('[data-co-live]').textContent = t('successTitle');
      }, PAY_DELAY);
    });
  });
  dialog?.querySelector('[data-co-fail]')?.addEventListener('click', () => showStep('failed'));
  dialog?.querySelectorAll('[data-co-back]').forEach((btn) => btn.addEventListener('click', () => showStep('form')));
  dialog?.querySelector('[data-co-guide]')?.addEventListener('click', () => { checkout.opener = null; closeCheckout(); });

  /* ---------- Copy to clipboard ---------- */
  async function copyText(text, button) {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable: text stays selectable */ }
    const original = button.textContent;
    button.textContent = t('coCopied');
    const live = dialog?.querySelector('[data-co-live]');
    if (live) live.textContent = t('coCopied');
    setTimeout(() => { button.textContent = original; }, 1500);
  }
  document.querySelectorAll('[data-copy-target]').forEach((btn) => {
    btn.addEventListener('click', () => copyText(document.querySelector(btn.dataset.copyTarget)?.textContent.replace(/\s/g, '') || '', btn));
  });
  dialog?.querySelector('[data-copy-key]')?.addEventListener('click', (event) => copyText(checkout.apiKey, event.currentTarget));

  document.querySelectorAll('[data-open-checkout]').forEach((btn) => {
    btn.addEventListener('click', () => openCheckout(null, btn));
  });

  // Exposed for upcoming sections and manual testing in the console.
  window.TokenNyala = { selectPackage, setIntent, openCheckout, packages };

  /* ---------- Mobile menu ---------- */
  const menuButton = document.getElementById('menu-button');
  const menu = document.getElementById('mobile-menu');
  const desktopQuery = window.matchMedia('(min-width: 64rem)'); // Tailwind lg

  function syncMenuLabel() {
    if (!menuButton) return;
    menuButton.setAttribute('aria-label', state.menuOpen ? t('menuClose') : t('menuOpen'));
  }

  function setMenu(open, { returnFocus = false } = {}) {
    if (!menuButton || !menu) return;
    state.menuOpen = open;
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.querySelector('.menu-icon-open')?.classList.toggle('hidden', open);
    menuButton.querySelector('.menu-icon-close')?.classList.toggle('hidden', !open);
    syncMenuLabel();
    if (!open && returnFocus) menuButton.focus();
  }

  menuButton?.addEventListener('click', () => setMenu(!state.menuOpen));

  menu?.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.menuOpen) setMenu(false, { returnFocus: true });
  });

  desktopQuery.addEventListener('change', (event) => {
    if (event.matches && state.menuOpen) setMenu(false);
  });

  /* ---------- Language buttons ---------- */
  document.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  /* ---------- Placeholder legal links ---------- */
  document.querySelectorAll('[data-mock-link]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });

  /* ---------- Init ---------- */
  const saved = storage.get(LANG_KEY);
  setLanguage(saved && copy[saved] ? saved : 'id');
})();
