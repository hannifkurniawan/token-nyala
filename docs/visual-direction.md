# Visual Direction — TokenNyala

## Concept
**“A warm, modern marketplace that feels ready to build.”**

TokenNyala combines marketplace clarity with one memorable visual motif: a digital power switch. The interface should feel encouraging but commercially credible.

## Brand Keywords
- Nyala / energized
- Clear
- Friendly
- Modern
- Indonesian
- Practical

## Palette — XL Ecosystem

- XL Blue: `#002DBB` — warna utama XL, CTA, header, dan brand mark
- XL Dark: `#00166A` — teks gelap, footer, dan state premium
- XL Yellow: `#FFC93C` — highlight, badge, dan energi
- XL Teal: `#00D2A0` — success, active state, dan saldo siap
- XL Sky: `#5CD0F9` — guidance, estimate, dan visual pendukung
- Paper: `#F7F8FC` — background hangat dengan bias biru-putih
- White: `#FFFFFF`
- Ink: `#17181A` — teks sekunder
- Muted Gray: `#626B82` (revisi dari `#69728A` agar lolos kontras AA di semua latar)
- Border: `#D9DEEA`

## Cara Penggunaan Warna

- Gunakan XL Blue sebagai warna aksen terbesar dan CTA utama.
- Gunakan XL Yellow hanya untuk 10–15% area agar tetap premium.
- Gunakan XL Teal untuk success dan status aktif.
- Gunakan XL Sky untuk informasi, perkiraan, dan elemen pendukung.
- Hindari orange dan mint generik agar identitas tidak terasa keluar dari ekosistem XL. Semua penyebutan “orange”, “Signal” atau “mint” di dokumen lama dibaca sebagai XL Yellow (energi/on-state) dan XL Teal (success/selected).

## Typography

- Display and UI: “Manrope” or a robust locally available sans-serif.
- Mono accents: “IBM Plex Mono” for usage estimates and mock identifiers.
- Avoid highly expressive display fonts; the personality should come from composition and illustration, not decoration.

## Layout

- Warm off-white page with strong dark text.
- Maximum width: 1184px.
- 12-column desktop grid.
- Gutter: 16px di bawah 640px, 24px mulai `sm:` (640px), container `max-w-[1184px]` mulai `xl:`.
- 16px / 24px / 48px / 80px section spacing.
- Rounded cards, 16–24px radius.
- No heavy glassmorphism or excessive gradients.

## Signature UI

- XL Yellow “on” state indicator.
- Flame/spark symbol used as a small brand device, not a mascot.
- Battery/credit meter for the checkout summary.
- Segmented intent picker with clear selected state.
- Dotted guide lines and small wireframe-like annotations around the hero illustration.

## Component States

- Default package card
- Recommended package card
- Selected card
- Disabled/low-contrast card avoided; if unavailable, clearly state “Habis”
- Hover: slight vertical lift and stronger border
- Focus: 3px XL Sky ring (`#5CD0F9`) dengan offset 3px
- Loading: short pulse, no fake delay in prototype
- Success: XL Teal confirmation panel

## Imagery

Use CSS and inline SVG instead of stock photography. Build an abstract dashboard and project preview to communicate progress. This keeps the output lightweight and makes the aesthetic unique.

## Accessibility

- WCAG AA contrast
- Language switch uses a real button group, not text-only links
- Minimum 44px touch target
- Checkout fields have persistent labels
- Status updates use `aria-live`
- Reduced-motion support
