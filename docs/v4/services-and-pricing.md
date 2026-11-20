# Layanan, Harga & Resep — Sumber Tunggal Data v4

Semua angka di landing, halaman Harga, console, dan chat Nala **dihitung dari data di dokumen ini** (di kode: satu file `data.js`). Jika ada angka lain di dokumen v4 yang berbeda, dokumen ini yang benar. Semua harga **ilustratif (mock)**, dalam Rupiah, **sudah termasuk PPN**, dan diberi label “Contoh — harga dapat berubah”.

Posisi harga: di antara Sumopod (paling murah) dan Helipod, dibulatkan ke angka yang mudah diingat.

---

## 1. Aturan Saldo (warisan v3, berlaku untuk semua layanan)

- **Satu saldo Rupiah** untuk semua layanan dan AI. Tidak ada saldo kedua, tidak ada USD.
- 1 kredit = Rp1; harga sudah termasuk PPN.
- Saldo tidak kedaluwarsa; tidak bisa diuangkan atau dipindahkan ke akun lain.
- Request AI yang gagal tanpa output tidak memotong saldo.

### Top-up
| Nominal | Bonus | Saldo masuk |
|---:|---:|---:|
| Rp50.000 | Rp5.000 | 55.000 |
| Rp100.000 | Rp15.000 | 115.000 |
| Rp250.000 | Rp50.000 | 300.000 |
| Rp500.000 | Rp125.000 | 625.000 |
| Bebas (min. Rp20.000) | — | = nominal |

Metode: QRIS, e-wallet (DANA, GoPay, OVO), virtual account (mock, alur checkout v3). Biaya tambahan Rp0.

---

## 2. Aturan Tagihan

| Jenis | Cara dipotong | Contoh layanan |
|---|---|---|
| **Biaya tetap** | Dipotong **di muka per 30 hari** dari saldo saat layanan dibuat | Hosting, asisten & otomasi, server, database, file, email berbayar |
| **Biaya tahunan** | Dipotong di muka per 12 bulan | Domain |
| **Biaya pakai** | Dipotong per pemakaian | AI (sesi, pesan chatbot, tugas otomasi), fee transaksi terima pembayaran |

Aturan ramah pemula (mock, perlu validasi finance/legal sebelum produksi):
1. **Perpanjang otomatis** jika saldo cukup. Pengingat **3 hari** sebelum jatuh tempo jika saldo kurang.
2. **Saldo tidak cukup saat jatuh tempo → layanan dijeda, bukan dihapus.** Data disimpan **7 hari**; isi saldo untuk menyalakan lagi.
3. **Berhenti kapan saja** — sisa hari dikembalikan ke saldo (prorata harian: `harga ÷ 30 × sisa hari`, dibulatkan ke bawah ke Rp100).
4. **Ganti ukuran naik atau turun kapan saja** — selisih prorata dipotong/dikembalikan ke saldo.
5. Domain tidak dikembalikan setelah terdaftar (aturan registrar).
6. Setiap potongan tercatat di **Riwayat saldo** per layanan dan per proyek.

### Perkiraan “saldo cukup sampai”
```
biaya_harian = (Σ biaya tetap aktif ÷ 30) + (rata-rata biaya pakai 7 hari terakhir)
hari_cukup   = floor(saldo ÷ biaya_harian)
tanggal      = hari ini + hari_cukup
```
Ditampilkan di Beranda console: “Saldo cukup sampai **±12 Des**”. Jika `biaya_harian = 0`: “Belum ada layanan yang memakai saldo.”

---

## 3. Satuan Estimasi AI (untuk bahasa awam)

| Satuan | Definisi | Model acuan | Biaya |
|---|---|---|---:|
| **Sesi kecil** (v3) | ±40 rb token masuk + ±4 rb token keluar — satu permintaan perbaikan komponen di tool coding | Seimbang (Claude Sonnet mock: 31.500 / 157.500 per 1 jt) | **Rp1.890** |
| **Pesan chatbot** (baru) | ±1.500 token masuk + ±300 token keluar — satu balasan chatbot WhatsApp | Hemat (DeepSeek Chat mock: 4.500 / 18.000 per 1 jt) | **Rp12** (12,15 dibulatkan) |
| **Tugas otomasi** (baru) | ±3.000 token masuk + ±800 token keluar — satu langkah AI di workflow (rangkum, klasifikasi, tulis balasan) | Hemat (DeepSeek Chat mock) | **Rp28** (27,9 dibulatkan) |

Katalog 12 model, level biaya (Hemat < Rp1.000/sesi ≤ Seimbang ≤ Rp3.000 < Premium), dan “≈ N sesi / Rp10.000” tetap dari `docs/technical-spec.md`.

---

## 4. Ukuran Bersama — Coba-coba / Rutin / Ramai

Dipakai oleh **Online-kan proyekmu** dan **Asisten & otomasi siap pakai** supaya pemula cukup belajar satu skala.

| id | ID | EN | Spesifikasi (di `<details>`) | Harga / 30 hari | Cukup untuk |
|---|---|---|---|---:|---|
| `coba` | **Coba-coba** | **Starter** | 0,5 vCPU · 512 MB RAM · 5 GB | **Rp15.000** | Landing page, portofolio, otomasi sederhana tanpa AI agent · ±1.000 pengunjung/hari |
| `rutin` | **Rutin** | **Steady** | 1 vCPU · 1 GB RAM · 10 GB | **Rp35.000** | Web dengan form & login, chatbot WhatsApp, agent AI · ±5.000 pengunjung/hari |
| `ramai` | **Ramai** | **Busy** | 2 vCPU · 2 GB RAM · 20 GB | **Rp75.000** | Banyak pengunjung, otomasi tim, beberapa workflow sekaligus · ±20.000 pengunjung/hari |

---

## 5. Katalog Layanan

Kelompok (dipakai di landing, harga, dan menu console):
- **Bangun dengan AI:** `ai`, `chat`
- **Jalankan:** `hosting`, `apps`, `server`
- **Simpan:** `database`, `storage`
- **Hubungkan:** `domain`, `email`, `payments`

| id | Nama ID | Nama EN | Label teknis (kecil) | Mulai dari | Satuan |
|---|---|---|---|---|---|
| `ai` | AI untuk tool-mu | AI for your tools | AI API · kompatibel OpenAI | Sesuai pakai | ≈ 5 sesi / Rp10.000 (Seimbang) |
| `chat` | Coba AI | Try AI | Chat playground | Sesuai pakai | dari saldo yang sama |
| `hosting` | Online-kan proyekmu | Put your project online | Hosting aplikasi | Rp15.000 | / 30 hari |
| `apps` | Asisten & otomasi siap pakai | Ready-made assistants & automations | Aplikasi sekali klik | Rp15.000 | / 30 hari |
| `server` | Server sendiri | Your own server | VPS | Rp65.000 | / 30 hari |
| `database` | Tempat simpan data | Data storage | Database terkelola | Rp10.000 | / 30 hari |
| `storage` | Tempat simpan file | File storage | Object storage · kompatibel S3 | Rp7.000 | / 30 hari |
| `domain` | Alamat web | Web address | Domain | Rp5.000 | / tahun pertama |
| `email` | Email dari domainmu | Email from your domain | Email API & SMTP | Gratis | 50 email/hari |
| `payments` | Terima pembayaran | Accept payments | Payment gateway QRIS | Rp0/bulan | 0,7% per transaksi |

### 5.1 `ai` — AI untuk tool-mu
- Endpoint kompatibel OpenAI `https://api.tokennyala.example/v1`, key `tn-…` (contoh, warisan v3).
- **API key per proyek** dengan **limit belanja dalam Rupiah** (opsional) dan pilihan model yang diizinkan.
- Tarif per model: katalog v3. Tampilan utama tetap “≈ N sesi / Rp10.000”; Kredit per 1 jt token di `<details>`.

### 5.2 `chat` — Coba AI
Chat di console untuk mencoba/membandingkan model; dipotong dari saldo yang sama per pemakaian. Contoh prompt disediakan.

### 5.3 `hosting` — Online-kan proyekmu
- Sumber: **Upload folder/ZIP** (hasil Lovable, Bolt, v0) atau **Sambungkan GitHub** (mock).
- Ukuran: tabel bagian 4.
- Termasuk: alamat gratis `namaproyek.tokennyala.app`, HTTPS otomatis, log sederhana, restart.

### 5.4 `apps` — Asisten & otomasi siap pakai
| id | Nama ID | Nama EN | Isi teknis | Ukuran minimum | Butuh AI? |
|---|---|---|---|---|---|
| `chatbot-wa` | Chatbot WhatsApp | WhatsApp chatbot | n8n + gateway WhatsApp | Rutin | Ya (pesan chatbot) |
| `n8n` | Otomasi n8n | n8n automation | n8n | Coba-coba (tanpa AI agent) | Opsional (tugas otomasi) |
| `agent` | Agent AI 24 jam | 24/7 AI agent | OpenClaw | Rutin | Ya (tugas otomasi) |
| `dify` | Aplikasi AI tanpa kode | No-code AI app | Dify | Rutin | Ya |
| `wordpress` | Website WordPress | WordPress website | WordPress | Coba-coba | Tidak |

Ukuran di bawah minimum ditampilkan nonaktif dengan alasan (“Belum cukup untuk chatbot — pilih Rutin”).
Setelah nyala: link admin + username + password dibuat otomatis (ditampilkan, bisa disalin). AI otomatis tersambung ke saldo lewat API key proyek.

### 5.5 `server` — Server sendiri
| id | ID / EN | Spesifikasi | Harga / 30 hari |
|---|---|---|---:|
| `kecil` | Kecil / Small | 2 vCPU · 2 GB · 40 GB · trafik 1 TB | Rp65.000 |
| `sedang` | Sedang / Medium | 2 vCPU · 4 GB · 80 GB · trafik 2 TB | Rp120.000 |
| `besar` | Besar / Large | 4 vCPU · 8 GB · 160 GB · trafik 4 TB | Rp230.000 |

- Lokasi: **Jakarta** (default, “paling dekat dengan pengguna Indonesia”) atau Singapura.
- Sistem: Ubuntu 24.04 (default) atau dengan panel siap pakai (Easypanel).
- **Password dibuatkan otomatis** dan ditampilkan sekali dengan tombol salin (pemula tidak perlu merancang password 12–30 karakter).
- Trafik habis → kecepatan diturunkan, **server tidak dimatikan** (beda dengan Sumopod/Tencent).

### 5.6 `database` — Tempat simpan data
| id | ID / EN | Kapasitas | Harga / 30 hari |
|---|---|---|---:|
| `kecil` | Kecil / Small | 1 GB | Rp10.000 |
| `sedang` | Sedang / Medium | 5 GB | Rp45.000 |
| `besar` | Besar / Large | 20 GB | Rp160.000 |

Mesin: **PostgreSQL** (default, “pilihan aman untuk kebanyakan proyek”) atau MySQL. Backup harian otomatis. Detail koneksi di `<details>` + tombol salin `DATABASE_URL`.

### 5.7 `storage` — Tempat simpan file
| id | Kapasitas | Harga / 30 hari |
|---|---|---:|
| `10gb` | 10 GB | Rp7.000 |
| `100gb` | 100 GB | Rp55.000 |
| `1tb` | 1 TB | Rp450.000 |

### 5.8 `domain` — Alamat web
| Ekstensi | Tahun pertama | Perpanjangan / tahun | Catatan |
|---|---:|---:|---|
| `.my.id` | Rp5.000 | Rp25.000 | Untuk pribadi |
| `.biz.id` | Rp5.000 | Rp25.000 | Untuk usaha kecil |
| `.web.id` | Rp5.000 | Rp25.000 | Untuk website umum |
| `.id` | Rp225.000 | Rp225.000 | |
| `.com` | Rp245.000 | Rp245.000 | |
| `.co.id` | Rp280.000 | Rp280.000 | Perlu dokumen usaha |

Termasuk: DNS, HTTPS, dan **sambung otomatis** ke proyek di TokenNyala (tanpa mengisi record manual). Pengaturan DNS manual di `<details>`.

### 5.9 `email` — Email dari domainmu
| id | ID / EN | Kuota | Harga / 30 hari |
|---|---|---|---:|
| `gratis` | Gratis / Free | 50 email/hari · 1 domain | Rp0 |
| `rutin` | Rutin / Steady | 2.500 email/bulan | Rp25.000 |
| `ramai` | Ramai / Busy | 10.000 email/bulan | Rp75.000 |

### 5.10 `payments` — Terima pembayaran
- Rp0/bulan; **0,7% per transaksi QRIS**; dana masuk H+2; tarik ke rekening Rp2.500 per penarikan.
- Mulai di **mode uji** (sandbox), aktifkan mode live setelah verifikasi usaha.

---

## 6. Resep — “Mau bikin apa?”

Resep = rangkaian layanan + perkiraan pemakaian AI untuk satu tujuan. Ditampilkan dengan **biaya tetap**, **biaya pakai (perkiraan)**, **biaya tahunan**, total per bulan, dan **top-up yang disarankan**.

Rumus:
```
per_bulan     = Σ biaya tetap + biaya pakai
bulan_pertama = per_bulan + Σ biaya tahunan (tahun pertama)
saldo         = nominal top-up + bonus
cukup_bulan   = bulan_pertama > saldo ? 0 : 1 + floor((saldo − bulan_pertama) ÷ per_bulan)
```
Tampilan: “≈ Rp34 rb/bulan” (dibulatkan ke ribuan terdekat, ID “rb” / EN “K”), detail angka penuh di rincian.

| id | Tujuan (ID) | EN | Persona | Isi | Tetap | Pakai (perkiraan) | Tahunan | Per bulan | Bulan pertama | Top-up disarankan | Cukup |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|---|
| `portofolio` | Landing page / portofolio | Landing page / portfolio | Ayu | Online-kan proyekmu **Coba-coba** + domain **.my.id** + AI **10 sesi kecil** | 15.000 | 18.900 | 5.000 | **33.900** | 38.900 | Rp50.000 (55.000) | ±1 bulan |
| `chatbot-wa` | Chatbot WhatsApp | WhatsApp chatbot | Ayu (usaha teman/keluarga) | Chatbot WhatsApp **Rutin** + AI **1.000 pesan chatbot** | 35.000 | 12.000 | 0 | **47.000** | 47.000 | Rp50.000 (55.000) | ±1 bulan |
| `web-klien` | Website klien dengan form | Client website with a form | Raka | Online-kan proyekmu **Rutin** + Tempat simpan data **Kecil** + Email **Gratis** + domain **.com** + AI **30 sesi kecil** | 45.000 | 56.700 | 245.000 | **101.700** | 346.700 | Rp500.000 (625.000) | ±3 bulan |
| `otomasi-tim` | Otomasi untuk tim | Team automation | Dimas | Otomasi n8n **Ramai** + Tempat simpan data **Sedang** + Email **Rutin** + AI **5.000 tugas otomasi** | 145.000 | 140.000 | 0 | **285.000** | 285.000 | Rp500.000 (625.000) | ±2 bulan |
| `ai-coding` | AI untuk tool coding saja | AI for coding tools only | Ayu/Raka | AI untuk tool-mu (alur v3) | 0 | sesuai pakai | 0 | — | — | Rp50.000 → 20–30 sesi kecil | — |

Untuk `ai-coding` estimasi memakai v3: Rp50.000 → 20–30 sesi, Rp100.000 → 40–60 sesi, Rp250.000 → 100+ sesi (Rp500.000 → 300+ sesi).

Urutan chip di UI: `portofolio` (default), `chatbot-wa`, `web-klien`, `otomasi-tim`, `ai-coding`.
Setiap resep bisa diubah di kalkulator Harga dan di wizard console (ganti ukuran, tambah/lepas layanan, ubah jumlah sesi/pesan/tugas).

---

## 7. Contoh Proyek — Landing Page Event (dari v3, diperluas)

“Dari prompt sampai online” untuk satu landing page event:

| Tahap | Isi | Biaya |
|---|---|---:|
| Bangun dengan AI | 11–18 sesi kecil (layout, mobile, form, copy & warna — rincian v3) | Rp20.790–34.020 |
| Online-kan | Coba-coba, 30 hari | Rp15.000 |
| Alamat web | `eventku.my.id`, tahun pertama | Rp5.000 |
| **Total** | | **Rp40.790–54.020** |

Kesimpulan: **top-up Rp50.000 (saldo 55.000) cukup sampai online**, sisa Rp980–14.210. Dipakai di hero (board proyek) dan section Contoh.

---

## 8. Data Demo Console (state awal mock)

Untuk demo langsung; bisa di-reset dari menu akun (“Mulai ulang demo”).

| Kunci | Nilai awal |
|---|---|
| Saldo | 0 (akun baru) — demo dimulai dengan top-up |
| Proyek | kosong |
| Riwayat | kosong |
| Akun | “Ayu” setelah masuk dengan email/HP contoh (data kontak tidak disimpan; hanya nama tampilan mock) |

Mode demo cepat `?demo=ayu` / `?demo=raka` / `?demo=dimas` mengisi saldo, proyek, dan riwayat sesuai resep persona untuk memperlihatkan console yang sudah berisi.

---

## 9. Pemeriksaan Konsistensi (wajib di QA)

`tools/` v4 menghitung ulang dan membandingkan dengan tabel di atas:
1. Biaya sesi kecil, pesan chatbot, tugas otomasi.
2. Per bulan, bulan pertama, dan “cukup ±N bulan” setiap resep.
3. Total contoh landing page event.
4. Harga yang dirender di landing, Harga, dan console sama dengan `data.js`.
