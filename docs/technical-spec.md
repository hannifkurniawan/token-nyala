# Technical Specification — TokenNyala HTML Prototype

## Document Purpose

Dokumen ini menjadi sumber spesifikasi teknis untuk implementasi landing page TokenNyala dalam HTML, CSS, dan JavaScript. Dokumen ini melengkapi `implementation-plan.md`, `visual-direction.md`, dan `information-architecture.md`.

## Stack

- HTML5 semantic
- Tailwind CSS v4 — browser build via CDN (`@tailwindcss/browser`, versi di-pin), pendekatan **mobile first**
- Vanilla JavaScript
- Google Fonts dengan fallback sistem
- Inline SVG atau CSS illustration
- Tanpa framework build tool
- Tanpa backend atau payment provider nyata pada prototype

```text
v3/
├── index.html   # markup + utility class Tailwind + @theme token
├── styles.css   # hanya ilustrasi, animasi, dan hal yang tidak bisa dengan utility (target < 100 baris)
├── script.js    # data, i18n, interaksi
└── assets/
```

v1 (root) dan v2 (`v2-tailwind-cdn/`) adalah arsip dan tidak dikembangkan lagi. Aturan implementasi v3 ada di `docs/v3-ground-rules.md`.

## Browser Support

- Chrome versi terbaru
- Edge versi terbaru
- Firefox versi terbaru
- Safari versi terbaru
- Mobile Safari dan Chrome Android

## Responsive Breakpoints (Mobile First)

Gunakan breakpoint default Tailwind. Class tanpa prefix = mobile. Prefix hanya **menambah** perilaku untuk layar yang lebih lebar. Tidak boleh ada `@media (max-width: …)`.

| Prefix | Mulai dari | Perilaku utama |
|---|---:|---|
| (tanpa prefix) | 320px | Navigasi ringkas, hero vertikal, kartu paket stacked, checkout sebagai bottom sheet |
| `sm:` | 640px | Gutter 24px, metode pembayaran 2 kolom, CTA hero sejajar |
| `md:` | 768px | Kartu paket 2 kolom atau scroll horizontal, checkout sebagai dialog di tengah |
| `lg:` | 1024px | Navigasi desktop penuh, hero 2 kolom, 3 kartu paket |
| `xl:` | 1280px | Konten dibatasi `max-w-[1184px]` |

Viewport uji wajib: **320, 375, 768, 1024, 1440** (portrait) dan **667×375** (mobile landscape).

## Tailwind v4 CDN Setup

Prototype memakai browser build Tailwind v4. Versi **harus di-pin** (jangan `@4` atau `latest`). Play CDN v3 (`cdn.tailwindcss.com`) tidak dipakai lagi.

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.3"></script>
<style type="text/tailwindcss">
  @theme {
    --color-xl-blue: #002DBB;
    --color-xl-dark: #00166A;
    --color-xl-yellow: #FFC93C;
    --color-xl-teal: #00D2A0;
    --color-xl-sky: #5CD0F9;
    --color-ink: #17181A;
    --color-paper: #F7F8FC;
    --color-muted: #69728A;
    --color-line: #D9DEEA;

    --font-sans: "Manrope", system-ui, sans-serif;
    --font-mono: "IBM Plex Mono", ui-monospace, monospace;

    --radius-card: 20px;
    --radius-control: 12px;
  }
</style>
```

Token di atas otomatis menjadi utility: `bg-xl-blue`, `text-muted`, `border-line`, `rounded-card`, `font-mono`, dan seterusnya.

Catatan: browser build hanya untuk prototype. Untuk produksi, gunakan Tailwind CLI agar CSS di-compile dan dipangkas.

## Design Tokens

**Satu sumber kebenaran:** semua token hanya didefinisikan di blok `@theme` di atas. Jangan menduplikasi token di `:root` pada `styles.css`. Jika CSS custom perlu warna, pakai variabel yang dihasilkan Tailwind (`var(--color-xl-blue)`).

| Token | Nilai | Pemakaian |
|---|---|---|
| `xl-blue` | `#002DBB` | CTA utama, link aktif, brand |
| `xl-dark` | `#00166A` | Heading gelap, footer |
| `xl-yellow` | `#FFC93C` | Badge, highlight, on-state line (maks 10–15% area) |
| `xl-teal` | `#00D2A0` | Success, selected, saldo siap |
| `xl-sky` | `#5CD0F9` | Focus ring, info, estimasi |
| `teal-ink` | `#007A5E` | Teks/ikon teal di atas latar terang (XL Teal terlalu terang untuk teks, kontras < 3:1) |
| `ink` | `#17181A` | Teks utama |
| `paper` | `#F7F8FC` | Background halaman |
| `muted` | `#69728A` | Teks sekunder |
| `line` | `#D9DEEA` | Border |
| `radius-card` | 20px | Kartu |
| `radius-control` | 12px | Tombol, input |

## Semantic HTML

Gunakan elemen semantik berikut:

- `<header>` untuk navigasi utama
- `<nav aria-label="Navigasi utama">`
- `<main>` untuk seluruh konten utama
- `<section aria-labelledby="...">` untuk setiap section
- `<h1>` tunggal pada hero
- `<h2>` untuk judul section
- `<h3>` untuk judul kartu
- `<button type="button">` untuk aksi JavaScript
- `<dialog>` atau div dengan `role="dialog"` untuk checkout
- `<footer>` untuk penutup dan tautan

## Page Structure

Urutan lengkap dan overlay global ada di `information-architecture.md`. Ringkasan:

1. **Header** — wordmark; tautan Cara kerja, Paket, Model AI, FAQ; language switch ID/EN; CTA Isi saldo; mobile menu button dengan `aria-expanded`.
2. **Hero** — eyebrow, H1 benefit-led, supporting copy, CTA utama + sekunder, trust row, CSS/SVG project preview, credit meter.
3. **How It Works** — 3 langkah (1 kolom base, 3 kolom `lg:`).
4. **Package Picker** — intent tabs Belajar/Prototype/Kerja; kartu Rp50.000 Mulai, Rp100.000 Bangun, Rp250.000 Scale; estimasi range; baris aturan saldo; link ke Model AI.
5. **Model AI** — 6 kartu model + tombol katalog lengkap (lihat *Fitur v3 → Katalog Model*).
6. **Pakai di Tool Favoritmu** — 3 langkah + contoh konfigurasi (lihat *Fitur v3 → API Key & Panduan Pasang*).
7. **Why / Benefits** — 4 kartu: pilihan yang dipahami, satu saldo, bayar lokal, pantau & kendalikan (+ mock mini dashboard).
8. **Example Usage** — mock prompt/project, estimasi sesi kecil, disclaimer.
9. **Untuk Tim & Bisnis** — benefit tim + CTA konsultasi (lihat *Fitur v3 → Form Konsultasi Tim*).
10. **FAQ** — `<details>`/`<summary>`. Pertanyaan minimal:
    - Kapan saldo aktif?
    - Model AI apa saja yang bisa dipakai?
    - Apakah saldo bisa kedaluwarsa?
    - Apakah harga sudah termasuk PPN?
    - Apakah estimasi jumlah sesi pasti?
    - Metode pembayaran apa saja?
    - Bisakah refund atau batal?
    - Ke mana data prompt saya dikirim?
    - Bagaimana kalau API key saya bocor?
    - Bisakah membeli untuk tim dan meminta invoice perusahaan?
11. **Final CTA** — ulangi core promise, tombol isi saldo, trust copy.
12. **Footer** — wordmark, bantuan, Syarat & Ketentuan (mock), Kebijakan Privasi (mock), copyright.

## Component Specifications

### Buttons

- Tinggi minimum 44px
- Border radius 12px
- Primary: latar XL Blue `#002DBB`, teks putih (kontras ±9:1)
- Secondary: transparan atau border, teks Ink
- Hover: background sedikit lebih gelap dan sedikit shadow
- Active: transform 1px ke bawah
- Focus: `outline: 3px solid #5CD0F9`, `outline-offset: 3px`

### Package Cards

```text
Nama paket
Nominal besar
Bonus credit kecil
Estimasi penggunaan
Fitur singkat
CTA
```

- Card default: border abu terang
- Recommended: border XL Blue dan badge “Paling pas” (latar XL Yellow, teks XL Dark)
- Selected: border XL Teal 2px + ikon centang + label teks “Dipilih” (state tidak boleh hanya warna)
- Hover: transform translateY(-4px)
- Pada mobile, card stacked dan CTA tetap terlihat

### Intent Tabs

- Gunakan tiga button dalam `role="tablist"`
- Tombol memiliki `role="tab"`, `aria-selected`, dan `aria-controls`
- Content panel memiliki `role="tabpanel"`
- Mendukung keyboard Arrow Left dan Arrow Right
- State aktif memiliki latar Ink dan teks putih
- Default tab: Belajar (persona utama Ayu)
- Di atas kartu ada **baris rekomendasi** (`aria-live="polite"`): nama paket, harga, alasan singkat, dan tombol pilih. Urutan kartu tetap berdasarkan harga di semua ukuran layar
- Layout kartu: 1 kolom (base), kartu baris 2 kolom isi (`md:`), 3 kartu (`lg:`)

### Language Switch

- Pilihan ID/EN sebagai button group
- Gunakan `aria-pressed`
- Semua copy dinamis perlu disimpan dalam object JavaScript
- Default: Indonesia
- Penyimpanan preference: `localStorage`
- Nilai mata uang dan format tetap IDR

## Interactive Data Model

```js
const packages = {
  learn: {
    id: 'learn',
    amount: 50000,
    bonus: 5000,
    name: 'Mulai',
    estimate: '20–30 sesi kecil'
  },
  prototype: {
    id: 'prototype',
    amount: 100000,
    bonus: 15000,
    name: 'Bangun',
    estimate: '40–60 sesi kecil'
  },
  work: {
    id: 'work',
    amount: 250000,
    bonus: 50000,
    name: 'Scale',
    estimate: '100+ sesi kecil'
  }
}

const intents = {
  learn: 'Belajar',
  prototype: 'Prototype',
  work: 'Kerja'
}
```

Semua estimasi harus diberi disclaimer: `Estimasi bergantung pada model, panjang prompt, dan tipe output.`

### Aturan Saldo (G2)

```js
const CREDIT_RULES = {
  rupiahPerCredit: 1,        // 1 kredit = Rp1
  taxIncluded: true,         // harga paket sudah termasuk PPN
  expires: false,            // saldo dan bonus tidak kedaluwarsa
  cashRefundable: false,     // tidak bisa diuangkan
  transferable: false,       // tidak bisa dipindahtangankan
  chargeFailedRequests: false // request gagal tanpa output tidak memotong saldo
}
```

Ditampilkan sebagai satu baris di bawah kartu paket, di FAQ, dan di ringkasan checkout. Status: keputusan prototype, perlu validasi legal/finance sebelum produksi.

### Definisi “Sesi Kecil”

Semua estimasi “sesi kecil” di halaman dihitung dari satu definisi:

```js
const SMALL_SESSION = { inputTokens: 40000, outputTokens: 4000 }
// ≈ satu permintaan perbaikan komponen di tool coding, termasuk konteks file
```

Biaya satu sesi = `(input/1e6 × inputPer1M) + (output/1e6 × outputPer1M)` kredit.

Estimasi paket memakai tarif acuan level **Seimbang** (Claude Sonnet mock: 31.500 / 157.500 kredit per 1 jt token) → ±Rp1.890 per sesi kecil:

| Paket | Kredit (nominal + bonus) | Hitungan | Ditampilkan |
|---|---:|---:|---|
| Mulai | 55.000 | ±29 sesi | 20–30 sesi kecil |
| Bangun | 115.000 | ±60 sesi | 40–60 sesi kecil |
| Scale | 300.000 | ±158 sesi | 100+ sesi kecil |

Batas level biaya: **Hemat** < Rp1.000 per sesi kecil, **Seimbang** Rp1.000–3.000, **Premium** > Rp3.000.

### Katalog Model Mock (G1, G5)

Tarif dalam kredit per 1 juta token (1 kredit = Rp1). Semua angka ilustratif; sebagian mengacu pada tarif publik OCTA (lihat `research/reference-gap-analysis.md`). Nama memakai nama keluarga model, bukan versi spesifik, agar tidak cepat usang.

| id | Nama | Penyedia | Kegunaan | Level | Input/1jt | Output/1jt | Konteks | ≈ sesi / Rp10.000 |
|---|---|---|---|---|---:|---:|---|---:|
| `deepseek-chat` | DeepSeek Chat | DeepSeek | coding, chat | Hemat | 4.500 | 18.000 | 128 rb | 39 |
| `gemini-flash` | Gemini Flash | Google | chat, analisis | Hemat | 5.000 | 20.000 | 1 jt | 35 |
| `qwen-plus` | Qwen Plus | Alibaba | chat | Hemat | 6.000 | 24.000 | 128 rb | 29 |
| `gpt-mini` | GPT Mini | OpenAI | chat | Hemat | 6.500 | 26.000 | 400 rb | 27 |
| `deepseek-reasoner` | DeepSeek Reasoner | DeepSeek | analisis, coding | Hemat | 9.000 | 36.000 | 128 rb | 19 |
| `claude-haiku` | Claude Haiku | Anthropic | chat, coding | Hemat | 15.000 | 75.000 | 200 rb | 11 |
| `qwen-max` | Qwen Max | Alibaba | coding, chat | Seimbang | 20.000 | 80.000 | 256 rb | 8 |
| `gpt` | GPT | OpenAI | coding, chat | Seimbang | 25.000 | 150.000 | 400 rb | 6 |
| `claude-sonnet` | Claude Sonnet | Anthropic | coding, analisis | Seimbang | 31.500 | 157.500 | 1 jt | 5 |
| `gemini-pro` | Gemini Pro | Google | coding, analisis | Seimbang | 31.500 | 189.000 | 1 jt | 4 |
| `claude-opus` | Claude Opus | Anthropic | coding | Premium | 78.750 | 393.750 | 1 jt | 2 |
| `gpt-pro` | GPT Pro | OpenAI | analisis | Premium | 150.000 | 600.000 | 400 rb | 1 |

`≈ sesi / Rp10.000` dihitung di JavaScript (`Math.floor(10000 / biayaSesi)`), bukan ditulis manual.

Preview di landing (6 kartu, urutan): Claude Sonnet, GPT, Gemini Pro, DeepSeek Chat, Qwen Plus, Claude Opus.

## JavaScript Behavior

### Mobile Navigation

- Menu button toggle `.is-open`
- Update `aria-expanded`
- Tutup menu saat tautan diklik
- Tutup saat Escape ditekan
- Tambah `overflow-hidden` pada body saat menu terbuka bila perlu

### Package Selection

- Klik intent mengubah package recommendation
- Klik package card mengubah state selected
- Membuka checkout jika CTA “Isi paket ini” diklik
- Tidak perlu hard reload atau navigasi halaman

### Language Switch

- Fungsi `setLanguage(lang)` mengubah text nodes yang memiliki `data-i18n`
- Update `lang` pada `<html>`
- Update package estimates dan checkout copy
- Simpan pilihan ke `localStorage`

### Checkout Modal

- Gunakan `<dialog>` bila memungkinkan
- Fallback: overlay div dengan `role="dialog"`
- Opening: set selected package dan total
- Display fields:
  - Email atau nomor HP (satu field)
  - Payment method
  - Package price
  - Bonus credit
  - Fee Rp0
  - Total
- Payment options mock: QRIS, E-Wallet, Virtual Account
- Field kontak menggunakan `type="text"`, `inputmode="email"`, `autocomplete="email"`, dan `required` (lihat Form Validation)
- Confirm disabled sampai kontak valid dan metode dipilih
- Submit menampilkan success state
- Tidak membuat transaksi nyata
- Success state harus mencantumkan teks `Prototype — tidak ada transaksi nyata`

### Focus and Modal

- Simpan elemen yang membuka dialog
- Fokus ke close button atau heading saat dibuka
- Kembalikan fokus saat ditutup
- Trap Tab dalam modal
- Tutup dengan Escape
- Tutup saat backdrop diklik, dengan pengecualian arah klik
- Tambah `aria-live="polite"` pada status pembayaran

## Form Validation

Checkout memakai **satu field kontak: email atau nomor HP**. Bukti pembelian dikirim ke kontak tersebut.

- Wajib diisi.
- Deteksi otomatis:
  - Mengandung `@` → divalidasi sebagai email (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
  - Selain itu → dibersihkan dari spasi, `-`, dan `.`, lalu divalidasi sebagai nomor HP Indonesia: `^(\+62|62|0)8[1-9][0-9]{7,10}$`.
- Nomor HP dinormalisasi ke format `+628…` saat ditampilkan di ringkasan dan success state.
- Pesan error inline ditampilkan setelah `blur` atau saat submit, bukan saat setiap ketikan.
- Field dihubungkan ke pesan error dengan `aria-describedby` dan `aria-invalid="true"`.
- Helper text di bawah label: “Bukti pembelian dikirim ke sini.”
- Tidak menyimpan atau mengirim data pengguna ke server.

## Mock Payment Rules

- QRIS: tampilkan placeholder QR SVG dengan status menunggu
- E-Wallet: tampilkan pilihan DANA/GoPay/OVO secara mock
- Virtual Account: tampilkan nomor virtual account generated secara lokal
- Confirm button membuat success state setelah validasi
- Hindari simulasi delay lebih dari 600ms

## Fitur v3 (P1 + P2)

Kode `G1–G8` merujuk ke `research/reference-gap-analysis.md`. Copy lengkap ada di `microcopy-and-states.md`.

### Kartu Model (G1, G5)

```text
[C] Claude Sonnet                 [Seimbang]
Anthropic · Coding · Analisis
≈ 5 sesi kecil / Rp10.000
▸ Detail tarif
    Input   31.500 kredit / 1 jt token
    Output 157.500 kredit / 1 jt token
    Konteks 1 jt token
```

- Ikon = monogram huruf awal penyedia di lingkaran, **bukan logo resmi** penyedia.
- Badge level selalu berisi teks: Hemat (latar teal muda), Seimbang (sky muda), Premium (yellow muda). Warna bukan satu-satunya pembeda.
- “Detail tarif” memakai `<details>`; tertutup secara default (pemula tidak melihat angka teknis kecuali membuka).
- Angka diformat `Intl.NumberFormat('id-ID')`; EN memakai “1M tokens”.
- Kartu tidak punya tombol beli sendiri — satu saldo berlaku untuk semua model.

### Katalog Model (dialog)

- `<dialog>` dibuka dengan `showModal()`.
- Mobile: full screen (`w-full h-dvh max-w-none m-0`), header + search sticky di atas.
- `md:`: dialog tengah `max-w-4xl max-h-[85dvh]`, isi scroll internal.
- Header: judul, subjudul “Satu saldo untuk semua model…”, tombol tutup.
- Search: `<input type="search">` dengan label (boleh visually hidden), mencari di nama dan penyedia, tanpa perlu Enter.
- Filter sebagai grup chip `button[aria-pressed]`:
  - Kegunaan: Coding · Chat & menulis · Analisis dokumen
  - Level biaya: Hemat · Seimbang · Premium
  - Penyedia: Anthropic · OpenAI · Google · DeepSeek · Alibaba
  - Di mobile, baris chip boleh scroll horizontal **di dalam** kontainernya (`overflow-x-auto`), tidak boleh membuat halaman overflow.
- Logika filter: OR di dalam satu grup, AND antar grup.
- Hasil: grid 1 kolom base, 2 kolom `md:`, 3 kolom `lg:`. Tampilkan 6, lalu tombol “Tampilkan lebih banyak” (+6). Tidak ada pagination bernomor.
- Jumlah hasil diumumkan di elemen `aria-live="polite"`: “Menampilkan 6 dari 12 model”.
- Empty state + tombol “Hapus filter”.
- Footer dialog: label “Contoh — daftar model dan tarif dapat berubah” + definisi sesi kecil.

### API Key & Panduan Pasang (G3)

Section “Pakai di tool favoritmu”:

```text
1  Salin API key        dari halaman saldo setelah top up
2  Tempel di tool       isi Base URL dan API key di pengaturan tool
3  Pilih model & mulai  semua model memakai saldo yang sama

┌ Contoh konfigurasi ───────────────────────┐
│ Base URL  https://api.tokennyala.example/v1  [Salin] │
│ API key   tn-demo-••••••••3f9a               [Salin] │
└───────────────────────────────────────────┘
Kompatibel dengan tool yang mendukung OpenAI API, contoh: Cursor, Cline, Continue.
```

- Domain memakai `.example` (RFC 2606) agar jelas bukan endpoint nyata.
- Tombol Salin memakai `navigator.clipboard.writeText`; umumkan “Tersalin” lewat `aria-live`; fallback: pilih teks.
- Nama tool ditulis sebagai teks biasa, tanpa logo, diberi label “contoh”.

Checkout success state (menggantikan “Kembali ke proyek”):
- Judul “Saldo nyala!”, ringkasan paket dan kontak tujuan bukti.
- Kartu API key mock (`tn-demo-` + 4 karakter acak, sisanya disamarkan) dengan tombol **Salin API key**.
- Tombol sekunder **Lihat panduan pasang** → tutup dialog, scroll ke section 6.
- Peringatan kecil: “Simpan API key seperti kata sandi. Jangan dibagikan.”
- Label “Prototype — tidak ada transaksi nyata”.

### Pantau & Kendalikan (G6)

Mock mini dashboard di dalam kartu benefit ke-4 (statis, bukan data nyata):

```text
Saldo tersisa          Rp82.400
Pemakaian 7 hari       ▂▃▅▂▆▃▄   (7 bar CSS)
[x] Ingatkan saat saldo < Rp20.000
API key  Laptop kerja · Aktif     [Nonaktifkan]
```

- Toggle pengingat dan tombol Nonaktifkan **berfungsi lokal** (mengubah label/status) agar terasa hidup; tidak menyimpan apa pun.
- Bar grafik memiliki teks alternatif: “Pemakaian 7 hari terakhir, tertinggi hari Jumat”.
- Label “Contoh tampilan”.

### Form Konsultasi Tim (G7)

Lebih ringan dari OCTA Enterprise (5 field vs 7 + captcha):

| Field | Tipe | Wajib |
|---|---|---|
| Nama | text, `autocomplete="name"` | Ya |
| Email atau nomor HP | aturan sama dengan checkout | Ya |
| Nama tim atau perusahaan | text, `autocomplete="organization"` | Ya |
| Ukuran tim | radio chip: 1–5 · 6–20 · 21–50 · 50+ | Ya |
| Kebutuhan | textarea, maks 500 karakter, counter `0/500` dengan `aria-live` saat ≥ 450 | Tidak |
| Butuh invoice perusahaan / faktur pajak | checkbox | Tidak |
| Setuju Syarat & Ketentuan dan Kebijakan Privasi | checkbox | Ya |

- Tombol Kirim aktif, validasi saat submit (jangan disable tanpa penjelasan); error inline per field.
- Success state: “Terima kasih! Tim kami menghubungi kamu dalam 1 hari kerja.” + label simulasi.
- Tidak ada captcha di prototype.

### Live Chat Mock (G4)

Asisten otomatis bernama **Nala** + serah terima ke tim manusia. Semua jawaban adalah skrip lokal — **tidak ada AI atau server**.

**Launcher**
- Pill kanan bawah: ikon chat + “Butuh bantuan?” (`button`, `aria-expanded`, `aria-controls`).
- Posisi `fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4`, `z-40`.
- Disembunyikan saat dialog modal terbuka (checkout, katalog, konsultasi).

**Panel**
- Mobile: full screen (`inset-0`, `h-dvh`). `md:`: panel 380×560 di kanan bawah.
- `role="dialog"`, `aria-modal="false"` (non-modal di desktop), `aria-labelledby` judul panel.
- Header: avatar Nala, nama, status “Asisten otomatis”, tombol mulai ulang, tombol tutup.
- Daftar pesan: `role="log"`, `aria-live="polite"`.
- Chip pertanyaan cepat di atas input.
- Input teks + tombol kirim (`aria-label="Kirim pesan"`). Teks bebas dijawab dengan pencocokan kata kunci sederhana; jika tidak cocok → jawaban fallback + chip.
- Disclaimer tetap terlihat di bawah input: “Nala adalah asisten otomatis (simulasi). Jawaban bisa kurang tepat.”
- Escape menutup panel, fokus kembali ke launcher. Saat dibuka, fokus ke input.
- Indikator “sedang mengetik” maksimal 600ms (selaras aturan delay mock).

**Alur skrip**

| Chip / kata kunci | Respons |
|---|---|
| Bantu pilih paket | 2 pertanyaan berurutan dengan chip jawaban: tujuan (Belajar/Prototype/Kerja) → frekuensi (Sesekali/Tiap minggu/Tiap hari). Hasil: rekomendasi paket + tombol **Pilih paket ini** (tutup chat → buka checkout dengan paket tersebut). |
| Cara pakai saldo di tool | Ringkasan 3 langkah + tombol **Lihat panduan pasang** (scroll ke section 6). |
| Model apa saja? | Ringkasan level biaya + tombol **Buka katalog model**. |
| Metode pembayaran | QRIS, e-wallet, virtual account (simulasi). |
| Bicara dengan tim | Serah ke manusia (lihat di bawah). |

Matriks rekomendasi “Bantu pilih paket”:

| Tujuan \ Frekuensi | Sesekali | Tiap minggu | Tiap hari |
|---|---|---|---|
| Belajar | Mulai | Mulai | Bangun |
| Prototype | Mulai | Bangun | Scale |
| Kerja | Bangun | Scale | Scale |

**Serah ke tim manusia**
- Pesan sistem: “Menghubungkan ke tim…” → 600ms → pesan dari agen mock “Sari · Tim TokenNyala” dengan avatar inisial dan badge “Tim”.
- Jam layanan mock: Senin–Jumat 09.00–18.00 WIB. Di luar jam (berdasarkan jam perangkat, zona WIB): tampilkan state **offline** — “Tim sedang offline. Tinggalkan email atau nomor HP, kami balas di jam kerja.” + field kontak (validasi sama dengan checkout) → konfirmasi.
- Label “Simulasi — tidak ada agen nyata” di header saat mode tim.
- Percakapan hanya di memori; hilang saat halaman dimuat ulang. Tidak disimpan ke `localStorage`.

## Animations

- Hero fade-in: 450ms
- Card hover: 180ms
- Modal: 220ms
- Success check: 350ms
- Tidak ada animasi loop di luar ilustrasi status yang ringan
- Gunakan `prefers-reduced-motion: reduce` untuk menghapus atau mempersingkat gerak

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Accessibility Requirements

- Kontras teks minimum WCAG AA
- Minimum touch target 44px
- Skip-to-content link
- Semua icon-only button memiliki `aria-label`
- Tidak bergantung pada warna untuk state
- Selected state memiliki teks atau icon tambahan
- Heading berurutan
- Fokus terlihat pada semua kontrol
- Language control dapat dioperasikan keyboard
- Semua status dinamis diumumkan dengan `aria-live`
- Modal tidak meninggalkan background dapat difokuskan

## SEO and Meta

```html
<meta name="description" content="Top up saldo AI untuk belajar, membuat prototype, dan membangun proyek vibecoding.">
<meta property="og:title" content="TokenNyala — Mulai vibecoding tanpa bingung top up">
<meta property="og:description" content="Pilih kebutuhan dan top up saldo AI dengan alur yang sederhana.">
<meta property="og:type" content="website">
<meta property="og:image" content="assets/og-token-nyala.png">
<meta name="theme-color" content="#F7F8FC">
```

Judul halaman:

```text
TokenNyala — AI Credit untuk Vibecoding
```

## Performance

- Hindari image besar; gunakan SVG dan CSS
- Batasi animasi dan shadow
- Tailwind CDN hanya untuk prototype, bukan build produksi
- Lazy-load gambar non-hero jika ada
- Hindari font weight berlebihan
- Gunakan satu loading state yang ringkas
- Ukuran target awal: HTML + CSS + JS < 300KB sebelum asset illustration

## Security and Privacy

- Jangan meminta password atau kartu kredit dalam prototype
- Jangan menyimpan email atau nomor HP pada localStorage (yang boleh disimpan hanya preferensi bahasa)
- Jangan menampilkan nomor pembayaran nyata
- Tampilkan label mock pada checkout
- Hindari mengirim form ke endpoint yang tidak dikonfigurasi
- Payment method is for simulation only

## Definition of Done

- Landing page dapat dibuka langsung dari browser
- Tidak ada overflow horizontal di 320, 375, 768, 1024, 1440, dan 667×375 landscape
- CTA utama berfungsi
- Intent picker berfungsi
- Package selection dan checkout berfungsi
- Language switch berfungsi
- Success state dapat dibuka
- Modal dapat ditutup dan keyboard dapat digunakan
- Visual sesuai direction TokenNyala
- Estimasi penggunaan memiliki disclaimer
- Tidak ada claim payment atau activation nyata
- Tidak ada console error pada browser
- Katalog model: search, filter, “Tampilkan lebih banyak”, dan empty state berfungsi
- Live chat: alur “Bantu pilih paket” berakhir di checkout dengan paket yang benar; serah ke tim dan state offline dapat ditampilkan
- Form konsultasi tim: validasi dan success state berfungsi
- Tombol salin API key dan base URL berfungsi
- Pill bantuan tidak pernah menutupi CTA utama atau tombol konfirmasi checkout

## Open Items

- Aset logo resmi belum tersedia
- Nominal final perlu validasi terhadap harga actual credit
- Estimasi jumlah sesi perlu validasi berdasarkan model dan tipe tugas
- Nama payment provider final belum tersedia
- Aturan saldo (tidak kedaluwarsa, termasuk PPN, tidak bisa diuangkan) perlu validasi legal/finance
- Tarif model mock perlu diganti tarif nyata dan disinkronkan dengan definisi sesi kecil
- Jam layanan dan SLA balasan tim nyata belum ditentukan
- Domain dan deployment target belum ditentukan
