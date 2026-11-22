# Project Brief v4 — TokenNyala

## Produk
TokenNyala adalah **platform AI Cloud Services** berbahasa Indonesia/Inggris untuk orang yang mulai membangun proyek dengan AI. Satu tempat untuk **AI yang membantu membangun** dan **cloud yang menjalankan hasilnya** — hosting, asisten & otomasi siap pakai, server, database, penyimpanan file, domain, email, dan terima pembayaran — dibayar dari **satu saldo Rupiah**.

**Tagline:** *Idemu nyala, dari prompt sampai online.*
EN: *Your idea, switched on — from prompt to online.*

## Kenapa berubah dari v3
v3 menjawab “berapa saldo AI yang harus dibeli?”. Feedback Pak Ferry (20 Nov 2026): yang diharapkan adalah platform seperti helipod.io dan sumopod.com. Vibecoder memang tidak berhenti di token: setelah AI menulis kode, mereka butuh tempat untuk **meng-online-kan, menyimpan data, memasang domain, dan menjalankan agent 24 jam**.

## Tujuan bisnis
Membuat pemula bisa **memilih, membayar, dan menyalakan** layanan cloud + AI tanpa memahami vCPU, region, root password, kurs dolar, atau tagihan per token.

## User utama
Vibecoder pemula Indonesia 18–35 tahun (persona **Ayu**). Persona sekunder: **Raka** (freelancer, banyak proyek klien) dan **Dimas** (tim kecil, butuh kontrol & faktur). Lihat `docs/archive/personas.md` dan skenario v4 di `user-journeys.md`.

## Masalah utama
Pemula punya tiga pertanyaan:
1. **“Untuk proyek saya, butuh layanan apa saja?”**
2. **“Totalnya berapa per bulan?”**
3. **“Bagaimana caranya sampai online?”**

Pesaing menjawab dengan menu dan satuan teknis:
- **Sumopod:** 18 menu, form root password/provider/region/OS, AI dibayar dari saldo **USD terpisah** dengan kurs, harga tidak ada di landing.
- **Helipod:** bahasa engineer (pod, vCPU, CU-jam, rollout), 7 produk berbobot sama, total proyek harus dihitung sendiri.

## Janji inti
**Mulai dari tujuan, bukan dari menu.** Pilih “mau bikin apa?”, TokenNyala merangkai layanannya, menunjukkan **satu angka Rupiah per bulan**, lalu menyalakannya dalam beberapa ketukan.

## Pembeda
1. **Paket berdasarkan tujuan** — “Landing page / portofolio”, “Chatbot WhatsApp”, “Website klien”, “Otomasi tim”, “AI untuk tool coding”.
2. **Satu saldo Rupiah** untuk semua layanan dan AI — tanpa kartu kredit, tanpa saldo kedua, tanpa kurs.
3. **Bahasa awam dulu, detail teknis bisa dibuka** — ukuran *Coba-coba / Rutin / Ramai* dengan “cukup untuk …”; vCPU/RAM di bagian detail.
4. **Biaya tetap vs biaya pakai** dipisah jelas, plus perkiraan “saldo cukup sampai tanggal …”.
5. **Aman untuk pemula** — berhenti kapan saja dengan sisa hari kembali ke saldo, ganti ukuran naik/turun, layanan dijeda (bukan dihapus) saat saldo habis.
6. **Belajar di dalam produk** — panduan per tujuan dan asisten Nala, bukan hanya video di luar.
7. **Unique design taste** — bahasa visual showcase v2: lembar warna penuh, saklar “nyala”, angka besar.

## Aksi utama
**Mulai bangun** (pilih tujuan → paket → nyalakan).

## Aksi sekunder
- Lihat harga semua layanan.
- Isi saldo.
- Pakai AI di tool coding (API key).
- Konsultasi untuk tim.
- Ganti bahasa.

## Cakupan prototype
| Bagian | Isi |
|---|---|
| Landing | Cerita “dari prompt sampai online”, pemilih tujuan + paket, semua layanan, satu saldo, template, AI, contoh, belajar, tim, FAQ, Nala |
| Harga | Semua layanan dalam satu halaman + kalkulator paket |
| Console (mock) | Masuk, Beranda, Buat baru (wizard), Proyek, AI, Saldo, Layanan lain, Belajar, Bantuan |

Data, pembayaran, deploy, dan URL adalah **simulasi** yang diberi label jelas.

## Metrik keberhasilan (untuk produk nyata)
- Klik “Mulai bangun” dan pemilihan paket.
- Penyelesaian wizard sampai “nyala” (deploy mock).
- Waktu dari landing sampai layanan pertama nyala.
- Top-up pertama dan top-up ulang.
- Proporsi user yang memakai ≥2 layanan (AI + cloud).
- Pertanyaan bantuan tentang “butuh apa / berapa”.

## Batasan
- Prototype statis (HTML + Tailwind + JS), jalan lewat `file://` dan server lokal, tanpa backend.
- Harga & data ilustratif, diberi label “contoh”.
- Mobile first; demo langsung ke Pak Ferry.
- Aksesibel (WCAG 2.1 AA), keyboard-friendly, ID/EN lengkap.
