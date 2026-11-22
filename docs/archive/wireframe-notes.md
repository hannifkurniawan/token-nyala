# Wireframe Notes

> Mobile first: wireframe mobile (375px) adalah sumber utama. Wireframe desktop di bawahnya hanya menunjukkan bagaimana layout **melebar**, bukan desain terpisah.

## Mobile — Above the Fold (375px)

```text
┌─────────────────────────────────┐
│ [mark] TokenNyala      [☰ Menu] │  header 64px, sticky
├─────────────────────────────────┤
│ • Untuk ide, prototype, proyek  │  eyebrow
│                                 │
│ Mulai vibecoding.               │  H1 40px, max 4 baris
│ Jangan berhenti di              │
│ tengah jalan.                   │
│                                 │
│ Isi saldo AI dengan mudah…      │  lead 16px
│                                 │
│ [ Isi saldo              → ]    │  primary, full width, 52px
│   Lihat cara kerjanya           │  text link, 44px tap area
│                                 │
│ ✓ Bayar lokal  ✓ Aktif cepat    │  trust row, wrap
│ ✓ Ada bukti transaksi           │
└─────────────────────────────────┘
  ↓ scroll
[ Compact project preview — aspect-ratio 4/3, lebar penuh ]
[ Saldo meter ]
```

Aturan: H1 dan CTA utama harus terlihat tanpa scroll di 375×667. Ilustrasi boleh di bawah fold.

## Mobile — Package Picker

```text
Berapa yang ingin kamu nyalakan?

[ Belajar | Prototype | Kerja ]     tablist, full width, 3 tombol sama lebar

┌ ✦ Paling pas untuk belajar: Mulai · Rp50.000 ┐   baris rekomendasi (aria-live)
│ Titik awal yang ringan…      [ Pilih Rp50.000 ] │   aksi tanpa perlu scroll ke kartu
└─────────────────────────────────────────────┘

┌─────────────────────────────┐
│ ★ Paling pas                 │  hanya pada kartu rekomendasi
│ Bangun                       │
│ Rp100.000                    │
│ + Bonus Rp15.000             │
│ Sekitar 40–60 sesi kecil     │
│ Cocok untuk prototype aktif  │
│ [ Pilih Rp100.000         ]  │
└─────────────────────────────┘
[ kartu Mulai ]                  kartu stacked, urutan tetap berdasarkan harga
[ kartu Scale ]                  (bukan rekomendasi dulu: urutan visual = urutan fokus keyboard)

Estimasi bergantung pada model, panjang prompt…   disclaimer kecil
```

## Mobile — Checkout Bottom Sheet

```text
┌─────────────────────────────────┐
│            ───                  │  drag handle (visual saja)
│ Ringkas top up            [ ✕ ] │
│                                 │
│ Paket Bangun        Rp100.000   │  ringkasan
│ Bonus                Rp15.000   │
│ Biaya                   Rp0     │
│ Total               Rp100.000   │
│                                 │
│ Email atau nomor HP             │
│ [ nama@email.com / 0812…     ]  │
│ Bukti pembelian dikirim ke sini │
│                                 │
│ Bayar dengan                    │
│ ( ) QRIS                        │  1 kolom; 2 kolom mulai sm:
│ ( ) E-Wallet                    │
│ ( ) Virtual Account             │
├─────────────────────────────────┤
│ [ Konfirmasi pembayaran      ]  │  sticky di bawah, aman dari safe-area
└─────────────────────────────────┘
max-height 90dvh, isi scroll di dalam sheet
```

## Mobile — Model AI (G1, G5)

```text
MODEL AI
Satu saldo untuk semua model.
Paket apa pun, pilihan modelnya sama…

┌─────────────────────────────┐
│ (A) Claude Sonnet [Seimbang]│
│ Anthropic · Coding          │
│ ≈ 5 sesi kecil / Rp10.000   │
│ ▸ Detail tarif              │
└─────────────────────────────┘
[ GPT ]  [ Gemini Pro ]  [ DeepSeek Chat ]   kartu stacked, 6 total
[ Qwen Plus ]  [ Claude Opus ]               md: 2 kolom · lg: 3 kolom

[ Lihat semua model & tarif ]                tombol secondary, full width
1 sesi kecil ≈ … Contoh — dapat berubah.     catatan kecil
```

## Mobile — Katalog Model (full screen)

```text
┌─────────────────────────────────┐
│ Model AI yang tersedia    [ ✕ ] │  sticky
│ Satu saldo untuk semua model…   │
│ [🔍 Cari model, misalnya Claude]│  sticky
│ Kegunaan: [Coding][Chat][Anal…]→│  chip row, scroll di dalam baris
│ Level:    [Hemat][Seimbang][Pr…]│
│ Penyedia: [Anthropic][OpenAI]… →│
├─────────────────────────────────┤
│ Menampilkan 6 dari 12 model     │  aria-live
│ [ kartu model ]                 │
│ [ kartu model ]                 │  1 kolom, scroll
│ …                               │
│ [ Tampilkan lebih banyak ]      │
│ Contoh — daftar dan tarif dapat │
│ berubah.                        │
└─────────────────────────────────┘
```

## Mobile — Pakai di Tool Favoritmu (G3)

```text
Pakai di tool favoritmu.
API key adalah kunci yang menghubungkan…

(1) Salin API key
(2) Tempel di tool                   langkah vertikal dengan garis penghubung
(3) Pilih model & mulai

┌ Contoh konfigurasi ─────────────┐
│ Base URL                        │  label di atas nilai (bukan sejajar)
│ api.tokennyala.example/v1 [Salin]│  font mono, wrap/break-all
│ API key                         │
│ tn-demo-••••3f9a        [Salin] │
└─────────────────────────────────┘
Contoh: Cursor, Cline, Continue
```

## Mobile — Untuk Tim & Bisnis (G7)

```text
┌─────────────────────────────────┐  kartu XL Dark, teks putih
│ Butuh untuk tim atau perusahaan?│
│ ✓ Invoice atas nama perusahaan  │
│ ✓ Faktur pajak                  │
│ ✓ Bayar lewat transfer bank     │
│ ✓ Pantau pemakaian tiap anggota │
│ [ Konsultasi untuk tim        ] │  full width
└─────────────────────────────────┘
```

Form konsultasi = bottom sheet seperti checkout, satu kolom; `md:` dialog dengan Nama + Nama tim berdampingan, Email/HP selebar penuh (placeholder kontak terpotong kalau dibuat 2 kolom).

## Mobile — Live Chat Nala (G4)

```text
Tertutup:                          Terbuka (full screen):
                                   ┌─────────────────────────────────┐
                                   │ (N) Nala              [↻] [ ✕ ] │
                                   │     Asisten otomatis            │
                                   ├─────────────────────────────────┤
                                   │ ┌─────────────────────────┐     │
                                   │ │Hai, aku Nala! Mau dibantu│     │
                                   │ │pilih paket…              │     │
                                   │ └─────────────────────────┘     │
                                   │              ┌──────────────┐   │
                                   │              │Bantu pilih   │   │  pesan user kanan
                                   │              │paket         │   │
                                   │              └──────────────┘   │
                                   │ Kamu mau pakai AI untuk apa?    │
                                   ├─────────────────────────────────┤
                                   │ [Belajar] [Prototype] [Kerja]   │  chip wrap
                         ┌───────┐ │ [ Tulis pertanyaanmu…    ] [➤]  │
                         │💬 Butuh│ │ Nala adalah asisten otomatis   │
                         │bantuan?│ │ (simulasi). Jawaban bisa kurang│
                         └───────┘ │ tepat.                          │
  pill kanan bawah,                └─────────────────────────────────┘
  di atas safe-area                md: panel 380×560 kanan bawah
```

## Desktop Above the Fold

```text
[ Logo TokenNyala ]  Cara kerja | Paket | FAQ | EN/ID | [ Isi saldo ]

[ Headline: Mulai vibecoding.
  Jangan berhenti karena bingung top up. ]

[ Supporting copy ] [ CTA Isi saldo ] [ Lihat cara kerja ]

[ Trust: Bayar lokal | Aktif cepat | Terima bukti ]

                         [ Abstract project preview ]
                         [ Credit meter ]
                         [ “Saldo siap” status ]
```

## Package Section

```text
Berapa yang ingin kamu nyalakan?
[Pemula] [Bangun prototype] [Kerja]

[ Rp50.000 ] [ Rp100.000 ] [ Rp250.000 ]
[ Estimate ] [ Estimate ] [ Estimate ]
[ “Paling fleksibel” ] [ Recommended ]
```

## Checkout Bottom/Modal

```text
[ Close ]
Ringkas top up

Paket Prototype       Rp100.000
Bonus                   Rp15.000
Biaya                  Gratis
Total                  Rp100.000

Email atau nomor HP
[ nama@email.com atau 0812xxxxxxxx ]
Bukti pembelian dikirim ke sini.

Bayar dengan
[ QRIS ] [ E-Wallet ] [ Virtual Account ]

[ Konfirmasi pembayaran ]
```

## Why Layout

Use 3 benefit cards with short headlines and one dashboard or project example, rather than a dense feature grid.
