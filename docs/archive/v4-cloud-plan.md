# Rencana v4 — TokenNyala sebagai Platform AI Cloud

Tanggal: 20 November 2026 · Status: **disetujui arahnya (20 Nov 2026)** — keputusan bagian 7 sudah diambil
Dasar: feedback stakeholder (20 Nov), keputusan konfirmasi 1–8 (lihat `PROJECT-MEMORY.md` → Keputusan), riset `research/ai-cloud-reference.md`.

## 1. Ringkasan Arah

| Hal | Keputusan |
|---|---|
| Produk | Platform AI Cloud Services: **semua layanan** seperti helipod.io / sumopod.com |
| User utama | Vibecoder pemula (Ayu), lalu Raka (freelancer) dan Dimas (tim kecil) |
| Pembeda | **Paling mudah dipahami pemula**, “unique design taste”, tidak teknis |
| Saldo | **Satu saldo Rupiah** untuk semua layanan (aturan saldo v3 tetap: 1 kredit = Rp1, termasuk PPN, tidak kedaluwarsa) |
| Brand | Nama **TokenNyala tetap**, tagline baru |
| Deliverable | Landing + halaman Harga + mock Console + alur deploy |
| Review | Demo langsung, **mobile first**, acuan visual `archive/showcase/v1` & `archive/showcase/v2` |

### Inti cerita (menjembatani brief lama dan ekspektasi baru)
Vibecoder tidak berhenti di token. Setelah AI menulis kodenya, mereka bingung **cara meng-online-kan, menyimpan data, memasang domain, atau menjalankan agent 24 jam**. Pesaing menjawab dengan menu teknis (vCPU, pod, CU-jam, root password, saldo USD). TokenNyala menjawab dengan **tujuan**: “Mau bikin apa?” → resep layanan yang sudah dirangkai → **satu angka Rupiah per bulan**.

### Tagline
**“Idemu nyala, dari prompt sampai online.”** (dipilih user, 20 Nov). EN: *“Your idea, switched on — from prompt to online.”* (draf, dikunci di microcopy).

## 2. Layanan dalam Bahasa Awam

Nama teknis tetap terlihat kecil sebagai label sekunder (supaya Raka/Dimas tetap yakin), tetapi judul memakai bahasa tujuan.

| Layanan | Nama di TokenNyala (usulan) | Contoh tujuan | Pembanding |
|---|---|---|---|
| AI API (gateway) | **AI untuk tool-mu** | Cursor, Lovable, Cline jalan terus | Helipod AI Gateway, Sumopod AI |
| Chat playground | **Coba AI** | Bandingkan model sebelum dipakai | Sumopod Chat |
| App/agent sekali klik | **Asisten & otomasi siap pakai** | Chatbot WhatsApp, n8n, agent 24 jam (OpenClaw/Hermes) | Sumopod Apps, Helipod VPS app |
| Hosting aplikasi | **Online-kan proyekmu** | Landing page dari Lovable/Bolt/GitHub jadi link publik | Helipod Aplikasi, Sumopod Pods |
| VPS | **Server sendiri** | Untuk yang butuh kontrol penuh | keduanya |
| Database | **Tempat simpan data** | Form pendaftaran, data pelanggan | keduanya |
| Object storage | **Tempat simpan file** | Foto produk, upload user | Sumopod |
| Domain | **Alamat web** | `namaku.my.id` | keduanya |
| Email | **Email dari domainmu** | Kirim notifikasi & struk | keduanya |
| Payment gateway | **Terima pembayaran** | QRIS untuk toko kecil | Sumopod Managed Payment |

Ukuran layanan memakai bahasa awam — **Coba-coba / Rutin / Ramai** — dengan keterangan “cukup untuk …”, dan spesifikasi teknis (vCPU, RAM, storage) di `<details>` (pola v3 untuk tarif model).

## 3. Resep per Persona (inti landing & console)

| Persona | Resep | Isi | Estimasi |
|---|---|---|---|
| Ayu | **Portofolio / landing page online** | Hosting kecil + domain `.my.id` + saldo AI untuk iterasi | satu angka Rp/bulan |
| Ayu | **Chatbot WhatsApp untuk usaha teman** | Template chatbot/n8n + saldo AI | satu angka Rp/bulan |
| Raka | **Website klien + form** | Hosting + database + domain + email, satu proyek per klien, key AI per proyek dengan limit | Rp/bulan per klien, invoice |
| Dimas | **Otomasi tim** | Agent 24 jam / n8n + database + AI, pemakaian per anggota | Rp/bulan, faktur pajak |

Harga mock (ilustratif, berlabel contoh) diletakkan di antara Sumopod dan Helipod; ditetapkan di `technical-spec` v4.

## 4. Peta Halaman (mobile first)

### A. Landing `/`
1. Hero — tagline baru, CTA *Mulai bangun* + *Lihat harga*, ilustrasi “dari prompt → online” (mengembangkan board proyek v1/v2)
2. **“Mau bikin apa?”** — pemilih tujuan → resep + satu angka per bulan (evolusi package picker v3)
3. Cara kerja 3 langkah — pilih tujuan → isi saldo → nyala (online)
4. Semua layanan — kartu berbahasa awam, dikelompokkan: *Bangun dengan AI* · *Jalankan* · *Simpan* · *Hubungkan*
5. Satu saldo Rupiah — pembeda tegas (tanpa USD, tanpa kartu kredit, tanpa dua saldo)
6. Template siap pakai — chatbot WA, n8n, agent, portofolio
7. AI untuk tool-mu — katalog model (reuse v3) + panduan pasang
8. Contoh proyek nyata — landing page event (reuse v3, diperluas: AI + hosting + domain)
9. Belajar — tutorial singkat (Sumopod menjadikan Learn beranda; kita jadikan section + menu console)
10. Tim & bisnis (reuse v3) · FAQ (diperbarui) · CTA akhir · chat Nala (skrip diperbarui)

### B. Harga `/harga`
Semua layanan di satu halaman (pola Helipod), tetapi: mulai dari resep, angka per bulan dulu, tarif teknis di `<details>`, **kalkulator resep** (pilih tujuan + ukuran → total Rp/bulan).

### C. Console mock `/app` (alur bisa diklik, data lokal)
| Layar | Isi |
|---|---|
| Masuk | Satu field email/HP (aturan v3), mock OTP — tanpa field perusahaan |
| **Beranda** | Saldo + perkiraan “cukup sampai tanggal …”, proyek aktif, langkah berikutnya, tips belajar |
| **Buat baru** (wizard) | Mau bikin apa? → template → ukuran (awam) → **ringkasan biaya lengket** (pola Sumopod) → bayar dari saldo → animasi “menyala” → link live |
| Proyek | Daftar proyek; detail: status, link, pemakaian, log sederhana, domain, restart |
| AI | API key per proyek + limit Rupiah, model, pemakaian, Coba AI |
| Saldo | Top-up (checkout v3: QRIS/VA/e-wallet), riwayat potongan **per layanan**, pengingat saldo |
| Layanan lain | VPS, database, storage, domain, email, terima pembayaran — satu pola daftar → buat → ringkasan |
| Belajar | Panduan singkat per tujuan |
| Bantuan | Nala + serah ke agen (reuse v3) |

## 5. Basis Teknis & Visual (perlu keputusan)

- **Kode:** usulan folder baru **`site/`** (multi halaman) di atas stack v3 — Tailwind v4 browser build, token `@theme`, `setupModal`, i18n ID/EN, dan alat QA (`qa_v3.py`, `i18n_check.py`, `audit_v3.py` diperluas untuk beberapa halaman). v3 dan showcase tetap utuh sebagai arsip demo.
- **Visual:** pilih acuan utama
  - `archive/showcase/v1` — editorial bersih, kartu putih, aksen biru (Tailwind, dekat dengan v3)
  - `archive/showcase/v2` — lebih berani: lembar warna penuh (biru/kuning/teal), saklar “nyala”, angka besar, label mono bernomor `(01)` (CSS custom 1.146 baris)
- Tipografi tetap 2 keluarga / 4 face (Manrope + IBM Plex Mono).
- Motion: GSAP/Lenis dari showcase boleh dibawa, dengan gate `prefers-reduced-motion`.

## 6. Tahapan

| Fase | Isi | Hasil |
|---|---|---|
| 0. Dokumen | Brief v2, IA v4, skenario persona, microcopy ID/EN, wireframe mobile, tech spec (data layanan, resep, harga mock), ground rules v4 | Dokumen tanpa kontradiksi (pelajaran v1/v2) |
| 1. Landing | Shell + hero + “Mau bikin apa?” + layanan + satu saldo | Landing bisa didemokan |
| 2. Landing lanjutan | Template, AI, contoh, belajar, tim, FAQ, Nala | Landing lengkap |
| 3. Harga | Halaman harga + kalkulator resep | |
| 4. Console inti | Masuk, Beranda, Saldo/top-up | |
| 5. Wizard deploy | Buat baru → ringkasan → nyala → detail proyek | Alur utama demo |
| 6. Console lengkap | AI, layanan lain, Belajar, Bantuan | |
| 7. QA & demo | QA 6 viewport per halaman, i18n, axe, skrip demo untuk stakeholder | Siap demo |

Semua fase di satu branch `v4-cloud` (dibuat 20 Nov), QA per section, commit + push per langkah, PR ke `main` per fase atas persetujuan user. Detail fase terbaru: `docs/technical-spec.md` §10.

## 7. Keputusan Tambahan (20 Nov 2026)
1. **Acuan visual: `archive/showcase/v2`** — lembar warna penuh, saklar “nyala”, angka besar, label mono bernomor; dibangun ulang dengan Tailwind v4 + token `@theme` (bukan menyalin CSS custom 1.146 baris).
2. **Tagline: “Idemu nyala, dari prompt sampai online.”**
3. **Dua bahasa: ID + EN.**
4. **Belum ada tanggal demo** → kerjakan bertahap; prioritas alur demo utama: landing → harga → wizard deploy (fase 1–5) sebelum layanan lain di console (fase 6).
