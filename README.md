# TokenNyala

*Idemu nyala, dari prompt sampai online.*

Prototype interaktif **platform AI Cloud Services** untuk vibecoder pemula di Indonesia: AI untuk membangun, cloud untuk
menjalankan, **satu saldo Rupiah** untuk semuanya. Pengguna mulai dari tujuan (“mau bikin apa?”), langsung melihat
layanan yang dibutuhkan dan biayanya per bulan, lalu menyalakan proyeknya di console.

> Semua harga, layanan, dan transaksi adalah **contoh/simulasi**. Tidak ada pembayaran, server, atau data nyata.

**Situs:** https://hannifkurniawan.github.io/token-nyala/ (GitHub Pages, otomatis dari `main`)

## Isi versi terbaru (`site/`)

| Halaman | Isi |
|---|---|
| **Landing** — [`index.html`](site/index.html) | Hero, cerita “macet di localhost”, cara kerja, **Mau bikin apa?** (5 paket dengan total per bulan), 11 layanan + 5 paket aplikasi, 12 model AI + katalog, pakai saldo di tool coding, aman untuk pemula + satu saldo, contoh proyek, untuk tim, FAQ + panduan |
| **Harga** — [`harga.html`](site/harga.html) | Kalkulator paket (ubah layanan & ukuran, total langsung; tautan bisa dibagikan `?paket=&s=`), harga tiap layanan, tabel 12 model AI (termasuk file yang bisa dibaca), aturan saldo & tagihan, FAQ harga |
| **Console** — [`app.html`](site/app.html) | Masuk · beranda (saldo “cukup sampai”, langkah berikutnya) · **wizard Buat** · proyek (ganti ukuran, hentikan, log) · **Chat AI** (lampiran gambar/suara/video) · **API AI** (API key, model, pemakaian) · **Aplikasi** (akses admin, sambungan WhatsApp/Telegram) · **Server** (IP sendiri / hemat dengan SSH + port) · data, file, alamat web, email, pembayaran · saldo + isi saldo · belajar & bantuan |

Di semua halaman: bahasa **ID/EN**, mobile first, asisten **Nala**, kontras AA dan target sentuh 44 px, gerak bisa
dimatikan (*reduced motion*). Email/HP, isi chat, dan lampiran **tidak disimpan**.

### Akun contoh di console
| Link | Isi |
|---|---|
| [`app.html?demo=reset`](https://hannifkurniawan.github.io/token-nyala/app.html?demo=reset) | Akun baru — mulai dari masuk (kode 6 digit apa pun diterima) |
| [`app.html?demo=ayu`](https://hannifkurniawan.github.io/token-nyala/app.html?demo=ayu) | Ayu: 1 proyek portofolio |
| [`app.html?demo=raka`](https://hannifkurniawan.github.io/token-nyala/app.html?demo=raka) | Raka: 2 proyek klien, satu saldo |
| [`app.html?demo=dimas`](https://hannifkurniawan.github.io/token-nyala/app.html?demo=dimas) | Dimas: otomasi tim (n8n) + server |
| [`app.html?demo=ayu&state=jeda`](https://hannifkurniawan.github.io/token-nyala/app.html?demo=ayu&state=jeda) | Saldo habis: proyek dijeda, data aman |

Menu Akun di console: ganti bahasa, **Simulasi: majukan 30 hari**, mulai ulang demo.

## Demo
Pegangan presentasi ±9 menit (alur, pesan utama, persiapan, pertanyaan yang mungkin muncul): **[`docs/demo.md`](docs/demo.md)**.

## Menjalankan secara lokal
Tidak perlu build untuk melihat situs:
```bash
cd site && python3 -m http.server 8000     # → http://localhost:8000
```
Atau buka `site/index.html` langsung di browser (`file://` didukung).

## Mengembangkan
| Bagian | Cara | Build |
|---|---|---|
| Landing & Harga | HTML + CSS tulisan tangan (`assets/css/site.css` + `landing.css` / `harga.css`) | Tidak perlu |
| Console | HTML + kelas Tailwind v4 (`src/tailwind.css` → `assets/css/app.css`) | `cd site && npm install` (sekali), lalu `npm run build` — `app.css` ikut di-commit |
| JavaScript | Script klasik tanpa framework dan tanpa bundler (`assets/js/`) | Tidak perlu |

Aturan utama:
- **Semua angka** (harga, ukuran, paket, tarif model) hanya di `site/assets/js/data.js` dan harus sama dengan [`docs/services-and-pricing.md`](docs/services-and-pricing.md).
- **Semua teks dinamis** ID/EN di `site/assets/js/i18n.js`; teks statis landing memakai pasangan `data-l="id|en"`.
- Pustaka (GSAP, ScrollTrigger, Lenis) disimpan lokal di `site/assets/vendor/`; ikon Lucide di `assets/icons/` (dibangun dengan `tools/build_icons.py`).
- Aturan membangun lengkap dan Definition of Done: [`docs/technical-spec.md`](docs/technical-spec.md).

### Pengecekan sebelum commit
Butuh Python 3 + Playwright (`pip install playwright && python3 -m playwright install chromium`); audit mengambil axe-core dari jsDelivr (perlu internet).
```bash
python3 -P tools/qa.py --interactive --out /tmp/qa    # semua halaman × 6 ukuran layar + alur interaktif; periksa screenshot-nya
python3 -P tools/i18n_check.py                        # kamus ID/EN lengkap, tanpa kunci mati / teks belum diterjemahkan
python3 -P tools/audit.py                             # aksesibilitas (axe), font, file://, reduced motion, CSS terbaru, angka = dokumen
python3 -P tools/demo.py --out /tmp/demo              # gladi demo 24 langkah; --url <situs> untuk versi yang tayang
```

## Struktur repo
```
site/        versi terbaru — yang tayang di GitHub Pages
  index.html · harga.html · app.html
  assets/    css · js · img · icons · vendor
  src/       sumber Tailwind (console) · package.json
docs/        dokumen versi terbaru (mulai dari docs/README.md) · docs/archive/ = dokumen versi lama
tools/       qa.py · audit.py · i18n_check.py · demo.py · build_icons.py · tools/archive/ = tool versi lama
research/    riset kompetitor (ai-cloud-reference.md = acuan versi terbaru)
brand/       logo sumber (SVG) + halaman preview
archive/     versi lama, tidak diubah lagi: v1 · v2-tailwind-cdn · v3 (top-up token) · showcase (acuan visual)
```

### Dokumen utama
| Dokumen | Isi |
|---|---|
| [`docs/brief.md`](docs/brief.md) | Masalah, pengguna, janji produk, pembeda |
| [`docs/services-and-pricing.md`](docs/services-and-pricing.md) | Sumber tunggal semua layanan, harga contoh, paket, aturan saldo & tagihan |
| [`docs/information-architecture.md`](docs/information-architecture.md) | Peta halaman & navigasi |
| [`docs/user-journeys.md`](docs/user-journeys.md) | Skenario per persona |
| [`docs/demo.md`](docs/demo.md) | Pegangan demo |
| [`docs/technical-spec.md`](docs/technical-spec.md) | Aturan membangun, QA, Definition of Done |

Catatan kerja lintas sesi ada di `PROJECT-MEMORY.md` (status, keputusan, pelajaran).

## Publikasi
Setiap push ke `main` yang mengubah `site/` menjalankan [`.github/workflows/pages.yml`](.github/workflows/pages.yml):
hanya `index.html`, `harga.html`, `app.html`, dan `assets/` yang dipublikasikan ke GitHub Pages — dokumen, tool, dan arsip tidak.
