# TokenNyala v4 — platform AI cloud (prototype)

*Idemu nyala, dari prompt sampai online.* Landing + Harga + console mock, mobile first, ID/EN.
Dokumen: [`docs/v4/README.md`](../docs/v4/README.md) · aturan membangun: [`docs/v4/technical-spec.md`](../docs/v4/technical-spec.md) · semua angka: [`docs/v4/services-and-pricing.md`](../docs/v4/services-and-pricing.md).

## Membuka
- Langsung: buka `index.html` di browser (`file://` didukung — CSS hasil build ikut di-commit).
- Server lokal: `python3 -m http.server 8000` di folder ini → http://localhost:8000

## Status (fase 2 dari 7)
| Halaman | Isi | Status |
|---|---|---|
| `index.html` | Header + menu + bahasa, hero, cerita macet, **Mau bikin apa?** (5 resep), cara kerja, semua layanan, satu saldo, footer | Fase 1 ✓ |
| `index.html` | Template (5), AI (model + panduan pasang + katalog), contoh proyek, aman untuk pemula (kartu bertumpuk), belajar, tim (+ form konsultasi), FAQ (13), CTA akhir, motion GSAP/Lenis, chat Nala (alur “Bantu pilih resep”) | Fase 2 ✓ |
| `harga.html` | Kalkulator + detail harga | Fase 3 — link dari landing belum ada tujuannya |
| `app.html` | Console mock (masuk, wizard, proyek, saldo, …) | Fase 4–6 — link “Mulai bangun”/“Masuk” belum ada tujuannya |

## Mengembangkan
```bash
cd v4 && npm install          # sekali: @tailwindcss/cli 4.3.3 (di-pin)
npm run watch                 # saat mengubah HTML/JS/CSS
npm run build                 # WAJIB sebelum commit → assets/css/app.css
```
Lalu dari root repo (semua harus lolos):
```bash
python3 -P tools/qa_v4.py --interactive --out /tmp/qa-v4   # 6 viewport + alur; lihat screenshot-nya
python3 -P tools/i18n_check.py --root v4                   # kunci ID/EN lengkap, tanpa kunci mati
python3 -P tools/audit_v4.py                               # axe, font, file://, reduced motion, storage, CSS terbaru, angka
```
(`-P` karena Playwright terpasang di user site-packages.)

## Struktur
| File | Isi |
|---|---|
| `src/tailwind.css` | Satu-satunya tempat token (`@theme`) + komponen (`.shell`, `.sheet`, `.btn`, `.display`, `.kicker`, `.switch`, `.card`) |
| `assets/js/data.js` | **Semua angka** + fungsi hitung murni (`recipeTotals`, `suggestTopup`, `coverMonths`, `refund`, `prorata`, `balanceUntil`, `heroScenario`) |
| `assets/js/i18n.js` | Kamus `[ID, EN]` + `t()`, format `rp()` / `rpK()`; atribut `data-i18n`, `data-i18n-html`, `data-i18n-aria` |
| `assets/js/icons.js` | Sprite Lucide (hasil `tools/build_icons_v4.py`, jangan diedit) |
| `assets/js/ui.js` | Header, menu mobile, tombol bahasa, `setupModal()` (dialog v3), `parseContact()`, tombol salin, helper `icon()` / `esc()` |
| `assets/js/landing.js` | Render semua section landing dari `data.js` + dialog katalog model & konsultasi tim |
| `assets/js/nala.js` | Chat Nala (port v3, lokal tanpa server) + alur resep → link wizard/kalkulator dengan parameter `s` |
| `assets/js/motion.js` | GSAP + ScrollTrigger + Lenis (`assets/vendor/`); mati saat reduced motion atau GSAP gagal dimuat — konten tetap tampil |

Script klasik `defer` dengan namespace `window.TN` (ES module diblokir di `file://`). Urutan muat: data → i18n → icons → ui → landing → nala → vendor (GSAP, ScrollTrigger, Lenis) → motion.

## Kredit
Ikon [Lucide](https://lucide.dev) v0.460.0 (ISC) — `assets/icons/SOURCE.md`. Logo model: Lobe Icons (MIT) — `assets/img/models/SOURCE.md`. GSAP 3.12.5 + Lenis 1.1.13 — `assets/vendor/SOURCE.md`. Font Manrope + IBM Plex Mono (Google Fonts). Semua harga, layanan, dan transaksi adalah contoh.
