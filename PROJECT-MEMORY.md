# Project Memory — TokenNyala

Catatan kerja lintas sesi. **Baca file ini di awal setiap sesi baru**, lalu perbarui bagian *Status*, *Keputusan*, dan *Log Sesi* di akhir sesi.

## Status Saat Ini (per 18 Nov 2026)

- **Fase:** Langkah 1 v3 selesai — dokumen dirapikan dan fitur P1+P2 (G1–G8) sudah dispesifikasikan. Belum ada kode v3.
- **Berikutnya:** langkah 2 — scaffold `v3/` (shell: head, `@theme`, header, footer), lalu ikuti *Urutan Build v3* di `docs/v3-ground-rules.md`.
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
| 18 Nov 2026 | Logo provider tidak dipakai — monogram huruf awal | Hindari masalah merek di prototype |
| 18 Nov 2026 | Form konsultasi tim 5 field, tanpa captcha, janji balas 1 hari kerja | Lebih ringan dari OCTA Enterprise (7 field + captcha, 3 hari kerja) |

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
