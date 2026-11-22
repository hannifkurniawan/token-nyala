# TokenNyala Designer

Prototype **platform AI Cloud Services** untuk vibecoder pemula di Indonesia (ID/EN): AI untuk membangun, cloud untuk menjalankan, satu saldo Rupiah. Tagline: *Idemu nyala, dari prompt sampai online.*

- **Mulai setiap sesi dengan membaca `PROJECT-MEMORY.md`** (status, keputusan, pertanyaan terbuka, pelajaran). Perbarui file itu di akhir sesi.
- Versi terbaru (yang dikembangkan dan tayang di GitHub Pages): **`site/`** — landing + harga + console mock, mobile first. Landing & harga: CSS tulisan tangan (`site.css` + `landing.css`/`harga.css`, cara showcase v2); console: Tailwind v4 CLI. Dokumen: mulai dari `docs/README.md`; aturan membangun di `docs/technical-spec.md`; semua angka dari `docs/services-and-pricing.md`.
- Setelah mengubah `site/`: `npm run build` di `site/`, lalu `python3 -P tools/qa.py --interactive --out <dir>` (lihat screenshot-nya), `python3 -P tools/i18n_check.py`, dan `python3 -P tools/audit.py`. Semua harus lolos sebelum commit. Sebelum demo: `python3 -P tools/demo.py --out <dir>`.
- GitHub Pages: `.github/workflows/pages.yml` mempublikasikan `site/` (tanpa `src/`, `package*.json`) setiap push ke `main`. Repo public — jangan commit kredensial, data kontak, atau hal rahasia.
- Arsip — jangan diedit isinya: `archive/v1/`, `archive/v2-tailwind-cdn/`, **`archive/v3/`** (versi top-up token yang sudah didemokan), `archive/showcase/` (versi user yang didemokan ke Pak Ferry; acuan visual = `archive/showcase/v2`). Dokumen lama: `docs/archive/`; tool v3: `tools/archive/`. Logo sumber: `brand/`.
- Komunikasi dengan user dalam Bahasa Indonesia.
