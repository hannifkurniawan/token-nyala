/* TokenNyala v4 — console demo state (docs/v4/technical-spec.md §4, services-and-pricing §2 & §8).
   localStorage `tn-v4-demo`; storage blocked → in-memory (reload = reset). Contact data (email/phone) is never stored.
   Every balance change goes through charge()/topup() and writes a history row. No DOM access here. */
window.TN = window.TN || {};
TN.store = (() => {
  'use strict';
  const D = TN.data;
  const KEY = 'tn-v4-demo';
  const VERSION = 1;
  const PRESET_DAY = '2026-11-21';

  /* ---------- Dates: 'YYYY-MM-DD' strings, local calendar days ---------- */
  const parse = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
  const iso = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  const addDays = (s, n) => { const dt = parse(s); dt.setDate(dt.getDate() + n); return iso(dt); };
  const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
  const today = () => iso(new Date());

  /* ---------- Persistence ---------- */
  let memory = null;
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return v?.version === VERSION ? v : null; } catch { return null; } };
  const write = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* blocked: memory only */ } };
  const empty = () => ({ version: VERSION, user: null, balance: 0, projects: [], services: [], history: [], reminder: true, clock: today(), seq: 0 });
  let state = read() || empty();
  const listeners = [];
  function save() { memory = state; write(state); listeners.forEach((fn) => fn(state)); }

  const uid = (p) => `${p}${++state.seq}`;

  /* ---------- Service helpers ---------- */
  /** Price per period for a service row (fixed: 30 days; domain: first year now, renew price later). */
  function priceOf(sv, { renewal = false } = {}) {
    if (sv.svc === 'domain') return renewal ? D.DOMAINS[sv.ext].renew : D.DOMAINS[sv.ext].first;
    return D.itemCost(sv).amount;
  }
  const periodOf = (sv) => (sv.svc === 'domain' ? 365 : 30);
  const label = (sv) => ({ svc: sv.svc, size: sv.size, tpl: sv.tpl, ext: sv.ext, domain: sv.domain });

  /** Write a history row and move the balance. amount < 0 = charge, > 0 = top-up/refund. */
  function charge({ amount, type, date = state.clock, svc = null, project = null, meta = {} }) {
    state.balance += amount;
    state.history.push({ id: uid('h'), date, type, amount, svc, project, meta });
  }

  /** Create a project + its services, charging each upfront (fixed per 30 days, domain per year). */
  /** Deterministic demo API key per project (never a real key). */
  const demoKey = (id) => 'tn-demo-' + Array.from(id + 'tokennyala-demo-key-0123456789').slice(0, 24)
    .map((ch, i) => ((ch.charCodeAt(0) * 31 + i * 7) % 16).toString(16)).join('');
  /** Project log (detail page "Log" tab): { date, key, params } — params hold plain values only. */
  function plog(project, key, params = {}, date = state.clock) {
    const p = state.projects.find((x) => x.id === project);
    if (p) (p.log ||= []).push({ date, key, params });
  }

  function addProject({ name, domain = null, items, date = state.clock, status = 'nyala', limit = 50000 }) {
    const id = name;
    state.projects.push({ id, name, domain, createdAt: date, key: demoKey(id), keyActive: true, limit, log: [] });
    plog(id, 'log.created', {}, date);
    for (const it of items) {
      if (it.svc === 'ai' || it.on === false) continue; // AI is usage-based: no service row, charged per use
      const { on, ...clean } = it;
      const sv = { id: uid('s'), project: id, ...clean, startedAt: date, renewAt: addDays(date, periodOf(it)), status, autoRenew: true };
      if (sv.svc === 'domain') sv.domain = domain;
      state.services.push(sv);
      const amount = priceOf(sv);
      if (amount) charge({ amount: -amount, type: 'charge', date, svc: sv.svc, project: id, meta: label(sv) });
    }
    return id;
  }

  function useAi({ project, unit, qty, date = state.clock, chat = false }) {
    charge({ amount: -D.usageCost(unit, qty), type: 'usage', date, svc: chat ? 'chat' : 'ai', project, meta: { unit, qty } });
  }

  /* ---------- Derived values ---------- */
  const active = (s = state) => s.services.filter((x) => x.status === 'nyala');
  function costs(s = state) {
    const fixed = active(s).filter((x) => x.svc !== 'domain').reduce((n, x) => n + priceOf(x), 0);
    const domainRenewals = active(s).filter((x) => x.svc === 'domain' && x.autoRenew).reduce((n, x) => n + priceOf(x, { renewal: true }), 0);
    const since = addDays(s.clock, -7);
    const usage7 = s.history.filter((h) => h.type === 'usage' && h.date > since && h.date <= s.clock).reduce((n, h) => n - h.amount, 0);
    const month = s.clock.slice(0, 7);
    const usageMonth = s.history.filter((h) => h.type === 'usage' && h.date.startsWith(month)).reduce((n, h) => n - h.amount, 0);
    return { fixed, domainRenewals, usage7, usageMonth };
  }
  function until(s = state) {
    const c = costs(s);
    const d = D.balanceUntil({ balance: s.balance, fixed: c.fixed, domainRenewals: c.domainRenewals, usage7: c.usage7, today: parse(s.clock) });
    return d ? iso(d) : null;
  }
  function projectView(p, s = state) {
    const svcs = s.services.filter((x) => x.project === p.id);
    const live = svcs.filter((x) => x.status !== 'berhenti');
    // A web address alone doesn't keep a project "on": judge by the other services when there are any
    const core = svcs.some((x) => x.svc !== 'domain') ? live.filter((x) => x.svc !== 'domain') : live;
    const status = core.some((x) => x.status === 'menyalakan') ? 'menyalakan' : core.some((x) => x.status === 'dijeda') ? 'dijeda' : core.length ? 'nyala' : 'berhenti';
    const monthly = live.filter((x) => x.svc !== 'domain').reduce((n, x) => n + priceOf(x), 0); // paused services still show their price
    const renewals = live.filter((x) => x.svc !== 'domain' && x.status === 'nyala').map((x) => x.renewAt).sort();
    const paused = live.filter((x) => x.status === 'dijeda');
    return { ...p, services: svcs, status, monthly, renewAt: renewals[0] || null, renewIn: renewals[0] ? daysBetween(s.clock, renewals[0]) : null,
      pausedAt: paused[0]?.pausedAt || null, url: p.domain || `${p.id}.tokennyala.app` };
  }
  /** Banners: paused projects, and renewals in ≤ 3 days that the balance can't cover (§2 rule 1). */
  function banners(s = state) {
    const out = [];
    for (const p of s.projects.map((x) => projectView(x, s))) {
      if (p.status === 'dijeda') {
        const shortfall = p.services.filter((x) => x.status === 'dijeda').reduce((n, x) => n + priceOf(x), 0) - s.balance;
        out.push({ type: 'paused', project: p.id, until: addDays(p.pausedAt, D.RULES.pauseDays), min: Math.max(shortfall, D.TOPUP_MIN) });
      }
    }
    const soon = active(s).filter((x) => x.autoRenew && daysBetween(s.clock, x.renewAt) <= D.RULES.remindDays);
    const byProject = {};
    soon.forEach((x) => { (byProject[x.project] ||= []).push(x); });
    let need = 0;
    for (const [project, list] of Object.entries(byProject)) {
      need += list.reduce((n, x) => n + priceOf(x, { renewal: true }), 0);
      if (need > s.balance) out.push({ type: 'low', project, date: list.map((x) => x.renewAt).sort()[0], min: Math.max(need - s.balance, D.TOPUP_MIN) });
    }
    // Reminder (§2 defaults): balance under the threshold while something still renews — next renewal first
    if (!out.length && s.reminder && s.balance < D.REMINDER_BELOW) {
      const next = active(s).filter((x) => x.autoRenew).sort((a, b) => a.renewAt.localeCompare(b.renewAt))[0];
      if (next) out.push({ type: 'reminder', project: next.project, date: next.renewAt, price: priceOf(next, { renewal: true }), min: D.TOPUP_MIN });
    }
    return out;
  }

  /** After a top-up: switch paused services back on if the balance covers them (§2 rule 2). */
  function settle() {
    const resumed = [];
    for (const sv of state.services.filter((x) => x.status === 'dijeda')) {
      const price = priceOf(sv, { renewal: true });
      if (state.balance < price) continue;
      sv.status = 'nyala';
      delete sv.pausedAt;
      sv.renewAt = addDays(state.clock, periodOf(sv));
      charge({ amount: -price, type: 'charge', svc: sv.svc, project: sv.project, meta: { ...label(sv), resumed: true } });
      resumed.push(sv.project);
    }
    return [...new Set(resumed)];
  }

  /** What a top-up of `credit` would leave after paused services switch back on (same order as settle()). */
  function previewTopup(credit) {
    let balance = state.balance + credit;
    const resumed = [];
    for (const sv of state.services.filter((x) => x.status === 'dijeda')) {
      const price = priceOf(sv, { renewal: true });
      if (balance < price) continue;
      balance -= price;
      resumed.push(sv.project);
    }
    return { after: balance, resumed: [...new Set(resumed)] };
  }

  /* ---------- Presets (services-and-pricing §8, clock 21 Nov 2026) ---------- */
  const P = {
    ayu() {
      const s = empty(); state = s;
      s.user = { name: 'Ayu' }; s.clock = PRESET_DAY;
      charge({ amount: 55000, type: 'topup', date: '2026-11-20', meta: { method: 'qris', amount: 50000, bonus: 5000 } });
      addProject({ name: 'portofolio-ayu', domain: 'ayu.my.id', date: '2026-11-20', items: [{ svc: 'hosting', size: 'coba' }, { svc: 'domain', ext: 'my.id' }] });
      useAi({ project: 'portofolio-ayu', unit: 'sesi', qty: 2, date: '2026-11-21' });
      return s;
    },
    raka() {
      const s = empty(); state = s;
      s.user = { name: 'Raka' }; s.clock = PRESET_DAY;
      charge({ amount: 625000, type: 'topup', date: '2026-11-01', meta: { method: 'va', amount: 500000, bonus: 125000 } });
      addProject({ name: 'klien-kopi', domain: 'kopikita.com', date: '2026-11-01', items: [{ svc: 'hosting', size: 'rutin' }, { svc: 'database', size: 'kecil' }, { svc: 'email', size: 'gratis' }, { svc: 'domain', ext: 'com' }] });
      addProject({ name: 'klien-salon', domain: 'salonayu.biz.id', date: '2026-11-01', items: [{ svc: 'hosting', size: 'rutin' }, { svc: 'database', size: 'kecil' }, { svc: 'domain', ext: 'biz.id' }] });
      [['klien-kopi', 8, '2026-11-07'], ['klien-salon', 8, '2026-11-13'], ['klien-kopi', 5, '2026-11-18'], ['klien-salon', 3, '2026-11-20']]
        .forEach(([project, qty, date]) => useAi({ project, unit: 'sesi', qty, date })); // 24 sessions, 8 in the last 7 days
      return s;
    },
    dimas() {
      const s = empty(); state = s;
      s.user = { name: 'Dimas' }; s.clock = PRESET_DAY;
      charge({ amount: 625000, type: 'topup', date: '2026-11-01', meta: { method: 'va', amount: 500000, bonus: 125000 } });
      addProject({ name: 'otomasi-tim', date: '2026-11-01', items: [{ svc: 'apps', tpl: 'n8n', size: 'ramai' }, { svc: 'database', size: 'sedang' }, { svc: 'email', size: '2500' }] });
      addProject({ name: 'server-tim', date: '2026-11-01', items: [{ svc: 'server', size: 'kecil', location: 'jakarta' }] });
      charge({ amount: 300000, type: 'topup', date: '2026-11-15', meta: { method: 'qris', amount: 250000, bonus: 50000 } });
      [[780, '2026-11-08'], [780, '2026-11-13'], [420, '2026-11-17'], [420, '2026-11-20']]
        .forEach(([qty, date]) => useAi({ project: 'otomasi-tim', unit: 'tugas', qty, date })); // 2.400 tasks, 840 in the last 7 days
      state.history.sort((a, b) => a.date.localeCompare(b.date));
      return s;
    },
    /** ayu, one month later: renewal on 20 Des failed → paused; data safe until 27 Des (§8). */
    jeda() {
      const s = P.ayu();
      useAi({ project: 'portofolio-ayu', unit: 'sesi', qty: 12, date: '2026-12-05' });
      useAi({ project: 'portofolio-ayu', unit: 'pesan', qty: 45, date: '2026-12-12', chat: true });
      const host = s.services.find((x) => x.svc === 'hosting');
      host.status = 'dijeda'; host.pausedAt = '2026-12-20';
      s.clock = '2026-12-21';
      return s;
    },
  };

  /** Apply ?demo= from the page URL. Returns the preset name applied (or null). */
  function applyDemo(params) {
    const demo = params.get('demo');
    if (!demo) return null;
    if (demo === 'reset') { state = empty(); save(); return 'reset'; }
    const name = demo === 'ayu' && params.get('state') === 'jeda' ? 'jeda' : demo;
    if (!P[name] || name === 'jeda' && demo !== 'ayu') return null;
    state = P[name]();
    save();
    return name;
  }

  /* ---------- Project & service actions (services-and-pricing §2 rules 4–7) ---------- */
  const findSv = (id) => state.services.find((x) => x.id === id);
  const daysLeft = (sv) => Math.max(0, daysBetween(state.clock, sv.renewAt));

  /** Wizard: create a project in "menyalakan" state (charged now), switched on by finishStarting(). */
  function createProject({ name, domain, items, limit }) {
    addProject({ name, domain, items, status: 'menyalakan', limit });
    save();
    return name;
  }
  function finishStarting(project) {
    state.services.filter((x) => x.project === project && x.status === 'menyalakan').forEach((x) => { x.status = 'nyala'; });
    plog(project, 'log.on');
    save();
  }
  /** Prorated difference for a size change: > 0 charged now (rounded up), < 0 refunded (rounded down). */
  function resizePreview(id, size) {
    const sv = findSv(id);
    return { diff: D.prorata(priceOf(sv), priceOf({ ...sv, size }), daysLeft(sv)), days: daysLeft(sv) };
  }
  function resize(id, size) {
    const sv = findSv(id);
    const { diff, days } = resizePreview(id, size);
    if (diff > state.balance) return { ok: false, need: diff - state.balance };
    if (diff) charge({ amount: -diff, type: diff > 0 ? 'charge' : 'refund', svc: sv.svc, project: sv.project, meta: { ...label(sv), resize: true, from: sv.size, to: size, days } });
    plog(sv.project, 'log.resize', { svc: sv.svc, tpl: sv.tpl, from: sv.size, to: size });
    sv.size = size;
    save();
    return { ok: true, diff };
  }
  /** Stop: unused days back to the balance (rule 4); domain = turn off auto-renewal, no refund (rule 6). */
  function stopPreview(id) {
    const sv = findSv(id);
    if (sv.svc === 'domain') return { refund: 0, until: sv.renewAt };
    return { refund: sv.status === 'nyala' ? D.refund(priceOf(sv), daysLeft(sv)) : 0, days: daysLeft(sv), deleteAt: addDays(state.clock, D.RULES.stopKeepDays) };
  }
  function stopService(id, { quiet = false } = {}) {
    const sv = findSv(id);
    const { refund, days } = stopPreview(id);
    if (sv.svc === 'domain') { sv.autoRenew = false; plog(sv.project, 'log.renewOff', { domain: sv.domain }); }
    else {
      if (refund) charge({ amount: refund, type: 'refund', svc: sv.svc, project: sv.project, meta: { ...label(sv), days } });
      sv.status = 'berhenti'; sv.stoppedAt = state.clock; sv.deleteAt = addDays(state.clock, D.RULES.stopKeepDays);
      delete sv.pausedAt;
      plog(sv.project, 'log.stop', { svc: sv.svc, tpl: sv.tpl });
    }
    if (!quiet) save();
    return refund;
  }
  function resume(id) {
    const sv = findSv(id);
    if (sv.svc === 'domain') { sv.autoRenew = true; plog(sv.project, 'log.renewOn', { domain: sv.domain }); save(); return { ok: true }; }
    const price = priceOf(sv, { renewal: true });
    if (state.balance < price) return { ok: false, need: price - state.balance };
    charge({ amount: -price, type: 'charge', svc: sv.svc, project: sv.project, meta: { ...label(sv), resumed: true } });
    sv.status = 'nyala'; sv.renewAt = addDays(state.clock, periodOf(sv));
    delete sv.stoppedAt; delete sv.deleteAt; delete sv.pausedAt;
    plog(sv.project, 'log.resume', { svc: sv.svc, tpl: sv.tpl });
    save();
    return { ok: true };
  }
  /** Rule 7: stop every service in the project (domains: renewal off). */
  function stopProjectPreview(project) {
    return state.services.filter((x) => x.project === project && x.status !== 'berhenti').reduce((n, x) => n + stopPreview(x.id).refund, 0);
  }
  function stopProject(project) {
    let refund = 0;
    state.services.filter((x) => x.project === project && x.status !== 'berhenti' && !(x.svc === 'domain' && !x.autoRenew))
      .forEach((x) => { refund += stopService(x.id, { quiet: true }); });
    plog(project, 'log.stopProject', { rp: refund });
    save();
    return refund;
  }
  function setLimit(project, limit) { const p = state.projects.find((x) => x.id === project); p.limit = limit; plog(project, 'log.limit', { limit }); save(); }
  function setKeyActive(project, on) { const p = state.projects.find((x) => x.id === project); p.keyActive = on; plog(project, on ? 'log.keyOn' : 'log.keyOff'); save(); }
  function logUpload(project, files) { plog(project, 'log.upload', { files }); save(); }

  /** Simulated clock (§2): day by day — renew when the balance covers it, else pause; paused > 7 days → stopped.
      AI keeps the last 7 days' rhythm (one usage row per week, skipped when the balance can't cover it). */
  function advance(days = 30) {
    const start = state.clock;
    const since = addDays(start, -7);
    const rhythm = {};
    state.history.filter((h) => h.type === 'usage' && h.date > since && h.date <= start).forEach((h) => {
      const k = `${h.project}|${h.svc}|${h.meta.unit}`;
      rhythm[k] = (rhythm[k] || 0) + h.meta.qty;
    });
    const out = { renewed: 0, paused: 0, stopped: 0 };
    for (let d = 1; d <= days; d++) {
      const day = addDays(start, d);
      state.clock = day;
      if (d % 7 === 0) {
        for (const [k, qty] of Object.entries(rhythm)) {
          const [project, svc, unit] = k.split('|');
          const live = state.services.some((x) => x.project === project && x.status === 'nyala');
          if (live && state.balance >= D.usageCost(unit, qty)) useAi({ project, unit, qty, date: day, chat: svc === 'chat' });
        }
      }
      for (const sv of state.services) {
        if (sv.status === 'nyala' && sv.renewAt <= day) {
          if (sv.svc === 'domain' && !sv.autoRenew) { sv.status = 'berhenti'; sv.stoppedAt = day; continue; }
          const price = priceOf(sv, { renewal: true });
          if (state.balance >= price) {
            charge({ amount: -price, type: 'charge', date: day, svc: sv.svc, project: sv.project, meta: { ...label(sv), renewal: true } });
            sv.renewAt = addDays(sv.renewAt, periodOf(sv));
            out.renewed++;
          } else {
            sv.status = 'dijeda'; sv.pausedAt = day;
            plog(sv.project, 'log.paused', { svc: sv.svc, tpl: sv.tpl, domain: sv.domain }, day);
            out.paused++;
          }
        } else if (sv.status === 'dijeda' && addDays(sv.pausedAt, D.RULES.pauseDays) <= day) {
          sv.status = 'berhenti'; sv.stoppedAt = day; sv.deleteAt = day;
          plog(sv.project, 'log.autoStop', { svc: sv.svc, tpl: sv.tpl }, day);
          out.stopped++;
        }
      }
    }
    save();
    return { ...out, date: state.clock };
  }

  /** Chat AI (#/chat): charge one reply at the chosen model's rate (rounded to whole Rupiah, at least Rp1). */
  const chatCost = (model, tin, tout) => Math.max(1, Math.round((tin * model.in + tout * model.out) / 1e6));
  function chargeChat({ model, tin, tout }) {
    const cost = chatCost(model, tin, tout);
    if (cost > state.balance) return { ok: false, cost };
    charge({ amount: -cost, type: 'usage', svc: 'chat', meta: { model: model.name, tin, tout } });
    save();
    return { ok: true, cost };
  }
  /** Account-level demo key (AI page without a project). */
  const accountKey = () => demoKey(`akun-${state.user?.name || 'demo'}`);

  /** Other services page: add one service to an existing or new project, charged upfront. */
  function addService({ project, item, newProject = false, domain = null }) {
    if (newProject) state.projects.push({ id: project, name: project, domain: null, createdAt: state.clock, key: demoKey(project), keyActive: true, limit: 50000, log: [] }), plog(project, 'log.created');
    const p = state.projects.find((x) => x.id === project);
    const sv = { id: uid('s'), project, ...item, startedAt: state.clock, renewAt: addDays(state.clock, periodOf(item)), status: 'nyala', autoRenew: true };
    if (sv.svc === 'domain') { sv.domain = domain; if (!p.domain) p.domain = domain; }
    const amount = priceOf(sv);
    if (amount > state.balance) { if (newProject) state.projects.pop(); return { ok: false, need: amount - state.balance }; }
    state.services.push(sv);
    if (amount) charge({ amount: -amount, type: 'charge', svc: sv.svc, project, meta: label(sv) });
    plog(project, 'log.added', { svc: sv.svc, tpl: sv.tpl, domain: sv.domain });
    save();
    return { ok: true, id: sv.id };
  }

  /* ---------- Actions ---------- */
  function signIn(name) { state.user = { name: name.trim().slice(0, 40) || 'Kamu' }; save(); }
  function signOut() { state.user = null; save(); }
  function reset() { state = empty(); save(); }
  function topup({ amount, bonus, method }) {
    charge({ amount: amount + bonus, type: 'topup', meta: { method, amount, bonus } });
    const resumed = settle();
    save();
    return { resumed };
  }
  function setReminder(on) { state.reminder = on; save(); }

  return {
    get state() { return state; }, KEY, PRESET_DAY,
    parse, iso, addDays, daysBetween, priceOf, costs, until, projectView, banners,
    applyDemo, signIn, signOut, reset, topup, previewTopup, setReminder, addProject, useAi, charge, settle, save,
    createProject, finishStarting, resizePreview, resize, stopPreview, stopService, resume, stopProjectPreview, stopProject,
    setLimit, setKeyActive, logUpload, advance, daysLeft, demoKey,
    chatCost, chargeChat, accountKey, addService,
    onChange(fn) { listeners.push(fn); },
  };
})();
