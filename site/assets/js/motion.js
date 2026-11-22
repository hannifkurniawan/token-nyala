/* TokenNyala v4 — harga.html motion, the landing's (showcase v2) patterns without the loader.
   GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.13 (assets/vendor). The page head enters with CSS (html.motion-pre,
   set before first paint), so nothing above the fold waits for this file. Everything here is below the fold and uses
   gsap.from() with scroll triggers; if GSAP is missing or reduced motion is set, the page is simply static. */
(() => {
  'use strict';
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const root = document.documentElement;
  if (!gsap || !ScrollTrigger || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { root.classList.remove('motion-pre'); return; }
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('motion-ok');
  const $ = (sel, r = document) => r.querySelector(sel);
  const $$ = (sel, r = document) => [...r.querySelectorAll(sel)];
  const EASE = 'expo.out';
  /** gsap.from with a scroll trigger, only when the targets exist */
  const rise = (targets, trigger, vars = {}) => {
    const list = typeof targets === 'string' ? $$(targets) : targets;
    if (!list.length || !$(trigger)) return;
    gsap.from(list, { y: 40, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.06, ...vars, scrollTrigger: { trigger, start: 'top 85%', once: true } });
  };

  /* ---- Smooth scroll; stops while a menu or modal locks the page ---- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    new MutationObserver(() => { if (root.classList.contains('overflow-hidden')) lenis.stop(); else lenis.start(); })
      .observe(root, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      const id = a?.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      // land just under the section nav (the header hides while scrolling down)
      const offset = id === '#top' || id === '#main' ? 0 : -(($('.pnav')?.offsetHeight || 0) + 8);
      lenis.scrollTo(target, { offset });
      if (id === '#main') target.focus({ preventScroll: true });
    });
  }

  /* ---- Headings: words rise in ([data-split], text from the dictionary, may contain <mark>) ---- */
  function split(h) {
    const nodes = [...h.childNodes];
    h.textContent = '';
    nodes.forEach((node) => {
      const parts = node.nodeType === 3 ? node.textContent.split(/(\s+)/) : [node];
      parts.forEach((part) => {
        if (part === '') return;
        if (typeof part === 'string' && /^\s+$/.test(part)) { h.append(' '); return; }
        const prev = h.lastChild; // text glued to the previous word (". " after <mark>) stays in it
        if (typeof part === 'string' && prev?.classList?.contains('split-word')) { prev.firstChild.append(part); return; }
        const w = document.createElement('span'); w.className = 'split-word';
        const inner = document.createElement('span'); inner.append(part);
        w.append(inner); h.append(w);
      });
    });
  }
  $$('[data-split]').forEach((h) => {
    split(h);
    gsap.from($$('.split-word > span', h), { yPercent: 110, duration: 1, ease: EASE, stagger: 0.035, scrollTrigger: { trigger: h, start: 'top 85%', once: true } });
  });
  $$('.display mark').filter((m) => !m.closest('.page-head')).forEach((m) => gsap.fromTo(m, { '--mark': 0 }, { '--mark': 1, duration: 0.8, ease: EASE, delay: 0.3, scrollTrigger: { trigger: m, start: 'top 85%', once: true } }));

  /* ---- Calculator: bundle control widens in, rows and the receipt rise ---- */
  if ($('.intent')) gsap.from('.intent', { scaleX: 0.85, opacity: 0, duration: 0.9, ease: EASE, scrollTrigger: { trigger: '.intent', start: 'top 90%', once: true } });
  rise('.calc-row', '[data-calc-rows]');
  ScrollTrigger.matchMedia({ '(min-width: 1024px)': () => rise('.calc-sum__card', '.calc-sum', { y: 60, rotate: 2, duration: 1 }) });

  /* ---- Every service: groups and rows slide up ---- */
  $$('.pgroup').forEach((g) => rise($$('.svc-group__head, .prow', g), `#${g.querySelector('.svc-group__head').id}`));

  /* ---- AI: model rows, unit cards ---- */
  rise('.ptable--models tbody tr', '.ptable--models', { y: 24, stagger: 0.03 });
  rise('.unit, .aip__chat', '.units', { x: 40, y: 0, stagger: 0.08 });

  /* ---- Balance: top-up receipt prints in, rules slide in ---- */
  if ($('.topup__paper')) gsap.from('.topup__paper', { yPercent: -12, opacity: 0, rotate: -3, duration: 1.1, ease: EASE, scrollTrigger: { trigger: '.topup', start: 'top 80%', once: true } });
  rise('.rules__list li', '.rules__list', { x: -40, y: 0, stagger: 0.05 });

  /* ---- FAQ + footer wordmark ---- */
  rise('[data-pfaq] .faq-item', '[data-pfaq]', { y: 30, stagger: 0.04, duration: 0.7 });
  if ($('.footer__giant')) gsap.from('.footer__giant span', { yPercent: 100, duration: 1.2, ease: EASE, stagger: 0.1, scrollTrigger: { trigger: '.footer__giant', start: 'top 95%', once: true } });

  // Language switch / calculator updates re-render parts: new nodes are static (visible), just re-measure.
  document.addEventListener('tn:render', () => ScrollTrigger.refresh());
  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.TN = window.TN || {};
  TN.motion = { lenis, ScrollTrigger };
})();
