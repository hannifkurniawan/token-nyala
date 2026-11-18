#!/usr/bin/env python3
"""ID/EN completeness audit for v3 (step 12).

Usage: python3 tools/i18n_check.py

1. Every data-i18n / data-i18n-aria / data-i18n-placeholder key exists in copy.id AND copy.en,
   and both dictionaries have the same keys.
2. Loads the page in ID and in EN and compares every text node, aria-label, placeholder, alt and title
   (including closed dialogs and the template). Anything identical in both languages that is not on the
   allowlist is reported as "probably untranslated".
Exit code 1 if anything is found.
"""
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


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def main():
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
