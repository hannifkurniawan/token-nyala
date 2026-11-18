#!/usr/bin/env python3
"""Release audit for v3 (step 13): accessibility (axe-core, WCAG 2.1 AA) + Definition of Done extras.

Usage: python3 tools/audit_v3.py

Accessibility — axe-core is injected from jsDelivr (pinned) and run on:
  page (ID, EN, mobile + desktop), checkout (form, form with errors, pay, success), catalog, consultation,
  chat (mobile modal + desktop panel), mobile menu open.
Definition of Done extras (docs/technical-spec.md):
  - opens straight from file:// without console errors
  - prefers-reduced-motion: no running animations/transitions longer than 0.01ms
  - localStorage only ever holds the language preference (no email/phone) after a full checkout + consult
  - HTML + CSS + JS (excluding assets) < 300 KB
Exit code 1 on any violation.
"""
import functools
import http.server
import pathlib
import sys
import threading

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent / "v3"
AXE = "https://cdn.jsdelivr.net/npm/axe-core@4.14.0/axe.min.js"
TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def axe(page, label, include=None):
    if not page.evaluate("() => !!window.axe"):
        page.add_script_tag(url=AXE)
    ctx = f"'{include}'" if include else "document"
    res = page.evaluate(f"""async () => {{
        const r = await axe.run({ctx}, {{ runOnly: {{ type: 'tag', values: {TAGS} }}, resultTypes: ['violations'] }});
        return r.violations.map(v => ({{ id: v.id, impact: v.impact, help: v.help,
            nodes: v.nodes.slice(0, 4).map(n => n.target.join(' ') + (n.failureSummary ? ' :: ' + n.failureSummary.split('\\n').slice(1, 2).join('') : '')) }}));
    }}""")
    out = []
    for v in res:
        out.append(f"[a11y] {label}: {v['id']} ({v['impact']}) — {v['help']}")
        out += [f"         {n[:220]}" for n in v["nodes"]]
    return out


def main():
    httpd = serve()
    base = f"http://127.0.0.1:{httpd.server_address[1]}/index.html"
    problems = []
    with sync_playwright() as p:
        b = p.chromium.launch()

        for lang in ("id", "en"):
            for w, h in ((375, 667), (1440, 900)):
                ctx = b.new_context(viewport={"width": w, "height": h})
                page = ctx.new_page()
                page.add_init_script(f"localStorage.setItem('tn-lang', '{lang}')")
                page.goto(base, wait_until="networkidle")
                tag = f"{lang} {w}"
                problems += axe(page, f"page {tag}")
                if lang == "id" and w == 375:
                    page.locator("#menu-button").click()
                    problems += axe(page, f"mobile menu {tag}")
                    page.keyboard.press("Escape")
                if lang == "id":
                    # checkout: form, errors, pay, success
                    page.evaluate("() => TokenNyala.openCheckout('prototype')"); page.wait_for_timeout(300)
                    problems += axe(page, f"checkout form {tag}", "#checkout")
                    page.locator("[data-co-submit]").click()
                    problems += axe(page, f"checkout errors {tag}", "#checkout")
                    page.fill("#co-contact", "ayu@mail.com")
                    page.locator("label:has(input[name=co-method][value=qris])").click()
                    page.locator("[data-co-submit]").click(); page.wait_for_timeout(150)
                    problems += axe(page, f"checkout pay {tag}", "#checkout")
                    page.locator("[data-pay-footer] [data-co-paid]").click(); page.wait_for_timeout(800)
                    problems += axe(page, f"checkout success {tag}", "#checkout")
                    page.keyboard.press("Escape")
                    # catalog
                    page.evaluate("() => TokenNyala.openCatalog()"); page.wait_for_timeout(300)
                    problems += axe(page, f"catalog {tag}", "#catalog")
                    page.keyboard.press("Escape")
                    # consultation (with errors shown)
                    page.evaluate("() => TokenNyala.openConsult()"); page.wait_for_timeout(300)
                    page.locator("#consult [type=submit]").click()
                    problems += axe(page, f"consult errors {tag}", "#consult")
                    page.keyboard.press("Escape")
                # chat
                page.evaluate("() => TokenNyala.openChat()"); page.wait_for_timeout(300)
                page.locator("#chat [data-chat-chips] button").first.click(); page.wait_for_timeout(700)
                problems += axe(page, f"chat {tag}", "#chat")
                page.keyboard.press("Escape")
                ctx.close()

        # ---- DoD: file:// ----
        page = b.new_page()
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto((ROOT / "index.html").as_uri(), wait_until="networkidle")
        ok = page.evaluate("() => getComputedStyle(document.querySelector('header')).position === 'sticky' && !!window.TokenNyala")
        if errors or not ok:
            problems.append(f"[dod] file:// errors={errors} styled+scripted={ok}")
        page.close()

        # ---- DoD: reduced motion ----
        ctx = b.new_context(reduced_motion="reduce", viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        page.goto(base, wait_until="networkidle")
        page.evaluate("() => TokenNyala.openCheckout('learn')"); page.wait_for_timeout(100)
        slow = page.evaluate("""() => [...document.querySelectorAll('*')].map(el => {
            const s = getComputedStyle(el);
            const longest = (v) => Math.max(...v.split(',').map(x => parseFloat(x) * (x.trim().endsWith('ms') ? 1 : 1000)));
            const a = s.animationName !== 'none' ? longest(s.animationDuration) : 0;
            const t = longest(s.transitionDuration);
            return (a > 0.01 || t > 0.01) ? `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join('.')} anim=${a} trans=${t}` : null;
        }).filter(Boolean).slice(0, 5)""")
        if slow:
            problems.append(f"[dod] reduced motion still animates: {slow}")
        smooth = page.evaluate("() => getComputedStyle(document.documentElement).scrollBehavior")
        if smooth != "auto":
            problems.append(f"[dod] reduced motion scroll-behavior={smooth}")
        ctx.close()

        # ---- DoD: storage holds only the language ----
        ctx = b.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        page.goto(base, wait_until="networkidle")
        page.locator('header [data-lang="en"]').first.click()
        page.evaluate("() => TokenNyala.openCheckout('learn')"); page.wait_for_timeout(200)
        page.fill("#co-contact", "0812-3456-7890")
        page.locator("label:has(input[name=co-method][value=va])").click()
        page.locator("[data-co-submit]").click(); page.locator("[data-pay-footer] [data-co-paid]").click(); page.wait_for_timeout(800)
        page.keyboard.press("Escape")
        page.evaluate("() => TokenNyala.openConsult()"); page.wait_for_timeout(200)
        page.fill("#cs-name", "Dimas"); page.fill("#cs-contact", "dimas@studio.id"); page.fill("#cs-org", "Studio")
        page.locator("#consult label:has(input[name=teamSize])").first.click()
        page.locator("#consult input[name=consent]").check(); page.locator("#consult [type=submit]").click()
        stored = page.evaluate("() => ({ local: {...localStorage}, session: {...sessionStorage}, cookie: document.cookie })")
        if stored != {"local": {"tn-lang": "en"}, "session": {}, "cookie": ""}:
            problems.append(f"[dod] storage holds more than the language: {stored}")
        ctx.close()
        b.close()
    httpd.shutdown()

    # ---- DoD: size budget ----
    size = sum((ROOT / f).stat().st_size for f in ("index.html", "styles.css", "script.js"))
    print(f"size: index.html + styles.css + script.js = {size / 1024:.1f} KB (budget 300 KB)")
    if size >= 300 * 1024:
        problems.append(f"[dod] size {size} bytes >= 300 KB")

    print("\n".join(problems) if problems else "ok — no axe violations (WCAG 2.1 AA + best practice), DoD extras pass")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
