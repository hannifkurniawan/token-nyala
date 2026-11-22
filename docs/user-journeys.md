# User Journeys v4 — Skenario Persona & Skrip Demo

Persona dasar: `docs/archive/personas.md`. Angka: `services-and-pricing.md`.

## Skenario Utama — Ayu: “Portofolio-ku harus bisa dibuka dosen besok”

**Konteks:** Ayu sudah membuat portofolio di Lovable. Ia tidak tahu cara membuatnya punya alamat sendiri. Budget Rp50.000.
**Pertanyaan di kepala:** “Butuh apa? Berapa? Susah nggak?”

| # | Layar | Yang Ayu lakukan | Yang Ayu lihat / rasakan |
|---|---|---|---|
| 1 | Landing hero | Membaca tagline, melihat board: prompt → membangun → **online di eventku.my.id** | “Oh, di sini bisa sampai online.” |
| 2 | Mau bikin apa? | Chip **Landing page / portofolio** sudah terpilih | Isi: Online-kan proyekmu (Coba-coba) + alamat `.my.id` + AI 10 sesi. **≈ Rp34 rb/bulan**. Isi Rp50.000 → cukup ±1 bulan |
| 3 | — | Ketuk **Nyalakan paket ini** | Masuk console |
| 4 | Masuk | Isi email, kode 6 digit (mock) | Satu field, tanpa nama perusahaan |
| 5 | Wizard 1–2 | Paket terisi; beri nama `portofolio-ayu`, cari alamat `ayu.my.id` (tersedia, Rp5.000 tahun pertama, lalu Rp25.000/tahun) | Ukuran Coba-coba sudah dipilih dengan “cukup untuk portofolio” |
| 6 | Wizard 3 Ringkasan | Melihat Rp15.000 tetap + Rp5.000 domain = **Rp20.000 sekarang**; AI dipotong sesuai pakai. Saldo Rp0 → **Isi saldo** inline Rp50.000 (+5.000) via QRIS | Biaya terlihat sebelum bayar; saldo setelahnya Rp35.000 |
| 7 | Wizard 4 Menyalakan | Menunggu ±5 detik: Menyiapkan ruang → Memasang alamat ayu.my.id → Mengaktifkan HTTPS → Menyambungkan AI ke saldo → **Nyala** | Saklar menyala, confetti ringan (tidak saat reduced motion) |
| 8 | Selesai | Upload folder hasil Lovable (mock) → link `ayu.my.id` | Langkah berikutnya: “Pakai AI di Lovable/Cursor — salin API key proyek” |
| 9 | Beranda | Saldo Rp35.000 · **cukup sampai ±tanggal** · 1 proyek nyala | Tenang: tahu kapan perlu isi lagi |

**Sukses:** dari landing ke link online < 3 menit; tidak bertemu istilah vCPU/region/root password kecuali membuka detail.

## Skenario 2 — Ayu: “Chatbot WhatsApp untuk toko kue kakak”
Paket `chatbot-wa` (Rutin + 1.000 pesan ≈ **Rp47 rb/bulan**). Di wizard ukuran Coba-coba tampil nonaktif: “Belum cukup untuk chatbot — pilih Rutin”. Setelah nyala: langkah “Pindai QR WhatsApp” (mock) dan tombol uji kirim pesan. Beranda menampilkan pemakaian “pesan dibalas bulan ini”.

## Skenario 3 — Raka: “Beberapa klien, satu saldo, tagihan terpisah”
- Paket `web-klien` ≈ **Rp102 rb/bulan** per klien (Rp101.700; bulan pertama Rp346.700 termasuk `.com`). Top-up Rp500.000 → saldo 625.000, cukup ±3 bulan untuk satu klien.
- Preset `?demo=raka` sudah berisi 2 proyek (`klien-kopi`, `klien-salon`; `services-and-pricing.md` §8); saat demo Raka membuat proyek ketiga `klien-event`. Masing-masing punya **API key sendiri dengan limit Rupiah**.
- Saldo → Riwayat difilter per proyek → unduh invoice (mock) per klien.
- Kekhawatiran v3 terjawab: “Apakah saldo bisa dipakai lintas proyek?” → ya, dan pemakaian tetap terpisah.

## Skenario 4 — Dimas: “Otomasi tim tanpa DevOps”
- Paket `otomasi-tim` ≈ **Rp285 rb/bulan** (n8n Ramai + data Sedang + email Rutin + 5.000 tugas otomasi).
- Butuh faktur pajak & invoice perusahaan → section Tim → konsultasi (v3).
- Console: pemakaian AI per anggota (mock), ganti ukuran Ramai → Rutin saat sepi (selisih kembali ke saldo).

## Skenario 5 — Saldo habis (state penting)
Proyek Ayu jatuh tempo, saldo Rp8.000 < Rp15.000:
1. H-3: banner Beranda + email (mock) “Saldo kurang untuk perpanjang portofolio-ayu pada …”.
2. Jatuh tempo: status **Dijeda** (kuning), situs menampilkan halaman “sedang istirahat” (mock), data aman 7 hari.
3. Isi saldo → otomatis nyala lagi, riwayat mencatat perpanjangan.

## Skenario 6 — Berhenti & ganti ukuran
- Berhenti di hari ke-10: dialog menampilkan **sisa Rp10.000 kembali ke saldo** (15.000 ÷ 30 × 20 hari) sebelum konfirmasi.
- Ganti Rutin → Coba-coba: selisih prorata dikembalikan; Coba-coba nonaktif untuk chatbot (alasan ditampilkan).

---

## Skrip Demo untuk Pak Ferry (±7 menit, HP / mode mobile 375px) — final Fase 7

Persiapan: buka `site/index.html` (atau server lokal) dalam mode HP. Gladi otomatis: `python3 -P tools/demo.py --out <folder>` — 21 langkah di bawah dijalankan dan difoto; harus semua `ok`.

| Menit | Buka / ketuk | Yang terlihat | Poin yang ditekankan |
|---|---|---|---|
| 0:00 | `index.html` → hero | “Idemu nyala, dari prompt sampai online.” · board prompt → membangun → **online di eventku.my.id** | Bukan toko token: **platform AI cloud**, mulai dari tujuan |
| 0:40 | Scroll ke **Mau bikin apa?** → chip *Otomasi tim* | Landing page ≈ Rp34 rb/bln → Otomasi tim ≈ Rp285 rb/bln, isi layanan + top-up disarankan | Pemula tahu “butuh apa & berapa” sebelum mendaftar |
| 1:10 | **Semua layanan** → **Satu saldo** | 10 layanan berbahasa awam (label teknis kecil) · saldo 55.000 dipotong per layanan, sisa 12.320 | Semua layanan Sumopod/Helipod ada; **satu saldo Rupiah** (Sumopod: 2 saldo + USD) |
| 2:00 | `harga.html?paket=portofolio#kalkulator` → ukuran *Rutin* | Total langsung ≈ Rp54 rb/bln, ringkasan menempel di bawah | Harga transparan, detail teknis tetap ada |
| 3:00 | `app.html?demo=reset#/buat?paket=portofolio` → masuk (email, kode 6 digit apa pun, nama *Ayu*) | Wizard langkah 2: `portofolio-ayu`, Coba-coba, `ayu.my.id` tersedia | Satu field, tanpa kartu kredit |
| 3:40 | **Lanjut** → Ringkasan → **Isi saldo Rp50.000** → QRIS → *Saya sudah bayar* | Dipotong sekarang **Rp20.000** · saldo 55.000 → **35.000** | Biaya terlihat sebelum bayar; isi saldo tanpa keluar dari alur |
| 4:20 | **Nyalakan sekarang** | Progres: ruang → alamat → HTTPS → AI → saklar **Nyala!** `ayu.my.id` | Dari landing ke online < 3 menit |
| 5:00 | Beranda → proyek → tab **AI** → **Saldo** | “Cukup sampai ±tanggal”, API key proyek + limit, riwayat per layanan | Kontrol dan rasa aman untuk pemula |
| 6:00 | `app.html?demo=dimas` → AI → Pemakaian | Rp647.800 ±22 Jan · n8n + data + email + server · grafik 7 hari | Siap untuk tim kecil (Dimas) |
| 6:30 | Lainnya → **EN** · tombol **Butuh bantuan?** | Seluruh console berbahasa Inggris · Nala “Bantu pilih paket” | Kualitas: ID/EN, bantuan |

**Cadangan (bila ditanya “kalau saldo habis?”):** `app.html?demo=ayu&state=jeda` → banner kuning “dijeda… data aman sampai 27 Des, isi minimal Rp20.000” → isi Rp50.000 → proyek **menyala lagi**, saldo 48.000. Atau menu Akun → **Simulasi: majukan 30 hari** (dua kali dari preset `ayu`: diperpanjang → dijeda).

**Cadangan lain:** proyek → tab Layanan → *Ganti ukuran* (selisih prorata kembali ke saldo) · *Hentikan* (sisa hari kembali) · Layanan lain → Server → Tambah (password sekali tampil).

Mulai ulang demo kapan saja: menu Akun → **Mulai ulang demo**, atau `app.html?demo=reset`.
