# Demo TokenNyala — pegangan presentasi (±9 menit)

Untuk siapa pun yang mendemokan TokenNyala. Semua angka di bawah berasal dari prototype (contoh/simulasi, belum harga final).

**Situs:** https://hannifkurniawan.github.io/token-nyala/ — tayang otomatis dari branch `main` (GitHub Pages).
Tanpa internet: buka `site/index.html` langsung di browser, atau `cd site && python3 -m http.server 8000`.

## Pesan utama (sampaikan di awal dan akhir)
1. **Bukan toko token — platform AI cloud.** AI untuk membangun, cloud untuk menjalankan, dari prompt sampai online.
2. **Mulai dari tujuan, bukan dari menu.** Pemula memilih “mau bikin apa”, langsung tahu butuh apa dan berapa per bulan.
3. **Satu saldo Rupiah untuk semuanya** — hosting, aplikasi, server, data, alamat web, email, dan AI. Biaya selalu terlihat sebelum bayar.

## Persiapan (5 menit sebelum mulai)
- [ ] Buka situs di HP, atau di laptop dengan mode HP (DevTools → 375 px). Bahasa: **ID**.
- [ ] Siapkan **satu foto** di perangkat (untuk langkah Chat AI).
- [ ] Buka tab-tab berikut supaya tidak mengetik alamat saat demo:
      [landing](https://hannifkurniawan.github.io/token-nyala/) ·
      [kalkulator](https://hannifkurniawan.github.io/token-nyala/harga.html?paket=portofolio#kalkulator) ·
      [console akun baru](https://hannifkurniawan.github.io/token-nyala/app.html?demo=reset#/buat?paket=portofolio) ·
      [Chat AI](https://hannifkurniawan.github.io/token-nyala/app.html?demo=raka#/chat) ·
      [akun tim](https://hannifkurniawan.github.io/token-nyala/app.html?demo=dimas#/beranda) ·
      [cadangan saldo habis](https://hannifkurniawan.github.io/token-nyala/app.html?demo=ayu&state=jeda#/beranda)
- [ ] Gladi otomatis (opsional): `python3 -P tools/demo.py --url https://hannifkurniawan.github.io/token-nyala/ --out <folder>` — 24 langkah difoto, semua harus `ok`.

## Alur demo

| Menit | Buka / lakukan | Yang terlihat | Yang ditekankan |
|---|---|---|---|
| 0:00 | **Landing** → hero | “Idemu nyala, dari prompt sampai online.” Papan: prompt → membangun → **online di eventku.my.id** | Platform AI cloud, dari ide sampai online |
| 0:40 | Gulir ke **Mau bikin apa?** → pilih *Otomasi tim* | Landing page ≈ **Rp34 rb/bln** → Otomasi tim ≈ **Rp285 rb/bln**, isi layanan + saldo yang disarankan | Pemula tahu “butuh apa & berapa” sebelum mendaftar |
| 1:10 | **Semua layanan** → **Aman untuk pemula** (kartu Satu saldo) | 11 layanan dengan nama awam (istilah teknis kecil di bawahnya) · saldo Rp55.000 dipotong per layanan, sisa Rp12.320 | Semua kebutuhan proyek di satu tempat, satu saldo Rupiah |
| 2:00 | Tab **kalkulator** → ukuran hosting *Rutin* | Total langsung ≈ **Rp54 rb/bln**, ringkasan menempel | Harga transparan; rincian teknis tetap bisa dibuka |
| 3:00 | Tab **console akun baru** → masuk (email apa saja, kode 6 digit apa saja, nama *Ayu*) | Wizard sudah terisi: `portofolio-ayu`, Coba-coba, alamat `ayu.my.id` tersedia | Satu kolom kontak, tanpa kartu kredit |
| 3:40 | **Lanjut** → Ringkasan → **Isi saldo Rp50.000** → QRIS → *Saya sudah bayar* | Dipotong sekarang **Rp20.000** · saldo Rp55.000 → **Rp35.000** | Biaya terlihat sebelum bayar; isi saldo tanpa keluar dari alur |
| 4:20 | **Nyalakan sekarang** | Progres: ruang → alamat → HTTPS → AI → saklar **Nyala!** `ayu.my.id` | Dari landing sampai online < 3 menit |
| 5:00 | Beranda → proyek (tab AI) → Saldo | “Cukup sampai ±tanggal”, API key proyek + batas belanja, riwayat per layanan | Kontrol dan rasa aman untuk pemula |
| 5:40 | Tab **Chat AI** → ketik pertanyaan → 📎 lampirkan foto | DeepSeek Chat: “tidak bisa membaca gambar” → **Ganti ke Gemini Flash (Hemat)** → kirim → biaya per balasan tampil (±**Rp17**) | Chat dengan 12 model dari saldo yang sama; kemampuan & biaya jelas sebelum kirim |
| 6:30 | Tab **akun tim** (Dimas) → menu **Aplikasi** → *Otomasi n8n* → **Tampilkan** password | Saldo Rp647.800 · alamat admin n8n, username, password · tab Pemakaian, Log, Ukuran | Aplikasi siap pakai; AI otomatis tersambung ke saldo |
| 7:15 | Menu **Server** → *Hemat · IP bersama* → Sedang (**Rp45.000**) → Nyalakan → tambah port 5678 | Perintah SSH siap salin · port luar dipilih otomatis (sisa 3 dari 5) | Server murah untuk bot/n8n; port diatur sendiri tanpa tiket support |
| 8:00 | Menu **API AI** → Pemakaian | Grafik pemakaian 7 hari, per proyek | Siap untuk tim kecil |
| 8:30 | Lainnya → **EN** · tombol **Butuh bantuan?** → *A cheap server?* | Console berbahasa Inggris · Nala menjelaskan dua jenis server + tombol ke menunya | Kualitas: ID/EN, bantuan selalu ada |

## Pertanyaan yang mungkin muncul
| Pertanyaan | Jawaban singkat | Tunjukkan |
|---|---|---|
| Kalau saldo habis, proyek dihapus? | Tidak. Layanan **dijeda**, data aman 7 hari; isi saldo → menyala lagi otomatis. Pengingat 3 hari sebelumnya. | Tab **cadangan saldo habis** → isi Rp50.000 → menyala lagi, saldo Rp48.000 |
| Bisa berhenti di tengah bulan? | Bisa, sisa hari kembali ke saldo. Ganti ukuran naik/turun, selisihnya prorata. | Proyek → tab Layanan → *Hentikan* / *Ganti ukuran* |
| Apa bedanya dengan platform sejenis? | Satu saldo Rupiah (bukan saldo terpisah + kurs dolar), mulai dari tujuan, ukuran berbahasa awam, port server diatur sendiri, ukuran bisa diturunkan, kemampuan tiap model terlihat. | Kartu Satu saldo · menu Server · Chat AI |
| Model AI apa saja? | 12 model (Claude, GPT, Gemini, DeepSeek, Qwen) dari Hemat sampai Premium; sebagian bisa membaca gambar, suara, video. | Harga → bagian AI (kolom *Bisa membaca*) |
| Bisa dipakai tim / perusahaan? | API key per proyek dengan batas belanja, riwayat per proyek, invoice; ada jalur konsultasi tim. | Landing → bagian Tim · console Saldo → Riwayat |
| Harganya sudah final? | Belum — semua harga contoh, menunggu validasi. | — |
| Data saya disimpan? | Prototype: tidak ada transaksi nyata. Email/HP, isi chat, dan lampiran tidak disimpan. | — |

## Mengulang demo
- Menu Akun → **Mulai ulang demo**, atau buka `app.html?demo=reset`.
- Akun contoh: `?demo=ayu` (1 proyek), `?demo=raka` (2 klien), `?demo=dimas` (tim + server), `?demo=ayu&state=jeda` (saldo habis).
- Menu Akun → **Simulasi: majukan 30 hari** untuk menunjukkan perpanjangan otomatis lalu dijeda.
