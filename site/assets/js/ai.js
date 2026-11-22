/* TokenNyala v4 — console: API AI page #/ai (wireframe C7). Tabs: quick start · models · usage · API keys.
   The chat ("Coba AI" tab until 22 Nov 2026) is its own menu now: #/chat (chat.js); #/ai?tab=coba redirects there.
   Usage chart follows the dataviz skill: one series (no legend box), columns ≤ 24px with a 4px rounded cap and a square
   base, 1px recessive grid, one selective value label (the highest day), hover + keyboard-focus tooltip, table view. */
(() => {
  'use strict';
  const D = TN.data;
  const I = TN.i18n;
  const S = TN.store;
  const C = TN.console;
  const { t, rp, num } = I;
  const { icon, esc } = TN.ui;
  const { h1, kicker, toast, dateStr } = C;
  const view = C.view;
  const TABS = ['mulai', 'model', 'pemakaian', 'key'];
  const TAB_KEY = { mulai: 'ai.tab.start', model: 'ai.tab.models', pemakaian: 'ai.tab.usage', key: 'ai.tab.keys' };
  const TIER_STYLE = { hemat: 'bg-xl-teal text-xl-dark', seimbang: 'bg-xl-sky text-xl-dark', premium: 'bg-xl-yellow text-xl-dark' };
  const LIMITS = [25000, 50000, 100000, 0];
  const limitName = (v) => (v ? rp(v) : t('limit.none'));
  const tabOf = (r) => (TABS.includes(r.q.get('tab')) ? r.q.get('tab') : 'mulai');
  const ui = { keyFor: null };

  C.ROUTES.ai = {
    title: () => t('nav.api'),
    html: (r) => {
      if (r.q.get('tab') === 'coba') { setTimeout(() => location.replace('#/chat'), 0); return ''; } // old link → Chat AI
      const tab = tabOf(r);
      const tabs = `<div class="no-scrollbar mt-6 overflow-x-auto border-b border-line"><div role="tablist" aria-label="${esc(t('ai.tabsAria'))}" class="flex w-max gap-1" data-tabs>${TABS.map((x) => `<button type="button" role="tab" id="tab-${x}" aria-selected="${x === tab}" aria-controls="panel-${x}" tabindex="${x === tab ? 0 : -1}" data-tab="${x}"
        class="min-h-11 min-w-11 shrink-0 border-b-[3px] border-transparent px-3 font-bold whitespace-nowrap text-muted aria-selected:border-xl-yellow aria-selected:text-xl-dark">${esc(t(TAB_KEY[x]))}</button>`).join('')}</div></div>`;
      const panel = { mulai: panelStart, model: panelModels, pemakaian: panelUsage, key: panelKeys }[tab]();
      return `<div data-ai-root>${h1(t('nav.api'), t('ai.pageLead'))}${tabs}<div id="panel-${tab}" role="tabpanel" aria-labelledby="tab-${tab}" tabindex="0" class="mt-6 focus:outline-none">${panel}</div></div>`;
    },
    mount: (r) => { if (view.querySelector('[data-ai-root]')) mount(r); },
  };

  /* ---------- Quick start ---------- */
  function keyOptions() {
    const ps = S.state.projects.filter((p) => S.projectView(p).status !== 'berhenti');
    return [...ps.map((p) => ({ id: p.id, label: p.name, key: p.key })), { id: '', label: t('ai.accountKey'), key: S.accountKey() }];
  }
  function panelStart() {
    const opts = keyOptions();
    if (ui.keyFor === null || !opts.some((o) => o.id === ui.keyFor)) ui.keyFor = opts[0].id;
    const cur = opts.find((o) => o.id === ui.keyFor);
    const masked = cur.key.slice(0, 8) + '••••••••' + cur.key.slice(-4);
    const steps = [1, 2, 3].map((n) => `<li class="flex gap-4"><span class="grid size-10 shrink-0 place-items-center rounded-full bg-xl-yellow font-mono" aria-hidden="true">${n}</span><div class="pt-1"><h3 class="font-extrabold">${esc(t(`guide.${n}.title`))}</h3><p class="text-lead-ink">${esc(t(`guide.${n}.body`))}</p></div></li>`).join('');
    return `<div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section class="card p-5 sm:p-6" aria-labelledby="qs-title"><h2 id="qs-title" class="font-extrabold">${esc(t('config.title'))}</h2>
        <label for="ai-keyfor" class="mt-4 block text-[.92rem] font-bold">${esc(t('ai.keyFor'))}</label>
        <select id="ai-keyfor" class="field mt-1.5" data-keyfor>${opts.map((o) => `<option value="${esc(o.id)}" ${o.id === ui.keyFor ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>
        <dl class="mt-4 grid grid-cols-1 gap-4">
          <div><dt class="font-mono text-[.72rem] tracking-[.08em] text-muted uppercase">Base URL</dt>
            <dd class="mt-1.5 flex flex-col items-start gap-2 rounded-control bg-paper p-3 sm:flex-row sm:items-center"><code class="min-w-0 flex-1 font-mono text-xl-blue [overflow-wrap:anywhere]">${esc(D.API.baseUrl)}</code>
              <button type="button" class="btn btn--ghost min-h-11 shrink-0 px-4" data-copy="${esc(D.API.baseUrl)}" aria-label="${esc(t('copy.url'))}">${icon('copy', 'icon size-4')}<span data-copy-label>${esc(t('copy.label'))}</span></button></dd></div>
          <div><dt class="font-mono text-[.72rem] tracking-[.08em] text-muted uppercase">API key</dt>
            <dd class="mt-1.5 flex flex-col items-start gap-2 rounded-control bg-paper p-3 sm:flex-row sm:items-center"><code class="min-w-0 flex-1 font-mono [overflow-wrap:anywhere]">${esc(masked)}</code>
              <button type="button" class="btn btn--ghost min-h-11 shrink-0 px-4" data-copy="${esc(cur.key)}" aria-label="${esc(t('copy.key'))}">${icon('copy', 'icon size-4')}<span data-copy-label>${esc(t('copy.label'))}</span></button></dd></div>
        </dl>
        ${S.state.balance <= 0 ? `<p class="mt-4 rounded-control bg-xl-yellow/30 px-3 py-2 font-bold">${esc(t('ai.noBalance'))}</p><button type="button" class="btn mt-3" data-topup>${esc(t('cta.topup'))}</button>` : ''}
        <p class="mt-4 text-[.85rem] text-muted">${esc(t('config.note'))}</p></section>
      <section aria-labelledby="qs-steps"><h2 id="qs-steps">${kicker(t('guide.kicker'))}</h2><ol class="mt-3 grid grid-cols-1 gap-5">${steps}</ol>
        <p class="mt-6 text-[.92rem] text-lead-ink">${esc(t('config.compat'))}</p>
        <ul class="mt-2 flex flex-wrap gap-2 font-bold" aria-label="${esc(t('config.toolsAria'))}">${['Cursor', 'Lovable', 'Cline', 'Continue'].map((x) => `<li class="rounded-full border border-line bg-white px-3 py-1">${x}</li>`).join('')}</ul></section></div>`;
  }

  /* ---------- Models ---------- */
  function panelModels() {
    return `<ul class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">${D.MODELS.map((m) => `<li class="card flex flex-col gap-2 p-4">
      <div class="flex items-center gap-3"><span class="grid size-10 shrink-0 place-items-center rounded-full bg-white ring-1 ring-line" aria-hidden="true"><img src="assets/img/models/${D.PROVIDER_ICON[m.provider]}.svg" alt="" width="22" height="22" class="size-[22px]" loading="lazy"></span>
        <h2 class="min-w-0 flex-1 font-extrabold">${esc(m.name)}</h2><span class="shrink-0 rounded-full px-2.5 py-1 font-mono text-[.72rem] font-medium ${TIER_STYLE[m.tier]}">${esc(t(`tier.${m.tier}`))}</span></div>
      <p class="text-[.88rem] text-muted">${esc([m.provider, ...m.uses.map((u) => t(`use.${u}`))].join(' · '))}</p>
      <p class="flex flex-wrap items-baseline gap-x-2"><span class="num font-mono text-xl">≈ ${m.per10k}</span><span class="text-[.88rem] font-bold text-muted">${esc(t('model.unit', { rp: rp(10000) }))}</span></p>
      <p class="text-[.88rem] font-bold text-lead-ink">${esc(t('chatp.reads', { list: m.reads.length ? [t('chatp.text'), ...m.reads.map((k) => t(`chatp.kind.${k}`))].join(' · ') : t('chatp.textOnly') }))}</p>
      <p class="font-mono text-[.78rem] text-muted">${esc(t('rate.input'))} ${esc(t('rate.unit', { n: num(m.in) }))} · ${esc(t('rate.output'))} ${esc(t('rate.unit', { n: num(m.out) }))}</p></li>`).join('')}</ul>
      <p class="mt-4 text-[.85rem] text-muted">${esc(t('ai.note'))}</p>`;
  }

  /* ---------- Usage: 7-day column chart + table view ---------- */
  function usageDays() {
    const days = Array.from({ length: 7 }, (_, i) => S.addDays(S.state.clock, i - 6));
    return days.map((d) => ({ date: d, amount: S.state.history.filter((h) => h.type === 'usage' && h.date === d).reduce((n, h) => n - h.amount, 0) }));
  }
  const niceMax = (v) => { if (v <= 0) return 1000; const p = 10 ** Math.floor(Math.log10(v)); return Math.ceil(v / p) * p; };
  function panelUsage() {
    const days = usageDays();
    const total = days.reduce((n, d) => n + d.amount, 0);
    const c = S.costs();
    const max = niceMax(Math.max(...days.map((d) => d.amount)));
    const top = days.reduce((a, b) => (b.amount > a.amount ? b : a), days[0]);
    const ticks = [0, max / 2, max];
    const byProject = S.state.projects.map((p) => {
      const month = S.state.clock.slice(0, 7);
      return { name: p.name, amount: S.state.history.filter((h) => h.type === 'usage' && h.project === p.id && h.date.startsWith(month)).reduce((n, h) => n - h.amount, 0) };
    }).filter((x) => x.amount > 0);
    const chart = `<figure class="card p-4 sm:p-6" aria-labelledby="chart-title">
        <figcaption id="chart-title" class="font-extrabold">${esc(t('ai.usage.title'))}</figcaption>
        <div class="relative mt-6 h-48 pl-12" data-chart>
          ${ticks.map((v) => `<div class="pointer-events-none absolute inset-x-0 border-t border-line" style="bottom:${(v / max) * 100}%" aria-hidden="true"><span class="absolute -top-2.5 left-0 w-10 text-right font-mono text-[.7rem] text-muted">${esc(v >= 1000 ? `${num(v / 1000)}${I.lang === 'en' ? 'K' : ' rb'}` : num(v))}</span></div>`).join('')}
          <div class="relative grid h-full grid-cols-7 items-end gap-0.5 rounded-control focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-xl-yellow" role="group" tabindex="0"
            aria-label="${esc(t('ai.usage.title'))}. ${esc(t('ai.usage.keys'))}" aria-describedby="chart-live" data-plot>${days.map((d, i) => {
            const h = d.amount ? Math.max(2, (d.amount / max) * 100) : 0;
            const label = t('ai.usage.tip', { date: dateStr(d.date), rp: rp(d.amount) });
            return `<div class="group relative flex h-full items-end justify-center" data-bar="${i}" data-label="${esc(label)}" data-decor-overflow>
              <span class="w-full max-w-6 rounded-t-[4px] bg-xl-blue group-hover:bg-xl-dark group-data-active:bg-xl-dark" style="height:${h}%"></span>
              ${d === top && d.amount ? `<span class="absolute font-mono text-[.72rem] font-medium whitespace-nowrap text-xl-dark" style="bottom:calc(${h}% + 4px)" aria-hidden="true">${esc(rp(d.amount))}</span>` : ''}
              <span role="tooltip" class="pointer-events-none absolute bottom-[calc(100%+6px)] z-10 hidden rounded-control bg-xl-dark px-2.5 py-1.5 text-[.8rem] font-bold whitespace-nowrap text-white group-hover:block group-data-active:block ${i < 2 ? 'left-0' : i > 4 ? 'right-0' : ''}">${esc(label)}</span>
            </div>`;
          }).join('')}</div><p id="chart-live" class="sr-only" aria-live="polite" data-chart-live></p></div>
        <div class="mt-2 grid grid-cols-7 gap-0.5 pl-12 font-mono text-[.7rem] text-muted" aria-hidden="true">${days.map((d) => `<span class="text-center">${esc(dateStr(d.date).split(' ')[I.lang === 'en' ? 1 : 0])}</span>`).join('')}</div>
        <details class="group/d mt-4"><summary class="flex min-h-11 cursor-pointer list-none items-center gap-1.5 font-bold text-xl-blue [&::-webkit-details-marker]:hidden">${icon('chevron-right', 'icon size-4 transition-transform group-open/d:rotate-90')}<span>${esc(t('ai.usage.table'))}</span></summary>
          <table class="mt-2 w-full text-left text-[.92rem]"><thead><tr><th scope="col" class="border-b border-line py-2 font-mono text-[.72rem] font-medium uppercase">${esc(t('ai.usage.day'))}</th><th scope="col" class="border-b border-line py-2 text-right font-mono text-[.72rem] font-medium uppercase">${esc(t('ai.usage.amount'))}</th></tr></thead>
          <tbody>${days.map((d) => `<tr><td class="border-b border-line py-2">${esc(dateStr(d.date))}</td><td class="num border-b border-line py-2 text-right font-bold">${esc(rp(d.amount))}</td></tr>`).join('')}</tbody></table></details></figure>`;
    return `<div class="grid grid-cols-2 gap-3 sm:max-w-md">
        <div class="card p-4"><p class="text-[.85rem] text-muted">${esc(t('ai.usage.total7'))}</p><p class="num mt-1 text-xl font-extrabold sm:text-2xl">${esc(rp(total))}</p></div>
        <div class="card p-4"><p class="text-[.85rem] text-muted">${esc(t('ai.usage.month'))}</p><p class="num mt-1 text-xl font-extrabold sm:text-2xl">${esc(rp(c.usageMonth))}</p></div></div>
      <div class="mt-4">${total ? chart : `<p class="rounded-card border border-dashed border-line px-5 py-6 text-lead-ink">${esc(t('ai.usage.none'))}</p>`}</div>
      ${byProject.length ? `<section class="mt-6" aria-labelledby="byp"><h2 id="byp">${kicker(t('ai.usage.byProject'))}</h2><ul class="mt-3 grid grid-cols-1 gap-2">${byProject.map((x) => `<li class="flex items-baseline justify-between gap-4 border-b border-line py-2"><span class="font-bold">${esc(x.name)}</span><span class="num font-bold">${esc(rp(x.amount))}</span></li>`).join('')}</ul></section>` : ''}`;
  }

  /* ---------- API keys (per project) ---------- */
  function panelKeys() {
    const ps = S.state.projects;
    if (!ps.length) return `<p class="rounded-card border border-dashed border-line px-5 py-6 text-lead-ink">${esc(t('ai.keys.empty'))}</p><a href="#/buat" class="btn mt-4">${esc(t('nav.createLong'))}</a>`;
    return `<ul class="grid grid-cols-1 gap-3">${ps.map((p) => {
      const masked = p.key.slice(0, 8) + '••••••••' + p.key.slice(-4);
      return `<li class="card p-4 sm:p-5" data-key-project="${esc(p.id)}"><h2 class="font-extrabold">${esc(t('ai.keys.project', { name: p.name }))}</h2>
        <div class="mt-3 flex flex-col items-start gap-2 rounded-control bg-paper p-3 sm:flex-row sm:items-center"><code class="min-w-0 flex-1 font-mono [overflow-wrap:anywhere] ${p.keyActive ? '' : 'text-muted line-through'}">${esc(masked)}</code>
          <button type="button" class="btn btn--ghost min-h-11 shrink-0 px-4" data-copy="${esc(p.key)}" aria-label="${esc(t('copy.key'))}">${icon('copy', 'icon size-4')}<span data-copy-label>${esc(t('copy.label'))}</span></button></div>
        <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-end">
          <div class="flex items-center justify-between gap-4"><span id="ka-${esc(p.id)}" class="font-bold">${esc(t('proj.keyActive'))}</span>
            <button type="button" role="switch" aria-checked="${p.keyActive}" aria-labelledby="ka-${esc(p.id)}" class="-my-1.5 shrink-0 rounded-full py-1.5" data-key-active><span class="switch" aria-hidden="true"><i></i></span></button></div>
          <div><label for="kl-${esc(p.id)}" class="block text-[.88rem] font-bold">${esc(t('wiz.limit'))}</label>
            <select id="kl-${esc(p.id)}" class="field mt-1" data-key-limit>${LIMITS.map((v) => `<option value="${v}" ${v === p.limit ? 'selected' : ''}>${esc(limitName(v))}</option>`).join('')}</select></div></div></li>`;
    }).join('')}</ul>`;
  }

  /* ---------- Interactions ---------- */
  function mount(r) {
    const root = view.querySelector('[data-ai-root]');
    const tabs = root.querySelector('[data-tabs]');
    const setTab = (x) => { location.replace(`#/ai?tab=${x}`); setTimeout(() => view.querySelector(`#tab-${x}`)?.focus(), 0); };
    tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) setTab(b.dataset.tab); });
    tabs.addEventListener('keydown', (e) => {
      const i = TABS.indexOf(tabOf(r));
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TABS.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      setTab(TABS[(next + TABS.length) % TABS.length]);
    });
    // Chart: one focusable plot; ←/→ move between days (tooltip + announcement), hover still works per column
    const plot = root.querySelector('[data-plot]');
    if (plot) {
      const cols = [...plot.querySelectorAll('[data-bar]')];
      let active = cols.length - 1;
      const show = (i) => {
        cols.forEach((c, k) => c.toggleAttribute('data-active', k === i));
        root.querySelector('[data-chart-live]').textContent = cols[i].dataset.label;
      };
      plot.addEventListener('focus', () => show(active));
      plot.addEventListener('blur', () => cols.forEach((c) => c.removeAttribute('data-active')));
      plot.addEventListener('keydown', (e) => {
        const next = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: cols.length - 1 }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        active = Math.max(0, Math.min(cols.length - 1, next));
        show(active);
      });
    }
    root.querySelector('[data-keyfor]')?.addEventListener('change', (e) => { ui.keyFor = e.target.value; C.render({ focus: false }); view.querySelector('#ai-keyfor')?.focus(); });
    root.addEventListener('click', (e) => {
      const li = e.target.closest('[data-key-project]');
      if (li && e.target.closest('[data-key-active]')) {
        const p = S.state.projects.find((x) => x.id === li.dataset.keyProject);
        S.setKeyActive(p.id, !p.keyActive);
        C.render({ focus: false });
        view.querySelector(`[data-key-project="${CSS.escape(p.id)}"] [data-key-active]`)?.focus();
      }
    });
    root.querySelectorAll('[data-key-limit]').forEach((sel) => sel.addEventListener('change', () => {
      const id = sel.closest('[data-key-project]').dataset.keyProject;
      S.setLimit(id, Number(sel.value));
      toast(t('proj.limitSaved', { limit: limitName(Number(sel.value)) }));
    }));
  }
})();
