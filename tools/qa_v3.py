#!/usr/bin/env python3
"""Responsive QA for v3 (docs/v3-ground-rules.md, rule 7).

Usage:
    python3 tools/qa_v3.py [--out DIR] [--interactive]

Serves v3/ on a local port, opens each required viewport in headless Chromium, and checks:
  - no horizontal overflow (scrollWidth <= innerWidth)
  - no content escaping its .shell gutter (even when clipped by overflow-x-clip)
  - no text spilling out of its own box (scrollWidth > clientWidth)
  - visible buttons/links/inputs have a tap target >= 44x44 px (inline text links in paragraphs are exempt)
  - no console errors / page errors
  - Tailwind actually applied (header is sticky)
Full-page screenshots are written to --out (default: a temp dir).
With --interactive, also exercises the mobile menu and language switch.
Exit code 1 if any check fails.
"""
import argparse
import functools
import http.server
import pathlib
import sys
import tempfile
import threading

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent / "v3"
VIEWPORTS = [
    ("320", 320, 640),
    ("375", 375, 667),
    ("768", 768, 1024),
    ("1024", 1024, 768),
    ("1440", 1440, 900),
    ("667x375-landscape", 667, 375),
]

# Must be fully visible without scrolling on small portrait phones (docs/wireframe-notes.md)
ABOVE_FOLD = ["#hero-title", "#hero-title ~ div > [data-open-checkout]"]
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
  const header = document.querySelector('header');
  return {
    overflow, offenders, small, escapes, spills,
    headerPosition: header ? getComputedStyle(header).position : null,
  };
}
"""


def checkout_flow(page, out, name):
    """Open checkout from the hero CTA, validate, pay with QRIS, reach success, close with Escape."""
    problems = []
    page.evaluate("() => window.scrollTo(0, 0)")
    opener = page.locator("#hero-title ~ div > [data-open-checkout]")
    opener.click()
    page.wait_for_timeout(350)
    box = page.evaluate("""() => { const d = document.getElementById('checkout'); const r = d.getBoundingClientRect();
        return { open: d.open, top: r.top, bottom: r.bottom, left: r.left, right: r.right, vh: innerHeight, vw: innerWidth,
                 focus: document.activeElement?.id, scrollLocked: document.documentElement.classList.contains('overflow-hidden') }; }""")
    if not box["open"]:
        return ["CHECKOUT did not open"]
    if box["top"] < -1 or box["bottom"] > box["vh"] + 1 or box["left"] < -1 or box["right"] > box["vw"] + 1:
        problems.append(f"CHECKOUT outside viewport {box}")
    if box["focus"] != "co-title" or not box["scrollLocked"]:
        problems.append(f"CHECKOUT focus={box['focus']} scrollLocked={box['scrollLocked']}")
    r = page.evaluate(CHECK_JS)
    if r["small"]:
        problems.append(f"CHECKOUT SMALL TARGETS: {r['small']}")
    if r["spills"]:
        problems.append(f"CHECKOUT TEXT SPILLS: {r['spills']}")
    page.screenshot(path=str(out / f"{name}-checkout.png"))

    # empty submit → both errors, focus on contact
    page.locator("[data-co-submit]").click()
    err = page.evaluate("""() => ({ contact: !document.querySelector('[data-error-for=contact]').classList.contains('hidden'),
                                    method: !document.querySelector('[data-error-for=method]').classList.contains('hidden'),
                                    focus: document.activeElement?.id })""")
    if err != {"contact": True, "method": True, "focus": "co-contact"}:
        problems.append(f"CHECKOUT validation {err}")
    page.fill("#co-contact", "0812-3456-7890")
    page.locator("label:has(input[name=co-method][value=qris])").click()
    page.wait_for_timeout(250)  # let the checked-state transition finish
    page.screenshot(path=str(out / f"{name}-checkout-errors.png"))
    scrolled = page.evaluate("() => { const d = document.getElementById('checkout'); return d.scrollTop + ' / overflow ' + (d.scrollHeight - d.clientHeight); }")
    if not scrolled.startswith("0 / overflow 0"):
        problems.append(f"CHECKOUT dialog itself scrolled: scrollTop {scrolled} (content leaking out of the scroll body)")
    page.locator("[data-co-submit]").click()
    page.wait_for_timeout(100)
    if page.evaluate("() => document.getElementById('checkout').dataset.step") != "pay":
        problems.append("CHECKOUT did not reach pay step")
    page.screenshot(path=str(out / f"{name}-checkout-pay.png"))
    page.locator("[data-pay-footer] [data-co-paid]").click()
    page.wait_for_timeout(800)
    done = page.evaluate("""() => ({ step: document.getElementById('checkout').dataset.step,
                                     body: document.querySelector('[data-co-success-body]').textContent,
                                     key: document.querySelector('[data-co-key]').textContent })""")
    if done["step"] != "success" or "+6281234567890" not in done["body"] or not done["key"].startswith("tn-demo-"):
        problems.append(f"CHECKOUT success {done}")
    page.screenshot(path=str(out / f"{name}-checkout-success.png"))
    page.keyboard.press("Escape")
    page.wait_for_timeout(100)
    after = page.evaluate("""() => ({ open: document.getElementById('checkout').open,
                                      focusOk: document.activeElement === document.querySelector('#hero-title ~ div > [data-open-checkout]'),
                                      unlocked: !document.documentElement.classList.contains('overflow-hidden') })""")
    if after != {"open": False, "focusOk": True, "unlocked": True}:
        problems.append(f"CHECKOUT close {after}")

    # success → "Lihat panduan pasang" closes the dialog and lands on #pakai
    if page.locator("#pakai").count():
        page.evaluate("() => TokenNyala.openCheckout('learn')")
        page.wait_for_timeout(250)
        page.locator("label:has(input[name=co-method][value=va])").click()
        page.locator("[data-co-submit]").click()
        page.locator("[data-pay-footer] [data-co-paid]").click()
        page.wait_for_timeout(800)
        page.locator("[data-co-guide]").click()
        # smooth scroll over a long mobile page can take >1.5s: wait until scrollY is stable
        page.wait_for_function("""() => { const y = scrollY; const prev = window.__qaLastY; window.__qaLastY = y; return prev === y; }""", polling=250, timeout=5000)
        guide = page.evaluate("""() => ({ open: document.getElementById('checkout').open,
            top: Math.round(document.getElementById('pakai').getBoundingClientRect().top),
            header: Math.round(document.querySelector('header').getBoundingClientRect().bottom) })""")
        if guide["open"] or not (guide["header"] - 2 <= guide["top"] <= guide["header"] + 40):
            problems.append(f"CHECKOUT guide link {guide}")
    return problems


# Expected "≈ N sesi / Rp10.000" per model — docs/technical-spec.md → Katalog Model Mock
SPEC_PER10K = {"deepseek-chat": 39, "gemini-flash": 35, "qwen-plus": 29, "gpt-mini": 27, "deepseek-reasoner": 19,
               "claude-haiku": 11, "qwen-max": 8, "gpt": 6, "claude-sonnet": 5, "gemini-pro": 4, "claude-opus": 2, "gpt-pro": 1}
SPEC_TIER = {"deepseek-chat": "hemat", "gemini-flash": "hemat", "qwen-plus": "hemat", "gpt-mini": "hemat",
             "deepseek-reasoner": "hemat", "claude-haiku": "hemat", "qwen-max": "seimbang", "gpt": "seimbang",
             "claude-sonnet": "seimbang", "gemini-pro": "seimbang", "claude-opus": "premium", "gpt-pro": "premium"}


def catalog_flow(page, out, name):
    """Open the model catalog, page through, search, filter, empty state, close."""
    problems = []
    data = page.evaluate("() => TokenNyala.models.map(m => [m.id, m.per10k, m.tier])")
    got = {i: n for i, n, _ in data}
    tiers = {i: tr for i, _, tr in data}
    if got != SPEC_PER10K or tiers != SPEC_TIER:
        problems.append(f"MODELS data differs from spec: per10k={got} tiers={tiers}")

    page.evaluate("() => document.querySelector('#model').scrollIntoView()")
    btn = page.locator("[data-open-catalog]")
    btn.click()
    page.wait_for_timeout(300)
    cat = lambda js: page.evaluate(f"() => {{ const d = document.getElementById('catalog'); {js} }}")
    box = cat("const r = d.getBoundingClientRect(); return { open: d.open, ok: r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1, focus: document.activeElement?.id };")
    if box != {"open": True, "ok": True, "focus": "cat-title"}:
        problems.append(f"CATALOG open {box}")
    r = page.evaluate(CHECK_JS)
    if r["small"]:
        problems.append(f"CATALOG SMALL TARGETS: {r['small']}")
    if r["spills"]:
        problems.append(f"CATALOG TEXT SPILLS: {r['spills']}")
    page.screenshot(path=str(out / f"{name}-catalog.png"))

    count = lambda: cat("return [d.querySelectorAll('[data-cat-list] > li').length, d.querySelector('[data-cat-count]').textContent];")
    first = count()
    page.locator("[data-cat-more]").click()
    second = count()
    page.fill("#cat-search", "claude")
    third = count()
    if page.locator("[data-filter-toggle]").is_visible():
        page.locator("[data-filter-toggle]").click()
    page.locator('[data-filter="tier"][data-value="premium"]').click()
    page.wait_for_timeout(200)
    page.screenshot(path=str(out / f"{name}-catalog-filtered.png"))
    fourth = cat("return [...d.querySelectorAll('[data-cat-list] [data-m-name]')].map(e => e.textContent);")
    page.fill("#cat-search", "zzz")
    empty = cat("return d.querySelector('[data-cat-empty]').dataset.show;")
    page.locator("[data-cat-clear]").click()
    cleared = count()
    scroll = cat("return d.scrollTop;")
    expected = ([6], [12], [3], ["Claude Opus"], "true", [6])
    actual = ([first[0]], [second[0]], [third[0]], fourth, empty, [cleared[0]])
    if actual != expected or "dari 12" not in first[1] and "of 12" not in first[1]:
        problems.append(f"CATALOG flow {actual} != {expected} ({first[1]!r})")
    if scroll:
        problems.append(f"CATALOG dialog itself scrolled {scroll}")
    page.keyboard.press("Escape")
    page.wait_for_timeout(100)
    back = page.evaluate("() => ({ open: document.getElementById('catalog').open, focus: document.activeElement?.hasAttribute('data-open-catalog') })")
    if back != {"open": False, "focus": True}:
        problems.append(f"CATALOG close {back}")
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
    ap.add_argument("--out", default=None)
    ap.add_argument("--interactive", action="store_true")
    args = ap.parse_args()
    out = pathlib.Path(args.out or tempfile.mkdtemp(prefix="qa-v3-"))
    out.mkdir(parents=True, exist_ok=True)

    httpd = serve(ROOT)
    url = f"http://127.0.0.1:{httpd.server_address[1]}/index.html"
    failures = []

    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, w, h in VIEWPORTS:
            ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1,
                                      has_touch=w < 1024, is_mobile=w < 768)
            page = ctx.new_page()
            errors = []
            page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(url, wait_until="networkidle")
            page.wait_for_timeout(300)
            r = page.evaluate(CHECK_JS)
            page.screenshot(path=str(out / f"{name}.png"), full_page=True)

            status = []
            if r["overflow"] > 0:
                status.append(f"OVERFLOW {r['overflow']}px: {r['offenders']}")
            if r["small"]:
                status.append(f"SMALL TARGETS: {r['small']}")
            if r["spills"]:
                status.append(f"TEXT SPILLS: {r['spills']}")
            if r["escapes"]:
                status.append(f"ESCAPES SHELL: {r['escapes']}")
            if r["headerPosition"] != "sticky":
                status.append(f"Tailwind not applied? header position={r['headerPosition']}")
            if errors:
                status.append(f"CONSOLE: {errors}")
            if name in ABOVE_FOLD_VIEWPORTS:
                below = page.evaluate(FOLD_JS, ABOVE_FOLD)
                if below:
                    status.append(f"BELOW FOLD: {below}")
            if page.evaluate("() => !!window.TokenNyala?.selectPackage"):
                page.evaluate("() => window.TokenNyala.selectPackage('prototype')")
                page.wait_for_timeout(800)
                page.screenshot(path=str(out / f"{name}-selected.png"))

            if args.interactive and w < 1024:
                btn = page.locator("#menu-button")
                btn.click()
                opened = page.evaluate("() => !document.getElementById('mobile-menu').hidden")
                expanded = btn.get_attribute("aria-expanded")
                page.screenshot(path=str(out / f"{name}-menu.png"))
                r2 = page.evaluate(CHECK_JS)
                if r2["overflow"] > 0:
                    status.append(f"MENU OVERFLOW {r2['overflow']}px")
                if r2["small"]:
                    status.append(f"MENU SMALL TARGETS: {r2['small']}")
                page.keyboard.press("Escape")
                closed = page.evaluate("() => document.getElementById('mobile-menu').hidden")
                focused = page.evaluate("() => document.activeElement?.id")
                if not (opened and expanded == "true" and closed and focused == "menu-button"):
                    status.append(f"MENU BEHAVIOUR opened={opened} expanded={expanded} closedOnEsc={closed} focus={focused}")

            if args.interactive and name in ("375", "1440") and page.locator('[role="tab"][data-intent]').count():
                page.locator('[role="tab"][data-intent]').first.focus()
                page.keyboard.press("ArrowRight")
                page.keyboard.press("ArrowRight")
                checks = page.evaluate("""() => ({
                  tab: document.querySelector('[role=tab][aria-selected=true]')?.dataset.intent,
                  focused: document.activeElement?.dataset.intent,
                  reco: document.querySelector('[data-package][data-recommended=true]')?.dataset.package,
                  recoCount: document.querySelectorAll('[data-package][data-recommended=true]').length,
                })""")
                page.locator("[data-choose-recommended]").click()
                page.wait_for_timeout(300)
                checks.update(page.evaluate("""() => ({
                  selected: document.querySelector('[data-package][data-selected=true]')?.dataset.package,
                  hero: document.querySelector('[data-hero-balance]')?.dataset.state,
                  checkoutOpen: !!document.getElementById('checkout')?.open,
                  checkoutPkg: document.querySelector('[name=co-package]:checked')?.value,
                })"""))
                page.keyboard.press("Escape")
                page.wait_for_timeout(100)
                checks["focusBack"] = page.evaluate("() => document.activeElement?.hasAttribute('data-choose-recommended')")
                page.locator("#paket").screenshot(path=str(out / f"{name}-paket.png"))
                expected = {"tab": "work", "focused": "work", "reco": "work", "recoCount": 1, "selected": "work", "hero": "on",
                            "checkoutOpen": True, "checkoutPkg": "work", "focusBack": True}
                if checks != expected:
                    status.append(f"PACKAGES {checks} != {expected}")

            if args.interactive and name in ("320", "375", "768", "1440", "667x375-landscape") and page.locator("dialog#checkout").count():
                status += checkout_flow(page, out, name)

            if args.interactive and name in ("320", "375", "768", "1440") and page.locator("dialog#catalog").count():
                status += catalog_flow(page, out, name)

            if args.interactive and name == "375" and page.locator("#pakai [data-copy-value]").count():
                b = page.locator("#pakai [data-copy-value]")
                b.click()
                page.wait_for_timeout(100)
                if b.text_content().strip() not in ("Tersalin", "Copied"):
                    status.append(f"COPY button text {b.text_content()!r}")

            if args.interactive and name == "1440":
                page.locator('header [data-lang="en"]').first.click()
                lang = page.evaluate("() => document.documentElement.lang")
                cta = page.locator("header [data-open-checkout]").first.text_content()
                page.reload(wait_until="networkidle")
                persisted = page.evaluate("() => document.documentElement.lang")
                if not (lang == "en" and cta.strip() == "Top up" and persisted == "en"):
                    status.append(f"LANG lang={lang} cta={cta!r} persisted={persisted}")

            print(f"[{'FAIL' if status else 'ok  '}] {name:>18}  " + ("; ".join(status) if status else ""))
            if status:
                failures.append(name)
            ctx.close()
        browser.close()
    httpd.shutdown()
    print(f"screenshots: {out}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
