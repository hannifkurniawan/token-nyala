/* TokenNyala v4 — console: learn (#/belajar, #/belajar?panduan=…) and help (#/bantuan). */
(() => {
  'use strict';
  const D = TN.data;
  const I = TN.i18n;
  const C = TN.console;
  const { t, rp } = I;
  const { icon, esc } = TN.ui;
  const { h1 } = C;
  const STEPS = { 'g-portofolio': 4, 'g-chatbot': 4, 'g-ai-tool': 3 };
  const TRY = { 'g-portofolio': '#/buat?paket=portofolio', 'g-chatbot': '#/buat?template=wa-bot', 'g-ai-tool': '#/ai' };

  C.ROUTES.belajar = {
    title: (r) => (STEPS[r.q.get('panduan')] ? t(`learn.${r.q.get('panduan')}`) : t('nav.learn')),
    html: (r) => {
      const id = r.q.get('panduan');
      if (STEPS[id]) {
        const g = D.GUIDES.find((x) => x.id === id);
        return `<a href="#/belajar" class="inline-flex min-h-11 items-center gap-1 font-bold text-xl-blue">${icon('arrow-right', 'icon size-4 rotate-180')}${esc(t('learn.back'))}</a>
          <p class="mt-1 font-mono text-[.78rem] tracking-[.1em] text-muted uppercase">${esc(t(`recipe.short.${g.recipe}`))} · ${esc(t('learn.read', { n: g.minutes }))}</p>
          <div class="mt-2">${h1(t(`learn.${id}`))}</div>
          <h2 class="sr-only">${esc(t('learn.steps'))}</h2>
          <ol class="mt-6 grid grid-cols-1 gap-3">${Array.from({ length: STEPS[id] }, (_, i) => `<li class="card flex gap-4 p-4 sm:p-5"><span class="grid size-10 shrink-0 place-items-center rounded-full bg-xl-yellow font-mono" aria-hidden="true">${i + 1}</span><p class="pt-1.5 text-lead-ink">${esc(t(`learn.${id}.${i + 1}`))}</p></li>`).join('')}</ol>
          <a href="${TRY[id]}" class="btn btn--lg mt-6 w-full sm:w-auto">${esc(t('learn.try'))}${icon('arrow-right', 'icon icon-go size-5')}</a>`;
      }
      return `${h1(t('nav.learn'), t('learn.pageLead'))}
        <ul class="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">${D.GUIDES.map((g) => `<li><a href="#/belajar?panduan=${g.id}" class="card flex h-full flex-col gap-3 p-5 hover:border-xl-blue">
          <span class="grid size-11 place-items-center rounded-control bg-xl-yellow">${icon('book-open')}</span>
          <span class="font-mono text-[.75rem] tracking-[.08em] text-muted uppercase">${esc(t(`recipe.short.${g.recipe}`))}</span>
          <span class="text-[1.15rem] leading-snug font-extrabold">${esc(t(`learn.${g.id}`))}</span>
          <span class="mt-auto inline-flex items-center gap-2 text-[.9rem] text-muted">${icon('clock', 'icon size-4')}${esc(t('learn.read', { n: g.minutes }))}</span></a></li>`).join('')}</ul>`;
    },
  };

  const FAQ = [['faq.q3', 'faq.a3'], ['faq.q4', 'faq.a4'], ['faq.q5', 'faq.a5'], ['pfaq.q4', 'pfaq.a4'], ['faq.q11', 'faq.a11'], ['faq.q13', 'faq.a13']];
  C.ROUTES.bantuan = {
    title: () => t('nav.help'),
    html: () => {
      const vars = { pause: D.RULES.pauseDays, remind: D.RULES.remindDays, n: D.RULES.pauseDays, rp: rp(D.PAYMENTS.withdraw) };
      return `${h1(t('nav.help'), t('help.lead'))}
        <div class="mt-5 flex flex-wrap gap-2"><button type="button" class="btn" data-help-nala>${icon('message-square', 'icon size-5')}${esc(t('faq.ask'))}</button>
          <button type="button" class="btn btn--ghost" data-help-team>${icon('users', 'icon size-5')}${esc(t('help.talk'))}</button></div>
        <div class="mt-8 border-t-2 border-xl-dark">${FAQ.map(([q, a], i) => `<details class="group/f border-b border-line" ${i === 0 ? 'open' : ''}>
          <summary class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[1.05rem] font-bold [&::-webkit-details-marker]:hidden"><span>${esc(t(q))}</span>
            <span class="grid size-9 shrink-0 place-items-center rounded-full bg-white ring-1 ring-line">${icon('plus', 'icon size-5 transition-transform group-open/f:rotate-45')}</span></summary>
          <p class="max-w-[42em] pb-5 text-lead-ink">${esc(t(a, vars))}</p></details>`).join('')}</div>`;
    },
    mount: () => {
      C.view.querySelector('[data-help-nala]').addEventListener('click', (e) => TN.nala?.open(e.currentTarget));
      C.view.querySelector('[data-help-team]').addEventListener('click', (e) => { TN.nala?.open(e.currentTarget); TN.nala?.handle(t('chip.team'), 'chip.team'); });
    },
  };
})();
