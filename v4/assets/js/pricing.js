/* TokenNyala v4 — pricing page (harga.html): bundle calculator + every service price. Every number from TN.data.
   Markup uses the hand-written classes of site.css + harga.css (showcase v2 way); copy comes from the TN.i18n dictionary.
   URL schema (services-and-pricing §6): harga.html?paket=portofolio&s=hosting:coba,domain:my.id,ai:10#kalkulator
   (legacy ?resep= is still read) */
(() => {
  'use strict';
  const D = TN.data;
  const I = TN.i18n;
  const { t, rp, rpK, num } = I;
  const { icon, esc, itemView, fromLine } = TN.ui;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- State ---------- */
  const params = new URLSearchParams(location.search);
  const paketParam = params.get('paket') ?? params.get('resep'); // ?resep= = legacy name
  const startRecipe = () => {
    const r = paketParam;
    if (r === null) return 'portofolio';
    return D.recipe(r) && !D.recipe(r).aiOnly ? r : '';
  };
  const state = { recipe: startRecipe(), items: [], open: false, bumped: [] };
  state.items = D.recipe(paketParam)?.aiOnly && !params.get('s')
    ? [{ ...D.NEW_ITEM['ai:sesi'], on: true }]
    : D.itemsFromUrl(state.recipe, params.get('s'));

  const rowsRoot = $('[data-calc-rows]');
  const tabsRoot = $('[data-calc-recipes]');
  const live = $('[data-calc-live]');
  const announce = (msg) => { if (live) { live.textContent = ''; requestAnimationFrame(() => { live.textContent = msg; }); } };
  const UNIT_STEP = (unit) => D.UNITS[unit].step;
  /** 'Rp34 rb' → <small>≈ Rp</small>34 rb (textContent stays '≈ Rp34 rb') */
  const bigK = (n) => `<small>≈ Rp</small>${esc(rpK(n).slice(2))}`;

  /* ---------- Links ---------- */
  function query() {
    const s = D.serialize(state.items);
    return [state.recipe ? `paket=${state.recipe}` : '', s ? `s=${s}` : ''].filter(Boolean).join('&');
  }
  const wizardHref = () => `app.html#/buat${query() ? '?' + query() : ''}`;
  function syncUrl() {
    try { history.replaceState(null, '', `${location.pathname}${query() ? '?' + query() : ''}${location.hash}`); } catch { /* file:// in some browsers */ }
  }

  /* ---------- Bundle picker (radiogroup, same control as the landing's "Mau bikin apa?") ---------- */
  const RECIPE_TABS = [...D.RECIPES.filter((r) => !r.aiOnly).map((r) => r.id), ''];
  function renderRecipes() {
    if (!tabsRoot) return;
    tabsRoot.innerHTML = '<span class="intent__marker" aria-hidden="true"></span>' + RECIPE_TABS.map((id) => {
      const on = id === state.recipe;
      const label = id ? t(`recipe.short.${id}`) : t('calc.recipeBlank');
      const hint = id ? `≈ ${rpK(D.recipeTotals(D.recipe(id).items).perMonth)}${t('label.perMonth')}` : t('calc.recipeBlankHint');
      return `<button type="button" class="intent__tab" role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}" data-recipe="${id}">
        <span class="intent__label">${esc(label)}</span><span class="intent__hint mono">${esc(hint)}</span></button>`;
    }).join('');
    tabsRoot.style.setProperty('--i', RECIPE_TABS.indexOf(state.recipe));
  }
  function pickRecipe(id, { focus = false } = {}) {
    state.recipe = id;
    state.items = D.itemsFromUrl(state.recipe, null);
    $$('[role=radio]', tabsRoot).forEach((b) => {
      const on = b.dataset.recipe === id;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    tabsRoot.style.setProperty('--i', RECIPE_TABS.indexOf(id));
    update();
  }
  tabsRoot?.addEventListener('click', (e) => { const b = e.target.closest('[data-recipe]'); if (b) pickRecipe(b.dataset.recipe); });
  tabsRoot?.addEventListener('keydown', (e) => {
    const i = RECIPE_TABS.indexOf(state.recipe);
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: RECIPE_TABS.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    pickRecipe(RECIPE_TABS[(next + RECIPE_TABS.length) % RECIPE_TABS.length], { focus: true });
  });

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
    if (it.svc === 'nat') { const x = D.SERVER_NAT[it.size]; return [`${t(`det.nat.${it.size}`)} · ${x.cpu} vCPU · ${x.ram} RAM · ${x.disk} · ${t('det.natPorts', { n: D.NAT_PORTS })}`]; }
    if (it.svc === 'database') return [`${D.DATABASE[it.size].capacity} · ${t(`det.database.${it.size}`)}`];
    if (it.svc === 'storage') return [t(`det.storage.${it.size}`)];
    if (it.svc === 'email') { const e = D.EMAIL[it.size]; return [t(`email.quota.${e.per}`, { n: num(e.quota) })]; }
    return [];
  }

  function controls(it, fid) {
    if (D.OPTIONS[it.svc] && it.svc !== 'domain') {
      return segmented(it, fid) + hint(it).map((h) => `<p class="calc-row__hint">${esc(h)}</p>`).join('');
    }
    if (it.svc === 'domain') {
      return `<label for="${fid}-ext" class="sr-only">${esc(t('calc.domain'))}</label>
        <select id="${fid}-ext" class="calc-select" data-ext data-fid="${fid}-ext">${D.OPTIONS.domain.map((x) => `<option value="${x}" ${x === it.ext ? 'selected' : ''}>${esc(t('calc.domainOpt', { ext: x, rp: rp(D.DOMAINS[x].first) }))}</option>`).join('')}</select>`;
    }
    if (it.svc === 'ai') {
      const unit = t(`unit.name.${it.unit}`);
      return `<div class="stepper">
        <button type="button" class="stepper__btn" aria-label="${esc(t('calc.less', { unit }))}" data-step="-1" data-fid="${fid}-less">${icon('minus')}</button>
        <p class="stepper__val"><span class="num" aria-live="polite">${num(it.qty)}</span><span>${esc(unit)}</span></p>
        <button type="button" class="stepper__btn" aria-label="${esc(t('calc.more', { unit }))}" data-step="1" data-fid="${fid}-more">${icon('plus')}</button>
      </div><p class="calc-row__hint">±${esc(rp(D.itemCost(it).amount))} · ${esc(t('label.estimate'))}</p>`;
    }
    if (it.svc === 'payments') return `<p class="calc-row__hint">${esc(t('calc.payments', { pct: num(D.PAYMENTS.feePct) }))}</p>`;
    return '';
  }

  function renderRows() {
    if (!rowsRoot) return;
    const focusId = document.activeElement?.dataset?.fid;
    $('[data-calc-empty]').classList.toggle('hidden', state.items.length > 0);
    rowsRoot.innerHTML = state.items.map((it) => {
      const key = D.itemKey(it);
      const fid = 'r-' + key.replace(/[:.]/g, '-');
      const v = itemView(it);
      const on = it.on !== false;
      return `<li class="calc-row${on ? '' : ' is-off'}" data-key="${key}">
        <div class="calc-row__head">
          <span class="calc-row__icon" aria-hidden="true">${icon(v.icon)}</span>
          <div class="calc-row__name"><h3 id="${fid}-name">${esc(v.name)}</h3>
            <p>${esc(on ? v.detail : t('calc.offNote'))}</p></div>
          <button type="button" class="toggle" role="switch" aria-checked="${on}" aria-labelledby="${fid}-name" data-toggle data-fid="${fid}-sw"><span></span></button>
        </div>
        ${on ? `<div class="calc-row__body">${controls(it, fid)}</div>` : ''}
      </li>`;
    }).join('');
    if (focusId) rowsRoot.querySelector(`[data-fid="${focusId}"]`)?.focus();
  }

  /* ---------- Summary ---------- */
  function renderSummary() {
    const tot = D.recipeTotals(state.items);
    const hasAny = state.items.some((i) => i.on !== false);
    const row = (label, value, cls = '') => `<div class="${cls}"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
    const payments = state.items.some((i) => i.svc === 'payments' && i.on !== false);
    $('[data-calc-details]').innerHTML = `
      <p class="calc-sum__big">${bigK(tot.perMonth)}<em>${esc(t('label.perMonth'))}</em></p>
      <dl class="calc-sum__lines">
        ${row(t('cost.fixed'), rp(tot.fixed) + t('calc.perMo'))}
        ${row(t('cost.usage'), '±' + rp(tot.usage) + t('calc.perMo'))}
        ${tot.yearly ? row(t('cost.yearly'), rp(tot.yearly)) : ''}
        ${row(t('calc.monthly'), rp(tot.perMonth), 'is-total')}
        ${tot.firstMonth > tot.perMonth ? row(t('calc.first'), rp(tot.firstMonth)) : ''}
      </dl>
      ${hasAny ? `<p class="calc-sum__suggest">${esc(t(tot.months === 1 ? 'recipe.suggest.one' : 'recipe.suggest.many', { rp: rp(tot.suggest.amount), n: tot.months }))}</p>
        <p class="calc-sum__note">${esc(t('recipe.suggestNote', { rp: rp(tot.suggest.amount + tot.suggest.bonus) }))}</p>` : ''}
      ${payments ? `<p class="calc-sum__note">${esc(t('calc.payFee', { pct: num(D.PAYMENTS.feePct) }))}</p>` : ''}`;
    $('[data-calc-total]').textContent = `≈ ${rpK(tot.perMonth)}`;
    const href = wizardHref();
    $('[data-calc-cta]').href = href;
    $$('[data-start]').forEach((a) => { a.href = href; });
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

  $('[data-calc-reset]')?.addEventListener('click', () => {
    state.items = D.itemsFromUrl(state.recipe, null);
    update();
  });

  /* Phones: "Rincian" expands the breakdown above the bar */
  const toggle = $('[data-calc-toggle]');
  toggle?.addEventListener('click', () => {
    state.open = !state.open;
    toggle.setAttribute('aria-expanded', String(state.open));
    $('[data-calc-details]').toggleAttribute('data-open', state.open);
    document.documentElement.toggleAttribute('data-calc-open', state.open);
  });

  /* ---------- Add a service (dialog) ---------- */
  const addDlg = document.getElementById('add-svc');
  const addModal = addDlg && TN.ui.setupModal(addDlg, { focus: '#add-title' });
  const ADDABLE = ['ai:sesi', 'ai:pesan', 'ai:tugas', 'hosting', ...Object.keys(D.TEMPLATES).map((x) => `apps:${x}`), 'server', 'nat', 'database', 'storage', 'domain', 'email', 'payments'];
  function renderAdd() {
    if (!addDlg) return;
    addDlg.querySelector('[data-add-list]').innerHTML = `<ul class="add-list__items">${ADDABLE.map((key) => {
      const it = D.NEW_ITEM[key];
      const v = itemView(it);
      const have = findItem(key);
      const label = !have ? t('calc.addBtn') : have.on === false ? t('calc.addOn') : t('calc.exists');
      return `<li class="add-item">
        <span class="add-item__icon" aria-hidden="true">${icon(v.icon)}</span>
        <span class="add-item__text"><b>${esc(v.name)}</b><small>${esc(v.detail)}</small></span>
        <button type="button" class="btn btn--sm btn--outline-dark" data-add="${key}" ${have && have.on !== false ? 'disabled' : ''} aria-label="${esc(label + ': ' + v.name)}">${esc(label)}</button>
      </li>`;
    }).join('')}</ul>`;
  }
  $('[data-calc-add]')?.addEventListener('click', (e) => { renderAdd(); addModal.open(e.currentTarget); });
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

  /* ---------- Every service: index rows (4 groups), details open per service ---------- */
  const table = (heads, rows) => `<div class="ptable-wrap" data-allow-bleed><table class="ptable">
    <thead><tr>${heads.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const tech = (inner) => `<details class="ptech"><summary>${icon('chevron-right')}<span>${esc(t('det.tech'))}</span></summary><div class="ptech__body">${inner}</div></details>`;
  const note = (s) => `<p class="prow__note">${esc(s)}</p>`;
  const sub = (s) => `<small>${esc(s)}</small>`;

  function serviceBody(id) {
    const per30 = (n) => `${esc(rp(n))}${sub(t('label.per30'))}`;
    const toAi = (key) => `<a class="link-arrow" href="#ai">${esc(t(key, { n: D.MODELS.length }))} →</a>`;
    const bodies = {
      ai: () => `<p>${esc(t('ai.note'))}</p>${toAi('from.aiLink')}`,
      chat: () => `<p>${esc(t('det.chatNote'))}</p>${toAi('from.aiLink')}`,
      hosting: () => table([t('det.size'), t('det.for'), t('det.price')], D.SIZE_ORDER.map((s) => [esc(t(`size.${s}`)), esc(t(`calc.for.${s}`, { n: num(D.SIZES[s].visitors) })), per30(D.SIZES[s].price)]))
        + tech(table([t('det.size'), t('det.cpu'), t('det.ram'), t('det.disk')], D.SIZE_ORDER.map((s) => [esc(t(`size.${s}`)), D.SIZES[s].cpu, D.SIZES[s].ram, D.SIZES[s].disk])) + `<p>${esc(t('det.hostingIncl'))}</p><p>${esc(t('calc.managed'))}</p>`),
      apps: () => table([t('det.tpl'), t('det.min'), t('det.default')], Object.keys(D.TEMPLATES).map((x) => [esc(t(`tpl.${x}.name`)) + `<small class="mono">${esc(t(`tpl.${x}.tech`))}</small>`, esc(t(`size.${D.templateMin(x)}`)), esc('≈ ' + rp(D.templateCost(x)))]))
        + note(t('det.appsNote')),
      server: () => table([t('det.size'), t('det.for'), t('det.price')], Object.keys(D.SERVER).map((s) => [esc(t(`size.${s}`)), esc(t(`det.server.${s}`)), per30(D.SERVER[s].price)]))
        + tech(table([t('det.size'), t('det.cpu'), t('det.ram'), t('det.disk'), t('det.traffic')], Object.entries(D.SERVER).map(([s, x]) => [esc(t(`size.${s}`)), x.cpu, x.ram, x.disk, x.traffic])) + `<p>${esc(t('det.serverNote'))}</p>`),
      nat: () => table([t('det.size'), t('det.for'), t('det.price')], Object.keys(D.SERVER_NAT).map((s) => [esc(t(`size.${s}`)), esc(t(`det.nat.${s}`)), per30(D.SERVER_NAT[s].price)]))
        + tech(table([t('det.size'), t('det.cpu'), t('det.ram'), t('det.disk'), t('det.ports')], Object.entries(D.SERVER_NAT).map(([s, x]) => [esc(t(`size.${s}`)), x.cpu, x.ram, x.disk, D.NAT_PORTS])) + `<p>${esc(t('det.natNote', { n: D.NAT_PORTS }))}</p>`),
      database: () => table([t('det.size'), t('det.for'), t('det.price')], Object.entries(D.DATABASE).map(([s, x]) => [`${esc(t(`size.${s}`))}${sub(x.capacity)}`, esc(t(`det.database.${s}`)), per30(x.price)]))
        + note(t('det.databaseNote')),
      storage: () => table([t('det.capacity'), t('det.for'), t('det.price')], Object.entries(D.STORAGE).map(([s, x]) => [x.capacity, esc(t(`det.storage.${s}`)), per30(x.price)]))
        + note(t('det.storageNote')),
      domain: () => table([t('det.ext'), t('det.first'), t('det.renew')], Object.entries(D.DOMAINS).map(([x, d]) => [`.${x}${I.dict[`det.domain.${x}`] ? sub(t(`det.domain.${x}`)) : ''}`, esc(rp(d.first)), esc(rp(d.renew))]))
        + note(t('det.domainNote')),
      email: () => table([t('det.size'), t('det.quota'), t('det.price')], D.OPTIONS.email.map((s) => [s, D.EMAIL[s]]).map(([s, e]) => [esc(t(`email.name.${s}`)), esc(t(`email.quota.${e.per}`, { n: num(e.quota) })), e.price ? per30(e.price) : esc(rp(0))]))
        + note(t('det.emailNote')),
      payments: () => `<ul class="prow__checks">${[
        t('det.pay1', { pct: num(D.PAYMENTS.feePct) }), t('det.pay2', { n: D.PAYMENTS.settleDays, rp: rp(D.PAYMENTS.withdraw) }), t('det.pay3'),
      ].map((x) => `<li>${icon('check')}<span>${esc(x)}</span></li>`).join('')}</ul>`,
    };
    return bodies[id]();
  }

  function renderIndex() {
    const root = $('[data-price-index]');
    if (!root) return;
    const open = new Set($$('details.prow[open]', root).map((d) => d.dataset.svc));
    root.innerHTML = D.GROUPS.map((g, gi) => `
      <section class="pgroup" aria-labelledby="pg-${g.id}">
        <h3 class="svc-group__head" id="pg-${g.id}"><span>0${gi + 1}</span> ${esc(t(`svc.group.${g.id}`))}</h3>
        <ul role="list">${g.services.map((id) => {
          const [main, subLine] = fromLine(id);
          return `<li><details class="prow" id="detail-${id}" data-svc="${id}" ${open.has(id) ? 'open' : ''}>
            <summary>
              <span class="prow__icon" aria-hidden="true">${icon(D.ICONS[id])}</span>
              <span class="prow__name"><b>${esc(t(`svc.${id}.name`))}</b><span class="mono">${esc(t(`svc.${id}.tech`))}</span></span>
              <span class="prow__price">${esc(main)}${subLine ? sub(subLine) : ''}</span>
              <span class="prow__plus" aria-hidden="true"></span>
            </summary>
            <div class="prow__body"><p class="prow__desc">${esc(t(`svc.${id}.desc`))}</p>${serviceBody(id)}</div>
          </details></li>`;
        }).join('')}</ul>
      </section>`).join('');
    openFromHash();
  }
  /** harga.html#detail-hosting opens that row */
  function openFromHash() {
    const el = location.hash.startsWith('#detail-') && document.getElementById(location.hash.slice(1));
    if (el && el.tagName === 'DETAILS') el.open = true;
  }
  window.addEventListener('hashchange', openFromHash);

  /* ---------- AI: 12 models + estimate units ---------- */
  const TIER_BADGE = { hemat: 'badge--teal', seimbang: 'badge--sky', premium: 'badge--yellow' };
  const KIND_ICON = { image: 'image', audio: 'mic', video: 'video' };
  /** What a model reads besides text: icons + text for screen readers ("teks saja" when none) */
  const reads = (m) => (m.reads.length ? `<span class="reads">${m.reads.map((k) => icon(KIND_ICON[k])).join('')}<span class="sr-only">${esc([t('chatp.text'), ...m.reads.map((k) => t(`chatp.kind.${k}`))].join(', '))}</span></span>` : `<span class="reads reads--none">${esc(t('chatp.textOnly'))}</span>`);
  function renderAi() {
    const root = $('[data-ai-detail]');
    if (!root) return;
    const badge = (m) => `<span class="badge ${TIER_BADGE[m.tier]}">${esc(t(`tier.${m.tier}`))}</span>`;
    const models = `<div class="ptable-wrap" data-allow-bleed><table class="ptable ptable--models">
      <thead><tr><th scope="col">${esc(t('aip.model'))}</th><th scope="col" class="ptable__level">${esc(t('aip.level'))}</th><th scope="col" class="ptable__reads">${esc(t('aip.reads'))}</th><th scope="col">${esc(t('aip.per10k', { rp: rp(10000) }))}</th></tr></thead>
      <tbody>${D.MODELS.map((m) => `<tr>
        <td><span class="model-cell"><span class="model-cell__logo" aria-hidden="true"><img src="assets/img/models/${D.PROVIDER_ICON[m.provider]}.svg" alt="" width="18" height="18" loading="lazy"></span><span><b>${esc(m.name)}</b><span class="model-cell__badge">${badge(m)} ${reads(m)}</span></span></span></td>
        <td class="ptable__level">${badge(m)}</td>
        <td class="ptable__reads">${reads(m)}</td>
        <td>≈ ${m.per10k}</td></tr>`).join('')}</tbody></table></div>`;
    const rates = table([t('aip.model'), t('rate.input'), t('rate.output')], D.MODELS.map((m) => [esc(m.name), num(m.in), num(m.out)]));
    root.innerHTML = `
      <div class="aip__models">${models}
        <details class="ptech ptech--light"><summary>${icon('chevron-right')}<span>${esc(t('aip.rates'))}</span></summary><div class="ptech__body">${rates}</div></details>
        <p class="aip__note">${esc(t('aip.readsNote', { img: num(D.ATTACH.image.tokens), aud: num(D.ATTACH.audio.perSec), vid: num(D.ATTACH.video.perSec) }))}</p>
        <p class="aip__note">${esc(t('ai.note'))}</p></div>
      <div class="aip__side">
        <h3 class="aip__units-title">${esc(t('aip.unitsTitle'))}</h3>
        <ul class="units">${['sesi', 'pesan', 'tugas'].map((u) => `<li class="unit">
          <p class="unit__top"><b>${esc(t(`unit.name.${u}`))}</b><strong>${esc(rp(D.UNITS[u].cost))}</strong></p>
          <p class="unit__ex">${esc(t(`aip.${u}.ex`))}</p></li>`).join('')}</ul>
        <div class="aip__chat">${icon(D.ICONS.chat)}<div><p><b>${esc(t('svc.chat.name'))}</b></p><p>${esc(t('det.chatNote'))}</p></div></div>
        <a href="app.html#/ai?isi=1" class="btn btn--yellow btn--lg magnetic" data-cursor="API">${esc(t('recipe.aiOnlyCta'))} <span class="btn__icon" aria-hidden="true">→</span></a>
      </div>`;
  }

  /* ---------- Balance & billing ---------- */
  function renderBalance() {
    const root = $('[data-balance]');
    if (!root) return;
    const rules = [
      ['calendar-clock', t('rule.fixed')], ['at-sign', t('rule.yearly')], ['sparkles', t('rule.usage')],
      ['bell', t('rule.renew', { n: D.RULES.remindDays })], ['circle-pause', t('rule.pause', { n: D.RULES.pauseDays })],
      ['clock', t('rule.stopAuto', { n: D.RULES.pauseDays })], ['power', t('rule.stop', { rp: rp(D.refund(D.SIZES.coba.price, 20)) })],
      ['arrow-up-down', t('rule.resize')], ['lock', t('rule.domain')], ['shield-check', t('rule.ai')],
    ];
    root.innerHTML = `
      <div class="topup">
        <h3 class="bal__sub">${esc(t('bal.topupTitle'))}</h3>
        <div class="topup__paper">${table([t('bal.amount'), t('bal.bonus'), t('bal.credit')], D.TOPUPS.map((p) => [esc(rp(p.amount)), `+${esc(rp(p.bonus))}`, esc(rp(p.amount + p.bonus))]))}
          <p class="topup__free">${esc(t('bal.free', { rp: rp(D.TOPUP_MIN) }))}</p></div>
      </div>
      <div class="rules">
        <h3 class="bal__sub">${esc(t('bal.rulesTitle'))}</h3>
        <ol class="rules__list">${rules.map(([ic, html], i) => `<li><span class="rules__n mono" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${icon(ic)}<span>${html}</span></li>`).join('')}</ol>
        <p class="rules__note">${esc(t('price.example'))}</p>
      </div>`;
  }

  /* ---------- Pricing FAQ (5) ---------- */
  function renderFaq() {
    const root = $('[data-pfaq]');
    if (!root) return;
    const open = new Set($$('details[open]', root).map((d) => d.dataset.q));
    const vars = { n: D.RULES.pauseDays, rp: rp(D.PAYMENTS.withdraw) };
    root.innerHTML = [1, 2, 3, 4, 5].map((n) => `<details class="faq-item" data-q="${n}" ${open.has(String(n)) ? 'open' : ''}>
      <summary><span class="faq-item__n" aria-hidden="true">${String(n).padStart(2, '0')}</span><span>${esc(t(`pfaq.q${n}`))}</span><span class="faq-item__plus" aria-hidden="true"></span></summary>
      <p class="faq-item__a">${esc(t(`pfaq.a${n}`, vars))}</p></details>`).join('');
  }

  /* ---------- Section nav: current section ---------- */
  const SECTIONS = ['kalkulator', 'layanan', 'ai', 'saldo', 'faq-harga'];
  const navLinks = $$('[data-pnav] a');
  const navList = $('[data-pnav]');
  const io = 'IntersectionObserver' in window && new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => {
        const on = a.getAttribute('href') === `#${en.target.id}`;
        if (on) { a.setAttribute('aria-current', 'true'); navList.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' }); }
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  if (io) SECTIONS.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });

  /* Phones: lift the Nala launcher above the sticky summary bar while the calculator is on screen */
  const calc = document.getElementById('kalkulator');
  const bar = document.getElementById('calc-summary');
  if ('IntersectionObserver' in window && calc && bar) {
    new IntersectionObserver(([en]) => {
      document.documentElement.toggleAttribute('data-calc-bar', en.isIntersecting);
      document.documentElement.style.setProperty('--calc-bar-h', `${bar.offsetHeight}px`);
    }).observe(calc);
  }

  function render() {
    renderRecipes();
    renderRows();
    renderSummary();
    renderIndex();
    renderAi();
    renderBalance();
    renderFaq();
    document.dispatchEvent(new CustomEvent('tn:render'));
  }
  I.onChange(render);
  I.init();
  syncUrl();
  window.TN.pricing = { get state() { return state; }, update, pickRecipe };
})();
