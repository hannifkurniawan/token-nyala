# TokenNyala v4 — platform AI cloud (prototype)

Tayang di **https://hannifkurniawan.github.io/token-nyala/** (GitHub Pages, otomatis dari `main`).

*Idemu nyala, dari prompt sampai online.* AI untuk membangun, cloud untuk menjalankan, satu saldo Rupiah —
untuk vibecoder pemula (ID/EN, mobile first). Semua harga, layanan, dan transaksi adalah **contoh/simulasi**.

Dokumen: [`docs/README.md`](../docs/README.md) · aturan membangun: [`docs/technical-spec.md`](../docs/technical-spec.md) ·
semua angka: [`docs/services-and-pricing.md`](../docs/services-and-pricing.md) · pegangan demo: [`docs/demo.md`](../docs/demo.md).

## Membuka
- Langsung: buka `index.html` di browser — `file://` didukung (CSS hasil build ikut di-commit, script klasik tanpa module).
- Server lokal: `python3 -m http.server 8000` di folder ini → http://localhost:8000

| Halaman | Isi |
|---|---|
| `index.html` | Landing 12 section dibangun dengan cara showcase v2 (loader, kursor, copy `data-l`): hero, cerita macet (scroll), cara kerja (kartu geser), **Mau bikin apa?** (5 paket), semua layanan + template, model AI + katalog, pakai di tool, aman + satu saldo, contoh, tim + konsultasi, FAQ + belajar, CTA saklar raksasa · chat Nala |
| `harga.html` | Bergaya showcase v2 (tanpa loader): kepala · nav chip lengket · **kalkulator** (tab paket seperti landing, state di `?paket=&s=`, ringkasan lengket) · semua layanan (baris indeks, tabel dibuka per layanan) · AI (12 model + 3 satuan) · saldo & tagihan · FAQ harga |
| `app.html` | Console mock: masuk, beranda, **wizard Buat** (4 langkah), proyek (ganti ukuran, hentikan, log…), **Chat AI**, API AI (mulai cepat, model, pemakaian, API key), **Aplikasi** (daftar + katalog + kelola: akses admin, sambungan WhatsApp/Telegram, pemakaian, log, ukuran), Server (IP sendiri / **hemat NAT** dengan SSH + port), saldo + isi saldo, layanan lain, belajar, bantuan, jam simulasi |

### Akun contoh (console)
| Link | Isi |
|---|---|
| `app.html?demo=reset` | Akun baru — mulai dari masuk |
| `app.html?demo=ayu` | Ayu: 1 proyek (`ayu.my.id`), saldo Rp31.220, cukup sampai ±19 Des |
| `app.html?demo=raka` | Raka: 2 klien, saldo Rp239.640, ±31 Des |
| `app.html?demo=dimas` | Dimas: otomasi tim + server, saldo Rp647.800, ±22 Jan |
| `app.html?demo=ayu&state=jeda` | Saldo habis: proyek **dijeda**, data aman sampai 27 Des |

Menu Akun (avatar / Lainnya): bahasa, **Simulasi: majukan 30 hari**, mulai ulang demo, keluar. Masuk: kode 6 digit apa pun diterima; email/HP tidak disimpan.

## Mengembangkan
```bash
cd site && npm install          # sekali: @tailwindcss/cli 4.3.3 (di-pin)
npm run watch                 # saat mengubah HTML/JS/CSS
npm run build                 # WAJIB sebelum commit → assets/css/app.css
```
Dari root repo (semua harus lolos; `-P` karena Playwright ada di user site-packages):
```bash
python3 -P tools/qa.py --interactive --out /tmp/qa   # 12 halaman/rute × 6 viewport + alur + motion; lihat screenshot
python3 -P tools/i18n_check.py                               # kunci [ID, EN] lengkap, tanpa kunci mati / teks belum diterjemahkan
python3 -P tools/audit.py                               # axe, font, file://, reduced motion, storage, CSS terbaru, angka, label simulasi
python3 -P tools/demo.py --out /tmp/demo             # gladi skrip demo 24 langkah (screenshot bernomor; --url <situs> untuk versi tayang)
```

## Struktur
| File | Isi |
|---|---|
| `src/tailwind.css` | Token (`@theme`) + komponen console (Tailwind) |
| `assets/css/site.css` · `landing.css` · `harga.css` | Landing + Harga, CSS tulisan tangan port `archive/showcase/v2/styles.css` (dasar bersama: header, menu, footer, dialog, chat, tab paket, FAQ · section landing · section harga) — tanpa build |
| `assets/js/data.js` | **Semua angka** + fungsi hitung murni: paket, `recipeTotals`, `suggestTopup`, `coverMonths`, `refund`, `prorata`, `balanceUntil`, URL `s` (`parseS`/`itemsFromUrl`/`serialize`), ukuran minimum template, model AI |
| `assets/js/i18n.js` | Kamus `'kunci': [ID, EN]` + `t()`, `rp()`, `rpK()`, `date()` |
| `assets/js/icons.js` | Sprite Lucide (hasil `tools/build_icons.py`, jangan diedit) |
| `assets/js/ui.js` | Header + menu, bahasa, label aria `data-aria-id/en`, kursor custom + tombol magnetis, `setupModal()`, `parseContact()`, salin, `itemView()`, `fromLine()`, pemilih ukuran bersama |
| `assets/js/landing.js` · `pricing.js` | Landing ala `archive/showcase/v2/script.js`: render data, interaksi, loader → motion GSAP/Lenis · Harga: kalkulator, indeks layanan, AI, saldo, FAQ |
| `assets/js/store.js` | State console `tn-v4-demo` (tanpa data kontak), preset, `charge()`/`topup()` → riwayat, tagihan (perpanjang/jeda/berhenti, prorata, refund), `advance()` |
| `assets/js/console.js` | Router hash (fokus `h1`, judul, pengumuman, guard masuk), kerangka, masuk, beranda, saldo, isi saldo |
| `assets/js/projects.js` · `ai.js` · `chat.js` · `apps.js` · `services.js` · `learn.js` | Wizard + proyek · API AI · Chat AI · Aplikasi · layanan lain (termasuk server hemat + port) · belajar + bantuan |
| `assets/js/nala.js` | Chat Nala (lokal, tanpa server): bantu pilih paket, cara pakai, model, bayar, tim online/offline |
| `assets/js/motion.js` | Motion Harga: GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.13 dengan pola landing (judul naik per kata, baris/kartu muncul); kepala halaman masuk lewat CSS (`html.motion-pre`), tanpa loader; mati saat reduced motion |

Script klasik `defer` dengan namespace `window.TN`. Urutan muat: data → i18n → icons → ui → (halaman) → nala → vendor → motion.

## Kredit
Ikon [Lucide](https://lucide.dev) v0.460.0 (ISC) — `assets/icons/SOURCE.md`. Logo model: Lobe Icons (MIT) — `assets/img/models/SOURCE.md`.
GSAP 3.12.5 + Lenis 1.1.13 — `assets/vendor/SOURCE.md`. Font Manrope + IBM Plex Mono (Google Fonts).
