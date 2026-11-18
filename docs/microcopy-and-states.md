# Microcopy and Interface States — TokenNyala

## Language Principles

- Default language: Bahasa Indonesia.
- English remains available through the language switch.
- “Saldo” adalah istilah utama untuk kredit AI.
- “Token” hanya dipakai untuk penjelasan singkat atau konteks teknis.
- Estimasi dibuat sebagai range, bukan janji.
- Harga selalu menggunakan format Rupiah.
- Semua bukti transaksi dan status pada prototype diberi label mock.

## Hero Copy

### Indonesian
**Eyebrow:** `Untuk ide, prototype, dan proyekmu`

**Headline:** `Mulai vibecoding. Jangan berhenti di tengah jalan.`

**Supporting:** `Isi saldo AI dengan mudah, pilih nominal sesuai proyek, dan lanjutkan membangun—tanpa harus memahami istilah teknis dulu.`

**Primary CTA:** `Isi saldo`

**Secondary CTA:** `Lihat cara kerjanya`

**Trust row:**
- `Bayar lokal`
- `Saldo aktif cepat`
- `Lihat bukti transaksi`

### English
**Eyebrow:** `For ideas, prototypes, and projects`

**Headline:** `Start vibe-coding. Keep building without interruptions.`

**Supporting:** `Top up AI credit in a simple flow, choose an amount that fits your project, and keep moving—without learning technical terms first.`

**Primary CTA:** `Top up balance`

**Secondary CTA:** `How it works`

## Intent Labels

| Intent | Indonesian | English | Recommended package |
|---|---|---|---|
| Learn | Belajar | Learn | Rp50.000 |
| Prototype | Prototype | Prototype | Rp100.000 |
| Work | Kerja | Work | Rp250.000 |

## Package Copy

### Paket Mulai — Rp50.000
- **Label:** Mulai
- **For:** Belajar dan mencoba pertama kali
- **Estimate:** Sekitar 20–30 sesi kecil
- **Helper:** Cocok untuk memahami alur atau menyelesaikan satu mini-task.
- **CTA:** `Pilih Rp50.000`

### Paket Bangun — Rp100.000
- **Label:** Bangun
- **Badge:** Paling pas untuk prototype
- **For:** Membuat satu prototype aktif
- **Estimate:** Sekitar 40–60 sesi kecil
- **Helper:** Cocok untuk iterasi tampilan, prompt, dan perbaikan singkat.
- **CTA:** `Pilih Rp100.000`

### Paket Scale — Rp250.000
- **Label:** Scale
- **For:** Freelancer atau proyek yang berkelanjutan
- **Estimate:** 100+ sesi kecil atau beberapa proyek ringan
- **Helper:** Cocok saat kamu mulai mengerjakan kebutuhan klien atau banyak iterasi.
- **CTA:** `Pilih Rp250.000`

**Disclaimer:** `Estimasi bergantung pada model, panjang prompt, tipe tugas, dan format output.`

## How It Works Copy

### Step 1
**Pilih tujuanmu**  
Belajar, bikin prototype, atau kerjakan proyek.

### Step 2
**Bayar dengan mudah**  
Gunakan QRIS, e-wallet, atau virtual account mock.

### Step 3
**Lanjutkan membangun**  
Saldo siap dipakai dan momentum proyek tidak terputus.

## Why / Benefit Copy

### Plain-Language Packages
**Title:** Pilihan yang bisa kamu pahami  
**Body:** Nominal dan estimasi penggunaan dijelaskan berdasarkan kebutuhan proyek, bukan hanya model dan istilah teknis.

### One Balance
**Title:** Satu saldo untuk lanjut  
**Body:** Isi sekali, lalu gunakan untuk berbagai proses membangun yang tersedia pada platform.

### Local Payment
**Title:** Bayar dengan cara yang familiar  
**Body:** Alur pembayaran dirancang untuk metode yang umum dipakai pengguna Indonesia.

### Clear Receipt
**Title:** Ada bukti, ada jejak  
**Body:** Ringkasan pembayaran dan riwayat pembelian mudah ditemukan.

## Trust Copy

Gunakan hanya sebagai copy prototype bila belum ada bukti layanan nyata:

- `Metode pembayaran lokal`
- `Rincian biaya sebelum bayar`
- `Biaya tambahan Rp0`
- `Saldo dan status pembelian terlihat jelas`
- `Bantuan untuk top up`

Tambahkan label `Contoh tampilan` pada bukti atau klaim operasional jika belum tersedia secara nyata.

## Checkout Copy

### Modal Heading
`Ringkas top up`

### Field Labels
- `Email untuk bukti pembelian`
- `Pilih metode pembayaran`
- `Nominal paket`
- `Bonus kredit`
- `Biaya tambahan`
- `Total bayar`

### Email Placeholder
`nama@email.com`

### Payment Options
- `QRIS`
- `E-Wallet`
- `Virtual Account`

### CTA
`Konfirmasi pembayaran`

### Prototype Notice
`Ini adalah checkout simulasi. Tidak ada transaksi atau penarikan dana nyata.`

## Interface States

### Loading
**Title:** `Menyiapkan paket...`  
**ARIA:** `Sedang memuat ringkasan top up.`

### Email Empty
**Message:** `Masukkan email agar bukti pembelian bisa ditampilkan.`

### Email Invalid
**Message:** `Format email belum sesuai. Coba cek lagi alamatnya.`

### Payment Method Not Selected
**Message:** `Pilih satu metode pembayaran untuk melanjutkan.`

### QRIS Waiting
**Title:** `Tunggu konfirmasi QRIS`  
**Body:** `Pindai kode mock untuk melihat alur pembayaran.`

### Payment Success
**Title:** `Saldo nyala!`  
**Body:** `Paket Rp100.000 sudah tercatat di simulasi ini. Kamu bisa kembali lanjut membangun.`

**Secondary:** `Kembali ke proyek`

**Notice:** `Pembayaran ini hanya simulasi.`

### Payment Failed
**Title:** `Pembayaran belum berhasil`  
**Body:** `Tidak ada saldo yang terpotong pada prototipe ini. Pilih metode lain atau coba lagi.`

**CTA:** `Coba lagi`

### Timeout
**Title:** `Waktunya habis`  
**Body:** `Pembayaran belum dikonfirmasi. Kamu bisa membuat ringkasan baru tanpa kehilangan pilihan paket.`

**CTA:** `Buat ulang top up`

### Package Selection
**Title:** `Paket paling pas`  
**Body:** `Untuk kebutuhan belajar dan proyek pertama, paket Mulai adalah titik awal yang ringan.`

### Returning User
**Title:** `Lanjut dari mana kamu berhenti?`  
**Body:** `Kamu bisa memilih paket lagi atau melihat riwayat saldo pada prototype dashboard.`

### Out of Stock / Unavailable
**Title:** `Paket sementara tidak tersedia`  
**Body:** `Pilih paket lain atau kembali lagi nanti.`

### Mobile Menu Open
**Label:** `Buka menu`

**Opened label:** `Tutup menu`

## FAQ Copy

### Kapan saldo aktif?
`Pada produk nyata, saldo dapat aktif setelah pembayaran dikonfirmasi. Pada prototype ini, tombol konfirmasi hanya menampilkan status sukses simulasi.`

### Berapa banyak sesi yang bisa digunakan?
`Tidak ada angka pasti karena panjang prompt, model, dan format output memengaruhi penggunaan. Estimasi di halaman adalah contoh berdasarkan kebutuhan kecil.`

### Metode apa yang tersedia?
`Konsep checkout mencakup QRIS, e-wallet, dan virtual account.`

### Bisakah membeli untuk tim?
`Paket kecil cocok untuk penggunaan individu. Untuk kebutuhan tim, akses riwayat, dan invoice dapat ditempatkan pada paket atau area lanjutan.`

### Apakah ada refund?
`Prototype belum memiliki transaksi nyata. Kebijakan refund dan masa aktif perlu ditetapkan sebelum produk diluncurkan.`

## Error and Empty States

### Empty Balance
**Title:** `Saldo belum terisi`  
**Body:** `Pilih paket yang paling cocok, lalu lanjutkan ke pembayaran.`

**CTA:** `Isi saldo`

### Dashboard Error
**Title:** `Status saldo belum dapat ditampilkan`  
**Body:** `Kamu tetap bisa membuat top up baru. Coba muat ulang sebentar lagi.`

**CTA:** `Muat ulang`

### Support
**Title:** `Ada yang belum pas?`  
**Body:** `Ceritakan masalah pembelianmu dan tim akan membantu.`

## Bilingual Rules

- Jangan menerjemahkan merek atau package names secara literal.
- “Nyala” tetap menjadi brand term dalam English copy dan dapat digunakan sebagai metaphor.
- English copy tetap natural: `Top up`, `Prototype`, `Work`, dan `Balance` diperbolehkan jika lebih ringkas.
- Avoid mixed Indonesian-English text inside a sentence unless it is a familiar UI term.
- Package names `Mulai`, `Bangun`, dan `Scale` dapat tetap konsisten pada ID dan EN.
