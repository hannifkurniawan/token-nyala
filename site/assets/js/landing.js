/* TokenNyala v4 — landing page, built the way archive/showcase/v2/script.js works:
   static copy lives in HTML (data-l="id|en", swapped by CSS); this file renders only data-driven parts
   (every number from TN.data, dynamic strings from the TN.i18n dictionary), wires interactions, and runs
   the boot sequence: loader covers the page → motion is prepared → loader leaves → hero timeline plays. */
(() => {
  'use strict';
  const D = TN.data;
  const I = TN.i18n;
  const { t, rp, rpK, num } = I;
  const { icon, esc, itemView, fromLine } = TN.ui;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     State + helpers
     --------------------------------------------------------- */
  const state = { recipe: D.RECIPES[0].id, hasPicked: false };
  const startHref = (id) => (D.recipe(id).aiOnly ? 'app.html#/ai?isi=1' : `app.html#/buat?paket=${id}`);
  const calcHref = (id) => `harga.html?paket=${id}#kalkulator`;
  /** 'Rp34 rb' → <small>Rp</small>34 rb (textContent stays 'Rp34 rb') */
  const bigK = (n) => `<small>≈ Rp</small>${esc(rpK(n).slice(2))}`;

  /* ---------------------------------------------------------
     Switches + sparks
     --------------------------------------------------------- */
  function burst(el, count = 16) {
    if (!el || prefersReducedMotion) return;
    TN.ui.burst(el, count, el.closest('.final') ? $('#sparks') : el.closest('section') || el);
  }

  /* ---------------------------------------------------------
     Hero: trust line, board (reacts to the chosen goal), typing prompt
     --------------------------------------------------------- */
  function renderHero() {
    $$('[data-trust-from]').forEach((el) => { el.textContent = t('hero.trust3', { rp: rpK(D.SIZES.coba.price) }); });
    $$('[data-domain]').forEach((el) => { el.textContent = D.HERO.domain; });
    const sticker = $('[data-sticker]');
    if (sticker) sticker.textContent = t('hero.sticker');
    updateBoard();
  }

  function updateBoard() {
    const r = D.recipe(state.recipe);
    const status = $('[data-board-status]');
    $('[data-board-project]').textContent = t(`recipe.short.${r.id}`);
    if (!state.hasPicked) {
      $('[data-board-balance]').textContent = rp(0);
      $('[data-board-meter]').style.setProperty('--v', 0);
      $('[data-board-estimate]').textContent = t('board.pick');
      $('[data-board-status-text]').textContent = t('board.standby');
      status.classList.remove('is-on');
      return;
    }
    if (r.aiOnly) {
      const row = D.AI_ONLY[0];
      $('[data-board-balance]').textContent = rp(row.amount);
      $('[data-board-meter]').style.setProperty('--v', 0.4);
      $('[data-board-estimate]').textContent = `≈ ${t('recipe.sessions', { range: row.range })}`;
    } else {
      const tot = D.recipeTotals(r.items);
      const credits = tot.suggest.amount + tot.suggest.bonus;
      $('[data-board-balance]').textContent = rp(credits);
      $('[data-board-meter]').style.setProperty('--v', Math.min(1, tot.firstMonth / credits).toFixed(3));
      $('[data-board-estimate]').textContent = t('board.estimate', { rp: rpK(tot.perMonth), n: tot.months });
    }
    $('[data-board-status-text]').textContent = t('status.on');
    status.classList.add('is-on');
  }

  const PROMPTS = ['board.prompt', 'board.prompt2', 'board.prompt3'];
  const typeEl = $('#type-prompt');
  if (typeEl) {
    if (prefersReducedMotion) {
      typeEl.textContent = t(PROMPTS[0]);
      I.onChange(() => { typeEl.textContent = t(PROMPTS[0]); });
    } else {
      let pi = 0, ci = 0, deleting = false;
      const tick = () => {
        const text = t(PROMPTS[pi % PROMPTS.length]);
        if (!deleting) {
          ci = Math.min(ci + 1, text.length);
          typeEl.textContent = text.slice(0, ci);
          if (ci >= text.length) { deleting = true; return setTimeout(tick, 2200); }
          return setTimeout(tick, 45 + Math.random() * 50);
        }
        ci -= 1;
        typeEl.textContent = text.slice(0, Math.max(ci, 0));
        if (ci <= 0) { deleting = false; pi += 1; return setTimeout(tick, 350); }
        return setTimeout(tick, 22);
      };
      typeEl.textContent = '';
      setTimeout(tick, 1200);
    }
  }

  $$('[data-hero-switch]').forEach((sw) => sw.addEventListener('click', () => {
    const on = !sw.classList.contains('is-on');
    $$('[data-hero-switch]').forEach((s) => s.classList.toggle('is-on', on));
    if (on) burst(sw, 12);
  }));

  /* ---------------------------------------------------------
     How it works: receipt art (numbers from TN.data)
     --------------------------------------------------------- */
  function renderHow() {
    const rc = $('[data-how-receipt]');
    if (!rc) return;
    const host = D.SIZES[D.HERO.size].price, dom = D.DOMAINS[D.HERO.ext].first;
    rc.innerHTML = [[t('wallet.line.hosting'), rp(host)], [t('wallet.line.domain'), rp(dom)], [t('how.fee'), rp(0)]]
      .map(([a, b]) => `<p><span>${esc(a)}</span><b>${esc(b)}</b></p>`).join('')
      + `<p class="receipt-art__total"><span>${esc(t('ex.total'))}</span><b>${esc(rp(host + dom))}</b></p>`;
  }

  /* ---------------------------------------------------------
     Recipes — "Mau bikin apa?" (radiogroup + package sheet)
     --------------------------------------------------------- */
  const tabsRoot = $('[data-recipe-chips]');
  const card = $('[data-recipe-card]');
  const live = $('[data-recipe-live]');
  let shownPrice = null;

  function renderTabs() {
    if (!tabsRoot) return;
    tabsRoot.innerHTML = '<span class="intent__marker" aria-hidden="true"></span>' + D.RECIPES.map((r) => {
      const on = r.id === state.recipe;
      const hint = r.aiOnly ? t('hero.trust3', { rp: rpK(D.AI_ONLY[0].amount) }) : `≈ ${rpK(D.recipeTotals(r.items).perMonth)}${t('label.perMonth')}`;
      return `<button type="button" class="intent__tab" role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}" data-recipe="${r.id}" aria-controls="recipe-card">
        <span class="intent__label">${esc(t(`recipe.short.${r.id}`))}</span><span class="intent__hint mono">${esc(hint)}</span></button>`;
    }).join('');
    tabsRoot.style.setProperty('--i', D.RECIPES.findIndex((r) => r.id === state.recipe));
  }

  /** Price counts to the new value (showcase animatePrice); text stays e.g. 'Rp34 rb' */
  function animatePrice(el, to) {
    const from = shownPrice;
    shownPrice = to;
    if (from === null || from === to || prefersReducedMotion) { el.innerHTML = bigK(to); return; }
    const t0 = performance.now(), dur = 420;
    const step = (now) => {
      if (shownPrice !== to) return;
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.innerHTML = bigK(p < 1 ? Math.round((from + (to - from) * e) / 1000) * 1000 : to);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const spec = (dt, dd) => `<div><dt>${esc(dt)}</dt><dd>${dd}</dd></div>`;
  const PAY = '<ul class="pay-cues mono" role="list"><li>QRIS</li><li>E-wallet</li><li>Virtual account</li></ul>';

  function renderCard(animate = false) {
    if (!card) return;
    const r = D.recipe(state.recipe);
    const name = t(`recipe.name.${r.id}`);
    if (r.aiOnly) {
      shownPrice = null;
      card.innerHTML = `
        <div class="pkg-sheet__main">
          <p class="pkg-sheet__kicker mono">${esc(t('recipe.aiOnlyTitle'))}</p>
          <h3 class="pkg-sheet__name" id="recipe-name">${esc(name)}</h3>
          <p class="pkg-sheet__price"><small>${esc(t('recipe.from'))} Rp</small>${esc(rpK(D.AI_ONLY[0].amount).slice(2))}</p>
          <p class="pkg-sheet__line">${esc(t(`recipe.desc.${r.id}`))}</p>
        </div>
        <div class="pkg-sheet__side">
          <dl class="pkg-specs" aria-label="${esc(t('recipe.itemsAria'))}">${D.AI_ONLY.map((row) => spec(rp(row.amount), esc(t('recipe.sessions', { range: row.range })))).join('')}</dl>
          <a class="btn btn--yellow btn--lg btn--block magnetic" href="${startHref(r.id)}" data-cursor="Nyala">${esc(t('recipe.aiOnlyCta'))} <span class="btn__icon" aria-hidden="true">→</span></a>
          ${PAY}
        </div>`;
    } else {
      const tot = D.recipeTotals(r.items);
      const credits = tot.suggest.amount + tot.suggest.bonus;
      const v = Math.min(1, tot.firstMonth / credits);
      const suggestKey = tot.months === 1 ? 'recipe.suggest.one' : 'recipe.suggest.many';
      card.innerHTML = `
        <div class="pkg-sheet__main">
          <p class="pkg-sheet__kicker mono">${esc(t('recipe.approx'))} <span class="pkg-sheet__arrow" aria-hidden="true">→</span> <span class="pkg-sheet__fit">${esc(t(`recipe.short.${r.id}`))}</span></p>
          <h3 class="pkg-sheet__name" id="recipe-name">${esc(name)}</h3>
          <p class="pkg-sheet__price"><span>${bigK(shownPrice ?? tot.perMonth)}</span><em>${esc(t('label.perMonth'))}</em></p>
          <p class="pkg-sheet__line">${esc(t(`recipe.desc.${r.id}`))}</p>
          ${tot.firstMonth > tot.perMonth ? `<p class="pkg-sheet__note">${esc(t('recipe.firstMonth', { rp: rp(tot.firstMonth) }))}</p>` : ''}
          <div class="pkg-sheet__meter">
            <div class="meter meter--xl" aria-hidden="true"><span class="meter__fill" style="--v:${v.toFixed(3)}"></span><span class="meter__spark" style="left:${(v * 100).toFixed(1)}%"></span></div>
            <p class="mono reco__credits">${esc(t(suggestKey, { rp: rp(tot.suggest.amount), n: tot.months }))} · ${esc(t('recipe.suggestNote', { rp: rp(credits) }))}</p>
          </div>
        </div>
        <div class="pkg-sheet__side">
          <dl class="pkg-specs" aria-label="${esc(t('recipe.itemsAria'))}">${r.items.map((it) => {
            const iv = itemView(it);
            return spec(iv.name, esc(iv.detail) + (iv.estimate ? ` <small>${esc(t('label.estimate'))}</small>` : ''));
          }).join('')}</dl>
          <dl class="pkg-specs pkg-specs--cost" aria-label="${esc(t('recipe.costsAria'))}">
            ${spec(t('cost.fixed'), esc(rp(tot.fixed)))}${spec(t('cost.usage'), esc('±' + rp(tot.usage)))}${tot.yearly ? spec(t('cost.yearly'), esc(rp(tot.yearly))) : ''}
          </dl>
          <a class="btn btn--yellow btn--lg btn--block magnetic" href="${startHref(r.id)}" data-cursor="Nyala">${esc(t('recipe.cta'))} <span class="btn__icon" aria-hidden="true">→</span></a>
          <div class="pkg-sheet__links"><a class="link-arrow link-arrow--light" href="${calcHref(r.id)}">${esc(t('recipe.edit'))} →</a>${PAY}</div>
        </div>`;
      animatePrice(card.querySelector('.pkg-sheet__price span'), tot.perMonth);
    }
    if (animate) { card.classList.remove('is-swapping'); void card.offsetWidth; card.classList.add('is-swapping'); }
  }

  function announce() {
    if (!live) return;
    const r = D.recipe(state.recipe);
    const name = t(`recipe.name.${r.id}`);
    live.textContent = r.aiOnly ? name : t('recipe.announce', { name, rp: rpK(D.recipeTotals(r.items).perMonth) });
  }
  function syncStartLinks() { $$('[data-start]').forEach((a) => { a.href = startHref(state.recipe); }); }

  function selectRecipe(id, { focus = false } = {}) {
    state.recipe = id;
    state.hasPicked = true;
    $$('[role=radio]', tabsRoot).forEach((b) => {
      const on = b.dataset.recipe === id;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    tabsRoot.style.setProperty('--i', D.RECIPES.findIndex((r) => r.id === id));
    renderCard(true);
    announce();
    syncStartLinks();
    updateBoard();
  }
  tabsRoot?.addEventListener('click', (e) => { const b = e.target.closest('[data-recipe]'); if (b) selectRecipe(b.dataset.recipe); });
  tabsRoot?.addEventListener('keydown', (e) => {
    const ids = D.RECIPES.map((r) => r.id);
    const i = ids.indexOf(state.recipe);
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: ids.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    selectRecipe(ids[(next + ids.length) % ids.length], { focus: true });
  });

  /* ---------------------------------------------------------
     All services (4 groups) + templates
     --------------------------------------------------------- */
  function renderServices() {
    const el = $('[data-services]');
    if (!el) return;
    el.innerHTML = D.GROUPS.map((g, gi) => `
      <section class="svc-group" aria-labelledby="svc-g-${g.id}">
        <h3 class="svc-group__head" id="svc-g-${g.id}"><span>0${gi + 1}</span> ${esc(t(`svc.group.${g.id}`))}</h3>
        <ul role="list">${g.services.map((id) => {
          const [main, sub] = fromLine(id);
          return `<li class="svc-row" id="svc-${id}">
            <span class="svc-row__icon" aria-hidden="true">${icon(D.ICONS[id])}</span>
            <div><h4>${esc(t(`svc.${id}.name`))}</h4><p class="svc-row__tech">${esc(t(`svc.${id}.tech`))}</p></div>
            <p class="svc-row__price">${esc(main)}${sub ? `<small>${esc(sub)}</small>` : ''}</p>
            <p class="svc-row__desc">${esc(t(`svc.${id}.desc`))}</p>
          </li>`;
        }).join('')}</ul>
      </section>`).join('');
  }

  const TEMPLATE_ORDER = ['wa-bot', 'n8n', 'agent', 'dify', 'wordpress'];
  function renderTemplates() {
    const el = $('[data-templates]');
    if (!el) return;
    el.innerHTML = TEMPLATE_ORDER.map((id) => {
      const d = D.TEMPLATES[id].def;
      const name = t(`tpl.${id}.name`);
      const cost = d.unit
        ? t('tpl.costAi', { rp: rpK(D.templateCost(id)), qty: t(`unit.${d.unit}`, { n: num(d.qty) }) })
        : t('tpl.cost', { rp: rpK(D.templateCost(id)) });
      return `<li class="tpl-card">
        <span class="tpl-card__icon" aria-hidden="true">${icon(D.TEMPLATE_ICONS[id])}</span>
        <h4>${esc(name)}</h4>
        <p class="tpl-card__tech">${esc(t(`tpl.${id}.tech`))}</p>
        <p>${esc(t(`tpl.${id}.desc`))}</p>
        <p class="tpl-card__min">${esc(t('tpl.min', { size: t(`size.${D.templateMin(id)}`) }))}</p>
        <p class="tpl-card__cost">${esc(cost)}</p>
        <a class="btn btn--sm btn--outline-dark tpl-card__cta" href="app.html#/buat?template=${id}" aria-label="${esc(t('tpl.ctaAria', { name }))}" data-cursor="Nyala">${esc(t('tpl.cta'))} <span class="btn__icon" aria-hidden="true">→</span></a>
      </li>`;
    }).join('');
  }

  /* ---------------------------------------------------------
     Models (index rows) + catalogue (cards) + API config
     --------------------------------------------------------- */
  const LEVEL_BADGE = { hemat: 'badge--teal', seimbang: 'badge--sky', premium: 'badge--yellow' };
  const compact = (n) => (n >= 1e6 ? num(n / 1e6) + (I.lang === 'en' ? 'M' : ' jt') : num(n / 1e3) + (I.lang === 'en' ? 'K' : ' rb'));
  const logo = (m) => `<img src="assets/img/models/${D.PROVIDER_ICON[m.provider]}.svg" alt="" width="26" height="26" loading="lazy" decoding="async">`;
  const meta = (m) => [m.provider, ...m.uses.map((u) => t(`use.${u}`))].join(' · ');
  const rates = (m) => `<p>${esc(t('rate.caption'))}</p><dl>
      <div><dt>${esc(t('rate.input'))}</dt><dd>${esc(t('rate.unit', { n: num(m.in) }))}</dd></div>
      <div><dt>${esc(t('rate.output'))}</dt><dd>${esc(t('rate.unit', { n: num(m.out) }))}</dd></div>
      <div><dt>${esc(t('rate.context'))}</dt><dd>${esc(t('rate.ctx', { n: compact(m.ctx) }))}</dd></div></dl>`;

  function renderModels() {
    const el = $('[data-models]');
    if (el) el.innerHTML = D.PREVIEW_MODELS.map((id) => D.MODELS.find((m) => m.id === id)).map((m) => `
      <li><details class="mrow">
        <summary>
          <span class="mrow__icon" aria-hidden="true">${logo(m)}</span>
          <span class="mrow__name">${esc(m.name)}</span>
          <span class="mrow__meta">${esc(meta(m))}</span>
          <span class="badge ${LEVEL_BADGE[m.tier]} mrow__badge">${esc(t(`tier.${m.tier}`))}</span>
          <span class="mrow__per"><strong>≈ ${m.per10k}</strong><span>${esc(t('model.unit', { rp: rp(10000) }))}</span></span>
          <span class="mrow__toggle">${esc(t('model.rates'))}</span>
        </summary>
        <div class="mrow__rates">${rates(m)}</div>
      </details></li>`).join('');
    $$('[data-api-url]').forEach((c) => { c.textContent = D.API.baseUrl; });
    $$('[data-api-key]').forEach((c) => { c.textContent = D.API.demoKey.slice(0, 8) + '••••••••' + D.API.demoKey.slice(-4); });
    $$('[data-copy-url]').forEach((b) => { b.dataset.copy = D.API.baseUrl; });
    $$('[data-copy-key]').forEach((b) => { b.dataset.copy = D.API.demoKey; });
  }

  const catDialog = $('#catalog');
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
    $$('[data-filter-group]', catDialog).forEach((g) => {
      const key = g.dataset.filterGroup;
      g.innerHTML = FILTERS[key].map(([v, label]) => `<button type="button" class="cat-chip" aria-pressed="${cat.filters[key].has(v)}" data-filter="${key}" data-value="${esc(v)}">${esc(label())}</button>`).join('');
    });
    const results = filtered();
    const shown = results.slice(0, cat.visible);
    $('[data-cat-list]', catDialog).innerHTML = shown.map((m) => `<li><article class="mcard">
        <div class="mcard__top"><span class="mrow__icon" aria-hidden="true">${logo(m)}</span><h3>${esc(m.name)}</h3><span class="badge ${LEVEL_BADGE[m.tier]}">${esc(t(`tier.${m.tier}`))}</span></div>
        <p class="mcard__meta">${esc(meta(m))}</p>
        <p class="mcard__per"><strong>≈ ${m.per10k}</strong> <span>${esc(t('model.unit', { rp: rp(10000) }))}</span></p>
        <details><summary>${esc(t('model.rates'))}</summary>${rates(m)}</details>
      </article></li>`).join('');
    $('[data-cat-count]', catDialog).textContent = t('cat.count', { a: shown.length, b: results.length });
    $('[data-cat-empty]', catDialog).dataset.show = String(results.length === 0);
    $('[data-cat-more]', catDialog).dataset.show = String(results.length > shown.length);
  }
  const catModal = catDialog && TN.ui.setupModal(catDialog, { focus: '#cat-title' });
  function openCatalog(opener = document.activeElement) {
    cat.visible = CAT_STEP;
    renderCatalog();
    catModal?.open(opener);
  }
  if (catDialog) {
    $('[data-cat-close]', catDialog).addEventListener('click', () => catModal.close());
    $('#cat-search').addEventListener('input', (e) => { cat.query = e.target.value; cat.visible = CAT_STEP; renderCatalog(); });
    catDialog.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-filter]');
      if (!chip) return;
      const set = cat.filters[chip.dataset.filter];
      set.has(chip.dataset.value) ? set.delete(chip.dataset.value) : set.add(chip.dataset.value);
      cat.visible = CAT_STEP;
      renderCatalog();
      $(`[data-filter="${chip.dataset.filter}"][data-value="${CSS.escape(chip.dataset.value)}"]`, catDialog)?.focus();
    });
    $('[data-cat-more]', catDialog).addEventListener('click', () => {
      const first = cat.visible;
      cat.visible += CAT_STEP;
      renderCatalog();
      $$('[data-cat-list] summary', catDialog)[first]?.focus();
    });
    $('[data-cat-clear]', catDialog).addEventListener('click', () => {
      Object.values(cat.filters).forEach((s) => s.clear());
      cat.query = '';
      const search = $('#cat-search');
      search.value = '';
      search.focus();
      renderCatalog();
    });
  }
  $$('[data-open-catalog]').forEach((b) => b.addEventListener('click', () => openCatalog(b)));

  /* ---------------------------------------------------------
     Benefits stack: refund, resize, pause + reminder, one-balance dashboard
     --------------------------------------------------------- */
  function renderSafe() {
    const price = D.SIZES.coba.price, daysLeft = 20;
    const refund = $('[data-safe-refund]');
    if (refund) refund.textContent = t('safe.1.art', { rp: rp(D.refund(price, daysLeft)) });
    const resize = $('[data-safe-resize]');
    if (resize) resize.innerHTML = `<span>${esc(t('size.rutin'))}</span><span class="stack-card__arrow">→</span><span class="is-on">${esc(t('size.coba'))}</span>
      <p class="notice-art">${esc(t('safe.2.art', { from: t('size.rutin'), to: t('size.coba'), rp: rp(-D.prorata(D.SIZES.rutin.price, price, daysLeft)) }))}</p>`;
    const body = $('[data-safe-pause-body]');
    if (body) body.textContent = t('safe.pause.body', { n: D.RULES.pauseDays, m: D.RULES.remindDays });
    const pause = $('[data-safe-pause]');
    if (pause) pause.innerHTML = `<p class="notice-art"><span class="badge badge--yellow">${esc(t('status.paused'))}</span>${esc(t('safe.3.art', { n: D.RULES.pauseDays }))}</p>
      <p class="notice-art"><span class="badge badge--sky">${icon('bell', 'icon icon--sm')}</span>${esc(t('safe.4.art', { n: D.RULES.remindDays, rp: rp(D.TOPUP_MIN) }))}</p>`;
    renderWallet();
  }

  function renderWallet() {
    const el = $('[data-wallet]');
    if (!el) return;
    const s = D.heroScenario();
    const label = { hosting: t('wallet.line.hosting'), domain: t('wallet.line.domain') };
    el.innerHTML = `
      <div class="dash__head"><span class="badge badge--yellow">${esc(t('board.note'))}</span><span class="mono dash__pkg">${esc(t('wallet.card'))}</span></div>
      <div class="dash__balance">
        <span class="mono">${esc(t('wallet.in', { rp: rp(D.HERO.topup.amount), bonus: rp(D.HERO.topup.bonus) }))}</span>
        <strong>${esc(rp(s.balance))}</strong>
        <div class="meter meter--light" aria-hidden="true"><span class="meter__fill" style="--v:${(s.left / s.balance).toFixed(3)}"></span></div>
      </div>
      <ul class="dash__lines" role="list">${s.lines.map((l) => `<li><span>${esc(l.svc === 'ai' ? t('wallet.line.ai', { n: l.qty }) : label[l.svc])}</span><b>${esc(rp(-l.amount))}</b></li>`).join('')}</ul>
      <p class="dash__left"><span>${esc(t('wallet.left'))}</span><strong>${esc(rp(s.left))}</strong></p>
      <div class="dash__row"><span id="reminder-label">${esc(t('safe.4.remind'))}</span>
        <button type="button" class="toggle" role="switch" aria-checked="${remindOn}" aria-labelledby="reminder-label" data-reminder><span></span></button></div>
      <p class="dash__note">${esc(t('wallet.leftNote'))}</p>`;
  }
  let remindOn = true;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-reminder]');
    if (!b) return;
    remindOn = !remindOn;
    b.setAttribute('aria-checked', String(remindOn));
  });

  /* ---------------------------------------------------------
     Example: before/after + receipt (services-and-pricing §7)
     --------------------------------------------------------- */
  function renderExample() {
    const el = $('[data-example]');
    if (!el) return;
    const x = D.exampleTotals();
    const range = (a, b) => `${rp(a)}–${num(b)}`;
    const href = `app.html#/buat?paket=portofolio&s=${D.serialize([{ svc: 'hosting', size: D.EXAMPLE.size }, { svc: 'domain', ext: D.EXAMPLE.ext }, { svc: 'ai', unit: 'sesi', qty: D.HERO.sessions }])}`;
    el.innerHTML = `
      <p class="mono receipt__head" id="receipt-title">${esc(t('ex.project'))}</p>
      <table class="receipt__table">
        <caption class="sr-only">${esc(t('ex.tasksSummary'))}</caption>
        <thead><tr><th scope="col">${esc(t('ex.task'))}</th><th scope="col">${esc(t('ex.sessionsCol'))}</th></tr></thead>
        <tbody>${D.EXAMPLE.tasks.map((r, i) => `<tr><td>${esc(t(`ex.task${i + 1}`))}</td><td>${r[0]}–${r[1]}</td></tr>`).join('')}</tbody>
        <tfoot><tr><th scope="row">${esc(t('ex.total'))}</th><td>${x.sessions[0]}–${x.sessions[1]}</td></tr></tfoot>
      </table>
      <dl class="receipt__lines" aria-label="${esc(t('ex.stagesAria'))}">
        <div><dt>${esc(t('ex.build'))}</dt><dd>${esc(range(...x.usage))}</dd></div>
        <div><dt>${esc(t('svc.hosting.name'))} · ${esc(t('ex.online', { size: t(`size.${D.EXAMPLE.size}`) }))}</dt><dd>${esc(rp(x.hosting))}</dd></div>
        <div><dt>${esc(t('ex.domain', { domain: D.EXAMPLE.domain }))}</dt><dd>${esc(rp(x.domain))}</dd></div>
      </dl>
      <p class="receipt__cost">${esc(t('ex.total'))} <strong>${esc(range(...x.total))}</strong></p>
      <div class="receipt__meter">
        <div class="meter" aria-hidden="true"><span class="meter__fill meter__fill--range" style="--from:${(x.total[0] / x.balance).toFixed(3)};--v:${(x.total[1] / x.balance).toFixed(3)}"></span></div>
        <p class="mono">${esc(t('ex.left', { balance: rp(x.balance), a: rp(x.balance - x.total[1]), b: rp(x.balance - x.total[0]) }))}</p>
      </div>
      <p class="receipt__verdict">${esc(t('ex.verdict', { rp: rp(D.EXAMPLE.topup.amount) }))}</p>
      <a class="btn btn--primary btn--block" href="${href}" data-cursor="Nyala">${esc(t('ex.cta'))}</a>`;
  }
  const ba = $('[data-ba]');
  $('[data-ba-switch]')?.addEventListener('click', (e) => {
    const on = e.currentTarget.getAttribute('aria-checked') !== 'true';
    e.currentTarget.setAttribute('aria-checked', String(on));
    ba.dataset.state = on ? 'after' : 'before';
    $$('.ba-b', ba).forEach((s) => s.toggleAttribute('aria-hidden', on));
    $$('.ba-a', ba).forEach((s) => s.toggleAttribute('aria-hidden', !on));
  });

  /* ---------------------------------------------------------
     Guides (Belajar) + FAQ
     --------------------------------------------------------- */
  function renderGuides() {
    const el = $('[data-guides]');
    if (el) el.innerHTML = D.GUIDES.map((g) => `<a href="app.html#/belajar?panduan=${g.id}">
        <small>${esc(t(`recipe.short.${g.recipe}`))} · ${esc(t('learn.read', { n: g.minutes }))}</small><strong>${esc(t(`learn.${g.id}`))}</strong><span>${esc(t('learn.cta'))} →</span></a>`).join('');
  }
  function renderFaq() {
    const el = $('[data-faq]');
    if (!el) return;
    const open = new Set($$('details[open]', el).map((d) => d.dataset.q));
    const vars = { pause: D.RULES.pauseDays, remind: D.RULES.remindDays, first: rp(D.DOMAINS['my.id'].first), renew: rp(D.DOMAINS['my.id'].renew) };
    el.innerHTML = Array.from({ length: 13 }, (_, i) => i + 1).map((n) => `<details class="faq-item" data-q="${n}" ${open.has(String(n)) ? 'open' : ''}>
      <summary><span class="faq-item__n" aria-hidden="true">${String(n).padStart(2, '0')}</span><span>${esc(t(`faq.q${n}`))}</span><span class="faq-item__plus" aria-hidden="true"></span></summary>
      <p class="faq-item__a">${esc(t(`faq.a${n}`, vars))}</p></details>`).join('');
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

  /* ---------------------------------------------------------
     Final CTA: mega switch → sparks → start building
     --------------------------------------------------------- */
  const mega = $('[data-final-switch]');
  mega?.addEventListener('click', () => {
    const wasOn = mega.getAttribute('aria-pressed') === 'true';
    mega.setAttribute('aria-pressed', 'true');
    if (!wasOn) burst(mega, 22);
    setTimeout(() => { location.href = startHref(state.recipe); }, prefersReducedMotion || wasOn ? 0 : 520);
  });

  /* ---------------------------------------------------------
     Language: static copy swaps by CSS (aria labels + cursor: ui.js); here only the data-driven parts
     --------------------------------------------------------- */
  function render() {
    renderHero();
    renderHow();
    renderTabs();
    renderCard();
    renderServices();
    renderTemplates();
    renderModels();
    renderCatalog();
    renderSafe();
    renderExample();
    renderGuides();
    renderFaq();
    renderConsult();
    syncStartLinks();
    document.dispatchEvent(new CustomEvent('tn:render'));
  }

  /* ---------------------------------------------------------
     Phones: the chat launcher would cover the hero board, so it appears once the hero scrolls away
     --------------------------------------------------------- */
  const launcher = $('#chat-launcher');
  const heroEl = $('#top');
  if (launcher && heroEl && 'IntersectionObserver' in window) {
    const phone = window.matchMedia('(max-width: 639px)');
    let heroVisible = true;
    const sync = () => { const hide = phone.matches && heroVisible; launcher.classList.toggle('is-away', hide); launcher.inert = hide; };
    new IntersectionObserver(([entry]) => { heroVisible = entry.intersectionRatio > 0.35; sync(); }, { threshold: [0, 0.35, 1] }).observe(heroEl);
    phone.addEventListener('change', sync);
  }

  /* ---------------------------------------------------------
     Stall story: build to 80% → stuck on localhost → switch on → 100% online
     --------------------------------------------------------- */
  const stall = $('[data-stall]');
  let stallWasOn = true;
  function renderStall(p) {
    if (!stall) return;
    const fill = p < 0.5 ? (p / 0.5) * 0.8 : p < 0.74 ? 0.8 : 0.8 + Math.min(1, (p - 0.74) / 0.2) * 0.2;
    const phase = p < 0.52 ? 'build' : p < 0.7 ? 'stall' : 'on';
    if (stall.dataset.phase !== phase) stall.dataset.phase = phase;
    $('[data-stall-fill]').style.setProperty('--f', fill.toFixed(4));
    $('[data-stall-pct]').textContent = Math.round(fill * 100);
    $$('[data-stall-tasks] li').forEach((li) => li.classList.toggle('is-done', fill + 0.001 >= parseFloat(li.dataset.at)));
    const on = phase === 'on', sw = $('[data-stall-switch]');
    sw.classList.toggle('big-switch--on', on);
    if (on && !stallWasOn) burst(sw, 12);
    stallWasOn = on;
  }
  renderStall(1); // complete story at rest (no JS motion / reduced motion)

  /* ---------------------------------------------------------
     "Cara kerja" horizontal scroller: drag, wheel, buttons, rail
     --------------------------------------------------------- */
  (function initStepsScroller() {
    const track = $('[data-steps-track]');
    if (!track) return;
    const prev = $('[data-steps-prev]'), next = $('[data-steps-next]'), rail = $('[data-steps-rail]');
    const maxScroll = () => track.scrollWidth - track.clientWidth;
    const update = () => {
      const max = maxScroll(), p = max > 0 ? track.scrollLeft / max : 0;
      rail.style.setProperty('--p', p.toFixed(3));
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max - 4;
    };
    const stepWidth = () => { const s = $('.step', track); return s ? s.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth; };
    const go = (dir) => track.scrollBy({ left: dir * stepWidth(), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    track.addEventListener('keydown', (e) => {
      if (maxScroll() <= 0) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    track.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        e.stopPropagation();
        if (e.shiftKey && !e.deltaX) { e.preventDefault(); track.scrollLeft += e.deltaY; }
      }
    }, { passive: false });
    let startX = 0, startLeft = 0, dragging = false, moved = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || maxScroll() <= 0) return;
      dragging = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) { moved = true; track.classList.add('is-dragging'); }
      if (moved) { e.preventDefault(); track.scrollLeft = startLeft - dx; }
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      if (!moved) return;
      const before = track.scrollLeft;
      track.classList.remove('is-dragging');
      track.scrollLeft = before; // re-enabling snap jumps instantly; animate from where the drag ended instead
      const w = stepWidth(), dx = startLeft - before;
      let idx = Math.round(before / w);
      if (Math.abs(dx) > 60) idx = dx < 0 ? Math.floor(startLeft / w + 0.01) + 1 : Math.ceil(startLeft / w - 0.01) - 1;
      track.scrollTo({ left: Math.max(0, Math.min(maxScroll(), idx * w)), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    track.addEventListener('dragstart', (e) => e.preventDefault());
    update();
  })();

  /* ---------------------------------------------------------
     Preloader + scroll motion (GSAP + ScrollTrigger + Lenis)
     --------------------------------------------------------- */
  const loader = $('#loader');
  function runLoader() {
    return new Promise((resolve) => {
      if (!root.classList.contains('is-loading')) return resolve();
      const countEl = $('#loader-count');
      const start = performance.now(), dur = 1100;
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        countEl.textContent = String(Math.round((1 - Math.pow(1 - p, 3)) * 100)).padStart(3, '0');
        if (p < 1) return requestAnimationFrame(step);
        loader.classList.add('is-on');
        setTimeout(() => {
          const finish = () => { root.classList.remove('is-loading'); loader.remove(); resolve(); };
          if (window.gsap) window.gsap.to(loader, { yPercent: -100, duration: 0.8, ease: 'expo.inOut', onComplete: finish });
          else finish();
        }, 420);
      };
      requestAnimationFrame(step);
    });
  }

  function splitWords(span) {
    const nodes = [...span.childNodes];
    span.innerHTML = '';
    nodes.forEach((node) => {
      const parts = node.nodeType === 3 ? node.textContent.split(/(\s+)/) : [node];
      parts.forEach((part) => {
        if (part === '') return;
        if (typeof part === 'string' && /^\s+$/.test(part)) { span.append(document.createTextNode(' ')); return; }
        const prev = span.lastChild; // text glued to the previous word ("semua" + ",") stays in it
        if (typeof part === 'string' && prev?.classList?.contains('split-word')) { prev.firstChild.append(part); return; }
        const w = document.createElement('span'); w.className = 'split-word';
        const inner = document.createElement('span'); inner.append(part);
        w.append(inner); span.append(w);
      });
    });
  }

  let lenis = null;
  function initMotion() {
    const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger || prefersReducedMotion) return false;
    gsap.registerPlugin(ScrollTrigger);
    root.classList.add('has-gsap', 'motion-ok');
    const EASE = 'expo.out';

    // Smooth scroll; stops while a menu or modal locks the page
    if (window.Lenis) {
      lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      new MutationObserver(() => { if (root.classList.contains('overflow-hidden') || root.classList.contains('is-loading')) lenis.stop(); else lenis.start(); })
        .observe(root, { attributes: true, attributeFilter: ['class'] });
      if (root.classList.contains('is-loading')) lenis.stop();
      document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href^="#"]');
        const id = a?.getAttribute('href');
        if (!id || id.length < 2) return;
        const target = $(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: id === '#top' || id === '#main' ? 0 : -10 });
        if (id === '#main') target.focus({ preventScroll: true });
      });
    }

    // Split [data-split] headings into words (per language span)
    $$('[data-split] > [data-l]').forEach(splitWords);
    $$('[data-split]').forEach((h) => gsap.from($$('.split-word > span', h), {
      yPercent: 110, duration: 1, ease: EASE, stagger: 0.035, scrollTrigger: { trigger: h, start: 'top 85%' },
    }));

    // Hero entrance (plays when the loader leaves)
    const heroTl = gsap.timeline({ paused: true });
    heroTl
      .from('.hero__title .ln > span', { yPercent: 110, duration: 1.1, ease: EASE, stagger: 0.08 })
      .from('.hero__eyebrow, .hero__copy', { y: 30, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.1 }, '-=0.8')
      .from('.board', { x: 80, opacity: 0, rotate: 4, duration: 0.9, ease: EASE }, '-=0.9')
      .from('.sticker', { scale: 0, rotate: -90, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.6')
      .add(() => {
        $$('[data-hero-switch]').forEach((s) => s.classList.add('is-on'));
        burst($(`[data-l="${I.lang}"] [data-hero-switch]`), 10);
      }, '-=0.3');
    gsap.to('.hero__visual', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // Stall story: progress scrubbed by scroll
    renderStall(0);
    ScrollTrigger.create({ trigger: stall, start: 'top 90%', end: 'bottom 40%', scrub: 0.4, onUpdate: (self) => renderStall(self.progress) });

    // Steps slide in; intent + package sheet
    gsap.from('.step', { x: 80, opacity: 0, duration: 1, ease: EASE, stagger: 0.1, scrollTrigger: { trigger: '[data-steps-track]', start: 'top 85%' } });
    gsap.from('.intent', { scaleX: 0.85, opacity: 0, duration: 0.9, ease: EASE, scrollTrigger: { trigger: '.intent', start: 'top 90%' } });
    gsap.from('.pkg-sheet__main > *, .pkg-specs > div', { y: 40, opacity: 0, duration: 0.9, ease: EASE, stagger: 0.05, scrollTrigger: { trigger: '.pkg-sheet', start: 'top 85%' } });

    // Services groups, model rows
    gsap.from('.svc-group', { y: 40, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.08, scrollTrigger: { trigger: '[data-services]', start: 'top 85%' } });
    gsap.from('.mrow', { y: 40, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.06, scrollTrigger: { trigger: '[data-models]', start: 'top 85%' } });
    $$('.display mark').forEach((m) => gsap.fromTo(m, { '--mark': 0 }, { '--mark': 1, duration: 0.8, ease: EASE, scrollTrigger: { trigger: m, start: 'top 80%' } }));

    // Cable draw, tool steps, config card
    const cable = $('#cable-path');
    if (cable) {
      const len = cable.getTotalLength();
      gsap.fromTo(cable, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.tools', start: 'top 70%', end: 'center center', scrub: true } });
    }
    gsap.from('.tool-steps li', { x: -40, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.1, scrollTrigger: { trigger: '.tool-steps', start: 'top 85%' } });
    gsap.from('.config-card', { y: 60, rotate: 6, opacity: 0, duration: 1, ease: EASE, scrollTrigger: { trigger: '.config-card', start: 'top 85%' } });

    // Benefit stack: earlier cards shrink as the next arrives
    const cards = $$('.stack-card');
    cards.forEach((c, i) => {
      if (i === cards.length - 1) return;
      gsap.to(c, { scale: 0.92 + i * 0.015, ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 20%', scrub: true } });
    });

    // Receipt print-in, teams, FAQ
    gsap.from('.receipt__paper', { yPercent: -18, opacity: 0, rotate: -3, duration: 1.1, ease: EASE, scrollTrigger: { trigger: '.receipt', start: 'top 80%' } });
    gsap.from('.teams__list li', { x: 60, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.08, scrollTrigger: { trigger: '.teams__list', start: 'top 85%' } });
    gsap.from('.faq-item', { y: 30, opacity: 0, duration: 0.7, ease: EASE, stagger: 0.04, scrollTrigger: { trigger: '[data-faq]', start: 'top 85%' } });

    // Final CTA
    gsap.from('.final__title .ln > span', { yPercent: 110, duration: 1.1, ease: EASE, stagger: 0.1, scrollTrigger: { trigger: '.final', start: 'top 60%' } });
    gsap.from('.mega-switch', { scale: 0.6, opacity: 0, duration: 0.9, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.final', start: 'top 55%' } });
    ScrollTrigger.create({
      trigger: '.final', start: 'top 30%', once: true,
      onEnter: () => { if (mega.getAttribute('aria-pressed') !== 'true') { mega.setAttribute('aria-pressed', 'true'); burst(mega, 18); } },
    });

    // Footer giant wordmark
    gsap.from('.footer__giant span', { yPercent: 100, duration: 1.2, ease: EASE, stagger: 0.1, scrollTrigger: { trigger: '.footer__giant', start: 'top 95%' } });

    if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    I.onChange(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    window.__heroTl = heroTl;
    TN.motion = { lenis, ScrollTrigger };
    return true;
  }

  function staticOn() {
    $$('[data-hero-switch]').forEach((s) => s.classList.add('is-on'));
    mega?.setAttribute('aria-pressed', 'true');
  }

  I.onChange(render);
  I.init();
  window.TN.landing = { selectRecipe, openCatalog, renderStall, openConsult: (from) => csModal?.open(from), get recipe() { return state.recipe; } };

  function start() {
    const motion = initMotion();
    runLoader().then(() => {
      if (motion && window.__heroTl) window.__heroTl.play();
      else staticOn();
    });
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
