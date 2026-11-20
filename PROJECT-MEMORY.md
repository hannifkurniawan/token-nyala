# Project Memory — TokenNyala

Catatan kerja lintas sesi. **Baca file ini di awal setiap sesi baru**, lalu perbarui bagian *Status*, *Keputusan*, dan *Log Sesi* di akhir sesi.

## Status Saat Ini (per 20 Nov 2026)

- **Branch:** v3 sudah di-merge ke `main` lewat PR #1 (merge commit `3b631e3`, 18 Nov 2026). Branch `v3-mobile-first` masih ada di remote (tidak dihapus). Pekerjaan baru: buat branch baru dari `main`, push setiap langkah, merge lewat PR atas persetujuan user.
- **Fase:** **v3 selesai** — semua 13 langkah build, DoD 21/21 terpenuhi (lihat tabel di `docs/technical-spec.md`). Lolos `qa_v3.py` (6 viewport), `i18n_check.py`, dan `audit_v3.py` (axe 0 pelanggaran).
- **Fase v4 (branch `v4-cloud`):** Fase 0 (dokumen), **Fase 1** (setup + landing bagian 1) dan **Fase 2** (landing lengkap: template, AI + katalog, contoh, aman, belajar, tim + konsultasi, FAQ 13, CTA akhir, motion GSAP/Lenis, chat Nala dengan alur resep) selesai — `v4/index.html` utuh. **Fase 3** (`harga.html`) dan **Fase 4** (console `app.html`: kerangka, router, store + preset, masuk, beranda, saldo + isi saldo) selesai. **Fase 0–7 selesai (20 Nov 2026)** — v4 lengkap: landing, harga, console. DoD 12/12 terpenuhi (bukti di `docs/v4/technical-spec.md` §9). Gladi demo: `python3 -P tools/demo_v4.py`. **Menunggu:** persetujuan user untuk PR `v4-cloud` → `main`; review Pak Ferry; validasi finance/legal aturan tagihan & harga contoh. User minta lanjut sampai Fase 7 tanpa berhenti (20 Nov). QA v4: `python3 -P tools/qa_v4.py --interactive --out <dir>`, `python3 -P tools/i18n_check.py --root v4`, `python3 -P tools/audit_v4.py`; build CSS `npm run build` di `v4/`. Open item v3 lama: (harga/tarif nyata, validasi legal aturan saldo & logo, og:image, halaman legal, Tailwind CLI untuk produksi).
- **Audit bahasa:** `python3 tools/i18n_check.py` setelah menambah/mengubah copy.
- **QA:** jalankan `python3 tools/qa_v3.py --interactive --out <dir>` setelah setiap section (Playwright + Chromium sudah terpasang di mesin ini). Cek juga screenshot-nya secara visual.
- **Tipografi (20 Nov):** 2 keluarga, 4 face (Manrope 500/700/800 + IBM Plex Mono 500) — di-merge ke `main` lewat PR #3 (branch `type-scale-trim`). Aturan lengkap: `docs/visual-direction.md` → Typography. Jangan menambah keluarga/weight baru tanpa persetujuan user (user ingin font sedikit).
- **`showcase/`** (commit user `0bcc69e`, 20 Nov): folder hasil akhir “v1” dan “v2” versi user (berisi turunan v3 + GSAP/Lenis). Bukan buatan Claude; jangan diedit tanpa diminta.
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
| `docs/v4/README.md` | **Dokumen v4 (aktif)**: brief, services-and-pricing (sumber angka), IA, user-journeys + skrip demo, wireframes, microcopy, visual-direction, technical-spec (aturan membangun + DoD) |
| `docs/v4-cloud-plan.md` | **Rencana v4 platform AI cloud** (draf): layanan berbahasa awam, resep per persona, peta halaman landing/harga/console, tahapan |
| `research/ai-cloud-reference.md` | Teardown Sumopod & Helipod (AI cloud), peluang, pertanyaan untuk Pak Ferry |

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
| 18 Nov 2026 | Token `muted` → `#626B82` (dari `#69728A`) | axe: 4,47:1 di header sticky (< AA); nilai baru ≥ 4,84:1 di semua latar |
| 18 Nov 2026 | Semua modal (checkout, katalog, konsultasi) memakai `setupModal()`; chat tetap sendiri (modal di mobile, non-modal di desktop) | Satu perilaku buka/tutup/fokus; utang teknis lunas |
| 18 Nov 2026 | Token baru `teal-ink` `#007A5E` untuk teks/ikon teal | XL Teal terlalu terang untuk teks di latar terang |
| 20 Nov 2026 | Tipografi = **2 keluarga, 4 face**: Manrope 500 (body, `font-medium` di `body`), 700 (`font-bold`, dulu juga `font-semibold`), 800 (`font-extrabold`); IBM Plex Mono 500 saja. Tanpa `font-semibold`/weight di mono | User ingin font tidak terlalu banyak. Sebelumnya 6 file dimuat, dan teks body meminta 400 yang tidak dimuat (dirender 500). Dicek `audit_v3.py` |
| 20 Nov 2026 | **Arah produk berubah: TokenNyala = platform AI Cloud Services** (referensi helipod.io & sumopod.com), bukan hanya jualan token | Feedback Pak Ferry setelah demo showcase v1/v2; dikonfirmasi user |
| 20 Nov 2026 | Cakupan layanan: **semua layanan** (AI API, app/agent sekali klik, hosting app, VPS, database, domain, email, dll.) | Jawaban konfirmasi no. 2 |
| 20 Nov 2026 | Target utama tetap **vibecoder pemula**, mengikuti persona yang ada (Ayu, Raka, Dimas) | Jawaban no. 3 |
| 20 Nov 2026 | Deliverable: **semuanya** — landing, halaman harga, mock dashboard/console, alur deploy | Jawaban no. 4 |
| 20 Nov 2026 | **Satu saldo Rupiah** untuk semua layanan | Jawaban no. 5; pembeda dari Sumopod (2 saldo, AI dalam USD) |
| 20 Nov 2026 | Nama TokenNyala tetap; **hanya tagline yang berubah** | Jawaban no. 6 |
| 20 Nov 2026 | Pembeda: **paling mudah dipahami pemula**, “unique design taste”, tidak terlalu teknis | Jawaban no. 7 |
| 20 Nov 2026 | Review berikutnya: **demo langsung, mobile first**; acuan visual = `showcase/v1` & `showcase/v2` | Jawaban no. 8 |
| 20 Nov 2026 | Acuan visual v4 = **showcase v2**, dibangun ulang dengan Tailwind v4 | Pilihan user; paling sesuai “unique design taste” |
| 20 Nov 2026 | Tagline: **“Idemu nyala, dari prompt sampai online.”** | Pilihan user |
| 20 Nov 2026 | v4 tetap **ID + EN** | Pilihan user; infrastruktur i18n sudah ada |
| 20 Nov 2026 | Belum ada tanggal demo → bertahap, prioritas landing → harga → wizard deploy | Pilihan user |
| 20 Nov 2026 | v4 memakai **Tailwind CLI** (`@tailwindcss/cli` di-pin), CSS hasil compile di-commit | 3 halaman berbagi satu `@theme`; tetap jalan di `file://`; menutup open item v3 |
| 20 Nov 2026 | JS v4 = script klasik + namespace `window.TN`, bukan ES module | ES module diblokir CORS di `file://` |
| 20 Nov 2026 | Lebar konten v4 maks 1280px, gutter 16/24/40/64 | Jalan tengah v3 (1184) dan showcase v2 (1600) |
| 20 Nov 2026 | Loader dan kursor custom showcase v2 tidak dibawa; muted `#626B82`, teal-ink `#007A5E` | LCP/aksesibilitas; kontras AA (keputusan v3) |
| 20 Nov 2026 | Ukuran bersama **Coba-coba / Rutin / Ramai** (Rp15/35/75 rb) untuk hosting & template; biaya tetap dipotong per 30 hari; berhenti → sisa hari kembali; saldo habis → dijeda 7 hari | Satu skala untuk pemula; aturan ramah pemula (perlu validasi finance/legal) |
| 20 Nov 2026 | Satuan estimasi baru: pesan chatbot Rp12, tugas otomasi Rp28 (model Hemat); sesi kecil Rp1.890 tetap | Resep chatbot & otomasi butuh satuan awam |
| 20 Nov 2026 | Ikon Lucide (ISC) disalin lokal | Satu set ikon garis, tanpa CDN |
| 20 Nov 2026 | Ikon Lucide v0.460.0 disuntikkan lewat `icons.js` (bukan `<use href="sprite.svg#…">`); atribut stroke di CSS `.icon` | `<use>` ke file eksternal diblokir di `file://`; atribut di `<svg>` sprite tidak diwarisi instance `<use>` |
| 20 Nov 2026 | Kamus i18n v4 berformat `'kunci': [ID, EN]` di `i18n.js` | EN yang hilang langsung terlihat; `i18n_check.py --root v4` membaca kamus dari halaman |
| 20 Nov 2026 | Cara kerja di `lg:` = grid 3 kolom (wireframe A4 menyebut geser horizontal) | Konten dulu; geser horizontal bisa ditambah di fase motion jika perlu |
| 20 Nov 2026 | Kartu resep satu kolom di `lg:`; angka “≈ RpX rb” memakai `cqi` + `nowrap` | Di kolom kanan desktop kartu terlalu sempit untuk dua kolom (angka patah “Rp34 / rb”) |
| 20 Nov 2026 | Nala: chip “Bantu pilih paket” (v3) diganti “Bantu pilih resep”; AI-saja lewat pilihan “AI coding saja” | Produk berubah dari paket token ke resep; satu alur, tidak dua |
| 20 Nov 2026 | Parameter `s` menulis template sebagai kunci (`wa-bot:rutin`), bukan `apps:` | Template harus ikut ke wizard/kalkulator (dicatat di services-and-pricing §6) |
| 20 Nov 2026 | Urutan lembar: contoh (white) → aman (paper + kartu warna) → belajar (white); dokumen menulis belajar paper | Dua lembar putih berurutan tidak terlihat sebagai lembar terpisah |
| 20 Nov 2026 | Kelas komponen `.field` (input/textarea) ditambahkan ke daftar `@layer components` | Dipakai berulang di form konsultasi, chat, dan nanti console |
| 20 Nov 2026 | Mobile: kartu model AI di landing 3 (desktop 6) | 6 kartu = ±2.200px di 375px; katalog lengkap tetap di dialog |
| 20 Nov 2026 | Kalkulator: state hanya di URL (`?resep=&s=`, `history.replaceState`), tidak di localStorage | Bisa dibagikan, dari Nala/landing langsung terisi, DoD 11 tetap (storage hanya `tn-lang`) |
| 20 Nov 2026 | Kalkulator: layanan dimatikan tetap tampil (abu) agar bisa dinyalakan lagi; “Tambah layanan” lewat dialog; pilihan “Mulai dari kosong” | Pemula tidak kehilangan pilihan; satu pola dengan wizard nanti |
| 20 Nov 2026 | Template berukuran minimum dengan AI: n8n + pesan/tugas AI → naik otomatis ke Rutin dengan pengumuman | Aturan §5.4 diterapkan di `applyMinimums()` (dipakai kalkulator & nanti wizard) |
| 20 Nov 2026 | Harga tanpa CTA akhir biru; diakhiri FAQ harga + footer | Ringkasan lengket sudah punya CTA “Nyalakan” |
| 20 Nov 2026 | Preset `jeda`: riwayat + 12 sesi + Coba AI 45 pesan agar saldo 8.000 sesuai dokumen | Riwayat harus selalu sama dengan saldo (dicek audit) |
| 20 Nov 2026 | Isi saldo di console tanpa field kontak; masuk 3 langkah, kontak hanya di memori lalu dibuang | DoD 11: data kontak tidak pernah disimpan |
| 20 Nov 2026 | Saat ada layanan dijeda, kartu saldo tidak menampilkan “cukup sampai” | Tanggal (hanya dari biaya alamat web) menyesatkan; banner sudah menjelaskan |
| 20 Nov 2026 | Menu akun = popover avatar (semua ukuran) + bagian Akun di sheet Lainnya (mobile) | IA §4; satu render untuk keduanya |
| 20 Nov 2026 | Rute Fase 5–6 menampilkan “Segera hadir” sementara | Link dari landing/harga tidak berakhir di halaman kosong |
| 20 Nov 2026 | Wizard: datang dengan `?resep=`/`?template=`/`?s=` langsung ke langkah 2; tanpa itu langkah 1 | Alur Ayu dari landing < 3 menit; tetap bisa kembali |
| 20 Nov 2026 | “Mulai kosong” = 6 layanan umum dalam keadaan mati (saklar), bukan dialog tambah | Satu pola dengan kalkulator; lebih sedikit layar |
| 20 Nov 2026 | Jam simulasi mengulang pola AI 7 hari terakhir per minggu | Demo saldo habis terasa nyata tanpa input manual |
| 20 Nov 2026 | Banner baru “di bawah pengingat” (saldo < Rp20.000 dan masih ada perpanjangan) | Peringatan sebelum dijeda; aturan pengingat §2 |
| 20 Nov 2026 | Grafik pemakaian AI: satu area fokus (←/→ antar hari) + hover per kolom + tabel, bukan 7 tombol | Tombol per batang < 44px di mobile; tooltip saat fokus wajib (skill dataviz) |
| 20 Nov 2026 | Coba AI memotong saldo per balasan sesuai tarif model (min Rp1), riwayat “Coba AI · {model}” | Menunjukkan biaya pakai nyata di demo |
| 20 Nov 2026 | Layanan lain bisa ditambahkan ke proyek baru; server: password sekali tampil + salin | Alur Sumopod tetapi tanpa merancang password sendiri (§5.5) |

## Pertanyaan Terbuka untuk PO

0. **(v4, 20 Nov)** Harga contoh v4 (Coba-coba/Rutin/Ramai Rp15/35/75 rb, server mulai Rp65 rb, domain .my.id Rp5 rb) dan aturan ramah pemula (sisa hari kembali, dijeda 7 hari, ganti ukuran prorata) perlu dikonfirmasi finance/legal sebelum dipakai sungguhan.
0b. **(v4)** Teks “cukup untuk” server/data/file dan langkah panduan Belajar ditulis Claude — perlu review copy.

1. Nominal final paket dan tarif model masih ilustratif (open item di technical-spec).
2. Aturan saldo perlu validasi legal/finance sebelum produksi.
3. Jam layanan dan SLA balasan tim nyata belum ditentukan.
4. ~~**(20 Nov, feedback Pak Ferry)** Arah produk: tetap “jualan token AI untuk vibecoder” atau berubah jadi **platform AI Cloud Services** (referensi sumopod.com, helipod.io)? Layanan apa saja yang masuk (AI API, deploy app, one-click app seperti n8n/Dify/agent, VPS, database, GPU)? Target user tetap vibecoder pemula? Deliverable hanya landing atau juga mock console?~~ → **dijawab 20 Nov**, lihat tabel Keputusan.

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
- **Jalankan axe di setiap state dialog, bukan hanya halaman awal.** Masalah `role=log` pada `<ol>` dan `<header>` di dialog non-modal baru muncul saat chat terbuka. Kontras 4,47:1 hanya gagal di latar header (paper/95), tidak di paper biasa.
- **Selalu lihat versi EN di 320px.** Copy EN lebih panjang (“Start vibe-coding.” terpotong di tanda hubung → pakai U+2011).
- **Touch target 44px berlaku juga untuk link logo, link nav pendek (“FAQ”), dan tombol segmented (ID/EN).** QA shell menemukan ketiganya < 44px; pakai `min-h-11 min-w-11`.
- **Weight yang tidak dimuat gagal diam-diam.** Browser memakai face terdekat tanpa error, jadi kode (400) dan tampilan (500) bisa beda tanpa ketahuan. Sekarang `audit_v3.py` mencocokkan family+weight hasil render dengan daftar `FACES`.
- **Situs yang dirender JavaScript bisa dibaca dengan Playwright** yang sudah terpasang untuk QA (`python3 -P`, bukan `-I`, karena Playwright ada di user site-packages). WebFetch hanya melihat shell HTML. Jangan menembus captcha/login.
- **`pgrep -f <pola>` di loop penunggu mencocokkan perintahnya sendiri** → loop tidak pernah selesai, dan `pkill -f` dengan pola yang sama membunuh shell sendiri. Tunggu berdasarkan PID atau file hasil.
- **Minta review independen untuk dokumen sebelum coding.** Agent yang tidak membaca kesimpulan kita menemukan 13 kontradiksi di dokumen v4 yang sudah “dicek” sendiri — terutama contoh angka di wireframe yang tidak dihitung dari rumus, dan aturan yang hanya ada sebagai contoh tabel (top-up disarankan). Setiap angka contoh harus bisa dihasilkan rumus + state yang tertulis.
- **Hitung ulang contoh di dokumen dengan kode yang sebenarnya.** Fase 1 menemukan “cukup sampai ±20 Des” (preset Ayu) yang tidak sesuai rumus dokumen sendiri (hasilnya 19 Des) — lolos dua kali review manual. `audit_v4.py` sekarang mengecek angka dokumen terhadap `data.js` (dan diuji negatif: harga diubah → audit gagal).
- **Animasi transisi bisa membuat axe salah ukur kontras.** Menu mobile mengganti warna header dengan transisi 300ms; axe yang langsung jalan melihat warna di tengah transisi. Tunggu transisi selesai sebelum audit.
- **Jangan validasi di `blur` jika pesan error bisa hilang/muncul.** Pesan error yang hilang saat field ditinggalkan menggeser layout di antara mousedown dan mouseup, sehingga klik ke field berikutnya (radio ukuran tim) meleset — ditemukan QA konsultasi. Validasi saat submit, hapus error saat mengetik.
- **Animasi masuk membuat axe dan screenshot menipu.** Elemen yang sedang fade-in terbaca kontrasnya rendah, dan screenshot full-page menampilkan section kosong. QA layout/axe memakai reduced motion; motion diuji terpisah (scroll seluruh halaman lalu pastikan tidak ada konten tersembunyi).
- **Teks di dalam induk `font-bold` ikut 700**, termasuk `font-mono` → face Mono 700 yang tidak dimuat. Beri `font-medium` eksplisit pada mono di dalam teks tebal.
- **Elemen yang dirotasi (ikon +45°, kartu −1°) memperbesar kotak** dan memicu cek teks meluap. Rotasi elemen dalam atau beri margin.
- **Kunci objek berbentuk angka diurutkan duluan di JavaScript.** `Object.keys({gratis, 2500, 10000})` → `2500, 10000, gratis` — pilihan email tampil terbalik. Pakai array urutan eksplisit.
- **`<option>` tidak mewarisi weight body** → Manrope 400 (tidak dimuat). Set `font-weight` di `.field option`.
- **Playwright tidak mau mengklik elemen `aria-disabled`** — benar secara aksesibilitas; uji “tidak bisa dipilih” dengan `force=True`.
- **Tombol yang dirender ulang butuh event delegation.** Tombol ID/EN di menu akun console dibuat setelah `ui.js` memasang listener langsung → tidak berfungsi; ditemukan QA EN. `ui.js` sekarang mendelegasikan klik `[data-lang]`.
- **Pratinjau “saldo setelahnya” harus memakai aturan yang sama dengan aksi sebenarnya.** Sheet isi saldo di state dijeda menampilkan Rp63.000, padahal setelah layanan menyala lagi saldo Rp48.000 → `previewTopup()` memakai urutan `settle()` yang sama.
- **Render ulang di tengah alur bisa me-reset state modul.** Wizard menginisialisasi ulang saat router merender langkah 4 (kondisi `step < 4`) → proyek hilang. Inisialisasi hanya saat alamat masuk berubah. Lalu daftar progres kosong sempat dianggap “selesai” satu frame → siapkan data sebelum render.
- **Listener pada kontainer yang tidak ikut dirender ulang menumpuk.** `#view` tetap ada antar rute → pasang listener di elemen dalam yang diganti setiap render.
- **QA yang memuat ulang `?demo=` me-reset state.** Navigasi lanjutan dalam satu skenario lewat `location.hash`.
- **Tombol per elemen grafik gagal target sentuh di mobile.** 7 batang di 320px = 28px per batang. Grafik = satu elemen fokus dengan panah + hover, dan tabel untuk nilai lengkap.
- **`<dl>` hanya boleh berisi `dt`/`dd` (atau `div` berisi itu).** Peringatan di dalam daftar detail koneksi gagal axe — letakkan di luar daftar.
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
- Langkah 12 audit ID/EN: `tools/i18n_check.py` (kunci di kedua kamus, kunci HTML ada di kamus, kunci mati, dan perbandingan 576 teks/aria/placeholder/alt ID vs EN termasuk dialog tertutup & template). Hasil: bersih; detektor kunci mati diverifikasi dengan kunci palsu.
- Langkah 13 QA penuh: checkout & katalog dipindah ke `setupModal()` (QA penuh sebagai jaring pengaman); `tools/audit_v3.py` (axe-core 4.14.0 + DoD file://, reduced motion, storage, ukuran). Ditemukan & diperbaiki: `role=log` pada `<ol>` + `<li>` tidak valid → `div`; `<header>` di dialog terbaca banner kedua → `div`; kontras `muted` 4,47:1 di header → `#626B82`. DoD 21/21 dicatat di technical-spec.
- Merge: PR #1 `v3-mobile-first` → `main` dibuat & di-merge dengan akun workspace `.github-cli` (hannifkurniawan, pemilik repo) — `GH_CONFIG_DIR=.github-cli gh …`. Akun gh global di mesin ini berbeda (Fajar-DS-XQ).

### Sesi 2 — 20 Nov 2026
- Audit font: sebelumnya 2 keluarga, 6 face dimuat (Manrope 500/600/700/800, Plex Mono 500/600), 20 ukuran; teks tanpa kelas weight meminta 400 yang tidak dimuat.
- Pull `main` (commit user `0bcc69e`: folder `showcase/`).
- Branch `type-scale-trim`: `font-semibold` → `font-bold` (Manrope) / dihapus (mono), `body` → `font-medium`, URL Google Fonts jadi 4 face; `audit_v3.py` ditambah cek face (halaman + chat, ID/EN, mobile/desktop); dokumentasi tipografi di `visual-direction.md`, `brand-elements.md`, `technical-spec.md`. Ketiga tools lolos.
- PR #3 `type-scale-trim` → `main` di-merge atas persetujuan user.
- User bertanya cara mempresentasikan web sebagai designer UI/UX → disarankan format studi kasus (masalah → persona → riset → keputusan desain → demo mobile → kualitas → pelajaran). Tawaran membuat deck belum dijawab.
- Belum: merapikan 20 ukuran huruf menjadi skala token (opsional, belum diminta).

### Sesi 3 — 20 Nov 2026
- User mendemokan `showcase/v1` dan `showcase/v2` ke Pak Ferry. Feedback utama: terlalu fokus e-commerce jualan token AI; ekspektasi beliau = **platform AI Cloud Services** seperti sumopod.com / helipod. Gap dengan brief interview Rabu (web jualan token AI untuk vibecoder, tidak teknis, design taste unik).
- Riset referensi lengkap → **`research/ai-cloud-reference.md`**. Ringkas: helipod.com dialihkan ke helipod.co.uk; yang relevan **helipod.io** (PaaS untuk engineer: Aplikasi, AI Gateway 76 model, VPS + app siap pakai, Postgres, Mail, Domain, Heli Crew via MCP; **satu dompet Rupiah**, QRIS/VA). **Sumopod** dibaca lewat Chromium headless + ±45 halaman docs: 15 menu dashboard (AI, Apps sekali klik n8n/OpenClaw/Hermes, VPS, Database, SMTP, Object Storage, Domain…), landing tipis tanpa harga, akuisisi pemula lewat video YouTube, **dua saldo (Rupiah + AI Balance dalam USD)**. Login Sumopod (atas permintaan user, email user) berhenti di Cloudflare Turnstile yang harus dicentang manusia → tidak dilanjutkan, kode tidak terkirim. Dashboard dipelajari dari **docs.sumopod.com (86 halaman, 212 screenshot)** — saran user; ini sumber terbaik untuk Sumopod. Temuan: beranda dashboard = Learn (video), 18 menu, panel ringkasan biaya lengket di form, AI Balance USD terpisah (kurs 17.955), template agent n8n/Hermes/QwenPaw mulai Rp10rb/bln.
- Peluang: keduanya berbahasa developer; belum ada yang menjawab “saya mau bikin X, butuh apa & berapa per bulan?” → pendekatan intent-first + estimasi awam dari v3 bisa diperluas ke multi-produk.
- Analisa: v3/showcase sudah menutup pilar “AI API/gateway” (saldo, katalog model, API key, dashboard, tim, chat). Yang belum: pilar compute (deploy app, one-click app/agent, VPS, database), dompet multi-produk, halaman harga per produk, mock console.
- Belum ada perubahan kode. Menunggu keputusan arah (pertanyaan terbuka no. 4).
- User menjawab 8 konfirmasi (dicatat di Keputusan). Showcase v1 = Tailwind (editorial bersih); showcase v2 = CSS custom 1.146 baris (lembar warna penuh, saklar, angka besar, label mono bernomor).
- `docs/v4-cloud-plan.md` disetujui arahnya: visual showcase v2, tagline “Idemu nyala, dari prompt sampai online.”, ID+EN, belum ada tanggal demo. 
- **Fase 0 (branch `v4-cloud`):** `docs/v4/` 9 dokumen. Angka resep dihitung dengan skrip (portofolio Rp33.900/bln, chatbot-wa Rp47.000, web-klien Rp101.700, otomasi-tim Rp285.000; contoh event Rp40.790–54.020 muat di saldo 55.000). Review kontradiksi oleh agent independen menemukan 13 masalah wajib (contoh saldo console salah hitung, aturan top-up disarankan tidak ada, ai-coding tanpa tujuan, siklus berhenti/dijeda, preset demo tidak terdefinisi, FAQ/EN kurang, pelanggaran glosarium) → semua diperbaiki. `CLAUDE.md` diarahkan ke v4.


### Sesi 4 — 20 Nov 2026 (Fase 1 v4)
- `v4/` dibuat: `package.json` (`@tailwindcss/cli` 4.3.3 di-pin), `src/tailwind.css` (token + komponen, 1 sumber), `assets/css/app.css` di-commit, `data.js` (semua angka + fungsi murni), `i18n.js` (180 kunci [ID, EN]), `icons.js` (28 ikon Lucide), `ui.js`, `landing.js`, `index.html`, `README.md`.
- Landing bagian 1: header sticky (menu biru layar penuh di mobile, ID/EN), hero (saklar inline menyala, board prompt → membangun → online, saldo 55.000 → sisa 12.320), cerita macet (localhost vs eventku.my.id), **Mau bikin apa?** (radiogroup 5 resep dengan panah, kartu dihitung dari `data.js`, link “Mulai bangun” ikut resep terpilih, ai-coding → `app.html#/ai?isi=1`), cara kerja, semua layanan (4 kelompok, 10 kartu), satu saldo (kartu dompet contoh), footer.
- Tools: `tools/qa_v4.py` (6 viewport + menu, resep, bahasa EN), `tools/i18n_check.py --root v4` (v3 tidak berubah), `tools/audit_v4.py` (axe, font, file://, reduced motion, storage diblokir, CSS terbaru, konsistensi angka), `tools/build_icons_v4.py`. Semua lolos.
- Ditemukan & diperbaiki saat QA/screenshot: grid tanpa kolom eksplisit (aturan #2), ikon terisi hitam, kartu layanan mobile terlalu panjang (±3.500px → tata letak ikon kiri), harga resep patah di desktop, chip top-up EN 2 baris, logo hilang di header biru.
- Dokumen: preset Ayu “cukup sampai” dikoreksi **±19 Des** (+ perhitungan ketiga preset ditulis di §8); microcopy tambahan Fase 1; wireframe A6 tanpa tanggal.
- Link ke `harga.html` dan `app.html` belum punya tujuan (Fase 3–4).

### Sesi 4 (lanjutan) — Fase 2 v4
- Landing selesai: template (5, ukuran minimum + biaya bawaan dari `data.js`), AI (6 model v3 + panduan pasang + konfigurasi salin + katalog 12 model dengan cari/filter), contoh proyek (Rp40.790–54.020, rincian sesi, link wizard dengan `s`), aman untuk pemula (4 kartu bertumpuk sticky di `lg:`, angka refund/prorata dari fungsi), belajar (3 panduan), tim + dialog konsultasi (port v3), FAQ 13, CTA akhir, chat Nala (port v3 + alur resep Q1–Q3 sesuai aturan Nala), motion GSAP/ScrollTrigger/Lenis (judul per kata, fade kartu, saklar menyala, kartu bertumpuk mengecil; mati saat reduced motion).
- `data.js` + model AI, template, panduan, `exampleTotals`, `nalaItems`, `askCode`, `serialize`. Kamus 406 kunci.
- QA: alur katalog, konsultasi, Nala (link resep `hosting:ramai,domain:my.id,ai:20`), FAQ/salin, uji motion. Audit: axe untuk semua dialog, angka template/contoh/kartu aman/Nala dibanding dokumen, storage setelah konsultasi + kontak Nala. Semua lolos.

### Sesi 4 (lanjutan) — Fase 3 v4
- `harga.html` (header/menu/footer/Nala diambil dari `index.html` dengan link ke `index.html#…`): kepala, chip nav lengket (scrollspy), kalkulator, mulai dari (10 kartu), AI (12 model + tarif + 3 satuan), Jalankan/Simpan/Hubungkan (tabel per layanan + detail teknis), saldo & tagihan (top-up + 10 aturan), FAQ harga.
- `data.js`: `OPTIONS`, `NEW_ITEM`, `parseS`, `itemsFromUrl` (tanpa `s` → bawaan; `s` tidak menyebut → mati; nilai salah → bawaan), `applyMinimums`, `templateMinSize`, `usesAi`; `recipeTotals`/`serialize` melewati layanan mati; payments di `itemCost`. `itemView`/`fromLine` dipindah ke `ui.js` (dipakai bersama).
- QA harga: alur kalkulator lengkap + nav + EN; audit: axe dialog tambah layanan & ringkasan terbuka, angka ringkasan/CTA per resep, semua harga & tarif model di tabel. Semua lolos.

### Sesi 4 (lanjutan) — Fase 4 v4
- `app.html` + `store.js` + `console.js`: header (pil saldo kuning bila perlu isi), sidebar desktop, tab bar mobile (Buat + kuning), sheet Lainnya, menu akun (bahasa, mulai ulang demo + konfirmasi, keluar), toast, label prototype; router hash dengan guard masuk; masuk 3 langkah + akun contoh; beranda (sapaan, banner dijeda/saldo kurang, chip resep untuk akun baru, kartu saldo + cukup sampai, langkah berikutnya, proyek, bulan ini, belajar); saldo (perkiraan, pengingat, riwayat + filter jenis/proyek, invoice contoh); sheet isi saldo (port checkout v3).
- Preset §8 terverifikasi: Ayu 31.220/±19 Des, Raka 239.640/±31 Des, Dimas 647.800/±22 Jan, jeda 8.000 → isi 50 rb → 48.000 & nyala lagi.
- QA console (alur masuk, beranda/nav, isi saldo, jeda, akun/reset, EN) + audit console (axe semua dialog, angka preset, riwayat = saldo, storage tanpa kontak, file://, storage diblokir) + i18n 4 rute console. Semua lolos (40 cek QA).

### Sesi 4 (lanjutan) — Fase 5 v4
- `projects.js`: wizard 4 langkah (tujuan → atur: nama proyek tervalidasi, saklar/ukuran/sumber kode/alamat web + cek ketersediaan mock/limit AI → ringkasan: dipotong sekarang, nanti sesuai pakai, saldo sebelum/sesudah, isi saldo inline = saran(kekurangan) → menyalakan: progres per layanan + “Nyala!” + langkah berikutnya). Proyek: daftar, detail dengan tab (keyboard), ringkasan (upload mock, QR WhatsApp + pesan uji), layanan (ganti ukuran prorata, hentikan + refund, matikan perpanjangan domain, nyalakan lagi, isi saldo bila dijeda), AI (key, aktif/nonaktif, limit), log, pengaturan (hentikan proyek).
- `store.js`: `createProject`/`finishStarting`, `resize`, `stopService`, `resume`, `stopProject`, `setLimit`, `setKeyActive`, `advance()`; status proyek tidak dianggap nyala hanya karena domain; banner pengingat.
- Alur Ayu (journey 1) diverifikasi QA: Rp20.000 sekarang, saldo 55.000 → 35.000, `ayu.my.id` nyala. Raka: turun ke Coba-coba hari ke-20 → Rp6.600 kembali; hentikan → Rp5.000 kembali. 52 cek QA lolos, audit & i18n lolos.

### Sesi 4 (lanjutan) — Fase 6 v4
- `ai.js`: tab Mulai cepat (key per proyek/akun + Base URL + salin), Coba AI (pilih model, contoh prompt, balasan simulasi dipotong per tarif), Model (12), Pemakaian (2 angka + grafik kolom 7 hari sesuai skill dataviz + tabel + per proyek), API key (aktif/nonaktif, limit). `services.js`: 6 layanan dengan pola daftar → tambah (proyek lama/baru, ukuran, lokasi/sistem/mesin/alamat) → hasil (IP/user/password sekali, DATABASE_URL, endpoint, SMTP, kunci mode uji). `learn.js`: 3 panduan + langkah + “Coba sekarang”; bantuan (6 FAQ, Nala, tim). Rute tak dikenal → “Halaman tidak ditemukan”.
- Store: `chargeChat`, `chatCost`, `accountKey`, `addService`. Launcher Nala naik di atas bar lengket mana pun (`[data-wz-bar]`).
- 76 cek QA lolos; audit (axe semua tab AI, hasil server) & i18n lolos.

### Sesi 4 (lanjutan) — Fase 7 v4 (penutup)
- Pemindaian glosarium ID: bersih (sisa “kredit”/“token” hanya di konteks yang diizinkan).
- `audit_v4.py` + DoD 12 (label simulasi terlihat di landing, harga, console beranda & wizard, sheet isi saldo).
- `tools/demo_v4.py`: gladi 21 langkah skrip demo di 375×812 (landing → resep → layanan → saldo → kalkulator → masuk → wizard → isi saldo QRIS → nyala → beranda → API key → riwayat → Dimas → pemakaian AI → EN → Nala → cadangan dijeda) — semua lolos.
- Dokumen final: skrip demo di `docs/v4/user-journeys.md`, status DoD di `technical-spec.md` §9, `v4/README.md` lengkap, `CLAUDE.md` menyebut gladi demo.
- Hasil akhir: QA 76 cek, i18n (31 halaman/rute) dan audit lolos. Belum ada PR ke `main` (menunggu persetujuan user).
