# Information Architecture

Urutan di bawah adalah urutan **mobile** (satu kolom). Layar lebar hanya menambah kolom, tidak mengubah urutan. Kode `G1–G8` merujuk ke `research/reference-gap-analysis.md`.

## Landing Page Sections

1. **Navigation**
   - Product wordmark
   - Cara kerja · Paket · Model AI · FAQ
   - Language switch ID/EN
   - CTA Isi saldo
   - Mobile: menu button

2. **Hero**
   - Benefit-led headline
   - Supporting explanation
   - Primary top-up action
   - Secondary: lihat cara kerja
   - Small trust row

3. **Three-Step Explanation**
   - Pilih kebutuhan
   - Bayar
   - Mulai nyala

4. **Intent / Package Picker**
   - Intent tabs: Belajar · Prototype · Kerja
   - Package cards dengan rekomendasi dinamis
   - Baris aturan saldo (G2): `1 kredit = Rp1 · Sudah termasuk PPN · Tidak kedaluwarsa`
   - Link “Lihat model yang bisa dipakai” → section Model AI

5. **Model AI — “Satu saldo untuk semua model”** (G1, G5)
   - 6 kartu model pilihan (campuran Hemat/Seimbang/Premium)
   - Tiap kartu: penyedia, kegunaan, level biaya, “≈ N sesi kecil / Rp10.000”, detail tarif bisa dibuka
   - CTA “Lihat semua model & tarif” → dialog katalog (search + filter)
   - Catatan: definisi “sesi kecil” dan label contoh

6. **Pakai di Tool Favoritmu** (G3)
   - 3 langkah: salin API key → tempel di tool → pilih model & mulai
   - Contoh konfigurasi (base URL + API key mock)
   - Contoh tool yang kompatibel (teks, bukan logo)

7. **Why It Works / Benefits** (+ G6)
   - Pilihan yang bisa dipahami
   - Satu saldo untuk lanjut
   - Bayar lokal
   - Pantau & kendalikan — mock mini dashboard: saldo, pemakaian 7 hari, pengingat saldo menipis, API key aktif/nonaktif

8. **Live Example**
   - Mock project prompt dan estimasi pemakaian
   - Penjelasan bahwa pemakaian nyata bervariasi

9. **Untuk Tim & Bisnis** (G7)
   - Invoice atas nama perusahaan, faktur pajak, transfer bank, pemantauan per anggota
   - CTA “Konsultasi untuk tim” → dialog form konsultasi

10. **FAQ** (+ G2, G8)
    - Aktivasi, model, masa berlaku, PPN, refund, metode bayar, privasi data, API key bocor, tim

11. **Final CTA**
    - Ulangi core promise dan aksi isi saldo

12. **Footer**
    - Wordmark, tautan bantuan, Syarat & Ketentuan (mock), Kebijakan Privasi (mock), copyright

## Global Overlays

| Overlay | Dibuka dari | Mobile | `md:` ke atas |
|---|---|---|---|
| Checkout | CTA Isi saldo, tombol paket, rekomendasi chat | Bottom sheet `max-h-[90dvh]` | Dialog tengah |
| Katalog model | “Lihat semua model & tarif” | Full screen `h-dvh` | Dialog tengah `max-w-4xl` |
| Konsultasi tim | “Konsultasi untuk tim”, chat | Bottom sheet | Dialog tengah |
| Live chat (G4) | Pill “Butuh bantuan?” kanan bawah, link “Butuh bantuan?” di checkout | Full screen sheet | Panel 380×560 kanan bawah, non-modal |

Aturan tumpukan: hanya satu overlay modal terbuka pada satu waktu. Pill live chat disembunyikan saat dialog modal terbuka. Jika chat membuka checkout atau form konsultasi, panel chat ditutup terlebih dahulu.

## Prototype Checkout Modal

- Package summary
- Contact field: email or phone number
- Payment method selection
- Price breakdown
- Confirm button
- Success state: API key mock + “Salin” + “Lihat panduan pasang” (G3)

## Mobile Priority

Mobile is the base layout (mobile first). Navigation collapses. CTA remains prominent. Package picker is stacked. Checkout is a bottom sheet (max height `90dvh`, internal scroll, sticky confirm button). The help pill must never cover a primary CTA or the checkout confirm button.
