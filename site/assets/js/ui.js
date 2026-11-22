/* TokenNyala v4 — shared UI: header + mobile menu, language buttons, icons, helpers. */
window.TN = window.TN || {};
TN.ui = (() => {
  'use strict';
  const { t } = TN.i18n;

  /** Inline Lucide icon (symbols injected by icons.js). Decorative: always aria-hidden. */
  const icon = (name, cls = 'icon') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;

  /** Escape text for innerHTML templates (dictionary/data values only, but stay safe). */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Mobile menu (docs/information-architecture.md §1) ---------- */
  const menuBtn = document.getElementById('menu-button');
  const menu = document.getElementById('mobile-menu');
  const desktop = window.matchMedia('(min-width: 64rem)');
  let menuOpen = false;

  function syncMenuLabel() { menuBtn?.setAttribute('aria-label', t(menuOpen ? 'menu.close' : 'menu.open')); }

  function setMenu(open, { returnFocus = false } = {}) {
    if (!menuBtn || !menu) return;
    menuOpen = open;
    menu.hidden = !open;
    // Showcase reveal: the blue panel grows as a circle from the button (instant when closing)
    if (open) { void menu.offsetWidth; menu.setAttribute('data-open', ''); } else menu.removeAttribute('data-open');
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

  /* ---------- Header (showcase v2): solid once scrolled, hides while scrolling down,
     turns light over dark sheets (probe the element under the header's middle) ---------- */
  const header = document.querySelector('[data-header]');
  const DARK = '.sheet--blue, .sheet--dark, .stall, .final, .footer, [data-dark]';
  let lastY = window.scrollY, ticking = false;
  function onScroll() {
    ticking = false;
    if (!header) return;
    const y = window.scrollY;
    header.toggleAttribute('data-scrolled', y > 8);
    const keep = menuOpen || header.contains(document.activeElement);
    header.toggleAttribute('data-hidden', !keep && y > lastY + 2 && y > 400);
    if (y < lastY - 2) header.removeAttribute('data-hidden');
    lastY = y;
    const probe = header.offsetHeight / 2;
    const under = document.elementsFromPoint(window.innerWidth / 2, probe).find((el) => !header.contains(el));
    header.toggleAttribute('data-on-dark', Boolean(under?.closest(DARK)) && y > 8);
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  header?.addEventListener('focusin', () => header.removeAttribute('data-hidden'));
  onScroll();

  /* ---------- Sparks: a short burst from the centre of `el` (decorative; skipped for reduced motion) ---------- */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function burst(el, count = 16, host = el) {
    if (!el || reducedMotion.matches || !Element.prototype.animate) return;
    const h = host.getBoundingClientRect(), r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2 - h.left, cy = r.top + r.height / 2 - h.top;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    for (let i = 0; i < count; i++) {
      const s = document.createElement('i');
      s.setAttribute('aria-hidden', 'true');
      const size = 10 + Math.random() * 18;
      Object.assign(s.style, { position: 'absolute', left: `${cx}px`, top: `${cy}px`, width: `${size}px`, height: `${size}px`, pointerEvents: 'none', zIndex: 5,
        background: 'url("assets/img/spark.svg") center / contain no-repeat' });
      host.append(s);
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.4, d = 80 + Math.random() * 160;
      s.animate([
        { transform: 'translate(-50%,-50%) scale(.2) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(1) rotate(${Math.random() * 180}deg)`, opacity: 0 },
      ], { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => s.remove();
    }
  }

  /* ---------- Bilingual aria labels on static markup: data-aria-id / data-aria-en ---------- */
  function syncAria() {
    document.querySelectorAll('[data-aria-id]').forEach((el) => el.setAttribute('aria-label', el.dataset[TN.i18n.lang === 'en' ? 'ariaEn' : 'ariaId']));
  }
  TN.i18n.onChange(syncAria);

  /* ---------- Custom cursor + magnetic buttons (showcase v2; pages with #cursor, fine pointers only) ---------- */
  const cursor = document.getElementById('cursor');
  if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion.matches) {
    document.documentElement.classList.add('has-cursor');
    const label = document.getElementById('cursor-label');
    let mx = -100, my = -100, cx = -100, cy = -100;
    window.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('pointerover', (e) => {
      const target = e.target.closest('[data-cursor]');
      if (target) { label.textContent = (TN.i18n.lang === 'en' && target.dataset.cursorEn) || target.dataset.cursor; cursor.classList.add('is-active'); }
      else cursor.classList.remove('is-active');
      cursor.classList.toggle('is-hidden', !!e.target.closest('dialog, input, textarea, select'));
    });
    document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
    document.addEventListener('pointerenter', () => cursor.classList.remove('is-hidden'));
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest?.('.magnetic');
      document.querySelectorAll('.magnetic[data-pulled]').forEach((m) => { if (m !== el) { m.style.transform = ''; m.removeAttribute('data-pulled'); } });
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.22}px, ${(e.clientY - (r.top + r.height / 2)) * 0.32}px)`;
      el.setAttribute('data-pulled', '');
    }, { passive: true });
  }

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
      case 'nat':
        return { icon: D.ICONS.nat, name: t('svc.nat.name'), detail: t('item.sized', { size: t(`size.${it.size}`), rp: rp(c.amount) }) };
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

  return { icon, esc, setMenu, setupModal, parseContact, focusIsFree, itemView, fromLine, segmented, radioKeys, burst };
})();
