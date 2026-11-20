# Riset Referensi AI Cloud — Sumopod & Helipod

Tanggal: 20 November 2026
Pemicu: feedback Pak Ferry setelah demo `showcase/v1` dan `showcase/v2` — output dinilai terlalu fokus pada e-commerce jualan token AI; ekspektasi beliau adalah **platform AI Cloud Services** seperti sumopod.com dan “helipod”.

## Sumber dan Batasan

| Referensi | Yang dibaca | Batasan |
|---|---|---|
| **sumopod.com** (PT Koding Kreasi Indonesia) | Landing (dirender dengan Chromium headless), halaman register/login (hanya dilihat, tidak diisi), Terms/Privacy/Refund, **±45 halaman docs** `docs.sumopod.com` | Dashboard ada di balik login. Register memakai Cloudflare Turnstile + kode verifikasi email, jadi tidak dilakukan otomatis. Harga per produk tidak tampil publik. |
| **helipod.com** | — | Dialihkan ke `helipod.co.uk` (bukan AI cloud). |
| **helipod.io** (yang dimaksud, perlu dikonfirmasi ke Pak Ferry) | Landing, halaman harga, 13 halaman fitur, 14 halaman VPS/landing SEO, blog | Dashboard di balik login (“Masuk Kokpit”). |

Teks dan screenshot mentah disimpan di luar repo (scratchpad sesi), tidak di-commit.

---

## 1. Sumopod

### Positioning & landing
- Hero (bahasa Inggris, generik): *“Unlock the power of the cloud with our affordable solutions.”* / *“Elevate your bussiness with our cloud solutions…”* (ada typo). CTA *Get started now*.
- Isi landing tipis: logo infrastruktur (Cloudeka by Lintasarta, Alibaba Cloud, Tencent Cloud, MaxCloud) dan model (OpenAI, Claude, GLM, Kimi, DeepSeek), **carousel video tutorial YouTube berbahasa Indonesia**, satu blok fitur VPS, CTA penutup. **Tidak ada harga di landing.**
- Judul tutorial menunjukkan siapa yang mereka kejar: *“Tutorial OpenClaw untuk Pemula Tanpa Pusing”*, *“Cara Menggunakan Sumopod AI Gratis untuk Vibecoding di Cline VSCode”*, *“Cara Menggunakan Sumopod AI di Bolt.diy”*, *“Bikin Pencatatan Keuangan dengan Hermes”*, *“Cara Bikin Akun Threads Auto Post 24 Jam dengan OpenClaw”*. → **Pemula/vibecoder diakuisisi lewat konten video & influencer, bukan lewat landing.**

### Peta produk (sidebar dashboard, terlihat di screenshot landing)
- **Learning:** Learn (video tutorial & webinar)
- **Services:** Chat, AI, Apps (Services), API Services, Managed Payment, Security Advisor, Cloud Payments
- **Infrastructure:** Pods, VPS, Database, Object Storage, Domains
- **Communication:** Email SMTP

### Detail dari docs
| Produk | Cara kerja & harga |
|---|---|
| **AI** | Endpoint kompatibel OpenAI `ai.sumopod.com/v1`, key `sk-…` ditampilkan sekali, **limit belanja per key (USD)** dan pembatasan model per key, tab Usage. Teks saja. |
| **Apps (Services)** | Marketplace template sekali klik: n8n, Hermes, OpenClaw, dll. Pilih nama → region → tier → billing cycle → *Deployment Summary* → Deploy. Tier ditulis teknis: *“n8n (0.5C0.5G) small/simple tasks only, not for chatbot or AI agent”*, *“n8n (1C1G) minimal requirement for building a chatbot or AI agent”*. Upgrade saja, tidak bisa downgrade. |
| **VPS** | Pilih provider (Tencent, Cloudeka by Lintasarta, Alibaba), region (Jakarta/Singapura), OS, paket; root password diset sendiri (12–30 karakter). Bulanan. Tencent: kuota bandwidth habis → **VPS dimatikan** sampai bulan depan. |
| **Database** | Shared (PostgreSQL 16, MySQL 8, MariaDB 11, MS SQL Express) **Rp10.000/GB/bulan**; +pgvector/PostGIS Rp12.500–15.000/GB. Ada Dedicated. |
| **Lainnya** | Email SMTP, Object Storage, Domains, Managed Payment, Security Advisor. |

### Akun & pembayaran
- Register: Google, atau email + nama depan/belakang + **nama perusahaan** + Turnstile; login tanpa password (kode via email).
- **Dua saldo:** *Sumopod Credit* (Rupiah, top-up preset Rp50.000/100.000/200.000) untuk VPS, domain, dll.; **AI Balance dalam USD** (preset $5/$10/$25/$50) yang dibeli dengan mengonversi Sumopod Credit memakai kurs. API key baru bisa dibuat setelah punya AI Balance.
- Kredit tidak bisa di-refund atau ditarik.

### Catatan UX
- Kuat: harga murah, banyak produk, ekosistem tutorial Indonesia, limit belanja per API key.
- Lemah untuk pemula: landing tidak menjelaskan produk/harga; copy Inggris generik; **dua saldo + USD + kurs**; tier berbahasa teknis (0.5C0.5G); risiko VPS mati saat bandwidth habis; harus paham provider/region/OS/root password.

---

## 2. Helipod (helipod.io)

### Positioning & landing
- Meta: *“PaaS Indonesia untuk deploy aplikasi web, API, dan AI workload dalam menit. Bayar pakai QRIS, tanpa kartu kredit internasional. Server di Jakarta.”*
- Hero: **“Lebih dari sekadar Server”** — *“Platform as a Service. Scale, dan manage aplikasi dengan aman, tanpa pusing konfigurasi.”* CTA *Deploy Sekarang* + *Docs API & MCP*; perintah `claude mcp add … helipod` langsung di hero. Bar atas: *“BARU · Helipod MCP — Kelola server, deploy, domain & email langsung dari AI kamu.”*
- Nav: Helipod › Fitur › Layanan › Developer › Program › Biaya › Blog · ID · **Masuk Kokpit**.
- Target: *“engineer Indonesia”*. Tema penerbangan (Kokpit, Lepas Landas, Flight Manual, *“Izin terbang diberikan. System siap mengudara.”*).

### Urutan section landing
1. Hero + stat (40+ template, 8+ framework, 1.500+ deployment)
2. Logo partner (Neon, MongoDB, Turso, Upstash, Cloudflare, Backblaze, Resend, GitHub, GitLab)
3. **Aplikasi** — *“Push kode-mu, kami yang jalankan.”* Rp150/hari (hanya CPU; pod terkecil Rp425/hari)
4. **AI Gateway** — *“Semua model terdepan. Satu key.”* 76 model, diagram router interaktif per keluarga model, demo prompt
5. **VPS** — *“Server sendiri, dekat dengan user-mu.”* pemilih lokasi user → data center terdekat + latency; app siap pakai (n8n, Dify, Hermes Agent, OpenClaw, OpenCode, WordPress, Easypanel, …), mulai Rp20.925/bulan
6. **Postgres** — tidur saat tidak ada query; gratis / mulai Rp119.000/bulan
7. **Mail** — *“Email yang sampai ke inbox.”* gratis / mulai Rp24.990/bulan
8. **Domain** — *“Nama-mu di internet, mulai Rp1.500 setahun.”*
9. **Heli Crew** — asisten DevOps AI lewat MCP (Claude, ChatGPT, Codex, Cursor), minta izin sebelum aksi berbayar; gratis lewat MCP
10. **Pembayaran** — **“Satu saldo Rupiah, untuk semuanya.”** preset Rp100rb/250rb/500rb/1jt, QRIS/VA, animasi saldo terpotong per produk
11. CTA penutup + footer berisi puluhan landing SEO (VPS n8n, VPS Dify, VPS OpenClaw, Domain murah, …)

### Harga & penagihan
- Satu **saldo dompet Rupiah** untuk semua produk; AI memakai *saldo AI* yang diisi dari dompet (mulai Rp10.000) — tetap Rupiah.
- Aplikasi: per resource per hari (CPU Rp150/0,125 vCPU, RAM Rp200/128 MB, storage Rp75/GB), dipotong 00:00 WIB; ada **kalkulator biaya**.
- AI: Rp per 1 jt token input/output (mis. Claude Sonnet 5.5 Rp40.940 / Rp204.700), rumus ditulis di halaman harga.
- QRIS ≤ Rp267.000; QRIS + VA sampai Rp4,99 jt; di atasnya VA. Tanpa kartu kredit. Tidak ada kredit gratis; ada free tier Postgres & Mail.

### Gaya visual
- Putih/abu terang + hitam, aksen **hijau**; font mono untuk label & teks pendukung; banyak mock terminal gelap, peta titik, kartu bergaris tipis.
- **Satu proyek fiktif (“tokoku”) dipakai di semua demo** — app → DB → email → domain → AI terasa sebagai satu cerita.
- Setiap produk punya demo interaktif kecil (router model, pemilih lokasi, timeline DB tidur, alur email, DNS, alur saldo).

### Catatan UX
- Kuat: satu saldo Rupiah, harga transparan di satu halaman, storytelling produk, integrasi AI coding tool (MCP), banyak landing SEO per use case.
- Lemah untuk pemula: bahasa engineer (pod, vCPU, CU-jam, rollout, DKIM); 7 produk berbobot sama — tidak ada panduan “saya mau bikin X, butuh apa?”; total biaya per bulan untuk satu proyek harus dihitung sendiri.

---

## 3. Pola Bersama — apa arti “AI Cloud Services”

1. **Satu akun, banyak produk:** AI API + menjalankan aplikasi (app hosting / template sekali klik) + VPS + database + email + domain.
2. **“AI” punya dua arti:** (a) model API (gateway), dan (b) **menjalankan aplikasi/agent AI** — n8n, Dify, OpenClaw, Hermes, OpenCode — di server.
3. **Dashboard/console adalah produknya**; landing hanya etalase.
4. **Rupiah, QRIS/VA, tanpa kartu kredit** — pembeda utama melawan AWS/GCP/Vercel.
5. **Integrasi dengan AI coding tool:** Cline/Bolt.diy (Sumopod, lewat tutorial), Claude Code/Cursor via MCP (Helipod).

## 4. Peluang untuk TokenNyala

Keduanya masih berbicara bahasa developer. Belum ada yang menjawab pertanyaan pemula: **“Saya mau bikin X — butuh apa saja, dan berapa per bulan?”**

| Pertanyaan pemula | Sumopod | Helipod | Peluang |
|---|---|---|---|
| Butuh layanan apa untuk proyek saya? | Pilih sendiri dari 15 menu | Pilih sendiri dari 7 produk | **Mulai dari tujuan/resep**: “Chatbot WhatsApp AI”, “Landing page + form”, “Otomasi konten n8n” → paket berisi app + saldo AI |
| Berapa total per bulan? | Harga di dalam dashboard | Kalkulator per resource | **Satu angka per proyek** dalam bahasa awam (konsep “sesi kecil” diperluas) |
| Saldo-nya bagaimana? | Dua saldo, AI dalam USD | Satu dompet Rupiah (+ sub-saldo AI) | Satu saldo Rupiah, aturan saldo jelas (sudah ada di v3) |
| Tier mana yang cukup? | “0.5C0.5G / 1C1G” | vCPU, RAM, CU-jam | Ukuran berbahasa awam (“Coba-coba / Dipakai tim kecil / Ramai”) + detail teknis di `<details>` (pola v3) |
| Kalau bingung? | Email support, video YouTube | WhatsApp, Heli Crew (MCP) | Asisten Nala + jalur manusia (sudah ada di v3) |

### Aset v3/showcase yang bisa dipakai ulang
Saldo Rupiah & aturan saldo, tab tujuan + rekomendasi, estimasi bahasa awam, checkout QRIS/VA/e-wallet, katalog model + filter, panduan API key/Base URL, mock dashboard pemakaian, jalur tim/B2B, live chat Nala, ID/EN, alat QA.

### Yang belum ada
Katalog multi-produk (app sekali klik, VPS, database, domain, email), dompet multi-produk dengan riwayat potongan per produk, halaman harga semua layanan, alur deploy app sekali klik, mock console/“kokpit”, integrasi AI coding tool (MCP) sebagai fitur.

## 5. Pertanyaan untuk Pak Ferry

1. Referensi “helipod” = **helipod.io**? (helipod.com dialihkan ke situs Inggris.)
2. Layanan wajib di prototype: AI API, app/agent sekali klik (n8n, Dify, OpenClaw…), VPS, database, domain, email, GPU?
3. Target utama tetap vibecoder pemula, atau developer/engineer seperti Helipod?
4. Deliverable: landing saja, atau juga mock console/dashboard dan alur deploy?
5. Apakah positioning “bagian dari ekosistem XL” (dipakai di showcase v2) tetap berlaku?
6. Deadline dan format review berikutnya.
