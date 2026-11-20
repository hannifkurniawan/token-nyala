# Wireframes v4

> Mobile first: wireframe **375px** adalah sumber utama. Desktop hanya menunjukkan cara layout **melebar**. Copy final ada di `microcopy.md`; angka di `services-and-pricing.md`. Lembar warna (sheet) mengikuti `visual-direction.md`.

---

## A. Landing

### A1. Hero (375px, above the fold)
```text
┌─────────────────────────────────┐
│ [mark] TokenNyala  [Mulai][☰]   │ header 64px sticky; [Mulai] mulai sm:
├─────────────────────────────────┤
│ ● UNTUK IDE, PROTOTYPE, PROYEK  │ kicker mono
│                                 │
│ Idemu [◯━━] nyala,              │ H1 display, saklar inline (dekor,
│ dari prompt                     │ aria-hidden) menyala saat load
│ sampai online.                  │ (statis saat reduced motion)
│                                 │
│ AI untuk membangun, cloud untuk │ lead 16px, maks 3 baris
│ menjalankan. Satu saldo Rupiah. │
│                                 │
│ [ Mulai bangun            → ]   │ primary full width 52px
│ [ Lihat harga               ]   │ ghost full width
│ — Bayar Rupiah — Tanpa kartu    │ trust row mono, wrap
│   kredit — Mulai Rp15 rb        │
└─────────────────────────────────┘
  ↓
┌ Board “dari prompt sampai online” ┐ aspect-[4/3], lebar penuh
│ ① PROMPT  “Buat landing event…”   │ 3 baris status bergantian:
│ ② MEMBANGUN ▓▓▓▓▓░  komponen…     │ prompt → membangun → online
│ ③ ONLINE  🔒 eventku.my.id  ● Nyala│
│ Saldo  Rp55.000 → sisa Rp12.320   │
└───────────────────────────────────┘
```
Aturan: H1 + **Mulai bangun** terlihat tanpa scroll di 320×640 dan 375×667.

### A2. Cerita macet (sheet dark, pendek)
```text
KODE SUDAH JADI.                    mono kecil
Tapi belum bisa dibuka              display
orang lain.
[saklar off] → [saklar ON]          scroll-linked di desktop; mobile: statis 2 kartu
Sekarang: eventku.my.id ● Nyala
```

### A3. Mau bikin apa? (sheet blue) — inti landing
```text
(01) MAU BIKIN APA?
Mulai dari tujuanmu,
bukan dari menu.

[Landing page] [Chatbot WA] [Web klien] → scroll horizontal chip (radiogroup / tablist),
[Otomasi tim] [AI coding saja]           gutter kanan terlihat sebagian = bisa digeser

┌───────────────────────────────┐ kartu resep (putih di atas biru)
│ LANDING PAGE / PORTOFOLIO     │
│ ≈ Rp34 rb /bulan              │ angka besar
│ Bulan pertama Rp38.900        │ termasuk alamat web 1 tahun
│ ───────────────────────────── │
│ ▣ Online-kan proyekmu         │ ikon + nama awam
│   Coba-coba · Rp15.000/30 hari│
│ ◎ Alamat web .my.id           │
│   Rp5.000 tahun pertama       │
│ ✦ AI untuk tool-mu            │
│   ±10 sesi kecil · ±Rp18.900  │ “perkiraan” (label kecil)
│ ───────────────────────────── │
│ Isi Rp50.000 → cukup ±1 bulan │ chip kuning
│ [ Nyalakan resep ini      → ] │ primary
│ Ubah di kalkulator →          │ link → harga.html#kalkulator?resep=
└───────────────────────────────┘
Perkiraan. Pemakaian AI bergantung pada model dan prompt.
```
`md:` chip wrap 1 baris + kartu 2 kolom (isi | ringkasan). `lg:` kiri: judul + chip vertikal; kanan: kartu.

### A4. Cara kerja — 3 kartu stacked (01/02/03 angka outline v2)
Pilih tujuan → Isi saldo Rupiah → Nyala & online. `lg:` geser horizontal (v2) dengan tombol ←/→.

### A5. Semua layanan (sheet paper)
```text
(02) SEMUA LAYANAN
Semua yang dibutuhkan
proyekmu, satu tempat.

BANGUN DENGAN AI                    sub-kelompok mono
┌──────────────┐┌──────────────┐    grid-cols-1 → sm:2 → lg:4
│ ✦            ││ 💬            │   kartu: ikon, nama awam (bold),
│ AI untuk     ││ Coba AI       │   label teknis (mono kecil),
│ tool-mu      ││ chat          │   “mulai dari” (angka)
│ AI API       ││ Sesuai pakai  │
│ Sesuai pakai │└──────────────┘
└──────────────┘
JALANKAN  · Online-kan proyekmu Rp15 rb · Asisten & otomasi Rp15 rb · Server sendiri Rp65 rb
SIMPAN    · Tempat simpan data Rp10 rb · Tempat simpan file Rp7 rb
HUBUNGKAN · Alamat web Rp5 rb/thn · Email Gratis · Terima pembayaran 0,7%
[ Lihat semua harga → ]
```

### A6. Satu saldo Rupiah (sheet yellow)
```text
(03) SATU SALDO
Satu saldo Rupiah
untuk semuanya.
┌ saldo dompet ───────────────┐  animasi potong (statis saat reduced motion)
│ Rp55.000                    │
│ − Online-kan · 30 hari  15.000│
│ − Alamat web · 1 tahun   5.000│
│ − AI · 12 sesi          22.680│
│ Sisa Rp12.320 · cukup sampai ±…│
└─────────────────────────────┘
[1 kredit = Rp1][Termasuk PPN][Tidak kedaluwarsa][Tanpa USD]  chip
Biaya tetap = dipotong per 30 hari · Biaya pakai = AI, sesuai pemakaian
[ Isi saldo ]
```

### A7. Template (sheet white) — kartu 5 template, label ukuran minimum, CTA “Pakai template”.
### A8. AI untuk tool-mu (sheet dark) — reuse v3/v2: 6 kartu model + 3 langkah pasang + konfigurasi contoh.
### A9. Contoh proyek — tabel 3 tahap (Bangun · Online · Alamat), total, “Rp50.000 cukup sampai online”, CTA.
### A10. Aman untuk pemula — stack card v2 (4 kartu warna: sky, yellow, teal, blue), sticky di `lg:`.
### A11. Belajar — 3 kartu panduan (judul, durasi baca, tujuan).
### A12–14. Tim (v3) · FAQ (v3 pola `<details>`) · CTA akhir (sheet blue, saklar besar).

### Desktop (≥1024)
Hero 2 kolom (judul kiri, board kanan). Resep: judul + chip kiri (sticky), kartu kanan. Layanan 4 kolom. Saldo 2 kolom (copy | dompet). Konten maks 1280px, gutter 16/24/40/64 (`visual-direction.md` §4).

---

## B. Harga

### B1. Kalkulator (375px)
```text
HARGA
Satu saldo Rupiah.
Bayar yang kamu pakai.
— Termasuk PPN — Tanpa kartu kredit — Biaya tambahan Rp0

[Kalkulator][AI][Jalankan][Simpan][Hubungkan][Saldo]   chip nav lengket (scroll-x)

KALKULATOR
Resep: [Landing page / portofolio ▾]   select

▣ Online-kan proyekmu        [on]      switch on/off per layanan
  ( Coba-coba | Rutin | Ramai )        segmented ukuran
  Cukup untuk portofolio · ±1.000 pengunjung/hari
◎ Alamat web  [.my.id ▾]     [on]
✦ AI · sesi kecil  [ − 10 + ]          stepper (langkah 5)
+ Tambah layanan                        sheet daftar layanan

┌ ringkasan — sticky bottom (mobile) ┐  ringkas: “≈ Rp34 rb/bulan  [Rincian ▴] [Nyalakan]”
│ Biaya tetap        Rp15.000 /bln   │  dibuka: rincian lengkap
│ Perkiraan pakai    Rp18.900 /bln   │
│ Tahunan            Rp5.000         │
│ Per bulan          Rp33.900        │
│ Bulan pertama      Rp38.900        │
│ Isi Rp50.000 → cukup ±1 bulan      │
│ [ Nyalakan → ]                     │
└────────────────────────────────────┘
```
`lg:` 2 kolom: editor kiri, ringkasan sticky kanan (pola Sumopod Deployment Summary).

### B2. Detail layanan
Per layanan: judul awam + label teknis, tabel ukuran (nama awam · cukup untuk · harga), `<details>` spesifikasi. Mobile: tabel jadi kartu baris.

---

## C. Console

### C1. Kerangka mobile
```text
┌─────────────────────────────────┐
│ [mark]        (● Rp35.000) [A]  │ header 56px; pil saldo → #/saldo
├─────────────────────────────────┤
│                                 │
│            konten               │ padding bawah = tinggi tab bar + safe area
│                                 │
├─────────────────────────────────┤
│ ⌂ Beranda  ▦ Proyek  (+)  ◉ Saldo  ⋯ │ tab bar 64px + env(safe-area-inset-bottom)
└─────────────────────────────────┘    (+) Buat = tombol bulat kuning menonjol
```
Desktop: sidebar kiri 248px, konten maks 960px.

### C2. Beranda — akun baru (empty)
```text
Hai, Ayu 👋
Mau bikin apa hari ini?
[ chip 5 resep ]                 → #/buat?resep=
┌ Saldo Rp0 ──────────────┐
│ Isi saldo untuk mulai.  │
│ [ Isi saldo ]           │
└─────────────────────────┘
Belajar: “Portofolio online dalam 5 menit” →
```

### C3. Beranda — berisi
```text
┌ sheet blue ───────────────────┐
│ SALDO                         │
│ Rp35.000                      │ angka besar, count-up
│ Cukup sampai ±12 Des          │
│ [ Isi saldo ]  Riwayat →      │
└───────────────────────────────┘
LANGKAH BERIKUTNYA                 1 kartu kontekstual
┌───────────────────────────────┐
│ Pakai AI di Lovable/Cursor    │
│ Salin API key proyekmu.  [→]  │
└───────────────────────────────┘
PROYEK (1)
┌───────────────────────────────┐
│ portofolio-ayu        ● Nyala │
│ ayu.my.id ↗                   │
│ ▣ ◎ ✦   Rp15.000/bln · 23 hari│ sisa hari sampai perpanjang
└───────────────────────────────┘
BULAN INI  tetap Rp15.000 · pakai Rp3.780 (2 sesi)
```
Banner kondisional di atas: saldo kurang untuk perpanjang (kuning), layanan dijeda (kuning tua + CTA).

### C4. Wizard `#/buat` (4 langkah, progress “1/4” mono + bar)
```text
1 MAU BIKIN APA?
  ○ Landing page / portofolio   ≈ Rp34 rb/bln     radiogroup kartu
  ○ Chatbot WhatsApp            ≈ Rp47 rb/bln
  ○ Website klien               ≈ Rp102 rb/bln
  ○ Otomasi tim                 ≈ Rp285 rb/bln
  ○ Mulai kosong (pilih layanan sendiri)
  ○ Template siap pakai →
  [ Lanjut ]                                      sticky bottom

2 ATUR
  Nama proyek [portofolio-ayu      ]
  ▣ Online-kan proyekmu  ( Coba-coba | Rutin | Ramai )
     Sumber: ( Upload folder | GitHub )
  ◎ Alamat web [ayu        ][.my.id ▾] ✓ Tersedia · Rp5.000
     atau pakai gratis: portofolio-ayu.tokennyala.app
  ✦ AI: key proyek dibuat otomatis · limit [Rp50.000 ▾]
  ▸ Detail teknis                                <details>

3 RINGKASAN
  Dipotong sekarang
   Online-kan · 30 hari       Rp15.000
   Alamat web · 1 tahun        Rp5.000
   ────────────────────────────────
   Total sekarang             Rp20.000
  Nanti, sesuai pakai: AI ±Rp1.890/sesi
  Saldo: Rp0 → kurang Rp20.000
  [ Isi saldo Rp50.000 → ]   sheet checkout v3 inline, kembali ke langkah 3
  …setelah isi: Saldo Rp55.000 → Rp35.000 setelah nyala
  [ Nyalakan sekarang ]

4 MENYALAKAN
  ✓ Menyiapkan ruang
  ✓ Memasang alamat ayu.my.id
  ◌ Mengaktifkan HTTPS…            aria-live polite
  [saklar besar → ON]  “Nyala!”
  ayu.my.id ↗   [Salin link]
  Berikutnya: [Upload hasil Lovable] [Salin API key] [Ke beranda]
```

### C5. Detail proyek — header (nama, status, link, biaya/bln, sisa hari) + tab scroll-x: Ringkasan · Layanan · AI · Log · Pengaturan. Aksi destruktif (Berhenti) di Pengaturan dengan dialog yang menampilkan **sisa saldo kembali**.

### C6. Saldo
```text
SALDO Rp35.000   Cukup sampai ±12 Des
[ Isi saldo ]  [ Pengingat: < Rp20.000 ● ]
RIWAYAT   [Semua ▾][Semua proyek ▾]
 20 Nov  + Isi saldo QRIS          +55.000
 20 Nov  − Online-kan · portofolio −15.000
 20 Nov  − Alamat web ayu.my.id     −5.000
 21 Nov  − AI · 2 sesi              −3.780
[ Unduh invoice (contoh) ]
```

### C7. AI — tab Mulai cepat (Base URL + key + salin, v3), Coba AI (chat: model selector, contoh prompt, biaya per pesan terlihat), Model (kartu v3), Pemakaian (grafik 7 hari v3), API key (per proyek, limit Rp, nonaktifkan).

### C8. Layanan lain — pola satu template
```text
SERVER SENDIRI                   [ + Tambah ]
(empty) Belum ada server. Cocok kalau kamu butuh kontrol penuh. Kalau cuma
        mau online-kan proyek, pakai “Online-kan proyekmu” saja →
Form Tambah: nama · ukuran awam (kartu) · lokasi (Jakarta ✓ / Singapura) ·
             sistem (Ubuntu / dengan panel) · ▸ detail teknis
             ringkasan lengket: Rp65.000 / 30 hari · saldo setelahnya · [Nyalakan]
Sukses: alamat IP · username · password (sekali tampil, salin) · Web console (mock)
```
Empty state setiap layanan **mengarahkan pemula ke pilihan yang lebih mudah** bila ada.

### C9. Masuk
Satu field email/HP (aturan v3) → 6 kotak kode (mock, kode apa pun 6 digit diterima; kode contoh ditampilkan) → nama tampilan. Tanpa captcha di prototype.
