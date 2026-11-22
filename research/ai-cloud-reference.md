# Riset Referensi AI Cloud — Sumopod & Helipod

Tanggal: 20 November 2026
Pemicu: feedback stakeholder setelah demo `archive/showcase/v1` dan `archive/showcase/v2` — output dinilai terlalu fokus pada e-commerce jualan token AI; ekspektasi beliau adalah **platform AI Cloud Services** seperti sumopod.com dan “helipod”.

## Sumber dan Batasan

| Referensi | Yang dibaca | Batasan |
|---|---|---|
| **sumopod.com** (PT Koding Kreasi Indonesia) | Landing (dirender dengan Chromium headless), halaman register/login (hanya dilihat), Terms/Privacy/Refund, **seluruh docs `docs.sumopod.com`: 86 halaman + 212 screenshot dashboard** (atas saran user) | Tidak login: verifikasi Cloudflare Turnstile harus dicentang manusia. Dashboard dipelajari dari screenshot docs (per 4 Nov 2026). |
| **helipod.com** | — | Dialihkan ke `helipod.co.uk` (bukan AI cloud). |
| **helipod.io** (yang dimaksud, perlu dikonfirmasi ke stakeholder) | Landing, halaman harga, 13 halaman fitur, 14 halaman VPS/landing SEO, blog | Dashboard di balik login (“Masuk Kokpit”). |

Teks dan screenshot mentah disimpan di luar repo (scratchpad sesi), tidak di-commit.

---

## 1. Sumopod

### Positioning & landing
- Hero (bahasa Inggris, generik): *“Unlock the power of the cloud with our affordable solutions.”* / *“Elevate your bussiness with our cloud solutions…”* (ada typo). CTA *Get started now*.
- Landing tipis: logo infrastruktur (Cloudeka by Lintasarta, Alibaba Cloud, Tencent Cloud, MaxCloud) dan model (OpenAI, Claude, GLM, Kimi, DeepSeek), **carousel video tutorial YouTube berbahasa Indonesia**, satu blok fitur VPS, CTA penutup. **Tidak ada harga di landing.**
- **Docs (`docs.sumopod.com`) adalah “landing” yang sebenarnya:** 86 halaman, 212 screenshot dashboard, alur langkah demi langkah per produk + troubleshooting.
- Judul tutorial menunjukkan siapa yang mereka kejar: *“Tutorial OpenClaw untuk Pemula Tanpa Pusing”*, *“Cara Menggunakan Sumopod AI Gratis untuk Vibecoding di Cline VSCode”*, *“OpenClaw Auto Post 24 Jam — serius tanpa coding?!”*, *“AI 24 jam cuma 36rb?!”*, *“1 miliar token/hari gratis?!”*. → **Pemula/vibecoder diakuisisi lewat video & influencer, bukan lewat landing.**

### Dashboard (dari screenshot docs)
- **Halaman pertama setelah login = “Learn”** (video tutorial + webinar), bukan ringkasan saldo.
- Sidebar: **Learning** (Learn) · **Services** (Chat, AI, Apps (Services), API Services, Managed Payment, Security Advisor, Cloud Payments) · **Infrastructure** (Pods, VPS / VPS NAT, Database, Object Storage, Domains) · **Communication** (Email SMTP, Email Inbox, Social API) · **Account** (Billing).
- Pola halaman konsisten: daftar → tombol *Create/Add* → form bertahap di kiri + **panel ringkasan biaya lengket di kanan** (“Deployment Summary” / “Configuration Summary”, *Billed monthly · Cancel anytime*).

### Produk
| Produk | Cara kerja & harga |
|---|---|
| **AI** | Tab: Quick Start · Chat · Usage · Models · API Keys. Endpoint kompatibel OpenAI `ai.sumopod.com/v1`, key `sk-…` ditampilkan sekali, **limit belanja per key (USD)** + batasi model per key. Tabel model: provider, context, **harga input/cache/output dalam USD per 1M token**, beberapa model peak/off-peak. Usage: biaya harian (USD) + request log per key. Teks saja. |
| **Chat** | “Chat Playground” mirip ChatGPT di dalam dashboard, pilih model, contoh prompt, export/import; dibayar dari AI Balance. Image/Speech/Video “coming soon”. |
| **Apps (Services)** | Marketplace template: **Hermes** (agent Nous Research, mulai Rp10.000/bln), **n8n** (mulai Rp10.000/bln), n8n + ffmpeg (Rp30.000), **QwenPaw by Sumopod** (alternatif OpenClaw ber-GUI, Rp45.000). Form: nama → region (Jakarta / EU “50% off” / Singapura segera) → tier dengan sisa kuota (“971 remaining”, “Out of Quota”). Tier ditulis teknis tapi diberi petunjuk: *“n8n (0.5C0.5G) — NOT FOR CHATBOT OR AI AGENT”*, *“n8n (1C1G) — Minimal Requirement for Building Chatbot and AI Agent”* Rp30.000/bln. Setelah aktif: tab Access (URL admin + user/password), Monitor, Logs, File Manager, Custom Domain, Upgrade & Renew (tanpa downgrade). |
| **VPS / VPS NAT** | Nama → **root password wajib diisi sendiri** (12–30 karakter) → provider (Tencent, Cloudeka by Lintasarta, Alibaba) → region (Singapura/Jakarta) → OS → paket. Contoh 2 vCPU/2 GB/40 GB/512 GB traffic = **Rp60.000/bln**. Tencent: kuota bandwidth habis → VPS dimatikan. |
| **Database** | Shared (PostgreSQL 16, MySQL 8, MariaDB 11, MS SQL Express) **Rp10.000/GB/bln**; +pgvector/PostGIS Rp12.500–15.000/GB. Dedicated tersedia. Monitor, backup, rotate password. |
| **Object Storage** | S3-compatible, 10 GB Rp6.500/bln s.d. 2 TB Rp1.300.000/bln. |
| **Domains** | .my.id / .biz.id / .web.id **Rp3.500 tahun pertama** (perpanjang Rp15.000–65.000), DNS & nameserver. |
| **Email SMTP / Inbox** | Kredensial SMTP, custom domain (DKIM/SPF), activity log. |
| **Managed Payment** | **Payment gateway untuk aplikasi user** (QRIS, fee 0,7% + Rp300, settle ±2 hari), sandbox → live, webhook, tarik dana (fee Rp2.500). |
| **Cloud Payments** | Top-up akun cloud pihak ketiga (via UIN/Account ID) $5–$500 dengan QRIS. |

### Akun & pembayaran
- Register: Google, atau email + nama depan/belakang + **nama perusahaan** + Cloudflare Turnstile (centang manual); login tanpa password (kode via email).
- **Sumopod Credit (Rupiah)**: top-up preset Rp50.000/100.000/200.000 atau bebas; QRIS, VA, e-wallet (Dana, ShopeePay…), kartu; ada **Redeem voucher**. Peringatan kuning: *“Sumopod Credit is not real money and cannot be refunded or withdrawn.”*
- **AI Balance (USD), terpisah**: dibeli dengan mengonversi Sumopod Credit — contoh di screenshot: bayar 89.775 kredit → $5, *“Exchange rate: 1 USD = 17.955 IDR”*; preset $5/$10/$25/$50; ada Turnstile lagi di dialog ini. API key dan Chat baru bisa dipakai setelah AI Balance terisi.

### Catatan UX
- Kuat: harga murah dan tampil sebelum bayar (panel ringkasan), banyak produk, template agent/automation sekali klik dengan petunjuk “cukup untuk chatbot?”, limit belanja per API key, ekosistem tutorial Indonesia, Learn sebagai beranda.
- Lemah untuk pemula: landing tidak menjelaskan produk/harga; copy Inggris; **dua saldo + USD + kurs** (dua kali top-up sebelum bisa memakai AI); tier & form teknis (0.5C0.5G, root password, provider, region, OS); VPS bisa mati saat bandwidth habis; 18 menu sidebar berbobot sama.

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
| Butuh layanan apa untuk proyek saya? | Pilih sendiri dari 18 menu | Pilih sendiri dari 7 produk | **Mulai dari tujuan/resep**: “Chatbot WhatsApp AI”, “Landing page + form”, “Otomasi konten n8n” → paket berisi app + saldo AI |
| Berapa total per bulan? | Harga di dalam dashboard | Kalkulator per resource | **Satu angka per proyek** dalam bahasa awam (konsep “sesi kecil” diperluas) |
| Saldo-nya bagaimana? | Dua saldo, AI dalam USD | Satu dompet Rupiah (+ sub-saldo AI) | Satu saldo Rupiah, aturan saldo jelas (sudah ada di v3) |
| Tier mana yang cukup? | “0.5C0.5G / 1C1G” | vCPU, RAM, CU-jam | Ukuran berbahasa awam (“Coba-coba / Dipakai tim kecil / Ramai”) + detail teknis di `<details>` (pola v3) |
| Kalau bingung? | Email support, video YouTube | WhatsApp, Heli Crew (MCP) | Asisten Nala + jalur manusia (sudah ada di v3) |

### Aset archive/v3/showcase yang bisa dipakai ulang
Saldo Rupiah & aturan saldo, tab tujuan + rekomendasi, estimasi bahasa awam, checkout QRIS/VA/e-wallet, katalog model + filter, panduan API key/Base URL, mock dashboard pemakaian, jalur tim/B2B, live chat Nala, ID/EN, alat QA.

### Yang belum ada
Katalog multi-produk (app sekali klik, VPS, database, domain, email), dompet multi-produk dengan riwayat potongan per produk, halaman harga semua layanan, alur deploy app sekali klik, mock console/“kokpit”, integrasi AI coding tool (MCP) sebagai fitur.

## 5. Pertanyaan untuk stakeholder

1. Referensi “helipod” = **helipod.io**? (helipod.com dialihkan ke situs Inggris.)
2. Layanan wajib di prototype: AI API, app/agent sekali klik (n8n, Dify, OpenClaw…), VPS, database, domain, email, GPU?
3. Target utama tetap vibecoder pemula, atau developer/engineer seperti Helipod?
4. Deliverable: landing saja, atau juga mock console/dashboard dan alur deploy?
5. Apakah positioning “bagian dari ekosistem XL” (dipakai di showcase v2) tetap berlaku?
6. Deadline dan format review berikutnya.
