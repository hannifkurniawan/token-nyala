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

Metode: QRIS, e-wallet (DANA, GoPay, OVO), virtual account (mock, alur checkout v3). **Biaya tambahan Rp0 saat isi saldo** (klaim “Rp0” hanya untuk isi saldo; biaya penarikan di Terima pembayaran disebut terpisah).

**Top-up yang disarankan** (resep, wizard, banner) — satu aturan:
```
saran(kebutuhan) = nominal preset terkecil dengan (nominal + bonus) ≥ kebutuhan × 1,1   (ruang 10%)
                   jika tidak ada → Rp500.000
```
- Resep: `kebutuhan = bulan_pertama`.
- Wizard saat saldo kurang: `kebutuhan = kekurangan`; tombol “Isi saldo {saran}” + pilihan nominal lain di checkout.
- Banner saldo kurang: teks “Isi minimal {max(kekurangan, 20.000)}”.

---

## 2. Aturan Tagihan

| Jenis | Cara dipotong | Contoh layanan |
|---|---|---|
| **Biaya tetap** | Dipotong **di muka per 30 hari** dari saldo saat layanan dibuat | Hosting, asisten & otomasi, server, database, file, email berbayar |
| **Biaya tahunan** | Dipotong di muka per 12 bulan | Domain |
| **Biaya pakai** | Dipotong per pemakaian | AI (sesi, pesan chatbot, tugas otomasi), fee transaksi terima pembayaran |

Aturan ramah pemula (mock, perlu validasi finance/legal sebelum produksi):
1. **Perpanjang otomatis** jika saldo cukup. Pengingat **3 hari** sebelum jatuh tempo jika saldo kurang.
2. **Saldo tidak cukup saat jatuh tempo → layanan dijeda, bukan dihapus.** Data disimpan **7 hari**; isi saldo dan layanan menyala lagi otomatis (dipotong 30 hari baru). Tidak ada potongan selama dijeda.
3. **Dijeda > 7 hari → berhenti otomatis**, data dihapus. Tidak ada pengembalian (tidak ada sisa hari yang sudah dibayar).
4. **Berhenti kapan saja** (per layanan) — sisa hari dikembalikan ke saldo: `floor(harga ÷ 30 × sisa_hari ÷ 100) × 100`. Data layanan disimpan **7 hari** setelah berhenti (bisa dinyalakan lagi), lalu dihapus.
5. **Ganti ukuran naik atau turun kapan saja** — selisih prorata `(harga_baru − harga_lama) ÷ 30 × sisa_hari`: naik dibulatkan **ke atas** ke Rp100 dan dipotong; turun dibulatkan **ke bawah** ke Rp100 dan dikembalikan. Tanggal perpanjang tidak berubah. Ukuran di bawah minimum layanan nonaktif (§5.4).
6. **Alamat web (domain) tidak bisa dikembalikan** setelah terdaftar (aturan registrar). “Berhenti” pada domain = **matikan perpanjangan otomatis**; alamat tetap aktif sampai masa berlakunya habis.
7. **Hentikan proyek** = hentikan semua layanan di proyek itu (aturan 4 dan 6 berlaku per layanan). Tidak ada aksi “hapus” terpisah.
8. Setiap potongan dan pengembalian tercatat di **Riwayat saldo** per layanan dan per proyek.

### Nilai bawaan
| Hal | Nilai | Pilihan |
|---|---|---|
| Batas belanja API key proyek | Rp50.000 / bulan | Rp25.000 · Rp50.000 · Rp100.000 · Tanpa batas |
| Pengingat saldo | saat saldo < Rp20.000 | bebas, kelipatan Rp10.000 |
| Langkah stepper (kalkulator/wizard) | sesi kecil: 5 · pesan chatbot: 500 · tugas otomasi: 1.000 | minimum 0 |

### Perkiraan “saldo cukup sampai”
```
biaya_harian = (Σ biaya tetap aktif ÷ 30)
             + (Σ biaya perpanjangan domain aktif ÷ 365)
             + (Σ biaya pakai 7 hari terakhir ÷ 7)
hari_cukup   = floor(saldo ÷ biaya_harian)
tanggal      = hari_ini_simulasi + hari_cukup
```
- `hari_ini_simulasi` = jam demo (`clock`) — tanggal nyata saat akun baru dibuat; preset persona memakai **21 Nov 2026** agar QA deterministik.
- Fee **Terima pembayaran** dipotong dari dana yang diterima, **bukan dari saldo**, jadi tidak masuk rumus.
- Ditampilkan hanya di console (Beranda, Saldo): “Saldo cukup sampai **±19 Des**” (contoh preset Ayu, §8). Jika `biaya_harian = 0`: “Belum ada layanan yang memakai saldo.” Landing tidak menampilkan tanggal.

---

## 3. Satuan Estimasi AI (untuk bahasa awam)

| Satuan | Definisi | Model acuan | Biaya |
|---|---|---|---:|
| **Sesi kecil** (v3) | ±40 rb token masuk + ±4 rb token keluar — satu permintaan perbaikan komponen di tool coding | Seimbang (Claude Sonnet mock: 31.500 / 157.500 per 1 jt) | **Rp1.890** |
| **Pesan chatbot** (baru) | ±1.500 token masuk + ±300 token keluar — satu balasan chatbot WhatsApp | Hemat (DeepSeek Chat mock: 4.500 / 18.000 per 1 jt) | **Rp12** (12,15 dibulatkan) |
| **Tugas otomasi** (baru) | ±3.000 token masuk + ±800 token keluar — satu langkah AI di workflow (rangkum, klasifikasi, tulis balasan) | Hemat (DeepSeek Chat mock) | **Rp28** (27,9 dibulatkan) |

**Pembulatan:** biaya per satuan dibulatkan ke Rupiah utuh (half-up) **lebih dulu** (Rp12, Rp28), lalu dikalikan jumlah. Semua total resep memakai nilai bulat ini.

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
- Termasuk: alamat gratis `namaproyek.tokennyala.app`, HTTPS otomatis, log sederhana, restart otomatis.
- Kenapa Ramai (Rp75.000) lebih mahal dari Server Kecil (Rp65.000) dengan spesifikasi mirip: **sudah dikelola** (alamat, HTTPS, restart, update) — server sendiri dikelola sendiri. Kalimat ini muncul di `<details>` perbandingan di Harga.

### 5.4 `apps` — Asisten & otomasi siap pakai
| id | Nama ID | Nama EN | Isi teknis | Min. tanpa AI | Min. dengan AI | Bawaan (`?template=`) |
|---|---|---|---|---|---|---|
| `wa-bot` | Chatbot WhatsApp | WhatsApp chatbot | n8n + gateway WhatsApp | — (AI wajib) | Rutin | Rutin + 1.000 pesan chatbot |
| `n8n` | Otomasi n8n | n8n automation | n8n | Coba-coba | Rutin | Coba-coba, AI mati |
| `agent` | Agent AI 24 jam | 24/7 AI agent | OpenClaw | — (AI wajib) | Rutin | Rutin + 1.000 tugas otomasi |
| `dify` | Aplikasi AI tanpa kode | No-code AI app | Dify | — (AI wajib) | Rutin | Rutin + 1.000 pesan chatbot |
| `wordpress` | Website WordPress | WordPress website | WordPress | Coba-coba | — (tanpa AI) | Coba-coba |

- Id template **berbeda** dari id resep (resep `chatbot-wa` memakai template `wa-bot`).
- Ukuran di bawah minimum tampil nonaktif dengan alasan: “Belum cukup untuk {template} dengan AI — pilih Rutin”.
- Menyalakan AI pada n8n yang berukuran Coba-coba otomatis menaikkan ke Rutin (dengan pemberitahuan dan selisih biaya).
- Biaya template bawaan: `wa-bot` 35.000 + 12.000 = Rp47.000; `n8n` Rp15.000; `agent` 35.000 + 28.000 = Rp63.000; `dify` Rp47.000; `wordpress` Rp15.000 per bulan.
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
| id | Nama (ID / EN) | Kuota | Harga / 30 hari |
|---|---|---|---:|
| `gratis` | Gratis / Free | 50 email/hari | Rp0 |
| `2500` | 2.500 email / 2,500 emails | 2.500 email/bulan | Rp25.000 |
| `10000` | 10.000 email / 10,000 emails | 10.000 email/bulan | Rp75.000 |

- Nama kuota memakai jumlah email, **bukan** Coba-coba/Rutin/Ramai (skala itu khusus hosting & template).
- **Tanpa domain sendiri** email dikirim dari alamat gratis `notifikasi@{proyek}.tokennyala.app`. Dengan alamat web di TokenNyala, pengirim bisa `halo@{domain}` (DKIM/SPF dipasang otomatis).

### 5.10 `payments` — Terima pembayaran
- Rp0/bulan; **0,7% per transaksi QRIS**, dipotong dari dana yang diterima (bukan dari saldo); dana masuk H+2; tarik ke rekening Rp2.500 per penarikan (disebut jelas di halaman ini dan di Harga).
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
| `otomasi-tim` | Otomasi untuk tim | Team automation | Dimas | Otomasi n8n **Ramai** + Tempat simpan data **Sedang** + Email **2.500 email** (dari alamat gratis) + AI **5.000 tugas otomasi** | 145.000 | 140.000 | 0 | **285.000** | 285.000 | Rp500.000 (625.000) | ±2 bulan |
| `ai-coding` | AI untuk tool coding saja | AI for coding tools only | Ayu/Raka | AI untuk tool-mu (alur v3) | 0 | sesuai pakai | 0 | — | — | Rp50.000 → 20–30 sesi kecil | — |

Kolom “Top-up disarankan” dihasilkan oleh aturan `saran(bulan_pertama)` (§1) — bukan diisi manual.

### Aturan tampilan resep
- “≈ Rp34 rb/bulan”: `per_bulan` dibulatkan ke ribuan terdekat, **half-up** (Rp101.700 → Rp102 rb; Rp33.900 → Rp34 rb).
- Baris “Bulan pertama …” hanya tampil jika `bulan_pertama > per_bulan`, dengan keterangan “termasuk biaya tahunan (alamat web)”.
- **Resep minimum** = ukuran minimum setiap layanan di resep (hosting: Coba-coba; template: kolom minimum §5.4).

### `ai-coding` (kartu khusus)
- Tidak punya “per bulan”. Kartu menampilkan tabel v3: Rp50.000 → 20–30 sesi kecil, Rp100.000 → 40–60, Rp250.000 → 100+, Rp500.000 → 300+.
- CTA **tidak** ke wizard, tetapi ke `app.html#/ai?isi=1` (AI → Mulai cepat + sheet isi saldo).
- Di wizard langkah 1 tidak muncul; di Beranda chip ini membuka `#/ai`.

### Skema URL resep (kalkulator ⇄ wizard)
```
harga.html?resep=portofolio&s=hosting:coba,domain:my.id,ai:10#kalkulator
app.html#/buat?resep=portofolio&s=hosting:coba,domain:my.id,ai:10
app.html#/buat?template=wa-bot
```
`s` = daftar `layanan:nilai` dipisah koma; layanan yang mati tidak ditulis. Layanan **Asisten & otomasi** ditulis dengan id template sebagai kunci (`wa-bot:rutin`, `n8n:ramai`), bukan `apps:` — supaya template ikut terbawa (ditetapkan Fase 2). Nilai: ukuran (`coba|rutin|ramai`, `kecil|sedang|besar`, `10gb|100gb|1tb`, `gratis|2500|10000`), ekstensi domain (`my.id`, `com`, …), atau jumlah AI (`ai:<sesi>`, `pesan:<n>`, `tugas:<n>`). Tanpa `s` → isi bawaan resep. Nilai tidak valid diabaikan (pakai bawaan) tanpa error.

### Aturan Nala “Bantu pilih resep”
- Q1 memilih resep. Jika `ai-coding` → langsung kartu `ai-coding`.
- Q2 (“kodenya sudah ada?”) **hanya untuk resep bersatuan sesi kecil** (`portofolio`, `web-klien`): “Belum” → AI +10 sesi kecil. Resep lain melewati Q2.
- Q3: “Baru coba” → resep minimum; “Rutin dipakai” → layanan berukuran naik ke Rutin (bila di bawahnya); “Ramai” → naik ke Ramai. Ukuran database/email tidak diubah.

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

Kesimpulan: **top-up Rp50.000 (saldo 55.000) cukup sampai online**, sisa Rp980–14.210. Dipakai di section Contoh.

**Contoh konkret** untuk board hero dan animasi “Satu saldo” (satu skenario, angka pasti): 12 sesi kecil Rp22.680 + Online-kan Rp15.000 + `.my.id` Rp5.000 = **Rp42.680**; saldo 55.000 → **sisa Rp12.320**.

---

## 8. Data Demo Console (state awal mock)

Untuk demo langsung; bisa di-reset lewat **menu Akun** (mobile: sheet *Lainnya*; desktop: menu avatar) → “Mulai ulang demo”.

| Kunci | Nilai awal |
|---|---|
| Saldo | 0 (akun baru) — demo dimulai dengan top-up |
| Proyek | kosong |
| Riwayat | kosong |
| Akun | “Ayu” setelah masuk dengan email/HP contoh (data kontak tidak disimpan; hanya nama tampilan mock) |

Mode demo cepat `?demo=ayu|raka|dimas` mengisi state berikut (jam simulasi **21 Nov 2026**):

| Preset | Riwayat isi saldo | Proyek & layanan (nyala sejak) | AI 7 hari terakhir | Saldo | Cukup sampai |
|---|---|---|---|---:|---|
| `ayu` | 20 Nov: Rp50.000 + bonus 5.000 | `portofolio-ayu` (20 Nov): Online-kan Coba-coba 15.000 · `ayu.my.id` 5.000 | 2 sesi = 3.780 | **31.220** | ±19 Des |
| `raka` | 1 Nov: Rp500.000 + bonus 125.000 | `klien-kopi` (1 Nov): Rutin 35.000 · data Kecil 10.000 · email Gratis · `kopikita.com` 245.000 · `klien-salon` (1 Nov): Rutin 35.000 · data Kecil 10.000 · `salonayu.biz.id` 5.000 | 8 sesi = 15.120 (24 sesi = 45.360 sejak 1 Nov) | **239.640** | ±31 Des |
| `dimas` | 1 Nov: Rp500.000 + 125.000 · 15 Nov: Rp250.000 + 50.000 | `otomasi-tim` (1 Nov): n8n Ramai 75.000 · data Sedang 45.000 · email 2.500 25.000 · `server-tim` (1 Nov): Server Kecil Jakarta 65.000 | 840 tugas = 23.520 (2.400 tugas = 67.200 sejak 1 Nov) | **647.800** | ±22 Jan |

Perhitungan saldo: Ayu 55.000 − 15.000 − 5.000 − 3.780; Raka 625.000 − 290.000 − 50.000 − 45.360; Dimas 925.000 − 210.000 − 67.200.
Perhitungan “cukup sampai” (rumus §2, dari 21 Nov): Ayu 500 + 68,5 + 540 = 1.108,5/hari → 28 hari → **19 Des**; Raka 3.000 + 739,7 + 2.160 = 5.899,7/hari → 40 hari → **31 Des**; Dimas 7.000 + 0 + 3.360 = 10.360/hari → 62 hari → **22 Jan**. (Diperbaiki 20 Nov 2026 saat Fase 1: Ayu sebelumnya tertulis ±20 Des.)

`&state=jeda` (hanya `ayu`): jam simulasi **21 Des 2026**, saldo **8.000**, `portofolio-ayu` **dijeda sejak 20 Des**, data aman sampai **27 Des**, banner: “Isi minimal Rp20.000”.
Riwayat `jeda` = riwayat `ayu` + AI 12 sesi kecil (5 Des, Rp22.680) + Coba AI 45 pesan (12 Des, Rp540) → 31.220 − 23.220 = **8.000**. Isi Rp50.000 (+5.000) → Online-kan menyala lagi (−15.000, 30 hari baru) → saldo **48.000**. (Ditetapkan Fase 4 supaya riwayat selalu sama dengan saldo.)

Menu Akun juga berisi **“Simulasi: majukan 30 hari”** — memajukan jam demo dan menjalankan perpanjangan / jeda / berhenti otomatis sesuai §2.
Cara kerja (Fase 5, `store.advance()`): hari demi hari — layanan jatuh tempo diperpanjang bila saldo cukup, jika tidak **dijeda**; dijeda > 7 hari → **berhenti**; domain dengan perpanjangan mati → berhenti saat habis. Pemakaian AI mengulang pola 7 hari terakhir (satu baris per minggu, dilewati bila saldo tidak cukup). Preset `ayu`: +30 hari → 21 Des, diperpanjang, saldo **1.100** (banner pengingat) · +30 → 20 Jan, **dijeda** · +30 → **berhenti**.

---

## 9. Pemeriksaan Konsistensi (wajib di QA)

`tools/` v4 menghitung ulang dan membandingkan dengan tabel di atas:
1. Biaya sesi kecil, pesan chatbot, tugas otomasi.
2. Per bulan, bulan pertama, dan “cukup ±N bulan” setiap resep.
3. Total contoh landing page event.
4. Harga yang dirender di landing, Harga, dan console sama dengan `data.js`.
