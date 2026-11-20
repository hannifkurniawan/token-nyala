/* TokenNyala v4 — console: create wizard (#/buat, wireframe C4) + projects (#/proyek, #/proyek/:id, C5).
   Registers routes on TN.console; numbers from TN.data, state changes through TN.store only. */
(() => {
  'use strict';
  const D = TN.data;
  const I = TN.i18n;
  const S = TN.store;
  const C = TN.console;
  const { t, rp, rpK, num } = I;
  const { icon, esc, itemView } = TN.ui;
  const { h1, kicker, statusPill, toast, confirmAsk, dateStr, serviceName } = C;
  const view = C.view;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slug = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);
  const NAME_RE = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;
  const TAKEN_DOMAINS = ['google', 'tokennyala', 'toko', 'admin', 'shop'];
  const LIMITS = [25000, 50000, 100000, 0]; // 0 = no limit (§2 defaults)
  const limitName = (v) => (v ? rp(v) : t('limit.none'));

  /* ====================================================================== */
  /* Wizard                                                                  */
  /* ====================================================================== */
  const wz = { key: null, step: 1, goal: null, items: [], name: '', domain: '', source: 'upload', limit: 50000, errors: {}, project: null, progress: [], done: 0 };
  const uniqueName = (base) => {
    let n = slug(base) || 'proyek';
    if (n.length < 3) n = `${n}-app`;
    const taken = new Set(S.state.projects.map((p) => p.id));
    if (!taken.has(n)) return n;
    for (let i = 2; ; i++) if (!taken.has(`${n.slice(0, 27)}-${i}`)) return `${n.slice(0, 27)}-${i}`;
  };
  function itemsForGoal(goal, s = null) {
    if (D.recipe(goal)) return D.itemsFromUrl(goal, s);
    if (goal?.startsWith('tpl:')) {
      const id = goal.slice(4), d = D.TEMPLATES[id].def;
      const items = [{ svc: 'apps', tpl: id, size: d.size, on: true }];
      if (d.unit) items.push({ svc: 'ai', unit: d.unit, qty: d.qty, on: true });
      return D.applyMinimums(items).items;
    }
    // start from scratch: the common services, all switched off
    return ['hosting', 'database', 'storage', 'domain', 'email', 'ai:sesi'].map((k) => ({ ...D.NEW_ITEM[k], on: false }));
  }
  function setGoal(goal, s = null) {
    wz.goal = goal;
    wz.items = itemsForGoal(goal, s);
    const user = slug(S.state.user?.name) || 'saya';
    const base = D.recipe(goal) ? `${goal}-${user}` : goal?.startsWith('tpl:') ? `${goal.slice(4)}-${user}` : `proyek-${user}`;
    wz.name = uniqueName(base);
    wz.domain = user.length >= 3 ? user : `${user}-web`;
    wz.errors = {};
  }
  function initWizard(r) {
    if (wz.key === r.raw) return; // same entry: keep progress (re-renders, back from a top-up, step 4 running)
    wz.key = r.raw; wz.project = null; wz.progress = []; wz.done = 0;
    const resep = r.q.get('resep'), tpl = r.q.get('template');
    if (resep && D.recipe(resep) && !D.recipe(resep).aiOnly) { setGoal(resep, r.q.get('s')); wz.step = 2; }
    else if (tpl && D.TEMPLATES[tpl]) { setGoal(`tpl:${tpl}`); wz.step = 2; }
    else if (r.q.get('s')) { wz.goal = 'kosong'; setGoal('kosong'); wz.items = D.itemsFromUrl('', r.q.get('s')); wz.step = 2; }
    else { wz.goal = null; wz.items = []; wz.step = 1; }
  }
  const onItems = () => wz.items.filter((i) => i.on !== false);
  const domainItem = () => wz.items.find((i) => i.svc === 'domain' && i.on !== false);
  const fullDomain = () => `${wz.domain}.${domainItem()?.ext}`;
  const freeUrl = () => `${wz.name || 'proyek'}.tokennyala.app`;

  function progressBar() {
    return `<div class="flex items-center gap-3"><p class="font-mono text-[.78rem] tracking-[.1em] text-muted uppercase">${esc(t('wiz.step', { n: wz.step }))}</p>
      <div class="flex flex-1 gap-1" aria-hidden="true">${[1, 2, 3, 4].map((n) => `<span class="h-1.5 flex-1 rounded-full ${n <= wz.step ? 'bg-xl-blue' : 'bg-line'}"></span>`).join('')}</div></div>`;
  }
  const errText = (k) => (wz.errors[k] ? `<p id="wz-${k}-error" class="mt-1.5 text-[.92rem] font-bold text-red-700">${esc(t(wz.errors[k]))}</p>` : '');

  function stepGoal() {
    const card = (value, title, sub, ic) => `<label class="relative flex min-h-16 cursor-pointer items-center gap-3 rounded-card border-2 border-line bg-white p-4 has-checked:border-xl-blue has-checked:bg-xl-blue/5 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-xl-yellow">
      <input type="radio" name="goal" value="${esc(value)}" class="sr-only" ${wz.goal === value ? 'checked' : ''}>
      <span class="grid size-10 shrink-0 place-items-center rounded-control bg-paper text-xl-blue">${icon(ic, 'icon size-5')}</span>
      <span class="min-w-0 flex-1"><span class="block font-extrabold">${esc(title)}</span><span class="block text-[.88rem] text-lead-ink">${esc(sub)}</span></span></label>`;
    const recipes = D.RECIPES.filter((r) => !r.aiOnly).map((r) => card(r.id, t(`recipe.name.${r.id}`), `≈ ${rpK(D.recipeTotals(r.items).perMonth)}${t('label.perMonth')} · ${t(`recipe.desc.${r.id}`)}`, D.ICONS[r.items[0].svc === 'apps' ? 'apps' : 'hosting']));
    const tpls = Object.keys(D.TEMPLATES).map((id) => card(`tpl:${id}`, t(`tpl.${id}.name`), `≈ ${rpK(D.templateCost(id))}${t('label.perMonth')} · ${t(`tpl.${id}.desc`)}`, D.TEMPLATE_ICONS[id]));
    return `<fieldset><legend class="font-bold">${esc(t('wiz.recipes'))}</legend><div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">${recipes.join('')}${card('kosong', t('wiz.empty'), t('wiz.emptyDesc'), 'plus')}</div></fieldset>
      <fieldset class="mt-6"><legend class="font-bold">${esc(t('wiz.templates'))}</legend><div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">${tpls.join('')}</div></fieldset>
      ${errText('goal')}
      <a href="#/ai?isi=1" class="mt-5 inline-flex min-h-11 items-center gap-1 font-bold text-xl-blue underline decoration-xl-yellow decoration-2 underline-offset-4">${esc(t('wiz.aiOnly'))}${icon('arrow-right', 'icon size-4')}</a>`;
  }

  function rowControls(it, fid) {
    if (D.OPTIONS[it.svc] && it.svc !== 'domain') {
      let extra = '';
      if (it.svc === 'hosting') {
        extra = `<fieldset class="mt-3"><legend class="text-[.88rem] font-bold">${esc(t('wiz.source'))}</legend><div class="mt-1.5 grid grid-cols-2 gap-2">${['upload', 'github'].map((v) => `<label class="flex min-h-11 cursor-pointer items-center justify-center rounded-control border-2 border-line px-2 text-center text-[.9rem] font-bold has-checked:border-xl-blue has-checked:bg-xl-blue/5 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-xl-yellow"><input type="radio" name="source" value="${v}" class="sr-only" ${wz.source === v ? 'checked' : ''}>${esc(t(`wiz.source.${v}`))}</label>`).join('')}</div></fieldset>`;
      }
      const forLine = it.svc === 'hosting' || it.svc === 'apps' ? `<p class="mt-2 text-[.88rem] text-lead-ink">${esc(t(`calc.for.${it.size}`, { n: num(D.SIZES[it.size].visitors) }))}</p>` : '';
      const minLine = it.svc === 'apps' && D.templateMinSize(it.tpl, D.usesAi(wz.items)) !== 'coba'
        ? `<p class="mt-1 text-[.88rem] text-lead-ink">${esc(t('size.disabled', { template: t(`tpl.${it.tpl}.name`), size: t(`size.${D.templateMinSize(it.tpl, D.usesAi(wz.items))}`) }))}</p>` : '';
      return TN.ui.segmented(it, fid, wz.items) + forLine + minLine + extra;
    }
    if (it.svc === 'domain') {
      const ok = NAME_RE.test(wz.domain) && !TAKEN_DOMAINS.includes(wz.domain);
      const status = !NAME_RE.test(wz.domain) ? '' : TAKEN_DOMAINS.includes(wz.domain)
        ? `<p class="mt-2 font-bold text-red-700" role="status">${esc(t('wiz.domainTaken', { domain: fullDomain() }))}</p>`
        : `<p class="mt-2 inline-flex items-center gap-1.5 font-bold text-teal-ink" role="status">${icon('check', 'icon size-4')}${esc(t('wiz.domainAvail', { rp: rp(D.DOMAINS[it.ext].first), renew: rp(D.DOMAINS[it.ext].renew) }))}</p>`;
      return `<div class="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <label for="wz-domain" class="sr-only">${esc(t('wiz.domainName'))}</label>
          <input id="wz-domain" name="domain" class="field font-mono" value="${esc(wz.domain)}" autocomplete="off" spellcheck="false" aria-describedby="wz-domain-error" ${wz.errors.domain ? 'aria-invalid="true"' : ''}>
          <label for="wz-ext" class="sr-only">${esc(t('calc.domain'))}</label>
          <select id="wz-ext" class="field w-auto pr-8" data-ext>${D.OPTIONS.domain.map((x) => `<option value="${x}" ${x === it.ext ? 'selected' : ''}>.${x}</option>`).join('')}</select>
        </div>${errText('domain')}${ok || wz.errors.domain ? status : status}
        <p class="mt-1 text-[.85rem] text-muted">${esc(t('wiz.domainFree', { url: freeUrl() }))}</p>`;
    }
    if (it.svc === 'ai') {
      const unit = t(`unit.name.${it.unit}`);
      return `<p class="text-[.92rem] text-lead-ink">${esc(t('wiz.aiKey'))}</p>
        <label for="wz-limit" class="sr-only">${esc(t('wiz.limit'))}</label>
        <select id="wz-limit" class="field mt-2" data-limit>${LIMITS.map((v) => `<option value="${v}" ${v === wz.limit ? 'selected' : ''}>${esc(limitName(v))}</option>`).join('')}</select>
        <div class="mt-3 flex items-center gap-3">
          <button type="button" class="grid size-11 shrink-0 place-items-center rounded-control border-2 border-line hover:border-xl-blue" aria-label="${esc(t('calc.less', { unit }))}" data-step="-1" data-fid="${fid}-less">${icon('minus', 'icon size-5')}</button>
          <p class="min-w-0 flex-1 text-center"><span class="num block text-xl font-extrabold" aria-live="polite">${num(it.qty)}</span><span class="text-[.85rem] text-muted">${esc(unit)} · ${esc(t('label.estimate'))}</span></p>
          <button type="button" class="grid size-11 shrink-0 place-items-center rounded-control border-2 border-line hover:border-xl-blue" aria-label="${esc(t('calc.more', { unit }))}" data-step="1" data-fid="${fid}-more">${icon('plus', 'icon size-5')}</button></div>`;
    }
    if (it.svc === 'payments') return `<p class="text-[.92rem] text-lead-ink">${esc(t('calc.payments', { pct: num(D.PAYMENTS.feePct) }))}</p>`;
    return '';
  }

  function stepSetup() {
    const rows = wz.items.map((it) => {
      const key = D.itemKey(it), fid = 'w-' + key.replace(/[:.]/g, '-'), on = it.on !== false, v = itemView(it);
      return `<li class="card p-4 sm:p-5 ${on ? '' : 'bg-paper'}" data-key="${key}">
        <div class="flex items-start gap-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-control ${on ? 'bg-xl-blue text-white' : 'bg-white text-muted ring-1 ring-line'}">${icon(v.icon, 'icon size-5')}</span>
          <div class="min-w-0 flex-1"><h2 id="${fid}-name" class="leading-snug font-extrabold">${esc(v.name)}</h2><p class="text-[.88rem] ${on ? 'text-lead-ink' : 'text-muted'}">${esc(on ? v.detail : t('calc.offNote'))}</p></div>
          <button type="button" role="switch" aria-checked="${on}" aria-labelledby="${fid}-name" data-toggle data-fid="${fid}-sw" class="relative -my-1.5 shrink-0 rounded-full py-1.5"><span class="switch" aria-hidden="true"><i></i></span></button>
        </div>${on ? `<div class="mt-4">${rowControls(it, fid)}</div>` : ''}</li>`;
    }).join('');
    return `<div><label for="wz-name" class="block font-bold">${esc(t('wiz.name'))}</label>
        <p id="wz-name-hint" class="mt-0.5 text-[.88rem] text-muted">${esc(t('wiz.nameHint', { url: freeUrl() }))}</p>
        <input id="wz-name" name="name" class="field mt-2 font-mono" value="${esc(wz.name)}" autocomplete="off" spellcheck="false" aria-describedby="wz-name-hint wz-name-error" ${wz.errors.name ? 'aria-invalid="true"' : ''}>${errText('name')}</div>
      <ul class="mt-6 grid grid-cols-1 gap-3" data-wz-rows>${rows}</ul>${errText('items')}`;
  }

  function chargeLines() {
    return onItems().filter((i) => i.svc !== 'ai').map((it) => {
      const c = D.itemCost(it);
      const name = it.svc === 'domain' ? fullDomain() : serviceName(it);
      return { name, amount: c.amount, year: it.svc === 'domain' };
    }).filter((l) => l.amount > 0 || l.year === false);
  }
  function stepSummary() {
    const lines = chargeLines();
    const total = lines.reduce((n, l) => n + l.amount, 0);
    const bal = S.state.balance;
    const short = Math.max(0, total - bal);
    const later = onItems().filter((i) => i.svc === 'ai' || i.svc === 'payments');
    const renewDate = S.addDays(S.state.clock, 30);
    const laterHtml = later.map((it) => (it.svc === 'payments' ? `<li>${esc(t('calc.payments', { pct: num(D.PAYMENTS.feePct) }))}</li>`
      : `<li>${esc(t('wiz.later', { name: t(`item.ai.${it.unit}`), unit: rp(D.UNITS[it.unit].cost), per: t(`unit.name.${it.unit}`).replace(/an$|s$/, ''), qty: t(`unit.${it.unit}`, { n: num(it.qty) }), rp: rp(D.itemCost(it).amount) }))}</li>`)).join('');
    const suggest = short ? D.suggestTopup(short) : null;
    return `<section class="card p-5 sm:p-6" aria-labelledby="wz-now">
        <h2 id="wz-now" class="font-extrabold">${esc(t('wiz.nowTitle'))}</h2>
        <dl class="mt-3 grid grid-cols-1 gap-2">${lines.map((l) => `<div class="flex items-baseline justify-between gap-4"><dt class="text-lead-ink">${esc(t(l.year ? 'wiz.nowYear' : 'wiz.now30', { service: l.name }))}</dt><dd class="num font-bold whitespace-nowrap">${esc(rp(l.amount))}</dd></div>`).join('')}
          <div class="mt-1 flex items-baseline justify-between gap-4 border-t border-line pt-3 text-lg font-extrabold"><dt>${esc(t('wiz.totalNow'))}</dt><dd class="num" data-wz-total>${esc(rp(total))}</dd></div></dl>
        ${laterHtml ? `<h3 class="mt-5 font-extrabold">${esc(t('wiz.laterTitle'))}</h3><ul class="mt-2 grid grid-cols-1 gap-1 text-[.92rem] text-lead-ink">${laterHtml}</ul>` : ''}
        <p class="mt-4 text-[.88rem] text-muted">${esc(t('wiz.renews', { date: dateStr(renewDate) }))}</p></section>
      <section class="mt-4 rounded-card ${short ? 'bg-xl-yellow/30 ring-1 ring-xl-yellow' : 'bg-xl-teal/15'} p-5 sm:p-6" aria-live="polite">
        <p class="font-bold" data-wz-balance>${esc(t('wiz.balance', { now: rp(bal), after: rp(bal - total) }))}</p>
        ${short ? `<p class="mt-1 text-lead-ink">${esc(t('wiz.short', { rp: rp(short) }))}</p>
          <button type="button" class="btn btn--yellow mt-4 w-full sm:w-auto" data-wz-topup data-amount="${short}">${icon('wallet', 'icon size-5')}${esc(t('wiz.topup', { rp: rp(suggest.amount) }))}</button>` : ''}
        </section>`;
  }

  function progressSteps(project) {
    const it = (svc) => onItems().find((i) => i.svc === svc);
    const steps = [t('wiz.p.space')];
    const app = it('apps');
    if (app) steps.push(t('wiz.p.template', { template: t(`tpl.${app.tpl}.name`) }));
    if (it('server')) steps.push(t('wiz.p.server'));
    if (it('database')) steps.push(t('wiz.p.database'));
    if (it('storage')) steps.push(t('wiz.p.storage'));
    steps.push(it('domain') ? t('wiz.p.domain', { domain: project.domain }) : t('wiz.p.free', { url: `${project.id}.tokennyala.app` }));
    steps.push(t('wiz.p.https'));
    if (it('email')) steps.push(t('wiz.p.email'));
    if (it('payments')) steps.push(t('wiz.p.payments'));
    if (it('ai')) steps.push(t('wiz.p.ai'));
    return steps;
  }
  function stepStarting() {
    const p = S.state.projects.find((x) => x.id === wz.project);
    const pv = S.projectView(p);
    const done = wz.done >= wz.progress.length;
    const list = wz.progress.map((label, i) => {
      const st = i < wz.done ? 'done' : i === wz.done ? 'busy' : 'todo';
      return `<li class="flex items-center gap-3 py-2 ${st === 'todo' ? 'text-muted' : ''}">${st === 'done' ? `<span class="grid size-6 place-items-center rounded-full bg-xl-teal">${icon('check', 'icon size-4')}</span>` : `<span class="grid size-6 place-items-center"><span class="dot ${st === 'busy' ? 'dot--busy animate-pulse' : ''}"></span></span>`}<span class="font-bold">${esc(label)}</span></li>`;
    }).join('');
    const hasHosting = pv.services.some((x) => x.svc === 'hosting');
    const wa = pv.services.some((x) => x.tpl === 'wa-bot');
    return `<section class="card p-5 sm:p-6" aria-labelledby="wz-prog"><h2 id="wz-prog" class="sr-only">${esc(t('wiz.t4'))}</h2><ol class="grid grid-cols-1">${list}</ol>
        <p class="sr-only" aria-live="polite" data-wz-live></p></section>
      ${done ? `<section class="mt-6 rounded-card bg-xl-blue p-6 text-center text-white sm:p-8" aria-labelledby="wz-on">
        <span class="switch switch--lg mx-auto" data-on aria-hidden="true"><i></i></span>
        <h2 id="wz-on" tabindex="-1" class="mt-5 text-[clamp(2rem,6vw,3rem)] font-extrabold tracking-[-.04em] outline-none">${esc(t('wiz.on'))}</h2>
        <p class="mt-2 text-white/85">${esc(t('wiz.onBody', { project: p.name, rp: rp(S.state.balance) }))}</p>
        <p class="mt-4 inline-flex flex-wrap items-center justify-center gap-2 font-mono text-lg">${icon('lock', 'icon size-5 text-xl-teal')}<span>${esc(pv.url)}</span></p>
        <div class="mt-3"><button type="button" class="btn btn--ghost-light" data-copy="https://${esc(pv.url)}">${icon('copy', 'icon size-4')}<span data-copy-label>${esc(t('wiz.copyLink'))}</span></button></div></section>
      <section class="mt-6" aria-labelledby="wz-next"><h2 id="wz-next">${kicker(t('wiz.nextTitle'))}</h2>
        <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          ${hasHosting ? `<a href="#/proyek/${esc(p.id)}" class="btn btn--ghost">${icon('folder', 'icon size-5')}${esc(t('wiz.upload'))}</a>` : ''}
          ${wa ? `<a href="#/proyek/${esc(p.id)}" class="btn btn--ghost">${icon('qr-code', 'icon size-5')}${esc(t('wiz.qr'))}</a>` : ''}
          <button type="button" class="btn btn--ghost" data-copy="${esc(p.key)}">${icon('copy', 'icon size-5')}<span data-copy-label>${esc(t('wiz.copyKey'))}</span></button>
          <a href="#/proyek/${esc(p.id)}" class="btn btn--ghost">${esc(t('wiz.toProject'))}</a>
          <a href="#/beranda" class="btn">${esc(t('con.toHome'))}</a></div></section>` : ''}`;
  }

  function stickyBar() {
    if (wz.step === 4) return '';
    const tot = D.recipeTotals(onItems());
    const label = wz.step === 3 ? t('wiz.go') : t('wiz.next');
    return `<div class="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] z-20 -mx-4 mt-6 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:bottom-0" data-allow-bleed data-wz-bar>
      <div class="flex items-center gap-3">
        ${wz.step > 1 ? `<button type="button" class="btn btn--ghost min-w-11 shrink-0 px-3 sm:px-4" data-wz-back aria-label="${esc(t('wiz.back'))}">${icon('arrow-right', 'icon size-5 rotate-180')}<span class="hidden sm:inline">${esc(t('wiz.back'))}</span></button>` : ''}
        ${wz.step === 3 ? '<span class="flex-1 sm:hidden"></span>' : ''}
        ${wz.step > 1 ? `<p class="min-w-0 flex-1 leading-tight whitespace-nowrap ${wz.step === 3 ? 'hidden sm:block' : ''}"><span class="num text-[1.2rem] font-extrabold">≈ ${esc(rpK(tot.perMonth))}</span><span class="text-[.82rem] font-bold text-muted">${esc(t('calc.perMo'))}</span></p>` : '<span class="flex-1"></span>'}
        <button type="button" class="btn shrink-0 px-5" data-wz-next>${esc(label)}${icon('arrow-right', 'icon icon-go hidden size-5 sm:block')}</button>
      </div></div>`;
  }

  C.ROUTES.buat = {
    title: () => t('nav.createLong'),
    html: (r) => {
      initWizard(r);
      const body = { 1: stepGoal, 2: stepSetup, 3: stepSummary, 4: stepStarting }[wz.step]();
      return `${progressBar()}<div class="mt-3">${h1(t(`wiz.t${wz.step}`))}</div><div class="mt-6" data-wz>${body}</div>${stickyBar()}`;
    },
    mount: () => mountWizard(),
  };

  function rerender({ focus = null } = {}) {
    const fidFocus = focus || document.activeElement?.dataset?.fid;
    C.render({ focus: false });
    if (fidFocus) view.querySelector(`[data-fid="${fidFocus}"], #${fidFocus}`)?.focus();
  }
  function goStep(n) {
    wz.step = n;
    wz.errors = {};
    if (n === 4) { // progress list first: an empty list would render as "done" for one frame
      wz.progress = progressSteps(S.state.projects.find((x) => x.id === wz.project));
      wz.done = 0;
    }
    C.render({ focus: false });
    window.scrollTo(0, 0);
    view.querySelector('h1')?.focus({ preventScroll: true });
    C.routeLive.textContent = `${t('wiz.step', { n })}: ${t(`wiz.t${n}`)}`;
    if (n === 4) runStarting();
  }
  const findItem = (key) => wz.items.find((i) => D.itemKey(i) === key);
  function validateSetup() {
    const e = {};
    if (!NAME_RE.test(wz.name)) e.name = 'err.projectName';
    else if (S.state.projects.some((p) => p.id === wz.name)) e.name = 'err.projectTaken';
    if (domainItem() && (!NAME_RE.test(wz.domain) || TAKEN_DOMAINS.includes(wz.domain))) e.domain = 'err.domain';
    if (!onItems().some((i) => i.svc !== 'ai')) e.items = 'err.nothingOn';
    return e;
  }
  /** Keep the Nala launcher above the wizard's sticky bar (tab bar + bar on mobile, bar on desktop). */
  function liftLauncher() {
    const bar = view.querySelector('[data-wz-bar]');
    document.documentElement.toggleAttribute('data-wz-bar', Boolean(bar));
    if (bar) document.documentElement.style.setProperty('--wz-bar-h', `${bar.offsetHeight + (window.matchMedia('(min-width: 64rem)').matches ? 0 : 64)}px`);
  }
  window.addEventListener('hashchange', () => {
    if (location.hash.startsWith('#/buat')) return;
    document.documentElement.removeAttribute('data-wz-bar');
    if (wz.step === 4) wz.key = null; // a finished wizard starts fresh next time
  });
  function mountWizard() {
    const root = view;
    liftLauncher();
    root.querySelectorAll('input[name=goal]').forEach((r) => r.addEventListener('change', () => { setGoal(r.value); }));
    root.querySelector('[data-wz-next]')?.addEventListener('click', () => {
      if (wz.step === 1) {
        if (!wz.goal) { wz.errors = { goal: 'wiz.pickGoal' }; rerender(); view.querySelector('input[name=goal]')?.focus(); return; }
        return goStep(2);
      }
      if (wz.step === 2) {
        wz.errors = validateSetup();
        if (Object.keys(wz.errors).length) {
          rerender();
          view.querySelector(wz.errors.name ? '#wz-name' : wz.errors.domain ? '#wz-domain' : '[data-toggle]')?.focus();
          return;
        }
        return goStep(3);
      }
      if (wz.step === 3) {
        const total = chargeLines().reduce((n, l) => n + l.amount, 0);
        if (total > S.state.balance) { view.querySelector('[data-wz-topup]')?.focus(); C.routeLive.textContent = t('wiz.needTopup', { rp: rp(total - S.state.balance) }); return; }
        const domain = domainItem() ? fullDomain() : null;
        const items = onItems().map((it) => (it.svc === 'hosting' ? { ...it, source: wz.source } : it));
        wz.project = S.createProject({ name: wz.name, domain, items, limit: wz.limit });
        return goStep(4);
      }
    });
    root.querySelector('[data-wz-back]')?.addEventListener('click', () => goStep(wz.step - 1));
    const name = root.querySelector('#wz-name');
    name?.addEventListener('input', () => { wz.name = name.value.trim().toLowerCase(); if (wz.errors.name && NAME_RE.test(wz.name)) { delete wz.errors.name; rerender({ focus: 'wz-name' }); } else root.querySelector('#wz-name-hint').textContent = t('wiz.nameHint', { url: freeUrl() }); });
    const dom = root.querySelector('#wz-domain');
    dom?.addEventListener('change', () => { wz.domain = slug(dom.value); delete wz.errors.domain; rerender({ focus: 'wz-domain' }); });
    root.querySelector('[data-ext]')?.addEventListener('change', (e) => { findItem('domain').ext = e.target.value; rerender({ focus: 'wz-ext' }); });
    root.querySelector('[data-limit]')?.addEventListener('change', (e) => { wz.limit = Number(e.target.value); });
    root.querySelectorAll('input[name=source]').forEach((r) => r.addEventListener('change', () => { wz.source = r.value; }));
    root.querySelector('[data-wz-rows]')?.addEventListener('click', (e) => {
      const li = e.target.closest('[data-key]');
      if (!li) return;
      const it = findItem(li.dataset.key);
      if (e.target.closest('[data-toggle]')) it.on = it.on === false;
      else if (e.target.closest('[role=radio]')) { const o = e.target.closest('[role=radio]'); if (o.getAttribute('aria-disabled') === 'true') return; it.size = o.dataset.size; }
      else if (e.target.closest('[data-step]')) it.qty = Math.min(D.AI_MAX, Math.max(0, it.qty + Number(e.target.closest('[data-step]').dataset.step) * D.UNITS[it.unit].step));
      else return;
      wz.items = D.applyMinimums(wz.items).items;
      delete wz.errors.items;
      rerender();
    });
    root.querySelector('[data-wz-rows]')?.addEventListener('keydown', (e) => {
      const target = TN.ui.radioKeys(e);
      if (!target) return;
      findItem(e.target.closest('[data-key]').dataset.key).size = target.dataset.size;
      rerender();
    });
    root.querySelector('[data-wz-topup]')?.addEventListener('click', (e) => C.openTopup({ amount: Number(e.currentTarget.dataset.amount), opener: e.currentTarget }));
  }

  function runStarting() {
    const id = wz.project;
    const tick = () => {
      if (wz.project !== id) return;
      wz.done++;
      const onPage = location.hash.startsWith('#/buat');
      if (wz.done >= wz.progress.length) {
        S.finishStarting(id);
        if (onPage) { C.render({ focus: false }); view.querySelector('#wz-on')?.focus(); C.routeLive.textContent = t('wiz.on'); }
        return;
      }
      if (onPage) {
        C.render({ focus: false });
        const live = view.querySelector('[data-wz-live]');
        if (live) live.textContent = t('wiz.p.done', { step: wz.progress[wz.done - 1] });
      }
      setTimeout(tick, reduced() ? 150 : 650);
    };
    setTimeout(tick, reduced() ? 150 : 650);
  }

  /* ====================================================================== */
  /* Projects                                                               */
  /* ====================================================================== */
  C.ROUTES.proyek = {
    title: (r) => (r.parts[1] ? decodeURIComponent(r.parts[1]) : t('proj.title')),
    html: (r) => (r.parts[1] ? detailHtml(r) : listHtml()),
    mount: (r) => { if (r.parts[1]) mountDetail(r); },
  };

  function listHtml() {
    const list = S.state.projects.map((p) => S.projectView(p));
    return `<div class="flex flex-wrap items-end justify-between gap-3">${h1(t('proj.title'))}<a href="#/buat" class="btn">${icon('plus', 'icon size-5')}${esc(t('nav.createLong'))}</a></div>
      ${list.length ? `<ul class="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">${list.map(C.projectCard).join('')}</ul>`
        : `<p class="mt-6 rounded-card border border-dashed border-line px-5 py-8 text-lead-ink">${esc(t('proj.empty'))}</p>`}`;
  }

  const TABS = ['ringkasan', 'layanan', 'ai', 'log', 'pengaturan'];
  const TAB_KEY = { ringkasan: 'tab.summary', layanan: 'tab.services', ai: 'tab.ai', log: 'tab.log', pengaturan: 'tab.settings' };
  const SIZED = ['hosting', 'apps', 'server', 'database', 'storage', 'email'];
  const tabOf = (r) => (TABS.includes(r.q.get('tab')) ? r.q.get('tab') : 'ringkasan');

  function detailHtml(r) {
    const id = decodeURIComponent(r.parts[1]);
    const p = S.state.projects.find((x) => x.id === id);
    if (!p) return `${h1(t('proj.notFound'))}<a href="#/proyek" class="btn mt-6">${esc(t('proj.title'))}</a>`;
    const pv = S.projectView(p);
    const tab = tabOf(r);
    const tabs = `<div class="no-scrollbar mt-6 overflow-x-auto border-b border-line">
      <div role="tablist" aria-label="${esc(t('proj.tabsAria'))}" class="flex w-max gap-1" data-tabs>${TABS.map((x) => `<button type="button" role="tab" id="tab-${x}" aria-selected="${x === tab}" aria-controls="panel-${x}" tabindex="${x === tab ? 0 : -1}" data-tab="${x}"
        class="min-h-11 min-w-11 shrink-0 border-b-[3px] border-transparent px-3 font-bold whitespace-nowrap text-muted aria-selected:border-xl-yellow aria-selected:text-xl-dark">${esc(t(TAB_KEY[x]))}</button>`).join('')}</div></div>`;
    const panel = { ringkasan: panelSummary, layanan: panelServices, ai: panelAi, log: panelLog, pengaturan: panelSettings }[tab](p, pv);
    return `<div data-detail-root><a href="#/proyek" class="inline-flex min-h-11 items-center gap-1 font-bold text-xl-blue">${icon('arrow-right', 'icon size-4 rotate-180')}${esc(t('proj.title'))}</a>
      <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">${h1(p.name)}${statusPill(pv.status)}</div>
      <p class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-lead-ink"><span class="inline-flex items-center gap-1.5 font-mono text-xl-blue">${icon('lock', 'icon size-4 text-teal-ink')}${esc(pv.url)}</span>
        <span class="num">${esc(t('proj.monthly', { rp: rp(pv.monthly) }))}</span>${pv.renewAt ? `<span>${esc(t('proj.renew', { date: dateStr(pv.renewAt) }))}</span>` : ''}</p>
      ${S.banners().filter((b) => b.project === p.id).map(C.bannerHtml).join('')}
      ${tabs}<div id="panel-${tab}" role="tabpanel" aria-labelledby="tab-${tab}" tabindex="0" class="mt-6 focus:outline-none">${panel}</div></div>`;
  }

  function aiMonth(projectId) {
    const month = S.state.clock.slice(0, 7);
    return S.state.history.filter((h) => h.type === 'usage' && h.project === projectId && h.date.startsWith(month)).reduce((n, h) => n - h.amount, 0);
  }
  function qrSvg() {
    let seed = 11; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="currentColor"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="currentColor"/>`;
    let cells = '';
    for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) if (!((x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16)) && rnd() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1" fill="currentColor"/>`;
    return `<svg class="size-40 text-xl-dark" viewBox="0 0 25 25" role="img" aria-label="${esc(t('co.qrAria'))}" shape-rendering="crispEdges">${cells}${finder(0, 0)}${finder(18, 0)}${finder(0, 18)}</svg>`;
  }
  function panelSummary(p, pv) {
    const live = pv.services.filter((x) => x.status !== 'berhenti');
    const blocks = [];
    if (live.some((x) => x.svc === 'hosting')) {
      blocks.push(`<section class="card p-5 sm:p-6" aria-labelledby="up-title"><h2 id="up-title" class="font-extrabold">${esc(t('proj.uploadTitle'))}</h2>
        <p class="mt-1 text-lead-ink">${esc(t('proj.uploadBody'))}</p>
        <button type="button" class="btn btn--ghost mt-4" data-upload>${icon('folder', 'icon size-5')}${esc(t('proj.uploadBtn'))}</button></section>`);
    }
    if (live.some((x) => x.tpl === 'wa-bot')) {
      blocks.push(`<section class="card p-5 sm:p-6" aria-labelledby="qr-title"><h2 id="qr-title" class="font-extrabold">${esc(t('proj.qrTitle'))}</h2>
        <div class="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center"><div class="w-fit rounded-card border border-line p-3">${qrSvg()}</div>
        <div><p class="text-lead-ink">${esc(t('proj.qrBody'))}</p><button type="button" class="btn btn--ghost mt-4" data-wa-test>${icon('message-circle', 'icon size-5')}${esc(t('proj.qrTest'))}</button></div></div></section>`);
    }
    blocks.push(`<section class="card p-5 sm:p-6"><h2 class="font-extrabold">${esc(t('tab.services'))}</h2>
      <ul class="mt-3 grid grid-cols-1 gap-2">${pv.services.map((sv) => `<li class="flex items-center gap-3"><span class="grid size-9 shrink-0 place-items-center rounded-control bg-paper text-xl-blue">${icon(D.ICONS[sv.svc], 'icon size-5')}</span><span class="min-w-0 flex-1 font-bold">${esc(serviceName(sv))}</span>${statusPill(sv.status)}</li>`).join('')}</ul>
      <p class="mt-4 text-[.92rem] text-lead-ink">${esc(t('proj.aiMonth', { rp: rp(aiMonth(p.id)) }))}</p></section>`);
    return `<div class="grid grid-cols-1 gap-4">${blocks.join('')}</div>`;
  }
  function serviceStatusLine(sv) {
    if (sv.status === 'menyalakan') return t('proj.starting');
    if (sv.status === 'dijeda') return t('proj.pausedSince', { date: dateStr(sv.pausedAt), until: dateStr(S.addDays(sv.pausedAt, D.RULES.pauseDays)) });
    if (sv.status === 'berhenti') return sv.deleteAt && sv.deleteAt > S.state.clock ? t('st.stoppedUntil', { date: dateStr(sv.deleteAt) }) : sv.svc === 'domain' ? t('st.stopped') : t('st.deleted');
    if (sv.svc === 'domain' && !sv.autoRenew) return t('proj.activeUntil', { date: dateStr(sv.renewAt, { year: true }) });
    return t('proj.renewsOn', { date: dateStr(sv.renewAt, { year: sv.svc === 'domain' }) });
  }
  function panelServices(p, pv) {
    return `<ul class="grid grid-cols-1 gap-3">${pv.services.map((sv) => {
      const price = S.priceOf(sv, { renewal: sv.svc === 'domain' });
      const acts = [];
      if (sv.status === 'nyala' && SIZED.includes(sv.svc)) acts.push(`<button type="button" class="btn btn--ghost min-h-11 px-4 text-[.92rem]" data-resize="${sv.id}">${icon('arrow-up-down', 'icon size-4')}${esc(t('act.resize'))}</button>`);
      if ((sv.status === 'nyala' || sv.status === 'dijeda') && sv.svc !== 'domain') acts.push(`<button type="button" class="btn btn--ghost min-h-11 px-4 text-[.92rem]" data-stop="${sv.id}">${icon('power', 'icon size-4')}${esc(t('act.stop'))}</button>`);
      if (sv.svc === 'domain' && sv.status === 'nyala') acts.push(sv.autoRenew ? `<button type="button" class="btn btn--ghost min-h-11 px-4 text-[.92rem]" data-stop="${sv.id}">${icon('power', 'icon size-4')}${esc(t('act.stopDomainBtn'))}</button>`
        : `<button type="button" class="btn btn--ghost min-h-11 px-4 text-[.92rem]" data-resume="${sv.id}">${icon('refresh-cw', 'icon size-4')}${esc(t('act.renewOn'))}</button>`);
      if (sv.status === 'berhenti' && sv.svc !== 'domain') acts.push(`<button type="button" class="btn min-h-11 px-4 text-[.92rem]" data-resume="${sv.id}">${icon('power', 'icon size-4')}${esc(t('act.resume'))}</button>`);
      if (sv.status === 'dijeda') acts.push(`<button type="button" class="btn min-h-11 px-4 text-[.92rem]" data-topup data-amount="${Math.max(price - S.state.balance, D.TOPUP_MIN)}">${esc(t('cta.topup'))}</button>`);
      return `<li class="card p-4 sm:p-5 ${sv.status === 'berhenti' ? 'bg-paper' : ''}">
        <div class="flex items-start gap-3"><span class="grid size-10 shrink-0 place-items-center rounded-control bg-paper text-xl-blue">${icon(D.ICONS[sv.svc], 'icon size-5')}</span>
          <div class="min-w-0 flex-1"><h2 class="leading-snug font-extrabold">${esc(serviceName(sv))}</h2>
            <p class="text-[.88rem] text-lead-ink"><span class="num font-bold">${esc(rp(price))}</span> ${esc(sv.svc === 'domain' ? t('label.perYear') : t('label.per30'))} · ${esc(serviceStatusLine(sv))}</p></div>${statusPill(sv.status)}</div>
        ${acts.length ? `<div class="mt-3 flex flex-wrap gap-2">${acts.join('')}</div>` : ''}</li>`;
    }).join('')}</ul>`;
  }
  function panelAi(p) {
    const masked = p.key.slice(0, 8) + '••••••••' + p.key.slice(-4);
    return `<section class="card p-5 sm:p-6" aria-labelledby="key-title"><h2 id="key-title" class="font-extrabold">${esc(t('proj.keyTitle'))}</h2>
        <div class="mt-3 flex flex-col items-start gap-2 rounded-control bg-paper p-3 sm:flex-row sm:items-center"><code class="min-w-0 flex-1 font-mono [overflow-wrap:anywhere] ${p.keyActive ? '' : 'text-muted line-through'}">${esc(masked)}</code>
          <button type="button" class="btn btn--ghost min-h-11 shrink-0 px-4" data-copy="${esc(p.key)}" aria-label="${esc(t('copy.key'))}">${icon('copy', 'icon size-4')}<span data-copy-label>${esc(t('copy.label'))}</span></button></div>
        <div class="mt-4 flex items-center justify-between gap-4"><span id="key-active" class="font-bold">${esc(t('proj.keyActive'))}</span>
          <button type="button" role="switch" aria-checked="${p.keyActive}" aria-labelledby="key-active" class="-my-1.5 shrink-0 rounded-full py-1.5" data-key-toggle><span class="switch" aria-hidden="true"><i></i></span></button></div>
        <label for="p-limit" class="mt-4 block font-bold">${esc(t('wiz.limit'))}</label>
        <select id="p-limit" class="field mt-2" data-p-limit>${LIMITS.map((v) => `<option value="${v}" ${v === p.limit ? 'selected' : ''}>${esc(limitName(v))}</option>`).join('')}</select>
        <p class="mt-2 text-[.88rem] text-muted">${esc(t('proj.limitHint'))}</p>
        <p class="mt-4 font-bold">${esc(t('proj.aiMonth', { rp: rp(aiMonth(p.id)) }))}</p>
        <a href="#/ai" class="mt-3 inline-flex min-h-11 items-center gap-1 font-bold text-xl-blue underline decoration-xl-yellow decoration-2 underline-offset-4">${esc(t('proj.toAi'))}${icon('arrow-right', 'icon size-4')}</a></section>`;
  }
  function logText(e) {
    const prm = e.params || {};
    const service = prm.svc ? serviceName({ svc: prm.svc, tpl: prm.tpl, domain: prm.domain }, { size: false }) : '';
    const sizeName = (x) => (!x ? '' : prm.svc === 'email' ? t(`email.name.${x}`) : prm.svc === 'storage' ? D.STORAGE[x].capacity : t(`size.${x}`));
    return t(e.key, { ...prm, service, from: sizeName(prm.from), to: sizeName(prm.to), rp: rp(prm.rp || 0), limit: limitName(prm.limit), n: prm.files });
  }
  function panelLog(p) {
    const items = (p.log || []).slice().reverse();
    return items.length ? `<ol class="border-t-2 border-xl-dark">${items.map((e) => `<li class="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-3 border-b border-line py-3"><span class="font-mono text-[.82rem] text-muted">${esc(dateStr(e.date))}</span><span class="font-bold">${esc(logText(e))}</span></li>`).join('')}</ol>`
      : `<p class="rounded-card border border-dashed border-line px-5 py-6 text-lead-ink">${esc(t('proj.logEmpty'))}</p>`;
  }
  function panelSettings(p, pv) {
    const live = pv.services.some((x) => x.status !== 'berhenti' && !(x.svc === 'domain' && !x.autoRenew));
    return `<section class="card p-5 sm:p-6"><h2 class="font-extrabold">${esc(t('proj.address'))}</h2>
        <p class="mt-2 inline-flex items-center gap-1.5 font-mono text-xl-blue">${icon('lock', 'icon size-4 text-teal-ink')}${esc(pv.url)}</p>
        ${p.domain ? '' : `<a href="#/layanan/domain" class="mt-3 flex min-h-11 items-center gap-1 font-bold text-xl-blue underline decoration-xl-yellow decoration-2 underline-offset-4">${esc(t('proj.addDomain'))}${icon('arrow-right', 'icon size-4')}</a>`}</section>
      ${live ? `<section class="mt-4 rounded-card border-2 border-red-200 bg-white p-5 sm:p-6"><h2 class="font-extrabold">${esc(t('proj.dangerTitle'))}</h2>
        <p class="mt-1 text-lead-ink">${esc(t('proj.dangerBody'))}</p>
        <button type="button" class="btn mt-4 [--bg:#b91c1c] [--sweep:#7f1d1d]" data-stop-project>${icon('power', 'icon size-5')}${esc(t('act.stopProject'))}</button></section>` : ''}`;
  }

  /* ---- detail interactions ---- */
  function mountDetail(r) {
    const id = decodeURIComponent(r.parts[1]);
    const p = S.state.projects.find((x) => x.id === id);
    if (!p) return;
    const tabs = view.querySelector('[data-tabs]');
    const setTab = (x, focus = true) => {
      location.replace(`#/proyek/${encodeURIComponent(id)}?tab=${x}`);
      if (focus) setTimeout(() => view.querySelector(`#tab-${x}`)?.focus(), 0);
    };
    tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) setTab(b.dataset.tab); });
    tabs.addEventListener('keydown', (e) => {
      const i = TABS.indexOf(tabOf(r));
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TABS.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      setTab(TABS[(next + TABS.length) % TABS.length]);
    });
    const done = (msg) => { C.render({ focus: false }); toast(msg); };
    view.querySelector('[data-upload]')?.addEventListener('click', () => { S.logUpload(id, 12); toast(t('proj.uploaded', { n: 12, url: S.projectView(p).url })); });
    view.querySelector('[data-wa-test]')?.addEventListener('click', () => { S.useAi({ project: id, unit: 'pesan', qty: 1 }); S.save(); done(t('proj.qrSent', { rp: rp(D.UNITS.pesan.cost) })); });
    view.querySelector('[data-detail-root]').addEventListener('click', (e) => { // inner root: replaced on every render, so no listener pile-up
      const rs = e.target.closest('[data-resize]');
      if (rs) return openResize(rs.dataset.resize, rs);
      const st = e.target.closest('[data-stop]');
      if (st) {
        const sv = S.state.services.find((x) => x.id === st.dataset.stop);
        const pre = S.stopPreview(sv.id);
        const name = serviceName(sv);
        if (sv.svc === 'domain') {
          return confirmAsk({ title: t('act.stopDomainBtn'), body: t('act.stopDomain', { domain: sv.domain, date: dateStr(sv.renewAt, { year: true }) }), ok: t('act.stopDomainBtn'), opener: st,
            action: () => { S.stopService(sv.id); done(t('log.renewOff', { domain: sv.domain })); } });
        }
        return confirmAsk({ title: t('act.stop'), body: t(sv.status === 'dijeda' ? 'act.stopPaused' : 'act.stopConfirm', { service: name, rp: rp(pre.refund), n: pre.days }), ok: t('act.stop'), opener: st,
          action: () => { const refund = S.stopService(sv.id); done(t('act.stopDone', { service: name, rp: rp(refund) })); } });
      }
      const re = e.target.closest('[data-resume]');
      if (re) {
        const sv = S.state.services.find((x) => x.id === re.dataset.resume);
        const res = S.resume(sv.id);
        if (!res.ok) { toast(t('act.needTopup', { rp: rp(res.need) })); return C.openTopup({ amount: res.need, opener: re }); }
        return done(sv.svc === 'domain' ? t('log.renewOn', { domain: sv.domain }) : t('act.resumeDone', { service: serviceName(sv) }));
      }
      if (e.target.closest('[data-stop-project]')) {
        const refund = S.stopProjectPreview(id);
        confirmAsk({ title: t('act.stopProject'), body: t('act.stopProjectConfirm', { project: p.name, rp: rp(refund) }), ok: t('act.stopProject'), opener: e.target.closest('[data-stop-project]'),
          action: () => { const got = S.stopProject(id); done(t('act.stopProjectDone', { project: p.name, rp: rp(got) })); } });
      }
      if (e.target.closest('[data-key-toggle]')) { S.setKeyActive(id, !p.keyActive); C.render({ focus: false }); view.querySelector('[data-key-toggle]')?.focus(); }
    });
    view.querySelector('[data-p-limit]')?.addEventListener('change', (e) => { S.setLimit(id, Number(e.target.value)); toast(t('proj.limitSaved', { limit: limitName(Number(e.target.value)) })); });
  }

  /* ---- resize dialog ---- */
  const rzDlg = document.getElementById('resize');
  const rzModal = TN.ui.setupModal(rzDlg, { focus: '#rz-title', onClose: () => C.render({ focus: false }) });
  const rz = { id: null, size: null };
  function renderResize() {
    const sv = S.state.services.find((x) => x.id === rz.id);
    const it = { ...sv, size: rz.size };
    rzDlg.querySelector('[data-rz-title]').textContent = t('act.resizeTitle', { service: serviceName(sv, { size: false }) });
    const others = S.state.services.filter((x) => x.project === sv.project && x.status === 'nyala').map((x) => ({ ...x, on: true }));
    rzDlg.querySelector('[data-rz-sizes]').innerHTML = TN.ui.segmented(it, 'rz', others.concat(S.state.history.some((h) => h.project === sv.project && h.type === 'usage' && h.meta.unit !== 'sesi') ? [{ svc: 'ai', unit: 'tugas', qty: 1, on: true }] : []));
    const { diff, days } = S.resizePreview(sv.id, rz.size);
    const sizeName = sv.svc === 'email' ? t(`email.name.${rz.size}`) : sv.svc === 'storage' ? D.STORAGE[rz.size].capacity : t(`size.${rz.size}`);
    const same = rz.size === sv.size;
    rzDlg.querySelector('[data-rz-preview]').textContent = same ? t('act.resizeSame') : diff >= 0 ? t('act.resizeUp', { size: sizeName, rp: rp(diff), n: days }) : t('act.resizeDown', { size: sizeName, rp: rp(-diff) });
    const go = rzDlg.querySelector('[data-rz-go]');
    go.textContent = t('act.resizeGo', { size: sizeName });
    go.disabled = same;
  }
  function openResize(id, opener) {
    rz.id = id; rz.size = S.state.services.find((x) => x.id === id).size;
    renderResize();
    rzModal.open(opener);
  }
  rzDlg.addEventListener('click', (e) => {
    if (e.target.closest('[data-rz-close]')) return rzModal.close();
    const o = e.target.closest('[role=radio]');
    if (o && o.getAttribute('aria-disabled') !== 'true') { rz.size = o.dataset.size; renderResize(); rzDlg.querySelector(`[data-size="${rz.size}"]`)?.focus(); }
    if (e.target.closest('[data-rz-go]')) {
      const sv = S.state.services.find((x) => x.id === rz.id);
      const res = S.resize(rz.id, rz.size);
      if (!res.ok) { rzModal.close({ returnFocus: false }); toast(t('act.needTopup', { rp: rp(res.need) })); return C.openTopup({ amount: res.need }); }
      rzModal.close({ returnFocus: false });
      C.render({ focus: false });
      const newSize = sv.svc === 'email' ? t(`email.name.${sv.size}`) : sv.svc === 'storage' ? D.STORAGE[sv.size].capacity : t(`size.${sv.size}`);
      toast(t('act.resizeDone', { service: serviceName(sv, { size: false }), size: newSize }));
    }
  });
  rzDlg.addEventListener('keydown', (e) => { const target = TN.ui.radioKeys(e); if (target) { rz.size = target.dataset.size; renderResize(); rzDlg.querySelector(`[data-size="${rz.size}"]`)?.focus(); } });

  I.onChange(() => { if (rzDlg.open) renderResize(); });
})();
