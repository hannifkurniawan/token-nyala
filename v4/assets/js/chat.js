/* TokenNyala v4 — console: Chat AI #/chat (own menu since 22 Nov 2026; was the "Coba AI" tab of #/ai).
   Conversations list · new chat · model picker (Hemat / Seimbang / Premium) · scripted replies charged per reply from the
   same Rupiah balance · export as text. Conversations live in memory only (never in localStorage): prompts may hold
   personal data, so they are gone when the tab closes — "Ekspor riwayat" keeps a copy on the user's device. */
(() => {
  'use strict';
  const D = TN.data;
  const I = TN.i18n;
  const S = TN.store;
  const C = TN.console;
  const { t, rp, num } = I;
  const { icon, esc } = TN.ui;
  const { h1, toast } = C;
  const view = C.view;
  const TIER_STYLE = { hemat: 'bg-xl-teal text-xl-dark', seimbang: 'bg-xl-sky text-xl-dark', premium: 'bg-xl-yellow text-xl-dark' };
  const ui = { model: 'deepseek-chat', chats: [], current: null, busy: false, seq: 0 };
  const estimate = (text) => ({ tin: 400 + Math.ceil(text.length / 4), tout: 350 });
  const cur = () => ui.chats.find((c) => c.id === ui.current) || null;
  const spent = (c) => c.msgs.reduce((n, m) => n + (m.cost || 0), 0);
  const titleOf = (c) => { const first = c.msgs.find((m) => m.from === 'user'); return first ? first.text.slice(0, 48) + (first.text.length > 48 ? '…' : '') : t('chatp.untitled'); };

  C.ROUTES.chat = {
    title: () => t('nav.chat'),
    html: () => `<div class="pb-16" data-chat-root>${h1(t('nav.chat'), t('chatp.lead'))}
      <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">${sidebar()}${panel()}</div></div>`,
    mount: () => mount(),
  };

  function sidebar() {
    const list = ui.chats.slice().reverse().map((c) => `<li><button type="button" class="flex min-h-11 w-full flex-col items-start rounded-control px-3 py-2 text-left hover:bg-paper aria-[current=true]:bg-xl-dark aria-[current=true]:text-white" data-chat-open="${c.id}" ${c.id === ui.current ? 'aria-current="true"' : ''}>
        <span class="w-full truncate font-bold">${esc(titleOf(c))}</span><span class="font-mono text-[.75rem] opacity-80">${esc(t('chatp.count', { n: c.msgs.filter((m) => m.from === 'user').length }))} · ${esc(rp(spent(c)))}</span></button></li>`).join('');
    return `<aside class="card p-3 sm:p-4" aria-labelledby="chat-list-title">
      <button type="button" class="btn w-full" data-chat-new>${icon('plus', 'icon size-5')}${esc(t('chatp.new'))}</button>
      <h2 id="chat-list-title" class="mt-4 px-1 font-mono text-[.72rem] tracking-[.08em] text-muted uppercase">${esc(t('chatp.list'))}</h2>
      ${list ? `<ul class="mt-2 grid max-h-56 grid-cols-1 gap-1 overflow-y-auto lg:max-h-[28rem]">${list}</ul>` : `<p class="mt-2 px-1 text-[.9rem] text-lead-ink">${esc(t('chatp.none'))}</p>`}
      <button type="button" class="btn btn--ghost mt-3 w-full px-3" data-chat-export ${ui.chats.some((c) => c.msgs.length) ? '' : 'disabled'}>${icon('download', 'icon size-5')}${esc(t('chatp.export'))}</button>
      <p class="mt-2 px-1 text-[.8rem] text-muted">${esc(t('chatp.privacy'))}</p></aside>`;
  }

  function panel() {
    const m = D.MODELS.find((x) => x.id === ui.model);
    const c = cur();
    const msgs = (c?.msgs || []).map((x) => (x.from === 'user'
      ? `<div class="flex justify-end"><p class="max-w-[85%] rounded-2xl rounded-br-md bg-xl-blue px-3.5 py-2.5 text-white">${esc(x.text)}</p></div>`
      : `<div class="max-w-[85%] rounded-2xl rounded-bl-md border border-line bg-white px-3.5 py-2.5"><p>${esc(x.thinking ? t('ai.try.thinking', { model: x.model }) : t('ai.try.reply', { model: x.model }))}</p>${x.cost ? `<p class="mt-1.5 font-mono text-[.75rem] text-muted">${esc(t('ai.try.cost', { model: x.model, tin: num(x.tin), tout: num(x.tout), rp: rp(x.cost) }))}</p>` : ''}</div>`)).join('');
    const sample = estimate('x'.repeat(200));
    const examples = `<p class="font-bold">${esc(t('ai.try.examples'))}</p>
      <ul class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">${[1, 2, 3].map((n) => `<li><button type="button" class="min-h-11 w-full rounded-control border border-line bg-paper px-3 py-2 text-left text-[.92rem] font-bold hover:border-xl-blue" data-example="${n}">${esc(t(`ai.try.ex${n}`))}</button></li>`).join('')}</ul>`;
    return `<section class="card flex min-h-[28rem] flex-col p-4 sm:p-5" aria-labelledby="chat-title">
      <div class="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="chat-title" class="min-w-0 truncate text-lg font-extrabold">${esc(c ? titleOf(c) : t('chatp.untitled'))}</h2>
        <div class="sm:w-72"><label for="try-model" class="block text-[.88rem] font-bold">${esc(t('ai.try.model'))}</label>
          <select id="try-model" class="field mt-1" data-try-model>${D.MODELS.map((x) => `<option value="${x.id}" ${x.id === ui.model ? 'selected' : ''}>${esc(x.name)} · ${esc(t(`tier.${x.tier}`))}</option>`).join('')}</select></div></div>
      <p class="mt-3 flex flex-wrap items-center gap-2 text-[.85rem] text-muted"><span class="rounded-full px-2.5 py-0.5 font-mono text-[.72rem] font-medium ${TIER_STYLE[m.tier]}">${esc(t(`tier.${m.tier}`))}</span>${esc(t('chatp.perReply', { rp: rp(S.chatCost(m, sample.tin, sample.tout)) }))}</p>
      <div class="mt-4 min-h-0 flex-1 space-y-3" role="log" aria-live="polite" aria-label="${esc(t('ai.try.logAria'))}">${msgs || `<p class="text-lead-ink">${esc(t('ai.try.empty'))}</p>`}</div>
      ${c?.msgs.length ? `<p class="mt-4 font-mono text-[.78rem] text-muted">${esc(t('chatp.spent', { rp: rp(spent(c)) }))}</p>` : `<div class="mt-4">${examples}</div>`}
      <form class="mt-4 flex items-end gap-2 border-t border-line pt-4" data-try-form novalidate>
        <div class="min-w-0 flex-1"><label for="try-input" class="sr-only">${esc(t('ai.try.input'))}</label>
          <textarea id="try-input" rows="2" class="field py-2.5" placeholder="${esc(t('ai.try.ph'))}"></textarea></div>
        <button type="submit" class="btn shrink-0 px-4" ${ui.busy ? 'disabled' : ''}>${icon('send', 'icon size-5')}<span class="sr-only sm:not-sr-only">${esc(t('ai.try.send'))}</span></button></form></section>`;
  }

  function newChat() {
    const c = { id: `c${++ui.seq}`, msgs: [] };
    ui.chats.push(c);
    ui.current = c.id;
    return c;
  }
  function send(text) {
    const value = text.trim();
    if (!value || ui.busy) return;
    const c = cur() || newChat();
    const m = D.MODELS.find((x) => x.id === ui.model);
    const { tin, tout } = estimate(value);
    c.msgs.push({ from: 'user', text: value });
    if (S.chatCost(m, tin, tout) > S.state.balance) {
      C.render({ focus: false });
      toast(t('ai.try.short'));
      return C.openTopup({ amount: D.TOPUP_MIN });
    }
    const reply = { from: 'ai', model: m.name, thinking: true };
    c.msgs.push(reply);
    ui.busy = true;
    C.render({ focus: false });
    setTimeout(() => {
      const res = S.chargeChat({ model: m, tin, tout });
      Object.assign(reply, { thinking: false, cost: res.cost, tin, tout });
      ui.busy = false;
      if (location.hash.startsWith('#/chat')) { C.render({ focus: false }); view.querySelector('#try-input')?.focus(); }
    }, 600);
  }
  function exportText() {
    const lines = [`TokenNyala — ${t('nav.chat')} · ${S.state.clock}`, ''];
    ui.chats.filter((c) => c.msgs.length).forEach((c, i) => {
      lines.push(`## ${i + 1}. ${titleOf(c)}`);
      c.msgs.forEach((x) => lines.push(x.from === 'user' ? `> ${x.text}` : `${x.model}: ${t('ai.try.reply', { model: x.model })} (${rp(x.cost || 0)})`));
      lines.push('');
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    a.download = `tokennyala-chat-${S.state.clock}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast(t('chatp.exported'));
  }

  function mount() {
    const root = view.querySelector('[data-chat-root]');
    root.querySelector('[data-chat-new]').addEventListener('click', () => {
      if (!cur()?.msgs.length && cur()) { view.querySelector('#try-input')?.focus(); return; } // already on an empty chat
      newChat(); C.render({ focus: false }); view.querySelector('#try-input')?.focus();
    });
    root.querySelector('[data-chat-export]').addEventListener('click', exportText);
    root.querySelector('[data-try-model]').addEventListener('change', (e) => { ui.model = e.target.value; C.render({ focus: false }); view.querySelector('#try-model')?.focus(); });
    root.querySelector('[data-try-form]').addEventListener('submit', (e) => { e.preventDefault(); send(view.querySelector('#try-input').value); });
    root.querySelector('#try-input').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e.target.value); } });
    root.addEventListener('click', (e) => {
      const ex = e.target.closest('[data-example]');
      if (ex) return send(t(`ai.try.ex${ex.dataset.example}`));
      const open = e.target.closest('[data-chat-open]');
      if (open) { ui.current = open.dataset.chatOpen; C.render({ focus: false }); view.querySelector(`[data-chat-open="${ui.current}"]`)?.focus(); }
    });
  }
})();
