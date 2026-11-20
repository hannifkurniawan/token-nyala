/* TokenNyala v4 — data + pure calculation functions.
   SINGLE SOURCE of every price/estimate (docs/v4/services-and-pricing.md). No price numbers anywhere else.
   No DOM access here: also used by QA through page.evaluate. */
window.TN = window.TN || {};
TN.data = (() => {
  'use strict';

  /* §1 Balance & top-up */
  const TOPUPS = [
    { amount: 50000, bonus: 5000 },
    { amount: 100000, bonus: 15000 },
    { amount: 250000, bonus: 50000 },
    { amount: 500000, bonus: 125000 },
  ];
  const TOPUP_MIN = 20000;
  const REMINDER_BELOW = 20000;

  /** Suggested top-up: smallest preset whose balance (amount + bonus) covers need × 1.1, else Rp500.000. */
  function suggestTopup(need) {
    return TOPUPS.find((p) => p.amount + p.bonus >= need * 1.1) || TOPUPS[TOPUPS.length - 1];
  }

  /* §3 AI estimate units — rounded half-up to whole Rupiah FIRST, then multiplied */
  const RATES = { // mock Rupiah per 1M tokens (input / output), model catalogue v3
    sonnet: { in: 31500, out: 157500 },
    deepseekChat: { in: 4500, out: 18000 },
  };
  const unitCost = (tokIn, tokOut, r) => Math.round((tokIn * r.in + tokOut * r.out) / 1e6);
  const UNITS = {
    sesi: { cost: unitCost(40000, 4000, RATES.sonnet), step: 5 },          // small coding session → Rp1.890
    pesan: { cost: unitCost(1500, 300, RATES.deepseekChat), step: 500 },   // chatbot message → Rp12
    tugas: { cost: unitCost(3000, 800, RATES.deepseekChat), step: 1000 },  // automation task → Rp28
  };
  const usageCost = (unit, qty) => UNITS[unit].cost * qty;
  const sessionCost = (n) => usageCost('sesi', n);
  /** "≈ N small sessions / Rp10.000" for the balanced reference model */
  const sessionsPer = (rupiah) => Math.floor(rupiah / UNITS.sesi.cost);

  /* §4 Shared sizes (hosting + apps) */
  const SIZES = {
    coba: { price: 15000, cpu: '0,5', ram: '512 MB', disk: '5 GB', visitors: 1000 },
    rutin: { price: 35000, cpu: '1', ram: '1 GB', disk: '10 GB', visitors: 5000 },
    ramai: { price: 75000, cpu: '2', ram: '2 GB', disk: '20 GB', visitors: 20000 },
  };
  const SIZE_ORDER = ['coba', 'rutin', 'ramai'];

  /* §5 Catalogue */
  const GROUPS = [
    { id: 'build', services: ['ai', 'chat'] },
    { id: 'run', services: ['hosting', 'apps', 'server'] },
    { id: 'store', services: ['database', 'storage'] },
    { id: 'connect', services: ['domain', 'email', 'payments'] },
  ];
  const ICONS = {
    ai: 'sparkles', chat: 'message-circle', hosting: 'globe', apps: 'bot', server: 'server',
    database: 'database', storage: 'folder', domain: 'at-sign', email: 'mail', payments: 'qr-code',
  };
  const SERVER = {
    kecil: { price: 65000, cpu: 2, ram: '2 GB', disk: '40 GB', traffic: '1 TB' },
    sedang: { price: 120000, cpu: 2, ram: '4 GB', disk: '80 GB', traffic: '2 TB' },
    besar: { price: 230000, cpu: 4, ram: '8 GB', disk: '160 GB', traffic: '4 TB' },
  };
  const DATABASE = {
    kecil: { price: 10000, capacity: '1 GB' },
    sedang: { price: 45000, capacity: '5 GB' },
    besar: { price: 160000, capacity: '20 GB' },
  };
  const STORAGE = {
    '10gb': { price: 7000, capacity: '10 GB' },
    '100gb': { price: 55000, capacity: '100 GB' },
    '1tb': { price: 450000, capacity: '1 TB' },
  };
  const DOMAINS = {
    'my.id': { first: 5000, renew: 25000 },
    'biz.id': { first: 5000, renew: 25000 },
    'web.id': { first: 5000, renew: 25000 },
    id: { first: 225000, renew: 225000 },
    com: { first: 245000, renew: 245000 },
    'co.id': { first: 280000, renew: 280000 },
  };
  const EMAIL = {
    gratis: { price: 0, quota: 50, per: 'day' },
    2500: { price: 25000, quota: 2500, per: 'month' },
    10000: { price: 75000, quota: 10000, per: 'month' },
  };
  const PAYMENTS = { monthly: 0, feePct: 0.7, withdraw: 2500, settleDays: 2 };
  /** Templates (§5.4): minimum size without / with AI (null = not possible), default when opened by ?template= */
  const TEMPLATES = {
    'wa-bot': { minNoAi: null, minAi: 'rutin', def: { size: 'rutin', unit: 'pesan', qty: 1000 } },
    n8n: { minNoAi: 'coba', minAi: 'rutin', def: { size: 'coba', unit: null, qty: 0 } },
    agent: { minNoAi: null, minAi: 'rutin', def: { size: 'rutin', unit: 'tugas', qty: 1000 } },
    dify: { minNoAi: null, minAi: 'rutin', def: { size: 'rutin', unit: 'pesan', qty: 1000 } },
    wordpress: { minNoAi: 'coba', minAi: null, def: { size: 'coba', unit: null, qty: 0 } },
  };

  /** "From" price per service, for the catalogue cards. kind: usage | per30 | firstYear | free | percent */
  const FROM = {
    ai: { kind: 'usage' },
    chat: { kind: 'usage' },
    hosting: { kind: 'per30', price: SIZES.coba.price },
    apps: { kind: 'per30', price: SIZES.coba.price },
    server: { kind: 'per30', price: SERVER.kecil.price },
    database: { kind: 'per30', price: DATABASE.kecil.price },
    storage: { kind: 'per30', price: STORAGE['10gb'].price },
    domain: { kind: 'firstYear', price: Math.min(...Object.values(DOMAINS).map((d) => d.first)) },
    email: { kind: 'free', quota: EMAIL.gratis.quota },
    payments: { kind: 'percent', price: PAYMENTS.monthly, pct: PAYMENTS.feePct },
  };

  /* Recipe items. kind: fixed (per 30 days) | yearly (first year) | usage (estimate) */
  function itemCost(item) {
    switch (item.svc) {
      case 'hosting': return { kind: 'fixed', amount: SIZES[item.size].price };
      case 'apps': return { kind: 'fixed', amount: SIZES[item.size].price };
      case 'server': return { kind: 'fixed', amount: SERVER[item.size].price };
      case 'database': return { kind: 'fixed', amount: DATABASE[item.size].price };
      case 'storage': return { kind: 'fixed', amount: STORAGE[item.size].price };
      case 'email': return { kind: 'fixed', amount: EMAIL[item.size].price };
      case 'domain': return { kind: 'yearly', amount: DOMAINS[item.ext].first, renew: DOMAINS[item.ext].renew };
      case 'ai': return { kind: 'usage', amount: usageCost(item.unit, item.qty) };
      default: throw new Error('unknown service ' + item.svc);
    }
  }

  /* §6 Recipes (chip order = array order) */
  const RECIPES = [
    { id: 'portofolio', persona: 'ayu', items: [
      { svc: 'hosting', size: 'coba' }, { svc: 'domain', ext: 'my.id' }, { svc: 'ai', unit: 'sesi', qty: 10 }] },
    { id: 'chatbot-wa', persona: 'ayu', items: [
      { svc: 'apps', tpl: 'wa-bot', size: 'rutin' }, { svc: 'ai', unit: 'pesan', qty: 1000 }] },
    { id: 'web-klien', persona: 'raka', items: [
      { svc: 'hosting', size: 'rutin' }, { svc: 'database', size: 'kecil' }, { svc: 'email', size: 'gratis' },
      { svc: 'domain', ext: 'com' }, { svc: 'ai', unit: 'sesi', qty: 30 }] },
    { id: 'otomasi-tim', persona: 'dimas', items: [
      { svc: 'apps', tpl: 'n8n', size: 'ramai' }, { svc: 'database', size: 'sedang' }, { svc: 'email', size: '2500' },
      { svc: 'ai', unit: 'tugas', qty: 5000 }] },
    { id: 'ai-coding', persona: 'ayu', aiOnly: true, items: [] },
  ];
  /** ai-coding card: v3 package estimates (small sessions per top-up) */
  const AI_ONLY = [
    { amount: 50000, range: '20–30' },
    { amount: 100000, range: '40–60' },
    { amount: 250000, range: '100+' },
    { amount: 500000, range: '300+' },
  ];
  const recipe = (id) => RECIPES.find((r) => r.id === id);

  /** Totals for a list of items (recipe, calculator, wizard). */
  function recipeTotals(items) {
    const t = { fixed: 0, usage: 0, yearly: 0 };
    for (const it of items) { const c = itemCost(it); t[c.kind] += c.amount; }
    const perMonth = t.fixed + t.usage;
    const firstMonth = perMonth + t.yearly;
    const suggest = suggestTopup(firstMonth);
    return { ...t, perMonth, firstMonth, suggest, months: coverMonths(suggest.amount + suggest.bonus, firstMonth, perMonth) };
  }

  /** How many months a balance lasts: first month (incl. yearly) then per-month. */
  function coverMonths(balance, firstMonth, perMonth) {
    if (firstMonth > balance) return 0;
    if (!perMonth) return Infinity;
    return 1 + Math.floor((balance - firstMonth) / perMonth);
  }

  /** Round to the nearest thousand, half-up (Rp33.900 → 34, Rp101.700 → 102). Returns thousands. */
  const roundK = (n) => Math.floor(n / 1000 + 0.5);

  /* §2 Billing rules */
  /** Stop: refund of unused days, rounded down to Rp100. */
  const refund = (price, daysLeft) => Math.floor((price / 30) * daysLeft / 100) * 100;
  /** Resize: positive = charge (rounded up to Rp100), negative = refund (rounded down to Rp100). */
  function prorata(oldPrice, newPrice, daysLeft) {
    const diff = ((newPrice - oldPrice) / 30) * daysLeft;
    return diff >= 0 ? Math.ceil(diff / 100) * 100 : -Math.floor(-diff / 100) * 100;
  }
  /** Balance lasts until: today + floor(balance ÷ daily cost). Returns null when nothing uses the balance. */
  function balanceUntil({ balance, fixed = 0, domainRenewals = 0, usage7 = 0, today }) {
    const daily = fixed / 30 + domainRenewals / 365 + usage7 / 7;
    if (!daily) return null;
    const d = new Date(today);
    d.setDate(d.getDate() + Math.floor(balance / daily));
    return d;
  }

  /* §7 Example project (landing "Contoh") + the concrete hero / wallet scenario */
  const EXAMPLE = { sessions: [11, 18], size: 'coba', ext: 'my.id', topup: TOPUPS[0] };
  const HERO = { sessions: 12, size: 'coba', ext: 'my.id', domain: 'eventku.my.id', topup: TOPUPS[0] };
  function heroScenario() {
    const balance = HERO.topup.amount + HERO.topup.bonus;
    const lines = [
      { svc: 'hosting', amount: SIZES[HERO.size].price },
      { svc: 'domain', amount: DOMAINS[HERO.ext].first },
      { svc: 'ai', amount: sessionCost(HERO.sessions), qty: HERO.sessions },
    ];
    const spent = lines.reduce((s, l) => s + l.amount, 0);
    return { balance, lines, spent, left: balance - spent };
  }

  return {
    TOPUPS, TOPUP_MIN, REMINDER_BELOW, UNITS, SIZES, SIZE_ORDER, GROUPS, ICONS, SERVER, DATABASE, STORAGE, DOMAINS,
    EMAIL, PAYMENTS, TEMPLATES, FROM, RECIPES, AI_ONLY, EXAMPLE, HERO,
    suggestTopup, usageCost, sessionCost, sessionsPer, itemCost, recipe, recipeTotals, coverMonths, roundK,
    refund, prorata, balanceUntil, heroScenario,
  };
})();
