/* TokenNyala v4 — shared UI: header + mobile menu, language buttons, icons, helpers. */
window.TN = window.TN || {};
TN.ui = (() => {
  'use strict';
  const { t } = TN.i18n;

  /** Inline Lucide icon (symbols injected by icons.js). Decorative: always aria-hidden. */
  const icon = (name, cls = 'icon') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;

  /** Escape text for innerHTML templates (dictionary/data values only, but stay safe). */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Mobile menu (docs/v4/information-architecture.md §1) ---------- */
  const menuBtn = document.getElementById('menu-button');
  const menu = document.getElementById('mobile-menu');
  const desktop = window.matchMedia('(min-width: 64rem)');
  let menuOpen = false;

  function syncMenuLabel() { menuBtn?.setAttribute('aria-label', t(menuOpen ? 'menu.close' : 'menu.open')); }

  function setMenu(open, { returnFocus = false } = {}) {
    if (!menuBtn || !menu) return;
    menuOpen = open;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('overflow-hidden', open);
    document.querySelector('[data-header]')?.toggleAttribute('data-menu-open', open);
    syncMenuLabel();
    if (!open && returnFocus) menuBtn.focus();
  }

  menuBtn?.addEventListener('click', () => setMenu(!menuOpen));
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) setMenu(false, { returnFocus: true }); });
  desktop.addEventListener('change', (e) => { if (e.matches && menuOpen) setMenu(false); });

  /* ---------- Header: solid background once the page scrolls ---------- */
  const header = document.querySelector('[data-header]');
  const onScroll = () => header?.toggleAttribute('data-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Language ---------- */
  document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => TN.i18n.setLang(b.dataset.lang)));
  TN.i18n.onChange(syncMenuLabel);

  /* ---------- Placeholder legal links (mock) ---------- */
  document.querySelectorAll('[data-mock-link]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));

  return { icon, esc, setMenu };
})();
