# Ikon

Ikon garis dari [Lucide](https://lucide.dev) **v0.460.0** (`lucide-static`), lisensi ISC:

> Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
> Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

- `sprite.svg` — salinan referensi; `../js/icons.js` menyuntikkan simbol yang sama ke halaman (`<use href="sprite.svg#…">` eksternal diblokir di `file://`).
- Pakai: `<svg class="icon" aria-hidden="true"><use href="#i-globe"/></svg>`.
- Tambah ikon: tambahkan nama di `ICONS` pada `tools/build_icons_v4.py`, lalu jalankan
  `python3 tools/build_icons_v4.py <folder paket lucide-static@0.460.0>` (`npm pack lucide-static@0.460.0`).
- Stroke 1.75, 24px (`docs/v4/visual-direction.md` §6).
