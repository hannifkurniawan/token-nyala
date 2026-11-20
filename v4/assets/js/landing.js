/* TokenNyala v4 — landing page rendering. Every number comes from TN.data (rule 9). */
(() => {
  'use strict';
  const D = TN.data;
  const I = TN.i18n;
  const { t, rp, rpK, num } = I;
  const { icon, esc } = TN.ui;

  const state = { recipe: D.RECIPES[0].id };

  /* ---------- Links into the console (information-architecture §5) ---------- */
  const startHref = (id) => (D.recipe(id).aiOnly ? 'app.html#/ai?isi=1' : `app.html#/buat?resep=${id}`);
  const calcHref = (id) => `harga.html?resep=${id}#kalkulator`;

  /* ---------- Hero, story, board ---------- */
  function renderHero() {
    const s = D.heroScenario();
    document.querySelectorAll('[data-trust-from]').forEach((el) => { el.textContent = t('hero.trust3', { rp: rpK(D.SIZES.coba.price) }); });
    document.querySelectorAll('[data-board-balance]').forEach((el) => { el.textContent = t('board.balance', { a: rp(s.balance), b: rp(s.left) }); });
    document.querySelectorAll('[data-domain]').forEach((el) => { el.textContent = D.HERO.domain; });
  }

  /* ---------- Recipe items → plain-language rows ---------- */
  function itemView(it) {
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
      default: return { icon: 'check', name: it.svc, detail: '' };
    }
  }

  /* ---------- Recipe chips (radiogroup, arrow keys; docs/v4/technical-spec.md §7) ---------- */
  const chipsRoot = document.querySelector('[data-recipe-chips]');
  const card = document.querySelector('[data-recipe-card]');
  const live = document.querySelector('[data-recipe-live]');

  function renderChips() {
    if (!chipsRoot) return;
    chipsRoot.innerHTML = D.RECIPES.map((r) => {
      const on = r.id === state.recipe;
      return `<button type="button" role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}" data-recipe="${r.id}" aria-controls="recipe-card"
        class="min-h-11 shrink-0 rounded-full border-[1.5px] border-white/45 px-4 font-bold whitespace-nowrap transition-colors hover:border-white aria-checked:border-xl-yellow aria-checked:bg-xl-yellow aria-checked:text-xl-dark">${esc(t(`recipe.short.${r.id}`))}</button>`;
    }).join('');
  }

  function costRow(label, value) {
    return `<div class="flex items-baseline justify-between gap-4"><dt class="text-muted">${esc(label)}</dt><dd class="num font-bold">${esc(value)}</dd></div>`;
  }

  function renderCard() {
    if (!card) return;
    const r = D.recipe(state.recipe);
    const name = t(`recipe.name.${r.id}`);
    const head = `
      <h3 id="recipe-name" class="text-[1.35rem] leading-tight font-extrabold tracking-tight">${esc(name)}</h3>
      <p class="mt-1.5 text-lead-ink">${esc(t(`recipe.desc.${r.id}`))}</p>`;

    if (r.aiOnly) {
      card.innerHTML = `
        <div class="p-5 sm:p-8">${head}
          <p class="mt-6 font-mono text-[.75rem] tracking-[.1em] text-muted uppercase">${esc(t('recipe.aiOnlyTitle'))}</p>
          <ul class="mt-3 grid grid-cols-1 gap-2">${D.AI_ONLY.map((row) => `
            <li class="flex items-center gap-3 rounded-control bg-paper px-4 py-3 font-bold">
              ${icon('sparkles', 'icon text-xl-blue')}<span>${esc(t('recipe.aiOnlyRow', { rp: rp(row.amount), range: row.range }))}</span></li>`).join('')}
          </ul>
          <a class="btn btn--lg mt-6 w-full sm:w-auto" href="${startHref(r.id)}">${esc(t('recipe.aiOnlyCta'))}${icon('arrow-right', 'icon icon-go size-5')}</a>
        </div>`;
      return;
    }

    const tot = D.recipeTotals(r.items);
    const suggestKey = tot.months === 1 ? 'recipe.suggest.one' : 'recipe.suggest.many';
    card.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-1">
        <div class="@container p-5 sm:p-8">${head}
          <p class="mt-7 font-mono text-[.75rem] tracking-[.1em] text-muted uppercase">${esc(t('recipe.approx'))}</p>
          <p class="mt-1 flex flex-wrap items-baseline gap-x-2 leading-none">
            <span class="num text-[clamp(2.75rem,15cqi,4.75rem)] font-extrabold whitespace-nowrap">≈ ${esc(rpK(tot.perMonth))}</span>
            <span class="text-lg font-bold text-muted">${esc(t('label.perMonth'))}</span></p>
          ${tot.firstMonth > tot.perMonth ? `<p class="mt-3 text-[.95rem] text-lead-ink">${esc(t('recipe.firstMonth', { rp: rp(tot.firstMonth) }))}</p>` : ''}
          <dl class="mt-6 grid grid-cols-1 gap-2 border-t border-line pt-4 text-[.95rem]" aria-label="${esc(t('recipe.costsAria'))}">
            ${costRow(t('cost.fixed'), rp(tot.fixed))}
            ${costRow(t('cost.usage'), '±' + rp(tot.usage))}
            ${tot.yearly ? costRow(t('cost.yearly'), rp(tot.yearly)) : ''}
          </dl>
        </div>
        <div class="border-t border-line bg-paper p-5 sm:p-8 md:border-t-0 md:border-l lg:border-t lg:border-l-0">
          <ul class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-6" aria-label="${esc(t('recipe.itemsAria'))}">${r.items.map((it) => {
            const v = itemView(it);
            return `<li class="flex gap-3">
              <span class="grid size-10 shrink-0 place-items-center rounded-control bg-white text-xl-blue ring-1 ring-line">${icon(v.icon, 'icon size-5')}</span>
              <span class="min-w-0"><span class="block font-bold leading-snug">${esc(v.name)}</span>
                <span class="block text-[.92rem] text-lead-ink">${esc(v.detail)}${v.estimate ? ` <span class="ml-1 rounded-full bg-xl-sky/25 px-2 py-0.5 font-mono text-[.7rem] text-xl-dark uppercase">${esc(t('label.estimate'))}</span>` : ''}</span></span>
            </li>`;
          }).join('')}</ul>
          <p class="mt-6 inline-flex rounded-2xl bg-xl-yellow px-4 py-2 font-bold">${esc(t(suggestKey, { rp: rp(tot.suggest.amount), n: tot.months }))}</p>
          <p class="mt-2 text-[.88rem] text-muted">${esc(t('recipe.suggestNote', { rp: rp(tot.suggest.amount + tot.suggest.bonus) }))}</p>
          <a class="btn btn--lg mt-6 w-full" href="${startHref(r.id)}">${esc(t('recipe.cta'))}${icon('arrow-right', 'icon icon-go size-5')}</a>
          <a class="mt-2 inline-flex min-h-11 items-center gap-1 font-bold text-xl-blue underline decoration-xl-yellow decoration-2 underline-offset-4" href="${calcHref(r.id)}">${esc(t('recipe.edit'))}${icon('arrow-up-right', 'icon size-4')}</a>
        </div>
      </div>`;
  }

  function announce() {
    if (!live) return;
    const r = D.recipe(state.recipe);
    const name = t(`recipe.name.${r.id}`);
    live.textContent = r.aiOnly ? name : t('recipe.announce', { name, rp: rpK(D.recipeTotals(r.items).perMonth) });
  }

  function syncStartLinks() {
    document.querySelectorAll('[data-start]').forEach((a) => { a.href = startHref(state.recipe); });
  }

  function selectRecipe(id, { focus = false } = {}) {
    state.recipe = id;
    chipsRoot?.querySelectorAll('[role=radio]').forEach((b) => {
      const on = b.dataset.recipe === id;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) { b.focus(); b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    });
    renderCard();
    announce();
    syncStartLinks();
  }

  chipsRoot?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-recipe]');
    if (b) selectRecipe(b.dataset.recipe);
  });
  chipsRoot?.addEventListener('keydown', (e) => {
    const ids = D.RECIPES.map((r) => r.id);
    const i = ids.indexOf(state.recipe);
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: ids.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    selectRecipe(ids[(next + ids.length) % ids.length], { focus: true });
  });

  /* ---------- All services ---------- */
  function fromLine(id) {
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

  function renderServices() {
    const root = document.querySelector('[data-services]');
    if (!root) return;
    root.innerHTML = D.GROUPS.map((g) => `
      <section class="grid grid-cols-1 gap-4 border-t-2 border-xl-dark pt-5 lg:grid-cols-4 lg:gap-6" aria-labelledby="svc-g-${g.id}">
        <h3 id="svc-g-${g.id}" class="font-mono text-[.82rem] tracking-[.1em] text-xl-dark uppercase">${esc(t(`svc.group.${g.id}`))}</h3>
        <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">${g.services.map((id) => {
          const [main, sub] = fromLine(id);
          return `<li class="card flex gap-4 p-4 sm:flex-col sm:gap-3 sm:p-5" id="svc-${id}">
            <span class="grid size-11 shrink-0 place-items-center rounded-control bg-paper text-xl-blue">${icon(D.ICONS[id])}</span>
            <div class="flex min-w-0 flex-1 flex-col gap-2 sm:gap-3">
              <div><h4 class="text-[1.12rem] leading-snug font-extrabold tracking-tight">${esc(t(`svc.${id}.name`))}</h4>
                <p class="mt-0.5 font-mono text-[.75rem] text-muted">${esc(t(`svc.${id}.tech`))}</p></div>
              <p class="text-[.95rem] text-lead-ink">${esc(t(`svc.${id}.desc`))}</p>
              <p class="mt-auto font-bold sm:border-t sm:border-line sm:pt-3">${esc(main)}${sub ? `<span class="block text-[.88rem] font-medium text-muted">${esc(sub)}</span>` : ''}</p>
            </div>
          </li>`;
        }).join('')}</ul>
      </section>`).join('');
  }

  /* ---------- One balance: example wallet (services-and-pricing §7) ---------- */
  function renderWallet() {
    const root = document.querySelector('[data-wallet]');
    if (!root) return;
    const s = D.heroScenario();
    const label = { hosting: t('wallet.line.hosting'), domain: t('wallet.line.domain') };
    root.innerHTML = `
      <p class="font-mono text-[.75rem] tracking-[.1em] text-muted uppercase">${esc(t('wallet.card'))}</p>
      <p class="mt-1 font-bold">${esc(t('wallet.in', { rp: rp(D.HERO.topup.amount), bonus: rp(D.HERO.topup.bonus) }))}</p>
      <div class="mt-5 flex items-end justify-between gap-4">
        <span class="text-muted">${esc(t('wallet.balance'))}</span>
        <span class="num text-[clamp(2.25rem,6vw,3.25rem)] leading-none font-extrabold">${esc(rp(s.balance))}</span></div>
      <div class="meter mt-4" style="--v:${(s.left / s.balance).toFixed(3)}" aria-hidden="true"><i></i></div>
      <ul class="mt-5 grid grid-cols-1 gap-3">${s.lines.map((l) => `
        <li class="flex items-center gap-3">
          <span class="grid size-9 shrink-0 place-items-center rounded-control bg-paper text-xl-blue">${icon(D.ICONS[l.svc], 'icon size-5')}</span>
          <span class="min-w-0 flex-1">${esc(l.svc === 'ai' ? t('wallet.line.ai', { n: l.qty }) : label[l.svc])}</span>
          <span class="num font-bold whitespace-nowrap">${esc(rp(-l.amount))}</span></li>`).join('')}
      </ul>
      <div class="mt-5 flex items-baseline justify-between gap-4 border-t-2 border-xl-dark pt-4">
        <span class="font-bold">${esc(t('wallet.left'))}</span>
        <span class="num text-2xl font-extrabold text-teal-ink">${esc(rp(s.left))}</span></div>
      <p class="mt-2 text-[.88rem] text-muted">${esc(t('wallet.leftNote'))}</p>`;
  }

  /* ---------- Templates (services-and-pricing §5.4) ---------- */
  const TEMPLATE_ORDER = ['wa-bot', 'n8n', 'agent', 'dify', 'wordpress'];
  function renderTemplates() {
    const root = document.querySelector('[data-templates]');
    if (!root) return;
    root.innerHTML = TEMPLATE_ORDER.map((id, i) => {
      const d = D.TEMPLATES[id].def;
      const name = t(`tpl.${id}.name`);
      const cost = d.unit
        ? t('tpl.costAi', { rp: rpK(D.templateCost(id)), qty: t(`unit.${d.unit}`, { n: num(d.qty) }) })
        : t('tpl.cost', { rp: rpK(D.templateCost(id)) });
      return `<li class="card flex flex-col gap-4 p-5 sm:p-6 ${i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'}" data-reveal>
        <div class="flex items-start justify-between gap-3">
          <span class="grid size-12 place-items-center rounded-control bg-xl-blue text-white">${icon(D.TEMPLATE_ICONS[id])}</span>
          <span class="rounded-full bg-paper px-3 py-1.5 font-mono text-[.72rem] text-xl-dark">${esc(t('tpl.min', { size: t(`size.${D.templateMin(id)}`) }))}</span>
        </div>
        <div><h3 class="text-[1.3rem] leading-tight font-extrabold tracking-tight">${esc(name)}</h3>
          <p class="mt-0.5 font-mono text-[.75rem] text-muted">${esc(t(`tpl.${id}.tech`))}</p></div>
        <p class="text-lead-ink">${esc(t(`tpl.${id}.desc`))}</p>
        <p class="mt-auto border-t border-line pt-3 font-bold">${esc(cost)}</p>
        <a class="btn btn--ghost w-full" href="app.html#/buat?template=${id}" aria-label="${esc(t('tpl.ctaAria', { name }))}">${esc(t('tpl.cta'))}${icon('arrow-right', 'icon icon-go size-5')}</a>
      </li>`;
    }).join('');
  }

  /* ---------- AI models (v3 cards) + catalogue dialog ---------- */
  const TIER_STYLE = { hemat: 'bg-xl-teal text-xl-dark', seimbang: 'bg-xl-sky text-xl-dark', premium: 'bg-xl-yellow text-xl-dark' };
  const compact = (n) => (n >= 1e6 ? num(n / 1e6) + (I.lang === 'en' ? 'M' : ' jt') : num(n / 1e3) + (I.lang === 'en' ? 'K' : ' rb'));
  function modelCard(m, { dark = false, extra = false } = {}) {
    const box = dark ? 'border-white/15 bg-white/[.06] text-white' : 'border-line bg-white text-xl-dark';
    const sub = dark ? 'text-white/70' : 'text-muted';
    return `<li class="${extra ? 'hidden md:block' : ''}"><article class="flex h-full flex-col rounded-card border p-5 ${box}" ${dark ? 'data-reveal' : ''}>
      <div class="flex items-center gap-3">
        <span class="grid size-11 shrink-0 place-items-center rounded-full bg-white ring-1 ring-line" aria-hidden="true"><img src="assets/img/models/${D.PROVIDER_ICON[m.provider]}.svg" alt="" width="24" height="24" class="size-6" loading="lazy" decoding="async"></span>
        <h3 class="min-w-0 flex-1 text-[1.05rem] leading-snug font-extrabold">${esc(m.name)}</h3>
        <span class="shrink-0 rounded-full px-2.5 py-1 font-mono text-[.72rem] ${TIER_STYLE[m.tier]}">${esc(t(`tier.${m.tier}`))}</span>
      </div>
      <p class="mt-3 text-[.9rem] ${sub}">${esc([m.provider, ...m.uses.map((u) => t(`use.${u}`))].join(' · '))}</p>
      <p class="mt-4 flex flex-wrap items-baseline gap-x-2"><span class="num font-mono text-[1.6rem]">≈ ${m.per10k}</span>
        <span class="text-[.9rem] font-bold ${sub}">${esc(t('model.unit', { rp: rp(10000) }))}</span></p>
      <details class="group/d mt-2">
        <summary class="flex min-h-11 cursor-pointer list-none items-center gap-1.5 font-bold ${dark ? 'text-xl-yellow' : 'text-xl-blue'} [&::-webkit-details-marker]:hidden">
          ${icon('chevron-right', 'icon size-4 transition-transform group-open/d:rotate-90')}<span>${esc(t('model.rates'))}</span></summary>
        <div class="mt-1 rounded-control px-3 py-2.5 text-[.9rem] ${dark ? 'bg-white/10' : 'bg-paper'}">
          <p class="font-mono text-[.7rem] tracking-[.08em] uppercase ${sub}">${esc(t('rate.caption'))}</p>
          <dl class="mt-1.5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1">
            <dt class="${sub}">${esc(t('rate.input'))}</dt><dd class="text-right font-mono">${esc(t('rate.unit', { n: num(m.in) }))}</dd>
            <dt class="${sub}">${esc(t('rate.output'))}</dt><dd class="text-right font-mono">${esc(t('rate.unit', { n: num(m.out) }))}</dd>
            <dt class="${sub}">${esc(t('rate.context'))}</dt><dd class="text-right font-mono">${esc(t('rate.ctx', { n: compact(m.ctx) }))}</dd>
          </dl></div>
      </details></article></li>`;
  }
  function renderModels() {
    const root = document.querySelector('[data-models]');
    if (root) root.innerHTML = D.PREVIEW_MODELS.map((id, i) => modelCard(D.MODELS.find((m) => m.id === id), { dark: true, extra: i >= 3 })).join('');
    document.querySelectorAll('[data-api-url]').forEach((el) => { el.textContent = D.API.baseUrl; });
    document.querySelectorAll('[data-api-key]').forEach((el) => { el.textContent = D.API.demoKey.slice(0, 8) + '••••••••' + D.API.demoKey.slice(-4); });
    document.querySelectorAll('[data-copy-url]').forEach((b) => { b.dataset.copy = D.API.baseUrl; });
    document.querySelectorAll('[data-copy-key]').forEach((b) => { b.dataset.copy = D.API.demoKey; });
  }

  const catDialog = document.getElementById('catalog');
  const CAT_STEP = 6;
  const cat = { query: '', filters: { use: new Set(), tier: new Set(), provider: new Set() }, visible: CAT_STEP };
  const FILTERS = {
    use: ['coding', 'chat', 'analysis'].map((v) => [v, () => t(`use.${v}`)]),
    tier: ['hemat', 'seimbang', 'premium'].map((v) => [v, () => t(`tier.${v}`)]),
    provider: [...new Set(D.MODELS.map((m) => m.provider))].map((v) => [v, () => v]),
  };
  const filtered = () => {
    const q = cat.query.trim().toLowerCase();
    const { use, tier, provider } = cat.filters;
    return D.MODELS.filter((m) => (!q || `${m.name} ${m.provider}`.toLowerCase().includes(q))
      && (!use.size || m.uses.some((u) => use.has(u))) && (!tier.size || tier.has(m.tier)) && (!provider.size || provider.has(m.provider)));
  };
  function renderCatalog() {
    if (!catDialog) return;
    catDialog.querySelectorAll('[data-filter-group]').forEach((g) => {
      const key = g.dataset.filterGroup;
      g.innerHTML = FILTERS[key].map(([v, label]) => `<button type="button" aria-pressed="${cat.filters[key].has(v)}" data-filter="${key}" data-value="${esc(v)}"
        class="inline-flex min-h-11 shrink-0 items-center rounded-full border border-line bg-white px-4 font-bold text-lead-ink hover:border-xl-blue aria-pressed:border-xl-blue aria-pressed:bg-xl-blue aria-pressed:text-white">${esc(label())}</button>`).join('');
    });
    const results = filtered();
    const shown = results.slice(0, cat.visible);
    catDialog.querySelector('[data-cat-list]').innerHTML = shown.map((m) => modelCard(m)).join('');
    catDialog.querySelector('[data-cat-count]').textContent = t('cat.count', { a: shown.length, b: results.length });
    catDialog.querySelector('[data-cat-empty]').dataset.show = String(results.length === 0);
    catDialog.querySelector('[data-cat-more]').dataset.show = String(results.length > shown.length);
    const active = Object.values(cat.filters).reduce((n, s) => n + s.size, 0);
    catDialog.querySelector('[data-filter-toggle-label]').textContent = t('cat.filter') + (active ? ` (${active})` : '');
  }
  const catModal = catDialog && TN.ui.setupModal(catDialog, { focus: '#cat-title' });
  function openCatalog(opener = document.activeElement) {
    cat.visible = CAT_STEP;
    renderCatalog();
    catModal?.open(opener);
  }
  if (catDialog) {
    catDialog.querySelector('[data-cat-close]').addEventListener('click', () => catModal.close());
    catDialog.querySelector('#cat-search').addEventListener('input', (e) => { cat.query = e.target.value; cat.visible = CAT_STEP; renderCatalog(); });
    catDialog.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-filter]');
      if (!chip) return;
      const set = cat.filters[chip.dataset.filter];
      set.has(chip.dataset.value) ? set.delete(chip.dataset.value) : set.add(chip.dataset.value);
      cat.visible = CAT_STEP;
      renderCatalog();
      catDialog.querySelector(`[data-filter="${chip.dataset.filter}"][data-value="${CSS.escape(chip.dataset.value)}"]`)?.focus();
    });
    catDialog.querySelector('[data-cat-more]').addEventListener('click', () => {
      const first = cat.visible;
      cat.visible += CAT_STEP;
      renderCatalog();
      catDialog.querySelectorAll('[data-cat-list] summary')[first]?.focus();
    });
    catDialog.querySelector('[data-cat-clear]').addEventListener('click', () => {
      Object.values(cat.filters).forEach((s) => s.clear());
      cat.query = '';
      const search = catDialog.querySelector('#cat-search');
      search.value = '';
      search.focus();
      renderCatalog();
    });
    const toggle = catDialog.querySelector('[data-filter-toggle]');
    toggle.addEventListener('click', () => {
      const panel = document.getElementById('cat-filters');
      const open = panel.dataset.open !== 'true';
      panel.dataset.open = String(open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  document.querySelectorAll('[data-open-catalog]').forEach((b) => b.addEventListener('click', () => openCatalog(b)));

  /* ---------- Example project (services-and-pricing §7) ---------- */
  function renderExample() {
    const root = document.querySelector('[data-example]');
    if (!root) return;
    const x = D.exampleTotals();
    const range = (a, b) => `${rp(a)}–${num(b)}`;
    const href = `app.html#/buat?resep=portofolio&s=${D.serialize([{ svc: 'hosting', size: D.EXAMPLE.size }, { svc: 'domain', ext: D.EXAMPLE.ext }, { svc: 'ai', unit: 'sesi', qty: D.HERO.sessions }])}`;
    const stage = (ic, title, detail, cost, extra = '') => `<li class="flex gap-3 border-b border-line py-4">
      <span class="grid size-10 shrink-0 place-items-center rounded-control bg-paper text-xl-blue">${icon(ic, 'icon size-5')}</span>
      <div class="grid min-w-0 flex-1 grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-3">
        <p class="font-bold">${esc(title)}</p><p class="num font-bold whitespace-nowrap sm:text-right">${esc(cost)}</p>
        <p class="text-[.92rem] text-lead-ink sm:col-span-2">${esc(detail)}</p><div class="sm:col-span-2">${extra}</div></div></li>`;
    const tasks = `<details class="group/d mt-1"><summary class="flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-[.92rem] font-bold text-xl-blue [&::-webkit-details-marker]:hidden">${icon('chevron-right', 'icon size-4 transition-transform group-open/d:rotate-90')}<span>${esc(t('ex.tasksSummary'))}</span></summary>
      <dl class="mt-1 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 rounded-control bg-paper px-3 py-2.5 text-[.9rem]">${D.EXAMPLE.tasks.map((r, i) => `<dt>${esc(t(`ex.task${i + 1}`))}</dt><dd class="text-right font-mono">${r[0]}–${r[1]}</dd>`).join('')}</dl></details>`;
    root.innerHTML = `
      <figcaption class="flex flex-wrap items-center justify-between gap-2"><span class="font-extrabold">${esc(t('ex.project'))}</span>
        <span class="rounded-full bg-paper px-2.5 py-1 font-mono text-[.7rem] text-muted uppercase">${esc(t('board.note'))}</span></figcaption>
      <ol class="mt-2" aria-label="${esc(t('ex.stagesAria'))}">
        ${stage('sparkles', t('ex.build'), t('ex.buildDetail', { a: x.sessions[0], b: x.sessions[1] }), range(...x.usage), tasks)}
        ${stage('globe', t('svc.hosting.name'), t('ex.online', { size: t(`size.${D.EXAMPLE.size}`) }), rp(x.hosting))}
        ${stage('at-sign', t('svc.domain.name'), t('ex.domain', { domain: D.EXAMPLE.domain }), rp(x.domain))}
      </ol>
      <div class="mt-4 flex flex-wrap items-baseline justify-between gap-x-4"><span class="text-lg font-extrabold">${esc(t('ex.total'))}</span>
        <span class="num text-[clamp(1.5rem,4.5vw,2.25rem)] font-extrabold whitespace-nowrap">${esc(range(...x.total))}</span></div>
      <p class="mt-4 rounded-2xl bg-xl-yellow px-4 py-3 font-bold">${esc(t('ex.verdict', { rp: rp(D.EXAMPLE.topup.amount) }))}</p>
      <p class="mt-2 text-[.9rem] text-muted">${esc(t('ex.left', { balance: rp(x.balance), a: rp(x.balance - x.total[1]), b: rp(x.balance - x.total[0]) }))}</p>
      <a class="btn btn--lg mt-5 w-full sm:w-auto" href="${href}">${esc(t('ex.cta'))}${icon('arrow-right', 'icon icon-go size-5')}</a>`;
  }

  /* ---------- Safe for beginners: stacked cards, numbers from billing rules ---------- */
  function renderSafe() {
    const root = document.querySelector('[data-safe]');
    if (!root) return;
    const price = D.SIZES.coba.price, daysLeft = 20;
    const cards = [
      { bg: 'bg-xl-sky', ic: 'power', art: t('safe.1.art', { rp: rp(D.refund(price, daysLeft)) }), body: t('safe.1.body') },
      { bg: 'bg-xl-yellow on-yellow', ic: 'arrow-up-down', art: t('safe.2.art', { from: t('size.rutin'), to: t('size.coba'), rp: rp(-D.prorata(D.SIZES.rutin.price, price, daysLeft)) }), body: t('safe.2.body') },
      { bg: 'bg-xl-teal', ic: 'circle-pause', art: t('safe.3.art', { n: D.RULES.pauseDays }), body: t('safe.3.body', { n: D.RULES.pauseDays }), status: true },
      { bg: 'bg-xl-blue text-white', ic: 'bell', art: t('safe.4.art', { n: D.RULES.remindDays, rp: rp(D.TOPUP_MIN) }), body: t('safe.4.body', { n: D.RULES.remindDays }) },
    ];
    root.innerHTML = cards.map((c, i) => `<li class="stack-card ${c.bg}" style="--n:${i}" data-stack>
      <p class="font-mono text-[.85rem]">0${i + 1} / 0${cards.length}</p>
      <div><h3 class="text-[clamp(2rem,5vw,4.5rem)] leading-[.95] font-extrabold tracking-[-.05em] [text-wrap:balance]">${esc(t(`safe.${i + 1}.title`))}</h3>
        <p class="mt-4 max-w-[30em] text-[clamp(1.05rem,1.4vw,1.3rem)]">${esc(c.body)}</p></div>
      <p class="flex w-fit max-w-full flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl ${i === 3 ? 'bg-white text-xl-dark' : 'bg-white/80'} px-4 py-3 font-bold">
        ${icon(c.ic, 'icon size-5 shrink-0')}${c.status ? `<span class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-xl-yellow px-2 py-0.5 font-mono text-[.75rem] font-medium">${esc(t('status.paused'))}</span>` : ''}<span class="min-w-0 basis-[14rem] grow">${esc(c.art)}</span></p>
    </li>`).join('');
  }

  /* ---------- Learn guides ---------- */
  function renderGuides() {
    const root = document.querySelector('[data-guides]');
    if (!root) return;
    root.innerHTML = D.GUIDES.map((g) => {
      const title = t(`learn.${g.id}`);
      return `<li class="card flex flex-col gap-4 p-5 sm:p-6" data-reveal>
        <span class="grid size-12 place-items-center rounded-control bg-xl-yellow text-xl-dark">${icon('book-open')}</span>
        <p class="font-mono text-[.75rem] tracking-[.08em] text-muted uppercase">${esc(t(`recipe.short.${g.recipe}`))}</p>
        <h3 class="text-[1.3rem] leading-tight font-extrabold tracking-tight">${esc(title)}</h3>
        <p class="mt-auto inline-flex items-center gap-2 text-[.92rem] text-muted">${icon('clock', 'icon size-4')}${esc(t('learn.read', { n: g.minutes }))}</p>
        <a class="inline-flex min-h-11 items-center gap-1 font-bold text-xl-blue underline decoration-xl-yellow decoration-2 underline-offset-4" href="app.html#/belajar?panduan=${g.id}" aria-label="${esc(t('learn.ctaAria', { title }))}">${esc(t('learn.cta'))}${icon('arrow-right', 'icon size-4')}</a>
      </li>`;
    }).join('');
  }

  /* ---------- FAQ (13) ---------- */
  function renderFaq() {
    const root = document.querySelector('[data-faq]');
    if (!root) return;
    const open = new Set([...root.querySelectorAll('details[open]')].map((d) => d.dataset.q));
    const vars = { pause: D.RULES.pauseDays, remind: D.RULES.remindDays, first: rp(D.DOMAINS['my.id'].first), renew: rp(D.DOMAINS['my.id'].renew) };
    root.innerHTML = Array.from({ length: 13 }, (_, i) => i + 1).map((n) => `<details class="group/f border-b border-line" data-q="${n}" ${open.has(String(n)) ? 'open' : ''}>
      <summary class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[1.08rem] font-bold [&::-webkit-details-marker]:hidden">
        <span>${esc(t(`faq.q${n}`))}</span><span class="grid size-9 shrink-0 place-items-center rounded-full bg-white ring-1 ring-line">${icon('plus', 'icon size-5 transition-transform group-open/f:rotate-45')}</span></summary>
      <p class="max-w-[42em] pb-5 text-lead-ink">${esc(t(`faq.a${n}`, vars))}</p></details>`).join('');
  }

  /* ---------- Team consultation dialog (v3) ---------- */
  const csDialog = document.getElementById('consult');
  const csForm = csDialog?.querySelector('form');
  const csField = (n) => csForm?.elements.namedItem(n);
  const consult = { contact: '' };
  function setCsError(name, key) {
    const msg = csDialog.querySelector(`[data-cerr="${name}"]`);
    if (msg) { msg.textContent = key ? t(key) : ''; msg.dataset.key = key || ''; msg.classList.toggle('hidden', !key); }
    csForm.querySelectorAll(`[name="${name}"]`).forEach((el) => el.setAttribute('aria-invalid', String(Boolean(key))));
  }
  function renderConsult() {
    if (!csDialog) return;
    csDialog.querySelectorAll('[data-cerr]').forEach((el) => { if (el.dataset.key) el.textContent = t(el.dataset.key); });
    csDialog.querySelector('[data-cs-success-body]').textContent = t('cs.successBody', { contact: consult.contact });
  }
  function showCsPanel(name) {
    csDialog.querySelectorAll('[data-cs-panel]').forEach((el) => { el.hidden = el.dataset.csPanel !== name; });
    renderConsult();
  }
  function updateCount() {
    const n = csField('need').value.length;
    csDialog.querySelector('[data-cs-count]').textContent = `${n}/500`;
    csDialog.querySelector('[data-cs-count-live]').textContent = n >= 450 ? t('cs.countLive', { n }) : '';
  }
  const csModal = csDialog && TN.ui.setupModal(csDialog, {
    focus: '#cs-title',
    onClose: () => {
      if (!csDialog.querySelector('[data-cs-panel="success"]').hidden) { csForm.reset(); consult.contact = ''; updateCount(); showCsPanel('form'); }
    },
  });
  if (csDialog) {
    csField('need').addEventListener('input', updateCount);
    // Errors appear on submit and clear while typing — never on blur: a message vanishing on blur shifts the
    // layout between mousedown and mouseup, so the click the user aimed at the next field misses.
    csForm.addEventListener('input', (e) => {
      const n = e.target.name;
      if (!csDialog.querySelector(`[data-cerr="${n}"]`)?.dataset.key) return;
      const ok = n === 'contact' ? TN.ui.parseContact(e.target.value).ok : Boolean(e.target.value.trim());
      if (ok) setCsError(n, null);
    });
    csForm.addEventListener('change', (e) => {
      if (e.target.name === 'teamSize') setCsError('teamSize', null);
      if (e.target.name === 'consent' && e.target.checked) setCsError('consent', null);
    });
    csForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const contact = TN.ui.parseContact(csField('contact').value);
      const checks = [ // same order as on screen → focus lands on the topmost invalid field
        ['name', csField('name').value.trim() ? null : 'err.name'],
        ['org', csField('org').value.trim() ? null : 'err.org'],
        ['contact', contact.ok ? null : contact.error],
        ['teamSize', csField('teamSize').value ? null : 'err.teamSize'],
        ['consent', csField('consent').checked ? null : 'err.consent'],
      ];
      checks.forEach(([n, k]) => setCsError(n, k));
      const bad = checks.find(([, k]) => k);
      if (bad) { csForm.querySelector(`[name="${bad[0]}"]`)?.focus(); return; }
      consult.contact = contact.value; // shown once, never stored (DoD 11)
      showCsPanel('success');
      csDialog.querySelector('#cs-success-title').focus();
    });
    csDialog.querySelectorAll('[data-cs-close]').forEach((b) => b.addEventListener('click', () => csModal.close()));
  }
  document.querySelectorAll('[data-open-consult]').forEach((b) => b.addEventListener('click', () => csModal?.open(b)));

  function render() {
    renderHero();
    renderChips();
    renderCard();
    renderServices();
    renderWallet();
    renderTemplates();
    renderModels();
    renderCatalog();
    renderExample();
    renderSafe();
    renderGuides();
    renderFaq();
    renderConsult();
    syncStartLinks();
    document.dispatchEvent(new CustomEvent('tn:render'));
  }

  I.onChange(render);
  I.init();
  window.TN.landing = { selectRecipe, openCatalog, openConsult: (from) => csModal?.open(from), get recipe() { return state.recipe; } };
})();
