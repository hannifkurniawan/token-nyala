# Visual Direction v4

Acuan: **`showcase/v2`** (dipilih user, 20 Nov 2026) — editorial / scroll-storytelling: lembar warna penuh bertumpuk, saklar “nyala”, angka dan judul sangat besar, label mono bernomor. v4 membawa **bahasa visualnya**, bukan CSS-nya (1.146 baris custom) — dibangun ulang dengan token Tailwind.

## 1. Konsep

**“Saklar yang menyala.”** Ide → prompt → online digambarkan sebagai saklar yang berpindah dari abu-abu ke kuning/teal. Landing bercerita dengan lembar warna besar; console tenang dan fungsional, energi hanya muncul di momen penting (saldo, nyala).

| Area | Karakter |
|---|---|
| Landing & Harga | Berani: lembar warna penuh, display besar, angka besar, motion scroll |
| Console | Tenang: latar paper, kartu putih, satu lembar biru untuk saldo, motion hanya untuk perubahan status |

## 2. Warna (token)

| Token | Hex | Peran |
|---|---|---|
| `xl-blue` | `#002DBB` | CTA utama, lembar biru, link |
| `xl-dark` | `#00166A` | Teks utama, lembar gelap, footer |
| `xl-yellow` | `#FFC93C` | Energi: saklar ON, highlight `mark`, fokus, chip saran, tombol Buat (+) |
| `xl-teal` | `#00D2A0` | Status **Nyala**, sukses (latar/ikon saja) |
| `teal-ink` | `#007A5E` | Teks/ikon teal di latar terang (kontras AA) |
| `xl-sky` | `#5CD0F9` | Perkiraan, info, status **Menyalakan** |
| `paper` | `#F7F8FC` | Latar halaman |
| `ink` | `#17181A` | Teks sekunder gelap |
| `muted` | `#626B82` | Teks pendukung (**bukan** `#69728A` dari showcase v2 — gagal AA di header) |
| `line` | `#D9DEEA` | Garis, border |
| `off` | `#C7CDDC` | Saklar OFF |
| `stopped` | `#B4BCCF` | Titik status Berhenti (dekor, selalu dengan teks) |
| `lead-ink` | `#2A3557` | Teks lead di latar terang (dari showcase v2) |

Kontras wajib AA. Teks di lembar kuning memakai `xl-dark`; di lembar biru/gelap memakai putih / putih 82% untuk lead.

### Warna status layanan
| Status | Titik | Label | Catatan |
|---|---|---|---|
| Menyalakan | `xl-sky`, berdenyut (statis saat reduced motion) | `xl-dark` | |
| Nyala | `xl-teal` + ring 4px teal 22% | `teal-ink` | |
| Dijeda | `xl-yellow` | `xl-dark` + ikon jeda | Selalu dengan teks, tidak hanya warna |
| Berhenti | `stopped` (`#B4BCCF`) | `muted` | |

## 3. Tipografi
2 keluarga. **Console: 4 face** (aturan 20 Nov 2026): Manrope 500/700/800 + IBM Plex Mono 500. **Landing (21 Nov) dan Harga (22 Nov 2026): 6 face**, disetujui user, mengikuti showcase v2: + Manrope 600 dan IBM Plex Mono 600.

| Peran | Spesifikasi |
|---|---|
| Display XL (hero, CTA akhir) | 800, `clamp(2.5rem, 7.6vw, 8.6rem)`, leading .96, tracking −0.045em, `text-wrap: balance` |
| Display (judul section) | 800, `clamp(2.3rem, 6vw, 6.4rem)` |
| Judul kartu besar (stack card) | 800, `clamp(2.2rem, 5.6vw, 5.6rem)`, leading .95 |
| Angka uang besar | 800, tracking −0.04em, `tabular-nums` |
| Lead | 500, `clamp(1.05rem, 1.35vw, 1.3rem)`, warna `lead-ink` |
| Body | 500, 16px (minimum di mobile) |
| Kicker | mono 500, .82rem, uppercase, tracking .1em, nomor `(01)` warna muted |
| Label teknis | mono 500, .75–.8rem, `muted` |

Di console, display maksimum `clamp(2rem, 6vw, 3rem)`; angka saldo boleh lebih besar.

## 4. Layout

- **Lembar (sheet):** latar penuh tepi ke tepi, sudut atas membulat `clamp(28px, 4vw, 64px)`, bertumpuk dengan margin negatif sebesar radiusnya. Urutan warna landing (wireframe mengikuti ini): paper (hero) → dark (cerita) → **blue (paket)** → paper (cara kerja) → white (layanan) → **yellow (saldo)** → paper (template) → dark (AI) → white (contoh) → stack 4 warna (aman) → paper (belajar) → yellow (tim) → paper (FAQ) → blue (CTA akhir).
- **Konten:** maks **1280px**; gutter **16px** (<640), **24px** (`sm:`), **40px** (`lg:`), **64px** (`xl:`). (v3: 1184/16/24; v2: 1600/fluid. Dipilih jalan tengah, satu aturan.)
- Padding vertikal lembar: `clamp(72px, 12vw, 180px)` atas, sedikit lebih besar di bawah (untuk tumpukan lembar berikutnya).
- Grid: selalu kolom eksplisit (`grid-cols-1`, `minmax(0,…)`) — aturan v3.
- Console: kartu radius 20px, kontrol 12px, jarak antar-kartu 12–16px, konten maks 960px.

## 5. Komponen Khas

| Komponen | Deskripsi |
|---|---|
| **Saklar** | Pil 52×30 (UI) / 88×48 (besar) / inline di H1 (dekor, `aria-hidden`). OFF abu `#C7CDDC`, ON kuning (besar) atau teal (UI). Area sentuh ≥44px |
| **Tombol** | Pil, tinggi 48 (52 di hero mobile), 700. Primary biru → hover sapuan dark dari bawah; Yellow; Ghost (border dark); Ghost-light (di lembar gelap); Text link bergaris bawah kuning tebal 2px |
| **Kicker bernomor** | `(01) MAU BIKIN APA?` mono |
| **Mark** | Garis kuning tebal di bawah kata kunci judul (`semua`, `nyala`) |
| **Kartu paket** | Putih di atas lembar biru, angka “≈ Rp34 rb” sangat besar, daftar layanan dengan ikon, chip kuning saran top-up |
| **Kartu layanan** | Ikon garis 24px, nama awam 700, label teknis mono kecil, harga “mulai dari” |
| **Stack card** | Kartu warna (sky, yellow, teal, blue) menumpuk sticky saat scroll di `lg:`; di mobile tersusun biasa |
| **Meter saldo** | Bar 14px kuning; varian rentang bergaris biru untuk estimasi |
| **Pil saldo** (console header) | Titik status + angka mono; kuning bila saldo kurang untuk perpanjangan |
| **Tab bar** (console mobile) | 5 item, ikon + label, Buat (+) bulat kuning 56px menonjol 8px |
| **Ringkasan lengket** | Kartu ringkasan biaya; mobile: bar bawah ringkas yang bisa dibuka; desktop: kolom kanan sticky |
| **Progres menyalakan** | Daftar langkah dengan titik sky → teal; saklar besar ON di akhir |

### Landing dibangun dengan cara showcase v2 (21 Nov 2026)
Keputusan user: konten v4 tetap; komponen, animasi, dan **cara kerjanya** mengikuti `showcase/v2`, tanpa memaksakan Tailwind.
- **Tiga file:** `index.html` (markup + copy ID/EN statis `data-l="id|en"`, ditukar CSS), `assets/css/site.css` (dasar bersama: token, `--u`, gutter, tombol, header/menu, loader, kursor, footer, dialog, chat) + `assets/css/landing.css` (section), `assets/js/landing.js` (render bagian berbasis data, interaksi, boot). `site.css`/`landing.css` = port `styles.css` showcase; tambahan v4 di bagian "v4 additions".
- **Boot:** script inline di `<head>` memasang `is-loading` sebelum halaman tergambar → loader 000→100% menutup layar → `initMotion()` menyiapkan semua posisi awal → loader terangkat → timeline hero diputar. Tanpa ini halaman tampil statis lalu "berkedip" saat GSAP menyembunyikan elemen (masalah putaran 20–21 Nov).
- **12 section:** hero · pita cerita (scroll) · cara kerja (bukan lembar) · Mau bikin apa? (biru) · layanan + template (putih) · model AI (kertas) · pakai di tool (gelap) · aman + satu saldo (kertas, stack 4 kartu; kartu 4 = dashboard saldo) · contoh (putih) · tim (kuning) · FAQ + panduan belajar (kertas) · CTA saklar raksasa (biru) · footer gelap tanpa lengkung.
- **Penyimpangan dari showcase (aturan v4):** target sentuh 44px (tombol bahasa, nav, footer, chip), kontras AA (teks pudar memakai warna, bukan `opacity`), pilihan tujuan 5 (kolom di HP, baris di md+), elemen miring diberi margin agar tidak keluar kolom.
- Console tetap Tailwind.

### Harga dibangun dengan cara yang sama (22 Nov 2026)
- `harga.html` + `site.css` (bersama landing) + `harga.css`; logika `pricing.js` tidak berubah, hanya markup. Kamus tetap dipakai untuk copy Harga; header, menu, footer, chat = markup landing (`data-l`).
- **Tanpa loader:** kepala halaman masuk lewat animasi CSS yang aktif sebelum halaman tergambar (`html.motion-pre`); semua animasi GSAP (`motion.js`) ada di bawah lipatan.
- **6 lembar:** kepala · nav chip lengket (ikut naik saat header bersembunyi) · (01) kalkulator biru: pilih paket dengan tab yang sama dengan landing (4 paket + "Dari nol"), baris layanan putih, ringkasan = struk lengket di kanan (lg) / bar bawah (HP) · (02) semua layanan putih: baris indeks per grup, tabel harga dibuka per layanan (`#detail-<id>` membuka barisnya) — menggantikan "Mulai dari" + 3 lembar detail · (03) AI gelap · (04) saldo kuning: struk isi saldo + 10 aturan bernomor · (05) FAQ harga.
- Komponen yang dipakai keduanya (tab paket `.intent`, judul grup, FAQ, baris kepercayaan) dipindah dari `landing.css` ke `site.css`. Kursor custom + label aria dua bahasa pindah ke `ui.js`.

## 6. Ikon
- Set ikon garis tunggal, 24px, stroke 1.75: **Lucide** (lisensi ISC), disalin lokal sebagai sprite SVG + `SOURCE.md` (seperti logo model v3). Tidak memuat CDN ikon.
- Ikon layanan: ai `sparkles`, chat `message-circle`, hosting `globe`, apps `bot`, server `server`, database `database`, storage `folder`, domain `at-sign`, email `mail`, payments `qr-code`.
- Logo keluarga model tetap dari v3 (`v3/assets/models`, lobehub MIT).

## 7. Motion
- GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.13 (lokal, dari showcase) **hanya di landing & harga**. Console memakai transisi CSS ringan.
- Pola yang dibawa (port `showcase/v2/script.js`): timeline hero (baris naik → copy → papan masuk dari kanan → stiker pop → saklar menyala + percikan), drift papan, cerita macet di-scrub scroll, kartu langkah masuk dari kanan, kontrol tujuan melebar, baris indeks naik, kabel digambar, kartu konfigurasi jatuh, stack card mengecil, struk tercetak, daftar tim & FAQ stagger, judul akhir + saklar raksasa otomatis menyala, wordmark footer naik, tombol magnetik (pointer halus saja), judul per kata.
- **Loader “000% → 100%” dan kursor custom dipakai di landing** (keputusan user 21 Nov 2026): loader menutupi persiapan animasi; kursor hanya untuk pointer halus, mati saat reduced motion. Harga tanpa loader.
- `prefers-reduced-motion` atau GSAP gagal dimuat → semua tampil statis (gate `motion-ok` + failsafe 2,5 detik, pola showcase v2).
- Durasi UI 180–450ms, easing `cubic-bezier(.22,1,.36,1)`.

## 8. Fokus & Aksesibilitas Visual
- Fokus: outline 3px `xl-yellow`, offset 3px; di lembar/kartu kuning outline `xl-blue`.
- Touch target ≥44px (termasuk chip, segmented ukuran, tab bar, stepper).
- Status tidak pernah hanya dengan warna (selalu teks/ikon).
