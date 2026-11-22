/* TokenNyala v4 — live chat Nala (port of v3: scripted, local only — no AI, no server).
   New flow "Bantu pilih paket" (microcopy §7, services-and-pricing §6 Aturan Nala):
   Q1 recipe → Q2 code ready? (session recipes only) → Q3 load → recipe card → wizard / calculator.
   Messages are stored as keys + params so the whole log re-translates on language change. */
(() => {
  'use strict';
  const D = TN.data;
  const I = TN.i18n;
  const { t, rp, rpK } = I;

  const dlg = document.getElementById('chat');
  if (!dlg) return;
  const launcher = document.getElementById('chat-launcher');
  const log = dlg.querySelector('[data-chat-log]');
  const input = document.getElementById('chat-input');
  const desktop = window.matchMedia('(min-width: 48rem)'); // md: non-modal panel
  const TYPING_DELAY = 500; // ≤ 600ms (v3 spec)

  // message: { from: 'nala'|'sari'|'user'|'system', key?, params?, text?, actions?: [{ key, href?, run? }] }
  const chat = { messages: [], chips: 'main', mode: 'bot', flow: null, typing: null, opener: null, skipFocus: false };

  const RECIPE_IDS = D.RECIPES.map((r) => r.id);
  const CHIP_SETS = {
    main: ['chip.recipe', 'chip.howto', 'chip.models', 'chip.server', 'chip.pay', 'chip.team'],
    recipe: RECIPE_IDS.map((id) => `recipe.short.${id}`),
    code: ['nala.codeYes', 'nala.codeNo'],
    load: ['nala.load.coba', 'nala.load.rutin', 'nala.load.ramai'],
    result: ['chip.restart', 'chip.team'],
    none: [],
  };
  const KEYWORDS = [ // free text → intent (ID + EN)
    ['team', /\b(tim|team|manusia|human|agen|agent|cs|admin|orang)\b/i],
    ['apps', /\b(aplikasi|apps?|n8n|dify|wordpress|openclaw|hermes)\b/i],
    ['server', /\b(server|vps|nat|ssh|linux|port)\b/i],
    ['chatai', /(chat ?ai|ai ?chat|playground|lampir|upload|unggah|attach|gambar|foto|image|suara|audio|voice|video)/i],
    ['recipe', /\b(paket|bundle|resep|recipe|bikin|build|buat|landing|portofolio|portfolio|chatbot|otomasi|automation|website|web|harga|price|berapa|how much)\b/i],
    ['howto', /\b(api|key|tool|pasang|setup|cursor|cline|lovable|cara pakai)\b/i],
    ['models', /\b(model|claude|gpt|gemini|deepseek|qwen)\b/i],
    ['pay', /\b(bayar|pay|payment|qris|e-?wallet|virtual account|va|dana|gopay|ovo|isi saldo|top ?up)\b/i],
  ];
  const RECIPE_WORDS = [ // Q1 free text → recipe
    ['ai-coding', /\b(ai coding|coding|cursor|lovable|cline|api key)\b/i],
    ['chatbot-wa', /\b(chatbot|whatsapp|wa|bot)\b/i],
    ['otomasi-tim', /\b(otomasi|automation|n8n|workflow|tim|team)\b/i],
    ['web-klien', /\b(klien|client|form|toko|shop)\b/i],
    ['portofolio', /\b(landing|portofolio|portfolio|web|website|halaman|page)\b/i],
  ];

  function teamOnline() {
    const forced = new URLSearchParams(location.search).get('chat'); // QA override: ?chat=online|offline
    if (forced === 'online') return true;
    if (forced === 'offline') return false;
    const now = new Date();
    const wib = new Date(now.getTime() + (now.getTimezoneOffset() + 7 * 60) * 60000); // UTC+7
    return wib.getDay() >= 1 && wib.getDay() <= 5 && wib.getHours() >= 9 && wib.getHours() < 18;
  }

  const resolve = (params = {}) => Object.fromEntries(Object.entries(params).map(([k, v]) => [k, typeof v === 'function' ? v() : v]));

  function bubble(msg) {
    const row = document.createElement('div');
    const text = msg.text ?? t(msg.key, resolve(msg.params));
    if (msg.from === 'system') {
      row.className = 'chat__system text-center text-[.8rem] font-bold text-muted';
      row.textContent = text;
      return row;
    }
    const mine = msg.from === 'user';
    row.className = `chat__msg ${mine ? 'chat__msg--user justify-end' : 'items-end gap-2'} flex`;
    if (!mine) {
      row.insertAdjacentHTML('beforeend', msg.from === 'sari'
        ? '<span aria-hidden="true" class="chat__agent grid size-7 shrink-0 place-items-center rounded-full bg-xl-teal text-[.75rem] font-extrabold text-xl-dark">S</span>'
        : '<img src="assets/img/tokennyala-mark.svg" alt="" width="28" height="28" class="size-7 shrink-0 rounded-full">');
    }
    const box = document.createElement('div');
    box.className = `chat__bubble max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[.95rem] leading-relaxed ${mine ? 'rounded-br-md bg-xl-blue text-white' : 'rounded-bl-md border border-line bg-white text-ink'}`;
    if (msg.from === 'sari') {
      box.insertAdjacentHTML('beforeend', `<span class="chat__tag mb-1 flex items-center gap-1.5 text-[.8rem] font-extrabold text-xl-dark">${t('agent.name')}<span class="rounded-full bg-xl-teal/20 px-1.5 py-px text-[.7rem] text-teal-ink">${t('agent.badge')}</span></span>`);
    }
    const p = document.createElement('p');
    p.textContent = text;
    const who = document.createElement('span');
    who.className = 'sr-only';
    who.textContent = mine ? '' : `${t(msg.from === 'sari' ? 'agent.name' : 'chat.name')}: `;
    p.prepend(who);
    box.append(p);
    (msg.actions || []).forEach((a, i) => {
      const el = document.createElement(a.href ? 'a' : 'button');
      if (a.href) el.href = typeof a.href === 'function' ? a.href() : a.href; else el.type = 'button';
      el.className = `btn mt-2.5 w-full text-[.92rem] ${i ? 'btn--ghost btn--outline-dark' : 'btn--primary'}`;
      el.textContent = t(a.key);
      if (a.run) el.addEventListener('click', a.run);
      box.append(el);
    });
    row.append(box);
    return row;
  }

  function render() {
    const items = chat.messages.map(bubble);
    if (chat.typing) {
      const el = document.createElement('div');
      el.className = 'chat__typing text-[.8rem] font-bold text-muted';
      el.textContent = t(chat.typing);
      items.push(el);
    }
    log.replaceChildren(...items);
    const chips = dlg.querySelector('[data-chat-chips]');
    chips.replaceChildren(...CHIP_SETS[chat.chips].map((key) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chat__chip inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full border border-xl-blue/40 bg-white px-3.5 text-[.92rem] font-bold text-xl-blue hover:bg-xl-blue hover:text-white';
      b.textContent = t(key);
      b.addEventListener('click', () => handle(t(key), key));
      return b;
    }));
    const team = chat.mode === 'team';
    const offline = chat.mode.startsWith('offline');
    dlg.querySelector('[data-chat-title]').textContent = t('chat.name');
    dlg.querySelector('[data-chat-status]').textContent = t(team ? 'agent.status' : 'chat.status');
    const label = dlg.querySelector('[data-chat-mode-label]');
    label.dataset.show = String(team || offline);
    label.textContent = team ? `${t('team.mode')} · ${t('team.hours')}` : t('team.hours');
    const contactMode = chat.mode === 'offline';
    dlg.querySelector('[data-chat-input-label]').textContent = t(contactMode ? 'chat.placeholderContact' : 'chat.input');
    input.placeholder = t(contactMode ? 'chat.placeholderContact' : 'chat.placeholder');
    input.setAttribute('inputmode', contactMode ? 'email' : 'text');
    requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; }); // after chips change the log height
  }

  function reply(msgs, { chips = 'main', typing = 'typing.nala' } = {}) {
    chat.chips = 'none';
    chat.typing = typing;
    render();
    setTimeout(() => {
      chat.typing = null;
      chat.messages.push(...[].concat(msgs));
      chat.chips = chips;
      render();
    }, TYPING_DELAY);
  }

  const leaveThen = (fn) => () => { close({ returnFocus: false }); setTimeout(fn, 0); };

  /* ---- recipe flow ---- */
  function startRecipe() { chat.flow = { name: 'recipe' }; reply({ from: 'nala', key: 'nala.q1' }, { chips: 'recipe' }); }

  function recipeResult(f) {
    chat.flow = null;
    if (D.recipe(f.recipe).aiOnly) {
      const row = D.AI_ONLY[0];
      return reply({ from: 'nala', key: 'nala.resultAi', params: { rp: () => rp(row.amount), range: row.range },
        actions: [{ key: 'recipe.aiOnlyCta', href: 'app.html#/ai?isi=1' }] }, { chips: 'result' });
    }
    const items = D.nalaItems(f.recipe, { hasCode: f.hasCode !== false, load: f.load });
    const s = D.serialize(items);
    const per = D.recipeTotals(items).perMonth;
    reply({ from: 'nala', key: 'nala.result', params: { recipe: () => t(`recipe.name.${f.recipe}`), rp: () => rpK(per) },
      actions: [
        { key: 'recipe.cta', href: `app.html#/buat?paket=${f.recipe}&s=${s}` },
        { key: 'recipe.edit', href: `harga.html?paket=${f.recipe}&s=${s}#kalkulator` },
      ] }, { chips: 'result' });
  }

  function goTeam() {
    chat.flow = null;
    chat.messages.push({ from: 'system', key: 'team.connecting' });
    if (teamOnline()) {
      chat.mode = 'team';
      reply({ from: 'sari', key: 'agent.greeting' }, { chips: 'none', typing: 'typing.sari' });
    } else {
      chat.mode = 'offline';
      reply({ from: 'nala', key: 'team.offline' }, { chips: 'none' });
    }
  }

  function handle(text, chipKey = null) {
    const value = text.trim();
    if (!value) return;
    chat.messages.push({ from: 'user', text: value });

    if (chat.mode === 'offline') { // the input collects a contact; shown once, never stored
      const c = TN.ui.parseContact(value);
      if (!c.ok) return reply({ from: 'nala', key: c.error }, { chips: 'none' });
      chat.mode = 'offline-done';
      return reply({ from: 'nala', key: 'team.offlineThanks', params: { contact: c.value } });
    }
    if (chat.mode === 'team') return reply({ from: 'sari', key: 'agent.reply' }, { chips: 'none', typing: 'typing.sari' });

    const has = (re) => re.test(value);
    const f = chat.flow;
    if (f?.name === 'recipe') {
      if (!f.recipe) {
        const id = chipKey?.startsWith('recipe.short.') ? chipKey.slice(13) : RECIPE_WORDS.find(([, re]) => has(re))?.[0];
        if (id) {
          f.recipe = id;
          if (D.recipe(id).aiOnly) return recipeResult(f);
          if (D.askCode(id)) return reply({ from: 'nala', key: 'nala.q2' }, { chips: 'code' });
          return reply({ from: 'nala', key: 'nala.q3' }, { chips: 'load' });
        }
      } else if (f.hasCode === undefined && D.askCode(f.recipe)) {
        if (chipKey === 'nala.codeYes' || chipKey === 'nala.codeNo' || has(/\b(sudah|ada|yes|ya|belum|not|no|tidak)\b/i)) {
          f.hasCode = chipKey ? chipKey === 'nala.codeYes' : !has(/\b(belum|not|no|tidak)\b/i);
          return reply({ from: 'nala', key: 'nala.q3' }, { chips: 'load' });
        }
      } else {
        const load = chipKey?.startsWith('nala.load.') ? chipKey.slice(10)
          : has(/\b(ramai|busy|banyak)\b/i) ? 'ramai' : has(/\b(rutin|regular|sering)\b/i) ? 'rutin' : has(/\b(coba|trying|sedikit|baru)\b/i) ? 'coba' : null;
        if (load) { f.load = load; return recipeResult(f); }
      }
    }

    const intent = { 'chip.recipe': 'recipe', 'chip.restart': 'recipe', 'chip.howto': 'howto', 'chip.models': 'models', 'chip.server': 'server', 'chip.pay': 'pay', 'chip.team': 'team' }[chipKey]
      ?? KEYWORDS.find(([, re]) => has(re))?.[0];
    chat.flow = null;
    if (intent === 'recipe') return startRecipe();
    if (intent === 'team') return goTeam();
    if (intent === 'howto') {
      const guide = document.getElementById('pakai')
        ? { key: 'ans.guideBtn', run: leaveThen(() => document.getElementById('pakai').scrollIntoView({ block: 'start' })) }
        : { key: 'ans.guideBtn', href: document.getElementById('view') ? '#/ai' : 'index.html#pakai' };
      return reply({ from: 'nala', key: 'ans.howto', actions: [guide] });
    }
    if (intent === 'models') {
      const models = TN.landing?.openCatalog
        ? { key: 'ans.modelsBtn', run: leaveThen(() => TN.landing.openCatalog(launcher)) }
        : document.getElementById('ai')
          ? { key: 'ans.modelsBtn', run: leaveThen(() => document.getElementById('ai').scrollIntoView({ block: 'start' })) }
          : { key: 'ans.modelsBtn', href: '#/ai' };
      return reply({ from: 'nala', key: 'ans.models', actions: [models] });
    }
    if (intent === 'pay') return reply({ from: 'nala', key: 'ans.pay' });
    // console menus: same route inside the console, app.html#… from the landing / harga
    const inConsole = Boolean(document.getElementById('view'));
    const go = (route) => (inConsole ? route : `app.html${route}`);
    if (intent === 'server') {
      return reply({ from: 'nala', key: 'ans.server', params: { nat: () => rp(D.FROM.nat.price), server: () => rp(D.FROM.server.price), n: D.NAT_PORTS },
        actions: inConsole ? [{ key: 'ans.serverBtn', href: '#/layanan/nat' }] : [{ key: 'ans.serverPrices', href: 'harga.html#detail-nat' }] });
    }
    if (intent === 'apps') {
      return reply({ from: 'nala', key: 'ans.apps', params: { list: () => Object.keys(D.TEMPLATES).map((id) => t(`tpl.${id}.name`)).join(', '), rp: () => rp(D.FROM.apps.price) },
        actions: [{ key: 'ans.appsBtn', href: go('#/aplikasi') }] });
    }
    if (intent === 'chatai') return reply({ from: 'nala', key: 'ans.chatai', actions: [{ key: 'ans.chataiBtn', href: go('#/chat') }] });
    reply({ from: 'nala', key: 'ans.fallback' });
  }

  function reset() {
    chat.messages = [{ from: 'nala', key: 'chat.greeting' }];
    chat.chips = 'main'; chat.mode = 'bot'; chat.flow = null; chat.typing = null;
    render();
  }

  function open(opener = document.activeElement) {
    document.querySelectorAll('dialog[open]').forEach((d) => { if (d !== dlg) d.close(); });
    TN.ui.setMenu(false);
    chat.opener = opener;
    if (!chat.messages.length) reset();
    if (desktop.matches) dlg.show(); // non-modal panel: page stays usable
    else { dlg.showModal(); document.documentElement.classList.add('overflow-hidden'); }
    launcher?.setAttribute('aria-expanded', 'true');
    render();
    input.focus();
  }

  function close({ returnFocus = true } = {}) {
    if (!dlg.open) return;
    chat.skipFocus = !returnFocus;
    dlg.close();
  }

  dlg.addEventListener('close', () => {
    document.documentElement.classList.remove('overflow-hidden');
    launcher?.setAttribute('aria-expanded', 'false');
    if (!chat.skipFocus && TN.ui.focusIsFree(dlg)) (launcher?.getClientRects().length ? launcher : chat.opener)?.focus();
    chat.skipFocus = false;
  });
  // Escape: native for the modal (mobile); handled here for the non-modal panel (desktop)
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !dlg.open || dlg.matches(':modal') || document.querySelector('dialog:modal')) return;
    e.preventDefault();
    close();
  });
  dlg.querySelector('[data-chat-close]').addEventListener('click', () => close());
  dlg.querySelector('[data-chat-restart]').addEventListener('click', () => { reset(); input.focus(); });
  dlg.querySelector('[data-chat-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = '';
    handle(v);
  });
  desktop.addEventListener('change', () => { if (dlg.open) { chat.skipFocus = true; dlg.close(); open(chat.opener); } });
  document.querySelectorAll('[data-open-chat]').forEach((b) => b.addEventListener('click', () => open(b)));
  I.onChange(() => { if (dlg.open) render(); });

  TN.nala = { open, close, handle, get state() { return chat; } };
})();
