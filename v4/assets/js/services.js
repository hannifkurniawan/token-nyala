/* TokenNyala v4 — console: other services #/layanan/:id (wireframe C8) — server, database, storage, domain, email,
   payments. One pattern: list → Add (plain-language form + summary) → switch on → connection details. Empty states
   point beginners to the easier option when there is one (microcopy §5). */
(() => {
  'use strict';
  const D = TN.data;
  const I = TN.i18n;
  const S = TN.store;
  const C = TN.console;
  const { t, rp, num } = I;
  const { icon, esc } = TN.ui;
  const { h1, statusPill, toast, dateStr, serviceName } = C;
  const view = C.view;
  const IDS = ['server', 'database', 'storage', 'domain', 'email', 'payments'];
  const EASIER = { server: '#/buat?resep=portofolio', database: '#/buat?resep=web-klien', domain: '#/proyek' };
  const NAME_RE = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;
  const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);
  const DEFAULT = { server: { size: 'kecil' }, database: { size: 'kecil' }, storage: { size: '10gb' }, domain: { ext: 'my.id' }, email: { size: 'gratis' }, payments: {} };
  const form = { svc: null, open: false, project: '', newName: '', item: null, location: 'jakarta', os: 'ubuntu', engine: 'postgresql', domain: '', errors: {}, result: null };
  const rand = (n, chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789') => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => chars[b % chars.length]).join('');

  function resetForm(svc) {
    const live = S.state.projects.filter((p) => S.projectView(p).status !== 'berhenti');
    Object.assign(form, { svc, open: false, project: live[0]?.id || '__new', newName: `${svc}-${slug(S.state.user?.name) || 'saya'}`, item: { svc, ...DEFAULT[svc] }, location: 'jakarta', os: 'ubuntu', engine: 'postgresql', domain: slug(S.state.user?.name) || 'namaku', errors: {}, result: null });
  }

  C.ROUTES.layanan = {
    title: (r) => t(`svc.${IDS.includes(r.parts[1]) ? r.parts[1] : 'server'}.name`),
    html: (r) => {
      const svc = IDS.includes(r.parts[1]) ? r.parts[1] : 'server';
      if (form.svc !== svc) resetForm(svc);
      if (r.q.get('tambah') === '1' && !form.result) form.open = true;
      const items = S.state.services.filter((x) => x.svc === svc);
      const list = items.length ? `<section class="mt-6" aria-labelledby="svc-list"><h2 id="svc-list" class="font-mono text-[.78rem] tracking-[.1em] text-muted uppercase">${esc(t('svcp.inProjects'))}</h2>
        <ul class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">${items.map((sv) => `<li><a href="#/proyek/${esc(sv.project)}?tab=layanan" class="card flex flex-col gap-2 p-4 hover:border-xl-blue sm:p-5">
          <span class="flex items-start justify-between gap-3"><span class="min-w-0 font-extrabold">${esc(serviceName(sv))}</span>${statusPill(sv.status)}</span>
          <span class="text-[.9rem] text-lead-ink">${esc(sv.project)} · <span class="num font-bold">${esc(rp(S.priceOf(sv, { renewal: sv.svc === 'domain' })))}</span> ${esc(t(sv.svc === 'domain' ? 'label.perYear' : 'label.per30'))}</span></a></li>`).join('')}</ul></section>`
        : `<div class="mt-6 rounded-card border border-dashed border-line bg-white p-5 sm:p-6"><p class="text-lead-ink">${esc(t(`empty.${svc}`))}</p>
          ${EASIER[svc] ? `<a href="${EASIER[svc]}" class="mt-3 inline-flex min-h-11 items-center gap-1 font-bold text-xl-blue underline decoration-xl-yellow decoration-2 underline-offset-4">${esc(t('svcp.easier'))}${icon('arrow-right', 'icon size-4')}</a>` : ''}</div>`;
      return `<div data-svc-root><div class="flex flex-wrap items-end justify-between gap-3"><div class="min-w-0">${h1(t(`svc.${svc}.name`), t(`svc.${svc}.desc`))}<p class="mt-1 font-mono text-[.8rem] text-muted">${esc(t(`svc.${svc}.tech`))}</p></div>
        ${form.open || form.result ? '' : `<button type="button" class="btn" data-svc-add>${icon('plus', 'icon size-5')}${esc(t('svcp.add'))}</button>`}</div>
        ${form.result ? resultHtml() : form.open ? formHtml() : list}</div>`;
    },
    mount: () => mount(),
  };

  /* ---------- Add form ---------- */
  function radios(name, values, cur, label) {
    return `<fieldset class="mt-5"><legend class="font-bold">${esc(t(label))}</legend><div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">${values.map((v) => `<label class="flex min-h-12 cursor-pointer items-center gap-3 rounded-control border-2 border-line bg-white px-3 py-2 has-checked:border-xl-blue has-checked:bg-xl-blue/5 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-xl-yellow"><input type="radio" name="${name}" value="${v}" class="size-5 shrink-0 accent-xl-blue" ${v === cur ? 'checked' : ''}><span class="font-bold">${esc(t(`svcp.${name === 'engine' ? 'engine' : name === 'location' ? 'loc' : 'os'}.${v}`, {}))}</span></label>`).join('')}</div></fieldset>`;
  }
  const price = () => (form.svc === 'payments' ? 0 : D.itemCost(form.item).amount);
  function formHtml() {
    const svc = form.svc;
    const live = S.state.projects.filter((p) => S.projectView(p).status !== 'berhenti');
    const err = (k) => (form.errors[k] ? `<p id="sf-${k}-error" class="mt-1.5 font-bold text-red-700">${esc(t(form.errors[k]))}</p>` : '');
    const project = `<div><label for="sf-project" class="block font-bold">${esc(t('svcp.project'))}</label>
      <select id="sf-project" class="field mt-2" data-sf-project>${live.map((p) => `<option value="${esc(p.id)}" ${p.id === form.project ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}<option value="__new" ${form.project === '__new' ? 'selected' : ''}>${esc(t('svcp.newProject'))}</option></select>
      ${form.project === '__new' ? `<label for="sf-new" class="mt-3 block text-[.92rem] font-bold">${esc(t('svcp.newName'))}</label><input id="sf-new" class="field mt-1.5 font-mono" value="${esc(form.newName)}" autocomplete="off" spellcheck="false" aria-describedby="sf-name-error" ${form.errors.name ? 'aria-invalid="true"' : ''}>${err('name')}` : ''}</div>`;
    let body = '';
    if (['server', 'database', 'storage', 'email'].includes(svc)) {
      body += `<div class="mt-5"><p class="font-bold" id="sf-size-label">${esc(t('det.size'))}</p><div class="mt-2">${TN.ui.segmented(form.item, 'sf', [])}</div>
        <p class="mt-2 text-[.88rem] text-lead-ink">${esc(svc === 'server' ? `${t(`det.server.${form.item.size}`)} · ${D.SERVER[form.item.size].cpu} vCPU · ${D.SERVER[form.item.size].ram} · ${D.SERVER[form.item.size].disk}`
          : svc === 'database' ? `${D.DATABASE[form.item.size].capacity} · ${t(`det.database.${form.item.size}`)}` : svc === 'storage' ? t(`det.storage.${form.item.size}`)
            : t(`email.quota.${D.EMAIL[form.item.size].per}`, { n: num(D.EMAIL[form.item.size].quota) }))}</p></div>`;
    }
    if (svc === 'server') body += radios('location', ['jakarta', 'singapura'], form.location, 'svcp.location') + radios('os', ['ubuntu', 'panel'], form.os, 'svcp.os')
      + `<details class="group/d mt-4"><summary class="flex min-h-11 cursor-pointer list-none items-center gap-1.5 font-bold text-xl-blue [&::-webkit-details-marker]:hidden">${icon('chevron-right', 'icon size-4 transition-transform group-open/d:rotate-90')}<span>${esc(t('det.tech'))}</span></summary><p class="mt-2 rounded-control bg-paper p-4 text-[.92rem] text-lead-ink">${esc(t('det.serverNote'))}</p></details>`;
    if (svc === 'database') body += `<fieldset class="mt-5"><legend class="font-bold">${esc(t('svcp.engine'))}</legend><div class="mt-2 grid grid-cols-2 gap-2">${['postgresql', 'mysql'].map((v) => `<label class="flex min-h-12 cursor-pointer items-center gap-3 rounded-control border-2 border-line bg-white px-3 has-checked:border-xl-blue has-checked:bg-xl-blue/5"><input type="radio" name="engine" value="${v}" class="size-5 shrink-0 accent-xl-blue" ${v === form.engine ? 'checked' : ''}><span class="font-bold">${v === 'postgresql' ? 'PostgreSQL' : 'MySQL'}</span></label>`).join('')}</div><p class="mt-2 text-[.88rem] text-muted">${esc(t('svcp.engineHint'))}</p></fieldset>`;
    if (svc === 'domain') {
      body += `<div class="mt-5"><p class="font-bold">${esc(t('wiz.domainName'))}</p><div class="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <label for="sf-domain" class="sr-only">${esc(t('wiz.domainName'))}</label><input id="sf-domain" class="field font-mono" value="${esc(form.domain)}" autocomplete="off" spellcheck="false" aria-describedby="sf-domain-error" ${form.errors.domain ? 'aria-invalid="true"' : ''}>
        <label for="sf-ext" class="sr-only">${esc(t('calc.domain'))}</label><select id="sf-ext" class="field w-auto pr-8" data-sf-ext>${D.OPTIONS.domain.map((x) => `<option value="${x}" ${x === form.item.ext ? 'selected' : ''}>.${x}</option>`).join('')}</select></div>${err('domain')}
        <p class="mt-2 font-bold text-teal-ink">${esc(t('wiz.domainAvail', { rp: rp(D.DOMAINS[form.item.ext].first), renew: rp(D.DOMAINS[form.item.ext].renew) }))}</p>
        <p class="mt-2 text-[.88rem] text-muted">${esc(t('det.domainNote'))}</p></div>`;
    }
    if (svc === 'payments') body += `<p class="mt-5 rounded-control bg-xl-sky/20 px-4 py-3 font-bold">${esc(t('svcp.sandbox'))}</p><p class="mt-3 text-lead-ink">${esc(t('det.pay1', { pct: num(D.PAYMENTS.feePct) }))} ${esc(t('det.pay2', { n: D.PAYMENTS.settleDays, rp: rp(D.PAYMENTS.withdraw) }))}</p>`;
    const now = price();
    return `<section class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start" aria-labelledby="sf-title">
      <form class="card p-5 sm:p-6" novalidate data-sf-form><h2 id="sf-title" tabindex="-1" class="text-xl font-extrabold outline-none">${esc(t('svcp.addTitle', { service: t(`svc.${svc}.name`) }))}</h2>
        <div class="mt-4">${project}</div>${body}</form>
      <aside class="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] z-20 card p-4 shadow-[0_-12px_30px_-20px_rgb(0_22_106/.4)] sm:p-5 lg:top-24 lg:bottom-auto" data-wz-bar="mobile">
        <p class="text-[.88rem] text-muted">${esc(t('svcp.now'))}</p>
        <p class="num text-2xl font-extrabold">${esc(rp(now))} <span class="text-[.9rem] font-bold text-muted">${esc(svc === 'domain' ? t('label.perYear') : t('label.per30'))}</span></p>
        <p class="mt-1 text-[.88rem] text-lead-ink">${esc(t('svcp.after', { rp: rp(S.state.balance - now) }))}</p>
        <div class="mt-3 flex gap-2"><button type="button" class="btn btn--ghost flex-1 px-3" data-sf-cancel>${esc(t('svcp.cancel'))}</button><button type="button" class="btn flex-1 px-3" data-sf-go>${esc(t('svcp.go'))}</button></div></aside></section>`;
  }

  /* ---------- Result: connection details (server password shown once) ---------- */
  function resultHtml() {
    const r = form.result;
    const row = (label, value, secret = false) => `<div><dt class="font-mono text-[.72rem] tracking-[.08em] text-muted uppercase">${esc(t(label))}</dt>
      <dd class="mt-1 flex flex-col items-start gap-2 rounded-control bg-paper p-3 sm:flex-row sm:items-center"><code class="min-w-0 flex-1 font-mono [overflow-wrap:anywhere]">${esc(value)}</code>
        <button type="button" class="btn btn--ghost min-h-11 shrink-0 px-4" data-copy="${esc(value)}" aria-label="${esc(t('copy.label'))}: ${esc(t(label))}">${icon('copy', 'icon size-4')}<span data-copy-label>${esc(t('copy.label'))}</span></button></dd></div>`;
    const rows = {
      server: () => row('svcp.ip', r.ip) + row('svcp.user', 'root') + row('svcp.password', r.password, true),
      database: () => row('svcp.dbUrl', `${form.engine === 'mysql' ? 'mysql' : 'postgresql'}://${r.project}:${r.password}@db.${r.project}.tokennyala.example:${form.engine === 'mysql' ? 3306 : 5432}/${r.project.replace(/-/g, '_')}`),
      storage: () => row('svcp.endpoint', `https://files.tokennyala.example/${r.project}`) + row('svcp.accessKey', `TNFILE${r.password.slice(0, 12).toUpperCase()}`),
      domain: () => `<p class="font-bold text-teal-ink">${esc(t('svcp.domainLinked', { domain: r.domain, project: r.project }))}</p>`,
      email: () => row('svcp.smtp', 'smtp.tokennyala.example:587') + row('svcp.sender', S.state.projects.find((p) => p.id === r.project)?.domain ? `halo@${S.state.projects.find((p) => p.id === r.project).domain}` : `notifikasi@${r.project}.tokennyala.app`),
      payments: () => row('svcp.payKey', `tn_test_${r.password}`),
    }[form.svc]();
    return `<section class="mt-6 card p-5 sm:p-6" aria-labelledby="sf-done"><div class="flex items-center gap-3"><span class="switch" data-on aria-hidden="true"><i></i></span>
        <h2 id="sf-done" tabindex="-1" class="text-xl font-extrabold outline-none">${esc(t('svcp.done', { service: t(`svc.${form.svc}.name`), project: r.project }))}</h2></div>
      <dl class="mt-5 grid grid-cols-1 gap-4">${rows}</dl>
      ${form.svc === 'server' ? `<p class="mt-3 rounded-control bg-xl-yellow/40 px-3 py-2 font-bold">${esc(t('svcp.once'))}</p>` : ''}
      ${form.svc === 'server' ? `<button type="button" class="btn btn--ghost mt-4" data-sf-console>${icon('server', 'icon size-5')}${esc(t('svcp.console'))}</button>` : ''}
      <div class="mt-5 flex flex-wrap gap-2"><a href="#/proyek/${esc(r.project)}?tab=layanan" class="btn btn--ghost">${esc(t('wiz.toProject'))}</a><button type="button" class="btn" data-sf-close>${esc(t('svcp.close'))}</button></div></section>`;
  }

  /* ---------- Interactions ---------- */
  const rerender = (focusSel) => { C.render({ focus: false }); if (focusSel) view.querySelector(focusSel)?.focus(); };
  function submit() {
    const svc = form.svc;
    const e = {};
    const newProject = form.project === '__new';
    const project = newProject ? form.newName : form.project;
    if (newProject && (!NAME_RE.test(project) || S.state.projects.some((p) => p.id === project))) e.name = S.state.projects.some((p) => p.id === project) ? 'err.projectTaken' : 'err.projectName';
    const domain = svc === 'domain' ? `${form.domain}.${form.item.ext}` : null;
    if (svc === 'domain' && !NAME_RE.test(form.domain)) e.domain = 'err.domain';
    else if (svc === 'domain' && S.state.services.some((x) => x.svc === 'domain' && x.domain === domain)) e.domain = 'svcp.domainTaken';
    form.errors = e;
    if (Object.keys(e).length) return rerender(e.name ? '#sf-new' : '#sf-domain');
    const item = { ...form.item, ...(svc === 'server' ? { location: form.location, os: form.os } : {}), ...(svc === 'database' ? { engine: form.engine } : {}) };
    const res = S.addService({ project, item, newProject, domain });
    if (!res.ok) { toast(t('act.needTopup', { rp: rp(res.need) })); return C.openTopup({ amount: res.need }); }
    form.result = { project, domain, ip: `103.${10 + Math.floor(Math.random() * 80)}.${Math.floor(Math.random() * 250)}.${2 + Math.floor(Math.random() * 250)}`, password: rand(16) };
    form.open = false;
    history.replaceState(null, '', `#/layanan/${svc}`);
    rerender('#sf-done');
  }
  function mount() {
    const root = view.querySelector('[data-svc-root]');
    root.querySelector('[data-svc-add]')?.addEventListener('click', () => { form.open = true; form.errors = {}; rerender('#sf-title'); });
    root.querySelector('[data-sf-cancel]')?.addEventListener('click', () => { form.open = false; history.replaceState(null, '', `#/layanan/${form.svc}`); rerender('[data-svc-add]'); });
    root.querySelector('[data-sf-close]')?.addEventListener('click', () => { const svc = form.svc; resetForm(svc); rerender('[data-svc-add]'); });
    root.querySelector('[data-sf-go]')?.addEventListener('click', submit);
    root.querySelector('[data-sf-console]')?.addEventListener('click', () => toast(t('svcp.console')));
    root.querySelector('[data-sf-project]')?.addEventListener('change', (e) => { form.project = e.target.value; rerender('#sf-project'); });
    root.querySelector('#sf-new')?.addEventListener('input', (e) => { form.newName = e.target.value.trim().toLowerCase(); });
    root.querySelector('#sf-domain')?.addEventListener('input', (e) => { form.domain = slug(e.target.value); });
    root.querySelector('[data-sf-ext]')?.addEventListener('change', (e) => { form.item.ext = e.target.value; rerender('#sf-ext'); });
    root.querySelectorAll('input[name=location], input[name=os], input[name=engine]').forEach((r) => r.addEventListener('change', () => { form[r.name] = r.value; }));
    const seg = root.querySelector('[role=radiogroup]');
    seg?.addEventListener('click', (e) => { const o = e.target.closest('[role=radio]'); if (!o) return; form.item.size = o.dataset.size; rerender(`[data-fid="sf-${form.item.size}"]`); });
    seg?.addEventListener('keydown', (e) => { const target = TN.ui.radioKeys(e); if (target) { form.item.size = target.dataset.size; rerender(`[data-fid="sf-${form.item.size}"]`); } });
  }
  window.addEventListener('hashchange', () => { if (!location.hash.startsWith('#/layanan/')) form.svc = null; });
})();
