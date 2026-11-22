# TokenNyala

*Idemu nyala, dari prompt sampai online.* Prototype platform **AI Cloud Services** untuk vibecoder pemula di Indonesia:
AI untuk membangun, cloud untuk menjalankan, satu saldo Rupiah. Semua harga, layanan, dan transaksi adalah **contoh/simulasi**.

**Lihat langsung:** https://hannifkurniawan.github.io/token-nyala/ — landing · [`harga.html`](https://hannifkurniawan.github.io/token-nyala/harga.html) · console [`app.html?demo=ayu`](https://hannifkurniawan.github.io/token-nyala/app.html?demo=ayu)

## Isi repo
| Folder | Isi |
|---|---|
| [`site/`](site/) | **Versi terbaru** (v4): landing, harga, console mock. Folder inilah yang tayang di GitHub Pages. Cara membuka & mengembangkan: [`site/README.md`](site/README.md) |
| [`docs/`](docs/) | Dokumen versi terbaru — mulai dari [`docs/README.md`](docs/README.md). Semua angka: [`docs/services-and-pricing.md`](docs/services-and-pricing.md) |
| [`tools/`](tools/) | QA (`qa.py`), audit (`audit.py`), cek terjemahan (`i18n_check.py`), gladi demo (`demo.py`), build ikon (`build_icons.py`) |
| [`research/`](research/) | Riset referensi & kompetitor |
| [`brand/`](brand/) | Logo sumber (SVG) + halaman preview |
| [`archive/`](archive/) | Versi lama, tidak diubah lagi: `v1/`, `v2-tailwind-cdn/`, `v3/` (top-up token), `showcase/` (v1, v2 — acuan visual) |
| `docs/archive/` · `tools/archive/` | Dokumen dan tool versi lama |
| `PROJECT-MEMORY.md` | Catatan lintas sesi: status, keputusan, pelajaran |

## Menjalankan secara lokal
```bash
cd site && python3 -m http.server 8000     # → http://localhost:8000  (atau buka site/index.html langsung)
```
Mengubah tampilan console: `cd site && npm install && npm run build` (Tailwind CLI, hasil build ikut di-commit).

## Publikasi
Setiap push ke `main` yang mengubah `site/` menjalankan [`.github/workflows/pages.yml`](.github/workflows/pages.yml):
isi `site/` (tanpa `src/` dan `package*.json`) dipublikasikan ke GitHub Pages.
