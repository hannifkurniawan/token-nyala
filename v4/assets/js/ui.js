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
  // Delegated: language buttons can be rendered later (console account menu)
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-lang]'); if (b) TN.i18n.setLang(b.dataset.lang); });
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

  /* ---------- Recipe items → plain-language rows ---------- */
  function itemView(it) {
    const D = TN.data, { rp, num } = TN.i18n;
    const c = D.itemCost(it);
    switch (it.svc) {
      case 'hosting':
        return { icon: D.ICONS.hosting, name: t('svc.hosting.name'), detail: t('item.sized', { size: t(`size.${it.size}`), rp: rp(c.amount) }) };
      case 'apps':
        return { icon: D.ICONS.apps, name: t(`tpl.${it.tpl}.name`), detail: t('item.sized', { size: t(`size.${it.size}`), rp: rp(c.amount) }) };
      case 'database':
        return { icon: D.ICONS.database, name: t('svc.database.name'),
          detail: t('item.capacity', { size: t(`size.${it.size}`), cap: D.DATABASE[it.size].capacity, rp: rp(c.amount) }) };
      case 'email': {
        const e = D.EMAIL[it.size];
        const quota = t(`email.quota.${e.per}`, { n: num(e.quota) });
        return { icon: D.ICONS.email, name: t('svc.email.name'),
          detail: e.price ? t('item.sized', { size: quota, rp: rp(e.price) }) : t('item.free', { quota }) };
      }
      case 'domain':
        return { icon: D.ICONS.domain, name: t('item.domainName', { ext: it.ext }),
          detail: c.amount === c.renew ? t('item.domainYear', { rp: rp(c.amount) })
            : t('item.domainFirst', { rp: rp(c.amount), renew: rp(c.renew) }) };
      case 'ai':
        return { icon: D.ICONS.ai, name: t(`item.ai.${it.unit}`), estimate: true,
          detail: t('item.usage', { qty: t(`unit.${it.unit}`, { n: num(it.qty) }), rp: rp(c.amount) }) };
      case 'payments':
        return { icon: D.ICONS.payments, name: t('svc.payments.name'), detail: t('svc.from.percent', { rp: rp(D.PAYMENTS.monthly), pct: num(D.PAYMENTS.feePct) }) };
      case 'server':
        return { icon: D.ICONS.server, name: t('svc.server.name'), detail: t('item.sized', { size: t(`size.${it.size}`), rp: rp(c.amount) }) };
      case 'storage':
        return { icon: D.ICONS.storage, name: t('svc.storage.name'), detail: t('item.sized', { size: D.STORAGE[it.size].capacity, rp: rp(c.amount) }) };
      default: return { icon: 'check', name: it.svc, detail: '' };
    }
  }

  /** "From" price line(s) for a service card: [main, sub?] */
  function fromLine(id) {
    const D = TN.data, { rp, num } = TN.i18n;
    const f = D.FROM[id];
    switch (f.kind) {
      case 'usage': return [t('svc.from.usage'), id === 'ai' ? t('svc.from.aiRate', { n: D.sessionsPer(10000), rp: rp(10000) }) : t('svc.from.sameBalance')];
      case 'per30': return [t('svc.from.per30', { rp: rp(f.price) })];
      case 'firstYear': return [t('svc.from.firstYear', { rp: rp(f.price) })];
      case 'free': return [t('svc.from.free', { n: num(f.quota) })];
      case 'percent': return [t('svc.from.percent', { rp: rp(f.price), pct: num(f.pct) })];
      default: return [''];
    }
  }

  /* ---------- Size picker (radiogroup) shared by the calculator and the wizard ---------- */
  const optionLabel = (svc, v) => {
    const D = TN.data;
    if (svc === 'storage') return D.STORAGE[v].capacity;
    if (svc === 'email') return t(`email.name.${v}`);
    return t(`size.${v}`);
  };
  const optionPrice = (svc, v) => TN.data.itemCost(svc === 'apps' ? { svc, tpl: 'n8n', size: v } : { svc, size: v }).amount;

  /** Sizes for one item; sizes below a template's minimum (with AI in `items`) are aria-disabled. */
  function segmented(it, fid, items) {
    const D = TN.data, { rp } = TN.i18n;
    const ai = D.usesAi(items);
    const min = it.svc === 'apps' ? D.templateMinSize(it.tpl, ai) : null;
    const opts = D.OPTIONS[it.svc];
    const name = itemView(it).name;
    return `<div role="radiogroup" aria-label="${esc(t('calc.sizeAria', { name }))}" class="grid gap-1 rounded-control bg-paper p-1" style="grid-template-columns:repeat(${opts.length},minmax(0,1fr))" data-seg="${fid}">
      ${opts.map((v) => {
        const on = it.size === v;
        const off = min && D.SIZE_ORDER.indexOf(v) < D.SIZE_ORDER.indexOf(min);
        return `<button type="button" role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}" ${off ? 'aria-disabled="true"' : ''} data-size="${v}" data-fid="${fid}-${v}"
          class="flex min-h-12 flex-col items-center justify-center rounded-[9px] px-1 py-1.5 text-center leading-tight aria-checked:bg-white aria-checked:shadow-[0_1px_4px_rgb(0_22_106/.18)] aria-disabled:cursor-not-allowed aria-disabled:opacity-45">
          <span class="text-[.9rem] font-bold">${esc(optionLabel(it.svc, v))}</span>
          <span class="num text-[.78rem] text-muted">${esc(rp(optionPrice(it.svc, v)))}</span></button>`;
      }).join('')}</div>`;
  }

  /** Arrow keys inside a size radiogroup: move + pick, skipping disabled sizes. Returns the picked button or null. */
  function radioKeys(e) {
    const group = e.target.closest('[role=radiogroup]');
    if (!group || !['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(e.key)) return null;
    e.preventDefault();
    const opts = [...group.querySelectorAll('[role=radio]')].filter((b) => b.getAttribute('aria-disabled') !== 'true');
    const i = opts.indexOf(group.querySelector('[aria-checked=true]'));
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: opts.length - 1 }[e.key];
    const target = opts[(next + opts.length) % opts.length];
    target.focus();
    return target;
  }

  return { icon, esc, setMenu, setupModal, parseContact, focusIsFree, itemView, fromLine, segmented, radioKeys };
})();
