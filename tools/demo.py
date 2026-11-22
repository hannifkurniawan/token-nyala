#!/usr/bin/env python3
"""Walk the demo script (docs/demo.md, 24 steps) at 375×812 and save a numbered screenshot per step.
Fails (exit 1) if any step doesn't reach its expected state — use it to rehearse before a demo.

Usage: python3 -P tools/demo.py [--out DIR] [--width 375] [--height 812] [--url https://hannifkurniawan.github.io/token-nyala/]
       Without --url the local site/ folder is served; with --url the deployed site (GitHub Pages) is used.
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
# 1×1 PNG: the "photo" attached in the Chat AI step (in a live demo: any photo on the device)
PNG = bytes.fromhex("89504e470d0a1a0a0000000d4948445200000001000000010806000000" "1f15c4890000000d4944415478da6364f8cf00000301010018dd8db00000000049454e44ae426082")


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out")
    ap.add_argument("--width", type=int, default=375)
    ap.add_argument("--height", type=int, default=812)
    ap.add_argument("--url", help="deployed site to rehearse against (default: serve site/ locally)")
    args = ap.parse_args()
    out = pathlib.Path(args.out or tempfile.mkdtemp(prefix="demo-v4-"))
    out.mkdir(parents=True, exist_ok=True)
    httpd = None if args.url else serve()
    base = args.url.rstrip("/") + "/" if args.url else f"http://127.0.0.1:{httpd.server_address[1]}/"
    failures, n = [], [0]

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": args.width, "height": args.height}, device_scale_factor=2, reduced_motion="reduce")
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        def shot(title, check=True):
            n[0] += 1
            name = f"{n[0]:02d}-{title}.png"
            page.screenshot(path=str(out / name))
            ok = bool(check)
            print(f"[{'ok  ' if ok else 'FAIL'}] {n[0]:02d} {title}")
            if not ok:
                failures.append(title)

        def at(sel):
            page.locator(sel).first.scroll_into_view_if_needed()
            page.wait_for_timeout(150)

        text = lambda sel: page.locator(sel).first.text_content() or ""

        # 0:00 Landing — not a token shop: an AI cloud platform that starts from the goal
        page.goto(base + "index.html", wait_until="networkidle")
        shot("landing-hero", "dari prompt" in text("#hero-title"))
        at("#paket"); shot("mau-bikin-apa", "Rp34 rb" in text("[data-recipe-card]"))
        page.locator('[data-recipe="otomasi-tim"]').click(); shot("paket-otomasi-tim", "Rp285 rb" in text("[data-recipe-card]"))
        # 1:00 All services + one balance
        at("#layanan"); shot("semua-layanan", page.locator("[data-services] li").count() == 11)
        at("#saldo"); shot("satu-saldo", "Rp12.320" in text("[data-wallet]"))
        # 2:00 Pricing calculator
        page.goto(base + "harga.html?paket=portofolio#kalkulator", wait_until="networkidle")
        at("[data-calc-rows]")
        page.locator('[data-key="hosting"] [data-size="rutin"]').click()
        shot("kalkulator-rutin", "Rp54 rb" in text("[data-calc-total]"))
        # 3:00 Console: sign in → wizard (recipe prefilled) → summary short of balance → top-up → switch on
        page.goto(base + "app.html?demo=reset#/buat?paket=portofolio", wait_until="networkidle")
        shot("masuk", page.locator("#auth-contact").count() == 1)
        page.fill("#auth-contact", "ayu@mail.com"); page.locator("[data-auth-form] [type=submit]").click()
        page.fill("#auth-code", "123456"); page.locator("[data-auth-form] [type=submit]").click()
        page.fill("#auth-name", "Ayu"); page.locator("[data-auth-form] [type=submit]").click(); page.wait_for_timeout(200)
        shot("wizard-atur", page.locator("#wz-name").input_value() == "portofolio-ayu")
        page.locator("[data-wz-next]").click(); page.wait_for_timeout(200)
        shot("wizard-ringkasan", text("[data-wz-total]") == "Rp20.000")
        page.locator("[data-wz-topup]").click(); page.wait_for_timeout(300)
        shot("isi-saldo", page.evaluate("() => document.getElementById('topup').open"))
        page.locator('#topup label:has(input[value="qris"])').click(); page.locator("[data-co-submit]").click(); page.wait_for_timeout(200)
        shot("bayar-qris", page.locator("[data-co-qr] rect").count() > 10)
        page.locator("[data-co-paid-main]").click(); page.wait_for_timeout(800)
        page.locator("#topup [data-step-panel=success] [data-co-close]").click(); page.wait_for_timeout(200)
        shot("saldo-cukup", "Rp55.000 → Rp35.000" in text("[data-wz-balance]"))
        page.locator("[data-wz-next]").click()
        page.wait_for_function("() => document.getElementById('wz-on')", timeout=10000)
        page.locator("#wz-on").scroll_into_view_if_needed()
        shot("nyala", "ayu.my.id" in text("#view"))
        # 5:00 Control: home → project → AI key → balance history
        page.evaluate("() => { location.hash = '#/beranda'; }"); page.wait_for_timeout(200)
        shot("beranda", "Rp35.000" in text("#view") and "Cukup sampai" in text("#view"))
        page.evaluate("() => { location.hash = '#/proyek/portofolio-ayu?tab=ai'; }"); page.wait_for_timeout(200)
        shot("proyek-api-key", "tn-demo-" in text("#panel-ai"))
        page.evaluate("() => { location.hash = '#/saldo'; }"); page.wait_for_timeout(200)
        shot("riwayat", page.locator("#view ol > li").count() == 3)
        # 5:40 Chat AI: attach a photo → a text-only model says so → switch to the cheapest one that reads images → cost shown
        page.goto(base + "app.html?demo=raka#/chat", wait_until="networkidle")
        page.fill("#try-input", "Apa isi poster ini?")
        page.set_input_files("[data-chat-file]", files=[{"name": "poster.png", "mimeType": "image/png", "buffer": PNG}])
        page.wait_for_timeout(300)
        could_not = page.locator("[data-cant-read]").count() == 1
        page.locator("[data-switch-model]").click(); page.wait_for_timeout(150)
        page.locator("[data-try-form] [type=submit]").click(); page.wait_for_timeout(900)
        shot("chat-lampiran", could_not and "Gemini Flash membaca 1 lampiran" in text("#view [role=log]"))
        # 6:30 Team account: Dimas — apps (admin access), budget server (SSH + own ports), AI usage
        page.goto(base + "app.html?demo=dimas#/beranda", wait_until="networkidle")
        shot("dimas-beranda", "Rp647.800" in text("#view") and "±22 Jan" in text("#view"))
        page.evaluate("() => { location.hash = '#/aplikasi/s2'; }"); page.wait_for_timeout(250)
        page.locator("[data-reveal]").click(); page.wait_for_timeout(150)
        shot("aplikasi-akses", "n8n-otomasi-tim.tokennyala.app" in text("#view") and "•" not in text("[data-pass]"))
        page.evaluate("() => { location.hash = '#/layanan/nat?tambah=1'; }"); page.wait_for_timeout(250)
        page.locator('[role=radio][data-size="sedang"]').click()
        page.locator("[data-sf-go]").click(); page.wait_for_timeout(250)
        page.fill("#np-inner", "5678"); page.locator("[data-port-form] [type=submit]").click(); page.wait_for_timeout(200)
        shot("server-hemat-port", "ssh ubuntu@nat-jkt.tokennyala.example" in text("#view") and page.locator("[data-port-remove]").count() == 1)
        page.evaluate("() => { location.hash = '#/ai?tab=pemakaian'; }"); page.wait_for_timeout(200)
        shot("dimas-pemakaian-ai", page.locator("[data-bar]").count() == 7)
        # 6:30 Quality: EN + Nala
        page.locator("[data-open-more]").click(); page.locator('#more [data-lang="en"]').click(); page.keyboard.press("Escape"); page.wait_for_timeout(150)
        shot("english", text("#view h1") == "AI API")  # the AI page is "API AI" / "AI API" since 22 Nov 2026
        page.locator("#chat-launcher").click(); page.wait_for_timeout(300)
        page.locator("#chat [data-chat-chips] button").nth(3).click()  # "A cheap server?"
        page.wait_for_function("() => !TN.nala.state.typing", timeout=4000); page.wait_for_timeout(150)
        shot("nala", page.evaluate("() => document.getElementById('chat').open") and page.locator("#chat [data-chat-log] a[href='#/layanan/nat']").count() == 1)
        page.keyboard.press("Escape")
        page.evaluate("() => localStorage.setItem('tn-lang', 'id')")
        # Backup: balance runs out → paused, not deleted
        page.goto(base + "app.html?demo=ayu&state=jeda#/beranda", wait_until="networkidle")
        shot("cadangan-dijeda", "27 Des" in text("#view"))
        browser.close()
    if httpd:
        httpd.shutdown()
    if errors:
        failures.append(f"page errors: {errors}")
        print(f"[FAIL] page errors: {errors}")
    print(f"screenshots: {out}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
