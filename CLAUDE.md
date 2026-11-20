# TokenNyala Designer

Prototype **platform AI Cloud Services** untuk vibecoder pemula di Indonesia (ID/EN): AI untuk membangun, cloud untuk menjalankan, satu saldo Rupiah. Tagline: *Idemu nyala, dari prompt sampai online.*

- **Mulai setiap sesi dengan membaca `PROJECT-MEMORY.md`** (status, keputusan, pertanyaan terbuka, pelajaran). Perbarui file itu di akhir sesi.
- Pengembangan aktif: **`v4/`** (landing + harga + console mock, mobile first, Tailwind v4 CLI). Dokumen: mulai dari `docs/v4/README.md`; aturan membangun di `docs/v4/technical-spec.md`; semua angka dari `docs/v4/services-and-pricing.md`.
- Setelah mengubah `v4/`: `npm run build` di `v4/`, lalu `python3 -P tools/qa_v4.py --interactive --out <dir>` (lihat screenshot-nya), `python3 -P tools/i18n_check.py --root v4`, dan `python3 -P tools/audit_v4.py`. Semua harus lolos sebelum commit. (Tools v4 dibuat di fase 1–7; sebelum ada, pakai pola tools v3.)
- Arsip — jangan diedit: v1 (root `index.html`/`styles.css`/`script.js`), v2 (`v2-tailwind-cdn/`), **v3 (`v3/`, versi top-up token yang sudah didemokan)**, dan `showcase/` (versi user yang didemokan ke Pak Ferry; acuan visual v4 = `showcase/v2`).
- Komunikasi dengan user dalam Bahasa Indonesia.
