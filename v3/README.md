# TokenNyala — v3 (mobile first, Tailwind v4)

Versi aktif. Aturan membangun: `../docs/v3-ground-rules.md`. Spesifikasi: `../docs/technical-spec.md`.

## Struktur

```text
v3/
├── index.html   # markup + utility Tailwind + token @theme
├── styles.css   # hanya ilustrasi/animasi (< 100 baris)
├── script.js    # copy ID/EN, interaksi
└── assets/
```

## Menjalankan

```bash
cd v3
python3 -m http.server 4175
# buka http://127.0.0.1:4175/
```

## QA responsif (wajib setelah setiap section)

```bash
python3 tools/qa_v3.py --interactive --out /tmp/qa-v3
```

Mengecek 320, 375, 768, 1024, 1440, dan 667×375 landscape: overflow horizontal, touch target ≥ 44px, console error, menu mobile, dan language switch. Screenshot disimpan di folder `--out`.

## Progres build

- [x] 1. Shell — head, token, header + menu mobile, language switch, footer
- [x] 2. Hero — copy ID/EN, board ilustrasi, status saldo menyala lewat `TokenNyala.selectPackage(id)`
- [ ] 3. Cara kerja
- [ ] 4. Package picker
- [ ] 5. Checkout
- [ ] 6. Model AI + katalog
- [ ] 7. Pakai di tool
- [ ] 8. Benefit + dashboard + contoh
- [ ] 9. Tim & bisnis + konsultasi
- [ ] 10. FAQ + final CTA
- [ ] 11. Live chat Nala
- [ ] 12. ID/EN lengkap
- [ ] 13. QA penuh
