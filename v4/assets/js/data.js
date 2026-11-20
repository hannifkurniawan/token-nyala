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

  /* AI model catalogue (v3 mock, docs/technical-spec.md). Rates: Rupiah per 1M tokens (1 credit = Rp1). */
  const MODELS = [
    { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', uses: ['coding', 'chat'], in: 4500, out: 18000, ctx: 128000 },
    { id: 'gemini-flash', name: 'Gemini Flash', provider: 'Google', uses: ['chat', 'analysis'], in: 5000, out: 20000, ctx: 1000000 },
    { id: 'qwen-plus', name: 'Qwen Plus', provider: 'Alibaba', uses: ['chat'], in: 6000, out: 24000, ctx: 128000 },
    { id: 'gpt-mini', name: 'GPT Mini', provider: 'OpenAI', uses: ['chat'], in: 6500, out: 26000, ctx: 400000 },
    { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', provider: 'DeepSeek', uses: ['analysis', 'coding'], in: 9000, out: 36000, ctx: 128000 },
    { id: 'claude-haiku', name: 'Claude Haiku', provider: 'Anthropic', uses: ['chat', 'coding'], in: 15000, out: 75000, ctx: 200000 },
    { id: 'qwen-max', name: 'Qwen Max', provider: 'Alibaba', uses: ['coding', 'chat'], in: 20000, out: 80000, ctx: 256000 },
    { id: 'gpt', name: 'GPT', provider: 'OpenAI', uses: ['coding', 'chat'], in: 25000, out: 150000, ctx: 400000 },
    { id: 'claude-sonnet', name: 'Claude Sonnet', provider: 'Anthropic', uses: ['coding', 'analysis'], in: 31500, out: 157500, ctx: 1000000 },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', uses: ['coding', 'analysis'], in: 31500, out: 189000, ctx: 1000000 },
    { id: 'claude-opus', name: 'Claude Opus', provider: 'Anthropic', uses: ['coding'], in: 78750, out: 393750, ctx: 1000000 },
    { id: 'gpt-pro', name: 'GPT Pro', provider: 'OpenAI', uses: ['analysis'], in: 150000, out: 600000, ctx: 400000 },
  ].map((m) => {
    const session = unitCost(40000, 4000, m); // one small session on this model
    const tier = session < 1000 ? 'hemat' : session <= 3000 ? 'seimbang' : 'premium';
    return { ...m, session, tier, per10k: Math.floor(10000 / session) };
  });
  const PREVIEW_MODELS = ['claude-sonnet', 'gpt', 'gemini-pro', 'deepseek-chat', 'qwen-plus', 'claude-opus'];
  const PROVIDER_ICON = { Anthropic: 'claude', OpenAI: 'openai', Google: 'gemini', DeepSeek: 'deepseek', Alibaba: 'qwen' };
  const API = { baseUrl: 'https://api.tokennyala.example/v1', demoKey: 'tn-demo-7c41e09b5d2a8f6c13e43f9a' };

  /** Template default monthly cost (§5.4): size + default AI usage. */
  function templateCost(id) {
    const d = TEMPLATES[id].def;
    return SIZES[d.size].price + (d.unit ? usageCost(d.unit, d.qty) : 0);
  }
  /** Minimum size shown on the landing card: with AI when the template needs AI, else without. */
  const templateMin = (id) => TEMPLATES[id].minNoAi || TEMPLATES[id].minAi;
  const TEMPLATE_ICONS = { 'wa-bot': 'message-circle', n8n: 'workflow', agent: 'bot', dify: 'blocks', wordpress: 'newspaper' };

  /* Beginner-safety rules (§2), used in copy */
  const RULES = { pauseDays: 7, remindDays: 3, stopKeepDays: 7 };

  /* Learn guides (microcopy §8) — minutes to read */
  const GUIDES = [
    { id: 'g-portofolio', recipe: 'portofolio', minutes: 3 },
    { id: 'g-chatbot', recipe: 'chatbot-wa', minutes: 4 },
    { id: 'g-ai-tool', recipe: 'ai-coding', minutes: 2 },
  ];

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
  const EXAMPLE_TASKS = [[3, 5], [2, 4], [4, 6], [2, 3]]; // layout, mobile, form, copy & colour (v3)
  const EXAMPLE = { tasks: EXAMPLE_TASKS, sessions: [0, 1].map((i) => EXAMPLE_TASKS.reduce((n, r) => n + r[i], 0)),
    size: 'coba', ext: 'my.id', domain: 'eventku.my.id', topup: TOPUPS[0] };
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

  /** §7 example: { sessions:[min,max], usage:[min,max], fixed, total:[min,max] } */
  function exampleTotals() {
    const ex = EXAMPLE, fixed = SIZES[ex.size].price + DOMAINS[ex.ext].first;
    const usage = ex.sessions.map(sessionCost);
    return { sessions: ex.sessions, usage, hosting: SIZES[ex.size].price, domain: DOMAINS[ex.ext].first, total: usage.map((u) => u + fixed),
      balance: ex.topup.amount + ex.topup.bonus };
  }

  /* Nala "Bantu pilih resep" (§6 Aturan Nala): adjust a recipe from Q2 (code?) and Q3 (load). */
  const LOAD_SIZE = { coba: null, rutin: 'rutin', ramai: 'ramai' };
  function nalaItems(id, { hasCode = true, load = 'coba' } = {}) {
    const r = recipe(id);
    return r.items.map((it) => {
      const c = { ...it };
      if (c.svc === 'ai' && c.unit === 'sesi' && !hasCode) c.qty += 10;
      if (c.svc === 'hosting' || c.svc === 'apps') {
        const min = c.svc === 'apps' ? (TEMPLATES[c.tpl].minAi || TEMPLATES[c.tpl].minNoAi) : 'coba';
        if (load === 'coba') c.size = min;
        else if (SIZE_ORDER.indexOf(c.size) < SIZE_ORDER.indexOf(LOAD_SIZE[load])) c.size = LOAD_SIZE[load];
        if (SIZE_ORDER.indexOf(c.size) < SIZE_ORDER.indexOf(min)) c.size = min;
      }
      return c;
    });
  }
  /** Does Q2 ("is the code ready?") apply? Only recipes measured in small sessions. */
  const askCode = (id) => (recipe(id).items || []).some((it) => it.svc === 'ai' && it.unit === 'sesi');

  /** URL schema `s` (§6): hosting:coba,domain:my.id,ai:10 · apps use the template id (wa-bot:rutin). */
  function serialize(items) {
    return items.map((it) => {
      if (it.svc === 'ai') return `${it.unit === 'sesi' ? 'ai' : it.unit}:${it.qty}`;
      if (it.svc === 'domain') return `domain:${it.ext}`;
      if (it.svc === 'apps') return `${it.tpl}:${it.size}`;
      return `${it.svc}:${it.size}`;
    }).join(',');
  }

  return {
    TOPUPS, TOPUP_MIN, REMINDER_BELOW, UNITS, SIZES, SIZE_ORDER, GROUPS, ICONS, SERVER, DATABASE, STORAGE, DOMAINS,
    EMAIL, PAYMENTS, TEMPLATES, TEMPLATE_ICONS, FROM, RECIPES, AI_ONLY, EXAMPLE, HERO, MODELS, PREVIEW_MODELS,
    PROVIDER_ICON, API, RULES, GUIDES,
    suggestTopup, usageCost, sessionCost, sessionsPer, itemCost, recipe, recipeTotals, coverMonths, roundK,
    refund, prorata, balanceUntil, heroScenario, exampleTotals, templateCost, templateMin, nalaItems, askCode, serialize,
  };
})();
