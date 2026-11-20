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

  /* ---------- Shared modal (v3 setupModal): showModal + focus heading, scroll lock,
     backdrop click (press must start and end on the backdrop), focus back to the opener when free. ---------- */
  function focusIsFree(dlg) {
    const a = document.activeElement;
    return !a || a === document.body || dlg.contains(a);
  }
  function setupModal(dlg, { focus, onClose } = {}) {
    let opener = null;
    let skipFocus = false;
    let pressedBackdrop = false;
    const visible = (el) => el && document.contains(el) && el.getClientRects().length > 0;
    dlg.addEventListener('pointerdown', (e) => { pressedBackdrop = e.target === dlg; });
    dlg.addEventListener('click', (e) => { if (pressedBackdrop && e.target === dlg) dlg.close(); pressedBackdrop = false; });
    dlg.addEventListener('close', () => {
      document.documentElement.classList.remove('overflow-hidden');
      onClose?.();
      const target = skipFocus ? null : opener;
      skipFocus = false;
      if (!target || !focusIsFree(dlg)) return;
      if (visible(target)) target.focus();
      else if (visible(menuBtn)) menuBtn.focus();
    });
    return {
      open(from = document.activeElement) {
        if (menuOpen) setMenu(false);
        document.querySelectorAll('dialog[open]').forEach((d) => { if (d !== dlg) d.close(); });
        opener = from;
        if (!dlg.open) dlg.showModal();
        document.documentElement.classList.add('overflow-hidden');
        dlg.querySelector(focus)?.focus();
      },
      close({ returnFocus = true } = {}) {
        skipFocus = !returnFocus;
        if (dlg.open) dlg.close();
      },
    };
  }

  /** Email or Indonesian mobile number (v3). Returns { ok, value, error } — error is an i18n key. */
  function parseContact(raw) {
    const value = raw.trim();
    if (!value) return { ok: false, error: 'err.contactEmpty' };
    if (value.includes('@')) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? { ok: true, value } : { ok: false, error: 'err.emailInvalid' };
    }
    const digits = value.replace(/[\s.-]/g, '');
    if (!/^(\+62|62|0)8[1-9][0-9]{7,10}$/.test(digits)) return { ok: false, error: 'err.phoneInvalid' };
    return { ok: true, value: '+62' + digits.replace(/^(\+62|62|0)/, '') };
  }

  /* ---------- Copy buttons: [data-copy="text"] — label switches to "Tersalin" for 1.6s ---------- */
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    try { await navigator.clipboard.writeText(b.dataset.copy); } catch { /* clipboard blocked (file://): still confirm */ }
    const label = b.querySelector('[data-copy-label]') || b;
    label.textContent = t('copy.done');
    clearTimeout(b._t);
    b._t = setTimeout(() => { label.textContent = t('copy.label'); }, 1600);
  });

  return { icon, esc, setMenu, setupModal, parseContact, focusIsFree };
})();
