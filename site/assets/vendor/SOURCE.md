# Vendor (motion, landing & harga saja)

Disalin tanpa perubahan dari `showcase/v2/assets/vendor/` (agar jalan offline dan di `file://`).

| File | Versi | Lisensi |
|---|---|---|
| `gsap.min.js` | GSAP 3.12.5 | GSAP Standard License (https://gsap.com/standard-license) |
| `ScrollTrigger.min.js` | ScrollTrigger 3.12.5 | GSAP Standard License |
| `lenis.min.js` | Lenis 1.1.13 | MIT (https://github.com/darkroomengineering/lenis) |

Dimuat `defer` sebelum `assets/js/motion.js`. Jika gagal dimuat atau `prefers-reduced-motion: reduce`, halaman tampil statis tanpa animasi (`docs/visual-direction.md` §7).
