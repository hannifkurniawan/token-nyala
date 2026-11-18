# Technical Specification — TokenNyala HTML Prototype

## Document Purpose

Dokumen ini menjadi sumber spesifikasi teknis untuk implementasi landing page TokenNyala dalam HTML, CSS, dan JavaScript. Dokumen ini melengkapi `implementation-plan.md`, `visual-direction.md`, dan `information-architecture.md`.

## Stack

- HTML5 semantic
- Tailwind CSS melalui CDN
- Vanilla JavaScript
- Google Fonts dengan fallback sistem
- Inline SVG atau CSS illustration
- Tanpa framework build tool
- Tanpa backend atau payment provider nyata pada prototype

```text
index.html
styles.css
script.js
assets/
```

Sebelum eksekusi, struktur file final boleh disederhanakan menjadi satu file `index.html` jika diputuskan untuk presentasi interview. Namun pemisahan CSS dan JavaScript lebih mudah dipelihara.

## Browser Support

- Chrome versi terbaru
- Edge versi terbaru
- Firefox versi terbaru
- Safari versi terbaru
- Mobile Safari dan Chrome Android

## Responsive Breakpoints

| Nama | Lebar | Perilaku utama |
|---|---:|---|
| Mobile | 320–639px | Navigasi ringkas, hero vertikal, kartu paket stacked, checkout sebagai bottom sheet |
| Tablet | 640–1023px | Hero tetap 1–2 kolom, kartu paket 2 kolom, checkout sebagai dialog |
| Desktop | 1024–1439px | Layout 12 kolom, hero 2 kolom, 3 kartu paket |
| Wide | 1440px+ | Konten dibatasi maksimal 1184px atau 1280px |

## Tailwind CDN Setup

Gunakan konfigurasi Tailwind di halaman HTML untuk warna, font, radius, bayangan, dan spacing khusus.

```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          ink: '#17181A',
          paper: '#F7F8FC',
          xlblue: '#002DBB',
          xldark: '#00166A',
          xlyellow: '#FFC93C',
          xlteal: '#00D2A0',
          xlsky: '#5CD0F9',
          muted: '#69728A',
          border: '#D9DEEA'
        },
        fontFamily: {
          sans: ['Manrope', 'system-ui', 'sans-serif'],
          mono: ['IBM Plex Mono', 'ui-monospace', 'monospace']
        }
      }
    }
  }
</script>
```

Gunakan Tailwind utility untuk layout dasar dan `styles.css` untuk state khusus, ilustrasi, animasi, scrollbar, dan media query kompleks.

## Design Tokens

```css
:root {
  --color-xl-blue: #002DBB;
  --color-xl-dark: #00166A;
  --color-xl-yellow: #FFC93C;
  --color-xl-teal: #00D2A0;
  --color-xl-sky: #5CD0F9;
  --color-ink: #17181A;
  --color-paper: #F7F8FC;
  --color-white: #FFFFFF;
  --color-muted: #69728A;
  --color-border: #D9DEEA;
  --color-success: #00D2A0;
  --radius-card: 20px;
  --radius-control: 12px;
}
```

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

### 1. Header

- Brand wordmark TokenNyala
- Tautan: Cara kerja, Paket, FAQ
- Language switch: ID / EN
- CTA: Isi saldo
- Mobile menu button dengan `aria-expanded`

### 2. Hero

- Eyebrow singkat
- H1 benefit-led
- Supporting copy
- CTA utama
- CTA sekunder
- Trust row
- CSS/SVG project preview
- Credit meter or connection-status visual

### 3. How It Works

- 3 kolom desktop
- 1 kolom mobile
- Setiap langkah memiliki nomor, judul, dan deskripsi singkat

### 4. Package Picker

- Intent tabs: Belajar, Prototype, Kerja
- Ketiga package card:
  - Rp50.000 — Mulai
  - Rp100.000 — Bangun
  - Rp250.000 — Scale
- State aktif dan rekomendasi
- Estimasi pakai ditampilkan sebagai range
- CTA memilih atau membuka checkout

### 5. Why / Benefits

- Minimal 3 kartu benefit
- One balance for AI tools
- Local payment
- Plain-language estimates
- Bisa menggunakan satu mock project panel sebagai visual pendukung

### 6. Example Usage

- Mock prompt atau project preview
- Estimasi sesi kecil dalam rentang aman
- Disclaimers bahwa harga dan penggunaan sebenarnya dapat berbeda

### 7. FAQ

- `<details>` dan `<summary>` untuk aksesibilitas bawaan
- Pertanyaan minimal:
  - Kapan saldo aktif?
  - Metode pembayaran apa saja?
  - Apakah estimasi jumlah sesi pasti?
  - Bisakah refund atau batal?
  - Berapa lama bukti pembayaran tersedia?

### 8. Final CTA

- Ulangi core promise
- Tombol isi saldo
- Trust copy singkat

### 9. Footer

- Wordmark
- Link bantuan dan legal mock
- Language switch optional
- Copyright

## Component Specifications

### Buttons

- Tinggi minimum 44px
- Border radius 12px
- Primary: latar Signal Orange, teks Ink atau putih dengan rasio kontras memadai
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
- Recommended: border Signal dan badge “Paling pas”
- Selected: latar mint atau border lebih tegas
- Hover: transform translateY(-4px)
- Pada mobile, card stacked dan CTA tetap terlihat

### Intent Tabs

- Gunakan tiga button dalam `role="tablist"`
- Tombol memiliki `role="tab"`, `aria-selected`, dan `aria-controls`
- Content panel memiliki `role="tabpanel"`
- Mendukung keyboard Arrow Left dan Arrow Right
- State aktif memiliki latar Ink dan teks putih

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
  - Email
  - Payment method
  - Package price
  - Bonus credit
  - Fee Rp0
  - Total
- Payment options mock: QRIS, E-Wallet, Virtual Account
- Form email menggunakan `type="email"` dan `required`
- Confirm disabled sampai email valid dan metode dipilih
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

- Email wajib diisi
- Gunakan validasi browser untuk format dasar
- Tambahkan pesan inline untuk email tidak valid
- Nama atau nomor telepon tidak perlu dipakai pada prototype awal
- Tidak menyimpan atau mengirim data pengguna ke server

## Mock Payment Rules

- QRIS: tampilkan placeholder QR SVG dengan status menunggu
- E-Wallet: tampilkan pilihan DANA/GoPay/OVO secara mock
- Virtual Account: tampilkan nomor virtual account generated secara lokal
- Confirm button membuat success state setelah validasi
- Hindari simulasi delay lebih dari 600ms

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
- Jangan menyimpan alamat email pada localStorage
- Jangan menampilkan nomor pembayaran nyata
- Tampilkan label mock pada checkout
- Hindari mengirim form ke endpoint yang tidak dikonfigurasi
- Payment method is for simulation only

## Definition of Done

- Landing page dapat dibuka langsung dari browser
- Desktop, tablet, dan mobile tidak memiliki overflow horizontal
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

## Open Items

- Aset logo resmi belum tersedia
- Nominal final perlu validasi terhadap harga actual credit
- Estimasi jumlah sesi perlu validasi berdasarkan model dan tipe tugas
- Nama payment provider final belum tersedia
- Domain dan deployment target belum ditentukan
