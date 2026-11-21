# Technical Spec & Aturan Membangun v4

Dokumen ini menggantikan `docs/v3-ground-rules.md` + `docs/technical-spec.md` **untuk v4**. Aturan v3 yang tidak disebut di sini tetap berlaku (dikutip dengan nomor aturannya).

## 1. Struktur Folder

```text
v4/
├── index.html          # landing
├── harga.html          # harga + kalkulator
├── app.html            # console mock (hash router)
├── package.json        # hanya @tailwindcss/cli (versi di-pin), script build/watch
├── src/
│   └── tailwind.css    # @import "tailwindcss" · @theme (SATU-SATUNYA tempat token) · @layer components · @source
├── assets/
│   ├── css/app.css     # hasil compile — DI-COMMIT agar file:// jalan tanpa build
│   ├── js/
│   │   ├── data.js     # layanan, ukuran, harga, resep, model, satuan + fungsi hitung murni
│   │   ├── i18n.js     # kamus ID/EN + apply/format
│   │   ├── store.js    # state demo console (localStorage) + preset ?demo=
│   │   ├── ui.js       # header/menu, bahasa, setupModal, salin, toast, format Rp, ikon
│   │   ├── nala.js     # live chat (v3 + alur resep)
│   │   ├── landing.js · pricing.js · console.js
│   │   └── motion.js   # GSAP/Lenis, landing & harga saja
│   ├── vendor/         # gsap 3.12.5, ScrollTrigger, lenis 1.1.13 (dari showcase), lisensi
│   ├── icons/          # sprite Lucide + SOURCE.md
│   └── img/            # mark, logo model (dari v3/assets/models + SOURCE.md)
└── README.md
```

`node_modules/` di-gitignore. v1, v2, v3, dan `showcase/` adalah arsip — tidak diedit.

## 2. Build CSS (keputusan 20 Nov 2026)

- **Tailwind CLI v4**, versi di-pin persis sama dengan v3 (`@tailwindcss/cli@4.3.3`; jika paket CLI versi itu tidak ada, pakai versi 4.3.x tertua yang ada dan catat).
- Alasan: v4 punya 3 halaman; dengan browser build, `@theme` harus disalin ke setiap halaman. CLI = satu sumber token, CSS terpangkas, dan menutup open item v3 “Tailwind CLI untuk produksi”.
- `npm run build` → `assets/css/app.css` (minified). `npm run watch` saat mengembangkan.
- **Wajib build sebelum commit**; `tools/audit_v4.py` membangun ulang ke file sementara dan gagal jika berbeda dari `app.css` yang di-commit.
- Browser build `@tailwindcss/browser` tidak dipakai di v4.

### Token (`src/tailwind.css`)
```css
@theme {
  --color-xl-blue: #002DBB;  --color-xl-dark: #00166A;  --color-xl-yellow: #FFC93C;
  --color-xl-teal: #00D2A0;  --color-teal-ink: #007A5E; --color-xl-sky: #5CD0F9;
  --color-paper: #F7F8FC;    --color-ink: #17181A;      --color-muted: #626B82;
  --color-line: #D9DEEA;     --color-lead-ink: #2A3557; --color-off: #C7CDDC;
  --color-stopped: #B4BCCF;
  --font-sans: "Manrope", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --radius-card: 20px; --radius-control: 12px;
  --ease-out-soft: cubic-bezier(.22,1,.36,1);
}
```
Font: Google Fonts, **4 face** — `Manrope:wght@500;700;800` + `IBM+Plex+Mono:wght@500` (aturan 20 Nov).

## 3. JavaScript

- **Script klasik (`<script defer>`), bukan ES module** — module diblokir CORS di `file://`. Semua modul memakai namespace `window.TN` (`TN.data`, `TN.i18n`, `TN.store`, `TN.ui`).
- `data.js` berisi **data + fungsi murni** (`recipeTotals`, `sessionCost`, `coverMonths`, `prorata`, `balanceUntil`) — dipakai landing, harga, console, Nala, dan QA (lewat `page.evaluate`). Tidak ada angka harga di HTML atau file JS lain.
- State UI lewat atribut (`aria-selected`, `aria-checked`, `data-state`) — aturan v3 #9.
- Format uang: `Intl.NumberFormat` sesuai bahasa; ringkas `Rp34 rb` / `Rp34K`.

## 4. State Demo Console (`store.js`)

| Kunci localStorage | Isi |
|---|---|
| `tn-lang` | `id` / `en` (dipakai bersama landing/harga/console, sama dengan v3) |
| `tn-v4-demo` | `{ version, user:{name}, balance, projects[], services[], history[], reminder, clock }` |

- **Data kontak (email/HP) tidak pernah disimpan** — aturan v3. Hanya nama tampilan mock.
- Semua akses localStorage dibungkus try/catch; tanpa storage, console tetap jalan dalam memori (reload = reset).
- Preset: `?demo=ayu|raka|dimas` mengisi state persona **persis seperti tabel `services-and-pricing.md` §8** (jam 21 Nov 2026); `&state=jeda` (ayu); `?demo=reset` mengosongkan.
- **Jam simulasi** (`clock`): menu Akun → “Simulasi: majukan 30 hari” menjalankan perpanjangan / jeda / berhenti otomatis sesuai §2 aturan tagihan — untuk demo saldo habis.
- Semua perubahan saldo lewat satu fungsi `store.charge({amount, service, project, note})` yang menulis riwayat.

## 5. Router Console

- Hash router (`#/beranda`, `#/buat?resep=…`, `#/proyek/:id`, …) — jalan di `file://`.
- Saat pindah rute: render, set `document.title`, **fokus ke `h1` rute** (`tabindex="-1"`), umumkan judul lewat region `aria-live` polite, scroll ke atas.
- Belum “masuk” → `#/masuk?next=…`.
- Tab bar `aria-current="page"`; sidebar desktop sama.

## 6. Aturan Membangun (pengganti v3 ground rules untuk v4)

1. **Mobile first sungguhan** — v3 #1 (tanpa `max-*:`/`@media (max-width)`).
2. **Tinggi ditentukan konten; grid selalu kolom eksplisit** — v3 #2.
3. **Token hanya di `src/tailwind.css` `@theme`** — tidak ada hex di HTML/JS.
4. **Utility dulu** (harga & console). **Pengecualian landing (21 Nov 2026):** `index.html` memakai CSS tulisan tangan `assets/css/site.css` + `landing.css` (port showcase v2) dan copy statis `data-l` — lihat `visual-direction.md` §5. `@layer components` hanya untuk: `.shell`, `.btn` + varian, `.sheet` + varian, `.display`, `.kicker`, `.switch`, `.card`. CSS custom lain (ilustrasi, keyframe) di `@layer components`/`utilities` file yang sama, target < 250 baris total.
5. **Tipografi fluid** dengan `clamp()`; body ≥16px — v3 #5.
6. **Overlay = `<dialog>`** + `setupModal()` (v3 #6), termasuk aturan `sr-only` butuh ancestor `relative`. Mobile: bottom sheet; `md:`: dialog tengah.
7. **QA per section/layar**, bukan di akhir — v3 #7, untuk **setiap halaman dan setiap rute console**, termasuk EN di 320px.
8. **Konten dulu, dekorasi belakangan** — v3 #8.
9. **Satu sumber angka:** semua harga/estimasi dari `data.js`; QA membandingkan dengan `services-and-pricing.md`.
10. **Commit kecil + push setiap langkah** ke branch `v4-cloud` (satu branch untuk seluruh v4); PR ke `main` per fase atau sesuai permintaan user, merge atas persetujuan user.
11. **Jangan bawa CSS showcase v2**; bawa bahasa visualnya (`visual-direction.md`). Logika JS v3/showcase boleh dipakai ulang setelah dibaca.

## 7. Aksesibilitas (tambahan v4)
- Chip resep = `radiogroup` (pilihan tunggal yang mengubah kartu) dengan panah kiri/kanan; segmented ukuran = `radiogroup`; switch layanan = `button[role=switch][aria-checked]`; stepper = tombol −/+ dengan `aria-label` + nilai `aria-live`.
- Wizard: judul langkah fokus saat pindah langkah; “Langkah n dari 4” terbaca; progres menyalakan di `aria-live="polite"`; tombol Nyalakan tidak di-disable tanpa alasan (validasi saat klik, aturan v3).
- Ringkasan lengket mobile: tombol “Rincian” `aria-expanded`.
- Grafik pemakaian mengikuti skill dataviz (v3).
- axe 0 pelanggaran di **setiap halaman, setiap rute console, dan setiap dialog terbuka**.

## 8. Tools QA v4
| Tool | Isi |
|---|---|
| `tools/qa_v4.py --interactive --out <dir>` | 6 viewport untuk `index.html`, `harga.html`, dan rute console utama (state kosong + `?demo=ayu`), cek v3 (overflow, escape shell, teks meluap, touch target, console error, above-the-fold) + alur: resep → wizard → isi saldo → nyala → beranda; kalkulator; berhenti/ganti ukuran; jam simulasi → dijeda |
| `tools/i18n_check.py` | Diperluas dengan `--root v4` (semua halaman + kamus + template JS) |
| `tools/audit_v4.py` | axe-core 4.14.0 per halaman/rute/dialog, face font (4), `file://`, reduced motion, storage diblokir, **CSS compile up to date**, **konsistensi angka** (`services-and-pricing.md` §9), label simulasi |
| `tools/demo_v4.py` | Gladi skrip demo (21 langkah, screenshot bernomor) |

Skrip v3 tidak diubah perilakunya untuk v3.

## 9. Definition of Done v4
1. Tiga halaman jalan lewat `file://` dan server lokal, tanpa error console.
2. Lolos 6 viewport untuk setiap halaman dan rute console (QA otomatis + screenshot dilihat).
3. Alur demo utama (skrip di `user-journeys.md`) jalan tanpa hambatan di 375px.
4. Semua angka sama dengan `services-and-pricing.md` (cek otomatis).
5. ID/EN lengkap: 0 kunci hilang, 0 kunci mati, 0 teks belum diterjemahkan.
6. axe 0 pelanggaran (halaman, rute, dialog).
7. Reduced motion: semua konten tampil, tanpa animasi.
8. Storage diblokir: semua halaman jalan; console dalam memori.
9. Hanya face font yang dimuat yang dirender: 4 (harga, console), 6 di landing (+ Manrope 600, Plex Mono 600).
10. `app.css` hasil build terbaru.
11. Data kontak tidak tersimpan di storage.
12. Label simulasi terlihat di footer, checkout, wizard, dan console.

### Status DoD (Fase 7, 20 Nov 2026) — semua terpenuhi
| # | Bukti |
|---|---|
| 1 | `audit_v4.py` membuka `index.html`, `harga.html`, `app.html?demo=ayu` lewat `file://` tanpa error; QA lewat server lokal |
| 2 | `qa_v4.py --interactive`: 12 halaman/rute × 6 viewport + 4 uji motion = 76 cek, screenshot ditinjau |
| 3 | `demo_v4.py`: 21 langkah skrip demo di 375×812 lolos |
| 4 | `audit_v4.py` [numbers]: unit AI, resep, contoh, template, Nala, preset (saldo, cukup sampai), riwayat = saldo, harga tiap tabel |
| 5 | `i18n_check.py --root v4`: semua kunci [ID, EN], 0 hilang, 0 mati, 0 belum diterjemahkan (31 halaman/rute) |
| 6 | axe 0 pelanggaran di semua halaman, rute console, dan dialog (katalog, konsultasi, Nala, tambah layanan, isi saldo, Lainnya, menu akun, konfirmasi, ganti ukuran) |
| 7 | reduced motion: tidak ada animasi/transisi > 0,01 ms, GSAP/Lenis tidak berjalan, konten tampil |
| 8 | localStorage diblokir: landing/harga berganti bahasa, console masuk & berjalan di memori |
| 9 | Hanya Manrope 500/700/800 + IBM Plex Mono 500 yang dirender (termasuk `<option>`) |
| 10 | `app.css` dibangun ulang dan dibandingkan byte per byte |
| 11 | Storage hanya `tn-lang` + `tn-v4-demo`; email/HP masuk, konsultasi, kontak Nala tidak pernah tersimpan |
| 12 | Label simulasi terlihat di footer landing/harga, console (beranda, wizard), dan sheet isi saldo |

## 10. Urutan Build
| Fase | Langkah |
|---|---|
| 1 | Setup `v4/` + CLI build + token + font + ikon · shell landing (header, menu, bahasa, footer) · `tools/qa_v4.py` dasar · hero · cerita macet · **Mau bikin apa?** (data.js + resep) · cara kerja · semua layanan · satu saldo |
| 2 | Template · AI (port v3) · contoh · aman untuk pemula · belajar · tim (port v3) · FAQ · CTA akhir · motion · Nala (alur resep) |
| 3 | Harga: kalkulator + detail layanan + AI + saldo/tagihan + FAQ harga |
| 4 | Console: kerangka (header, tab bar, sidebar, router) · store + preset · masuk · beranda (kosong/berisi/banner) · saldo + isi saldo (checkout v3) + riwayat |
| 5 | Wizard 4 langkah · detail proyek (ringkasan, layanan: ganti ukuran/berhenti, AI key, log, pengaturan) · jam simulasi & dijeda |
| 6 | AI (mulai cepat, coba AI, model, pemakaian, key) · layanan lain (server, data, file, domain, email, pembayaran) · belajar · bantuan |
| 7 | `audit_v4.py` lengkap · i18n v4 · QA penuh · README v4 · skrip demo |
