#!/usr/bin/env python3
"""Responsive QA for v3 (docs/v3-ground-rules.md, rule 7).

Usage:
    python3 tools/qa_v3.py [--out DIR] [--interactive]

Serves v3/ on a local port, opens each required viewport in headless Chromium, and checks:
  - no horizontal overflow (scrollWidth <= innerWidth)
  - no content escaping its .shell gutter (even when clipped by overflow-x-clip)
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
  const header = document.querySelector('header');
  return {
    overflow, offenders, small, escapes,
    headerPosition: header ? getComputedStyle(header).position : null,
  };
}
"""


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
