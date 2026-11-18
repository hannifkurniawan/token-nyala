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
      footerPrototype: 'Konsep interaktif — tidak ada transaksi nyata. Tautan legal adalah contoh.'
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
      footerPrototype: 'Interactive concept — no real transactions. Legal links are placeholders.'
    }
  };

  const state = { lang: 'id', menuOpen: false };
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
    storage.set(LANG_KEY, lang);
  }

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
