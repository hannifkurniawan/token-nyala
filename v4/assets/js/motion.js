/* TokenNyala v4 — scroll motion for landing & harga (docs/v4/visual-direction.md §7).
   GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.13 (assets/vendor). Content is visible by default: animations only
   use gsap.from(), so if GSAP fails to load or prefers-reduced-motion is set, the page is simply static.
   No loader, no custom cursor. */
(() => {
  'use strict';
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!gsap || !ScrollTrigger || reduced) return;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('motion-ok');
  const all = (sel, root = document) => [...root.querySelectorAll(sel)];
  const EASE = 'expo.out';

  /* ---- Smooth scroll (paused while a menu or modal locks the page) ---- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    new MutationObserver(() => {
      if (document.documentElement.classList.contains('overflow-hidden')) lenis.stop(); else lenis.start();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      const id = a?.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = document.querySelector('[data-header]')?.offsetHeight || 0;
      lenis.scrollTo(target, { offset: id === '#top' || id === '#main' ? 0 : -headerH - 8 });
      if (id === '#main') target.focus({ preventScroll: true });
    });
  }

  /* ---- Headings: words rise in ([data-split]) ---- */
  function split(h) {
    const nodes = [...h.childNodes];
    h.textContent = '';
    nodes.forEach((node) => {
      const parts = node.nodeType === 3 ? node.textContent.split(/(\s+)/) : [node];
      parts.forEach((part) => {
        if (part === '') return;
        if (typeof part === 'string' && /^\s+$/.test(part)) { h.append(' '); return; }
        const w = document.createElement('span');
        w.className = 'split-word';
        const inner = document.createElement('span');
        inner.append(part);
        w.append(inner);
        h.append(w);
      });
    });
  }
  function animateHeadings() {
    all('[data-split]').forEach((h) => {
      if (h.querySelector('.split-word')) return;
      split(h);
      gsap.from(all('.split-word > span', h), {
        yPercent: 110, duration: 1, ease: EASE, stagger: 0.035,
        scrollTrigger: { trigger: h, start: 'top 88%', once: true },
      });
    });
    all('.display mark').forEach((m) => gsap.fromTo(m, { '--mark': 0 }, {
      '--mark': 1, duration: 0.8, ease: EASE, scrollTrigger: { trigger: m, start: 'top 85%', once: true },
    }));
  }

  /* ---- Cards and blocks fade up ([data-reveal]) ---- */
  function animateBlocks() {
    all('[data-reveal]:not([data-revealed])').forEach((el) => {
      el.dataset.revealed = '';
      gsap.from(el, { y: 40, opacity: 0, duration: 0.9, ease: EASE, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
  }

  /* ---- Hero: board steps arrive in order ---- */
  gsap.from('#top figure li, #top figure > p', { y: 24, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.12, delay: 0.3 });

  /* ---- Stall story: the "after" switch flips on when the card arrives ---- */
  const afterSwitch = document.querySelector('#cerita .switch[data-on]');
  if (afterSwitch) {
    afterSwitch.removeAttribute('data-on');
    ScrollTrigger.create({ trigger: afterSwitch, start: 'top 80%', once: true, onEnter: () => afterSwitch.setAttribute('data-on', '') });
  }

  /* ---- Safe stack (lg): earlier cards shrink as the next one arrives ---- */
  ScrollTrigger.matchMedia({
    '(min-width: 64rem)': () => {
      const cards = all('[data-stack]');
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card, { scale: 0.92 + i * 0.015, ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 25%', scrub: true } });
      });
    },
  });

  /* ---- Final CTA: big switch turns on ---- */
  const finalSwitch = document.querySelector('[data-final-switch]');
  if (finalSwitch) {
    finalSwitch.removeAttribute('data-on');
    ScrollTrigger.create({ trigger: finalSwitch, start: 'top 75%', once: true, onEnter: () => finalSwitch.setAttribute('data-on', '') });
  }

  animateHeadings();
  animateBlocks();
  // Language switch re-renders cards and headings: new nodes are static (visible), just re-measure.
  document.addEventListener('tn:render', () => { animateBlocks(); ScrollTrigger.refresh(); });
  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.TN = window.TN || {};
  TN.motion = { lenis, ScrollTrigger };
})();
