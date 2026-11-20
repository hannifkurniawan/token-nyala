/* TokenNyala v4 — pricing page (harga.html): recipe calculator + service details. Every number from TN.data.
   URL schema (services-and-pricing §6): harga.html?resep=portofolio&s=hosting:coba,domain:my.id,ai:10#kalkulator */
(() => {
  'use strict';
  const D = TN.data;
  const I = TN.i18n;
  const { t, rp, rpK, num } = I;
  const { icon, esc, itemView, fromLine } = TN.ui;

  /* ---------- State ---------- */
  const params = new URLSearchParams(location.search);
  const startRecipe = () => {
    const r = params.get('resep');
    if (r === null) return 'portofolio';
    return D.recipe(r) && !D.recipe(r).aiOnly ? r : '';
  };
  const state = { recipe: startRecipe(), items: [], open: false, bumped: [] };
  state.items = D.recipe(params.get('resep'))?.aiOnly && !params.get('s')
    ? [{ ...D.NEW_ITEM['ai:sesi'], on: true }]
    : D.itemsFromUrl(state.recipe, params.get('s'));

  const rowsRoot = document.querySelector('[data-calc-rows]');
  const live = document.querySelector('[data-calc-live]');
  const announce = (msg) => { if (live) { live.textContent = ''; requestAnimationFrame(() => { live.textContent = msg; }); } };
  const UNIT_STEP = (unit) => D.UNITS[unit].step;

  /* ---------- Links ---------- */
  function query() {
    const s = D.serialize(state.items);
    return [state.recipe ? `resep=${state.recipe}` : '', s ? `s=${s}` : ''].filter(Boolean).join('&');
  }
  const wizardHref = () => `app.html#/buat${query() ? '?' + query() : ''}`;
  function syncUrl() {
    try { history.replaceState(null, '', `${location.pathname}${query() ? '?' + query() : ''}${location.hash}`); } catch { /* file:// in some browsers */ }
  }

  /* ---------- Calculator rows ---------- */
  const segmented = (it, fid) => TN.ui.segmented(it, fid, state.items);

  function hint(it) {
    if (it.svc === 'hosting' || it.svc === 'apps') {
      const lines = [t(`calc.for.${it.size}`, { n: num(D.SIZES[it.size].visitors) })];
      const min = it.svc === 'apps' ? D.templateMinSize(it.tpl, D.usesAi(state.items)) : 'coba';
      if (min !== 'coba') lines.push(t('size.disabled', { template: t(`tpl.${it.tpl}.name`), size: t(`size.${min}`) }));
      if (state.bumped.includes(it.tpl)) lines.push(t('calc.bumped', { template: t(`tpl.${it.tpl}.name`), size: t(`size.${it.size}`) }));
      return lines;
    }
    if (it.svc === 'server') { const x = D.SERVER[it.size]; return [`${x.cpu} vCPU · ${x.ram} RAM · ${x.disk} · ${t('det.traffic')} ${x.traffic}`]; }
    if (it.svc === 'database') return [`${D.DATABASE[it.size].capacity} · ${t(`det.database.${it.size}`)}`];
    if (it.svc === 'storage') return [t(`det.storage.${it.size}`)];
    if (it.svc === 'email') { const e = D.EMAIL[it.size]; return [t(`email.quota.${e.per}`, { n: num(e.quota) })]; }
    return [];
  }

  function controls(it, fid) {
    if (D.OPTIONS[it.svc] && it.svc !== 'domain') {
      return segmented(it, fid) + hint(it).map((h) => `<p class="mt-2 text-[.88rem] text-lead-ink">${esc(h)}</p>`).join('');
    }
    if (it.svc === 'domain') {
      return `<label for="${fid}-ext" class="sr-only">${esc(t('calc.domain'))}</label>
        <select id="${fid}-ext" class="field" data-ext data-fid="${fid}-ext">${D.OPTIONS.domain.map((x) => `<option value="${x}" ${x === it.ext ? 'selected' : ''}>${esc(t('calc.domainOpt', { ext: x, rp: rp(D.DOMAINS[x].first) }))}</option>`).join('')}</select>`;
    }
    if (it.svc === 'ai') {
      const unit = t(`unit.name.${it.unit}`);
      return `<div class="flex items-center gap-3">
        <button type="button" class="grid size-11 shrink-0 place-items-center rounded-control border-2 border-line hover:border-xl-blue" aria-label="${esc(t('calc.less', { unit }))}" data-step="-1" data-fid="${fid}-less">${icon('minus', 'icon size-5')}</button>
        <p class="min-w-0 flex-1 text-center"><span class="num block text-xl font-extrabold" aria-live="polite">${num(it.qty)}</span><span class="text-[.85rem] text-muted">${esc(unit)}</span></p>
        <button type="button" class="grid size-11 shrink-0 place-items-center rounded-control border-2 border-line hover:border-xl-blue" aria-label="${esc(t('calc.more', { unit }))}" data-step="1" data-fid="${fid}-more">${icon('plus', 'icon size-5')}</button>
      </div><p class="mt-2 text-[.88rem] text-lead-ink">±${esc(rp(D.itemCost(it).amount))} · ${esc(t('label.estimate'))}</p>`;
    }
    if (it.svc === 'payments') return `<p class="text-[.92rem] text-lead-ink">${esc(t('calc.payments', { pct: num(D.PAYMENTS.feePct) }))}</p>`;
    return '';
  }

  function renderRows() {
    if (!rowsRoot) return;
    const focusId = document.activeElement?.dataset?.fid;
    document.querySelector('[data-calc-empty]').classList.toggle('hidden', state.items.length > 0);
    rowsRoot.innerHTML = state.items.map((it) => {
      const key = D.itemKey(it);
      const fid = 'r-' + key.replace(/[:.]/g, '-');
      const v = itemView(it);
      const on = it.on !== false;
      return `<li class="card p-4 sm:p-5 ${on ? '' : 'bg-paper'}" data-key="${key}">
        <div class="flex items-start gap-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-control ${on ? 'bg-xl-blue text-white' : 'bg-white text-muted ring-1 ring-line'}">${icon(v.icon, 'icon size-5')}</span>
          <div class="min-w-0 flex-1"><h3 id="${fid}-name" class="leading-snug font-extrabold">${esc(v.name)}</h3>
            <p class="text-[.88rem] ${on ? 'text-lead-ink' : 'text-muted'}">${esc(on ? v.detail : t('calc.offNote'))}</p></div>
          <button type="button" role="switch" aria-checked="${on}" aria-labelledby="${fid}-name" data-toggle data-fid="${fid}-sw"
            class="relative -my-1.5 shrink-0 rounded-full py-1.5"><span class="switch" aria-hidden="true"><i></i></span></button>
        </div>
        ${on ? `<div class="mt-4">${controls(it, fid)}</div>` : ''}
      </li>`;
    }).join('');
    if (focusId) rowsRoot.querySelector(`[data-fid="${focusId}"]`)?.focus();
  }

  /* ---------- Summary ---------- */
  function renderSummary() {
    const tot = D.recipeTotals(state.items);
    const hasAny = state.items.some((i) => i.on !== false);
    const row = (label, value, strong = false) => `<div class="flex items-baseline justify-between gap-4 ${strong ? 'text-[1.05rem] font-extrabold' : ''}"><dt class="${strong ? '' : 'text-muted'}">${esc(label)}</dt><dd class="num whitespace-nowrap ${strong ? '' : 'font-bold'}">${esc(value)}</dd></div>`;
    const payments = state.items.some((i) => i.svc === 'payments' && i.on !== false);
    document.querySelector('[data-calc-details]').innerHTML = `
      <p class="hidden leading-none lg:mb-5 lg:flex lg:flex-wrap lg:items-baseline lg:gap-x-2"><span class="num text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold">≈ ${esc(rpK(tot.perMonth))}</span><span class="font-bold text-muted">${esc(t('label.perMonth'))}</span></p>
      <dl class="grid grid-cols-1 gap-2 text-[.95rem]">
        ${row(t('cost.fixed'), rp(tot.fixed) + t('calc.perMo'))}
        ${row(t('cost.usage'), '±' + rp(tot.usage) + t('calc.perMo'))}
        ${tot.yearly ? row(t('cost.yearly'), rp(tot.yearly)) : ''}
        <div class="my-1 border-t border-line"></div>
        ${row(t('calc.monthly'), rp(tot.perMonth), true)}
        ${tot.firstMonth > tot.perMonth ? row(t('calc.first'), rp(tot.firstMonth)) : ''}
      </dl>
      ${hasAny ? `<p class="mt-4 inline-flex rounded-2xl bg-xl-yellow px-4 py-2 font-bold">${esc(t(tot.months === 1 ? 'recipe.suggest.one' : 'recipe.suggest.many', { rp: rp(tot.suggest.amount), n: tot.months }))}</p>
        <p class="mt-1.5 text-[.85rem] text-muted">${esc(t('recipe.suggestNote', { rp: rp(tot.suggest.amount + tot.suggest.bonus) }))}</p>` : ''}
      ${payments ? `<p class="mt-3 text-[.85rem] text-lead-ink">${esc(t('calc.payFee', { pct: num(D.PAYMENTS.feePct) }))}</p>` : ''}`;
    document.querySelector('[data-calc-total]').textContent = `≈ ${rpK(tot.perMonth)}`;
    const href = wizardHref();
    document.querySelector('[data-calc-cta]').href = href;
    document.querySelectorAll('[data-start]').forEach((a) => { a.href = href; });
  }

  function renderSelect() {
    const sel = document.getElementById('calc-recipe');
    if (!sel) return;
    sel.innerHTML = D.RECIPES.filter((r) => !r.aiOnly).map((r) => `<option value="${r.id}">${esc(t(`recipe.name.${r.id}`))} — ≈ ${esc(rpK(D.recipeTotals(r.items).perMonth))}${esc(t('label.perMonth'))}</option>`).join('')
      + `<option value="">${esc(t('calc.recipeEmpty'))}</option>`;
    sel.value = state.recipe;
  }

  function update({ msg, keepBumped = false } = {}) {
    const res = D.applyMinimums(state.items);
    state.items = res.items;
    state.bumped = keepBumped ? state.bumped : res.bumped;
    renderRows();
    renderSummary();
    syncUrl();
    const total = t('calc.live', { rp: rpK(D.recipeTotals(state.items).perMonth) });
    const bumpMsg = res.bumped.map((tpl) => t('calc.bumped', { template: t(`tpl.${tpl}.name`), size: t(`size.${state.items.find((i) => i.tpl === tpl).size}`) })).join(' ');
    announce([msg, bumpMsg, total].filter(Boolean).join(' '));
  }

  const findItem = (key) => state.items.find((i) => D.itemKey(i) === key);

  rowsRoot?.addEventListener('click', (e) => {
    const li = e.target.closest('[data-key]');
    if (!li) return;
    const it = findItem(li.dataset.key);
    if (e.target.closest('[data-toggle]')) { it.on = it.on === false; return update(); }
    const opt = e.target.closest('[role=radio]');
    if (opt) { if (opt.getAttribute('aria-disabled') === 'true') return; it.size = opt.dataset.size; return update(); }
    const step = e.target.closest('[data-step]');
    if (step) { it.qty = Math.min(D.AI_MAX, Math.max(0, it.qty + Number(step.dataset.step) * UNIT_STEP(it.unit))); return update(); }
  });
  rowsRoot?.addEventListener('change', (e) => {
    if (!e.target.matches('[data-ext]')) return;
    findItem(e.target.closest('[data-key]').dataset.key).ext = e.target.value;
    update();
  });
  rowsRoot?.addEventListener('keydown', (e) => { // radiogroup: arrows move + select, skipping disabled sizes
    const target = TN.ui.radioKeys(e);
    if (!target) return;
    findItem(e.target.closest('[data-key]').dataset.key).size = target.dataset.size;
    update(); // focus id kept for the re-render
  });

  document.getElementById('calc-recipe')?.addEventListener('change', (e) => {
    state.recipe = e.target.value;
    state.items = D.itemsFromUrl(state.recipe, null);
    update();
  });
  document.querySelector('[data-calc-reset]')?.addEventListener('click', () => {
    state.items = D.itemsFromUrl(state.recipe, null);
    update();
  });

  /* Mobile summary: "Rincian" expands the breakdown above the bar */
  const toggle = document.querySelector('[data-calc-toggle]');
  toggle?.addEventListener('click', () => {
    state.open = !state.open;
    toggle.setAttribute('aria-expanded', String(state.open));
    document.querySelector('[data-calc-details]').toggleAttribute('data-open', state.open);
    document.querySelector('[data-calc-chevron]').classList.toggle('rotate-180', state.open);
    document.documentElement.toggleAttribute('data-calc-open', state.open);
  });

  /* ---------- Add a service (dialog) ---------- */
  const addDlg = document.getElementById('add-svc');
  const addModal = addDlg && TN.ui.setupModal(addDlg, { focus: '#add-title' });
  const ADDABLE = ['ai:sesi', 'ai:pesan', 'ai:tugas', 'hosting', ...Object.keys(D.TEMPLATES).map((x) => `apps:${x}`), 'server', 'database', 'storage', 'domain', 'email', 'payments'];
  function renderAdd() {
    if (!addDlg) return;
    addDlg.querySelector('[data-add-list]').innerHTML = `<ul class="grid grid-cols-1 gap-2">${ADDABLE.map((key) => {
      const it = D.NEW_ITEM[key];
      const v = itemView(it);
      const have = findItem(key);
      const label = !have ? t('calc.addBtn') : have.on === false ? t('calc.addOn') : t('calc.exists');
      return `<li class="flex items-center gap-3 rounded-control border border-line p-3">
        <span class="grid size-10 shrink-0 place-items-center rounded-control bg-paper text-xl-blue">${icon(v.icon, 'icon size-5')}</span>
        <span class="min-w-0 flex-1"><span class="block leading-snug font-bold">${esc(v.name)}</span><span class="block text-[.85rem] text-muted">${esc(v.detail)}</span></span>
        <button type="button" class="btn btn--ghost min-h-11 shrink-0 px-4 text-[.9rem] disabled:cursor-not-allowed disabled:opacity-50" data-add="${key}" ${have && have.on !== false ? 'disabled' : ''} aria-label="${esc(label + ': ' + v.name)}">${esc(label)}</button>
      </li>`;
    }).join('')}</ul>`;
  }
  document.querySelector('[data-calc-add]')?.addEventListener('click', (e) => { renderAdd(); addModal.open(e.currentTarget); });
  addDlg?.querySelector('[data-add-close]').addEventListener('click', () => addModal.close());
  addDlg?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-add]');
    if (!b || b.disabled) return;
    const key = b.dataset.add;
    const have = findItem(key);
    if (have) have.on = true; else state.items.push({ ...D.NEW_ITEM[key], on: true });
    addModal.close({ returnFocus: false });
    const name = itemView(findItem(key)).name;
    update({ msg: t('calc.added', { name }) });
    const sw = rowsRoot.querySelector(`[data-key="${key}"] [data-toggle]`);
    sw?.focus();
    sw?.closest('li')?.scrollIntoView({ block: 'center' });
  });

  /* ---------- Starting-from cards ---------- */
  function renderFrom() {
    const root = document.querySelector('[data-from]');
    if (!root) return;
    const anchor = { ai: 'ai', chat: 'ai', hosting: 'detail-hosting', apps: 'detail-apps', server: 'detail-server', database: 'detail-database', storage: 'detail-storage', domain: 'detail-domain', email: 'detail-email', payments: 'detail-payments' };
    root.innerHTML = D.GROUPS.flatMap((g) => g.services).map((id) => {
      const [main, sub] = fromLine(id);
      return `<li><a href="#${anchor[id]}" class="card flex h-full flex-col gap-3 p-4 hover:border-xl-blue">
        <span class="grid size-10 place-items-center rounded-control bg-paper text-xl-blue">${icon(D.ICONS[id], 'icon size-5')}</span>
        <span class="leading-snug font-extrabold">${esc(t(`svc.${id}.name`))}</span>
        <span class="mt-auto text-[.92rem] font-bold text-xl-blue">${esc(main)}${sub ? `<span class="block font-medium text-muted">${esc(sub)}</span>` : ''}</span></a></li>`;
    }).join('');
  }

  /* ---------- Detail tables ---------- */
  const th = (s, right = false) => `<th scope="col" class="border-b-2 border-current pb-2 font-mono text-[.72rem] font-medium tracking-[.08em] uppercase ${right ? 'text-right' : ''}">${esc(s)}</th>`;
  const table = (heads, rows) => `<div class="overflow-x-auto"><table class="w-full border-collapse text-left text-[.9rem] sm:text-[.95rem]">
    <thead><tr>${heads.map((h, i) => th(h, i === heads.length - 1)).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td class="border-b border-current/15 py-3 pr-2 align-top sm:pr-3 ${i === r.length - 1 ? 'num pr-0 text-right font-bold whitespace-nowrap' : ''} ${i === 0 ? 'font-bold' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const details = (inner) => `<details class="group/d mt-4"><summary class="flex min-h-11 cursor-pointer list-none items-center gap-1.5 font-bold text-xl-blue [&::-webkit-details-marker]:hidden">${icon('chevron-right', 'icon size-4 transition-transform group-open/d:rotate-90')}<span>${esc(t('det.tech'))}</span></summary><div class="mt-2 grid grid-cols-1 gap-3 rounded-control bg-paper p-4 text-[.92rem] text-lead-ink">${inner}</div></details>`;
  const note = (s) => `<p class="mt-4 text-[.92rem] text-lead-ink">${esc(s)}</p>`;

  function serviceBlock(id, body) {
    return `<article id="detail-${id}" class="grid grid-cols-1 gap-6 border-t-2 border-xl-dark pt-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12" aria-labelledby="detail-${id}-title">
      <div><span class="grid size-12 place-items-center rounded-control bg-xl-blue text-white">${icon(D.ICONS[id])}</span>
        <h3 id="detail-${id}-title" class="mt-4 text-[clamp(1.5rem,3vw,2rem)] leading-tight font-extrabold tracking-[-.03em]">${esc(t(`svc.${id}.name`))}</h3>
        <p class="mt-1 font-mono text-[.78rem] text-muted">${esc(t(`svc.${id}.tech`))}</p>
        <p class="mt-3 text-lead-ink">${esc(t(`svc.${id}.desc`))}</p></div>
      <div class="min-w-0">${body}</div></article>`;
  }

  function renderDetails() {
    const per30 = (n) => `${esc(rp(n))}<span class="block text-[.8rem] font-medium text-muted">${esc(t('label.per30'))}</span>`;
    const blocks = {
      hosting: () => table([t('det.size'), t('det.for'), t('det.price')], D.SIZE_ORDER.map((s) => [esc(t(`size.${s}`)), esc(t(`calc.for.${s}`, { n: num(D.SIZES[s].visitors) })), per30(D.SIZES[s].price)]))
        + details(table([t('det.size'), t('det.cpu'), t('det.ram'), t('det.disk')], D.SIZE_ORDER.map((s) => [esc(t(`size.${s}`)), D.SIZES[s].cpu, D.SIZES[s].ram, D.SIZES[s].disk])) + `<p>${esc(t('det.hostingIncl'))}</p><p>${esc(t('calc.managed'))}</p>`),
      apps: () => table([t('det.tpl'), t('det.min'), t('det.default')], Object.keys(D.TEMPLATES).map((x) => [esc(t(`tpl.${x}.name`)) + `<span class="block font-mono text-[.75rem] font-medium text-muted">${esc(t(`tpl.${x}.tech`))}</span>`, esc(t(`size.${D.templateMin(x)}`)), esc('≈ ' + rp(D.templateCost(x)))]))
        + note(t('det.appsNote')),
      server: () => table([t('det.size'), t('det.for'), t('det.price')], Object.keys(D.SERVER).map((s) => [esc(t(`size.${s}`)), esc(t(`det.server.${s}`)), per30(D.SERVER[s].price)]))
        + details(table([t('det.size'), t('det.cpu'), t('det.ram'), t('det.disk'), t('det.traffic')], Object.entries(D.SERVER).map(([s, x]) => [esc(t(`size.${s}`)), x.cpu, x.ram, x.disk, x.traffic])) + `<p>${esc(t('det.serverNote'))}</p>`),
      database: () => table([t('det.size'), t('det.for'), t('det.price')], Object.entries(D.DATABASE).map(([s, x]) => [`${esc(t(`size.${s}`))}<span class="block font-medium text-muted">${x.capacity}</span>`, esc(t(`det.database.${s}`)), per30(x.price)]))
        + note(t('det.databaseNote')),
      storage: () => table([t('det.capacity'), t('det.for'), t('det.price')], Object.entries(D.STORAGE).map(([s, x]) => [x.capacity, esc(t(`det.storage.${s}`)), per30(x.price)]))
        + note(t('det.storageNote')),
      domain: () => table([t('det.ext'), t('det.first'), t('det.renew')], Object.entries(D.DOMAINS).map(([x, d]) => [`.${x}${I.dict[`det.domain.${x}`] ? `<span class="block text-[.85rem] font-medium text-muted">${esc(t(`det.domain.${x}`))}</span>` : ''}`, `<span class="num">${esc(rp(d.first))}</span>`, esc(rp(d.renew))]))
        + note(t('det.domainNote')),
      email: () => table([t('det.size'), t('det.quota'), t('det.price')], D.OPTIONS.email.map((s) => [s, D.EMAIL[s]]).map(([s, e]) => [esc(t(`email.name.${s}`)), esc(t(`email.quota.${e.per}`, { n: num(e.quota) })), e.price ? per30(e.price) : esc(rp(0))]))
        + note(t('det.emailNote')),
      payments: () => `<ul class="grid grid-cols-1 gap-3">${[
        t('det.pay1', { pct: num(D.PAYMENTS.feePct) }), t('det.pay2', { n: D.PAYMENTS.settleDays, rp: rp(D.PAYMENTS.withdraw) }), t('det.pay3'),
      ].map((x) => `<li class="flex gap-3">${icon('check', 'icon mt-0.5 size-5 shrink-0 text-teal-ink')}<span>${esc(x)}</span></li>`).join('')}</ul>`,
    };
    document.querySelectorAll('[data-detail-group]').forEach((root) => {
      const g = D.GROUPS.find((x) => x.id === root.dataset.detailGroup);
      root.innerHTML = g.services.map((id) => serviceBlock(id, blocks[id]())).join('');
    });
  }

  /* ---------- AI: 12 models + estimate units ---------- */
  const TIER_STYLE = { hemat: 'bg-xl-teal text-xl-dark', seimbang: 'bg-xl-sky text-xl-dark', premium: 'bg-xl-yellow text-xl-dark' };
  function renderAi() {
    const root = document.querySelector('[data-ai-detail]');
    if (!root) return;
    const badge = (m, cls = '') => `<span class="inline-block rounded-full px-2.5 py-1 font-mono text-[.72rem] font-medium ${TIER_STYLE[m.tier]} ${cls}">${esc(t(`tier.${m.tier}`))}</span>`;
    // Level column from sm:, below that the badge sits under the model name (fits 320px)
    const modelTable = `<div class="overflow-x-auto"><table class="w-full border-collapse text-left text-[.95rem]">
      <thead><tr>${th(t('aip.model'))}<th scope="col" class="hidden border-b-2 border-current pb-2 font-mono text-[.72rem] font-medium tracking-[.08em] uppercase sm:table-cell">${esc(t('aip.level'))}</th>${th(t('aip.per10k', { rp: rp(10000) }), true)}</tr></thead>
      <tbody>${D.MODELS.map((m) => `<tr>
        <td class="border-b border-current/15 py-3 pr-3 align-top font-bold"><span class="flex items-center gap-2.5"><span class="grid size-8 shrink-0 place-items-center rounded-full bg-white" aria-hidden="true"><img src="assets/img/models/${D.PROVIDER_ICON[m.provider]}.svg" alt="" width="18" height="18" class="size-[18px]" loading="lazy"></span><span>${esc(m.name)}${badge(m, 'mt-1 block w-fit sm:hidden')}</span></span></td>
        <td class="hidden border-b border-current/15 py-3 pr-3 align-top sm:table-cell">${badge(m)}</td>
        <td class="num border-b border-current/15 py-3 text-right align-top font-bold whitespace-nowrap">≈ ${m.per10k}</td></tr>`).join('')}</tbody></table></div>`;
    const rates = table([t('aip.model'), t('rate.input'), t('rate.output')], D.MODELS.map((m) => [esc(m.name), num(m.in), num(m.out)]));
    root.innerHTML = `
      <div id="detail-ai" class="min-w-0">${modelTable}
        <details class="group/d mt-4"><summary class="flex min-h-11 cursor-pointer list-none items-center gap-1.5 font-bold text-xl-yellow [&::-webkit-details-marker]:hidden">${icon('chevron-right', 'icon size-4 transition-transform group-open/d:rotate-90')}<span>${esc(t('aip.rates'))}</span></summary>
          <div class="mt-2 rounded-control bg-white/10 p-4">${rates}</div></details>
        <p class="mt-4 text-[.88rem] text-white/70">${esc(t('ai.note'))}</p></div>
      <div class="min-w-0">
        <h3 class="text-2xl font-extrabold tracking-tight">${esc(t('aip.unitsTitle'))}</h3>
        <ul class="mt-5 grid grid-cols-1 gap-3">${['sesi', 'pesan', 'tugas'].map((u) => `<li class="rounded-card bg-white p-5 text-xl-dark">
          <div class="flex items-baseline justify-between gap-3"><p class="font-extrabold">${esc(t(`unit.name.${u}`))}</p><p class="num text-xl font-extrabold whitespace-nowrap">${esc(rp(D.UNITS[u].cost))}</p></div>
          <p class="mt-1 text-[.92rem] text-lead-ink">${esc(t(`aip.${u}.ex`))}</p></li>`).join('')}</ul>
        <div id="detail-chat" class="mt-6 flex gap-3 rounded-card border border-white/20 p-5">${icon(D.ICONS.chat, 'icon mt-0.5 shrink-0 text-xl-yellow')}<div><p class="font-extrabold">${esc(t('svc.chat.name'))}</p><p class="mt-1 text-white/80">${esc(t('det.chatNote'))}</p></div></div>
        <a href="app.html#/ai?isi=1" class="btn btn--yellow mt-6 w-full sm:w-auto">${esc(t('recipe.aiOnlyCta'))}${icon('arrow-right', 'icon icon-go size-5')}</a>
      </div>`;
  }

  /* ---------- Balance & billing ---------- */
  function renderBalance() {
    const root = document.querySelector('[data-balance]');
    if (!root) return;
    const rules = [
      ['calendar-clock', t('rule.fixed')], ['at-sign', t('rule.yearly')], ['sparkles', t('rule.usage')],
      ['bell', t('rule.renew', { n: D.RULES.remindDays })], ['circle-pause', t('rule.pause', { n: D.RULES.pauseDays })],
      ['clock', t('rule.stopAuto', { n: D.RULES.pauseDays })], ['power', t('rule.stop', { rp: rp(D.refund(D.SIZES.coba.price, 20)) })],
      ['arrow-up-down', t('rule.resize')], ['lock', t('rule.domain')], ['shield-check', t('rule.ai')],
    ];
    root.innerHTML = `
      <div class="min-w-0"><h3 class="text-2xl font-extrabold tracking-tight">${esc(t('bal.topupTitle'))}</h3>
        <div class="mt-4 rounded-card bg-white p-4 sm:p-5">${table([t('bal.amount'), t('bal.bonus'), t('bal.credit')], D.TOPUPS.map((p) => [esc(rp(p.amount)), `+${esc(rp(p.bonus))}`, esc(rp(p.amount + p.bonus))]))}
          <p class="mt-4 text-[.92rem] text-lead-ink">${esc(t('bal.free', { rp: rp(D.TOPUP_MIN) }))}</p></div></div>
      <div class="min-w-0"><h3 class="text-2xl font-extrabold tracking-tight">${esc(t('bal.rulesTitle'))}</h3>
        <ul class="mt-4 grid grid-cols-1 gap-2">${rules.map(([ic, html]) => `<li class="flex gap-3 rounded-control bg-white/70 px-4 py-3">${icon(ic, 'icon mt-0.5 size-5 shrink-0 text-xl-blue')}<span>${html}</span></li>`).join('')}</ul>
        <p class="mt-4 text-[.88rem] text-lead-ink">${esc(t('price.example'))}</p></div>`;
  }

  /* ---------- Pricing FAQ (5) ---------- */
  function renderFaq() {
    const root = document.querySelector('[data-pfaq]');
    if (!root) return;
    const open = new Set([...root.querySelectorAll('details[open]')].map((d) => d.dataset.q));
    const vars = { n: D.RULES.pauseDays, rp: rp(D.PAYMENTS.withdraw) };
    root.innerHTML = [1, 2, 3, 4, 5].map((n) => `<details class="group/f border-b border-line" data-q="${n}" ${open.has(String(n)) ? 'open' : ''}>
      <summary class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[1.08rem] font-bold [&::-webkit-details-marker]:hidden">
        <span>${esc(t(`pfaq.q${n}`))}</span><span class="grid size-9 shrink-0 place-items-center rounded-full bg-white ring-1 ring-line">${icon('plus', 'icon size-5 transition-transform group-open/f:rotate-45')}</span></summary>
      <p class="max-w-[42em] pb-5 text-lead-ink">${esc(t(`pfaq.a${n}`, vars))}</p></details>`).join('');
  }

  /* ---------- Section nav: current section ---------- */
  const navLinks = [...document.querySelectorAll('[data-pnav] a')];
  const navList = document.querySelector('[data-pnav]');
  const io = 'IntersectionObserver' in window && new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = en.target.id === 'mulai-dari' ? 'kalkulator' : en.target.id === 'faq-harga' ? 'saldo' : en.target.id;
      navLinks.forEach((a) => {
        const on = a.getAttribute('href') === `#${id}`;
        if (on) { a.setAttribute('aria-current', 'true'); navList.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' }); }
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  if (io) ['kalkulator', 'mulai-dari', 'ai', 'jalankan', 'simpan', 'hubungkan', 'saldo', 'faq-harga'].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });

  /* Mobile: lift the Nala launcher above the sticky summary bar while the calculator is on screen */
  const calc = document.getElementById('kalkulator');
  const bar = document.getElementById('calc-summary');
  if ('IntersectionObserver' in window && calc && bar) {
    new IntersectionObserver(([en]) => {
      document.documentElement.toggleAttribute('data-calc-bar', en.isIntersecting);
      document.documentElement.style.setProperty('--calc-bar-h', `${bar.offsetHeight}px`);
    }).observe(calc);
  }

  function render() {
    renderSelect();
    renderRows();
    renderSummary();
    renderFrom();
    renderDetails();
    renderAi();
    renderBalance();
    renderFaq();
    document.dispatchEvent(new CustomEvent('tn:render'));
  }
  I.onChange(render);
  I.init();
  syncUrl();
  window.TN.pricing = { get state() { return state; }, update };
})();
