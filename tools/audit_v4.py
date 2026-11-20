#!/usr/bin/env python3
"""Release audit for v4 (docs/v4/technical-spec.md §8–9). Grows with each phase.

Usage: python3 tools/audit_v4.py

Accessibility — axe-core 4.14.0 (WCAG 2.1 AA + best practice) on every page in PAGES, ID + EN, 375 + 1440,
  plus every overlay that exists so far (fase 1: mobile menu).
Definition of Done extras:
  - DoD 1  every page opens from file:// without console errors (CSS applied, scripts ran)
  - DoD 7  prefers-reduced-motion: no animation/transition longer than 0.01ms, scroll-behavior auto
  - DoD 8  storage blocked (localStorage throws): page still renders and switches language
  - DoD 9  only the 4 loaded font faces render (Manrope 500/700/800, IBM Plex Mono 500)
  - DoD 10 assets/css/app.css equals a fresh `tailwindcss --minify` build of src/tailwind.css
  - DoD 11 storage holds only tn-lang after using the page
  - DoD 4  numbers: TN.data recomputes the values transcribed below from docs/v4/services-and-pricing.md
           (§3 units, §6 recipes, §7 example, §8 balance-until, §2 refund/prorata examples), and the landing
           renders them for every recipe in ID and EN
Exit code 1 on any problem.
"""
import functools
import http.server
import pathlib
import subprocess
import sys
import tempfile
import threading

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent / "v4"
AXE = "https://cdn.jsdelivr.net/npm/axe-core@4.14.0/axe.min.js"
TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]
FACES = ["Manrope 500", "Manrope 700", "Manrope 800", "IBM Plex Mono 500"]
PAGES = ["index.html"]  # fase 3: harga.html, fase 4+: app.html routes

# ---- transcribed from docs/v4/services-and-pricing.md (the doc is the reference, data.js must agree) ----
DOC = {
    "units": {"sesi": 1890, "pesan": 12, "tugas": 28},                                   # §3
    "recipes": {                                                                          # §6
        # id: (fixed, usage, yearly, perMonth, firstMonth, suggest amount, months, "≈ K")
        "portofolio": (15000, 18900, 5000, 33900, 38900, 50000, 1, 34),
        "chatbot-wa": (35000, 12000, 0, 47000, 47000, 50000, 1, 47),
        "web-klien": (45000, 56700, 245000, 101700, 346700, 500000, 3, 102),
        "otomasi-tim": (145000, 140000, 0, 285000, 285000, 500000, 2, 285),
    },
    "example": {"min": 40790, "max": 54020},                                              # §7
    "hero": {"balance": 55000, "spent": 42680, "left": 12320},                            # §7
    "until": [  # §8 presets: (balance, fixed, domain renewals, usage 7 days) → date from 21 Nov 2026
        ("ayu", 31220, 15000, 25000, 3780, "2026-12-19"),
        ("raka", 239640, 90000, 270000, 15120, "2026-12-31"),
        ("dimas", 647800, 210000, 0, 23520, "2027-01-22"),
    ],
    "refund": [(15000, 20, 10000)],                 # user-journeys skenario 6 (stop on day 10)
    "prorata": [(15000, 35000, 20, 13400), (35000, 15000, 20, -13300)],
    "suggest": [(38900, 50000), (47000, 50000), (346700, 500000), (285000, 500000), (100000, 100000)],
}

NUMBERS_JS = """
(doc) => {
  const D = TN.data, out = [];
  for (const [u, v] of Object.entries(doc.units)) if (D.UNITS[u].cost !== v) out.push(`unit ${u} ${D.UNITS[u].cost} != ${v}`);
  for (const [id, e] of Object.entries(doc.recipes)) {
    const t = D.recipeTotals(D.recipe(id).items);
    const got = [t.fixed, t.usage, t.yearly, t.perMonth, t.firstMonth, t.suggest.amount, t.months, D.roundK(t.perMonth)];
    if (JSON.stringify(got) !== JSON.stringify(e)) out.push(`recipe ${id} ${JSON.stringify(got)} != ${JSON.stringify(e)}`);
  }
  const ex = D.EXAMPLE, fixed = D.SIZES[ex.size].price + D.DOMAINS[ex.ext].first;
  const exMin = D.sessionCost(ex.sessions[0]) + fixed, exMax = D.sessionCost(ex.sessions[1]) + fixed;
  if (exMin !== doc.example.min || exMax !== doc.example.max) out.push(`example ${exMin}-${exMax}`);
  const h = D.heroScenario();
  if (h.balance !== doc.hero.balance || h.spent !== doc.hero.spent || h.left !== doc.hero.left) out.push(`hero ${JSON.stringify(h)}`);
  for (const [who, balance, fx, dom, u7, date] of doc.until) {
    const d = D.balanceUntil({ balance, fixed: fx, domainRenewals: dom, usage7: u7, today: new Date(2026, 10, 21) });
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (iso !== date) out.push(`balanceUntil ${who} ${iso} != ${date}`);
  }
  for (const [price, days, v] of doc.refund) if (D.refund(price, days) !== v) out.push(`refund ${price}/${days} ${D.refund(price, days)} != ${v}`);
  for (const [a, b, days, v] of doc.prorata) if (D.prorata(a, b, days) !== v) out.push(`prorata ${a}->${b}/${days} ${D.prorata(a, b, days)} != ${v}`);
  for (const [need, v] of doc.suggest) if (D.suggestTopup(need).amount !== v) out.push(`suggest ${need} ${D.suggestTopup(need).amount} != ${v}`);
  return out;
}
"""

RENDERED_JS = """
() => {
  const D = TN.data, I = TN.i18n, out = [];
  for (const r of D.RECIPES) {
    TN.landing.selectRecipe(r.id);
    const text = document.querySelector('[data-recipe-card]').textContent;
    const want = r.aiOnly ? D.AI_ONLY.map(x => I.rp(x.amount))
      : (() => { const t = D.recipeTotals(r.items); return [I.rpK(t.perMonth), I.rp(t.fixed), I.rp(t.usage), I.rp(t.suggest.amount), I.rp(t.suggest.amount + t.suggest.bonus)]; })();
    for (const w of want) if (!text.includes(w)) out.push(`${I.lang} card ${r.id} misses ${w}`);
  }
  TN.landing.selectRecipe(D.RECIPES[0].id);
  const wallet = document.querySelector('[data-wallet]').textContent, h = D.heroScenario();
  for (const v of [h.balance, h.left]) if (!wallet.includes(I.rp(v))) out.push(`${I.lang} wallet misses ${I.rp(v)}`);
  const svc = document.querySelector('[data-services]').textContent;
  for (const [id, f] of Object.entries(D.FROM)) if (f.price && !svc.includes(I.rp(f.price))) out.push(`${I.lang} services miss ${id} ${I.rp(f.price)}`);
  return out;
}
"""


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


def fonts(page, label):
    bad = page.evaluate("""(faces) => {
        const ok = new Set(faces), bad = new Set();
        for (const el of document.querySelectorAll('body *')) {
            if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
            if (el.closest('[hidden]')) continue;
            const s = getComputedStyle(el);
            const k = s.fontFamily.split(',')[0].replace(/["']/g, '').trim() + ' ' + s.fontWeight + (s.fontStyle === 'normal' ? '' : ' ' + s.fontStyle);
            if (!ok.has(k)) bad.add(`${k} :: ${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 4).join('.')} "${el.textContent.trim().slice(0, 30)}"`);
        }
        return [...bad].slice(0, 6);
    }""", FACES)
    return [f"[font] {label}: {b}" for b in bad]


def css_up_to_date():
    with tempfile.TemporaryDirectory() as tmp:
        target = pathlib.Path(tmp) / "app.css"
        r = subprocess.run(["npx", "--no-install", "tailwindcss", "-i", "src/tailwind.css", "-o", str(target), "--minify"],
                           cwd=ROOT, capture_output=True, text=True)
        if r.returncode != 0:
            return [f"[dod] CSS build failed: {r.stderr[-300:]}"]
        if target.read_bytes() != (ROOT / "assets" / "css" / "app.css").read_bytes():
            return ["[dod] assets/css/app.css is stale — run `npm run build` in v4/"]
    return []


def main():
    problems = css_up_to_date()
    httpd = serve()
    base = f"http://127.0.0.1:{httpd.server_address[1]}/"
    with sync_playwright() as p:
        b = p.chromium.launch()
        for page_name in PAGES:
            for lang in ("id", "en"):
                for w, h in ((375, 667), (1440, 900)):
                    ctx = b.new_context(viewport={"width": w, "height": h})
                    page = ctx.new_page()
                    page.add_init_script(f"localStorage.setItem('tn-lang', '{lang}')")
                    page.goto(base + page_name, wait_until="networkidle")
                    tag = f"{page_name} {lang} {w}"
                    problems += axe(page, tag)
                    problems += fonts(page, tag)
                    if page_name == "index.html":
                        if w == 375:
                            page.locator("#menu-button").click()
                            page.wait_for_timeout(450)  # header colour transition (300ms) settles first
                            problems += axe(page, f"mobile menu {tag}")
                            page.keyboard.press("Escape")
                        if w == 1440:
                            if lang == "id":
                                problems += [f"[numbers] {x}" for x in page.evaluate(NUMBERS_JS, DOC)]
                            problems += [f"[numbers] rendered: {x}" for x in page.evaluate(RENDERED_JS)]
                    ctx.close()

            # DoD 1: file://
            page = b.new_page()
            errors = []
            page.on("console", lambda m: errors.append(m.text) if m.type in ("error", "warning") else None)
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto((ROOT / page_name).as_uri(), wait_until="networkidle")
            ok = page.evaluate("() => getComputedStyle(document.querySelector('header')).position === 'sticky' && !!window.TN?.data && !!document.querySelector('#i-globe')")
            if errors or not ok:
                problems.append(f"[dod] {page_name} file:// errors={errors} styled+scripted={ok}")
            page.close()

            # DoD 7: reduced motion
            ctx = b.new_context(reduced_motion="reduce", viewport={"width": 1440, "height": 900})
            page = ctx.new_page()
            page.goto(base + page_name, wait_until="networkidle")
            slow = page.evaluate("""() => [...document.querySelectorAll('*')].map(el => {
                const s = getComputedStyle(el);
                const longest = (v) => Math.max(...v.split(',').map(x => parseFloat(x) * (x.trim().endsWith('ms') ? 1 : 1000)));
                const a = s.animationName !== 'none' ? longest(s.animationDuration) : 0;
                const t = longest(s.transitionDuration);
                return (a > 0.01 || t > 0.01) ? `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join('.')} anim=${a} trans=${t}` : null;
            }).filter(Boolean).slice(0, 5)""")
            if slow:
                problems.append(f"[dod] {page_name} reduced motion still animates: {slow}")
            if page.evaluate("() => getComputedStyle(document.documentElement).scrollBehavior") != "auto":
                problems.append(f"[dod] {page_name} reduced motion keeps smooth scrolling")
            ctx.close()

            # DoD 8: storage blocked
            ctx = b.new_context(viewport={"width": 375, "height": 667})
            page = ctx.new_page()
            page.add_init_script("""Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } });""")
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(base + page_name, wait_until="networkidle")
            page.locator("#menu-button").click()
            page.locator('#mobile-menu [data-lang="en"]').click()
            lang = page.evaluate("() => document.documentElement.lang")
            rendered = page.evaluate("() => !!document.querySelector('[data-recipe-card] h3')")
            if errors or lang != "en" or not rendered:
                problems.append(f"[dod] {page_name} storage blocked: errors={errors} lang={lang} rendered={rendered}")
            ctx.close()

            # DoD 11: storage holds only the language
            ctx = b.new_context(viewport={"width": 1440, "height": 900})
            page = ctx.new_page()
            page.goto(base + page_name, wait_until="networkidle")
            page.locator('header [data-lang="en"]').click()
            page.locator('[data-recipe-chips] [data-recipe="web-klien"]').click()
            stored = page.evaluate("() => ({ local: {...localStorage}, session: {...sessionStorage}, cookie: document.cookie })")
            if stored != {"local": {"tn-lang": "en"}, "session": {}, "cookie": ""}:
                problems.append(f"[dod] {page_name} storage holds more than the language: {stored}")
            ctx.close()
        b.close()
    httpd.shutdown()

    print("\n".join(problems) if problems else
          "ok — axe 0 violations, 4 font faces, file://, reduced motion, storage blocked, CSS up to date, numbers match services-and-pricing.md")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
