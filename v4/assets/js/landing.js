/* TokenNyala v4 — landing page rendering (showcase v2 components). Every number comes from TN.data (rule 9). */
(() => {
  'use strict';
  const D = TN.data;
  const I = TN.i18n;
  const { t, rp, rpK, num } = I;
  const { icon, esc, itemView, fromLine, burst } = TN.ui;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = { recipe: D.RECIPES[0].id };

  /* ---------- Links into the console (information-architecture §5) ---------- */
  const startHref = (id) => (D.recipe(id).aiOnly ? 'app.html#/ai?isi=1' : `app.html#/buat?resep=${id}`);
  const calcHref = (id) => `harga.html?resep=${id}#kalkulator`;
  /** 'Rp34 rb' → '<small>pre Rp</small>34 rb' (big price; textContent stays 'Rp34 rb') */
  const bigRp = (n, pre = '') => { const k = rpK(n); return `<small>${esc(pre)}Rp</small>${esc(k.slice(2))}`; };

  /* ---------- Hero: board numbers, typing prompt, inline switch ---------- */
  function renderHero() {
    const s = D.heroScenario();
    $$('[data-trust-from]').forEach((el) => { el.textContent = t('hero.trust3', { rp: rpK(D.SIZES.coba.price) }); });
    $$('[data-board-left]').forEach((el) => { el.textContent = rp(s.left); });
    $$('[data-board-spent]').forEach((el) => { el.textContent = t('board.spent', { rp: rp(s.spent) }); });
    $$('[data-board-meter]').forEach((el) => el.style.setProperty('--v', (s.left / s.balance).toFixed(3)));
    $$('[data-domain]').forEach((el) => { el.textContent = D.HERO.domain; });
  }

  const PROMPTS = ['board.prompt', 'board.prompt2', 'board.prompt3'];
  const typeEl = $('[data-type-prompt]');
  if (typeEl && !reduced) { // type, pause, delete, next prompt (showcase v2)
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
    setTimeout(() => { ci = 0; deleting = false; tick(); }, 1400);
  }

  const heroSwitch = $('[data-hero-switch]');
  heroSwitch?.addEventListener('click', () => {
    const on = !heroSwitch.hasAttribute('data-on');
    heroSwitch.toggleAttribute('data-on', on);
    if (on) burst(heroSwitch, 12, heroSwitch.closest('.hero'));
  });
  // Static ON without motion (reduced motion, or GSAP missing); motion.js switches it on with a burst.
  if (reduced) heroSwitch?.setAttribute('data-on', '');
  window.addEventListener('load', () => { if (!document.documentElement.classList.contains('motion-ok')) heroSwitch?.setAttribute('data-on', ''); });

  /* ---------- Stall story: build to 80% → stuck on localhost → switch on → 100% online ---------- */
  const stall = $('[data-stall]');
  let stallWasOn = true;
  function renderStall(p) {
    if (!stall) return;
    const fill = p < 0.5 ? (p / 0.5) * 0.8 : p < 0.74 ? 0.8 : 0.8 + Math.min(1, (p - 0.74) / 0.2) * 0.2;
    const phase = p < 0.52 ? 'build' : p < 0.7 ? 'stall' : 'on';
    if (stall.dataset.phase !== phase) stall.dataset.phase = phase;
    $('[data-stall-fill]', stall).style.setProperty('--f', fill.toFixed(4));
    $('[data-stall-pct]', stall).textContent = Math.round(fill * 100);
    $$('[data-stall-tasks] li', stall).forEach((li) => li.toggleAttribute('data-done', fill + 0.001 >= parseFloat(li.dataset.at)));
    const on = phase === 'on', sw = $('[data-stall-switch]', stall);
    sw.toggleAttribute('data-on', on);
    if (on && !stallWasOn) burst(sw, 12);
    stallWasOn = on;
  }
  renderStall(1); // complete story at rest (no JS motion / reduced motion)

  /* ---------- How it works: art + horizontal scroller (drag, wheel, buttons, rail) ---------- */
  function renderHow() {
    const chips = $('[data-how-chips]');
    if (chips) chips.innerHTML = ['portofolio', 'chatbot-wa', 'otomasi-tim'].map((id, i) => `<span class="chip-art ${i === 0 ? 'chip-art--on' : ''}">${esc(t(`recipe.short.${id}`))}</span>`).join('');
    const rc = $('[data-how-receipt]');
    if (rc) {
      const host = D.SIZES[D.HERO.size].price, dom = D.DOMAINS[D.HERO.ext].first;
      rc.innerHTML = [[t('wallet.line.hosting'), rp(host)], [t('wallet.line.domain'), rp(dom)], [t('how.fee'), rp(0)], [t('ex.total'), rp(host + dom)]]
        .map(([a, b]) => `<p><span>${esc(a)}</span><b>${esc(b)}</b></p>`).join('');
    }
  }
  (function initSteps() {
    const track = $('[data-steps-track]');
    if (!track) return;
    const prev = $('[data-steps-prev]'), next = $('[data-steps-next]'), rail = $('[data-steps-rail]');
    const maxScroll = () => track.scrollWidth - track.clientWidth;
    const update = () => {
      const max = maxScroll(), p = max > 0 ? track.scrollLeft / max : 0;
      rail?.style.setProperty('--p', p.toFixed(3));
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max - 4;
    };
    const stepWidth = () => { const s = $('.step', track); return s ? s.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth; };
    const go = (dir) => track.scrollBy({ left: dir * stepWidth(), behavior: reduced ? 'auto' : 'smooth' });
    prev?.addEventListener('click', () => go(-1));
    next?.addEventListener('click', () => go(1));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    track.addEventListener('keydown', (e) => {
      if (maxScroll() <= 0) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    // Horizontal wheel / trackpad stays inside the track (smooth scroll must not swallow it)
    track.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        e.stopPropagation();
        if (e.shiftKey && !e.deltaX && maxScroll() > 0) { e.preventDefault(); track.scrollLeft += e.deltaY; }
      }
    }, { passive: false });
    // Mouse drag (touch swipes natively)
    let startX = 0, startLeft = 0, dragging = false, moved = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || maxScroll() <= 0) return;
      dragging = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) { moved = true; track.setAttribute('data-dragging', ''); }
      if (moved) { e.preventDefault(); track.scrollLeft = startLeft - dx; }
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      if (!moved) return;
      const before = track.scrollLeft, w = stepWidth(), dx = startLeft - before;
      track.removeAttribute('data-dragging');
      track.scrollLeft = before; // re-enabling snap jumps; animate from where the drag ended instead
      let idx = Math.round(before / w);
      if (Math.abs(dx) > 60) idx = dx < 0 ? Math.floor(startLeft / w + 0.01) + 1 : Math.ceil(startLeft / w - 0.01) - 1;
      track.scrollTo({ left: Math.max(0, Math.min(maxScroll(), idx * w)), behavior: reduced ? 'auto' : 'smooth' });
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    track.addEventListener('dragstart', (e) => e.preventDefault());
    update();
  })();

  /* ---------- Recipe: intent control (radiogroup, arrow keys; technical-spec §7) + package sheet ---------- */
  const chipsRoot = $('[data-recipe-chips]');
  const card = $('[data-recipe-card]');
  const live = $('[data-recipe-live]');
  const recipeHint = (r) => (r.aiOnly ? t('hero.trust3', { rp: rpK(D.AI_ONLY[0].amount) }) : `≈ ${rpK(D.recipeTotals(r.items).perMonth)}${t('label.perMonth')}`);

  function renderChips() {
    if (!chipsRoot) return;
    chipsRoot.innerHTML = '<span class="intent__marker" aria-hidden="true"></span>' + D.RECIPES.map((r) => {
      const on = r.id === state.recipe;
      return `<button type="button" role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}" data-recipe="${r.id}" aria-controls="recipe-card" class="intent__tab">
        <span class="intent__label">${esc(t(`recipe.short.${r.id}`))}</span><span class="intent__hint">${esc(recipeHint(r))}</span></button>`;
    }).join('');
    syncMarker();
  }
  function syncMarker() { chipsRoot?.style.setProperty('--i', D.RECIPES.findIndex((r) => r.id === state.recipe)); }

  const spec = (dt, dd) => `<div><dt>${esc(dt)}</dt><dd>${dd}</dd></div>`;
  const payCues = '<ul class="pay-cues text-white/80"><li>QRIS</li><li>E-wallet</li><li>Virtual account</li></ul>';

  function renderCard() {
    if (!card) return;
    const r = D.recipe(state.recipe);
    const name = t(`recipe.name.${r.id}`);
    if (r.aiOnly) {
      card.innerHTML = `
        <div class="pkg-sheet__main">
          <p class="pkg-sheet__kicker">${esc(t('recipe.aiOnlyTitle'))}</p>
          <h3 id="recipe-name" class="pkg-sheet__name">${esc(name)}</h3>
          <p class="pkg-sheet__price">${bigRp(D.AI_ONLY[0].amount, t('recipe.from') + ' ')}</p>
          <p class="pkg-sheet__line">${esc(t(`recipe.desc.${r.id}`))}</p>
        </div>
        <div class="pkg-sheet__side">
          <dl class="pkg-specs" aria-label="${esc(t('recipe.itemsAria'))}">${D.AI_ONLY.map((row) => spec(rp(row.amount), esc(t('recipe.sessions', { range: row.range })))).join('')}</dl>
          <a class="btn btn--yellow btn--xl w-full" data-magnetic href="${startHref(r.id)}">${esc(t('recipe.aiOnlyCta'))}${icon('arrow-right', 'icon icon-go size-5')}</a>
          ${payCues}
        </div>`;
      return;
    }
    const tot = D.recipeTotals(r.items);
    const suggestKey = tot.months === 1 ? 'recipe.suggest.one' : 'recipe.suggest.many';
    const cover = Math.min(1, tot.firstMonth / (tot.suggest.amount + tot.suggest.bonus));
    card.innerHTML = `
      <div class="pkg-sheet__main">
        <p class="pkg-sheet__kicker">${esc(t('recipe.approx'))} <span aria-hidden="true">→</span> ${esc(t(`recipe.short.${r.id}`))}</p>
        <h3 id="recipe-name" class="pkg-sheet__name">${esc(name)}</h3>
        <p class="pkg-sheet__price">${bigRp(tot.perMonth, '≈ ')}<em>${esc(t('label.perMonth'))}</em></p>
        <p class="pkg-sheet__line">${esc(t(`recipe.desc.${r.id}`))}</p>
        ${tot.firstMonth > tot.perMonth ? `<p class="pkg-sheet__note">${esc(t('recipe.firstMonth', { rp: rp(tot.firstMonth) }))}</p>` : ''}
        <div class="pkg-sheet__meter">
          <div class="meter meter--xl" style="--v:${cover.toFixed(3)}" aria-hidden="true"><i></i><span class="meter__spark"></span></div>
          <p><strong>${esc(t(suggestKey, { rp: rp(tot.suggest.amount), n: tot.months }))}</strong> · ${esc(t('recipe.suggestNote', { rp: rp(tot.suggest.amount + tot.suggest.bonus) }))}</p>
        </div>
      </div>
      <div class="pkg-sheet__side">
        <dl class="pkg-specs" aria-label="${esc(t('recipe.itemsAria'))}">${r.items.map((it) => {
          const v = itemView(it);
          return spec(v.name, esc(v.detail) + (v.estimate ? ` <span class="ml-1 rounded-full bg-white/15 px-2 py-0.5 font-mono text-[.7rem] font-medium uppercase">${esc(t('label.estimate'))}</span>` : ''));
        }).join('')}</dl>
        <dl class="pkg-specs pkg-specs--cost" aria-label="${esc(t('recipe.costsAria'))}">
          ${spec(t('cost.fixed'), esc(rp(tot.fixed)))}${spec(t('cost.usage'), esc('±' + rp(tot.usage)))}${tot.yearly ? spec(t('cost.yearly'), esc(rp(tot.yearly))) : ''}
        </dl>
        <a class="btn btn--yellow btn--xl w-full" data-magnetic href="${startHref(r.id)}">${esc(t('recipe.cta'))}${icon('arrow-right', 'icon icon-go size-5')}</a>
        <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <a class="link-arrow" href="${calcHref(r.id)}">${esc(t('recipe.edit'))}${icon('arrow-up-right', 'icon size-4')}</a>${payCues}
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
    $$('[data-start]').forEach((a) => { a.href = startHref(state.recipe); });
  }

  function selectRecipe(id, { focus = false } = {}) {
    state.recipe = id;
    chipsRoot?.querySelectorAll('[role=radio]').forEach((b) => {
      const on = b.dataset.recipe === id;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) { b.focus(); b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    });
    syncMarker();
    renderCard();
    if (card && !reduced) { card.removeAttribute('data-swap'); void card.offsetWidth; card.setAttribute('data-swap', ''); }
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

  /* ---------- All services: index rows per group ---------- */
  function renderServices() {
    const root = $('[data-services]');
    if (!root) return;
    root.innerHTML = D.GROUPS.map((g, gi) => `
      <section class="svc-group" aria-labelledby="svc-g-${g.id}">
        <h3 id="svc-g-${g.id}" class="svc-group__head"><span><span class="text-muted">(0${gi + 1})</span> ${esc(t(`svc.group.${g.id}`))}</span></h3>
        <ul class="row-index">${g.services.map((id) => {
          const [main, sub] = fromLine(id);
          return `<li class="irow svc-row" id="svc-${id}"><div class="irow__in">
            <span class="irow__icon" aria-hidden="true">${icon(D.ICONS[id])}</span>
            <div class="min-w-0"><h4 class="irow__name text-[clamp(1.4rem,calc(2.8*var(--u)),2.6rem)]">${esc(t(`svc.${id}.name`))}</h4>
              <p class="irow__small mt-1.5">${esc(t(`svc.${id}.tech`))}</p></div>
            <p class="svc-row__desc irow__meta text-[1rem]">${esc(t(`svc.${id}.desc`))}</p>
            <p class="svc-row__price"><span class="irow__big block text-[clamp(1.1rem,calc(1.7*var(--u)),1.5rem)] whitespace-normal tracking-[-.02em]">${esc(main)}</span>${sub ? `<span class="irow__small mt-1 block">${esc(sub)}</span>` : ''}</p>
          </div></li>`;
        }).join('')}</ul>
      </section>`).join('');
  }

  /* ---------- One balance: mini dashboard (services-and-pricing §7) ---------- */
  function renderWallet() {
    const root = $('[data-wallet]');
    if (!root) return;
    const s = D.heroScenario();
    const label = { hosting: t('wallet.line.hosting'), domain: t('wallet.line.domain') };
    root.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="tier tier--premium">${esc(t('board.note'))}</span>
        <span class="font-mono text-[.78rem] text-muted">${esc(t('wallet.card'))}</span></div>
      <div class="grid gap-1.5">
        <p class="font-mono text-[.78rem] text-muted">${esc(t('wallet.in', { rp: rp(D.HERO.topup.amount), bonus: rp(D.HERO.topup.bonus) }))}</p>
        <p class="flex items-end justify-between gap-4"><span class="font-bold">${esc(t('wallet.balance'))}</span>
          <strong class="num text-[clamp(2.2rem,calc(4*var(--u)),3.4rem)] leading-none font-extrabold">${esc(rp(s.balance))}</strong></p>
        <div class="meter mt-2" style="--v:${(s.left / s.balance).toFixed(3)}" aria-hidden="true"><i></i></div>
      </div>
      <ul class="grid grid-cols-1">${s.lines.map((l) => `
        <li class="flex items-center gap-3 border-t border-line py-3">
          <span class="grid size-9 shrink-0 place-items-center rounded-full bg-paper text-xl-blue">${icon(D.ICONS[l.svc], 'icon size-5')}</span>
          <span class="min-w-0 flex-1 font-bold">${esc(l.svc === 'ai' ? t('wallet.line.ai', { n: l.qty }) : label[l.svc])}</span>
          <span class="num font-mono whitespace-nowrap">${esc(rp(-l.amount))}</span></li>`).join('')}
      </ul>
      <div class="flex items-baseline justify-between gap-4 border-t-2 border-xl-dark pt-4">
        <span class="font-bold">${esc(t('wallet.left'))}</span>
        <span class="num text-[1.8rem] leading-none font-extrabold text-teal-ink">${esc(rp(s.left))}</span></div>
      <p class="text-[.88rem] text-muted">${esc(t('wallet.leftNote'))}</p>`;
  }

  /* ---------- Templates (services-and-pricing §5.4) ---------- */
  const TEMPLATE_ORDER = ['wa-bot', 'n8n', 'agent', 'dify', 'wordpress'];
  function renderTemplates() {
    const root = $('[data-templates]');
    if (!root) return;
    root.innerHTML = TEMPLATE_ORDER.map((id, i) => {
      const d = D.TEMPLATES[id].def;
      const name = t(`tpl.${id}.name`);
      const cost = d.unit
        ? t('tpl.costAi', { rp: rpK(D.templateCost(id)), qty: t(`unit.${d.unit}`, { n: num(d.qty) }) })
        : t('tpl.cost', { rp: rpK(D.templateCost(id)) });
      return `<li class="tpl-card ${i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'}" data-reveal>
        <div class="flex items-start justify-between gap-3">
          <span class="grid size-14 place-items-center rounded-2xl ${['bg-xl-blue text-white', 'bg-xl-dark text-xl-yellow', 'bg-xl-sky', 'bg-xl-teal', 'bg-xl-yellow'][i]}">${icon(D.TEMPLATE_ICONS[id], 'icon size-7')}</span>
          <span class="tpl-card__n" aria-hidden="true">0${i + 1} / 0${TEMPLATE_ORDER.length}</span>
        </div>
        <div><h3>${esc(name)}</h3><p class="mt-1.5 font-mono text-[.75rem] text-muted">${esc(t(`tpl.${id}.tech`))}</p></div>
        <p class="text-lead-ink">${esc(t(`tpl.${id}.desc`))}</p>
        <p class="w-fit rounded-full bg-paper px-3 py-1.5 font-mono text-[.72rem]">${esc(t('tpl.min', { size: t(`size.${D.templateMin(id)}`) }))}</p>
        <p class="mt-auto border-t border-line pt-4 text-[1.1rem] font-extrabold tracking-[-.02em]">${esc(cost)}</p>
        <a class="btn btn--outline-dark w-full" href="app.html#/buat?template=${id}" aria-label="${esc(t('tpl.ctaAria', { name }))}">${esc(t('tpl.cta'))}${icon('arrow-right', 'icon icon-go size-5')}</a>
      </li>`;
    }).join('');
  }

  /* ---------- AI model index (showcase .mrow) ---------- */
  function modelRow(m) {
    return `<li class="irow mrow"><details>
      <summary class="irow__in">
        <span class="irow__icon" aria-hidden="true"><img src="assets/img/models/${D.PROVIDER_ICON[m.provider]}.svg" alt="" width="26" height="26" class="size-[26px]" loading="lazy" decoding="async"></span>
        <span class="irow__name">${esc(m.name)}</span>
        <span class="irow__meta">${esc([m.provider, ...m.uses.map((u) => t(`use.${u}`))].join(' · '))}</span>
        <span class="mrow__tier tier tier--${m.tier}">${esc(t(`tier.${m.tier}`))}</span>
        <span class="mrow__per"><strong class="irow__big block">≈ ${m.per10k}</strong><span class="irow__small">${esc(t('model.unit', { rp: rp(10000) }))}</span></span>
        <span class="irow__more">${esc(t('model.rates'))}</span>
      </summary>
      <div class="irow__rates">
        <p>${esc(t('rate.caption'))}</p>
        <dl><div><dt>${esc(t('rate.input'))}</dt><dd>${esc(t('rate.unit', { n: num(m.in) }))}</dd></div>
          <div><dt>${esc(t('rate.output'))}</dt><dd>${esc(t('rate.unit', { n: num(m.out) }))}</dd></div>
          <div><dt>${esc(t('rate.context'))}</dt><dd>${esc(t('rate.ctx', { n: compact(m.ctx) }))}</dd></div></dl>
      </div></details></li>`;
  }
  function renderModelRows() {
    const root = $('[data-models]');
    if (root) root.innerHTML = D.PREVIEW_MODELS.map((id) => modelRow(D.MODELS.find((m) => m.id === id))).join('');
  }

  /* ---------- Catalogue dialog (v3 model cards) + API config ---------- */
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
  function renderApi() {
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

  /* ---------- Example project: receipt paper (services-and-pricing §7) + before/after ---------- */
  function renderExample() {
    const root = $('[data-example]');
    if (!root) return;
    const x = D.exampleTotals();
    const range = (a, b) => `${rp(a)}–${num(b)}`;
    const href = `app.html#/buat?resep=portofolio&s=${D.serialize([{ svc: 'hosting', size: D.EXAMPLE.size }, { svc: 'domain', ext: D.EXAMPLE.ext }, { svc: 'ai', unit: 'sesi', qty: D.HERO.sessions }])}`;
    const line = (title, detail, cost, extra = '') => `<li class="border-b border-dashed border-line py-3">
      <div class="flex items-baseline justify-between gap-3"><span class="font-bold">${esc(title)}</span><span class="num font-mono whitespace-nowrap">${esc(cost)}</span></div>
      <p class="text-[.92rem] text-lead-ink">${esc(detail)}</p>${extra}</li>`;
    const tasks = `<details class="group/d"><summary class="flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-[.92rem] font-bold text-xl-blue [&::-webkit-details-marker]:hidden">${icon('chevron-right', 'icon size-4 transition-transform group-open/d:rotate-90')}<span>${esc(t('ex.tasksSummary'))}</span></summary>
      <dl class="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 pb-1 text-[.9rem]">${D.EXAMPLE.tasks.map((r, i) => `<dt>${esc(t(`ex.task${i + 1}`))}</dt><dd class="text-right font-mono">${r[0]}–${r[1]}</dd>`).join('')}</dl></details>`;
    root.innerHTML = `
      <p class="receipt__head"><span>${esc(t('ex.project'))}</span><span>${esc(t('board.note'))}</span></p>
      <ol aria-label="${esc(t('ex.stagesAria'))}">
        ${line(t('ex.build'), t('ex.buildDetail', { a: x.sessions[0], b: x.sessions[1] }), range(...x.usage), tasks)}
        ${line(t('svc.hosting.name'), t('ex.online', { size: t(`size.${D.EXAMPLE.size}`) }), rp(x.hosting))}
        ${line(t('svc.domain.name'), t('ex.domain', { domain: D.EXAMPLE.domain }), rp(x.domain))}
      </ol>
      <p class="receipt__total"><span>${esc(t('ex.total'))}</span><strong>${esc(range(...x.total))}</strong></p>
      <div><div class="meter" aria-hidden="true"><span class="meter__range" style="--from:${(x.total[0] / x.balance).toFixed(3)};--to:${(x.total[1] / x.balance).toFixed(3)}"></span></div>
        <p class="mt-2 font-mono text-[.75rem] text-muted">${esc(t('ex.left', { balance: rp(x.balance), a: rp(x.balance - x.total[1]), b: rp(x.balance - x.total[0]) }))}</p></div>
      <p class="receipt__verdict">${esc(t('ex.verdict', { rp: rp(D.EXAMPLE.topup.amount) }))}</p>
      <a class="btn btn--xl w-full" data-magnetic href="${href}">${esc(t('ex.cta'))}${icon('arrow-right', 'icon icon-go size-5')}</a>`;
  }
  const ba = $('[data-ba]');
  $('[data-ba-switch]')?.addEventListener('click', (e) => {
    const on = e.currentTarget.getAttribute('aria-checked') !== 'true';
    e.currentTarget.setAttribute('aria-checked', String(on));
    ba.dataset.state = on ? 'after' : 'before';
    $$('.ba-b', ba).forEach((el) => el.toggleAttribute('aria-hidden', on));
    $$('.ba-a', ba).forEach((el) => el.toggleAttribute('aria-hidden', !on));
  });

  /* ---------- Safe for beginners: sticky stack, numbers from billing rules ---------- */
  function renderSafe() {
    const root = $('[data-safe]');
    if (!root) return;
    const price = D.SIZES.coba.price, daysLeft = 20;
    const art = [
      `<span class="talk talk--q">${esc(t('safe.1.q'))}</span><span class="talk talk--a">${esc(t('safe.1.art', { rp: rp(D.refund(price, daysLeft)) }))}</span>`,
      `<span class="pill-art">${esc(t('size.rutin'))}</span><span class="text-3xl font-extrabold" aria-hidden="true">→</span><span class="pill-art bg-xl-dark text-xl-yellow">${esc(t('size.coba'))}</span>
       <span class="pill-art pill-art--solid basis-full sm:basis-auto">${esc(t('safe.2.art', { from: t('size.rutin'), to: t('size.coba'), rp: rp(-D.prorata(D.SIZES.rutin.price, price, daysLeft)) }))}</span>`,
      `<span class="big-switch big-switch--xl" aria-hidden="true"><i></i></span><span class="pill-art pill-art--solid flex flex-wrap items-center gap-3"><span class="rounded-full bg-xl-yellow px-2.5 py-0.5 font-mono text-[.8rem] font-medium">${esc(t('status.paused'))}</span>${esc(t('safe.3.art', { n: D.RULES.pauseDays }))}</span>`,
    ];
    const bg = ['bg-xl-sky', 'bg-xl-yellow on-yellow', 'bg-xl-teal', 'bg-xl-blue text-white'];
    const head = (i) => `<div><h3>${esc(t(`safe.${i + 1}.title`))}</h3><p class="stack-card__body">${esc(t(`safe.${i + 1}.body`, { n: i === 2 ? D.RULES.pauseDays : D.RULES.remindDays }))}</p></div>`;
    const dash = `<div class="grid gap-4 rounded-3xl bg-paper p-5 text-xl-dark sm:p-6">
        <div class="flex items-center justify-between gap-3"><span class="tier tier--premium">${esc(t('board.note'))}</span>${icon('bell', 'icon size-5 text-xl-blue')}</div>
        <div class="flex items-center justify-between gap-4 border-b border-line pb-4 font-bold"><span>${esc(t('safe.4.remind'))}</span><span class="toggle" data-on aria-hidden="true"><i></i></span></div>
        <p class="rounded-2xl bg-xl-yellow px-4 py-3 font-bold">${esc(t('safe.4.art', { n: D.RULES.remindDays, rp: rp(D.TOPUP_MIN) }))}</p></div>`;
    root.innerHTML = bg.map((b, i) => `<li class="stack-card ${b}" style="--n:${i}" data-stack>
      <p class="font-mono text-[.85rem]">0${i + 1} / 0${bg.length}</p>
      ${i === 3 ? `<div class="stack-card__split">${head(i)}${dash}</div>` : `${head(i)}<div class="stack-card__art">${art[i]}</div>`}
    </li>`).join('');
  }

  /* ---------- Learn guides: index rows ---------- */
  function renderGuides() {
    const root = $('[data-guides]');
    if (!root) return;
    root.innerHTML = D.GUIDES.map((g) => {
      const title = t(`learn.${g.id}`);
      return `<li class="irow"><a class="irow__in guide-row" href="app.html#/belajar?panduan=${g.id}">
        <span class="irow__icon" aria-hidden="true">${icon('book-open')}</span>
        <span class="min-w-0"><span class="irow__small block">${esc(t(`recipe.short.${g.recipe}`))}</span><span class="irow__name mt-1 block text-[clamp(1.4rem,calc(2.8*var(--u)),2.6rem)]">${esc(title)}</span></span>
        <span class="irow__meta inline-flex items-center gap-2">${icon('clock', 'icon size-4')}${esc(t('learn.read', { n: g.minutes }))}</span>
        <span class="irow__more inline-flex items-center gap-1">${esc(t('learn.cta'))}${icon('arrow-right', 'icon size-4')}</span></a></li>`;
    }).join('');
  }

  /* ---------- FAQ (13) ---------- */
  function renderFaq() {
    const root = $('[data-faq]');
    if (!root) return;
    const open = new Set($$('details[open]', root).map((d) => d.dataset.q));
    const vars = { pause: D.RULES.pauseDays, remind: D.RULES.remindDays, first: rp(D.DOMAINS['my.id'].first), renew: rp(D.DOMAINS['my.id'].renew) };
    root.innerHTML = Array.from({ length: 13 }, (_, i) => i + 1).map((n) => `<details class="faq-item" data-q="${n}" ${open.has(String(n)) ? 'open' : ''}>
      <summary><span class="faq-item__n" aria-hidden="true">${String(n).padStart(2, '0')}</span><span>${esc(t(`faq.q${n}`))}</span><span class="faq-item__plus" aria-hidden="true"></span></summary>
      <p class="faq-item__a">${esc(t(`faq.a${n}`, vars))}</p></details>`).join('');
  }

  /* ---------- Final CTA: mega switch → sparks → start building ---------- */
  const mega = $('[data-final-switch]');
  mega?.addEventListener('click', () => {
    const wasOn = mega.hasAttribute('data-on');
    mega.setAttribute('data-on', '');
    if (!wasOn) burst(mega, 22, $('[data-sparks]'));
    setTimeout(() => { location.href = startHref(state.recipe); }, reduced || wasOn ? 0 : 520);
  });
  if (reduced) mega?.setAttribute('data-on', '');
  window.addEventListener('load', () => { if (!document.documentElement.classList.contains('motion-ok')) mega?.setAttribute('data-on', ''); });

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
    renderHow();
    renderChips();
    renderCard();
    renderServices();
    renderWallet();
    renderTemplates();
    renderModelRows();
    renderApi();
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
  window.TN.landing = { selectRecipe, openCatalog, renderStall, openConsult: (from) => csModal?.open(from), get recipe() { return state.recipe; } };
})();
