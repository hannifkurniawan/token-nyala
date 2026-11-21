/* TokenNyala v4 — console mock (app.html): hash router, shell, sign-in, home, balance + top-up.
   docs/v4/information-architecture.md §4, wireframes C1–C3 · C6 · C9, technical-spec §4–5.
   Fase 4: masuk · beranda · saldo. Other routes show a "coming soon" view until fase 5–6. */
(() => {
  'use strict';
  const D = TN.data;
  const I = TN.i18n;
  const S = TN.store;
  const { t, rp, rpK, num } = I;
  const { icon, esc } = TN.ui;

  const view = document.getElementById('view');
  const routeLive = document.querySelector('[data-route-live]');

  /* ---------- Demo presets (?demo=ayu|raka|dimas, &state=jeda, ?demo=reset) ---------- */
  const params = new URLSearchParams(location.search);
  if (S.applyDemo(params) && !location.hash) location.hash = '#/beranda';
  if (params.has('demo')) { try { history.replaceState(null, '', location.pathname + location.hash); } catch { /* file:// */ } }

  /* ---------- Small helpers ---------- */
  const go = (hash) => { location.hash = hash; };
  const signedIn = () => Boolean(S.state.user);
  const dateStr = (iso, opts) => I.date(iso, opts);
  const STATUS = {
    nyala: { dot: 'dot--on', text: 'text-teal-ink', key: 'st.on' },
    dijeda: { dot: 'dot--paused', text: 'text-xl-dark', key: 'st.paused' },
    berhenti: { dot: '', text: 'text-muted', key: 'st.stopped' },
    menyalakan: { dot: 'dot--busy', text: 'text-xl-dark', key: 'st.starting' },
  };
  const statusPill = (st) => `<span class="inline-flex shrink-0 items-center gap-1.5 font-mono text-[.8rem] font-medium ${STATUS[st].text}">${st === 'dijeda' ? icon('pause', 'icon size-3.5') : `<span class="dot ${STATUS[st].dot}"></span>`}${esc(t(STATUS[st].key))}</span>`;

  let toastTimer;
  function toast(msg) {
    const el = document.querySelector('[data-toast]');
    el.textContent = msg;
    el.toggleAttribute('data-show', true);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.removeAttribute('data-show'), 3200);
  }

  /* ---------- Navigation (sidebar, tab bar, "Lainnya") ---------- */
  const SIDE = [
    ['beranda', 'nav.home', 'gauge'], ['proyek', 'nav.projects', 'folder'], ['buat', 'nav.createLong', 'plus'],
    ['ai', 'pnav.ai', 'sparkles'], ['saldo', 'nav.balance', 'wallet'],
  ];
  const OTHER = ['server', 'database', 'storage', 'domain', 'email', 'payments'];
  const navLink = (route, key, ic, extra = '') => `<li><a href="#/${route}" data-route="${route.split('/')[0]}" ${extra}
    class="flex min-h-11 items-center gap-3 rounded-control px-3 font-bold text-lead-ink hover:bg-paper aria-[current=page]:bg-xl-dark aria-[current=page]:text-white">${icon(ic, 'icon size-5')}<span>${esc(t(key))}</span></a></li>`;
  function renderNav() {
    const side = document.querySelector('[data-side-nav]');
    const others = OTHER.map((id) => navLink(`layanan/${id}`, `nav.svc.${id}`, D.ICONS[id], `data-sub="${id}"`)).join('');
    side.innerHTML = SIDE.map(([r, k, i]) => navLink(r, k, i)).join('')
      + `<li class="mt-4 px-3 pb-1 font-mono text-[.72rem] tracking-[.08em] text-muted uppercase">${esc(t('nav.servicesGroup'))}</li>${others}`
      + `<li class="mt-4"></li>${navLink('belajar', 'nav.learn', 'book-open')}${navLink('bantuan', 'nav.help', 'message-square')}`;
    document.querySelector('[data-more-nav]').innerHTML = navLink('ai', 'pnav.ai', 'sparkles')
      + `<li class="mt-3 px-3 pb-1 font-mono text-[.72rem] tracking-[.08em] text-muted uppercase">${esc(t('nav.servicesGroup'))}</li>${others}`
      + `<li class="mt-3"></li>${navLink('belajar', 'nav.learn', 'book-open')}${navLink('bantuan', 'nav.help', 'message-square')}`;
    const tab = (route, key, ic) => `<li><a href="#/${route}" data-route="${route}" class="flex h-16 flex-col items-center justify-center gap-0.5 text-[.75rem] font-bold text-muted aria-[current=page]:text-xl-dark">${icon(ic, 'icon size-6')}<span>${esc(t(key))}</span></a></li>`;
    document.querySelector('[data-tab-nav]').innerHTML = tab('beranda', 'nav.home', 'gauge') + tab('proyek', 'nav.projects', 'folder')
      + `<li class="flex justify-center"><a href="#/buat" data-route="buat" class="-mt-2 flex flex-col items-center gap-0.5 text-[.75rem] font-bold text-xl-dark" aria-label="${esc(t('nav.createLong'))}"><span class="grid size-14 place-items-center rounded-full bg-xl-yellow shadow-[0_8px_20px_-8px_rgb(0_22_106/.5)] ring-4 ring-white">${icon('plus', 'icon size-7')}</span><span class="sr-only">${esc(t('nav.create'))}</span></a></li>`
      + tab('saldo', 'nav.balance', 'wallet')
      + `<li><button type="button" class="flex h-16 w-full flex-col items-center justify-center gap-0.5 text-[.75rem] font-bold text-muted" data-open-more aria-haspopup="dialog">${icon('menu', 'icon size-6')}<span>${esc(t('nav.more'))}</span></button></li>`;
    markCurrent();
  }
  function markCurrent() {
    const r = parseHash();
    const name = r.parts[0] || 'beranda';
    const sub = name === 'layanan' ? r.parts[1] : null;
    document.querySelectorAll('[data-route]').forEach((a) => {
      const on = a.dataset.route === name && (!a.dataset.sub || a.dataset.sub === sub) && !(name === 'layanan' && !a.dataset.sub);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------- Account menu (desktop popover + inside "Lainnya") ---------- */
  function renderAccount() {
    const name = S.state.user?.name || '';
    document.querySelector('[data-avatar]').textContent = (name[0] || '?').toUpperCase();
    document.querySelectorAll('[data-account-panel]').forEach((el) => {
      el.innerHTML = `
        <p class="font-mono text-[.72rem] tracking-[.08em] text-muted uppercase">${esc(t('nav.account'))}</p>
        <p class="mt-1 font-bold">${esc(t('acct.signedAs', { name }))}</p>
        <p class="mt-2 inline-flex items-center gap-2 rounded-full bg-xl-yellow/40 px-3 py-1 font-mono text-[.75rem]"><span class="dot dot--paused"></span>${esc(t('acct.demoBadge'))}</p>
        <div class="mt-4 flex items-center justify-between gap-3"><span class="font-bold">${esc(t('acct.language'))}</span>
          <div class="inline-flex rounded-full border-[1.5px] border-xl-dark p-[3px]" role="group" aria-label="${esc(t('lang.aria'))}">
            <button type="button" data-lang="id" aria-pressed="${I.lang === 'id'}" class="min-h-11 min-w-11 rounded-full font-mono text-[.8rem] aria-pressed:bg-xl-yellow">ID</button>
            <button type="button" data-lang="en" aria-pressed="${I.lang === 'en'}" class="min-h-11 min-w-11 rounded-full font-mono text-[.8rem] aria-pressed:bg-xl-yellow">EN</button></div></div>
        <div class="mt-3 grid grid-cols-1 gap-1 border-t border-line pt-3">
          <button type="button" class="flex min-h-11 items-center gap-3 rounded-control px-2 text-left font-bold hover:bg-paper" data-advance>${icon('calendar-clock', 'icon size-5')}${esc(t('acct.advance'))}</button>
          <p class="px-2 pb-1 font-mono text-[.75rem] text-muted">${esc(t('acct.clock', { date: dateStr(S.state.clock, { year: true }) }))}</p>
          <button type="button" class="flex min-h-11 items-center gap-3 rounded-control px-2 text-left font-bold hover:bg-paper" data-reset>${icon('rotate-ccw', 'icon size-5')}${esc(t('acct.reset'))}</button>
          <button type="button" class="flex min-h-11 items-center gap-3 rounded-control px-2 text-left font-bold hover:bg-paper" data-signout>${icon('power', 'icon size-5')}${esc(t('acct.signout'))}</button>
        </div>`;
    });
  }
  const acctBtn = document.getElementById('acct-btn');
  const acctMenu = document.getElementById('acct-menu');
  function setAcct(open, { focus = false } = {}) {
    acctMenu.hidden = !open;
    acctBtn.setAttribute('aria-expanded', String(open));
    if (open) acctMenu.querySelector('button')?.focus();
    else if (focus) acctBtn.focus();
  }
  acctBtn.addEventListener('click', () => setAcct(acctMenu.hidden));
  document.addEventListener('click', (e) => { if (!acctMenu.hidden && !e.target.closest('#acct-menu, #acct-btn')) setAcct(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !acctMenu.hidden) setAcct(false, { focus: true }); });

  const moreDlg = document.getElementById('more');
  const moreModal = TN.ui.setupModal(moreDlg, { focus: '#more-title' });
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-more]')) moreModal.open(e.target.closest('[data-open-more]'));
    if (e.target.closest('[data-more-close]')) moreModal.close();
    if (moreDlg.open && e.target.closest('#more a[href^="#/"]')) moreModal.close({ returnFocus: false });
  });

  /* Confirm dialog */
  const confirmDlg = document.getElementById('confirm');
  const confirmModal = TN.ui.setupModal(confirmDlg, { focus: '#confirm-title' });
  let onConfirm = null;
  function confirmAsk({ title, body, ok, opener, action }) {
    confirmDlg.querySelector('[data-confirm-title]').textContent = title;
    confirmDlg.querySelector('[data-confirm-body]').textContent = body;
    confirmDlg.querySelector('[data-confirm-ok]').textContent = ok;
    onConfirm = action;
    confirmModal.open(opener);
  }
  confirmDlg.querySelector('[data-confirm-cancel]').addEventListener('click', () => confirmModal.close());
  confirmDlg.querySelector('[data-confirm-ok]').addEventListener('click', () => { confirmModal.close({ returnFocus: false }); onConfirm?.(); });

  document.addEventListener('click', (e) => {
    const reset = e.target.closest('[data-reset]');
    if (reset) {
      setAcct(false);
      confirmAsk({ title: t('acct.reset'), body: t('acct.resetConfirm'), ok: t('acct.resetGo'), opener: acctBtn, action: () => { S.reset(); go('#/masuk'); } });
    }
    if (e.target.closest('[data-advance]')) {
      setAcct(false); moreModal.close({ returnFocus: false });
      const r = S.advance(30);
      render({ focus: false });
      toast(t('acct.advanced', { date: dateStr(r.date), n: r.renewed, m: r.paused + r.stopped }));
      acctBtn.focus();
    }
    if (e.target.closest('[data-signout]')) { setAcct(false); moreModal.close({ returnFocus: false }); S.signOut(); go('#/masuk'); }
    if (e.target.closest('[data-topup]')) openTopup({ opener: e.target.closest('[data-topup]'), amount: Number(e.target.closest('[data-topup]').dataset.amount) || null });
  });

  /* ---------- Header balance pill ---------- */
  function renderPill() {
    const s = S.state;
    const low = S.banners().length > 0 || (s.reminder && s.balance < D.REMINDER_BELOW && s.services.some((x) => x.status !== 'berhenti'));
    const pill = document.querySelector('[data-balance-pill]');
    pill.toggleAttribute('data-low', low);
    pill.setAttribute('aria-label', t(low ? 'con.balancePillLow' : 'con.balancePill', { rp: rp(s.balance) }));
    pill.querySelector('[data-balance-text]').textContent = rp(s.balance);
    pill.querySelector('[data-balance-dot]').className = `dot ${low ? 'dot--paused' : 'dot--on'}`;
  }

  /* ---------- Router ---------- */
  function parseHash() {
    const raw = location.hash.slice(1) || '/beranda';
    const [path, q = ''] = raw.split('?');
    return { raw, path, parts: path.split('/').filter(Boolean), q: new URLSearchParams(q) };
  }

  const ROUTES = {};
  /** Keep the Nala launcher above a sticky action bar ([data-wz-bar]; ="mobile" = only sticky below lg). */
  function liftLauncher() {
    const bar = view.querySelector('[data-wz-bar]');
    const lg = window.matchMedia('(min-width: 64rem)').matches;
    document.documentElement.toggleAttribute('data-wz-bar', Boolean(bar));
    if (bar) document.documentElement.style.setProperty('--wz-bar-h', `${lg ? (bar.dataset.wzBar === 'mobile' ? 4 : bar.offsetHeight) : bar.offsetHeight + 64}px`);
  }
  function render({ focus = true } = {}) {
    const r = parseHash();
    const name = r.parts[0] || 'beranda';
    document.body.dataset.auth = signedIn() ? 'in' : 'out';
    if (!signedIn() && name !== 'masuk') { location.replace(`#/masuk?next=${encodeURIComponent(r.raw)}`); return; }
    if (signedIn() && name === 'masuk') { location.replace(`#${r.q.get('next') || '/beranda'}`); return; }
    const route = ROUTES[name] || ROUTES.soon;
    view.innerHTML = route.html(r);
    route.mount?.(r);
    liftLauncher();
    renderPill();
    renderAccount();
    markCurrent();
    const title = route.title(r);
    document.title = `${title} — TokenNyala`;
    if (focus) {
      window.scrollTo(0, 0);
      view.querySelector('h1')?.focus({ preventScroll: true });
      routeLive.textContent = t('con.routeLive', { name: title });
    }
    if (focus && r.q.get('isi') === '1' && signedIn()) openTopup({ amount: Number(r.q.get('nominal')) || null });
  }
  window.addEventListener('hashchange', () => { setAcct(false); render(); });
  I.onChange(() => { renderNav(); render({ focus: false }); renderTopup(); });
  S.onChange(() => { renderPill(); });

  const h1 = (text, sub = '') => `<h1 tabindex="-1" class="text-[clamp(2rem,6vw,3rem)] leading-[1.02] font-extrabold tracking-[-.04em] outline-none">${esc(text)}</h1>${sub ? `<p class="mt-2 text-lg text-lead-ink">${esc(sub)}</p>` : ''}`;
  const kicker = (text) => `<p class="font-mono text-[.78rem] tracking-[.1em] text-muted uppercase">${esc(text)}</p>`;

  /* ---------- Sign in (C9): contact → 6-digit code → display name. Contact is never stored. ---------- */
  const auth = { step: 1, contact: '', code: String(Math.floor(100000 + Math.random() * 900000)) };
  ROUTES.masuk = {
    title: () => t('nav.signin'),
    html: () => {
      const err = (n) => `<p id="auth-${n}-error" class="mt-1.5 hidden text-[.92rem] font-bold text-red-700" data-auth-err="${n}"></p>`;
      const step = {
        1: `<label for="auth-contact" class="block font-bold">${esc(t('auth.contact'))}</label>
            <p id="auth-contact-help" class="mt-0.5 text-[.88rem] text-muted">${esc(t('auth.contactHelp'))}</p>
            <input id="auth-contact" name="contact" type="text" inputmode="email" autocomplete="email" class="field mt-2" placeholder="${esc(t('cs.contactPh'))}" aria-describedby="auth-contact-help auth-contact-error">${err('contact')}
            <button type="submit" class="btn btn--lg mt-5 w-full">${esc(t('auth.send'))}</button>`,
        2: `<p class="text-lead-ink">${esc(t('auth.codeSent', { contact: auth.contact }))}</p>
            <label for="auth-code" class="mt-4 block font-bold">${esc(t('auth.code'))}</label>
            <input id="auth-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" class="field mt-2 text-center font-mono text-2xl tracking-[.6em]" aria-describedby="auth-code-hint auth-code-error">
            <p id="auth-code-hint" class="mt-2 rounded-control bg-xl-sky/20 px-3 py-2 text-[.88rem]">${esc(t('auth.codeHint', { code: auth.code }))}</p>${err('code')}
            <button type="submit" class="btn btn--lg mt-5 w-full">${esc(t('auth.verify'))}</button>
            <button type="button" class="mt-2 inline-flex min-h-11 items-center font-bold text-xl-blue" data-auth-back>${esc(t('auth.change'))}</button>`,
        3: `<label for="auth-name" class="block font-bold">${esc(t('auth.name'))}</label>
            <input id="auth-name" name="name" type="text" autocomplete="nickname" maxlength="40" class="field mt-2" placeholder="${esc(t('auth.namePh'))}" aria-describedby="auth-name-error">${err('name')}
            <button type="submit" class="btn btn--lg mt-5 w-full">${esc(t('nav.signin'))}</button>`,
      }[auth.step];
      return `<div class="mx-auto max-w-md">
        ${kicker(t('auth.step', { n: auth.step }))}
        <div class="mt-2">${h1(t('auth.title'), t('auth.lead'))}</div>
        <form class="card mt-6 p-5 sm:p-6" novalidate data-auth-form>${step}</form>
        <div class="mt-8">
          <p class="font-bold">${esc(t('auth.demoTitle'))}</p>
          <ul class="mt-3 grid grid-cols-1 gap-2">${['ayu', 'raka', 'dimas'].map((p) => `<li><a href="app.html?demo=${p}#/beranda" class="flex min-h-12 items-center gap-3 rounded-control border border-line bg-white px-4 font-bold hover:border-xl-blue"><span class="grid size-8 place-items-center rounded-full bg-xl-yellow font-extrabold">${p[0].toUpperCase()}</span><span class="flex-1">${esc(t(`auth.demo.${p}`))}</span>${icon('arrow-right', 'icon size-5')}</a></li>`).join('')}</ul>
        </div></div>`;
    },
    mount: (r) => {
      const form = view.querySelector('[data-auth-form]');
      const setErr = (n, key) => {
        const el = view.querySelector(`[data-auth-err="${n}"]`);
        el.textContent = key ? t(key) : '';
        el.classList.toggle('hidden', !key);
        form.elements.namedItem(n)?.setAttribute('aria-invalid', String(Boolean(key)));
      };
      const next = (n) => { auth.step = n; render({ focus: false }); view.querySelector('input')?.focus(); routeLive.textContent = t('auth.step', { n }); };
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (auth.step === 1) {
          const c = TN.ui.parseContact(form.elements.namedItem('contact').value);
          if (!c.ok) { setErr('contact', c.error); form.elements.namedItem('contact').focus(); return; }
          auth.contact = c.value; // memory only, shown once on the next step
          return next(2);
        }
        if (auth.step === 2) {
          if (!/^\d{6}$/.test(form.elements.namedItem('code').value.trim())) { setErr('code', 'err.code'); form.elements.namedItem('code').focus(); return; }
          return next(3);
        }
        const name = form.elements.namedItem('name').value.trim();
        if (!name) { setErr('name', 'err.nameEmpty'); form.elements.namedItem('name').focus(); return; }
        auth.step = 1; auth.contact = '';
        S.signIn(name);
        location.replace(`#${r.q.get('next') || '/beranda'}`);
      });
      view.querySelector('[data-auth-back]')?.addEventListener('click', () => next(1));
    },
  };

  /* ---------- Home (C2 / C3) ---------- */
  function bannerHtml(b) {
    const paused = b.type === 'paused';
    const text = paused ? t('banner.paused', { project: b.project, date: dateStr(b.until), rp: rp(b.min) })
      : b.type === 'reminder' ? t('banner.reminder', { balance: rp(S.state.balance), project: b.project, date: dateStr(b.date), price: rp(b.price) })
        : t('banner.low', { project: b.project, date: dateStr(b.date), rp: rp(b.min) });
    return `<div class="mt-5 flex flex-col gap-3 rounded-card ${paused ? 'bg-xl-yellow' : 'bg-xl-yellow/30 ring-1 ring-xl-yellow'} p-4 sm:flex-row sm:items-center sm:p-5 on-yellow" role="status">
      <p class="flex flex-1 gap-3 font-bold">${icon(paused ? 'circle-pause' : 'bell', 'icon mt-0.5 shrink-0')}<span>${esc(text)}</span></p>
      <button type="button" class="btn shrink-0" data-topup data-amount="${b.min}">${esc(t('cta.topup'))}</button></div>`;
  }
  function nextStep(s) {
    if (S.banners().length) return { key: 'resume', href: '#/saldo?isi=1', ic: 'wallet' };
    if (s.balance <= 0 && !s.projects.length) return { key: 'topup', href: '#/saldo?isi=1', ic: 'wallet' };
    if (!s.projects.length) return { key: 'recipe', href: '#/buat', ic: 'plus' };
    const sv = s.services.filter((x) => x.status !== 'berhenti');
    if (sv.some((x) => x.tpl === 'wa-bot')) return { key: 'qr', href: `#/proyek/${sv.find((x) => x.tpl === 'wa-bot').project}`, ic: 'qr-code' };
    const noDomain = s.projects.find((p) => !p.domain && sv.some((x) => x.project === p.id && x.svc === 'hosting'));
    if (noDomain) return { key: 'domain', href: '#/layanan/domain', ic: 'at-sign', vars: { rp: rp(D.FROM.domain.price) } };
    return { key: 'key', href: '#/ai', ic: 'sparkles' };
  }
  function projectCard(p) {
    const icons = [...new Set(p.services.filter((x) => x.status !== 'berhenti').map((x) => (x.svc === 'apps' ? 'apps' : x.svc)))];
    return `<li><a href="#/proyek/${esc(p.id)}" class="card flex flex-col gap-3 p-4 hover:border-xl-blue sm:p-5">
      <span class="flex items-start justify-between gap-3"><span class="min-w-0 font-extrabold break-words">${esc(p.name)}</span>${statusPill(p.status)}</span>
      <span class="inline-flex items-center gap-1.5 font-mono text-[.9rem] text-xl-blue">${icon('lock', 'icon size-4 text-teal-ink')}${esc(p.url)}</span>
      <span class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-3">
        <span class="flex gap-1.5 text-xl-blue">${icons.map((x) => `<span class="grid size-8 place-items-center rounded-control bg-paper">${icon(D.ICONS[x], 'icon size-4')}</span>`).join('')}</span>
        <span class="text-[.88rem] text-lead-ink"><span class="num font-bold">${esc(t('home.perMonth', { rp: rp(p.monthly) }))}</span>${p.renewIn != null ? ` · ${esc(t('home.renewIn', { n: p.renewIn }))}` : ''}</span></span></a></li>`;
  }
  /** "Lasts until" line — never promise a date while something is paused. */
  function untilText(s, until) {
    if (s.balance <= 0 && !s.projects.length) return t('home.zero');
    if (s.services.some((x) => x.status === 'dijeda')) return t('home.untilPaused');
    return until ? t('home.until', { date: dateStr(until) }) : t('home.untilNone');
  }
  function balanceCard(s) {
    const until = S.until();
    return `<section class="mt-6 rounded-card bg-xl-blue p-5 text-white sm:p-7" aria-labelledby="bal-card-title">
      <h2 id="bal-card-title" class="font-mono text-[.78rem] tracking-[.1em] text-white/75 uppercase">${esc(t('nav.balance'))}</h2>
      <p class="num mt-2 text-[clamp(2.6rem,9vw,4rem)] leading-none font-extrabold" data-home-balance>${esc(rp(s.balance))}</p>
      <p class="mt-2 text-white/85">${esc(untilText(s, until))}</p>
      <div class="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" class="btn btn--yellow" data-topup>${icon('plus', 'icon size-5')}${esc(t('cta.topup'))}</button>
        <a href="#/saldo" class="inline-flex min-h-11 items-center gap-1 font-bold text-white underline decoration-xl-yellow decoration-2 underline-offset-4">${esc(t('bal.history'))}${icon('arrow-right', 'icon size-4')}</a>
      </div></section>`;
  }
  ROUTES.beranda = {
    title: () => t('nav.home'),
    html: () => {
      const s = S.state;
      const projects = s.projects.map((p) => S.projectView(p));
      const n = nextStep(s);
      const c = S.costs();
      const chips = `<ul class="mt-4 flex flex-wrap gap-2" aria-label="${esc(t('home.recipesAria'))}">${D.RECIPES.map((r) => `<li><a href="${r.aiOnly ? '#/ai?isi=1' : `#/buat?paket=${r.id}`}" class="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-xl-dark/20 bg-white px-4 font-bold hover:border-xl-blue">${esc(t(`recipe.short.${r.id}`))}</a></li>`).join('')}</ul>`;
      return `${h1(t('home.hello', { name: s.user.name }), projects.length ? '' : t('home.empty'))}
        ${S.banners().map(bannerHtml).join('')}
        ${projects.length ? '' : chips}
        ${balanceCard(s)}
        <section class="mt-8" aria-labelledby="next-title">
          <h2 id="next-title">${kicker(t('home.next'))}</h2>
          <a href="${n.href}" class="card mt-3 flex items-center gap-4 p-4 hover:border-xl-blue sm:p-5">
            <span class="grid size-11 shrink-0 place-items-center rounded-control bg-xl-yellow">${icon(n.ic)}</span>
            <span class="min-w-0 flex-1"><span class="block font-extrabold">${esc(t(`next.${n.key}.title`))}</span><span class="block text-[.92rem] text-lead-ink">${esc(t(`next.${n.key}.body`, n.vars))}</span></span>
            ${icon('arrow-right', 'icon shrink-0 text-xl-blue')}</a></section>
        <section class="mt-8" aria-labelledby="proj-title">
          <h2 id="proj-title">${kicker(t('home.projects', { n: projects.length }))}</h2>
          ${projects.length ? `<ul class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">${projects.map(projectCard).join('')}</ul>
            <p class="mt-4 text-[.92rem] text-lead-ink">${esc(t('home.month', { fixed: rp(c.fixed), usage: rp(c.usageMonth) }))}</p>`
            : `<p class="mt-3 rounded-card border border-dashed border-line px-5 py-6 text-lead-ink">${esc(t('home.noProjects'))}</p>`}
        </section>
        <section class="mt-8" aria-labelledby="learn-title">
          <h2 id="learn-title">${kicker(t('home.learn'))}</h2>
          <a href="#/belajar?panduan=${D.GUIDES[0].id}" class="card mt-3 flex items-center gap-4 p-4 hover:border-xl-blue sm:p-5">
            <span class="grid size-11 shrink-0 place-items-center rounded-control bg-paper text-xl-blue">${icon('book-open')}</span>
            <span class="min-w-0 flex-1"><span class="block font-extrabold">${esc(t(`learn.${D.GUIDES[0].id}`))}</span><span class="block text-[.88rem] text-muted">${esc(t('learn.read', { n: D.GUIDES[0].minutes }))}</span></span>
            ${icon('arrow-right', 'icon shrink-0 text-xl-blue')}</a></section>`;
    },
  };

  /* ---------- Balance (C6) ---------- */
  const historyFilter = { type: 'all', project: 'all' };
  const sizeName = (svc, size) => (!size ? '' : svc === 'email' ? t(`email.name.${size}`) : svc === 'storage' ? D.STORAGE[size].capacity : t(`size.${size}`));
  /** "Online-kan proyekmu Coba-coba", "ayu.my.id", "Otomasi n8n Ramai" */
  function serviceName(m, { size = true } = {}) {
    if (m.svc === 'domain') return m.domain || t('svc.domain.name');
    if (!m.size && m.svc !== 'payments') return m.tpl ? t(`tpl.${m.tpl}.name`) : t(`svc.${m.svc}.name`); // log rows carry no size
    return `${TN.ui.itemView(m).name} ${size ? sizeName(m.svc, m.size) : ''}`.trim();
  }
  function historyRow(h) {
    let title = '', sub = h.project || '';
    const m = h.meta || {};
    if (h.type === 'topup') { title = t('h.topup', { method: t(`method.${m.method}`) }); sub = m.bonus ? t('h.bonus', { rp: rp(m.bonus) }) : ''; }
    if (h.type === 'charge' || h.type === 'refund') {
      const name = serviceName(m, { size: !m.resize });
      if (m.resize) title = t('h.resize', { service: name, from: sizeName(h.svc, m.from), to: sizeName(h.svc, m.to), n: m.days });
      else if (h.type === 'refund') title = t('h.refund', { service: name, n: m.days });
      else if (m.renewal) title = t(h.svc === 'domain' ? 'h.renewYear' : 'h.renew30', { service: name });
      else title = t(m.resumed ? 'h.resumed' : h.svc === 'domain' ? 'h.chargeYear' : 'h.charge30', { service: name });
    }
    if (h.type === 'usage') title = m.model ? t('h.chatModel', { model: m.model }) : t(h.svc === 'chat' ? 'h.chat' : 'h.usage', { qty: t(`unit.${m.unit}`, { n: num(m.qty) }).replace('±', '') });
    const plus = h.amount > 0;
    return `<li class="grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-baseline gap-x-3 border-b border-line py-3">
      <span class="font-mono text-[.82rem] text-muted">${esc(dateStr(h.date))}</span>
      <span class="min-w-0"><span class="block font-bold">${esc(title)}</span>${sub ? `<span class="block text-[.85rem] text-muted">${esc(sub)}</span>` : ''}</span>
      <span class="num font-bold whitespace-nowrap ${plus ? 'text-teal-ink' : ''}">${plus ? '+' : '−'}${esc(rp(Math.abs(h.amount)))}</span></li>`;
  }
  ROUTES.saldo = {
    title: () => t('nav.balance'),
    html: () => {
      const s = S.state;
      const c = S.costs();
      const until = S.until();
      const types = [...new Set(s.history.map((h) => (h.type === 'topup' ? 'topup' : h.svc)))];
      const typeName = (x) => (x === 'topup' ? t('bal.onlyTopup') : t(`svc.${x}.name`));
      const rows = s.history.filter((h) => (historyFilter.type === 'all' || (historyFilter.type === 'topup' ? h.type === 'topup' : h.svc === historyFilter.type))
        && (historyFilter.project === 'all' || h.project === historyFilter.project)).slice().reverse();
      const opt = (v, label, cur) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(label)}</option>`;
      return `${h1(t('nav.balance'))}
        ${S.banners().map(bannerHtml).join('')}
        <section class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]" aria-label="${esc(t('nav.balance'))}">
          <div class="rounded-card bg-xl-blue p-5 text-white sm:p-7">
            <p class="num text-[clamp(2.6rem,9vw,4rem)] leading-none font-extrabold">${esc(rp(s.balance))}</p>
            <p class="mt-2 text-white/85">${esc(untilText(s, until))}</p>
            <button type="button" class="btn btn--yellow mt-5" data-topup>${icon('plus', 'icon size-5')}${esc(t('cta.topup'))}</button>
          </div>
          <div class="card p-5 sm:p-6">
            <h2 class="font-extrabold">${esc(t('bal.estimateTitle'))}</h2>
            <dl class="mt-3 grid grid-cols-1 gap-2 text-[.95rem]">
              <div class="flex items-baseline justify-between gap-4"><dt class="text-muted">${esc(t('bal.fixedNow'))}</dt><dd class="num font-bold whitespace-nowrap">${esc(rp(c.fixed))} ${esc(t('label.per30'))}</dd></div>
              <div class="flex items-baseline justify-between gap-4"><dt class="text-muted">${esc(t('bal.usage7'))}</dt><dd class="num font-bold whitespace-nowrap">${esc(rp(c.usage7))}</dd></div>
            </dl>
            <div class="mt-4 flex items-center justify-between gap-4 border-t border-line pt-4">
              <span id="reminder-label" class="font-bold">${esc(t('bal.reminder', { rp: rp(D.REMINDER_BELOW) }))}</span>
              <button type="button" role="switch" aria-checked="${s.reminder}" aria-labelledby="reminder-label" class="-my-1.5 shrink-0 rounded-full py-1.5" data-reminder><span class="switch" aria-hidden="true"><i></i></span></button>
            </div>
          </div>
        </section>
        <section class="mt-8" aria-labelledby="hist-title">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <h2 id="hist-title" class="text-2xl font-extrabold tracking-tight">${esc(t('bal.history'))}</h2>
            <button type="button" class="btn btn--ghost min-h-11 px-4 text-[.92rem]" data-invoice>${icon('receipt', 'icon size-5')}${esc(t('bal.invoice'))}</button>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-2 sm:max-w-lg">
            <div><label for="hist-type" class="block text-[.85rem] font-bold">${esc(t('bal.filterSvc'))}</label>
              <select id="hist-type" class="field mt-1" data-hist="type">${opt('all', t('bal.allSvc'), historyFilter.type)}${types.map((x) => opt(x, typeName(x), historyFilter.type)).join('')}</select></div>
            <div><label for="hist-project" class="block text-[.85rem] font-bold">${esc(t('bal.filterProject'))}</label>
              <select id="hist-project" class="field mt-1" data-hist="project">${opt('all', t('bal.allProject'), historyFilter.project)}${s.projects.map((p) => opt(p.id, p.name, historyFilter.project)).join('')}</select></div>
          </div>
          ${rows.length ? `<ol class="mt-4 border-t-2 border-xl-dark" aria-label="${esc(t('bal.historyAria'))}">${rows.map(historyRow).join('')}</ol>`
            : `<p class="mt-4 rounded-card border border-dashed border-line px-5 py-6 text-lead-ink">${esc(t('bal.emptyHistory'))}</p>`}
        </section>`;
    },
    mount: () => {
      view.querySelectorAll('[data-hist]').forEach((sel) => sel.addEventListener('change', () => {
        historyFilter[sel.dataset.hist] = sel.value;
        render({ focus: false });
        view.querySelector(`[data-hist="${sel.dataset.hist}"]`).focus();
      }));
      view.querySelector('[data-reminder]').addEventListener('click', () => {
        S.setReminder(!S.state.reminder);
        render({ focus: false });
        view.querySelector('[data-reminder]').focus();
      });
      view.querySelector('[data-invoice]').addEventListener('click', () => toast(t('bal.invoiceDone', { month: I.month(S.state.clock) })));
    },
  };

  /* ---------- Unknown route ---------- */
  ROUTES.soon = {
    title: () => t('con.nfTitle'),
    html: () => `${h1(t('con.nfTitle'))}<p class="mt-3 max-w-xl text-lg text-lead-ink">${esc(t('con.nfBody'))}</p>
      <div class="mt-6 flex flex-wrap gap-3"><a href="#/beranda" class="btn">${esc(t('con.toHome'))}</a><button type="button" class="btn btn--ghost" data-topup>${esc(t('cta.topup'))}</button></div>`,
  };

  /* ---------- Top-up sheet (checkout v3 adapted: amounts + method → pay → success | failed) ---------- */
  const coDlg = document.getElementById('topup');
  const co = { step: 'form', choice: null, other: '', method: null, suggested: null, va: '', resumed: [], added: 0 };
  const coModal = TN.ui.setupModal(coDlg, {
    focus: '#co-title',
    onClose: () => { if (co.step !== 'form') { co.method = null; showStep('form', { focus: false }); } render({ focus: false }); },
  });
  const amountOf = () => (co.choice === 'other' ? Number(co.other.replace(/\D/g, '')) || 0 : Number(co.choice));
  const bonusOf = (amount) => D.TOPUPS.find((p) => p.amount === amount)?.bonus || 0;
  const METHODS = ['qris', 'ewallet', 'va'];
  function renderTopup() {
    const set = (sel, text) => { const el = coDlg.querySelector(sel); if (el) el.textContent = text; };
    coDlg.querySelector('[data-co-amounts]').innerHTML = [...D.TOPUPS.map((p) => p.amount), 'other'].map((v) => {
      const checked = String(co.choice) === String(v);
      const isOther = v === 'other';
      return `<label class="relative flex min-h-16 cursor-pointer flex-col justify-center rounded-control border-2 border-line px-3 py-2 has-checked:border-xl-blue has-checked:bg-xl-blue/5 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-xl-yellow ${isOther ? 'col-span-2' : ''}">
        <input type="radio" name="co-amount" value="${v}" class="sr-only" ${checked ? 'checked' : ''}>
        <span class="num font-extrabold">${esc(isOther ? t('co.other') : rp(v))}</span>
        ${isOther ? '' : `<span class="text-[.82rem] text-teal-ink">${esc(t('co.plusBonus', { rp: rp(bonusOf(v)) }))}</span>`}
        ${v === co.suggested ? `<span class="absolute -top-2.5 right-2 rounded-full bg-xl-yellow px-2 py-0.5 font-mono text-[.68rem] font-medium">${esc(t('co.suggested'))}</span>` : ''}</label>`;
    }).join('');
    coDlg.querySelector('[data-co-other-wrap]').classList.toggle('hidden', co.choice !== 'other');
    set('[data-co-other-label]', t('co.otherLabel', { rp: rp(D.TOPUP_MIN) }));
    const amount = amountOf(), bonus = bonusOf(amount);
    const row = (k, v, strong) => `<div class="flex items-baseline justify-between gap-4 ${strong ? 'mt-1 border-t border-line pt-2 font-extrabold' : ''}"><dt class="${strong ? '' : 'text-muted'}">${esc(t(k))}</dt><dd class="num ${strong ? 'text-lg' : 'font-bold'}">${esc(v)}</dd></div>`;
    coDlg.querySelector('[data-co-breakdown]').innerHTML = row('co.nominal', rp(amount)) + row('co.bonus', '+' + rp(bonus)) + row('co.fee', rp(0)) + row('co.total', rp(amount), true);
    const preview = S.previewTopup(amount + bonus);
    set('[data-co-after]', preview.resumed.length ? t('co.afterResume', { rp: rp(preview.after), project: preview.resumed.join(', ') }) : t('co.after', { rp: rp(preview.after) }));
    coDlg.querySelector('[data-co-methods]').innerHTML = METHODS.map((m) => `<label class="relative flex min-h-14 cursor-pointer items-center gap-3 rounded-control border-2 border-line px-3 py-2.5 has-checked:border-xl-blue has-checked:bg-xl-blue/5 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-xl-yellow">
      <input type="radio" name="co-method" value="${m}" class="sr-only" aria-describedby="co-method-error" ${co.method === m ? 'checked' : ''}>
      <span class="grid size-10 shrink-0 place-items-center rounded-control bg-paper text-xl-blue">${icon(m === 'qris' ? 'qr-code' : m === 'va' ? 'landmark' : 'wallet', 'icon size-5')}</span>
      <span class="min-w-0"><span class="block font-bold">${esc(t(`method.${m}`))}</span><span class="block text-[.85rem] text-muted">${esc(t(`method.${m}Hint`))}</span></span></label>`).join('');
    set('[data-co-submit]', t('co.submit', { total: rp(amount) }));
    if (co.method) { set('[data-co-pay-title]', t(`co.pay.${co.method}`)); set('[data-co-pay-body]', t(`co.payBody.${co.method}`)); }
    set('[data-co-waiting]', t('co.waiting', { total: rp(amount) }));
    set('[data-co-va]', co.va.replace(/(\d{4})(?=\d)/g, '$1 '));
    coDlg.querySelector('[data-co-va-copy]').dataset.copy = co.va;
    set('[data-co-success-body]', t('co.successBody', { rp: rp(co.added), balance: rp(S.state.balance) }));
    coDlg.querySelector('[data-co-resumed]').innerHTML = co.resumed.map((p) => `<li>${esc(t('co.resumed', { project: p }))}</li>`).join('');
    coDlg.querySelectorAll('[data-error-for]').forEach((el) => { if (el.dataset.key) el.textContent = t(el.dataset.key, { rp: rp(D.TOPUP_MIN) }); });
  }
  function setCoError(name, key) {
    const el = coDlg.querySelector(`[data-error-for="${name}"]`);
    el.dataset.key = key || '';
    el.textContent = key ? t(key, { rp: rp(D.TOPUP_MIN) }) : '';
    el.classList.toggle('hidden', !key);
    if (name === 'other') coDlg.querySelector('#co-other').setAttribute('aria-invalid', String(Boolean(key)));
  }
  function renderQr() {
    const svg = coDlg.querySelector('[data-co-qr]');
    if (svg.childElementCount) return;
    let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="currentColor"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="currentColor"/>`;
    const inFinder = (x, y) => (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16);
    let cells = '';
    for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) if (!inFinder(x, y) && rnd() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1" fill="currentColor"/>`;
    svg.innerHTML = cells + finder(0, 0) + finder(18, 0) + finder(0, 18);
  }
  function showStep(step, { focus = true } = {}) {
    co.step = step;
    coDlg.querySelectorAll('[data-step-panel]').forEach((p) => { p.hidden = p.dataset.stepPanel !== step; });
    if (step === 'pay') {
      coDlg.querySelectorAll('[data-pay-method]').forEach((el) => { el.hidden = el.dataset.payMethod !== co.method; });
      coDlg.querySelector('[data-pay-footer]').hidden = co.method === 'ewallet';
      if (co.method === 'qris') renderQr();
    }
    renderTopup();
    if (focus) coDlg.querySelector({ form: '#co-title', pay: '#co-pay-title', success: '#co-success-title', failed: '#co-failed-title' }[step])?.focus();
  }
  /** Open with a suggested amount (wizard/banner): the smallest preset covering it, else "other" with that amount. */
  function openTopup({ amount = null, opener = document.activeElement } = {}) {
    setAcct(false);
    const preset = amount ? D.TOPUPS.find((p) => p.amount + p.bonus >= amount) : D.TOPUPS[0];
    co.suggested = amount ? (preset ? preset.amount : null) : null;
    co.choice = preset ? preset.amount : 'other';
    co.other = preset ? '' : String(amount);
    co.method = null;
    ['other', 'method'].forEach((n) => setCoError(n, null));
    showStep('form', { focus: false });
    coModal.open(opener);
  }
  coDlg.addEventListener('change', (e) => {
    if (e.target.name === 'co-amount') { co.choice = e.target.value === 'other' ? 'other' : Number(e.target.value); renderTopup(); coDlg.querySelector(`[name="co-amount"][value="${e.target.value}"]`).focus(); if (co.choice === 'other') coDlg.querySelector('#co-other').focus(); }
    if (e.target.name === 'co-method') { co.method = e.target.value; setCoError('method', null); }
  });
  coDlg.querySelector('#co-other').addEventListener('input', (e) => {
    co.other = e.target.value;
    const pos = e.target.selectionStart;
    renderTopup();
    e.target.focus(); e.target.setSelectionRange(pos, pos);
  });
  coDlg.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = amountOf();
    const badAmount = amount < D.TOPUP_MIN || amount % 1000 !== 0;
    setCoError('other', co.choice === 'other' && badAmount ? 'err.amount' : null);
    setCoError('method', co.method ? null : 'err.method');
    if (co.choice === 'other' && badAmount) { coDlg.querySelector('#co-other').focus(); return; }
    if (!co.method) { coDlg.querySelector('[name="co-method"]').focus(); return; }
    co.va = '8808' + Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
    showStep('pay');
  });
  coDlg.addEventListener('click', (e) => {
    if (e.target.closest('[data-co-close]')) return coModal.close();
    if (e.target.closest('[data-co-back]')) return showStep('form');
    if (e.target.closest('[data-co-fail]')) return showStep('failed');
    const paid = e.target.closest('[data-co-paid]');
    if (!paid || paid.disabled) return;
    coDlg.querySelectorAll('[data-co-paid]').forEach((b) => { b.disabled = true; });
    coDlg.querySelector('[data-co-live]').textContent = t('co.checking');
    const main = coDlg.querySelector('[data-co-paid-main]');
    main.textContent = t('co.checking');
    setTimeout(() => { // ≤ 600ms simulated check (v3 rule)
      coDlg.querySelectorAll('[data-co-paid]').forEach((b) => { b.disabled = false; });
      main.textContent = t('co.paid');
      const amount = amountOf(), bonus = bonusOf(amount);
      const { resumed } = S.topup({ amount, bonus, method: co.method });
      co.added = amount + bonus;
      co.resumed = resumed;
      showStep('success');
      coDlg.querySelector('[data-co-live]').textContent = t('co.successTitle');
    }, 600);
  });

  /* ---------- Start (after every console script registered its routes) ---------- */
  window.TN.console = {
    ROUTES, render, openTopup, toast, confirmAsk, h1, kicker, statusPill, projectCard, bannerHtml, go, view, routeLive, parseHash, dateStr,
    serviceName, get route() { return parseHash(); },
  };
  document.addEventListener('DOMContentLoaded', () => { I.init(); renderNav(); render(); });
})();
