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

## Palette

- Ink: `#17181A`
- Paper: `#F7F7F2`
- White: `#FFFFFF`
- Signal Orange: `#FF6B35`
- Warm Yellow: `#FFD85A`
- Mint: `#A8E6CF`
- Sky: `#C8DFFF`
- Muted Gray: `#74777D`
- Border: `#DFE1DC`
- Success: `#16794C`

## Typography

- Display and UI: “Manrope” or a robust locally available sans-serif.
- Mono accents: “IBM Plex Mono” for usage estimates and mock identifiers.
- Avoid highly expressive display fonts; the personality should come from composition and illustration, not decoration.

## Layout

- Warm off-white page with strong dark text.
- Maximum width: 1184px.
- 12-column desktop grid.
- 24px mobile gutters.
- 16px / 24px / 48px / 80px section spacing.
- Rounded cards, 16–24px radius.
- No heavy glassmorphism or excessive gradients.

## Signature UI

- Orange “on” state indicator.
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
- Focus: 3px orange/blue keyboard ring
- Loading: short pulse, no fake delay in prototype
- Success: mint confirmation panel

## Imagery

Use CSS and inline SVG instead of stock photography. Build an abstract dashboard and project preview to communicate progress. This keeps the output lightweight and makes the aesthetic unique.

## Accessibility

- WCAG AA contrast
- Language switch uses a real button group, not text-only links
- Minimum 44px touch target
- Checkout fields have persistent labels
- Status updates use `aria-live`
- Reduced-motion support
