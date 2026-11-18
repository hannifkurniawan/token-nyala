# Reference Gap Analysis — OCTA, TokenKu, OpenRouter vs Dokumen TokenNyala

Tanggal: 18 November 2026
Tujuan: menemukan hal yang ada di referensi tetapi **belum ada** di dokumen kita, lalu memutuskan apa yang perlu ditambahkan untuk v3.

## Sumber dan Batasan

| Referensi | Yang berhasil dibaca | Batasan |
|---|---|---|
| OCTA Telkomsel (`octa.telkomsel.com`) | Halaman produk OCTA Enterprise di telkomsel.com; artikel quasa.io; liputan Bali Tech Week 2026; **screenshot dari PO** (katalog model, form konsultasi, chat “Ted”) | `octa.telkomsel.com` menolak akses otomatis (HTTP 403); detail section diambil dari screenshot. |
| TokenKu (`tokenku.ai`) | Landing page lengkap + screenshot section model | — |
| TokenKu Pricing (`api.tokenku.ai/pricing`) | **Screenshot dari PO** (“Model Square”) | Halaman dirender JavaScript; tidak terbaca otomatis. |
| OpenRouter (`openrouter.ai/models`) | Pola katalog model | Pembanding internasional, bukan pasar Indonesia. |

## Ringkasan Temuan per Referensi

### OCTA — Telkomsel
- **Positioning:** satu API dan satu saldo untuk banyak model AI (“One Core, a Thousand AI-bilities”). Diluncurkan di Bali Tech Week, Oktober 2026.
- **Model:** OpenAI, Claude, Gemini, DeepSeek, dan model lain. API kompatibel OpenAI, bisa dipakai di aplikasi chat dan **coding tools**.
- **Paket (sudah termasuk PPN):** Basic Rp100.000, Medium Rp250.000, Pro Rp500.000. **1 kredit = Rp1**, tanpa diskon per kredit, bonus kuota internet 0,5 GB.
- **Aturan kredit:** tidak kedaluwarsa (kecuali disebutkan), tidak bisa dipindahtangankan atau diuangkan, request gagal tanpa output tidak memotong kredit.
- **Akses:** nomor Telkomsel aktif + OTP, usia 18+. Pembelian lewat MyTelkomsel (pulsa, tagihan pascabayar, metode lain).
- **Fitur platform:** buat API key, pilih model, cek saldo, riwayat pemakaian, beli paket saat saldo menipis.
- **Data:** input dikirim ke provider model; pemrosesan bisa di luar Indonesia sesuai model; Telkomsel menyatakan data tidak dipakai untuk training.
- **Enterprise:** tombol “Konsultasi Sekarang”, form konsultasi (nama, email, HP, perusahaan, bidang usaha, skala karyawan, pertanyaan), janji balasan dalam **3 hari kerja**, studi kasus per industri, FAQ 6 pertanyaan, cookie notice, link Kebijakan Privasi dan Syarat & Ketentuan.
- **Koreksi:** artikel quasa.io menyebut tarif per model baru terlihat setelah login. **Screenshot menunjukkan sebaliknya**: tarif tampil publik di modal “Model AI Yang Tersedia” (lihat bagian *Temuan dari Screenshot*). Yang memang belum ada di OCTA adalah terjemahan tarif ke bahasa awam (berapa kali pakai untuk Rp sekian).

### TokenKu
- **Positioning:** “Satu Gateway untuk Semua Model AI” — satu tagihan Rupiah.
- **Model:** 120+ model; ditampilkan sebagai kartu per provider (DeepSeek, Qwen, Claude, Gemini, ChatGPT, Grok) dengan badge diskon (“hemat hingga 25%*”).
- **Onboarding 4 langkah:** dapatkan API key → jalankan banyak model → pantau pemakaian (“Tokens Metered”) → hemat hingga 25%.
- **Before/After:** langganan per seat, kartu kredit USD atas nama karyawan, API key tersebar, tanpa SLA → bayar sesuai pemakaian, transfer Rupiah dengan invoice perusahaan, satu gateway dengan audit, **tim lokal berbahasa Indonesia**.
- **Bantuan:** semua CTA “Mulai Sekarang” membuka **WhatsApp**; ada widget WhatsApp melayang di setiap halaman.
- **Kelemahan:** tanda bintang diskon tanpa catatan kaki, tidak ada FAQ, tidak ada kebijakan privasi/syarat di footer, tidak ada alur self-serve (semua lewat WhatsApp).

### OpenRouter (pembanding)
- Katalog model dengan pencarian, tab modalitas, dan kartu berisi: nama, provider, deskripsi singkat, context length, harga input/output per 1 juta token.
- Deskripsi kadang memberi arahan (“untuk coding sehari-hari, pakai varian standar”) — pola yang bisa kita sederhanakan untuk pemula.

## Temuan dari Screenshot (dikirim PO, 18 Nov 2026)

### OCTA — landing `octa.telkomsel.com`
- **Navigasi:** Model AI · Paket · Keunggulan · Cara Pakai · FAQ · tombol **Masuk**.
- **Dua jalur audiens di atas fold:** kartu “AI untuk Penggunaan Pribadi” → *Masuk Dengan Nomor Telkomsel*; kartu “Solusi AI Untuk Perusahaan” → *Konsultasi Dengan Kami*.
- **Modal “Model AI Yang Tersedia”:**
  - Subjudul: *“Satu OCTA Kredit untuk semua model AI. Paket apa pun, pilihan modelnya sama.”*
  - Search (“Cari model, misalnya Claude”) + filter dropdown **Kegunaan** dan **Penyedia**.
  - Kartu 3 kolom: ikon provider, nama model, nama provider, tag kapabilitas (“Chat”), chevron ke detail, badge diskon merah (−10% / −20%), lalu **Input … Kredit/1 M**, **Output … Kredit/1 M**, **Context**.
  - Contoh tarif: Claude Sonnet 5 — input 31.500, output 157.500 Kredit/1M; Claude Opus 5.5 — 63.000 / 315.000; Gemini 3.1 Pro Preview — 31.500 / 189.000.
  - Pagination: “Menampilkan 1 sampai 9 dari 82 model”, 10 halaman.
- **Paket:** Rp100.000 / Rp250.000 / Rp500.000, masing-masing tombol *Beli*. Section berikutnya: “Lebih fleksibel atur biaya AI sesuai kebutuhanmu”.
- **Bantuan:** pill melayang kanan bawah “Butuh bantuan?” dengan foto avatar.
- **Catatan UX:** tarif dalam “Kredit per 1 juta token” akurat tetapi **tidak bisa dibaca pemula** — tidak ada padanan “berapa kali pakai”. Pagination 10 halaman berat di mobile.

### OCTA Enterprise — form konsultasi & chat “Ted”
- **Form (modal, 2 kolom di desktop):** Nama Lengkap*, Email*, No. Handphone*, Nama Perusahaan*, Bidang Bisnis* (dropdown), Skala Bisnis* (dropdown), “Apa yang Anda ingin ketahui lebih lanjut?” (textarea, counter 0/500), checkbox wajib Syarat & Ketentuan + Kebijakan Privasi, checkbox opsional, reCAPTCHA, tombol *Kirim* nonaktif sampai valid.
- **Chat “Consult with Ted”:** panel kanan bawah bertema gelap, avatar manusia, sapaan “Halo, Ted disini — Ada yang bisa dibantu?”, **chip pertanyaan cepat** (apa itu telkomsel enterprise, solusi konektivitas, solusi IoT), input “Tuliskan kebutuhan Anda…”, tombol refresh, dan **disclaimer**: *“Ted is a Generative AI in the early stage version. May display inaccurate information.”*
- **Catatan UX:** form 7 field + 2 checkbox + captcha terlalu berat untuk tim kecil (persona Dimas). Chat jujur soal AI, tetapi tidak terlihat jalur ke manusia.

### TokenKu — landing `tokenku.ai`
- Tema navy gelap; marquee logo provider (OpenAI, Gemini, Grok, Dreamina AI, Claude).
- “Hemat Biaya Token AI Hingga **25%***” — kartu per provider (DeepSeek, Qwen, Claude, Gemini, ChatGPT, Grok) dengan segel diskon kuning 20–25% dan daftar versi model dalam font mono.
- CTA “Lihat 120+ Model Lainnya”; switch bahasa ID melayang kiri bawah; tombol WhatsApp melayang kanan bawah.

### TokenKu — “Model Square” `api.tokenku.ai/pricing`
- Navigasi: Home, Console, Model Square, Docs, Hypernet; toggle mata uang (**default USD**), bahasa, dark mode, notifikasi, Sign in.
- Sidebar filter: Vendor (Anthropic 13, OpenAI 18, Google 12, DeepSeek 9, Bytedance 32, …), Pricing type (token-based / per request), Suppliers, Input modality, Output modality.
- Tab kategori dengan jumlah: All 144, Text 107, Image 16, Audio 1, Video 20, …
- Toolbar: search, **Download quotation**, toggle **/1M – /1K**, sort Name, toggle grid/list.
- Kartu: ID model (mono), deskripsi, ikon modalitas (T 🖼 → T), label TOKEN-BASED, badge “From 20% off”, harga coret → harga diskon untuk Input, Output, Cached, Cache Write (5m/1h) per 1M.
- **Catatan UX:** sangat lengkap untuk developer (persona Dimas), tetapi untuk pemula terlalu teknis: istilah cache write, harga USD padahal landing menjanjikan tagihan Rupiah.

### Pola yang Kita Ambil vs Hindari

| Ambil | Hindari |
|---|---|
| Kalimat “Satu saldo untuk semua model, paket apa pun pilihan modelnya sama” (OCTA) | Tarif hanya dalam Kredit/1M token tanpa padanan awam (OCTA) |
| Search + filter **Kegunaan** + **Penyedia** (OCTA) | Pagination 10 halaman di mobile (OCTA) |
| Tarif tampil publik tanpa login (OCTA, TokenKu) | Default USD dan istilah cache (TokenKu Model Square) |
| Chip pertanyaan cepat + disclaimer AI di chat (OCTA “Ted”) | Chat tanpa jalur ke manusia (OCTA) |
| Pill “Butuh bantuan?” melayang (OCTA) | Semua CTA ke WhatsApp (TokenKu) |
| Dua jalur audiens: pribadi vs tim (OCTA) | Form konsultasi 7 field + captcha (OCTA Enterprise) |
| Toggle detail teknis untuk pengguna lanjut (TokenKu /1M–/1K) | Diskon bertanda bintang tanpa catatan (TokenKu) |

## Gap: Yang Ada di Referensi tetapi Belum Ada di Dokumen Kita

Prioritas: **P1** = perlu masuk v3, **P2** = sebaiknya masuk, **P3** = opsional / nanti.

| # | Gap | Dilihat di | Kondisi dokumen kita | Prioritas |
|---|---|---|---|---|
| G1 | **Informasi model AI yang didukung** | OCTA, TokenKu, OpenRouter | Sengaja tidak model-first, tetapi sama sekali tidak menyebut model. Pemula tetap perlu tahu “bisa pakai Claude/GPT/Gemini?” untuk percaya. | P1 |
| G2 | **Definisi kredit & aturan saldo** (1 kredit = Rp?, PPN, masa berlaku, tidak bisa diuangkan, request gagal tidak dipotong) | OCTA | Ada “bonus credit”, tetapi satuan kredit, PPN, dan masa aktif masih “open item”. | P1 |
| G3 | **Cara memakai saldo di tool** (API key + base URL, kompatibel OpenAI, contoh tool coding) | OCTA, TokenKu | “Satu saldo untuk AI tools” masih abstrak. Success state tidak memberi langkah berikutnya yang konkret. | P1 |
| G4 | **Konsultasi / bantuan manusia** (chat, WhatsApp, form, jam layanan, SLA balasan) | OCTA, TokenKu | Hanya satu state “Ada yang belum pas?” di microcopy. Tidak ada kanal, jam, atau entry point di halaman. | P1 |
| G5 | **Transparansi harga per model sebelum beli** | OCTA (Kredit/1M), TokenKu Model Square, OpenRouter | Tidak ada. Diferensiasi: tampilkan level biaya (Hemat/Seimbang/Premium) **dan** padanan awam “≈ N sesi kecil per Rp10.000”, dengan detail Kredit/1M bisa dibuka. | P2 |
| G6 | **Pemantauan pemakaian & kontrol** (riwayat, saldo menipis, batas budget, keamanan API key) | OCTA, TokenKu | Hanya disebut sekilas (“returning user”, “dashboard error”). Tidak ada visual atau benefit card. | P2 |
| G7 | **Jalur bisnis/tim** (invoice perusahaan, faktur pajak, transfer bank, form konsultasi B2B) | OCTA Enterprise, TokenKu | Persona Dimas butuh ini, tetapi tidak ada section atau CTA “Untuk tim”. | P2 |
| G8 | **Privasi & lokasi pemrosesan data** (data dikirim ke provider, bisa di luar negeri, tidak untuk training) | OCTA | Tidak ada di FAQ. | P2 |
| G9 | **Aturan pemakaian** (dilarang menjual ulang / berbagi API key, setiap provider punya batasan sendiri) | OCTA | Tidak ada. | P3 |
| G10 | **Legal & kepatuhan halaman** (Syarat & Ketentuan, Kebijakan Privasi, cookie notice) | OCTA | Footer hanya “link bantuan dan legal mock”. | P3 |
| G11 | **Section perbandingan Before/After** | TokenKu | Ada di `hero-and-journey-spec.md` sebagai ide, belum masuk IA. | P3 |
| G12 | **Konten edukasi / Insights** | TokenKu | Hanya “View usage guide” sebagai aksi sekunder. | P3 |

## Rekomendasi Penambahan ke Dokumen

### G1 — Section “Model yang bisa kamu pakai” (P1)
- Taruh **setelah** package picker, supaya alur tetap intent-first.
- Tampilkan 4–6 keluarga model (Claude, GPT, Gemini, DeepSeek, Qwen) sebagai kartu ringkas: logo teks (bukan logo resmi), satu kalimat “cocok untuk …”, dan level biaya **Hemat / Seimbang / Premium**.
- Data mock, dengan label “Contoh — daftar dan tarif dapat berubah”.
- Dokumen terdampak: `information-architecture.md`, `technical-spec.md` (data model `models`), `microcopy-and-states.md`.

### G2 — Aturan saldo yang jelas (P1)
Usulan aturan prototype (perlu disetujui):
- 1 kredit = Rp1; harga paket sudah termasuk PPN.
- Bonus kredit tetap dipertahankan sebagai pembeda dari OCTA.
- Saldo tidak kedaluwarsa selama akun aktif (atau masa aktif 12 bulan — pilih salah satu).
- Saldo tidak bisa diuangkan atau dipindahtangankan.
- Request gagal tanpa output tidak memotong saldo.
- Ditampilkan sebagai baris kecil di kartu paket + FAQ.

### G3 — “Pakai di tool favoritmu” (P1)
- Section 3 langkah: Salin API key → Tempel base URL di tool (contoh: Cursor, Cline, Continue, aplikasi chat yang mendukung OpenAI API) → Mulai prompt.
- Success state checkout diganti dari “Kembali ke proyek” menjadi dua aksi: **“Salin API key (contoh)”** dan **“Lihat panduan pasang”**.
- Copy tetap bebas jargon: “API key” dijelaskan sebagai “kunci untuk menghubungkan tool ke saldomu”.

### G4 — Bantuan manusia + chat (P1)
- **Tombol bantuan melayang** (pojok kanan bawah, di atas safe area) → panel **live chat mock**: asisten otomatis dengan chip pertanyaan cepat (“Bantu pilih paket”, dll.) dan jalur “Bicara dengan tim” yang menyerahkan percakapan ke agen manusia (simulasi). *(Diputuskan PO: live chat, bukan WhatsApp.)*
- Tampilkan **jam layanan** dan **perkiraan waktu balas** (mis. “Senin–Jumat 09.00–18.00 WIB, biasanya dibalas < 15 menit”) — mock, diberi label contoh.
- Di checkout: link kecil “Butuh bantuan?” di atas tombol konfirmasi.
- Pelajaran dari TokenKu: **jangan jadikan WhatsApp satu-satunya jalan** — pembelian tetap self-serve.
- Mobile: tombol tidak boleh menutupi CTA sticky atau tombol konfirmasi checkout (sembunyikan saat checkout terbuka).

### G5 — Transparansi harga sebelum beli (P2)
- Link “Lihat tarif per model” membuka tabel sederhana (bukan halaman login): model, level biaya, estimasi “≈ sesi kecil per Rp10.000”.
- Ini diferensiasi langsung terhadap kritik ke OCTA.

### G6 — Pemantauan & kontrol (P2)
- Satu benefit card + mock mini dashboard: saldo tersisa, pemakaian 7 hari, notifikasi saldo menipis, tombol nonaktifkan API key.

### G7 — Jalur tim/bisnis (P2)
- Strip kecil sebelum FAQ: “Butuh untuk tim atau perusahaan?” → invoice atas nama perusahaan, faktur pajak, transfer bank → CTA “Konsultasi untuk tim” (form mock: nama, email/HP, perusahaan, jumlah anggota tim, kebutuhan).

### G8–G10 — FAQ & footer (P2–P3)
Tambahan FAQ:
- “Model apa saja yang bisa dipakai?”
- “Apakah saldo bisa kedaluwarsa?”
- “Apakah kena PPN?”
- “Ke mana data prompt saya dikirim?”
- “Bagaimana kalau API key saya bocor?”
- “Bisakah saya berbagi atau menjual ulang API key?”

Footer: Syarat & Ketentuan (mock), Kebijakan Privasi (mock), Hubungi kami.

## Yang Sengaja Tidak Ditiru

- **Model-first di hero** (TokenKu: “120+ model”). Persona utama kita adalah pemula; jumlah model bukan alasan mereka membeli.
- **Diskon dengan tanda bintang tanpa penjelasan** (TokenKu). Setiap klaim harus punya catatan yang terlihat.
- **Semua CTA ke WhatsApp** (TokenKu). Pembelian harus bisa selesai sendiri.
- **Tarif hanya dalam satuan teknis** (OCTA Kredit/1M, TokenKu USD/1M). Estimasi harus bisa dibaca pemula sebelum membayar.
- **Login wajib dengan nomor operator tertentu** (OCTA). Kita menerima email atau nomor HP apa pun.

## Keputusan PO (18 Nov 2026)

1. **Scope v3: P1 + P2** → G1–G8 masuk. G9–G12 (P3) ditunda.
2. **Masa berlaku saldo: tidak kedaluwarsa** (rekomendasi Claude, disetujui PO). Alasan: persona Ayu membeli sesekali dan takut “salah beli”; setara dengan OCTA. Perlu validasi legal/finance sebelum produksi.
3. **Kanal bantuan: live chat mock** (asisten otomatis + serah ke tim manusia), bukan WhatsApp.
4. Screenshot OCTA dan TokenKu sudah diterima dan dianalisis di atas.

Spesifikasi hasil keputusan ini ada di `docs/technical-spec.md` (section *Fitur v3*), `docs/microcopy-and-states.md`, `docs/information-architecture.md`, dan `docs/wireframe-notes.md`.

## Sumber
- https://www.telkomsel.com/enterprise/product-list-business-application-and-solution/octa-enterprise
- https://quasa.io/id/media/octa-telkomsel-membuka-api-multi-model-tetapi-tarif-model-belum-terbuka
- https://selular.id/2026/10/telkomsel-pamerkan-9-solusi-ai-lokal-di-bali-tech-week-2026/
- https://tokenku.ai/
- https://api.tokenku.ai/pricing (hanya judul halaman yang terbaca)
- https://openrouter.ai/models
