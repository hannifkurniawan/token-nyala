/* TokenNyala v4 — console: Chat AI #/chat (own menu since 22 Nov 2026; was the "Coba AI" tab of #/ai).
   Conversations list · new chat · model picker (Hemat / Seimbang / Premium) · scripted replies charged per reply from the
   same Rupiah balance · export as text. Conversations live in memory only (never in localStorage): prompts may hold
   personal data, so they are gone when the tab closes — "Ekspor riwayat" keeps a copy on the user's device.
   Attachments (22 Nov 2026, services-and-pricing §5.2): images, audio and video for the model to read — button, drag & drop,
   paste. Files are read in the browser only (object URLs), never uploaded or stored. Each one becomes input tokens
   (data.js ATTACH) charged at the chosen model's rate; models that cannot read a kind say so and offer one that can. */
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
  const KIND_ICON = { image: 'image', audio: 'mic', video: 'video' };
  const ui = { model: 'deepseek-chat', chats: [], current: null, busy: false, seq: 0, draft: '', pending: [], note: null, fseq: 0 };
  const cur = () => ui.chats.find((c) => c.id === ui.current) || null;
  const model = () => D.MODELS.find((x) => x.id === ui.model);
  const spent = (c) => c.msgs.reduce((n, m) => n + (m.cost || 0), 0);
  const fileLabel = (f) => `[${t(`chatp.kind.${f.kind}`)}: ${f.name}]`;
  const titleOf = (c) => {
    const first = c.msgs.find((m) => m.from === 'user');
    if (!first) return t('chatp.untitled');
    const text = first.text || first.files.map(fileLabel).join(' ');
    return text.slice(0, 48) + (text.length > 48 ? '…' : '');
  };
  /** Input/output tokens for one message: prompt overhead + text + every attachment. */
  const estimate = (text, files = []) => ({ tin: 400 + Math.ceil(text.length / 4) + files.reduce((n, f) => n + D.attachTokens(f), 0), tout: 350 });
  const mb = (bytes) => (bytes < 1e6 ? `${num(Math.max(1, Math.ceil(bytes / 1e3)))} KB` : `${num(Math.round(bytes / 1e5) / 10)} MB`);
  const clock = (sec) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;
  const limitText = (sec) => t('chatp.minutes', { n: sec / 60 });
  const kindsOf = (files) => [...new Set(files.map((f) => f.kind))];
  const unreadable = (m, files) => kindsOf(files).filter((k) => !m.reads.includes(k));
  /** Cheapest model that reads every kind in the pending files */
  const suggestFor = (files) => D.MODELS.filter((m) => kindsOf(files).every((k) => m.reads.includes(k))).sort((a, b) => a.session - b.session)[0];
  const readsLine = (m) => (m.reads.length ? [t('chatp.text'), ...m.reads.map((k) => t(`chatp.kind.${k}`))].join(' · ') : t('chatp.textOnly'));

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

  const fileMeta = (f) => [t(`chatp.kind.${f.kind}`), mb(f.size), f.kind === 'image' ? '' : clock(f.sec)].filter(Boolean).join(' · ');
  const thumb = (f, size = 'size-10') => (f.kind === 'image'
    ? `<img src="${f.url}" alt="" class="${size} shrink-0 rounded-[8px] object-cover">`
    : `<span class="grid ${size} shrink-0 place-items-center rounded-[8px] bg-xl-dark text-white" aria-hidden="true">${icon(KIND_ICON[f.kind], 'icon size-5')}</span>`);
  function msgFiles(files, mine) {
    if (!files?.length) return '';
    return `<ul class="mt-2 flex flex-wrap gap-2 ${mine ? 'justify-end' : ''}" aria-label="${esc(t('chatp.attachList'))}">${files.map((f) => `<li class="flex max-w-full items-center gap-2 rounded-control bg-white/15 p-1 pr-2.5 ${mine ? '' : 'border border-line'}">${thumb(f)}
      <span class="min-w-0"><span class="block max-w-[12rem] truncate text-[.85rem] font-bold">${esc(f.name)}</span><span class="font-mono text-[.72rem] opacity-80">${esc(fileMeta(f))}</span></span></li>`).join('')}</ul>`;
  }

  function panel() {
    const m = model();
    const c = cur();
    const msgs = (c?.msgs || []).map((x) => (x.from === 'user'
      ? `<div class="flex flex-col items-end"><div class="max-w-[85%] rounded-2xl rounded-br-md bg-xl-blue px-3.5 py-2.5 text-white">${x.text ? `<p>${esc(x.text)}</p>` : ''}${msgFiles(x.files, true)}</div></div>`
      : `<div class="max-w-[85%] rounded-2xl rounded-bl-md border border-line bg-white px-3.5 py-2.5"><p>${esc(x.thinking ? t('ai.try.thinking', { model: x.model }) : x.files ? t('ai.try.replyAttach', { model: x.model, n: x.files }) : t('ai.try.reply', { model: x.model }))}</p>${x.cost ? `<p class="mt-1.5 font-mono text-[.75rem] text-muted">${esc(t('ai.try.cost', { model: x.model, tin: num(x.tin), tout: num(x.tout), rp: rp(x.cost) }))}</p>` : ''}</div>`)).join('');
    const sample = estimate('x'.repeat(200));
    const examples = `<p class="font-bold">${esc(t('ai.try.examples'))}</p>
      <ul class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">${[1, 2, 3].map((n) => `<li><button type="button" class="min-h-11 w-full rounded-control border border-line bg-paper px-3 py-2 text-left text-[.92rem] font-bold hover:border-xl-blue" data-example="${n}">${esc(t(`ai.try.ex${n}`))}</button></li>`).join('')}</ul>`;
    // pending attachments + estimate + "this model can't read …"
    const bad = unreadable(m, ui.pending);
    const alt = bad.length ? suggestFor(ui.pending) : null;
    const pending = ui.pending.length ? `<ul class="flex flex-wrap gap-2" aria-label="${esc(t('chatp.attachList'))}" data-pending>${ui.pending.map((f) => `<li class="flex max-w-full items-center gap-2 rounded-control border ${m.reads.includes(f.kind) ? 'border-line' : 'border-red-700'} bg-paper p-1">${thumb(f)}
        <span class="min-w-0"><span class="block max-w-[11rem] truncate text-[.85rem] font-bold">${esc(f.name)}</span><span class="font-mono text-[.72rem] text-muted">${esc(fileMeta(f))}</span></span>
        <button type="button" class="grid size-11 shrink-0 place-items-center rounded-control text-muted hover:bg-white hover:text-xl-dark" data-file-remove="${f.id}" aria-label="${esc(t('chatp.remove', { name: f.name }))}">${icon('x', 'icon size-5')}</button></li>`).join('')}</ul>
      ${bad.length ? `<div class="flex flex-col gap-2 rounded-control bg-red-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between" data-cant-read><p class="font-bold text-red-800">${esc(t('chatp.err.model', { model: m.name, kind: bad.map((k) => t(`chatp.kind.${k}`)).join(', ') }))}</p>
        ${alt ? `<button type="button" class="btn btn--ghost min-h-11 shrink-0 px-4" data-switch-model="${alt.id}">${esc(t('chatp.switch', { model: alt.name, tier: t(`tier.${alt.tier}`) }))}</button>` : ''}</div>`
        : `<p class="font-mono text-[.78rem] text-lead-ink" data-estimate>${esc(t('chatp.estimate', { rp: rp(S.chatCost(m, estimate(ui.draft, ui.pending).tin, 350)), n: ui.pending.length }))}</p>`}` : '';
    const note = ui.note ? `<p class="font-bold text-red-800" data-attach-note>${esc(t(ui.note.key, ui.note.vars))}</p>` : '';
    return `<section class="card flex min-h-[28rem] flex-col p-4 sm:p-5 data-[drag]:ring-4 data-[drag]:ring-xl-yellow" aria-labelledby="chat-title" data-drop>
      <div class="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="chat-title" class="min-w-0 truncate text-lg font-extrabold">${esc(c ? titleOf(c) : t('chatp.untitled'))}</h2>
        <div class="sm:w-72"><label for="try-model" class="block text-[.88rem] font-bold">${esc(t('ai.try.model'))}</label>
          <select id="try-model" class="field mt-1" data-try-model>${D.MODELS.map((x) => `<option value="${x.id}" ${x.id === ui.model ? 'selected' : ''}>${esc(x.name)} · ${esc(t(`tier.${x.tier}`))}</option>`).join('')}</select></div></div>
      <p class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[.85rem] text-muted"><span class="rounded-full px-2.5 py-0.5 font-mono text-[.72rem] font-medium ${TIER_STYLE[m.tier]}">${esc(t(`tier.${m.tier}`))}</span><span>${esc(t('chatp.perReply', { rp: rp(S.chatCost(m, sample.tin, sample.tout)) }))}</span>
        <span class="inline-flex items-center gap-1.5">${m.reads.map((k) => icon(KIND_ICON[k], 'icon size-4 text-xl-blue')).join('')}${esc(t('chatp.reads', { list: readsLine(m) }))}</span></p>
      <div class="mt-4 min-h-0 flex-1 space-y-3" role="log" aria-live="polite" aria-label="${esc(t('ai.try.logAria'))}">${msgs || `<p class="text-lead-ink">${esc(t('ai.try.empty'))}</p>`}</div>
      ${c?.msgs.length ? `<p class="mt-4 font-mono text-[.78rem] text-muted">${esc(t('chatp.spent', { rp: rp(spent(c)) }))}</p>` : `<div class="mt-4">${examples}</div>`}
      <form class="mt-4 grid grid-cols-1 gap-3 border-t border-line pt-4" data-try-form novalidate>
        ${pending}${note}
        <div class="flex items-end gap-2">
          <input type="file" id="chat-file" class="sr-only" tabindex="-1" multiple accept="image/*,audio/*,video/*" aria-label="${esc(t('chatp.attach'))}" data-chat-file>
          <button type="button" class="grid size-12 shrink-0 place-items-center rounded-control border-2 border-line bg-white text-xl-dark hover:border-xl-blue" data-attach aria-label="${esc(t('chatp.attach'))}" aria-describedby="attach-hint">${icon('paperclip', 'icon size-5')}</button>
          <div class="min-w-0 flex-1"><label for="try-input" class="sr-only">${esc(t('ai.try.input'))}</label>
            <textarea id="try-input" rows="2" class="field py-2.5" placeholder="${esc(t('ai.try.ph'))}">${esc(ui.draft)}</textarea></div>
          <button type="submit" class="btn shrink-0 px-4" ${ui.busy ? 'disabled' : ''}>${icon('send', 'icon size-5')}<span class="sr-only sm:not-sr-only">${esc(t('ai.try.send'))}</span></button></div>
        <p id="attach-hint" class="text-[.8rem] text-muted">${esc(t('chatp.attachHint', { img: D.ATTACH.image.maxMB, n: D.ATTACH.image.maxCount, aud: D.ATTACH.audio.maxMB, audMin: D.ATTACH.audio.maxSec / 60, vid: D.ATTACH.video.maxMB, vidMin: D.ATTACH.video.maxSec / 60 }))}</p>
        <p class="sr-only" aria-live="polite" data-attach-live></p></form></section>`;
  }

  /* ---------- Attachments ---------- */
  const kindOf = (file) => ['image', 'audio', 'video'].find((k) => file.type.startsWith(`${k}/`));
  /** Duration of an audio/video file, read in the browser from its metadata (nothing is uploaded) */
  const duration = (kind, url) => new Promise((resolve) => {
    const el = document.createElement(kind);
    el.preload = 'metadata';
    el.onloadedmetadata = () => resolve(Number.isFinite(el.duration) ? el.duration : 0);
    el.onerror = () => resolve(null);
    el.src = url;
  });
  async function addFiles(list) {
    ui.note = null;
    for (const file of [...list]) {
      const kind = kindOf(file);
      const rule = D.ATTACH[kind];
      if (!kind) { ui.note = { key: 'chatp.err.type', vars: { name: file.name } }; continue; }
      if (file.size > rule.maxMB * 1e6) { ui.note = { key: 'chatp.err.size', vars: { name: file.name, mb: rule.maxMB } }; continue; }
      if (kind === 'image' && ui.pending.filter((f) => f.kind === 'image').length >= rule.maxCount) { ui.note = { key: 'chatp.err.count', vars: { n: rule.maxCount } }; continue; }
      const url = URL.createObjectURL(file);
      let sec = 0;
      if (kind !== 'image') {
        sec = await duration(kind, url);
        if (sec === null) { URL.revokeObjectURL(url); ui.note = { key: 'chatp.err.read', vars: { name: file.name } }; continue; }
        if (sec > rule.maxSec) { URL.revokeObjectURL(url); ui.note = { key: 'chatp.err.long', vars: { name: file.name, limit: limitText(rule.maxSec) } }; continue; }
      }
      ui.pending.push({ id: `f${++ui.fseq}`, kind, name: file.name, size: file.size, sec, url });
    }
    rerender('[data-attach]');
    const live = view.querySelector('[data-attach-live]');
    if (live) live.textContent = ui.note ? t(ui.note.key, ui.note.vars) : t('chatp.attached', { n: ui.pending.length });
  }
  function rerender(focusSel) {
    C.render({ focus: false });
    if (focusSel) view.querySelector(focusSel)?.focus();
  }

  /* ---------- Conversations ---------- */
  function newChat() {
    const c = { id: `c${++ui.seq}`, msgs: [] };
    ui.chats.push(c);
    ui.current = c.id;
    return c;
  }
  function send(text) {
    const value = text.trim();
    const files = ui.pending.slice();
    if ((!value && !files.length) || ui.busy) return;
    const m = model();
    if (unreadable(m, files).length) { rerender(view.querySelector('[data-switch-model]') ? '[data-switch-model]' : '[data-attach]'); return; }
    const c = cur() || newChat();
    const { tin, tout } = estimate(value, files);
    if (S.chatCost(m, tin, tout) > S.state.balance) {
      rerender();
      toast(t('ai.try.short'));
      return C.openTopup({ amount: D.TOPUP_MIN });
    }
    c.msgs.push({ from: 'user', text: value, files });
    const reply = { from: 'ai', model: m.name, thinking: true, files: files.length };
    c.msgs.push(reply);
    ui.pending = []; ui.draft = ''; ui.note = null;
    ui.busy = true;
    rerender();
    setTimeout(() => {
      const res = S.chargeChat({ model: m, tin, tout });
      Object.assign(reply, { thinking: false, cost: res.cost, tin, tout });
      ui.busy = false;
      if (location.hash.startsWith('#/chat')) rerender('#try-input');
    }, 600);
  }
  function exportText() {
    const lines = [`TokenNyala — ${t('nav.chat')} · ${S.state.clock}`, ''];
    ui.chats.filter((c) => c.msgs.length).forEach((c, i) => {
      lines.push(`## ${i + 1}. ${titleOf(c)}`);
      c.msgs.forEach((x) => lines.push(x.from === 'user'
        ? `> ${[x.text, ...(x.files || []).map(fileLabel)].filter(Boolean).join(' ')}`
        : `${x.model}: ${x.files ? t('ai.try.replyAttach', { model: x.model, n: x.files }) : t('ai.try.reply', { model: x.model })} (${rp(x.cost || 0)})`));
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
    const input = root.querySelector('#try-input');
    root.querySelector('[data-chat-new]').addEventListener('click', () => {
      if (cur() && !cur().msgs.length) { input.focus(); return; } // already on an empty chat
      newChat(); rerender('#try-input');
    });
    root.querySelector('[data-chat-export]').addEventListener('click', exportText);
    root.querySelector('[data-try-model]').addEventListener('change', (e) => { ui.model = e.target.value; rerender('#try-model'); });
    root.querySelector('[data-try-form]').addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
    input.addEventListener('input', () => {
      ui.draft = input.value;
      const est = root.querySelector('[data-estimate]');
      if (est) est.textContent = t('chatp.estimate', { rp: rp(S.chatCost(model(), estimate(ui.draft, ui.pending).tin, 350)), n: ui.pending.length });
    });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); } });
    input.addEventListener('paste', (e) => { const files = [...(e.clipboardData?.files || [])]; if (files.length) { e.preventDefault(); addFiles(files); } });
    const fileInput = root.querySelector('[data-chat-file]');
    root.querySelector('[data-attach]').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => { if (fileInput.files.length) addFiles(fileInput.files); });
    const drop = root.querySelector('[data-drop]');
    drop.addEventListener('dragover', (e) => { if ([...e.dataTransfer.types].includes('Files')) { e.preventDefault(); drop.setAttribute('data-drag', ''); } });
    drop.addEventListener('dragleave', (e) => { if (!drop.contains(e.relatedTarget)) drop.removeAttribute('data-drag'); });
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.removeAttribute('data-drag'); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); });
    root.addEventListener('click', (e) => {
      const ex = e.target.closest('[data-example]');
      if (ex) return send(t(`ai.try.ex${ex.dataset.example}`));
      const open = e.target.closest('[data-chat-open]');
      if (open) { ui.current = open.dataset.chatOpen; return rerender(`[data-chat-open="${ui.current}"]`); }
      const rm = e.target.closest('[data-file-remove]');
      if (rm) {
        const f = ui.pending.find((x) => x.id === rm.dataset.fileRemove);
        ui.pending = ui.pending.filter((x) => x !== f);
        URL.revokeObjectURL(f.url);
        ui.note = null;
        rerender('[data-attach]');
        view.querySelector('[data-attach-live]').textContent = t('chatp.removed', { name: f.name });
        return;
      }
      const sw = e.target.closest('[data-switch-model]');
      if (sw) { ui.model = sw.dataset.switchModel; rerender('#try-model'); view.querySelector('[data-attach-live]').textContent = t('chatp.switched', { model: model().name }); }
    });
  }
})();
