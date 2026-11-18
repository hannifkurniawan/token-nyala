# v3 Ground Rules — Mobile First + Tailwind CSS

Dokumen ini adalah aturan main implementasi v3. Jika ada konflik dengan dokumen lain, **dokumen ini yang berlaku** untuk cara membangun; dokumen lain berlaku untuk isi (copy, data, perilaku).

## Kenapa ada dokumen ini

v1 dan v2 dibangun desktop-first lalu dikecilkan dengan `@media (max-width: …)`. v2 memuat Tailwind CDN tetapi tidak memakai satu pun class responsif (`sm:`/`md:`/`lg:`); semua styling tetap dari CSS v1 dengan tinggi elemen fixed (`height: 350px`, `min-height: 430px`). Akibatnya setiap perbaikan responsif adalah tambalan baru di atas tambalan lama. v3 memperbaiki **cara membangun**, bukan hanya alatnya.

## Aturan

### 1. Mobile first sungguhan
- Class tanpa prefix = tampilan 320–375px.
- `sm:` / `md:` / `lg:` / `xl:` hanya **menambah** perilaku untuk layar lebih lebar.
- Dilarang: `@media (max-width: …)`, `max-sm:`, `max-md:` dan sejenisnya.

### 2. Tinggi ditentukan konten
- Dilarang memberi `height` / `h-[…px]` pada kontainer yang berisi teks.
- Ruang dibuat dengan padding dan gap.
- `min-h-11` (44px) hanya untuk touch target.
- Ilustrasi memakai `aspect-ratio` (`aspect-[4/3]`), bukan tinggi fixed.
- Tinggi viewport memakai `dvh`, bukan `vh` (address bar mobile).
- **Setiap `grid` wajib punya kolom eksplisit** — `grid-cols-1` di mobile, dan kolom custom memakai `minmax(0, …)` (contoh `lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]`). Track implisit `auto` melebar mengikuti min-content isinya dan menembus gutter.
- `overflow-x-clip` / `overflow-hidden` hanya untuk dekorasi yang memang keluar bingkai, **bukan** untuk menyembunyikan konten yang meluap. Dekorasi yang sengaja keluar diberi `aria-hidden="true"` atau `data-allow-bleed`.

### 3. Token di satu tempat
- Semua warna, font, dan radius hanya di blok `@theme` (lihat `technical-spec.md`).
- Tidak ada hex color di markup atau `styles.css`. Jika perlu, pakai `var(--color-…)`.

### 4. Utility dulu, CSS custom terakhir
- Layout, spacing, tipografi, state (`hover:`, `focus-visible:`, `aria-selected:`, `data-[state=open]:`) memakai utility.
- `styles.css` hanya untuk: ilustrasi hero, keyframe animasi, dan hal yang memang tidak bisa dengan utility. Target < 100 baris.
- Komponen yang berulang (tombol, kartu) dibuat konsisten dengan daftar class yang sama; jika terlalu panjang, gunakan `@layer components` + `@apply` di blok `text/tailwindcss` — maksimal untuk 4–5 komponen inti.

### 5. Tipografi fluid, bukan per-breakpoint
- Heading memakai `text-[clamp(…)]` atau token ukuran, agar tidak perlu override di setiap breakpoint.
- Body teks minimal 16px di mobile (mencegah auto-zoom iOS pada input).

### 6. Overlay memakai elemen bawaan
- Checkout memakai `<dialog>` + `showModal()` (focus trap, Escape, dan `inert` background sudah ditangani browser).
- Di dalam area scroll, elemen `sr-only` (radio/checkbox tersembunyi) **harus punya ancestor `relative`** (label atau body scroll). Tanpa itu posisinya absolut terhadap dialog, membuat dialog sendiri bisa ter-scroll saat elemen difokus — header hilang, muncul ruang kosong.
- Mobile: bottom sheet (`mt-auto`, `rounded-t-3xl`, `max-h-[90dvh]`, isi scroll internal, tombol konfirmasi sticky dengan `pb-[env(safe-area-inset-bottom)]`).
- `md:` ke atas: dialog di tengah.

### 7. Cek per section, bukan di akhir
Setelah setiap section selesai, cek di: **320, 375, 768, 1024, 1440** dan **667×375 landscape**. Kriteria:
- Tidak ada scroll horizontal (`document.documentElement.scrollWidth === innerWidth`).
- Tidak ada konten yang keluar dari gutter `.shell` (cek ini menangkap luapan yang tersembunyi oleh `overflow-x-clip`).
- Tidak ada teks yang meluap dari kotaknya sendiri (`scrollWidth > clientWidth`), misalnya harga besar di kartu sempit. Elemen yang sengaja punya dekorasi keluar kotak (garis penghubung `::after`) diberi `data-decor-overflow`.
- H1 dan CTA utama hero terlihat tanpa scroll di 320×640 dan 375×667.
- Tidak ada teks terpotong atau tumpang tindih.
- Touch target ≥ 44px.
- Fokus keyboard terlihat.

Section belum boleh di-commit sebelum lolos keenam viewport. Jalankan `python3 tools/qa_v3.py --interactive --out <dir>`, lalu **lihat screenshot-nya** — termasuk versi EN di 320px, karena copy EN lebih panjang.

### 8. Konten dulu, dekorasi belakangan
- Bangun markup semantik + copy final terlebih dahulu, lalu layout, lalu dekorasi/animasi.
- Elemen dekoratif (orbit, floating note) disembunyikan di mobile bila mengganggu, bukan dipaksa muat.

### 9. JavaScript
- Logika v2 (data paket, i18n, focus handling) boleh dipakai ulang setelah dibaca ulang; jangan menyalin CSS v1/v2.
- State UI diekspresikan lewat atribut (`aria-selected`, `aria-expanded`, `data-state`) sehingga styling cukup dengan variant Tailwind, bukan toggle banyak class.

### 10. Commit kecil
Satu section atau satu perilaku per commit, dengan pesan yang menyebut viewport yang sudah dicek.

## Urutan Build v3

1. Shell: `<head>`, `@theme`, font, header + mobile menu, footer (dengan link legal mock).
2. Hero.
3. Cara kerja (3 langkah).
4. Package picker (intent tabs + kartu + baris aturan saldo).
5. Checkout dialog + success state dengan API key mock (lebih awal, karena dipakai banyak CTA).
6. Model AI: 6 kartu + dialog katalog (search, filter, tampilkan lebih banyak).
7. Pakai di tool favoritmu (langkah + konfigurasi + tombol salin).
8. Benefit + mock dashboard “Pantau & kendalikan” + contoh penggunaan.
9. Untuk tim & bisnis + dialog konsultasi.
10. FAQ (10 pertanyaan) + final CTA.
11. Live chat Nala (launcher, skrip, serah ke tim, offline) — terakhir karena terhubung ke checkout, katalog, dan section 7.
12. Language switch (ID/EN) untuk semua copy, termasuk chat dan dialog.
13. QA penuh: checklist `technical-spec.md` → Definition of Done.

## Referensi
- `docs/technical-spec.md` — token, breakpoint, komponen, validasi.
- `docs/wireframe-notes.md` — wireframe mobile lebih dulu.
- `research/reference-gap-analysis.md` — temuan dari OCTA, TokenKu, dan OpenRouter.
