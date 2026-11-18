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
    document.querySelectorAll('[data-lang]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });

    syncMenuLabel();
    renderPrices();
    renderPackages();
    renderHeroBalance();
    storage.set(LANG_KEY, lang);
  }

  /* ---------- Formatting ---------- */
  const number = (n) => new Intl.NumberFormat(state.lang === 'en' ? 'en-US' : 'id-ID').format(n);
  const rupiah = (n) => 'Rp' + number(n);

  function renderPrices() {
    document.querySelectorAll('[data-price]').forEach((el) => { el.textContent = rupiah(Number(el.dataset.price)); });
    document.querySelectorAll('[data-credit]').forEach((el) => { el.textContent = number(Number(el.dataset.credit)); });
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

  function selectPackage(id) {
    if (!packages[id]) return;
    state.selectedPackage = id;
    renderPackages();
    renderHeroBalance();
    const pkg = packages[id];
    if (announcer) announcer.textContent = fill(t('pkgAnnounce'), { name: pkg.name, credit: number(pkg.amount + pkg.bonus) });
    // Step 5 (checkout) will open the checkout dialog here.
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
    btn.addEventListener('click', () => selectPackage(btn.dataset.choosePackage));
  });
  document.querySelector('[data-choose-recommended]')?.addEventListener('click', () => selectPackage(state.intent));

  // Exposed for upcoming sections and manual testing in the console.
  window.TokenNyala = { selectPackage, setIntent, packages };

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
