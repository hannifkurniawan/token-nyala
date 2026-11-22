#!/usr/bin/env python3
"""Responsive + interaction QA for v4 (docs/technical-spec.md §8, rule 7).

Usage:
    python3 tools/qa.py [--out DIR] [--interactive] [--pages index.html,...]

Serves site/ on a local port and opens every page in PAGES at 6 viewports (headless Chromium):
  - no horizontal overflow, no content escaping its .shell gutter, no text spilling out of its box
  - visible buttons/links/inputs have a tap target >= 44x44 px (inline text links in paragraphs are exempt)
  - no console errors / page errors, compiled CSS applied (header is sticky), no broken images, icons resolve
  - above the fold on 320x640 / 375x667: H1 + main CTA
  - no missing i18n key rendered as text
With --interactive (per page, see the *_flow functions):
  - landing: mobile menu (open, Escape, focus back), recipe chips (arrow keys, card + links update,
    numbers match TN.data), language switch EN + persistence, EN at 320px has no overflow,
    model catalogue (search, empty, clear, Escape), team consultation (5 errors, success, reset),
    Nala recipe flow (links carry the adjusted recipe) + offline contact, FAQ/templates/guides/copy
  - harga: calculator (defaults, switch, size, stepper, disabled size + arrows, add service, n8n minimum with AI,
    links from Nala, URL kept in sync, mobile breakdown), section nav, EN
  - console (app.html): sign-in guard + 3 steps + contact never stored + empty home; ayu home/numbers, nav focus
    + title + aria-current, history filter; top-up (method error, VA, success, other amount, failed); paused
    project → suggested top-up → back on; "Lainnya" sheet / account menu, reset demo; EN at 320px
  - motion (375 + 1440, motion ON, landing + harga): scroll the whole page, then nothing in <main> may stay hidden
Layout checks run with prefers-reduced-motion so screenshots show every section.
Full-page screenshots go to --out (default: a temp dir). Exit code 1 if any check fails.
Phases add pages/routes here as they are built (fase 3: harga.html, fase 4+: app.html routes).
"""
import argparse
import functools
import http.server
import pathlib
import sys
import tempfile
import threading

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent / "site"
VIEWPORTS = [
    ("320", 320, 640),
    ("375", 375, 667),
    ("768", 768, 1024),
    ("1024", 1024, 768),
    ("1440", 1440, 900),
    ("667x375-landscape", 667, 375),
]
PAGES = {
    "index.html": {"fold": ["#hero-title", "#hero-cta"]},
    "harga.html": {"fold": ["#price-title"]},
    # console routes (app.html): demo presets from services-and-pricing §8
    "app-masuk": {"url": "app.html?demo=reset#/masuk", "fold": ["#view h1"]},
    "app-beranda": {"url": "app.html?demo=ayu#/beranda", "fold": ["#view h1"]},
    "app-jeda": {"url": "app.html?demo=ayu&state=jeda#/beranda", "fold": ["#view h1"]},
    "app-saldo": {"url": "app.html?demo=raka#/saldo", "fold": ["#view h1"]},
    "app-buat": {"url": "app.html?demo=ayu#/buat", "fold": ["#view h1"]},
    "app-proyek": {"url": "app.html?demo=dimas#/proyek/otomasi-tim?tab=layanan", "fold": ["#view h1"]},
    "app-ai": {"url": "app.html?demo=raka#/ai?tab=pemakaian", "fold": ["#view h1"]},
    "app-layanan": {"url": "app.html?demo=raka#/layanan/server?tambah=1", "fold": ["#view h1"]},
    "app-chat": {"url": "app.html?demo=raka#/chat", "fold": ["#view h1"]},
    "app-aplikasi": {"url": "app.html?demo=dimas#/aplikasi", "fold": ["#view h1"]},
    "app-aplikasi-detail": {"url": "app.html?demo=dimas#/aplikasi/s2", "fold": ["#view h1"]},
    "app-nat": {"url": "app.html?demo=raka#/layanan/nat?tambah=1", "fold": ["#view h1"]},
    "app-belajar": {"url": "app.html?demo=ayu#/belajar?panduan=g-portofolio", "fold": ["#view h1"]},
    "app-bantuan": {"url": "app.html?demo=ayu#/bantuan", "fold": ["#view h1"]},
}
ABOVE_FOLD_VIEWPORTS = {"320", "375"}

FOLD_JS = """
(selectors) => selectors.map((sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.bottom <= window.innerHeight ? null : `${sel} bottom=${Math.round(r.bottom)} > ${window.innerHeight}`;
}).filter(Boolean)
"""

CHECK_JS = """
() => {
  const doc = document.documentElement;
  const overflow = doc.scrollWidth - window.innerWidth;
  const offenders = [];
  if (overflow > 0) {
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width && (r.right > window.innerWidth + 1 || r.left < -1)) {
        const s = getComputedStyle(el);
        if (s.position === 'fixed' || el.closest('[hidden]')) continue;
        offenders.push((el.id ? '#' + el.id : el.tagName.toLowerCase()) + '.' + [...el.classList].slice(0, 3).join('.') + ` right=${Math.round(r.right)}`);
        if (offenders.length > 8) break;
      }
    }
  }
  const small = [];
  for (const el of document.querySelectorAll('a[href], button, input, select, textarea, summary, [role=tab]')) {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    if (!r.width || !r.height || s.visibility === 'hidden') continue;
    if (el.matches('.sr-only, .sr-only *') && !el.matches(':focus')) continue;
    if (el.tagName === 'A' && el.closest('p, li > p')) continue; // inline text link
    if (el.matches('input[type=checkbox], input[type=radio]') && el.closest('label')) continue;
    if (r.width < 44 - 0.5 || r.height < 44 - 0.5) {
      small.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
  }
  // Content escaping its .shell content box (catches overflow hidden by overflow-x-clip on a section)
  const escapes = [];
  for (const shell of document.querySelectorAll('.shell')) {
    if (shell.closest('[hidden]')) continue;
    const sr = shell.getBoundingClientRect();
    const cs = getComputedStyle(shell);
    const left = sr.left + parseFloat(cs.paddingLeft) - 1;
    const right = sr.right - parseFloat(cs.paddingRight) + 1;
    for (const el of shell.querySelectorAll('*')) {
      if (el.closest('[aria-hidden="true"], .sr-only, [hidden], [data-allow-bleed]')) continue;
      const s = getComputedStyle(el);
      if (s.position === 'absolute' || s.position === 'fixed' || s.display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      if (r.right > right || r.left < left) {
        escapes.push(`${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 3).join('.')} [${Math.round(r.left)}–${Math.round(r.right)}] vs [${Math.round(left)}–${Math.round(right)}]`);
        if (escapes.length > 6) break;
      }
    }
  }
  // Text spilling out of its own box (box fits, glyphs don't) — e.g. a big price in a narrow card
  const spills = [];
  for (const el of document.body.querySelectorAll('h1, h2, h3, h4, p, span, a, button, li, dt, dd, strong, label, legend, div')) {
    if (el.closest('[aria-hidden="true"], .sr-only, [hidden]') || el.matches('[data-decor-overflow]')) continue;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.display === 'inline' || s.overflowX !== 'visible' || s.textOverflow === 'ellipsis') continue;
    if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
      spills.push(`${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 24)}" ${el.scrollWidth}>${el.clientWidth}`);
      if (spills.length > 6) break;
    }
  }
  const broken = [...document.images].filter((i) => i.getAttribute('src') && i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src'));
  const header = document.querySelector('header');
  return {
    overflow, offenders, small, escapes, spills, broken,
    headerPosition: header ? getComputedStyle(header).position : null,
  };
}
"""

EXTRA_JS = r"""
() => {
  // icons: every <use href="#i-..."> resolves to an injected symbol
  const missingIcons = [...new Set([...document.querySelectorAll('use')].map(u => u.getAttribute('href'))
    .filter(h => h && h.startsWith('#') && !document.querySelector(h)))];
  // i18n: a missing key renders as the key itself (e.g. "recipe.name.x")
  const keyLike = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const v = n.textContent.trim();
    if (/^[a-z]+(\.[a-zA-Z0-9-]+)+$/.test(v) && !/\.(id|com|app|html|my\.id)$/.test(v)) keyLike.push(v);
  }
  return { missingIcons, keyLike: keyLike.slice(0, 6) };
}
"""


def landing_menu_flow(page, out, name):
    problems = []
    btn = page.locator("#menu-button")
    btn.click()
    page.wait_for_timeout(100)
    opened = page.evaluate("() => !document.getElementById('mobile-menu').hidden")
    expanded = btn.get_attribute("aria-expanded")
    label_open = btn.get_attribute("aria-label")
    page.screenshot(path=str(out / f"index-{name}-menu.png"))
    r = page.evaluate(CHECK_JS)
    if r["overflow"] > 0:
        problems.append(f"MENU OVERFLOW {r['overflow']}px")
    if r["small"]:
        problems.append(f"MENU SMALL TARGETS: {r['small']}")
    page.keyboard.press("Escape")
    closed = page.evaluate("() => document.getElementById('mobile-menu').hidden")
    focused = page.evaluate("() => document.activeElement?.id")
    locked = page.evaluate("() => document.documentElement.classList.contains('overflow-hidden')")
    if not (opened and expanded == "true" and label_open in ("Tutup menu", "Close menu") and closed and focused == "menu-button" and not locked):
        problems.append(f"MENU opened={opened} expanded={expanded} label={label_open!r} closedOnEsc={closed} focus={focused} stillLocked={locked}")
    # a link closes the menu
    btn.click()
    page.locator("#mobile-menu a[href='#layanan']").click()
    page.wait_for_timeout(100)
    if not page.evaluate("() => document.getElementById('mobile-menu').hidden"):
        problems.append("MENU link click did not close the menu")
    return problems


RECIPE_JS = r"""
() => {
  const D = TN.data, I = TN.i18n;
  const id = TN.landing.recipe, r = D.recipe(id);
  const card = document.querySelector('[data-recipe-card]');
  const res = {
    id,
    checked: [...document.querySelectorAll('[data-recipe-chips] [role=radio][aria-checked=true]')].map(b => b.dataset.recipe),
    focused: document.activeElement?.dataset?.recipe || null,
    tabbable: [...document.querySelectorAll('[data-recipe-chips] [role=radio]')].filter(b => b.tabIndex === 0).length,
    start: [...document.querySelectorAll('[data-start]')].map(a => a.getAttribute('href')),
    live: document.querySelector('[data-recipe-live]').textContent,
    text: card.textContent.replace(/\s+/g, ' '),
  };
  if (!r.aiOnly) {
    const t = D.recipeTotals(r.items);
    res.expect = [I.rpK(t.perMonth), I.rp(t.fixed), I.rp(t.usage), I.rp(t.suggest.amount)].concat(t.yearly ? [I.rp(t.firstMonth), I.rp(t.yearly)] : []);
  } else {
    res.expect = D.AI_ONLY.map(x => I.rp(x.amount));
  }
  res.missing = res.expect.filter(s => !res.text.includes(s));
  return res;
}
"""


def landing_recipe_flow(page, out, name):
    problems = []
    page.locator("[data-recipe-chips] [role=radio]").first.focus()
    seen = []
    for _ in range(5):
        r = page.evaluate(RECIPE_JS)
        seen.append(r["id"])
        if r["checked"] != [r["id"]] or r["tabbable"] != 1:
            problems.append(f"RECIPE {r['id']} checked={r['checked']} tabbable={r['tabbable']}")
        if r["missing"]:
            problems.append(f"RECIPE {r['id']} card misses {r['missing']}")
        want = "app.html#/ai?isi=1" if r["id"] == "ai-coding" else f"app.html#/buat?paket={r['id']}"
        if set(r["start"]) != {want}:
            problems.append(f"RECIPE {r['id']} start links {set(r['start'])} != {want}")
        if r["id"] != "portofolio" and not r["live"]:
            problems.append(f"RECIPE {r['id']} not announced")
        if r["id"] != "portofolio" and r["focused"] != r["id"]:
            problems.append(f"RECIPE focus {r['focused']} != {r['id']}")
        page.screenshot(path=str(out / f"index-{name}-recipe-{r['id']}.png"), clip=page.locator("#paket").bounding_box(), full_page=True)
        rr = page.evaluate(CHECK_JS)
        if rr["spills"] or rr["escapes"] or rr["overflow"] > 0:
            problems.append(f"RECIPE {r['id']} spills={rr['spills']} escapes={rr['escapes']} overflow={rr['overflow']}")
        page.keyboard.press("ArrowRight")
    if seen != ["portofolio", "chatbot-wa", "web-klien", "otomasi-tim", "ai-coding"]:
        problems.append(f"RECIPE order {seen}")
    if page.evaluate("() => TN.landing.recipe") != "portofolio":
        problems.append("RECIPE ArrowRight on the last chip does not wrap to the first")
    return problems


def landing_lang_flow(page, out, name):
    problems = []
    if name.startswith("1440"):
        page.locator('header [data-lang="en"]').click()
    else:
        page.evaluate("() => scrollTo(0, 0)")  # the header hides while scrolling down (showcase); back at the top it shows
        page.wait_for_timeout(300)
        page.locator("#menu-button").click()
        page.locator('#mobile-menu [data-lang="en"]').click()
        page.keyboard.press("Escape")
    lang = page.evaluate("() => document.documentElement.lang")
    cta = " ".join(page.locator("#hero-cta").inner_text().split()).replace(" →", "")
    page.reload(wait_until="networkidle")
    persisted = page.evaluate("() => document.documentElement.lang")
    if not (lang == "en" and cta == "Start building" and persisted == "en"):
        problems.append(f"LANG lang={lang} cta={cta!r} persisted={persisted}")
    r = page.evaluate(CHECK_JS)
    e = page.evaluate(EXTRA_JS)
    if r["overflow"] > 0 or r["spills"] or r["escapes"] or r["small"] or e["keyLike"]:
        problems.append(f"EN overflow={r['overflow']} spills={r['spills']} escapes={r['escapes']} small={r['small']} keys={e['keyLike']}")
    page.screenshot(path=str(out / f"index-{name}-en.png"), full_page=True)
    return problems



def landing_catalog_flow(page, out, name):
    problems = []
    opener = page.locator("[data-open-catalog]").first
    opener.scroll_into_view_if_needed()
    opener.click()
    page.wait_for_timeout(300)
    st = page.evaluate("""() => { const d = document.getElementById('catalog'); const r = d.getBoundingClientRect();
        return { open: d.open, focus: document.activeElement?.id, cards: d.querySelectorAll('[data-cat-list] > li').length,
                 count: d.querySelector('[data-cat-count]').textContent, inView: r.top >= -1 && r.bottom <= innerHeight + 1 }; }""")
    if not (st["open"] and st["focus"] == "cat-title" and st["cards"] == 6 and st["inView"]):
        problems.append(f"CATALOG open {st}")
    page.screenshot(path=str(out / f"index-{name}-catalog.png"))
    r = page.evaluate(CHECK_JS)
    if r["small"] or r["spills"]:
        problems.append(f"CATALOG small={r['small']} spills={r['spills']}")
    page.fill("#cat-search", "claude")
    n = page.evaluate("() => document.querySelectorAll('#catalog [data-cat-list] > li').length")
    page.fill("#cat-search", "zzz")
    empty = page.evaluate("() => document.querySelector('#catalog [data-cat-empty]').dataset.show")
    page.locator("#catalog [data-cat-clear]").click()
    after = page.evaluate("() => document.querySelectorAll('#catalog [data-cat-list] > li').length")
    if (n, empty, after) != (3, "true", 6):
        problems.append(f"CATALOG search claude={n} emptyShown={empty} afterClear={after}")
    page.keyboard.press("Escape")
    page.wait_for_timeout(100)
    back = page.evaluate("() => document.activeElement?.hasAttribute('data-open-catalog') && !document.getElementById('catalog').open && !document.documentElement.classList.contains('overflow-hidden')")
    if not back:
        problems.append("CATALOG Escape did not close / return focus / unlock scroll")
    return problems


def landing_consult_flow(page, out, name):
    problems = []
    b = page.locator("[data-open-consult]")
    b.scroll_into_view_if_needed()
    b.click()
    page.wait_for_timeout(350)
    page.locator("#consult [type=submit]").click()
    errs = page.evaluate("() => ({ shown: [...document.querySelectorAll('#consult [data-cerr]')].filter(e => !e.classList.contains('hidden')).length, focus: document.activeElement?.id })")
    if errs != {"shown": 5, "focus": "cs-name"}:
        problems.append(f"CONSULT empty submit {errs}")
    page.screenshot(path=str(out / f"index-{name}-consult-errors.png"))
    page.fill("#cs-name", "Dimas"); page.fill("#cs-org", "Studio Dimas"); page.fill("#cs-contact", "0812 3456 7890")
    page.locator("#consult label:has(input[name=teamSize])").first.click()
    page.locator("#consult input[name=consent]").check()
    page.locator("#consult [type=submit]").click()
    ok = page.evaluate("() => ({ success: !document.querySelector('#consult [data-cs-panel=success]').hidden, focus: document.activeElement?.id, body: document.querySelector('[data-cs-success-body]').textContent })")
    if not (ok["success"] and ok["focus"] == "cs-success-title" and "+6281234567890" in ok["body"]):
        problems.append(f"CONSULT success {ok}")
    page.screenshot(path=str(out / f"index-{name}-consult-success.png"))
    page.locator("#consult [data-cs-panel=success] [data-cs-close]").click()
    page.wait_for_timeout(100)
    reset = page.evaluate("() => ({ form: !document.querySelector('#consult form').hidden, name: document.getElementById('cs-name').value, focusBack: document.activeElement?.hasAttribute('data-open-consult') })")
    if reset != {"form": True, "name": "", "focusBack": True}:
        problems.append(f"CONSULT reset {reset}")
    return problems


def chat_wait(page):
    page.wait_for_function("() => !TN.nala.state.typing", timeout=3000)
    page.wait_for_timeout(50)


def landing_chat_flow(page, out, name, base_url):
    """Recipe flow: portofolio → code not ready → Ramai gives hosting:ramai + 20 sessions; offline team collects a contact."""
    problems = []
    page.evaluate("() => document.getElementById('cara-kerja')?.scrollIntoView()")  # phones: the launcher appears once the hero scrolls away (showcase)
    page.wait_for_timeout(250)
    page.wait_for_function("() => !document.getElementById('chat-launcher').inert", timeout=5000)
    page.locator("#chat-launcher").click()
    page.wait_for_timeout(200)
    modal = page.evaluate("() => document.getElementById('chat').matches(':modal')")
    if modal != (page.viewport_size["width"] < 768):
        problems.append(f"CHAT modal={modal} at width {page.viewport_size['width']}")
    chips = lambda: page.locator("#chat [data-chat-chips] button")
    chips().first.click(); chat_wait(page)                       # Bantu pilih paket
    chips().first.click(); chat_wait(page)                       # Landing page
    chips().nth(1).click(); chat_wait(page)                      # Belum, mau dibuat dengan AI
    chips().nth(2).click(); chat_wait(page)                      # Ramai
    links = page.evaluate("() => [...document.querySelectorAll('#chat [data-chat-log] a')].map(a => a.getAttribute('href'))")
    want = ["app.html#/buat?paket=portofolio&s=hosting:ramai,domain:my.id,ai:20", "harga.html?paket=portofolio&s=hosting:ramai,domain:my.id,ai:20#kalkulator"]
    if links != want:
        problems.append(f"CHAT recipe links {links}")
    page.screenshot(path=str(out / f"index-{name}-chat.png"))
    r = page.evaluate(CHECK_JS)
    if r["small"] or r["spills"] or r["overflow"] > 0:
        problems.append(f"CHAT small={r['small']} spills={r['spills']} overflow={r['overflow']}")
    page.keyboard.press("Escape")
    page.wait_for_timeout(100)
    if page.evaluate("() => document.getElementById('chat').open || document.activeElement?.id !== 'chat-launcher'"):
        problems.append("CHAT Escape did not close or return focus to the launcher")
    # team offline → contact collected (never stored)
    page.goto(base_url + "?chat=offline", wait_until="networkidle")
    page.evaluate("() => document.getElementById('cara-kerja')?.scrollIntoView()")
    page.wait_for_function("() => !document.getElementById('chat-launcher').inert", timeout=5000)
    page.locator("#chat-launcher").click()
    page.locator("#chat [data-chat-chips] button").last.click(); chat_wait(page)
    page.fill("#chat-input", "ayu@mail.com"); page.keyboard.press("Enter"); chat_wait(page)
    last = page.evaluate("() => [...document.querySelectorAll('#chat [data-chat-log] p')].pop().textContent")
    if "ayu@mail.com" not in last:
        problems.append(f"CHAT offline thanks {last!r}")
    page.keyboard.press("Escape")
    return problems


def landing_misc_flow(page, out, name):
    problems = []
    f = page.evaluate("""() => ({ faq: document.querySelectorAll('#faq details').length,
        templates: [...document.querySelectorAll('[data-templates] a')].map(a => a.getAttribute('href').split('=')[1]),
        guides: document.querySelectorAll('[data-guides] a').length, safe: document.querySelectorAll('[data-safe] > li').length })""")
    want = {"faq": 13, "templates": ["wa-bot", "n8n", "agent", "dify", "wordpress"], "guides": 3, "safe": 4}
    if f != want:
        problems.append(f"SECTIONS {f} != {want}")
    page.locator("#faq summary").first.click()
    if not page.evaluate("() => document.querySelector('#faq details').open"):
        problems.append("FAQ did not open")
    b = page.locator("[data-copy-url]")
    b.scroll_into_view_if_needed()
    b.click()
    page.wait_for_timeout(100)
    if b.locator("[data-copy-label]").text_content().strip() not in ("Tersalin", "Copied"):
        problems.append("COPY label did not change")
    return problems


MOTION_JS = r"""
() => {
  const hidden = [];
  for (const el of document.querySelectorAll('main *')) {
    if (el.closest('[hidden], dialog, .sr-only')) continue;
    const s = getComputedStyle(el);
    if (s.display === 'none') continue;
    if (parseFloat(s.opacity) < 0.95 && !el.matches('[aria-hidden="true"], [aria-hidden="true"] *')) {
      hidden.push(`${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join('.')} opacity=${s.opacity}`);
      if (hidden.length > 5) break;
    }
  }
  return { motion: document.documentElement.classList.contains('motion-ok'), hidden,
           switches: [document.querySelector('[data-final-switch]')?.getAttribute('aria-pressed') === 'true', !!document.querySelector('[data-stall-switch]')?.classList.contains('big-switch--on')] };
}
"""


def motion_flow(browser, base, out, name, w, h, page_name="index.html"):
    """With motion on: scroll the whole page slowly; afterwards nothing may stay hidden."""
    ctx = browser.new_context(viewport={"width": w, "height": h})
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(base + page_name, wait_until="networkidle")
    page.wait_for_function("() => !document.documentElement.classList.contains('is-loading')", timeout=8000)  # landing loader
    page.wait_for_timeout(1500)
    height = page.evaluate("() => document.documentElement.scrollHeight")
    y = 0
    while y < height:  # step through the page like a reader (via Lenis when it runs)
        y += int(h * 0.6)
        page.evaluate("(y) => TN.motion?.lenis ? TN.motion.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y)", y)
        page.wait_for_timeout(120)
    page.wait_for_timeout(2500)
    r = page.evaluate(MOTION_JS)
    problems = []
    if not r["motion"]:
        problems.append("MOTION gsap did not start (no .motion-ok)")
    if r["hidden"]:
        problems.append(f"MOTION content still hidden after scrolling: {r['hidden']}")
    if page_name == "index.html" and r["switches"] != [True, True]:
        problems.append(f"MOTION switches did not turn on {r['switches']}")
    if errors:
        problems.append(f"MOTION errors {errors}")
    ctx.close()
    return problems


CALC_JS = r"""
() => ({
  total: document.querySelector('[data-calc-total]').textContent.trim(),
  cta: document.querySelector('[data-calc-cta]').getAttribute('href'),
  search: location.search,
  rows: [...document.querySelectorAll('[data-calc-rows] > li')].map(li => li.dataset.key + (li.querySelector('[role=switch]').getAttribute('aria-checked') === 'true' ? '' : '(off)')),
  live: document.querySelector('[data-calc-live]').textContent,
})
"""


def harga_calc_flow(page, out, name, base):
    """Calculator: defaults, switch off, size, stepper, disabled sizes, add service, n8n bump, URL in/out."""
    problems = []
    st = lambda: page.evaluate(CALC_JS)
    rk = lambda n: page.evaluate("(n) => '≈ ' + TN.i18n.rpK(n)", n)
    page.goto(base + "harga.html", wait_until="networkidle")
    s0 = st()
    want_cta = "app.html#/buat?paket=portofolio&s=hosting:coba,domain:my.id,ai:10"
    if s0["total"] != rk(33900) or s0["cta"] != want_cta or s0["search"] != "?paket=portofolio&s=hosting:coba,domain:my.id,ai:10":
        problems.append(f"CALC default {s0}")
    row = lambda key: page.locator(f'[data-calc-rows] > li[data-key="{key}"]')
    row("ai:sesi").locator("[role=switch]").click()
    s1 = st()
    if s1["total"] != rk(15000) or "ai:" in s1["cta"] or "ai:sesi(off)" not in s1["rows"]:
        problems.append(f"CALC switch AI off {s1}")
    if page.evaluate("() => document.activeElement?.dataset?.fid") != "r-ai-sesi-sw":
        problems.append("CALC focus lost after switching")
    row("ai:sesi").locator("[role=switch]").click()
    row("hosting").locator('[role=radio][data-size="rutin"]').click()
    row("ai:sesi").locator('[data-step="1"]').click()
    page.wait_for_timeout(100)  # live region is filled on the next frame
    s2 = st()   # rutin 35.000 + 15 sessions 28.350 = 63.350
    if s2["total"] != rk(63350) or "hosting:rutin" not in s2["cta"] or "ai:15" not in s2["cta"] or "Rp63" not in s2["live"]:
        problems.append(f"CALC size/stepper {s2}")
    page.locator('[data-calc-recipes] [data-recipe="chatbot-wa"]').click()
    dis = page.evaluate("() => [...document.querySelectorAll('[data-key=\"apps:wa-bot\"] [role=radio]')].map(b => b.dataset.size + ':' + (b.getAttribute('aria-disabled') || ''))")
    row("apps:wa-bot").locator('[role=radio][data-size="coba"]').click(force=True)  # disabled: must not change anything
    s3 = st()
    if dis != ["coba:true", "rutin:", "ramai:"] or s3["total"] != rk(47000):
        problems.append(f"CALC disabled size {dis} total={s3['total']}")
    # keyboard: arrows skip the disabled size
    row("apps:wa-bot").locator('[role=radio][aria-checked=true]').focus()
    page.keyboard.press("ArrowRight")
    page.keyboard.press("ArrowRight")
    if "wa-bot:rutin" not in st()["cta"]:
        problems.append(f"CALC arrows did not wrap past the disabled size: {st()['cta']}")
    # add a service
    page.locator("[data-calc-add]").click()
    page.wait_for_timeout(300)
    page.screenshot(path=str(out / f"harga-{name}-add.png"))
    page.locator('#add-svc [data-add="storage"]').click()
    page.wait_for_timeout(200)
    s4 = st()
    if "storage" not in s4["rows"] or "storage:10gb" not in s4["cta"] or page.evaluate("() => document.getElementById('add-svc').open"):
        problems.append(f"CALC add storage {s4['rows']} {s4['cta']}")
    if page.evaluate("() => document.activeElement?.closest('[data-key]')?.dataset.key") != "storage":
        problems.append("CALC focus not on the added row")
    # n8n minimum: AI tasks switch it from Coba-coba to Rutin
    page.goto(base + "harga.html?s=n8n:coba,tugas:1000", wait_until="networkidle")
    s5 = st()
    if "n8n:rutin" not in s5["cta"] or s5["total"] != rk(63000):
        problems.append(f"CALC n8n min with AI {s5}")
    row("ai:tugas").locator("[role=switch]").click()
    row("apps:n8n").locator('[role=radio][data-size="coba"]').click()
    if "n8n:coba" not in st()["cta"]:
        problems.append("CALC n8n Coba-coba not selectable without AI")
    row("ai:tugas").locator("[role=switch]").click()
    page.wait_for_timeout(100)
    s6 = st()
    if "n8n:rutin" not in s6["cta"] or "naik" not in s6["live"] and "moved up" not in s6["live"]:
        problems.append(f"CALC n8n bump on AI on {s6}")
    # link from Nala/landing
    page.goto(base + "harga.html?paket=portofolio&s=hosting:ramai,domain:my.id,ai:20#kalkulator", wait_until="networkidle")
    if st()["total"] != rk(112800):
        problems.append(f"CALC from Nala link {st()['total']}")
    # mobile breakdown
    if page.viewport_size["width"] < 1024:
        page.locator("[data-calc-rows]").scroll_into_view_if_needed()
        t = page.locator("[data-calc-toggle]")
        t.click()
        d = page.evaluate("() => ({ exp: document.querySelector('[data-calc-toggle]').getAttribute('aria-expanded'), shown: getComputedStyle(document.querySelector('[data-calc-details]')).display !== 'none', bar: document.querySelector('#calc-summary').getBoundingClientRect().bottom <= innerHeight + 1 })")
        page.screenshot(path=str(out / f"harga-{name}-summary-open.png"))
        if d != {"exp": "true", "shown": True, "bar": True}:
            problems.append(f"CALC mobile breakdown {d}")
        r = page.evaluate(CHECK_JS)
        if r["small"] or r["spills"] or r["overflow"] > 0:
            problems.append(f"CALC open small={r['small']} spills={r['spills']} overflow={r['overflow']}")
    # section nav
    page.locator('[data-pnav] a[href="#saldo"]').click()
    page.wait_for_timeout(1200)
    cur = page.evaluate("() => document.querySelector('[data-pnav] a[aria-current=true]')?.getAttribute('href')")
    top = page.evaluate("() => document.getElementById('saldo').getBoundingClientRect().top")
    if cur != "#saldo" or top < 0 or top > 220:
        problems.append(f"PNAV current={cur} sectionTop={top}")
    return problems


def harga_lang_flow(page, out, name, base):
    page.goto(base + "harga.html", wait_until="networkidle")
    if name.startswith("1440"):
        page.locator('header [data-lang="en"]').click()
    else:
        page.locator("#menu-button").click()
        page.locator('#mobile-menu [data-lang="en"]').click()
        page.keyboard.press("Escape")
    problems = []
    cta = page.locator("[data-calc-cta]").text_content().strip()
    r = page.evaluate(CHECK_JS)
    e = page.evaluate(EXTRA_JS)
    if cta != "Switch on" or r["overflow"] > 0 or r["spills"] or r["escapes"] or r["small"] or e["keyLike"]:
        problems.append(f"HARGA EN cta={cta!r} overflow={r['overflow']} spills={r['spills']} escapes={r['escapes']} small={r['small']} keys={e['keyLike']}")
    page.screenshot(path=str(out / f"harga-{name}-en.png"), full_page=True)
    page.evaluate("() => localStorage.setItem('tn-lang', 'id')")
    return problems


APP_JS = r"""
() => ({
  hash: location.hash, title: document.title, h1: document.querySelector('#view h1')?.textContent.trim(),
  focus: document.activeElement === document.querySelector('#view h1') ? 'h1' : (document.activeElement?.id || document.activeElement?.tagName),
  view: document.getElementById('view').textContent.replace(/\s+/g, ' '),
  pill: document.querySelector('[data-balance-text]').textContent,
  current: [...document.querySelectorAll('[aria-current=page][data-route]')].filter(a => a.getClientRects().length).map(a => a.dataset.route),
  store: localStorage.getItem('tn-v4-demo') || '',
})
"""


def console_auth_flow(page, out, name, base):
    """Guard → sign in (contact, code, name) → back to the requested route; contact never stored; empty home."""
    problems = []
    st = lambda: page.evaluate(APP_JS)
    page.goto(base + "app.html?demo=reset#/saldo", wait_until="networkidle")
    page.wait_for_timeout(100)
    if st()["hash"] != "#/masuk?next=%2Fsaldo":
        problems.append(f"AUTH guard {st()['hash']}")
    submit = lambda: page.locator("[data-auth-form] [type=submit]").click()
    submit()
    if page.evaluate("() => document.activeElement?.id") != "auth-contact" or page.locator("[data-auth-err=contact]").is_hidden():
        problems.append("AUTH empty contact: no error/focus")
    page.fill("#auth-contact", "0812 3456 7890"); submit()
    page.screenshot(path=str(out / f"app-{name}-code.png"))
    page.fill("#auth-code", "12"); submit()
    if page.locator("[data-auth-err=code]").is_hidden():
        problems.append("AUTH short code accepted")
    page.fill("#auth-code", "123456"); submit()
    submit()
    if page.locator("[data-auth-err=name]").is_hidden():
        problems.append("AUTH empty name accepted")
    page.fill("#auth-name", "Sinta"); submit()
    page.wait_for_timeout(150)
    s1 = st()
    if s1["hash"] != "#/saldo" or s1["h1"] not in ("Saldo", "Balance") or s1["focus"] != "h1":
        problems.append(f"AUTH did not land on the next route {s1['hash']} h1={s1['h1']} focus={s1['focus']}")
    if "6281234567890" in s1["store"] or "0812" in s1["store"] or '"Sinta"' not in s1["store"]:
        problems.append(f"AUTH storage {s1['store'][:160]}")
    page.evaluate("() => { location.hash = '#/beranda'; }")
    page.wait_for_timeout(150)
    home = page.evaluate("() => ({ chips: document.querySelectorAll('#view ul[aria-label] a').length, next: document.querySelector('#view a[href=\"#/saldo?isi=1\"]') !== null })")
    if home != {"chips": 5, "next": True}:
        problems.append(f"AUTH empty home {home}")
    page.screenshot(path=str(out / f"app-{name}-empty-home.png"), full_page=True)
    return problems


def console_home_flow(page, out, name, base):
    problems = []
    st = lambda: page.evaluate(APP_JS)
    page.goto(base + "app.html?demo=ayu#/beranda", wait_until="networkidle")
    v = st()["view"]
    for want in ("Rp31.220", "±19 Des", "portofolio-ayu", "ayu.my.id", "29 hari", "tetap Rp15.000 · pakai Rp3.780"):
        if want not in v:
            problems.append(f"HOME ayu misses {want!r}")
    if st()["pill"] != "Rp31.220":
        problems.append(f"HOME pill {st()['pill']}")
    nav = "[data-tab-nav]" if page.viewport_size["width"] < 1024 else "[data-side-nav]"
    page.locator(f'{nav} a[data-route="saldo"]').click()
    page.wait_for_timeout(150)
    s = st()
    if s["h1"] != "Saldo" or s["focus"] != "h1" or s["title"] != "Saldo — TokenNyala" or s["current"] != ["saldo"]:
        problems.append(f"NAV saldo h1={s['h1']} focus={s['focus']} title={s['title']} current={s['current']}")
    rows = lambda: page.evaluate("() => document.querySelectorAll('#view ol > li').length")
    if rows() != 4:
        problems.append(f"HISTORY rows {rows()} != 4")
    page.select_option("#hist-type", "domain")
    if rows() != 1 or page.evaluate("() => document.activeElement?.id") != "hist-type":
        problems.append(f"HISTORY filter rows={rows()}")
    page.select_option("#hist-type", "all")
    return problems


def console_topup_flow(page, out, name, base):
    problems = []
    st = lambda: page.evaluate(APP_JS)
    page.goto(base + "app.html?demo=ayu#/beranda", wait_until="networkidle")
    opener = page.locator("#view [data-topup]").first
    opener.click()
    page.wait_for_timeout(300)
    box = page.evaluate("() => { const r = document.getElementById('topup').getBoundingClientRect(); return { open: document.getElementById('topup').open, focus: document.activeElement?.id, inView: r.top >= -1 && r.bottom <= innerHeight + 1 }; }")
    if box != {"open": True, "focus": "co-title", "inView": True}:
        problems.append(f"TOPUP open {box}")
    page.locator('#topup label:has(input[value="100000"])').click()
    page.locator("[data-co-submit]").click()
    if page.locator("#co-method-error").is_hidden():
        problems.append("TOPUP no method error")
    page.screenshot(path=str(out / f"app-{name}-topup-form.png"))
    r = page.evaluate(CHECK_JS)
    if r["small"] or r["spills"]:
        problems.append(f"TOPUP small={r['small']} spills={r['spills']}")
    page.locator('#topup label:has(input[value="va"])').click()
    page.locator("[data-co-submit]").click()
    page.wait_for_timeout(100)
    va = page.locator("[data-co-va]").text_content()
    if not va.startswith("8808") or page.evaluate("() => document.activeElement?.id") != "co-pay-title":
        problems.append(f"TOPUP pay step va={va!r}")
    page.locator("[data-co-paid-main]").click()
    page.wait_for_timeout(800)
    body = page.locator("[data-co-success-body]").text_content()
    if "Rp115.000" not in body or "Rp146.220" not in body:
        problems.append(f"TOPUP success {body!r}")
    page.locator("#topup [data-step-panel=success] [data-co-close]").click()
    page.wait_for_timeout(200)
    s = st()
    if s["pill"] != "Rp146.220" or "Rp146.220" not in s["view"]:
        problems.append(f"TOPUP after pill={s['pill']}")
    # other amount + failed payment
    page.locator("#view [data-topup]").first.click()
    page.wait_for_timeout(250)
    page.locator('#topup label:has(input[value="other"])').click()
    page.fill("#co-other", "15000")
    page.locator('#topup label:has(input[value="qris"])').click()
    page.locator("[data-co-submit]").click()
    if page.locator("#co-other-error").is_hidden() or page.evaluate("() => document.activeElement?.id") != "co-other":
        problems.append("TOPUP other amount below minimum accepted")
    page.fill("#co-other", "25000")
    page.locator("[data-co-submit]").click()
    page.locator("[data-co-fail]").click()
    if page.evaluate("() => document.activeElement?.id") != "co-failed-title":
        problems.append("TOPUP failed step focus")
    page.locator("#topup [data-step-panel=failed] [data-co-back]").click()
    page.keyboard.press("Escape")
    page.wait_for_timeout(150)
    if page.evaluate("() => TN.store.state.balance") != 146220:
        problems.append("TOPUP failed payment changed the balance")
    return problems


def console_jeda_flow(page, out, name, base):
    problems = []
    st = lambda: page.evaluate(APP_JS)
    page.goto(base + "app.html?demo=ayu&state=jeda#/beranda", wait_until="networkidle")
    v = st()["view"]
    for want in ("dijeda", "27 Des", "Rp20.000", "Dijeda"):
        if want not in v:
            problems.append(f"JEDA misses {want!r}")
    page.locator("#view [role=status] [data-topup]").click()
    page.wait_for_timeout(250)
    sug = page.evaluate("() => document.querySelector('#topup input[name=co-amount]:checked')?.value")
    after = page.locator("[data-co-after]").text_content()
    if sug != "50000" or "Rp48.000" not in after:
        problems.append(f"JEDA suggested={sug} after={after!r}")
    page.locator('#topup label:has(input[value="ewallet"])').click()
    page.locator("[data-co-submit]").click()
    page.locator("#topup [data-pay-method=ewallet] [data-co-paid]").first.click()
    page.wait_for_timeout(800)
    if "portofolio-ayu" not in page.locator("[data-co-resumed]").text_content():
        problems.append("JEDA resumed line missing")
    page.keyboard.press("Escape")
    page.wait_for_timeout(200)
    s = st()
    if "dijeda karena" in s["view"] or "Nyala" not in s["view"] or s["pill"] != "Rp48.000":
        problems.append(f"JEDA after top-up pill={s['pill']}")
    return problems


def console_account_flow(page, out, name, base):
    problems = []
    page.goto(base + "app.html?demo=dimas#/beranda", wait_until="networkidle")
    if page.viewport_size["width"] < 1024:
        page.locator("[data-open-more]").click()
        page.wait_for_timeout(300)
        o = page.evaluate("() => ({ open: document.getElementById('more').open, focus: document.activeElement?.id, links: document.querySelectorAll('#more [data-more-nav] a').length })")
        page.screenshot(path=str(out / f"app-{name}-more.png"))
        r = page.evaluate(CHECK_JS)
        if o != {"open": True, "focus": "more-title", "links": 11} or r["small"]:  # Chat AI, API AI, Apps, Server, 5 store/connect, Learn, Help
            problems.append(f"MORE {o} small={r['small']}")
        page.keyboard.press("Escape")
        page.wait_for_timeout(100)
        if page.evaluate("() => document.activeElement?.hasAttribute('data-open-more')") is not True:
            problems.append("MORE focus not back on the tab")
        page.locator("[data-open-more]").click()
        page.locator("#more [data-reset]").click()
    else:
        page.locator("#acct-btn").click()
        if page.locator("#acct-menu").is_hidden():
            problems.append("ACCOUNT menu did not open")
        page.keyboard.press("Escape")
        if not page.locator("#acct-menu").is_hidden() or page.evaluate("() => document.activeElement?.id") != "acct-btn":
            problems.append("ACCOUNT menu Escape")
        page.locator("#acct-btn").click()
        page.locator("#acct-menu [data-reset]").click()
    page.wait_for_timeout(250)
    if page.evaluate("() => document.getElementById('confirm').open && document.activeElement?.id === 'confirm-title'") is not True:
        problems.append("RESET confirm not open/focused")
    page.locator("[data-confirm-ok]").click()
    page.wait_for_timeout(200)
    if not page.evaluate("() => location.hash.startsWith('#/masuk') && TN.store.state.user === null && TN.store.state.balance === 0"):
        problems.append("RESET did not clear the demo")
    return problems


def console_lang_flow(page, out, name, base):
    problems = []
    page.goto(base + "app.html?demo=raka#/saldo", wait_until="networkidle")
    if page.viewport_size["width"] < 1024:
        page.locator("[data-open-more]").click()
        page.locator('#more [data-lang="en"]').click()
        page.keyboard.press("Escape")
    else:
        page.locator("#acct-btn").click()
        page.locator('#acct-menu [data-lang="en"]').click()
        page.keyboard.press("Escape")
    page.wait_for_timeout(150)
    r = page.evaluate(CHECK_JS)
    e = page.evaluate(EXTRA_JS)
    h1 = page.locator("#view h1").text_content().strip()
    if h1 != "Balance" or r["overflow"] > 0 or r["spills"] or r["escapes"] or r["small"] or e["keyLike"]:
        problems.append(f"CONSOLE EN h1={h1!r} overflow={r['overflow']} spills={r['spills']} escapes={r['escapes']} small={r['small']} keys={e['keyLike']}")
    page.screenshot(path=str(out / f"app-{name}-en.png"), full_page=True)
    page.evaluate("() => localStorage.setItem('tn-lang', 'id')")
    return problems


def wizard_flow(page, out, name, base):
    """User journey 1 (Ayu): new account → recipe from the landing → summary short of balance → inline top-up →
    switch on → progress → Nyala; balance 55.000 → 35.000; project on at ayu.my.id."""
    problems = []
    page.goto(base + "app.html?demo=reset#/buat?resep=portofolio", wait_until="networkidle")  # legacy ?resep= still prefills the wizard
    page.fill("#auth-contact", "ayu@mail.com"); page.locator("[data-auth-form] [type=submit]").click()
    page.fill("#auth-code", "123456"); page.locator("[data-auth-form] [type=submit]").click()
    page.fill("#auth-name", "Ayu"); page.locator("[data-auth-form] [type=submit]").click()
    page.wait_for_timeout(200)
    s = page.evaluate("() => ({ h1: document.querySelector('#view h1').textContent, name: document.getElementById('wz-name')?.value, domain: document.getElementById('wz-domain')?.value })")
    if s != {"h1": "Atur proyekmu", "name": "portofolio-ayu", "domain": "ayu"}:
        problems.append(f"WIZ step 2 {s}")
    # validation: bad name
    page.fill("#wz-name", "Ayu Web!"); page.locator("[data-wz-next]").click()
    if page.evaluate("() => document.activeElement?.id") != "wz-name" or page.locator("#wz-name-error").count() == 0:
        problems.append("WIZ bad project name accepted")
    page.fill("#wz-name", "portofolio-ayu")
    page.locator("[data-wz-next]").click(); page.wait_for_timeout(150)
    sm = page.evaluate("() => ({ h1: document.querySelector('#view h1').textContent, focus: document.activeElement === document.querySelector('#view h1'), total: document.querySelector('[data-wz-total]')?.textContent, topup: document.querySelector('[data-wz-topup]')?.textContent.trim() })")
    if sm != {"h1": "Ringkasan biaya", "focus": True, "total": "Rp20.000", "topup": "Isi saldo Rp50.000"}:
        problems.append(f"WIZ summary {sm}")
    page.screenshot(path=str(out / f"app-{name}-wiz-summary.png"), full_page=True)
    r = page.evaluate(CHECK_JS)
    if r["small"] or r["spills"] or r["overflow"] > 0:
        problems.append(f"WIZ summary small={r['small']} spills={r['spills']}")
    page.locator("[data-wz-next]").click()  # not enough balance → focus the top-up button
    if page.evaluate("() => document.activeElement?.hasAttribute('data-wz-topup')") is not True:
        problems.append("WIZ switch-on without balance did not point to top-up")
    page.locator("[data-wz-topup]").click(); page.wait_for_timeout(300)
    page.locator('#topup label:has(input[value="qris"])').click(); page.locator("[data-co-submit]").click()
    page.locator("[data-co-paid-main]").click(); page.wait_for_timeout(800)
    page.locator("#topup [data-step-panel=success] [data-co-close]").click(); page.wait_for_timeout(200)
    bal = page.locator("[data-wz-balance]").text_content()
    if "Rp55.000 → Rp35.000" not in bal:
        problems.append(f"WIZ balance after top-up {bal!r}")
    page.locator("[data-wz-next]").click()
    page.wait_for_function("() => document.getElementById('wz-on')", timeout=8000)
    page.wait_for_timeout(100)
    d = page.evaluate("() => ({ focus: document.activeElement?.id, bal: TN.store.state.balance, st: TN.store.projectView(TN.store.state.projects[0]).status, url: TN.store.projectView(TN.store.state.projects[0]).url })")
    if d != {"focus": "wz-on", "bal": 35000, "st": "nyala", "url": "ayu.my.id"}:
        problems.append(f"WIZ done {d}")
    page.screenshot(path=str(out / f"app-{name}-wiz-done.png"), full_page=True)
    # template entry + minimum size
    page.goto(base + "app.html?demo=ayu#/buat?template=wa-bot", wait_until="networkidle")
    dis = page.evaluate("() => [...document.querySelectorAll('[data-key=\"apps:wa-bot\"] [role=radio]')].map(b => b.getAttribute('aria-disabled') === 'true')")
    if dis != [True, False, False]:
        problems.append(f"WIZ template minimum {dis}")
    return problems


def project_flow(page, out, name, base):
    """Detail: tabs (keyboard), resize down with refund, stop with refund, resume, domain renewal off, stop project."""
    problems = []
    st = lambda: page.evaluate("() => TN.store.state.balance")
    page.goto(base + "app.html?demo=raka#/proyek/klien-kopi", wait_until="networkidle")
    page.locator("#tab-ringkasan").focus(); page.keyboard.press("ArrowRight"); page.wait_for_timeout(150)
    if page.evaluate("() => [location.hash, document.activeElement?.id]") != ["#/proyek/klien-kopi?tab=layanan", "tab-layanan"]:
        problems.append(f"TABS keyboard {page.evaluate('() => [location.hash, document.activeElement?.id]')}")
    b0 = st()
    page.locator("[data-resize]").first.click(); page.wait_for_timeout(250)
    page.locator('#resize [role=radio][data-size="coba"]').click()
    prev = page.locator("[data-rz-preview]").text_content()
    page.screenshot(path=str(out / f"app-{name}-resize.png"))
    page.locator("[data-rz-go]").click(); page.wait_for_timeout(200)
    # Rutin → Coba-coba with 10 days left: (15.000 − 35.000) ÷ 30 × 10 = −6.666 → Rp6.600 back
    if "Rp6.600" not in prev or st() - b0 != 6600:
        problems.append(f"RESIZE preview={prev!r} delta={st() - b0}")
    b1 = st()
    page.locator("[data-stop]").first.click(); page.wait_for_timeout(250)
    body = page.locator("[data-confirm-body]").text_content()
    page.locator("[data-confirm-ok]").click(); page.wait_for_timeout(200)
    # Coba-coba with 10 days left: floor(15.000 ÷ 30 × 10 ÷ 100) × 100 = Rp5.000
    if "Rp5.000" not in body or st() - b1 != 5000:
        problems.append(f"STOP body={body!r} delta={st() - b1}")
    if page.locator("[data-resume]").count() == 0:
        problems.append("STOP no 'Nyalakan lagi'")
    page.locator("[data-resume]").first.click(); page.wait_for_timeout(200)
    if st() != b1 + 5000 - 15000:
        problems.append(f"RESUME balance {st()}")
    page.evaluate("() => { location.hash = '#/proyek/klien-kopi?tab=pengaturan'; }"); page.wait_for_timeout(150)  # keep the state (no ?demo= reload)
    page.locator("[data-stop-project]").click(); page.wait_for_timeout(250)
    page.locator("[data-confirm-ok]").click(); page.wait_for_timeout(200)
    v = page.evaluate("() => TN.store.projectView(TN.store.state.projects[0]).status")
    if v != "berhenti":
        problems.append(f"STOP PROJECT status {v}")
    page.evaluate("() => { location.hash = '#/proyek/klien-kopi?tab=log'; }"); page.wait_for_timeout(150)
    if page.evaluate("() => document.querySelectorAll('#panel-log li').length") < 2:
        problems.append("LOG empty after actions")
    sums = page.evaluate("() => [TN.store.state.history.reduce((n, h) => n + h.amount, 0), TN.store.state.balance]")
    if sums[0] != sums[1]:
        problems.append(f"HISTORY != balance {sums}")
    return problems


def clock_flow(page, out, name, base):
    """Simulated clock: ayu → +30 days renews (reminder banner) → +30 pauses (paused banner) → top-up resumes."""
    problems = []
    page.goto(base + "app.html?demo=ayu#/beranda", wait_until="networkidle")
    adv = lambda: (page.locator("[data-open-more]").click(), page.locator("#more [data-advance]").click()) if page.viewport_size["width"] < 1024 else (page.locator("#acct-btn").click(), page.locator("#acct-menu [data-advance]").click())
    adv(); page.wait_for_timeout(200)
    t1 = page.evaluate("() => [TN.store.state.clock, TN.store.state.balance, TN.store.banners().map(b => b.type)]")
    adv(); page.wait_for_timeout(200)
    t2 = page.evaluate("() => [TN.store.state.clock, TN.store.banners().map(b => b.type), document.getElementById('view').textContent.includes('dijeda')]")
    if t1 != ["2026-12-21", 1100, ["reminder"]] or t2 != ["2027-01-20", ["paused"], True]:
        problems.append(f"CLOCK {t1} {t2}")
    page.screenshot(path=str(out / f"app-{name}-clock-paused.png"), full_page=True)
    return problems


def ai_flow(page, out, name, base):
    problems = []
    page.goto(base + "app.html?demo=raka#/ai", wait_until="networkidle")
    page.locator("#tab-mulai").focus(); page.keyboard.press("ArrowRight"); page.wait_for_timeout(150)
    if page.evaluate("() => [location.hash, document.activeElement?.id]") != ["#/ai?tab=model", "tab-model"]:
        problems.append("AI tabs keyboard")
    page.evaluate("() => { location.hash = '#/ai?tab=coba'; }"); page.wait_for_timeout(300)  # old link → Chat AI
    if page.evaluate("() => location.hash") != "#/chat":
        problems.append(f"AI old ?tab=coba did not move to #/chat: {page.evaluate('() => location.hash')}")
    b0 = page.evaluate("() => TN.store.state.balance")
    page.locator("[data-example]").first.click(); page.wait_for_timeout(900)
    cost = page.evaluate("() => TN.store.chatCost(TN.data.MODELS.find(m => m.id === 'deepseek-chat'), 400 + Math.ceil(TN.i18n.t('ai.try.ex1').length / 4), 350)")
    b1 = page.evaluate("() => TN.store.state.balance")
    log = page.locator("#view [role=log]").text_content()
    if b0 - b1 != cost or "DeepSeek Chat" not in log or page.evaluate("() => document.activeElement?.id") != "try-input":
        problems.append(f"CHAT cost={cost} delta={b0 - b1}")
    page.locator("[data-chat-new]").click(); page.wait_for_timeout(150)
    page.fill("#try-input", "Halo"); page.keyboard.press("Enter"); page.wait_for_timeout(900)
    chats = page.evaluate("() => [...document.querySelectorAll('[data-chat-open]')].map(b => b.getAttribute('aria-current'))")
    if chats != ["true", None]:
        problems.append(f"CHAT new conversation list {chats}")
    if "Ekspor" not in page.locator("[data-chat-export]").text_content() and "Export" not in page.locator("[data-chat-export]").text_content():
        problems.append("CHAT export button")
    stored = page.evaluate("() => JSON.stringify(localStorage)")
    if "Halo" in stored:
        problems.append("CHAT prompts written to localStorage")
    # attachments: an image on a text-only model → warning + cheapest model that reads it; .txt refused; cost = tokens × rate
    png = bytes.fromhex("89504e470d0a1a0a0000000d4948445200000001000000010806000000" "1f15c4890000000d4944415478da6364f8cf00000301010018dd8db00000000049454e44ae426082")
    page.select_option("#try-model", "deepseek-chat"); page.wait_for_timeout(100)
    page.set_input_files("[data-chat-file]", files=[{"name": "poster.png", "mimeType": "image/png", "buffer": png}, {"name": "catatan.txt", "mimeType": "text/plain", "buffer": b"x"}])
    page.wait_for_timeout(300)
    a = page.evaluate("() => ({ n: document.querySelectorAll('[data-pending] li').length, cant: !!document.querySelector('[data-cant-read]'), note: !!document.querySelector('[data-attach-note]'), sw: document.querySelector('[data-switch-model]')?.dataset.switchModel })")
    if a != {"n": 1, "cant": True, "note": True, "sw": "gemini-flash"}:
        problems.append(f"CHAT attachment checks {a}")
    page.locator("[data-switch-model]").click(); page.wait_for_timeout(150)
    b0 = page.evaluate("() => TN.store.state.balance")
    page.locator("[data-try-form] [type=submit]").click(); page.wait_for_timeout(900)
    want = page.evaluate("() => TN.store.chatCost(TN.data.MODELS.find(m => m.id === 'gemini-flash'), 400 + TN.data.ATTACH.image.tokens, 350)")
    if b0 - page.evaluate("() => TN.store.state.balance") != want or page.locator("[data-pending]").count():
        problems.append(f"CHAT attachment cost want={want}")
    page.screenshot(path=str(out / f"app-{name}-chat-attach.png"), full_page=True)
    page.screenshot(path=str(out / f"app-{name}-chat.png"), full_page=True)
    page.goto(base + "app.html?demo=raka#/ai", wait_until="networkidle")
    page.evaluate("() => { location.hash = '#/ai?tab=pemakaian'; }"); page.wait_for_timeout(150)
    bars = page.locator("[data-bar]")
    if bars.count() != 7:
        problems.append(f"AI chart bars {bars.count()}")
    page.locator("[data-plot]").focus()            # keyboard: focus starts on today, ←×3 → 18 Nov
    for _ in range(3):
        page.keyboard.press("ArrowLeft")
    tip = page.evaluate("() => { const t = document.querySelector('[data-bar][data-active] [role=tooltip]'); return t && getComputedStyle(t).display !== 'none' ? t.textContent + ' | ' + document.querySelector('[data-chart-live]').textContent : null; }")
    if not tip or "18 Nov" not in tip or "Rp9.450" not in tip:
        problems.append(f"AI chart tooltip on focus {tip!r}")
    page.locator("[data-chart]").screenshot(path=str(out / f"app-{name}-ai-chart.png"))
    page.locator("#panel-pemakaian summary").click()
    if page.evaluate("() => document.querySelectorAll('#panel-pemakaian tbody tr').length") != 7:
        problems.append("AI table view rows")
    page.evaluate("() => { location.hash = '#/ai?tab=key'; }"); page.wait_for_timeout(150)
    page.locator("[data-key-active]").first.click()
    if page.evaluate("() => TN.store.state.projects[0].keyActive") is not False:
        problems.append("AI key toggle")
    return problems


def services_flow(page, out, name, base):
    problems = []
    page.goto(base + "app.html?demo=raka#/layanan/server?tambah=1", wait_until="networkidle")
    b0 = page.evaluate("() => TN.store.state.balance")
    page.locator('[role=radio][data-size="sedang"]').click()
    page.locator('label:has(input[value="singapura"])').click()
    page.locator("[data-sf-go]").click(); page.wait_for_timeout(200)
    res = page.evaluate("() => ({ focus: document.activeElement?.id, text: document.getElementById('view').textContent, bal: TN.store.state.balance, sv: TN.store.state.services.filter(s => s.svc === 'server').map(s => s.size + ':' + s.location) })")
    if res["focus"] != "sf-done" or b0 - res["bal"] != 120000 or res["sv"] != ["sedang:singapura"] or "hanya menampilkannya sekali" not in res["text"]:
        problems.append(f"SERVER add focus={res['focus']} delta={b0 - res['bal']} sv={res['sv']}")
    page.screenshot(path=str(out / f"app-{name}-server-done.png"), full_page=True)
    page.locator("[data-sf-close]").click(); page.wait_for_timeout(150)
    if page.locator("#view ul a[href*='tab=layanan']").count() != 1:
        problems.append("SERVER not listed after adding")
    page.evaluate("() => { location.hash = '#/layanan/storage'; }"); page.wait_for_timeout(150)
    if "Belum ada tempat simpan file" not in page.locator("#view").text_content():
        problems.append("STORAGE empty state")
    page.evaluate("() => { location.hash = '#/layanan/domain?tambah=1'; }"); page.wait_for_timeout(150)
    page.fill("#sf-domain", "kopikita"); page.select_option("#sf-ext", "com")
    page.fill("#sf-domain", "kopikita")
    page.locator("[data-sf-go]").click(); page.wait_for_timeout(150)
    if page.evaluate("() => document.activeElement?.id") != "sf-domain" or page.locator("#sf-domain-error").count() == 0:
        problems.append("DOMAIN taken address accepted")
    return problems


def apps_flow(page, out, name, base):
    """Apps menu: list → manage (tabs, keyboard), password show/hide, Telegram token validation (never stored)."""
    problems = []
    page.goto(base + "app.html?demo=dimas#/aplikasi", wait_until="networkidle")
    if page.locator("#view a[href='#/aplikasi/s2']").count() != 1 or page.locator("#apps-catalog a[href^='#/buat?template=']").count() != 5:
        problems.append("APPS list/catalogue")
    page.locator("[data-apps-to-catalog]").click(); page.wait_for_timeout(500)
    if page.evaluate("() => document.activeElement?.id") != "apps-catalog":
        problems.append("APPS install button does not move to the catalogue")
    page.locator("#view a[href='#/aplikasi/s2']").click(); page.wait_for_timeout(200)
    tabs = page.evaluate("() => [...document.querySelectorAll('[role=tab]')].map(t => t.dataset.tab)")
    if tabs != ["akses", "pemakaian", "log", "ukuran"]:
        problems.append(f"APPS n8n tabs {tabs}")
    page.locator("[data-reveal]").click(); page.wait_for_timeout(100)
    if "•" in page.locator("[data-pass]").text_content() or page.locator("[data-reveal]").get_attribute("aria-pressed") != "true":
        problems.append("APPS password reveal")
    page.locator("#tab-akses").focus(); page.keyboard.press("End"); page.wait_for_timeout(150)
    if page.evaluate("() => [location.hash, document.activeElement?.id]") != ["#/aplikasi/s2?tab=ukuran", "tab-ukuran"]:
        problems.append("APPS tabs keyboard")
    page.screenshot(path=str(out / f"app-{name}-apps-size.png"), full_page=True)
    # a chat app has a Connections tab: Telegram token is validated and never stored
    page.evaluate("() => { TN.store.addProject({ name: 'agent-dimas', items: [{ svc: 'apps', tpl: 'agent', size: 'rutin' }] }); TN.store.save(); }")
    sv = page.evaluate("() => TN.store.state.services.find(x => x.tpl === 'agent').id")
    page.evaluate(f"() => {{ location.hash = '#/aplikasi/{sv}?tab=sambungan'; }}"); page.wait_for_timeout(200)
    page.fill("#tg-token", "salah"); page.locator("[data-tg-form] [type=submit]").click(); page.wait_for_timeout(150)
    if page.evaluate("() => [document.activeElement?.id, document.getElementById('tg-token')?.getAttribute('aria-invalid')]") != ["tg-token", "true"]:
        problems.append("APPS Telegram invalid token")
    page.fill("#tg-token", "123456789:AAEabcdefghijklmnopqrstuvwx"); page.locator("[data-tg-form] [type=submit]").click(); page.wait_for_timeout(150)
    if page.locator("[data-tg-off]").count() != 1 or "AAEabc" in page.evaluate("() => JSON.stringify(localStorage)"):
        problems.append("APPS Telegram connect (or token stored)")
    page.screenshot(path=str(out / f"app-{name}-apps-connect.png"), full_page=True)
    return problems


def nat_flow(page, out, name, base):
    """Budget server (VPS NAT): kinds switch, add → SSH command + ports, self-service add/remove, validation."""
    problems = []
    page.goto(base + "app.html?demo=raka#/layanan/nat?tambah=1", wait_until="networkidle")
    if page.locator("nav a[href='#/layanan/nat'][aria-current=page]").count() != 1:
        problems.append("NAT kind switch current")
    b0 = page.evaluate("() => TN.store.state.balance")
    page.locator('[role=radio][data-size="sedang"]').click()
    page.locator("[data-sf-go]").click(); page.wait_for_timeout(200)
    r = page.evaluate("() => { const sv = TN.store.state.services.find(s => s.svc === 'nat'); return { bal: TN.store.state.balance, size: sv?.size, ports: sv?.ports?.length, ssh: document.querySelector('#view code.font-mono')?.textContent }; }")
    if b0 - r["bal"] != 45000 or r["size"] != "sedang" or r["ports"] != 1:
        problems.append(f"NAT add {r} delta={b0 - r['bal']}")
    cmd = page.locator("[data-copy^='ssh ubuntu@nat-jkt.tokennyala.example -p ']").count()
    if cmd != 1:
        problems.append("NAT SSH command")
    page.fill("#np-inner", "99999"); page.locator("[data-port-form] [type=submit]").click(); page.wait_for_timeout(150)
    if page.evaluate("() => document.getElementById('np-inner')?.getAttribute('aria-invalid')") != "true":
        problems.append("NAT invalid port accepted")
    for port in ("5678", "80", "443", "8080"):
        page.fill("#np-inner", port); page.locator("[data-port-form] [type=submit]").click(); page.wait_for_timeout(150)
    full = page.evaluate("() => ({ n: TN.store.state.services.find(s => s.svc === 'nat').ports.length, form: !!document.querySelector('[data-port-form]') })")
    if full != {"n": 5, "form": False}:
        problems.append(f"NAT ports limit {full}")
    page.locator("[data-port-remove]").first.click(); page.wait_for_timeout(150)
    if page.evaluate("() => TN.store.state.services.find(s => s.svc === 'nat').ports.length") != 4 or page.locator("[data-port-form]").count() != 1:
        problems.append("NAT port remove")
    page.screenshot(path=str(out / f"app-{name}-nat-ports.png"), full_page=True)
    page.locator("[data-sf-close]").click(); page.wait_for_timeout(150)
    link = page.locator("#view a[href^='#/layanan/nat?kelola=']")
    if link.count() != 1:
        problems.append("NAT not listed")
    else:
        link.click(); page.wait_for_timeout(200)
        if page.locator("[data-port-form]").count() != 1 or "Password" in page.locator("#view").text_content():
            problems.append("NAT manage view (password must not show again)")
    return problems


NALA_LAST = """() => { const last = [...document.querySelectorAll('#chat [data-chat-log] > *')].pop();
  return [...last.querySelectorAll('a')].map(a => a.getAttribute('href')); }"""


def nala_topics_flow(page, out, name, base, url, inside):
    """Nala knows Apps, Server (incl. budget NAT), Chat AI + attachments: free text (ID/EN) and the 'Server murah?' chip."""
    problems = []
    page.goto(base + url, wait_until="networkidle")
    page.wait_for_timeout(300)
    page.evaluate("() => TN.nala.open()"); page.wait_for_timeout(250)
    go = (lambda r: r) if inside else (lambda r: "app.html" + r)
    want = {"server murah buat bot telegram": ["#/layanan/nat"] if inside else ["harga.html#detail-nat"],
            "bisa upload gambar?": [go("#/chat")], "mau pasang n8n": [go("#/aplikasi")], "I need a VPS with SSH": ["#/layanan/nat"] if inside else ["harga.html#detail-nat"]}
    for q, links in want.items():
        page.fill("#chat-input", q); page.keyboard.press("Enter"); chat_wait(page)
        got = page.evaluate(NALA_LAST)
        if got != links:
            problems.append(f"NALA {q!r} -> {got} (want {links})")
    page.locator("#chat [data-chat-chips] button", has_text="Server murah?").click(); chat_wait(page)
    if page.evaluate(NALA_LAST) != want["I need a VPS with SSH"]:
        problems.append("NALA 'Server murah?' chip")
    page.evaluate("() => TN.nala.close()")
    return problems


def home_next_flow(page, out, name, base):
    """Home next step: an agent not on Telegram yet → connect card; then (balance, no AI used) → Chat AI card."""
    problems = []
    page.goto(base + "app.html?demo=reset#/masuk", wait_until="networkidle")
    page.evaluate("() => { TN.store.signIn('Tes'); TN.store.topup({ amount: 50000, bonus: 5000, method: 'qris' }); TN.store.addProject({ name: 'agent-tes', items: [{ svc: 'apps', tpl: 'agent', size: 'rutin' }] }); TN.store.save(); location.hash = '#/beranda'; }")
    page.wait_for_timeout(300)
    if page.locator("#view a[href$='?tab=sambungan']").count() != 1:
        problems.append("HOME next: no Telegram connect card for the agent")
    page.evaluate("() => { TN.store.state.services.find(x => x.tpl === 'agent').tg = true; TN.store.save(); location.hash = '#/proyek'; }"); page.wait_for_timeout(150)
    page.evaluate("() => { location.hash = '#/beranda'; }"); page.wait_for_timeout(300)
    if page.locator("#view a[href='#/chat']").count() != 1:
        problems.append("HOME next: no Chat AI card for a user who never used AI")
    page.screenshot(path=str(out / f"app-{name}-home-next-chat.png"), full_page=True)
    return problems


def learn_flow(page, out, name, base):
    problems = []
    page.goto(base + "app.html?demo=ayu#/belajar", wait_until="networkidle")
    page.locator("#view a[href='#/belajar?panduan=g-chatbot']").click(); page.wait_for_timeout(150)
    g = page.evaluate("() => ({ h1: document.querySelector('#view h1').textContent, steps: document.querySelectorAll('#view ol > li').length, try: document.querySelector('#view a.btn')?.getAttribute('href') })")
    if g != {"h1": "Chatbot WhatsApp pertamamu", "steps": 4, "try": "#/buat?template=wa-bot"}:
        problems.append(f"LEARN guide {g}")
    page.evaluate("() => { location.hash = '#/bantuan'; }"); page.wait_for_timeout(150)
    if page.locator("#view details").count() != 6:
        problems.append("HELP faq count")
    page.locator("[data-help-team]").click(); page.wait_for_timeout(800)
    if not page.evaluate("() => document.getElementById('chat').open && TN.nala.state.mode !== 'bot'"):
        problems.append("HELP talk to team did not open Nala in team mode")
    return problems

def serve(directory):
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    handler = functools.partial(Quiet, directory=str(directory))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out")
    ap.add_argument("--interactive", action="store_true")
    ap.add_argument("--pages", help="comma-separated subset of " + ",".join(PAGES))
    args = ap.parse_args()
    out = pathlib.Path(args.out or tempfile.mkdtemp(prefix="qa-v4-"))
    out.mkdir(parents=True, exist_ok=True)
    pages = args.pages.split(",") if args.pages else list(PAGES)
    httpd = serve(ROOT)
    base = f"http://127.0.0.1:{httpd.server_address[1]}/"
    failures = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for page_name in pages:
            cfg = PAGES[page_name]
            for name, w, h in VIEWPORTS:
                ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, reduced_motion="reduce")
                page = ctx.new_page()
                errors = []
                page.on("console", lambda m: errors.append(m.text) if m.type in ("error", "warning") else None)
                page.on("pageerror", lambda e: errors.append(str(e)))
                page.goto(base + cfg.get("url", page_name), wait_until="networkidle")
                page.wait_for_timeout(150)
                r = page.evaluate(CHECK_JS)
                e = page.evaluate(EXTRA_JS)
                page.screenshot(path=str(out / f"{page_name.split('.')[0]}-{name}.png"), full_page=True)

                status = []
                if r["overflow"] > 0:
                    status.append(f"OVERFLOW {r['overflow']}px: {r['offenders']}")
                if r["small"]:
                    status.append(f"SMALL TARGETS: {r['small']}")
                if r["spills"]:
                    status.append(f"TEXT SPILLS: {r['spills']}")
                if r["broken"]:
                    status.append(f"BROKEN IMAGES: {r['broken']}")
                if r["escapes"]:
                    status.append(f"ESCAPES SHELL: {r['escapes']}")
                if r["headerPosition"] not in ("sticky", "fixed"):
                    status.append(f"CSS not applied? header position={r['headerPosition']}")
                if e["missingIcons"]:
                    status.append(f"MISSING ICONS: {e['missingIcons']}")
                if e["keyLike"]:
                    status.append(f"I18N KEYS SHOWN: {e['keyLike']}")
                if name in ABOVE_FOLD_VIEWPORTS and cfg.get("fold"):
                    below = page.evaluate(FOLD_JS, cfg["fold"])
                    if below:
                        status.append(f"BELOW FOLD: {below}")

                if args.interactive and page_name == "index.html":
                    if w < 1024:
                        status += landing_menu_flow(page, out, name)
                    if name in ("320", "375", "768", "1440"):
                        page.evaluate("() => window.scrollTo(0, 0)")
                        status += landing_recipe_flow(page, out, name)
                    if name in ("320", "375", "768", "1440"):
                        status += landing_catalog_flow(page, out, name)
                        status += landing_consult_flow(page, out, name)
                    if name in ("375", "1440"):
                        status += landing_misc_flow(page, out, name)
                        status += landing_chat_flow(page, out, name, base + page_name)
                        page.goto(base + page_name, wait_until="networkidle")
                    if name in ("320", "1440"):
                        status += landing_lang_flow(page, out, name)

                if args.interactive and page_name == "harga.html":
                    if name in ("320", "375", "768", "1440"):
                        status += harga_calc_flow(page, out, name, base)
                    if name in ("320", "1440"):
                        status += harga_lang_flow(page, out, name, base)

                if args.interactive and page_name == "app-masuk" and name in ("320", "375", "1440"):
                    status += console_auth_flow(page, out, name, base)
                if args.interactive and page_name == "app-beranda":
                    if name in ("320", "375", "768", "1440"):
                        status += console_home_flow(page, out, name, base)
                        status += console_topup_flow(page, out, name, base)
                    if name in ("375", "1440"):
                        status += console_account_flow(page, out, name, base)
                if args.interactive and page_name == "app-jeda" and name in ("375", "1440"):
                    status += console_jeda_flow(page, out, name, base)
                if args.interactive and page_name == "app-saldo" and name in ("320", "1440"):
                    status += console_lang_flow(page, out, name, base)
                if args.interactive and page_name == "app-buat" and name in ("320", "375", "1440"):
                    status += wizard_flow(page, out, name, base)
                if args.interactive and page_name == "app-ai" and name in ("375", "1440"):
                    status += ai_flow(page, out, name, base)
                if args.interactive and page_name == "app-layanan" and name in ("320", "375", "1440"):
                    status += services_flow(page, out, name, base)
                if args.interactive and page_name == "app-aplikasi" and name in ("375", "1440"):
                    status += apps_flow(page, out, name, base)
                if args.interactive and page_name == "app-nat" and name in ("320", "375", "1440"):
                    status += nat_flow(page, out, name, base)
                if args.interactive and page_name == "app-bantuan" and name in ("375", "1440"):
                    status += learn_flow(page, out, name, base)
                    status += nala_topics_flow(page, out, name, base, "app.html?demo=raka#/beranda", True)
                    status += home_next_flow(page, out, name, base)
                if args.interactive and page_name == "harga.html" and name == "1440":
                    status += nala_topics_flow(page, out, name, base, "harga.html", False)
                if args.interactive and page_name == "app-proyek" and name in ("375", "1440"):
                    status += project_flow(page, out, name, base)
                    status += clock_flow(page, out, name, base)

                if errors:
                    status.append(f"CONSOLE: {errors}")
                print(f"[{'FAIL' if status else 'ok  '}] {page_name:<11} {name:>18}  " + ("; ".join(status) if status else ""))
                if status:
                    failures.append(f"{page_name} {name}")
                ctx.close()
        if args.interactive:
            for page_name in [x for x in pages if x in ("index.html", "harga.html")]:  # console has no scroll motion
                for name, w, h in (("375", 375, 667), ("1440", 1440, 900)):
                    m = motion_flow(browser, base, out, name, w, h, page_name)
                    print(f"[{'FAIL' if m else 'ok  '}] {'motion ' + page_name.split('.')[0]:<11} {name:>18}  " + ("; ".join(m) if m else ""))
                    if m:
                        failures.append(f"motion {page_name} {name}")
        browser.close()
    httpd.shutdown()
    print(f"screenshots: {out}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
