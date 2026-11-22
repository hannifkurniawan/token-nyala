# Dokumen v4 — TokenNyala sebagai Platform AI Cloud

v4 mengubah TokenNyala dari *top-up saldo AI* menjadi **platform AI Cloud Services** untuk vibecoder pemula: AI untuk membangun, cloud untuk menjalankan, satu saldo Rupiah. Latar belakang: `archive/v4-cloud-plan.md` dan `../research/ai-cloud-reference.md`.

## Urutan baca

| # | File | Isi | Berlaku untuk |
|---|---|---|---|
| 1 | `brief.md` | Masalah, user, janji, pembeda, cakupan, metrik | Arah produk |
| 2 | `services-and-pricing.md` | **Sumber tunggal data**: layanan, ukuran, harga mock, satuan estimasi, paket, aturan saldo & tagihan | Semua angka |
| 3 | `information-architecture.md` | Peta halaman landing, harga, console; navigasi; overlay | Struktur |
| 4 | `user-journeys.md` | Skenario per persona | Alur |
| 4b | `demo.md` | **Pegangan demo** (±9 menit): alur, pesan utama, pertanyaan yang mungkin muncul, link situs | Demo |
| 5 | `wireframes.md` | Wireframe mobile (utama) lalu desktop | Layout |
| 6 | `microcopy.md` | Copy ID/EN dan state UI | Teks |
| 7 | `visual-direction.md` | Bahasa visual showcase v2 diterjemahkan ke token | Tampilan |
| 8 | `technical-spec.md` | Struktur kode, build, state, i18n, QA, Definition of Done, aturan membangun | Implementasi |

## Aturan prioritas jika ada konflik

1. **Angka** → `services-and-pricing.md` menang. Dokumen lain hanya mengutip.
2. **Cara membangun** → `technical-spec.md` (bagian *Aturan membangun*) menang.
3. **Copy** → `microcopy.md` menang.
4. Dokumen v3 di `docs/` tetap berlaku untuk hal yang **tidak** diubah v4 (persona dasar, aturan saldo, katalog model, live chat Nala), dan dikutip dengan menyebut file-nya.

## Yang diwarisi dari v3 tanpa perubahan

- Persona Ayu, Raka, Dimas (`docs/archive/personas.md`).
- Aturan saldo: 1 kredit = Rp1, termasuk PPN, tidak kedaluwarsa, tidak bisa diuangkan, request AI gagal tidak dipotong.
- Katalog 12 model mock + definisi “sesi kecil” + level biaya (`docs/archive/technical-spec.md`).
- Kontak checkout satu field email **atau** HP, normalisasi `+628…`; data kontak tidak pernah disimpan.
- Metode bayar QRIS, e-wallet, virtual account (mock).
- Live chat Nala + serah ke agen Sari (skrip diperbarui di `microcopy.md`).
- Tipografi 2 keluarga / 4 face (Manrope 500/700/800, IBM Plex Mono 500).
- Mobile first, viewport uji 320/375/768/1024/1440 + 667×375, WCAG 2.1 AA.

## Status build (20 Nov 2026)
Fase 0–7 selesai di branch `v4-cloud`; kode di `site/`, cara membuka & akun contoh di `site/README.md`, pegangan demo di `demo.md`, bukti DoD di `technical-spec.md` §9.
