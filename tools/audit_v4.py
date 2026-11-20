#!/usr/bin/env python3
"""Release audit for v4 (docs/v4/technical-spec.md §8–9). Grows with each phase.

Usage: python3 tools/audit_v4.py

Accessibility — axe-core 4.14.0 (WCAG 2.1 AA + best practice) on every page in PAGES, ID + EN, 375 + 1440,
  plus every overlay: mobile menu, Nala chat (all pages); model catalogue, team consultation (landing);
  add-service dialog, open mobile summary (harga).
Definition of Done extras:
  - DoD 1  every page opens from file:// without console errors (CSS applied, scripts ran)
  - DoD 7  prefers-reduced-motion: no animation/transition longer than 0.01ms, scroll-behavior auto, GSAP/Lenis off
  - DoD 8  storage blocked (localStorage throws): page still renders and switches language
  - DoD 9  only the 4 loaded font faces render (Manrope 500/700/800, IBM Plex Mono 500)
  - DoD 10 assets/css/app.css equals a fresh `tailwindcss --minify` build of src/tailwind.css
  - DoD 12 the simulation label is visible on landing, harga, console (home + wizard) and in the top-up sheet
  - DoD 11 storage holds only tn-lang after using the page (incl. consultation form + Nala offline contact);
           console: only tn-v4-demo (+ tn-lang), never the email/phone used to sign in
  - console: axe on sign-in, home (ayu), paused home (jeda), balance (raka), wizard (goal, setup, summary, done),
    projects, project detail (every tab) + top-up form/pay/success, resize, stop confirm, "Lainnya", account menu,
    confirm, Nala; preset balances/dates vs §8; history always sums to the balance
  - DoD 4  numbers: TN.data recomputes the values transcribed below from docs/v4/services-and-pricing.md
           (§3 units, §6 recipes, §7 example, §8 balance-until, §2 refund/prorata examples), and the landing
           renders them for every recipe in ID and EN; harga: calculator summary + CTA per recipe and every
           price/model rate in the detail tables
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
PAGES = ["index.html", "harga.html"]  # fase 4+: app.html routes
RENDERED_CHECK = {"index.html": "[data-recipe-card] h3", "harga.html": "[data-calc-rows] li"}
APP_ROUTES = [("masuk", "app.html?demo=reset#/masuk"), ("beranda", "app.html?demo=ayu#/beranda"),
              ("jeda", "app.html?demo=ayu&state=jeda#/beranda"), ("saldo", "app.html?demo=raka#/saldo"),
              ("buat-1", "app.html?demo=ayu#/buat"), ("buat-2", "app.html?demo=ayu#/buat?resep=web-klien"),
              ("proyek", "app.html?demo=dimas#/proyek"), ("detail", "app.html?demo=raka#/proyek/klien-kopi"),
              ("ai", "app.html?demo=raka#/ai"), ("layanan", "app.html?demo=raka#/layanan/server?tambah=1"),
              ("layanan-kosong", "app.html?demo=ayu#/layanan/storage"), ("belajar", "app.html?demo=ayu#/belajar?panduan=g-chatbot"),
              ("bantuan", "app.html?demo=ayu#/bantuan")]
# services-and-pricing §8: preset → (balance, "cukup sampai" shown on the home card)
PRESETS = {"ayu": ("Rp31.220", "±19 Des"), "raka": ("Rp239.640", "±31 Des"), "dimas": ("Rp647.800", "±22 Jan")}

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
    "templates": {"wa-bot": 47000, "n8n": 15000, "agent": 63000, "dify": 47000, "wordpress": 15000},  # §5.4
    "nala": [  # §6 Aturan Nala: (recipe, hasCode, load) → s
        ("portofolio", False, "ramai", "hosting:ramai,domain:my.id,ai:20"),
        ("portofolio", True, "coba", "hosting:coba,domain:my.id,ai:10"),
        ("chatbot-wa", True, "coba", "wa-bot:rutin,pesan:1000"),
        ("otomasi-tim", True, "coba", "n8n:rutin,database:sedang,email:2500,tugas:5000"),
        ("web-klien", True, "rutin", "hosting:rutin,database:kecil,email:gratis,domain:com,ai:30"),
    ],
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
  for (const [id, v] of Object.entries(doc.templates)) if (D.templateCost(id) !== v) out.push(`template ${id} ${D.templateCost(id)} != ${v}`);
  const x = D.exampleTotals();
  if (x.total[0] !== doc.example.min || x.total[1] !== doc.example.max) out.push(`exampleTotals ${x.total}`);
  for (const [id, hasCode, load, want] of doc.nala) { const got = D.serialize(D.nalaItems(id, { hasCode, load })); if (got !== want) out.push(`nala ${id}/${hasCode}/${load} ${got} != ${want}`); }
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
  const tpl = document.querySelector('[data-templates]').textContent;
  for (const id of Object.keys(D.TEMPLATES)) if (!tpl.includes(I.rpK(D.templateCost(id)))) out.push(`${I.lang} templates miss ${id} ${I.rpK(D.templateCost(id))}`);
  const ex = document.querySelector('[data-example]').textContent, x = D.exampleTotals();
  for (const v of [I.rp(x.total[0]), I.num(x.total[1]), I.rp(x.hosting), I.rp(x.domain)]) if (!ex.includes(v)) out.push(`${I.lang} example misses ${v}`);
  const safe = document.querySelector('[data-safe]').textContent;
  for (const v of [I.rp(D.refund(D.SIZES.coba.price, 20)), I.rp(-D.prorata(D.SIZES.rutin.price, D.SIZES.coba.price, 20)), I.rp(D.TOPUP_MIN)]) if (!safe.includes(v)) out.push(`${I.lang} safe cards miss ${v}`);
  return out;
}
"""


HARGA_JS = """
() => {
  const D = TN.data, I = TN.i18n, out = [];
  const sel = document.getElementById('calc-recipe');
  for (const r of D.RECIPES.filter(x => !x.aiOnly)) {
    sel.value = r.id; sel.dispatchEvent(new Event('change'));
    const tot = D.recipeTotals(r.items);
    const sum = document.getElementById('calc-summary').textContent;
    const want = [I.rpK(tot.perMonth), I.rp(tot.fixed), I.rp(tot.usage), I.rp(tot.perMonth), I.rp(tot.suggest.amount)].concat(tot.yearly ? [I.rp(tot.firstMonth), I.rp(tot.yearly)] : []);
    for (const w of want) if (!sum.includes(w)) out.push(`${I.lang} summary ${r.id} misses ${w}`);
    const cta = document.querySelector('[data-calc-cta]').getAttribute('href');
    if (cta !== `app.html#/buat?resep=${r.id}&s=${D.serialize(r.items)}`) out.push(`cta ${r.id} ${cta}`);
  }
  const page = document.querySelector('main').textContent;
  const prices = [
    ...Object.values(D.SIZES).map(x => x.price), ...Object.values(D.SERVER).map(x => x.price), ...Object.values(D.DATABASE).map(x => x.price),
    ...Object.values(D.STORAGE).map(x => x.price), ...Object.values(D.EMAIL).map(x => x.price), ...Object.values(D.DOMAINS).flatMap(x => [x.first, x.renew]),
    ...D.TOPUPS.flatMap(p => [p.amount, p.bonus, p.amount + p.bonus]), ...Object.values(D.UNITS).map(u => u.cost),
    ...Object.keys(D.TEMPLATES).map(D.templateCost), D.PAYMENTS.withdraw, D.TOPUP_MIN,
  ];
  for (const v of prices) if (!page.includes(I.rp(v))) out.push(`${I.lang} page misses ${I.rp(v)}`);
  for (const m of D.MODELS) if (!page.includes(m.name) || !page.includes(I.num(m.in))) out.push(`${I.lang} model ${m.name}`);
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
                    # reduced motion: axe measures the final appearance, not an element mid-fade (motion has its own QA check)
                    ctx = b.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce")
                    page = ctx.new_page()
                    page.add_init_script(f"localStorage.setItem('tn-lang', '{lang}')")
                    page.goto(base + page_name, wait_until="networkidle")
                    tag = f"{page_name} {lang} {w}"
                    problems += axe(page, tag)
                    problems += fonts(page, tag)
                    if w == 375:
                        page.locator("#menu-button").click()
                        page.wait_for_timeout(450)  # header colour transition (300ms) settles first
                        problems += axe(page, f"mobile menu {tag}")
                        page.keyboard.press("Escape")
                    # Nala on every page (modal on mobile, panel on desktop)
                    page.evaluate("() => TN.nala.open()"); page.wait_for_timeout(250)
                    page.locator("#chat [data-chat-chips] button").first.click(); page.wait_for_timeout(700)
                    problems += axe(page, f"chat {tag}", "#chat")
                    problems += fonts(page, f"chat {tag}")
                    page.evaluate("() => TN.nala.close()")
                    if page_name == "harga.html":
                        page.locator("[data-calc-add]").click(); page.wait_for_timeout(350)
                        problems += axe(page, f"add service {tag}", "#add-svc")
                        page.keyboard.press("Escape")
                        if w == 375:
                            page.locator("[data-calc-rows]").scroll_into_view_if_needed()
                            page.locator("[data-calc-toggle]").click()
                            problems += axe(page, f"summary open {tag}", "#calc-summary")
                        if w == 1440:
                            problems += [f"[numbers] harga: {x}" for x in page.evaluate(HARGA_JS)]
                    if page_name == "index.html":
                        # dialogs: catalogue, consultation (errors + success)
                        page.evaluate("() => TN.landing.openCatalog()"); page.wait_for_timeout(350)
                        problems += axe(page, f"catalog {tag}", "#catalog")
                        page.keyboard.press("Escape")
                        page.evaluate("() => TN.landing.openConsult()"); page.wait_for_timeout(350)
                        page.locator("#consult [type=submit]").click()
                        problems += axe(page, f"consult errors {tag}", "#consult")
                        page.fill("#cs-name", "Dimas"); page.fill("#cs-org", "Studio"); page.fill("#cs-contact", "dimas@studio.id")
                        page.locator("#consult label:has(input[name=teamSize])").first.click()
                        page.locator("#consult input[name=consent]").check(); page.locator("#consult [type=submit]").click()
                        problems += axe(page, f"consult success {tag}", "#consult")
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
            if page.evaluate("() => document.documentElement.classList.contains('motion-ok')"):
                problems.append(f"[dod] {page_name} reduced motion still starts GSAP/Lenis")
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
            rendered = page.evaluate("(sel) => !!document.querySelector(sel)", RENDERED_CHECK[page_name])
            if errors or lang != "en" or not rendered:
                problems.append(f"[dod] {page_name} storage blocked: errors={errors} lang={lang} rendered={rendered}")
            ctx.close()

            # DoD 11: storage holds only the language
            ctx = b.new_context(viewport={"width": 1440, "height": 900})
            page = ctx.new_page()
            page.goto(base + page_name, wait_until="networkidle")
            page.locator('header [data-lang="en"]').click()
            if page_name == "index.html":
                page.locator('[data-recipe-chips] [data-recipe="web-klien"]').click()
                page.evaluate("() => TN.landing.openConsult()"); page.wait_for_timeout(300)
                page.fill("#cs-name", "Dimas"); page.fill("#cs-org", "Studio"); page.fill("#cs-contact", "0812-3456-7890")
                page.locator("#consult label:has(input[name=teamSize])").first.click()
                page.locator("#consult input[name=consent]").check(); page.locator("#consult [type=submit]").click()
                page.keyboard.press("Escape")
            if page_name == "harga.html":  # the calculator keeps its state in the URL, never in storage
                page.select_option("#calc-recipe", "web-klien")
                page.locator('[data-key="hosting"] [data-size="ramai"]').click()
            page.goto(base + page_name + "?chat=offline", wait_until="networkidle")
            page.evaluate("() => TN.nala.open()")
            page.locator("#chat [data-chat-chips] button").last.click(); page.wait_for_timeout(700)
            page.fill("#chat-input", "ayu@mail.com"); page.keyboard.press("Enter"); page.wait_for_timeout(700)
            stored = page.evaluate("() => ({ local: {...localStorage}, session: {...sessionStorage}, cookie: document.cookie })")
            if stored != {"local": {"tn-lang": "en"}, "session": {}, "cookie": ""}:
                problems.append(f"[dod] {page_name} storage holds more than the language: {stored}")
            ctx.close()

        # ================= console (app.html) =================
        for label, url in APP_ROUTES:
            for lang in ("id", "en"):
                for w, h in ((375, 667), (1440, 900)):
                    ctx = b.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce")
                    page = ctx.new_page()
                    page.add_init_script(f"localStorage.setItem('tn-lang', '{lang}')")
                    page.goto(base + url, wait_until="networkidle")
                    tag = f"app {label} {lang} {w}"
                    problems += axe(page, tag)
                    problems += fonts(page, tag)
                    if label == "buat-2":  # summary (short of balance) and the finished "Nyala!" screen
                        page.locator("[data-wz-next]").click(); page.wait_for_timeout(200)
                        problems += axe(page, f"wizard summary {tag}")
                        page.evaluate("() => TN.store.topup({ amount: 500000, bonus: 125000, method: 'qris' })")
                        page.evaluate("() => TN.console.render({ focus: false })")
                        page.locator("[data-wz-next]").click()
                        page.wait_for_function("() => document.getElementById('wz-on')", timeout=8000)
                        problems += axe(page, f"wizard done {tag}")
                        problems += fonts(page, f"wizard done {tag}")
                    if label == "ai":
                        for tab in ("coba", "model", "pemakaian", "key"):
                            page.evaluate(f"() => {{ location.hash = '#/ai?tab={tab}'; }}"); page.wait_for_timeout(150)
                            if tab == "coba":
                                page.locator("[data-example]").first.click(); page.wait_for_timeout(800)
                            if tab == "pemakaian":
                                page.locator("[data-plot]").focus()
                                page.locator("#panel-pemakaian summary").click()
                            problems += axe(page, f"ai {tab} {tag}")
                    if label == "layanan":
                        page.locator("[data-sf-go]").click(); page.wait_for_timeout(200)
                        problems += axe(page, f"server result {tag}")
                    if label == "detail":
                        for tab in ("layanan", "ai", "log", "pengaturan"):
                            page.evaluate(f"() => {{ location.hash = '#/proyek/klien-kopi?tab={tab}'; }}"); page.wait_for_timeout(150)
                            problems += axe(page, f"detail {tab} {tag}")
                        page.evaluate("() => { location.hash = '#/proyek/klien-kopi?tab=layanan'; }"); page.wait_for_timeout(150)
                        page.locator("[data-resize]").first.click(); page.wait_for_timeout(300)
                        problems += axe(page, f"resize {tag}", "#resize")
                        page.keyboard.press("Escape"); page.wait_for_timeout(100)
                        page.locator("[data-stop]").first.click(); page.wait_for_timeout(300)
                        problems += axe(page, f"stop confirm {tag}", "#confirm")
                        page.keyboard.press("Escape")
                    if label == "beranda":
                        page.locator("#view [data-topup]").first.click(); page.wait_for_timeout(300)
                        page.locator("[data-co-submit]").click()
                        problems += axe(page, f"topup form errors {tag}", "#topup")
                        page.locator('#topup label:has(input[value="qris"])').click(); page.locator("[data-co-submit]").click(); page.wait_for_timeout(150)
                        problems += axe(page, f"topup pay {tag}", "#topup")
                        page.locator("[data-co-paid-main]").click(); page.wait_for_timeout(800)
                        problems += axe(page, f"topup success {tag}", "#topup")
                        page.keyboard.press("Escape"); page.wait_for_timeout(150)
                        if w == 375:
                            page.locator("[data-open-more]").click(); page.wait_for_timeout(300)
                            problems += axe(page, f"more sheet {tag}", "#more")
                            page.locator("#more [data-reset]").click(); page.wait_for_timeout(300)
                        else:
                            page.locator("#acct-btn").click()
                            problems += axe(page, f"account menu {tag}")
                            page.locator("#acct-menu [data-reset]").click(); page.wait_for_timeout(300)
                        problems += axe(page, f"confirm {tag}", "#confirm")
                        page.keyboard.press("Escape")
                        page.evaluate("() => TN.nala.open()"); page.wait_for_timeout(250)
                        problems += axe(page, f"chat {tag}", "#chat")
                        page.evaluate("() => TN.nala.close()")
                    ctx.close()

        # numbers: presets render the documented balance + "lasts until"; history always sums to the balance
        ctx = b.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        page = ctx.new_page()
        for preset, (bal, until) in PRESETS.items():
            page.goto(base + f"app.html?demo={preset}#/beranda", wait_until="networkidle")
            text = page.evaluate("() => document.getElementById('view').textContent")
            if bal not in text or until not in text:
                problems.append(f"[numbers] app {preset}: expected {bal} and {until} on the home card")
        for q in ("demo=ayu", "demo=raka", "demo=dimas", "demo=ayu&state=jeda"):
            page.goto(base + f"app.html?{q}#/saldo", wait_until="networkidle")
            sums = page.evaluate("() => [TN.store.state.history.reduce((n, h) => n + h.amount, 0), TN.store.state.balance]")
            if sums[0] != sums[1]:
                problems.append(f"[numbers] app {q}: history sums to {sums[0]} but balance is {sums[1]}")
        page.goto(base + "app.html?demo=ayu&state=jeda#/beranda", wait_until="networkidle")
        text = page.evaluate("() => document.getElementById('view').textContent")
        for want in ("Rp8.000", "27 Des", "Rp20.000"):
            if want not in text:
                problems.append(f"[numbers] app jeda misses {want}")
        ctx.close()

        # DoD 12: the simulation label is visible on every page, in the top-up sheet, and in the wizard
        ctx = b.new_context(viewport={"width": 375, "height": 667}, reduced_motion="reduce")
        page = ctx.new_page()
        label_js = """(key) => { const want = TN.i18n.t(key); return [...document.querySelectorAll('body *')].some(el =>
            el.children.length === 0 && el.textContent.trim() === want && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden'); }"""
        for url, key in (("index.html", "footer.prototype"), ("harga.html", "footer.prototype"), ("app.html?demo=ayu#/beranda", "con.prototype"),
                         ("app.html?demo=ayu#/buat?resep=portofolio", "con.prototype")):
            page.goto(base + url, wait_until="networkidle")
            if not page.evaluate(label_js, key):
                problems.append(f"[dod] simulation label {key} not visible on {url}")
        page.locator("#view [data-wz-next]").click(); page.wait_for_timeout(150)
        page.goto(base + "app.html?demo=ayu#/saldo?isi=1", wait_until="networkidle"); page.wait_for_timeout(300)
        if not page.evaluate(label_js, "co.notice"):
            problems.append("[dod] top-up sheet has no visible simulation notice")
        ctx.close()

        # DoD 1 file:// · DoD 7 reduced motion (no long transitions) · DoD 8 storage blocked · DoD 11 contact never stored
        page = b.new_page()
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type in ("error", "warning") else None)
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto((ROOT / "app.html").as_uri() + "?demo=ayu#/beranda", wait_until="networkidle")
        ok = page.evaluate("() => getComputedStyle(document.querySelector('header')).position === 'sticky' && TN.store.state.balance === 31220")
        if errors or not ok:
            problems.append(f"[dod] app file:// errors={errors} ok={ok}")
        page.close()

        ctx = b.new_context(viewport={"width": 375, "height": 667})
        page = ctx.new_page()
        page.add_init_script("""Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } });""")
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(base + "app.html#/beranda", wait_until="networkidle")
        page.fill("#auth-contact", "ayu@mail.com"); page.locator("[data-auth-form] [type=submit]").click()
        page.fill("#auth-code", "123456"); page.locator("[data-auth-form] [type=submit]").click()
        page.fill("#auth-name", "Ayu"); page.locator("[data-auth-form] [type=submit]").click()
        page.wait_for_timeout(150)
        h1 = page.evaluate("() => document.querySelector('#view h1')?.textContent")
        if errors or h1 != "Hai, Ayu":
            problems.append(f"[dod] app storage blocked: errors={errors} h1={h1}")
        ctx.close()

        ctx = b.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        page.goto(base + "app.html?demo=reset#/masuk", wait_until="networkidle")
        page.fill("#auth-contact", "0812-3456-7890"); page.locator("[data-auth-form] [type=submit]").click()
        page.fill("#auth-code", "123456"); page.locator("[data-auth-form] [type=submit]").click()
        page.fill("#auth-name", "Ayu"); page.locator("[data-auth-form] [type=submit]").click()
        page.wait_for_timeout(150)
        page.locator("#view [data-topup]").first.click(); page.wait_for_timeout(250)
        page.locator('#topup label:has(input[value="va"])').click(); page.locator("[data-co-submit]").click()
        page.locator("[data-co-paid-main]").click(); page.wait_for_timeout(800)
        stored = page.evaluate("() => ({ keys: Object.keys(localStorage).sort(), demo: localStorage.getItem('tn-v4-demo') || '', session: sessionStorage.length, cookie: document.cookie })")
        if stored["keys"] != ["tn-v4-demo"] or stored["session"] or stored["cookie"] or any(x in stored["demo"] for x in ("0812", "6281234567890", "@")):
            problems.append(f"[dod] app storage holds more than demo state / holds contact data: {stored['keys']} {stored['demo'][:120]}")
        ctx.close()
        b.close()
    httpd.shutdown()

    print("\n".join(problems) if problems else
          "ok — axe 0 violations, 4 font faces, file://, reduced motion, storage blocked, CSS up to date, numbers match services-and-pricing.md")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
