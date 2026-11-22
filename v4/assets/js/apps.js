/* TokenNyala v4 — console: Apps #/aplikasi (menu since 22 Nov 2026). An app stays part of its project (one concept:
   the project); this page is the door to them: every running app across projects + the catalogue (install = the wizard
   with ?template=). #/aplikasi/:serviceId manages one app. Tabs: access · connections (chat apps only) · usage · log ·
   size & renewal. Admin credentials, usage numbers and runtime log lines are deterministic mock values (no real data). */
(() => {
  'use strict';
  const D = TN.data;
  const I = TN.i18n;
  const S = TN.store;
  const C = TN.console;
  const { t, rp, rpK } = I;
  const { icon, esc } = TN.ui;
  const { h1, kicker, statusPill, toast, dateStr } = C;
  const view = C.view;
  const CATALOGUE = ['wa-bot', 'n8n', 'agent', 'dify', 'wordpress'];
  /** Chat channels per template (Hostinger "Channels"; Sumopod has none): WhatsApp QR, Telegram bot token */
  const CHANNELS = { 'wa-bot': ['wa'], agent: ['wa', 'tg'], dify: ['tg'] };
  const TABS = (sv) => ['akses', ...(CHANNELS[sv.tpl] ? ['sambungan'] : []), 'pemakaian', 'log', 'ukuran'];
  const TAB_KEY = { akses: 'apps.tab.access', sambungan: 'apps.tab.connect', pemakaian: 'apps.tab.usage', log: 'tab.log', ukuran: 'apps.tab.size' };
  const TG_RE = /^\d{6,12}:[A-Za-z0-9_-]{20,}$/;
  const ui = { reveal: false, tgError: false };

  const appsOf = () => S.state.services.filter((x) => x.svc === 'apps' && x.status !== 'berhenti');
  /** Deterministic mock values from a seed string (same app → same numbers) */
  const seeded = (seed) => { let h = 0; for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return () => ((h = (h * 1103515245 + 12345) >>> 0) % 1000) / 1000; };
  const adminUrl = (sv) => `https://${sv.tpl}-${sv.project}.tokennyala.app`;
  const adminPass = (sv) => S.demoKey(`app-${sv.id}-${sv.project}`).slice(8, 24);
  const usesAi = (sv) => Boolean(D.TEMPLATES[sv.tpl].minAi);

  C.ROUTES.aplikasi = {
    title: (r) => { const sv = S.state.services.find((x) => x.id === r.parts[1] && x.svc === 'apps'); return sv ? t(`tpl.${sv.tpl}.name`) : t('nav.apps'); },
    html: (r) => {
      const sv = S.state.services.find((x) => x.id === r.parts[1] && x.svc === 'apps');
      return `<div data-apps-root>${sv ? detail(sv, r) : list()}</div>`;
    },
    mount: (r) => mount(r),
  };

  /* ---------- List: running apps + catalogue ---------- */
  function list() {
    const apps = appsOf();
    const running = apps.length ? `<ul class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">${apps.map((sv) => `<li><a href="#/aplikasi/${esc(sv.id)}" class="card flex h-full items-start gap-3 p-4 hover:border-xl-blue sm:p-5">
        <span class="grid size-11 shrink-0 place-items-center rounded-control bg-xl-blue text-white">${icon(D.TEMPLATE_ICONS[sv.tpl], 'icon size-5')}</span>
        <span class="min-w-0 flex-1"><span class="flex items-start justify-between gap-3"><span class="font-extrabold">${esc(t(`tpl.${sv.tpl}.name`))}</span>${statusPill(sv.status)}</span>
          <span class="mt-1 block text-[.9rem] text-lead-ink">${esc(t('apps.inProject', { project: sv.project }))} · ${esc(t(`size.${sv.size}`))} · <span class="num font-bold">${esc(rp(S.priceOf(sv)))}</span> ${esc(t('label.per30'))}</span>
          <span class="mt-2 inline-flex items-center gap-1 font-bold text-xl-blue">${esc(t('apps.manage'))}${icon('arrow-right', 'icon size-4')}</span></span></a></li>`).join('')}</ul>`
      : `<p class="mt-3 rounded-card border border-dashed border-line bg-white p-5 text-lead-ink sm:p-6">${esc(t('apps.empty'))}</p>`;
    const catalogue = CATALOGUE.map((id) => `<li class="card flex flex-col gap-2 p-4 sm:p-5">
        <div class="flex items-center gap-3"><span class="grid size-11 shrink-0 place-items-center rounded-control bg-paper text-xl-blue">${icon(D.TEMPLATE_ICONS[id], 'icon size-5')}</span>
          <div class="min-w-0"><h3 class="font-extrabold">${esc(t(`tpl.${id}.name`))}</h3><p class="font-mono text-[.75rem] text-muted">${esc(t(`tpl.${id}.tech`))}</p></div></div>
        <p class="text-[.92rem] text-lead-ink">${esc(t(`tpl.${id}.desc`))}</p>
        <p class="mt-auto border-t border-dashed border-line pt-2 text-[.9rem]"><span class="num font-extrabold">≈ ${esc(rpK(D.templateCost(id)))}</span>${esc(t('label.perMonth'))} · ${esc(t('apps.minSize', { size: t(`size.${D.templateMin(id)}`) }))}</p>
        <a href="#/buat?template=${id}" class="btn mt-1 w-full" aria-label="${esc(t('apps.installAria', { name: t(`tpl.${id}.name`) }))}">${icon('plus', 'icon size-5')}${esc(t('apps.installBtn'))}</a></li>`).join('');
    return `<div class="flex flex-wrap items-end justify-between gap-3"><div class="min-w-0">${h1(t('nav.apps'), t('apps.lead'))}</div>
        <button type="button" class="btn" data-apps-to-catalog>${icon('plus', 'icon size-5')}${esc(t('apps.install'))}</button></div>
      <section class="mt-6" aria-labelledby="apps-running"><h2 id="apps-running">${kicker(t('apps.running'))}</h2>${running}</section>
      <section class="mt-10" id="apps-catalog" aria-labelledby="apps-catalog-title" tabindex="-1"><h2 id="apps-catalog-title" class="text-xl font-extrabold">${esc(t('apps.catalog'))}</h2>
        <p class="mt-1 text-lead-ink">${esc(t('apps.catalogLead'))}</p>
        <ul class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">${catalogue}</ul></section>`;
  }

  /* ---------- Detail: one app ---------- */
  function detail(sv, r) {
    const tabs = TABS(sv);
    const tab = tabs.includes(r.q.get('tab')) ? r.q.get('tab') : 'akses';
    const tablist = `<div class="no-scrollbar mt-6 overflow-x-auto border-b border-line"><div role="tablist" aria-label="${esc(t('apps.tabsAria'))}" class="flex w-max gap-1" data-tabs>${tabs.map((x) => `<button type="button" role="tab" id="tab-${x}" aria-selected="${x === tab}" aria-controls="panel-${x}" tabindex="${x === tab ? 0 : -1}" data-tab="${x}"
      class="min-h-11 min-w-11 shrink-0 border-b-[3px] border-transparent px-3 font-bold whitespace-nowrap text-muted aria-selected:border-xl-yellow aria-selected:text-xl-dark">${esc(t(TAB_KEY[x]))}</button>`).join('')}</div></div>`;
    const panel = { akses: panelAccess, sambungan: panelConnect, pemakaian: panelUsage, log: panelLog, ukuran: panelSize }[tab](sv);
    return `<a href="#/aplikasi" class="inline-flex min-h-11 items-center gap-1 font-bold text-xl-blue">${icon('arrow-right', 'icon size-4 rotate-180')}${esc(t('nav.apps'))}</a>
      <div class="mt-2 flex flex-wrap items-start justify-between gap-3"><div class="min-w-0">${h1(t(`tpl.${sv.tpl}.name`))}
        <p class="mt-2 text-lead-ink">${esc(t('apps.inProject', { project: sv.project }))} · ${esc(t(`size.${sv.size}`))} · <span class="font-mono text-[.85rem]">${esc(t(`tpl.${sv.tpl}.tech`))}</span></p></div>${statusPill(sv.status)}</div>
      ${tablist}<div id="panel-${tab}" role="tabpanel" aria-labelledby="tab-${tab}" tabindex="0" class="mt-6 focus:outline-none">${panel}</div>`;
  }
  const copyRow = (label, value, shown = value) => `<div><dt class="font-mono text-[.72rem] tracking-[.08em] text-muted uppercase">${esc(label)}</dt>
    <dd class="mt-1 flex flex-col items-start gap-2 rounded-control bg-paper p-3 sm:flex-row sm:items-center"><code class="min-w-0 flex-1 font-mono [overflow-wrap:anywhere]">${esc(shown)}</code>
      <button type="button" class="btn btn--ghost min-h-11 shrink-0 px-4" data-copy="${esc(value)}" aria-label="${esc(t('copy.label'))}: ${esc(label)}">${icon('copy', 'icon size-4')}<span data-copy-label>${esc(t('copy.label'))}</span></button></dd></div>`;

  function panelAccess(sv) {
    const pass = adminPass(sv);
    const p = S.state.projects.find((x) => x.id === sv.project);
    const env = [['APP_URL', adminUrl(sv)], ...(usesAi(sv) ? [['TN_BASE_URL', D.API.baseUrl], ['TN_API_KEY', `${p.key.slice(0, 8)}••••••••${p.key.slice(-4)}`]] : [])];
    return `<div class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
      <section class="card p-5 sm:p-6" aria-labelledby="acc-title"><h2 id="acc-title" class="font-extrabold">${esc(t('apps.accessTitle'))}</h2>
        <dl class="mt-4 grid grid-cols-1 gap-4">${copyRow(t('apps.adminUrl'), adminUrl(sv))}${copyRow(t('svcp.user'), 'admin')}
          <div><dt class="font-mono text-[.72rem] tracking-[.08em] text-muted uppercase">${esc(t('svcp.password'))}</dt>
            <dd class="mt-1 flex flex-col items-start gap-2 rounded-control bg-paper p-3 sm:flex-row sm:items-center"><code class="min-w-0 flex-1 font-mono [overflow-wrap:anywhere]" data-pass>${esc(ui.reveal ? pass : '••••••••••••••••')}</code>
              <span class="flex shrink-0 flex-wrap gap-2"><button type="button" class="btn btn--ghost min-h-11 px-4" aria-pressed="${ui.reveal}" data-reveal>${icon(ui.reveal ? 'eye-off' : 'eye', 'icon size-4')}${esc(t(ui.reveal ? 'apps.hide' : 'apps.show'))}</button>
              <button type="button" class="btn btn--ghost min-h-11 px-4" data-copy="${esc(pass)}" aria-label="${esc(t('copy.label'))}: ${esc(t('svcp.password'))}">${icon('copy', 'icon size-4')}<span data-copy-label>${esc(t('copy.label'))}</span></button></span></dd></div></dl>
        <button type="button" class="btn mt-5" data-open-admin>${icon('arrow-up-right', 'icon size-5')}${esc(t('apps.open'))}</button></section>
      <section class="grid grid-cols-1 gap-4">
        ${usesAi(sv) ? `<div class="card p-5"><p class="flex items-start gap-3 font-bold">${icon('sparkles', 'icon mt-0.5 size-5 shrink-0 text-xl-blue')}<span>${esc(t('apps.aiLinked', { project: sv.project }))}</span></p></div>` : ''}
        <details class="group/d card p-5"><summary class="flex min-h-11 cursor-pointer list-none items-center gap-1.5 font-bold text-xl-blue [&::-webkit-details-marker]:hidden">${icon('chevron-right', 'icon size-4 transition-transform group-open/d:rotate-90')}<span>${esc(t('det.tech'))}</span></summary>
          <p class="mt-2 text-[.9rem] text-lead-ink">${esc(t('apps.envNote'))}</p>
          <dl class="mt-3 grid grid-cols-1 gap-2 font-mono text-[.82rem]">${env.map(([k, v]) => `<div class="rounded-control bg-paper px-3 py-2"><dt class="text-muted"><code>${k}</code></dt><dd class="[overflow-wrap:anywhere]"><code>${esc(v)}</code></dd></div>`).join('')}</dl></details>
      </section></div>`;
  }

  function panelConnect(sv) {
    const blocks = CHANNELS[sv.tpl].map((ch) => ch === 'wa'
      ? `<section class="card p-5 sm:p-6" aria-labelledby="wa-title"><h2 id="wa-title" class="flex items-center gap-2 font-extrabold">${icon('message-circle', 'icon size-5 text-xl-blue')}${esc(t('proj.qrTitle'))}</h2>
          <div class="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center"><div class="w-fit rounded-card border border-line p-3">${TN.projects?.qrSvg?.() || ''}</div>
          <div><p class="text-lead-ink">${esc(t('proj.qrBody'))}</p><button type="button" class="btn btn--ghost mt-4" data-wa-test>${icon('send', 'icon size-5')}${esc(t('proj.qrTest'))}</button></div></div></section>`
      : `<section class="card p-5 sm:p-6" aria-labelledby="tg-title"><h2 id="tg-title" class="flex items-center gap-2 font-extrabold">${icon('send', 'icon size-5 text-xl-blue')}${esc(t('apps.tg.title'))}</h2>
          ${sv.tg ? `<p class="mt-3 flex items-center gap-2 font-bold text-teal-ink">${icon('check', 'icon size-5')}${esc(t('apps.tg.done'))}</p>
            <button type="button" class="btn btn--ghost mt-4" data-tg-off>${icon('power', 'icon size-5')}${esc(t('apps.tg.off'))}</button>`
          : `<p class="mt-1 text-lead-ink">${esc(t('apps.tg.body'))}</p>
            <form class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start" data-tg-form novalidate>
              <div><label for="tg-token" class="block font-bold">${esc(t('apps.tg.token'))}</label>
                <input id="tg-token" class="field mt-1.5 font-mono" autocomplete="off" spellcheck="false" placeholder="123456789:AA…" aria-describedby="tg-error" ${ui.tgError ? 'aria-invalid="true"' : ''}>
                ${ui.tgError ? `<p id="tg-error" class="mt-1.5 font-bold text-red-700">${esc(t('apps.tg.err'))}</p>` : ''}</div>
              <button type="submit" class="btn sm:mt-[1.85rem]">${icon('plug', 'icon size-5')}${esc(t('apps.tg.save'))}</button></form>
            <p class="mt-3 text-[.85rem] text-muted">${esc(t('apps.tg.note'))}</p>`}</section>`).join('');
    return `<div class="grid grid-cols-1 gap-4">${blocks}</div>`;
  }

  function panelUsage(sv) {
    const rnd = seeded(`${sv.id}${S.state.clock}`);
    const base = { coba: 0.55, rutin: 0.4, ramai: 0.25 }[sv.size] ?? 0.4;
    const meters = [['apps.cpu', base + rnd() * 0.3], ['apps.ram', base + 0.1 + rnd() * 0.25], ['apps.disk', 0.15 + rnd() * 0.3]].map(([k, v]) => {
      const val = Math.min(0.95, v), pct = Math.round(val * 100);
      const load = val < 0.5 ? 'low' : val < 0.8 ? 'mid' : 'high';
      return `<li><div class="flex items-baseline justify-between gap-3"><span class="font-bold">${esc(t(k))}</span><span class="font-mono text-[.85rem]">${pct}% · ${esc(t(`apps.load.${load}`))}</span></div>
        <div class="meter mt-2" role="img" aria-label="${esc(t(k))}: ${pct}%"><i style="--v:${val.toFixed(2)}"></i></div></li>`;
    }).join('');
    const month = S.state.clock.slice(0, 7);
    const ai = S.state.history.filter((h) => h.type === 'usage' && h.project === sv.project && h.date.startsWith(month)).reduce((n, h) => n - h.amount, 0);
    return `<div class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
      <section class="card p-5 sm:p-6" aria-labelledby="use-title"><h2 id="use-title" class="flex items-center gap-2 font-extrabold">${icon('activity', 'icon size-5 text-xl-blue')}${esc(t('apps.usageTitle'))}</h2>
        <ul class="mt-4 grid grid-cols-1 gap-4">${meters}</ul><p class="mt-4 text-[.85rem] text-muted">${esc(t('apps.usageNote'))}</p></section>
      ${usesAi(sv) ? `<section class="card p-5 sm:p-6"><p class="font-bold">${esc(t('proj.aiMonth', { rp: rp(ai) }))}</p><a href="#/ai?tab=pemakaian" class="mt-3 inline-flex min-h-11 items-center gap-1 font-bold text-xl-blue">${esc(t('apps.aiDetail'))}${icon('arrow-right', 'icon size-4')}</a></section>` : ''}</div>`;
  }

  function panelLog(sv) {
    const p = S.state.projects.find((x) => x.id === sv.project);
    const own = (p?.log || []).filter((l) => l.key === 'log.created' || l.params?.tpl === sv.tpl).map((l) => ({ date: l.date, text: TN.projects.logText(l) }));
    const runtime = [
      { date: sv.startedAt, text: t('apps.log.started', { name: t(`tpl.${sv.tpl}.name`) }) },
      { date: S.state.clock, text: t('apps.log.backup') },
      { date: S.state.clock, text: t('apps.log.health') },
    ];
    const rows = [...own, ...runtime].sort((a, b) => (a.date < b.date ? 1 : -1));
    return `<ol class="card divide-y divide-line px-4 sm:px-5">${rows.map((x) => `<li class="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-3 py-3"><span class="font-mono text-[.82rem] text-muted">${esc(dateStr(x.date))}</span><span>${esc(x.text)}</span></li>`).join('')}</ol>`;
  }

  function panelSize(sv) {
    return `<section class="card max-w-2xl p-5 sm:p-6" aria-labelledby="size-title"><h2 id="size-title" class="font-extrabold">${esc(t('apps.sizeNow', { size: t(`size.${sv.size}`) }))}</h2>
      <p class="mt-1 text-lead-ink"><span class="num font-bold">${esc(rp(S.priceOf(sv)))}</span> ${esc(t('label.per30'))} · ${esc(t('proj.renewsOn', { date: dateStr(sv.renewAt) }))}</p>
      <p class="mt-1 text-[.92rem] text-lead-ink">${esc(t(`calc.for.${sv.size}`, { n: I.num(D.SIZES[sv.size].visitors) }))}</p>
      <p class="mt-4 text-[.92rem] text-lead-ink">${esc(t('apps.sizeNote'))}</p>
      <a href="#/proyek/${esc(sv.project)}?tab=layanan" class="btn mt-5">${icon('arrow-up-down', 'icon size-5')}${esc(t('act.resize'))}</a></section>`;
  }

  /* ---------- Interactions ---------- */
  function mount(r) {
    const root = view.querySelector('[data-apps-root]');
    root.querySelector('[data-apps-to-catalog]')?.addEventListener('click', () => {
      const cat = view.querySelector('#apps-catalog');
      cat.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      cat.focus({ preventScroll: true });
    });
    const sv = S.state.services.find((x) => x.id === r.parts[1] && x.svc === 'apps');
    if (!sv) return;
    const tabs = root.querySelector('[data-tabs]');
    const list = TABS(sv);
    const tabOf = () => (list.includes(C.parseHash().q.get('tab')) ? C.parseHash().q.get('tab') : 'akses');
    const setTab = (x) => { location.replace(`#/aplikasi/${sv.id}?tab=${x}`); setTimeout(() => view.querySelector(`#tab-${x}`)?.focus(), 0); };
    tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) setTab(b.dataset.tab); });
    tabs.addEventListener('keydown', (e) => {
      const i = list.indexOf(tabOf());
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: list.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      setTab(list[(next + list.length) % list.length]);
    });
    root.querySelector('[data-reveal]')?.addEventListener('click', () => { ui.reveal = !ui.reveal; C.render({ focus: false }); view.querySelector('[data-reveal]')?.focus(); });
    root.querySelector('[data-open-admin]')?.addEventListener('click', () => toast(t('apps.openToast', { url: adminUrl(sv) })));
    root.querySelector('[data-wa-test]')?.addEventListener('click', () => { S.useAi({ project: sv.project, unit: 'pesan', qty: 1 }); S.save(); toast(t('proj.qrSent', { rp: rp(D.UNITS.pesan.cost) })); });
    root.querySelector('[data-tg-form]')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const token = view.querySelector('#tg-token').value.trim();
      ui.tgError = !TG_RE.test(token);
      if (ui.tgError) { C.render({ focus: false }); view.querySelector('#tg-token')?.focus(); return; }
      sv.tg = true; S.save(); // the token itself is never stored (mock)
      C.render({ focus: false }); toast(t('apps.tg.done')); view.querySelector('[data-tg-off]')?.focus();
    });
    root.querySelector('[data-tg-off]')?.addEventListener('click', () => { sv.tg = false; S.save(); C.render({ focus: false }); view.querySelector('#tg-token')?.focus(); });
  }
  window.addEventListener('hashchange', () => { if (!location.hash.startsWith('#/aplikasi/')) { ui.reveal = false; ui.tgError = false; } });
})();
