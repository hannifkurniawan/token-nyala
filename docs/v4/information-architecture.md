# Information Architecture v4

Tiga halaman HTML yang berbagi header, token, i18n, data, dan saldo mock:

| Halaman | File | Tujuan |
|---|---|---|
| Landing | `v4/index.html` | Meyakinkan & mengarahkan ke resep |
| Harga | `v4/harga.html` | Semua harga + kalkulator resep |
| Console (mock) | `v4/app.html` | Alur nyata: masuk → isi saldo → nyalakan → kelola |

Prinsip: **tujuan dulu, layanan kemudian, detail teknis terakhir (bisa dibuka)**. Setiap CTA “Mulai bangun” membawa resep yang sedang dipilih ke console (`app.html#/buat?resep=portofolio`).

---

## 1. Navigasi Global (landing & harga)

| Elemen | Mobile (<1024) | Desktop (≥1024) |
|---|---|---|
| Logo | Kiri | Kiri |
| Menu | Tombol menu → panel: Layanan, Harga, Template, Belajar, FAQ, bahasa ID/EN, Masuk, **Mulai bangun** | Layanan · Harga · Template · Belajar · FAQ |
| Bahasa | Di panel menu | Segmented ID/EN |
| Masuk | Di panel menu | Link “Masuk” |
| CTA | **Mulai bangun** (mulai `sm:`) | **Mulai bangun** |

Footer: Jelajahi (Layanan, Harga, Template, Belajar), Untuk tim, Bantuan & legal (Syarat & Ketentuan, Kebijakan Privasi — mock), label prototype.

---

## 2. Landing `index.html`

| # | Section | id | Isi | CTA |
|---|---|---|---|---|
| 1 | Hero | `top` | Kicker “Untuk ide, prototype, dan proyekmu” · H1 tagline dengan saklar · lead · board “dari prompt sampai online” (prompt → membangun → online di `eventku.my.id`) · 3 jaminan (Bayar Rupiah · Tanpa kartu kredit · Mulai Rp15 rb) | **Mulai bangun**, Lihat harga |
| 2 | Cerita macet | `cerita` | Strip singkat: “Kode sudah jadi, tapi belum bisa dibuka orang lain.” → nyala. (evolusi “stall story” showcase v2) | — |
| 3 | **Mau bikin apa?** | `resep` | Chip 5 resep → kartu resep: isi layanan (ikon + nama awam), biaya tetap, biaya pakai, total ≈ per bulan, top-up disarankan, “cukup ±N bulan” | **Nyalakan resep ini** → `app.html#/buat?resep=…`; Ubah di kalkulator → `harga.html?resep=…#kalkulator`. Kartu `ai-coding` → **Ambil API key** `app.html#/ai?isi=1` |
| 4 | Cara kerja | `cara-kerja` | 3 langkah: Pilih tujuan → Isi saldo Rupiah → Nyala & online | — |
| 5 | Semua layanan | `layanan` | 4 kelompok (Bangun dengan AI · Jalankan · Simpan · Hubungkan), 10 kartu: nama awam + label teknis kecil + “mulai dari” | Lihat semua harga |
| 6 | Satu saldo Rupiah | `saldo` | Pembeda: satu saldo untuk semua, tanpa USD/kartu kredit, biaya tetap vs pakai, “cukup sampai tanggal”, aturan saldo (chip) + animasi saldo terpotong per layanan | Isi saldo |
| 7 | Template siap pakai | `template` | 5 template apps (Chatbot WhatsApp, n8n, Agent 24 jam, Dify, WordPress) + ukuran minimum | Pakai template → `app.html#/buat?template=…` (`wa-bot`, `n8n`, `agent`, `dify`, `wordpress`) |
| 8 | AI untuk tool-mu | `ai` | Kartu model (v3), “≈ N sesi / Rp10.000”, panduan pasang 3 langkah (Base URL + key), katalog dialog | Lihat semua model |
| 9 | Contoh proyek | `contoh` | Landing page event: tahap bangun → online → alamat web, total Rp40.790–54.020, top-up Rp50.000 cukup | Nyalakan contoh ini |
| 10 | Aman untuk pemula | `aman` | Kartu bertumpuk (stack v2): Berhenti kapan saja · Ganti ukuran · Dijeda bukan dihapus · Pengingat saldo | — |
| 11 | Belajar | `belajar` | 3–4 panduan singkat per tujuan (mock, buka di console Belajar) | Buka panduan |
| 12 | Untuk tim & bisnis | `tim` | Invoice perusahaan, faktur pajak, transfer bank, pemakaian per anggota, limit per proyek (v3) | Konsultasi untuk tim (dialog v3) |
| 13 | FAQ | `faq` | 13 pertanyaan (`microcopy.md` §6: 7 dari v3 + 6 baru) | Tanya Nala |
| 14 | CTA akhir | `nyala` | “Idemu nyala.” + Mulai bangun + Lihat harga | |

Overlay landing: menu mobile, **katalog model** (v3), **konsultasi tim** (v3), **chat Nala**.

---

## 3. Harga `harga.html`

| # | Bagian | Isi |
|---|---|---|
| 1 | Kepala | “Satu saldo Rupiah. Bayar yang kamu pakai.” + 3 jaminan (termasuk PPN, tanpa kartu kredit, biaya tambahan Rp0) |
| 2 | **Kalkulator resep** | Pilih resep → daftar layanan yang bisa diubah (ukuran, on/off, jumlah sesi/pesan/tugas) → ringkasan lengket: tetap / pakai / tahunan / per bulan / bulan pertama / top-up disarankan | CTA “Nyalakan” → console wizard dengan isi kalkulator |
| 3 | Ringkasan “mulai dari” | 10 kartu kecil, anchor ke detail |
| 4 | Detail per layanan | Tabel ukuran awam (“cukup untuk”), spesifikasi di `<details>` |
| 5 | AI | Tabel model (level, ≈ sesi/Rp10.000), Kredit/1 jt di `<details>`, tiga satuan estimasi |
| 6 | Saldo & tagihan | Top-up + bonus, aturan tagihan (tetap/tahunan/pakai, perpanjang, dijeda, berhenti, ganti ukuran) |
| 7 | FAQ harga | 5 pertanyaan khusus harga |

Navigasi di halaman (mobile): bar chip horizontal lengket (Kalkulator · AI · Jalankan · Simpan · Hubungkan · Saldo).

---

## 4. Console `app.html` (hash router)

### Kerangka
| Area | Mobile | Desktop (≥1024) |
|---|---|---|
| Header | Logo kecil · **pil saldo** (Rp + titik status) · avatar | Sama + tombol Isi saldo |
| Navigasi | **Bottom tab bar 5 item**: Beranda · Proyek · **Buat (+)** · Saldo · Lainnya | Sidebar: Beranda, Proyek, Buat baru, AI, Saldo, Layanan (Server, Data, File, Domain, Email, Pembayaran), Belajar, Bantuan |
| Menu Akun | Sheet **Lainnya**: AI, Layanan lain, Belajar, Bantuan, lalu Akun: Bahasa, Mulai ulang demo, Simulasi: majukan 30 hari, Keluar | **Menu avatar** (header): Bahasa, Mulai ulang demo, Simulasi: majukan 30 hari, Keluar · badge “Mode demo” |

### Rute
| Rute | Layar | Isi utama |
|---|---|---|
| `#/masuk` | Masuk | Satu field email/HP (v3) → kode 6 digit mock → nama tampilan |
| `#/beranda` | Beranda | Saldo besar + “cukup sampai ±tanggal”, biaya tetap bulan ini, proyek aktif (status nyala/dijeda), **langkah berikutnya** (kartu kontekstual), panduan singkat. Akun baru: empty state “Mau bikin apa?” |
| `#/buat` | Wizard (4 langkah) | 1 Tujuan (resep / mulai kosong) → 2 Atur (ukuran awam per layanan, nama proyek, alamat web) → 3 **Ringkasan biaya** (tetap/pakai/tahunan, saldo setelahnya; kurang saldo → isi saldo inline) → 4 **Menyalakan** (progres bertahap) → selesai: link live + langkah berikutnya |
| `#/proyek` | Daftar proyek | Kartu per proyek: nama, layanan (ikon), status, biaya/bulan |
| `#/proyek/:id` | Detail proyek | Tab: Ringkasan (link, status, pemakaian) · Layanan (per layanan: ganti ukuran, hentikan / matikan perpanjangan domain, nyalakan lagi) · AI (key proyek + limit) · Log · Pengaturan (alamat web, **Hentikan proyek**) |
| `#/ai` | AI | Tab: Mulai cepat (Base URL + key) · Coba AI (chat) · Model · Pemakaian · API key |
| `#/saldo` | Saldo | Saldo + Isi saldo (checkout v3 sebagai sheet) · perkiraan · **Riwayat** (filter per layanan/proyek) · pengingat saldo · invoice (mock) |
| `#/layanan/:id` | Layanan lain | Pola sama: daftar → **Tambah** → form awam + ringkasan lengket → nyala. `server`, `database`, `storage`, `domain`, `email`, `payments` |
| `#/belajar` | Belajar | Panduan per tujuan (langkah + tips), terhubung ke wizard |
| `#/bantuan` | Bantuan | FAQ singkat + buka Nala |

Overlay console: **Isi saldo** (checkout v3: paket → bayar → sukses), konfirmasi berhenti/ganti ukuran, salin kredensial, Nala.

### Status layanan
`menyalakan` → `nyala` → (`dijeda` saat saldo kurang) → `berhenti`. Warna & ikon: lihat `visual-direction.md`.

---

## 5. Entry Point Silang

| Dari | Ke |
|---|---|
| Landing resep / contoh / template “Nyalakan” | `app.html#/buat?resep=…` (atau `?template=…`) |
| Landing “Isi saldo” | `app.html#/saldo?isi=1` |
| Landing AI “Ambil API key” | `app.html#/ai` |
| Harga kalkulator “Nyalakan” | `app.html#/buat?resep=…&s=…` (skema `s`: `services-and-pricing.md` §6) |
| Landing/Beranda chip “AI coding saja” | `app.html#/ai?isi=1` (bukan wizard) |
| Console belum masuk | `#/masuk` lalu kembali ke rute tujuan |
| Nala “pilih resep” | Kartu resep di chat → wizard |

## 6. Live Chat Nala
Pill “Butuh bantuan?” di semua halaman (di console di atas tab bar). Alur baru: **“Bantu pilih resep”** (3 pertanyaan: mau bikin apa, sudah ada kodenya?, kira-kira berapa pengunjung/pesan) → kartu resep → wizard. Alur v3 (paket AI, tim online/offline, serah ke Sari) tetap.
