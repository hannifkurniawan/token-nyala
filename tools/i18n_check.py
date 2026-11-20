#!/usr/bin/env python3
"""ID/EN completeness audit for v3 (step 12).

Usage: python3 tools/i18n_check.py            # v3 (unchanged)
       python3 tools/i18n_check.py --root v4  # v4: every page in V4_PAGES + the TN.i18n dictionary

1. Every data-i18n / data-i18n-aria / data-i18n-placeholder key exists in copy.id AND copy.en,
   and both dictionaries have the same keys.
2. Loads the page in ID and in EN and compares every text node, aria-label, placeholder, alt and title
   (including closed dialogs and the template). Anything identical in both languages that is not on the
   allowlist is reported as "probably untranslated".
v4 mode: every dictionary entry is a non-empty [ID, EN] pair; every key used in HTML (data-i18n*) or JS
(t('key') literals, template-literal patterns such as `svc.${id}.name`) exists; no dead keys; ID/EN text diff.
Exit code 1 if anything is found.
"""
import argparse
import functools
import http.server
import pathlib
import re
import sys
import threading

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent / "v3"

# Same in both languages on purpose: brand/product/model names, payment brands, units, universal terms.
ALLOW = {
    "TokenNyala", "Nyala", "Token", "Nala", "Sari", "S", "ID", "EN", "FAQ", "QRIS", "E-Wallet", "Virtual Account",
    "DANA", "GoPay", "OVO", "Cursor", "Cline", "Continue", "Base URL", "API key", "Prototype", "Coding", "Premium",
    "Mulai", "Bangun", "Scale", "MULAI", "BANGUN", "SCALE", "Input", "Output", "Anthropic", "OpenAI", "Google",
    "DeepSeek", "Alibaba", "Event Landing Page", "© 2026 TokenNyala", "Rp0", "Bonus", "Nala:", "Sari:",
    "DANA, GoPay, OVO", "tn-demo-…3f9a",
    # model names (data in script.js)
    "Claude Sonnet", "Claude Opus", "Claude Haiku", "GPT", "GPT Mini", "GPT Pro", "Gemini Pro", "Gemini Flash",
    "DeepSeek Chat", "DeepSeek Reasoner", "Qwen Plus", "Qwen Max",
}
# "Provider · Use" lines where every part is a universal term (e.g. "Anthropic · Coding")
UNIVERSAL_META = re.compile(r"^(Anthropic|OpenAI|Google|DeepSeek|Alibaba)( · Coding)*$")
TRIVIAL = re.compile(r"^[\s\d.,:;·•\-–—+/=<>≈%()#'\"!?✓✦★›→↓…|]*(Rp[\d.,]*|rb|K|jt|M)?[\s\d.,:;·•\-–—+/=<>≈%()✓✦★›→↓…]*$")

COLLECT_JS = r"""
() => {
  const out = {};
  const path = (el) => {
    const parts = [];
    for (let n = el; n && n.nodeType === 1 && n !== document.documentElement; n = n.parentElement) {
      const i = n.parentElement ? [...n.parentElement.children].indexOf(n) : 0;
      parts.unshift(n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + ':' + i);
    }
    return parts.join('>');
  };
  const roots = [document.body, ...[...document.querySelectorAll('template')].map(t => t.content)];
  for (const root of roots) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const p = n.parentElement;
      if (!p || ['SCRIPT', 'STYLE'].includes(p.tagName) || p.closest('code')) continue;
      const v = n.textContent.replace(/\s+/g, ' ').trim();
      if (v) out['text ' + path(p) + ' #' + [...p.childNodes].indexOf(n)] = v;
    }
    for (const el of root.querySelectorAll('[aria-label], [placeholder], [alt], [title]')) {
      for (const a of ['aria-label', 'placeholder', 'alt', 'title']) {
        const v = el.getAttribute(a);
        if (v && v.trim()) out[a + ' ' + path(el)] = v.trim();
      }
    }
  }
  return out;
}
"""

KEYS_JS = r"""
() => {
  const used = new Set();
  for (const el of document.querySelectorAll('[data-i18n],[data-i18n-aria],[data-i18n-placeholder]')) {
    for (const k of [el.dataset.i18n, el.dataset.i18nAria, el.dataset.i18nPlaceholder]) if (k) used.add(k);
  }
  for (const t of document.querySelectorAll('template')) for (const el of t.content.querySelectorAll('[data-m-k]')) used.add(el.dataset.mK);
  return [...used];
}
"""


def serve(root=None):
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(root or ROOT)))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


V4_ROOT = ROOT.parent / "v4"
V4_PAGES = ["index.html", "harga.html", "app.html?demo=reset#/masuk", "app.html?demo=ayu#/beranda",
            "app.html?demo=ayu&state=jeda#/beranda", "app.html?demo=raka#/saldo", "app.html?demo=ayu#/buat",
            "app.html?demo=ayu#/buat?resep=web-klien", "app.html?demo=raka#/proyek/klien-kopi?tab=layanan",
            "app.html?demo=raka#/proyek/klien-kopi?tab=ai", "app.html?demo=raka#/proyek/klien-kopi?tab=log",
            "app.html?demo=raka#/proyek/klien-kopi?tab=pengaturan"]
V4_ALLOW = {
    "TokenNyala", "ID", "EN", "FAQ", "Prompt", "Online", "Landing page", "VPS", "Domain", "Email API & SMTP",
    "Chat playground", "localhost:5173", "eventku.my.id", "© 2026 TokenNyala", "01", "02", "03", "04", "05",
    # AI catalogue: model/provider names, rate labels, tools, template engines (same in both languages)
    "Input", "Output", "Premium", "Coding", "Total", "Nala", "Sari", "Base URL", "API key",
    "Anthropic", "OpenAI", "Google", "DeepSeek", "Alibaba", "Anthropic · Coding",
    "Claude Sonnet", "Claude Opus", "Claude Haiku", "GPT", "GPT Mini", "GPT Pro", "Gemini Pro", "Gemini Flash",
    "DeepSeek Chat", "DeepSeek Reasoner", "Qwen Plus", "Qwen Max",
    "Cursor", "Lovable", "Cline", "Continue", "n8n", "OpenClaw", "Dify", "WordPress",
    "model.", "online",  # loanwords that end a heading in both languages
    "Data", "Email", "Log", "QRIS", "E-wallet", "Virtual account", "DANA", "GoPay", "OVO", "DANA, GoPay, OVO",  # console
    "ayu.my.id",
    "AI", "vCPU", "RAM", "1 GB", "5 GB", "20 GB", "10 GB", "100 GB", "1 TB", "2 TB", "4 TB", "512 MB", "2 GB", "4 GB", "8 GB",
    "40 GB", "80 GB", "160 GB", "0,5", ".my.id", ".biz.id", ".web.id", ".id", ".com", ".co.id", "Template", "Bonus", "Model",
}
# user data in the console: project names (klien-kopi), avatar initials (A)
V4_NAMES = re.compile(r"^([a-z0-9]+(-[a-z0-9]+)+|[A-Z]|[a-z0-9-]+(\.[a-z]{2,})+)$")  # + domain names (kopikita.com)
V4_KEYS_JS = r"""
() => {
  const used = new Set();
  for (const el of document.querySelectorAll('[data-i18n],[data-i18n-html],[data-i18n-aria],[data-i18n-placeholder]'))
    for (const k of [el.dataset.i18n, el.dataset.i18nHtml, el.dataset.i18nAria, el.dataset.i18nPlaceholder]) if (k) used.add(k);
  const dict = TN.i18n.dict;
  const bad = Object.entries(dict).filter(([k, v]) => !Array.isArray(v) || v.length !== 2 || !v[0].trim() || !v[1].trim()).map(([k]) => k);
  return { used: [...used], keys: Object.keys(dict), bad };
}
"""


def main_v4():
    httpd = serve(V4_ROOT)
    base = f"http://127.0.0.1:{httpd.server_address[1]}/"
    problems, keys, used_html = [], set(), set()
    compared = 0
    with sync_playwright() as p:
        b = p.chromium.launch()
        for page_name in V4_PAGES:
            snaps = {}
            for lang in ("id", "en"):
                page = b.new_page(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")  # no word splitting
                page.add_init_script(f"localStorage.setItem('tn-lang', '{lang}')")
                page.goto(base + page_name, wait_until="networkidle")
                snaps[lang] = page.evaluate(COLLECT_JS)
                if lang == "id":
                    k = page.evaluate(V4_KEYS_JS)
                    keys |= set(k["keys"])
                    used_html |= set(k["used"])
                    problems += [f"{page_name}: dictionary entry is not a non-empty [ID, EN] pair: {x}" for x in k["bad"]]
                page.close()
            for k, v in snaps["id"].items():
                compared += 1
                if snaps["en"].get(k) == v and v not in V4_ALLOW and not TRIVIAL.match(v) and not V4_NAMES.match(v):
                    problems.append(f"{page_name}: same in ID and EN: {k.split(' ')[0]:<11} {v[:70]!r}   ({k.split(' ', 1)[1][-60:]})")
        b.close()
    httpd.shutdown()

    js = "\n".join(f.read_text() for f in sorted((V4_ROOT / "assets" / "js").glob("*.js")) if f.name not in ("i18n.js", "icons.js"))
    html = "\n".join((V4_ROOT / f).read_text() for f in dict.fromkeys(pg.split("?")[0].split("#")[0] for pg in V4_PAGES))
    literal = set(re.findall(r"""['"]([a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9-]+)+)['"]""", js))
    # key templates such as `svc.${id}.name` (only key characters + interpolations; nesting-safe)
    patterns = []
    for tpl in re.findall(r"`((?:[A-Za-z0-9.\-]|\$\{[^}`]+\})+)`", js):
        if "${" not in tpl:
            continue
        parts = _interleave(tpl)
        patterns.append(re.compile("".join(re.escape(x) if i % 2 == 0 else r"[\w.-]+" for i, x in enumerate(parts)) + "$"))
    for k in sorted(used_html - keys):
        problems.append(f"key used in HTML but missing in dictionary: {k}")
    for k in sorted(k for k in literal if "." in k and k.split(".")[0] in {x.split(".")[0] for x in keys} and k not in keys
                    and not k.endswith((".html", ".js", ".css", ".svg", ".png")) and k not in ("co.id", "my.id", "biz.id", "web.id")):
        problems.append(f"key used in JS but missing in dictionary: {k}")
    dead = sorted(k for k in keys if k not in used_html and k not in literal and not any(p.match(k) for p in patterns))
    problems += [f"dead key (defined, never used): {k}" for k in dead]

    print(f"v4 keys: {len(keys)} (all [ID, EN]); used in HTML: {len(used_html)}; JS literals: {len(literal)}, patterns: {len(patterns)}; strings compared: {compared}")
    print("\n".join(problems) if problems else "ok — no missing keys, no dead keys, no untranslated strings")
    sys.exit(1 if problems else 0)


def _interleave(tpl):
    """`svc.${id}.name` → ['svc.', '<var>', '.name'] (even = literal, odd = variable)."""
    out, pos = [], 0
    for m in re.finditer(r"\$\{[^}]+\}", tpl):
        out += [tpl[pos:m.start()], m.group(0)]
        pos = m.end()
    out.append(tpl[pos:])
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", choices=["v3", "v4"], default="v3")
    if ap.parse_args().root == "v4":
        return main_v4()
    httpd = serve()
    url = f"http://127.0.0.1:{httpd.server_address[1]}/index.html"
    problems = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        snaps = {}
        for lang in ("id", "en"):
            page = b.new_page(viewport={"width": 1440, "height": 900})
            page.add_init_script(f"localStorage.setItem('tn-lang', '{lang}')")
            page.goto(url, wait_until="networkidle")
            page.evaluate("() => TokenNyala.openChat()")  # populate the chat log + chips
            page.wait_for_timeout(200)
            snaps[lang] = page.evaluate(COLLECT_JS)
            if lang == "id":
                used = page.evaluate(KEYS_JS)
                dicts = page.evaluate("() => null")  # dictionaries are private; read them from the source instead
            page.close()
        b.close()
    httpd.shutdown()

    src = (ROOT / "script.js").read_text()
    m = re.search(r"const copy = \{\s*id: \{(.*?)\n    \},\s*en: \{(.*?)\n    \}\n  \};", src, re.S)
    key_re = re.compile(r"^\s{6}([A-Za-z_0-9]+):", re.M)
    id_keys, en_keys = set(key_re.findall(m.group(1))), set(key_re.findall(m.group(2)))
    for k in sorted(id_keys - en_keys):
        problems.append(f"key only in ID: {k}")
    for k in sorted(en_keys - id_keys):
        problems.append(f"key only in EN: {k}")
    for k in sorted(set(used) - id_keys):
        problems.append(f"key used in HTML but missing in copy: {k}")

    # Dead keys: defined but never referenced (HTML attributes, t('key'), dynamic `prefix_${id}` patterns)
    html = (ROOT / "index.html").read_text()
    body = src[m.end():]
    dynamic_prefixes = set(re.findall(r"`([A-Za-z]+_)\$\{", body)) | set(re.findall(r"`([A-Za-z]+)\$\{", body))
    dead = sorted(k for k in id_keys
                  if f'"{k}"' not in html and f"'{k}'" not in body and f'"{k}"' not in body
                  and not any(k.startswith(p) for p in dynamic_prefixes))
    for k in dead:
        problems.append(f"dead key (defined, never used): {k}")

    same = []
    for k, v in snaps["id"].items():
        if snaps["en"].get(k) == v and v not in ALLOW and not TRIVIAL.match(v) and not UNIVERSAL_META.match(v):
            same.append(f"{k.split(' ')[0]:<11} {v[:70]!r}   ({k.split(' ', 1)[1][-70:]})")
    problems += [f"same in ID and EN: {s}" for s in same]

    print(f"keys: {len(id_keys)} ID / {len(en_keys)} EN, {len(used)} used in HTML; strings compared: {len(snaps['id'])}")
    print("\n".join(problems) if problems else "ok — no missing keys, no untranslated strings")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
