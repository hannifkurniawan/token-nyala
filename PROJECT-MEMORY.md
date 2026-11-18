# Project Memory — TokenNyala

Catatan kerja lintas sesi. **Baca file ini di awal setiap sesi baru**, lalu perbarui bagian *Status*, *Keputusan*, dan *Log Sesi* di akhir sesi.

## Status Saat Ini (per 18 Nov 2026)

- **Branch:** `v3-mobile-first` (belum di-merge ke `main`).
- **Fase:** Build v3 — shell, Hero, Cara kerja, Package picker, Checkout, Model AI + katalog, Pakai di tool, Manfaat + dashboard + Contoh, Tim & bisnis + konsultasi, FAQ + Final CTA, dan **Live chat Nala** selesai, lolos QA di 6 viewport (ID dan EN). Branch di-push ke `origin` setiap langkah selesai.
- **Berikutnya:** langkah 12 — audit kelengkapan ID/EN di seluruh halaman (teks statis, aria-label, placeholder, pesan dinamis), lalu langkah 13 — QA penuh + migrasi checkout & katalog ke `setupModal()`.
- **Utang teknis kecil:** dialog baru memakai helper `setupModal()`; checkout dan katalog masih punya logika buka/tutup sendiri — bisa dimigrasikan saat QA penuh (langkah 13). Tombol “Lihat panduan pasang” di sukses checkout mengarah ke `#pakai` (section 7, belum dibuat). Link “Butuh bantuan?” di checkout ditambahkan bersama live chat (langkah 11). Progres build dicentang di `v3/README.md`.
- **QA:** jalankan `python3 tools/qa_v3.py --interactive --out <dir>` setelah setiap section (Playwright + Chromium sudah terpasang di mesin ini). Cek juga screenshot-nya secara visual.
- **v1** (`index.html`, `styles.css`, `script.js` di root) dan **v2** (`v2-tailwind-cdn/`) = arsip. Jangan dikembangkan; boleh dibaca untuk logika JS.

## Peta Dokumen

| File | Isi |
|---|---|
| `docs/v3-ground-rules.md` | **Aturan cara membangun v3** (mobile first, Tailwind, QA per section). Menang jika konflik soal implementasi. |
| `docs/technical-spec.md` | Stack, token `@theme`, breakpoint, komponen, validasi form, Definition of Done |
| `docs/wireframe-notes.md` | Wireframe mobile (utama) lalu desktop |
| `docs/microcopy-and-states.md` | Semua copy ID/EN dan state UI |
| `docs/information-architecture.md` | Urutan section halaman |
| `docs/visual-direction.md`, `docs/brand-elements.md` | Warna, tipografi, logo |
| `docs/personas.md`, `docs/user-journey.md` | Ayu (pemula), Raka (freelancer), Dimas (tim kecil) |
| `research/reference-gap-analysis.md` | Analisis OCTA, TokenKu, OpenRouter → gap G1–G12 + rekomendasi |
| `research/reference-audit.md` | Audit referensi awal |

## Keputusan yang Sudah Diambil

| Tanggal | Keputusan | Alasan |
|---|---|---|
| 18 Nov 2026 | Buat v3 dari nol, mobile first, Tailwind; v1/v2 jadi arsip | v2 tidak benar-benar memakai Tailwind (0 class responsif), CSS desktop-first dengan tinggi fixed → tambalan responsif berulang |
| 18 Nov 2026 | Warna CTA = XL Blue. “Orange/Signal” → XL Yellow, “mint” → XL Teal | Kontradiksi antara technical-spec dan visual-direction; mark SVG memakai Yellow/Teal |
| 18 Nov 2026 | Breakpoint = default Tailwind (640/768/1024/1280) | Sebelumnya spec 640/1024 vs implementasi 768 |
| 18 Nov 2026 | Gutter 16px (<640) / 24px (≥640) | visual-direction 24px vs implementasi 16–20px |
| 18 Nov 2026 | Bahasa disimpan di `localStorage` (`tn-lang`); data kontak tidak pernah disimpan | implementation-plan vs spec |
| 18 Nov 2026 | Checkout: **satu field email ATAU nomor HP**, auto-deteksi, normalisasi `+628…` | Keputusan PO |
| 18 Nov 2026 | Tailwind v4 browser build, versi di-pin, token hanya di `@theme` | Play CDN v3 sudah lama; satu sumber token |
| 18 Nov 2026 | Scope v3 = **P1 + P2** (G1–G8); P3 (G9–G12) ditunda | Keputusan PO |
| 18 Nov 2026 | Saldo **tidak kedaluwarsa**; 1 kredit = Rp1; termasuk PPN; tidak bisa diuangkan; request gagal tidak dipotong | Rekomendasi Claude, disetujui PO; persona Ayu takut “salah beli”; setara OCTA |
| 18 Nov 2026 | Bantuan = **live chat mock “Nala”** (skrip lokal) + serah ke agen mock “Sari”, jam layanan & state offline | Keputusan PO; belajar dari OCTA “Ted” (tanpa jalur manusia) dan TokenKu (semua ke WhatsApp) |
| 18 Nov 2026 | “Sesi kecil” = ±40 rb token input + ±4 rb output; estimasi paket memakai tarif level Seimbang (±Rp1.890/sesi) | Satu definisi agar semua angka estimasi konsisten dan bisa dihitung di JS |
| 18 Nov 2026 | Model ditampilkan dengan level biaya + “≈ N sesi / Rp10.000”, detail Kredit/1M di `<details>` | Diferensiasi: OCTA/TokenKu hanya memakai satuan teknis |
| 18 Nov 2026 | ~~Logo provider tidak dipakai — monogram~~ → **diganti logo keluarga model** (Claude, OpenAI, Gemini, DeepSeek, Qwen) dari `@lobehub/icons-static-svg@1.101.0` (MIT), disimpan lokal + `SOURCE.md` | Permintaan user (“jangan gunakan anagram”). Logo hanya untuk menunjukkan model yang didukung; merek milik pemiliknya |
| 18 Nov 2026 | Form konsultasi tim 5 field, tanpa captcha, janji balas 1 hari kerja | Lebih ringan dari OCTA Enterprise (7 field + captcha, 3 hari kerja) |
| 18 Nov 2026 | Tailwind di-pin `@tailwindcss/browser@4.3.3` (rilis Juli 2026) | Versi stabil; 4.3.4/4.3.5 terlalu baru |
| 18 Nov 2026 | Komponen `@layer components` hanya: `.shell`, `.btn`, `.btn-primary`, `.btn-secondary`. Markup memakai `btn btn-primary` (bukan `@apply` berantai) | Tailwind v4 tidak bisa `@apply` class custom dari `@layer components` |
| 18 Nov 2026 | CTA header tampil mulai `sm:`; di bawah 640px CTA ada di menu mobile; language switch di header mulai `lg:` | Di 320px logo + CTA + tombol menu tidak muat dengan gutter 16px |
| 18 Nov 2026 | Kerja di branch `v3-mobile-first` | Aturan: jangan commit langsung ke `main` |
| 18 Nov 2026 | **Setiap langkah selesai: commit lalu langsung push** `v3-mobile-first` ke `origin` tanpa bertanya | Permintaan user agar bisa cek di GitHub. Merge ke `main` / PR tetap perlu persetujuan |
| 18 Nov 2026 | Board hero mulai “Belum nyala” (Rp0, meter kosong) dan menyala saat paket dipilih (`selectPackage`) | hero-and-journey-spec: meter terisi hanya setelah pemilihan paket |
| 18 Nov 2026 | Catatan “Estimasi” melayang di hero dihapus | Menutupi isi kartu di desktop; dekorasi tanpa informasi baru (aturan 8) |
| 18 Nov 2026 | Kata “mock” dihapus dari copy langkah 2 Cara kerja | Label prototype sudah ada di footer/checkout; “mock” di landing merusak kredibilitas |
| 18 Nov 2026 | Cara kerja: 3 kolom baru mulai `lg:`; di `md:` tiap kartu jadi baris (judul kiri, isi kanan) | 3 kolom di 768px membuat judul dan chip patah |
| 18 Nov 2026 | Paket: urutan kartu tetap berdasarkan harga + baris rekomendasi di atas kartu (bukan memindah kartu rekomendasi ke atas di mobile) | Memindah urutan visual lewat CSS membuat urutan fokus keyboard berbeda dari tampilan |
| 18 Nov 2026 | **Garis biru = kartu paket yang dipilih** (sebelum ada pilihan: kartu rekomendasi). Klik badan kartu memilih tanpa membuka checkout | Feedback user: kartu yang diklik tidak bergaris biru. Sebelumnya badan kartu tidak bisa diklik dan state terpilih berwarna teal |
| 18 Nov 2026 | Tab intent default: Belajar | Tab pertama + persona utama Ayu |
| 18 Nov 2026 | Kartu paket: 1 kolom → kartu baris di `md:` → 3 kolom di `lg:` | 3 kolom di 768px membuat harga meluap keluar kartu |
| 18 Nov 2026 | Format angka mengikuti bahasa: ID `Rp50.000`, EN `Rp50,000` | Sesuai microcopy EN |
| 18 Nov 2026 | Checkout 3 langkah: form → instruksi bayar per metode → sukses/gagal | Agar mock QRIS/VA/e-wallet di spec benar-benar terlihat |
| 18 Nov 2026 | Submit checkout tidak di-disable; validasi saat submit + fokus ke field salah | Tombol nonaktif tanpa penjelasan menyulitkan; konsisten dengan form konsultasi |
| 18 Nov 2026 | CTA form: `Lanjut bayar {total}` (bukan `Konfirmasi pembayaran`) | Ada langkah bayar setelahnya; total membuat aksi jelas |
| 18 Nov 2026 | Pilihan paket di dalam checkout; harga singkat `Rp100rb`/`Rp100K` di bawah 640px | CTA umum dibuka tanpa paket; harga lengkap tidak muat di 3 kolom 320px |
| 18 Nov 2026 | Kartu model & katalog dirender dari satu array `models` di JS; `per10k` dan level dihitung dari `SMALL_SESSION` | Satu sumber data; QA membandingkan hasil hitung dengan tabel spec |
| 18 Nov 2026 | Filter katalog di mobile di balik tombol `Filter (n)` | 3 baris filter memakan >50% tinggi layar 640px |
| 18 Nov 2026 | Contoh penggunaan: landing page event = 11–18 sesi ≈ Rp21–34 rb → paket Mulai cukup, CTA langsung ke checkout Mulai | Menerjemahkan “sesi kecil” ke uang dan paket nyata |
| 18 Nov 2026 | Grafik dashboard mengikuti skill dataviz (1 seri tanpa legenda, label di puncak saja, daftar sr-only) | Grafik kecil tetap terbaca & aksesibel |
| 18 Nov 2026 | Chat: `<dialog>` modal di mobile (layar penuh), non-modal di `md:` (panel 380×560) | Fokus terkunci di mobile; halaman tetap bisa dipakai di desktop (spec: `aria-modal=false`) |
| 18 Nov 2026 | Riwayat chat disimpan sebagai kunci copy, bukan teks | Ganti bahasa menerjemahkan seluruh percakapan |
| 18 Nov 2026 | Dialog hanya mengembalikan fokus bila fokus “bebas” (`focusIsFree`) | Menutup checkout untuk membuka chat sempat merebut fokus dari input chat |
| 18 Nov 2026 | Token baru `teal-ink` `#007A5E` untuk teks/ikon teal | XL Teal terlalu terang untuk teks di latar terang |

## Pertanyaan Terbuka untuk PO

1. Nominal final paket dan tarif model masih ilustratif (open item di technical-spec).
2. Aturan saldo perlu validasi legal/finance sebelum produksi.
3. Jam layanan dan SLA balasan tim nyata belum ditentukan.

## Pelajaran (jangan diulang)

- **Ganti alat ≠ ganti pendekatan.** Memuat Tailwind tidak membuat halaman mobile first; class dasar harus ditulis untuk mobile.
- **Jangan beri tinggi fixed pada kontainer berisi teks.** Ini sumber utama overflow tablet/mobile di v1/v2.
- **QA responsif per section, bukan di akhir.** Lima commit terakhir v2 semuanya perbaikan responsif yang menumpuk.
- **Rapikan kontradiksi dokumen sebelum coding.** Dokumen yang bertentangan menghasilkan implementasi yang tidak konsisten.
- **Akses web:** `octa.telkomsel.com` menolak fetch otomatis (403) dan `api.tokenku.ai/pricing` dirender JavaScript. Minta screenshot ke user; jangan mencoba mengakali blokir.
- **Grid tanpa kolom eksplisit menembus gutter.** Hero di 320px melebar ke 311px (batas 304) karena track `auto` mengikuti min-content kartu ilustrasi; `overflow-x-clip` menyembunyikannya sehingga cek overflow biasa lolos. Solusi: selalu `grid-cols-1` / `minmax(0,…)`. QA sekarang mengecek konten keluar dari `.shell`.
- **QA otomatis tidak cukup — lihat screenshot.** Di 768px harga “Rp250.000” meluap keluar kartu padahal semua cek lolos (kotak elemen tetap di dalam gutter, hanya teksnya meluap). Sekarang QA juga mengecek `scrollWidth > clientWidth`; dekorasi `::after` yang sengaja keluar ditandai `data-decor-overflow`.
- **Rangkai perintah commit dengan `&&` setelah script edit dokumen.** Script edit gagal tetapi commit tetap jalan → commit `25b8975` tanpa dokumen; diperbaiki dengan commit lanjutan.
- **`sr-only` di dalam area scroll butuh ancestor `relative`.** Radio tersembunyi di checkout posisinya absolut terhadap dialog → dialog sendiri ter-scroll 155–179px saat radio difokus (header hilang). Ditemukan dari screenshot, sekarang dicek QA (`dialog.scrollTop` harus 0).
- **Cek teks meluap harus mencakup `label`/`div`.** Kotak flex `items-start` membuat anak selebar teksnya, jadi yang meluap adalah label-nya, bukan span-nya.
- **Satuan panjang di kartu sempit → pindahkan ke keterangan.** “31,500 credits / 1M tokens” patah jadi 3 baris; sekarang “Tarif per 1 jt token” di atas dan nilai “31.500 kredit”. Begitu juga estimasi: angka besar + keterangan kecil.
- **Smooth scroll di halaman mobile yang panjang bisa >1,5 detik.** QA “panduan pasang” sempat gagal karena menunggu 0,9 detik; sekarang QA menunggu sampai `scrollY` stabil. Cek timing dulu sebelum mengubah kode.
- **Baca ulang spec interaksi, bukan hanya layout.** Spec sudah menyebut “klik package card mengubah state selected”, tetapi terlewat dan baru ketahuan dari user. Dua warna highlight (biru rekomendasi vs teal terpilih) juga membingungkan — satu warna untuk “yang aktif”.
- **`form.name` di DOM = atribut name milik form, bukan input bernama “name”.** Pakai `form.elements.namedItem()`.
- **Pesan error yang dipakai ulang harus dicek konteksnya.** Pesan kontak checkout (“…bukti pembelian…”) salah di form konsultasi.
- **Validasi sesuai urutan visual**, supaya fokus pindah ke field salah paling atas.
- **Jangan pakai `mt-auto` untuk kontrol yang bisa membuka konten (details) di kartu grid sejajar.** Membuka satu kartu memanjangkan baris dan mendorong kontrol di kartu lain ke bawah (feedback user). `mt-auto` hanya untuk tombol aksi yang memang harus sejajar di dasar.
- **Event `close` dialog datang asinkron.** Kalau satu overlay ditutup untuk membuka overlay lain, handler `close` yang mengembalikan fokus bisa merebut fokus dari overlay baru. Selalu cek `focusIsFree` sebelum memindah fokus.
- **Scroll log chat setelah semua bagian dirender** (chip mengubah tinggi log) — kalau tidak, tombol di pesan terakhir terpotong.
- **Selalu lihat versi EN di 320px.** Copy EN lebih panjang (“Start vibe-coding.” terpotong di tanda hubung → pakai U+2011).
- **Touch target 44px berlaku juga untuk link logo, link nav pendek (“FAQ”), dan tombol segmented (ID/EN).** QA shell menemukan ketiganya < 44px; pakai `min-h-11 min-w-11`.
- **Verifikasi klaim sumber kedua.** Artikel menyebut tarif OCTA tersembunyi sampai login; screenshot membuktikan tarif tampil publik. Sumber primer (screenshot/halaman asli) mengalahkan artikel.

## Log Sesi

### Sesi 1 — 18 Nov 2026
- Mendiagnosis kenapa v1/v2 terus ditambal (lihat *Pelajaran*).
- Memperbaiki kontradiksi di 9 dokumen: warna CTA, breakpoint, gutter, localStorage, field kontak (email/HP), setup Tailwind v4, aturan responsif mobile first.
- Menambahkan wireframe mobile (hero, package picker, checkout bottom sheet) di `docs/wireframe-notes.md`.
- Membuat `docs/v3-ground-rules.md`, `research/reference-gap-analysis.md`, file ini, dan `CLAUDE.md`.
- Riset referensi: OCTA (via halaman Enterprise + artikel), TokenKu landing, OpenRouter katalog model.
- PO memutuskan: P1+P2, saldo tidak kedaluwarsa, live chat mock, dan mengirim 4 screenshot (OCTA landing + katalog, OCTA Enterprise form + chat Ted, TokenKu landing, TokenKu Model Square).
- Memperbarui `research/reference-gap-analysis.md` (temuan screenshot, koreksi klaim tarif OCTA, tabel ambil/hindari, keputusan PO).
- Menspesifikasikan G1–G8: `information-architecture.md` (12 section + 4 overlay), `technical-spec.md` (aturan saldo, definisi sesi kecil, katalog 12 model mock, spesifikasi kartu model, katalog, API key, dashboard, form tim, live chat), `microcopy-and-states.md` (copy ID/EN semua fitur baru + 6 FAQ baru), `wireframe-notes.md` (wireframe mobile fitur baru), urutan build di `v3-ground-rules.md`.
- Commit dokumen (`e715849`) di branch baru `v3-mobile-first`.
- Langkah 2: membuat shell `v3/` + `tools/qa_v3.py` (QA Playwright 6 viewport). QA awal menemukan touch target < 44px (logo, nav, ID/EN) → diperbaiki → semua viewport lolos.
- Section Hero: copy ID/EN, board ilustrasi dengan status saldo (`renderHeroBalance`), animasi masuk 450ms dengan reduced-motion. QA menemukan konten menembus gutter di 320px (grid tanpa `grid-cols-1`, tersembunyi oleh `overflow-x-clip`) → diperbaiki, dan `tools/qa_v3.py` ditambah cek “escape .shell” + cek above-the-fold.
- Section Cara kerja: 3 langkah dengan chip dan garis penghubung; teks ID juga ditulis di HTML (fallback tanpa JS). QA visual menemukan 3 kolom terlalu sempit di 768px → layout baris di `md:`.
- Section Package picker (`25b8975`): tablist dengan panah/Home/End, baris rekomendasi, 3 kartu dengan state Paling pas/Dipilih, `selectPackage` menyalakan board hero, pengumuman `aria-live`. QA visual menemukan harga meluap di 768px dan ruang kosong di kartu mobile → layout baris `md:`, baris badge kolaps; QA ditambah cek teks meluap + uji interaksi paket.
- Section Checkout: `<dialog>` bottom sheet/tengah, pilihan paket, rincian biaya, email/HP dengan normalisasi `+628…`, QRIS (QR SVG contoh), VA (nomor lokal), e-wallet, sukses dengan API key `tn-demo-…` + salin, state gagal; fokus kembali ke pembuka (fallback ke tombol menu). QA ditambah uji alur checkout penuh; ditemukan & diperbaiki: dialog ikut ter-scroll (sr-only tanpa ancestor relative) dan harga meluap di 320px EN.
- Push pertama `v3-mobile-first` ke `origin` (atas permintaan user) sampai `41c9ca3`.
- Section Model AI: 6 kartu dari data, dialog katalog (full screen mobile, filter toggle, search, filter OR/AND, tampilkan lebih banyak + fokus, empty state, hapus filter). QA ditambah uji katalog + validasi angka vs spec. Visual: badge level menghimpit meta → meta baris penuh; estimasi & tarif patah → angka besar + keterangan; filter 3 kolom tidak muat di 768px → 2 baris.
- Section Pakai di tool: timeline 3 langkah, kartu konfigurasi (Base URL `.example`, key contoh, salin dengan pengumuman `aria-live` yang benar di dalam/luar modal), CTA isi saldo; “Lihat panduan pasang” tersambung (tutup → scroll → fokus judul). Visual: URL/key patah di tengah kata di 320px → ditumpuk + `<wbr>`.
- Fix dari feedback user: klik kartu paket memilih (garis biru pindah ke kartu itu, hero menyala) tanpa membuka checkout; tombol kartu tetap memilih + checkout. QA ditambah uji klik badan kartu.
- Section Manfaat + Contoh: 3 kartu + kartu “Pantau & kendalikan” dengan mock dashboard (saldo, grafik 7 hari, switch pengingat, toggle API key) dan section contoh landing page event. Visual: batang terlalu lebar di 768px → maks 28px; label puncak menabrak judul grafik, baris key terpotong, ikon kartu 4 menghimpit judul di 320px → diperbaiki. QA ditambah uji switch & toggle key.
- Section Tim & bisnis: strip gelap dengan 4 poin + CTA; dialog konsultasi (helper `setupModal`), validasi 5 aturan, counter 500 dengan pengumuman ≥450, sukses + reset. Visual: pesan kontak salah konteks dan placeholder terpotong → pesan khusus + kontak lebar penuh; urutan validasi disamakan dengan urutan tampil. QA ditambah alur konsultasi penuh.
- Atas permintaan user: monogram di kartu model diganti logo keluarga model (SVG lokal dari lobehub, diperiksa: tanpa script/referensi eksternal). QA ditambah cek gambar rusak di seluruh halaman + cek ikon kartu model termuat.
- Fix dari feedback user: “Detail tarif” di kartu model tidak lagi turun saat kartu lain di baris yang sama dibuka (hapus `mt-auto`). QA ditambah uji posisi.
- Section FAQ + Final CTA: 11 pertanyaan `<details>` (ID/EN), jawaban refund diperbarui karena saldo tidak kedaluwarsa; banner “Nyala sekarang.” dengan CTA isi saldo + lihat paket. QA ditambah uji buka FAQ dengan klik dan Enter.
- Langkah 11 Live chat Nala: pill + panel, skrip & kata kunci ID/EN, alur pilih paket (matriks spec) → checkout, tim online (Sari) / offline (kumpulkan kontak), riwayat ikut terjemah, titik masuk FAQ & checkout. QA: alur chat penuh (pill tidak menutupi CTA hero, hasil rekomendasi, ke checkout dan kembali, ganti bahasa, Escape, online/offline). Ditemukan & diperbaiki: fokus direbut event close checkout, tombol hasil terpotong (urutan scroll), chip menumpuk di 320px, header offline salah.
