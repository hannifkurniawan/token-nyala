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

  function render() {
    renderHero();
    renderChips();
    renderCard();
    renderServices();
    renderWallet();
    syncStartLinks();
  }

  I.onChange(render);
  I.init();
  window.TN.landing = { selectRecipe, get recipe() { return state.recipe; } };
})();
