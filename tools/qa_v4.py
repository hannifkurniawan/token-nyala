#!/usr/bin/env python3
"""Responsive + interaction QA for v4 (docs/v4/technical-spec.md §8, rule 7).

Usage:
    python3 tools/qa_v4.py [--out DIR] [--interactive] [--pages index.html,...]

Serves v4/ on a local port and opens every page in PAGES at 6 viewports (headless Chromium):
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
  - motion (375 + 1440, motion ON, every page): scroll the whole page, then nothing in <main> may stay hidden
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

ROOT = pathlib.Path(__file__).resolve().parent.parent / "v4"
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
        want = "app.html#/ai?isi=1" if r["id"] == "ai-coding" else f"app.html#/buat?resep={r['id']}"
        if set(r["start"]) != {want}:
            problems.append(f"RECIPE {r['id']} start links {set(r['start'])} != {want}")
        if r["id"] != "portofolio" and not r["live"]:
            problems.append(f"RECIPE {r['id']} not announced")
        if r["id"] != "portofolio" and r["focused"] != r["id"]:
            problems.append(f"RECIPE focus {r['focused']} != {r['id']}")
        page.screenshot(path=str(out / f"index-{name}-recipe-{r['id']}.png"), clip=page.locator("#resep").bounding_box(), full_page=True)
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
        page.locator("#menu-button").click()
        page.locator('#mobile-menu [data-lang="en"]').click()
        page.keyboard.press("Escape")
    lang = page.evaluate("() => document.documentElement.lang")
    cta = page.locator("#hero-cta").text_content().strip()
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
    page.locator("#chat-launcher").click()
    page.wait_for_timeout(200)
    modal = page.evaluate("() => document.getElementById('chat').matches(':modal')")
    if modal != (page.viewport_size["width"] < 768):
        problems.append(f"CHAT modal={modal} at width {page.viewport_size['width']}")
    chips = lambda: page.locator("#chat [data-chat-chips] button")
    chips().first.click(); chat_wait(page)                       # Bantu pilih resep
    chips().first.click(); chat_wait(page)                       # Landing page
    chips().nth(1).click(); chat_wait(page)                      # Belum, mau dibuat dengan AI
    chips().nth(2).click(); chat_wait(page)                      # Ramai
    links = page.evaluate("() => [...document.querySelectorAll('#chat [data-chat-log] a')].map(a => a.getAttribute('href'))")
    want = ["app.html#/buat?resep=portofolio&s=hosting:ramai,domain:my.id,ai:20", "harga.html?resep=portofolio&s=hosting:ramai,domain:my.id,ai:20#kalkulator"]
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
           switches: [...document.querySelectorAll('[data-final-switch], #cerita li:last-child .switch--lg')].map(s => s.hasAttribute('data-on')) };
}
"""


def motion_flow(browser, base, out, name, w, h, page_name="index.html"):
    """With motion on: scroll the whole page slowly; afterwards nothing may stay hidden."""
    ctx = browser.new_context(viewport={"width": w, "height": h})
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(base + page_name, wait_until="networkidle")
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
    want_cta = "app.html#/buat?resep=portofolio&s=hosting:coba,domain:my.id,ai:10"
    if s0["total"] != rk(33900) or s0["cta"] != want_cta or s0["search"] != "?resep=portofolio&s=hosting:coba,domain:my.id,ai:10":
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
    page.select_option("#calc-recipe", "chatbot-wa")
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
    page.goto(base + "harga.html?resep=portofolio&s=hosting:ramai,domain:my.id,ai:20#kalkulator", wait_until="networkidle")
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
                page.goto(base + page_name, wait_until="networkidle")
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
                if r["headerPosition"] != "sticky":
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

                if errors:
                    status.append(f"CONSOLE: {errors}")
                print(f"[{'FAIL' if status else 'ok  '}] {page_name:<11} {name:>18}  " + ("; ".join(status) if status else ""))
                if status:
                    failures.append(f"{page_name} {name}")
                ctx.close()
        if args.interactive:
            for page_name in pages:
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
