/* TokenNyala v4 — scroll motion for landing & harga, ported from showcase v2 (docs/v4/visual-direction.md §7).
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
  const $ = (sel, root = document) => root.querySelector(sel);
  const all = (sel, root = document) => [...root.querySelectorAll(sel)];
  const EASE = 'expo.out';
  const burst = (...a) => window.TN?.ui?.burst?.(...a);
  /** gsap.from only when the targets exist (harga.html shares this file) */
  const from = (targets, vars) => { const list = typeof targets === 'string' ? all(targets) : [].concat(targets).filter(Boolean); if (list.length) gsap.from(list, vars); };

  /* ---- Smooth scroll (paused while a menu or modal locks the page) ---- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
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
        // Text glued to the previous word (", bukan" after <mark>) stays in that word so it never wraps alone
        const prev = h.lastChild;
        if (typeof part === 'string' && prev?.classList?.contains('split-word')) { prev.firstChild.append(part); return; }
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
      if (h.querySelector('.split-word') || !h.textContent.trim()) return;
      split(h);
      gsap.from(all('.split-word > span', h), {
        yPercent: 110, duration: 1, ease: EASE, stagger: 0.035,
        scrollTrigger: { trigger: h, start: 'top 88%', once: true },
      });
    });
    all('.display mark').forEach((m) => {
      if (m.dataset.marked) return;
      m.dataset.marked = '';
      gsap.fromTo(m, { '--mark': 0 }, { '--mark': 1, duration: 0.8, ease: EASE, scrollTrigger: { trigger: m, start: 'top 85%', once: true } });
    });
  }

  /* ---- Cards and blocks fade up ([data-reveal]) ---- */
  function animateBlocks() {
    all('[data-reveal]:not([data-revealed])').forEach((el) => {
      el.dataset.revealed = '';
      gsap.from(el, { y: 40, opacity: 0, duration: 0.9, ease: EASE, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
  }

  /* ---- Hero entrance: lines rise → copy fades → board slides in → sticker pops → switch turns on ---- */
  const hero = $('.hero');
  if (hero) {
    const sw = $('[data-hero-switch]');
    gsap.timeline({ delay: 0.15 })
      .from(all('.hero-title .ln > span'), { yPercent: 110, duration: 1.1, ease: EASE, stagger: 0.08 })
      .from(all('[data-hero-fade]'), { y: 30, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.1 }, '-=0.8')
      .from('[data-board]', { x: 80, opacity: 0, rotate: 4, duration: 0.9, ease: EASE }, '-=0.9')
      .from('.sticker', { scale: 0, rotate: -90, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.6')
      .add(() => { if (sw && !sw.hasAttribute('data-on')) { sw.setAttribute('data-on', ''); burst(sw, 10, hero); } }, '-=0.3');
    gsap.to('[data-hero-visual]', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---- Stall story: progress scrubbed by scroll ---- */
  const stall = $('[data-stall]');
  if (stall && window.TN?.landing?.renderStall) {
    TN.landing.renderStall(0);
    ScrollTrigger.create({ trigger: stall, start: 'top 90%', end: 'bottom 40%', scrub: 0.4, onUpdate: (self) => TN.landing.renderStall(self.progress) });
  }

  /* ---- Recipe: intent control widens in, package sheet staggers ---- */
  if ($('[data-recipe-chips]')) {
    from('[data-recipe-chips]', { scaleX: 0.85, opacity: 0, duration: 0.9, ease: EASE, scrollTrigger: { trigger: '[data-recipe-chips]', start: 'top 90%', once: true } });
    from('.pkg-sheet__main > *, .pkg-sheet__side > *', { y: 40, opacity: 0, duration: 0.9, ease: EASE, stagger: 0.05, scrollTrigger: { trigger: '[data-recipe-card]', start: 'top 85%', once: true } });
  }

  /* ---- Steps: cards slide in from the right ---- */
  if ($('[data-steps-track]')) from('.step', { x: 80, opacity: 0, duration: 1, ease: EASE, stagger: 0.1, scrollTrigger: { trigger: '[data-steps-track]', start: 'top 85%', once: true } });

  /* ---- Index rows (services, models, guides) slide up ---- */
  all('.row-index').forEach((list) => {
    const rows = all(':scope > .irow', list);
    if (rows.length) gsap.from(rows, { y: 40, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.06, scrollTrigger: { trigger: list, start: 'top 85%', once: true } });
  });

  /* ---- Tools: cable draws on scroll, steps slide, config card drops in ---- */
  const cable = $('[data-cable]');
  if (cable) {
    const len = cable.getTotalLength();
    gsap.fromTo(cable, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#pakai', start: 'top 70%', end: 'center center', scrub: true } });
  }
  if ($('.tool-steps')) from('.tool-steps > li', { x: -40, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.1, scrollTrigger: { trigger: '.tool-steps', start: 'top 85%', once: true } });
  if ($('[data-config-card]')) from('[data-config-card]', { y: 60, rotate: 6, opacity: 0, duration: 1, ease: EASE, scrollTrigger: { trigger: '[data-config-card]', start: 'top 85%', once: true } });

  /* ---- Safe stack (lg): earlier cards shrink as the next one arrives ---- */
  ScrollTrigger.matchMedia({
    '(min-width: 64rem)': () => {
      const cards = all('[data-stack]');
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card, { scale: 0.92 + i * 0.015, ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 20%', scrub: true } });
      });
    },
  });

  /* ---- Example receipt prints in; teams list and FAQ stagger ---- */
  if ($('[data-receipt]')) from('[data-receipt] .receipt__paper', { yPercent: -18, opacity: 0, rotate: -3, duration: 1.1, ease: EASE, scrollTrigger: { trigger: '[data-receipt]', start: 'top 80%', once: true } });
  if ($('.teams__list')) from('.teams__list > li', { x: 60, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.08, scrollTrigger: { trigger: '.teams__list', start: 'top 85%', once: true } });
  if ($('[data-faq] .faq-item')) from('[data-faq] .faq-item', { y: 30, opacity: 0, duration: 0.7, ease: EASE, stagger: 0.04, scrollTrigger: { trigger: '[data-faq]', start: 'top 85%', once: true } });

  /* ---- Final CTA: title rises, mega switch pops and turns on ---- */
  const finale = $('.final');
  const mega = $('[data-final-switch]');
  if (finale) {
    from(all('.final__title .ln > span'), { yPercent: 110, duration: 1.1, ease: EASE, stagger: 0.1, scrollTrigger: { trigger: finale, start: 'top 60%', once: true } });
    if (mega) {
      gsap.from(mega, { scale: 0.6, opacity: 0, duration: 0.9, ease: 'back.out(1.6)', scrollTrigger: { trigger: finale, start: 'top 55%', once: true } });
      ScrollTrigger.create({ trigger: finale, start: 'top 30%', once: true,
        onEnter: () => { if (!mega.hasAttribute('data-on')) { mega.setAttribute('data-on', ''); burst(mega, 18, $('[data-sparks]')); } } });
    }
  }

  /* ---- Footer: giant wordmark rises ---- */
  if ($('.footer__giant')) from('.footer__giant > span', { yPercent: 100, duration: 1.2, ease: EASE, stagger: 0.1, scrollTrigger: { trigger: '.footer__giant', start: 'top 95%', once: true } });

  /* ---- Magnetic buttons (fine pointer only) ---- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest?.('[data-magnetic]');
      all('[data-magnetic][data-pulled]').forEach((m) => { if (m !== el) { m.style.translate = ''; m.removeAttribute('data-pulled'); } });
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.translate = `${(e.clientX - (r.left + r.width / 2)) * 0.22}px ${(e.clientY - (r.top + r.height / 2)) * 0.32}px`;
      el.setAttribute('data-pulled', '');
    }, { passive: true });
  }

  animateHeadings();
  animateBlocks();
  // Language switch re-renders cards and headings: new nodes are static (visible), just re-measure.
  document.addEventListener('tn:render', () => { animateBlocks(); ScrollTrigger.refresh(); });
  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.TN = window.TN || {};
  TN.motion = { lenis, ScrollTrigger };
})();
