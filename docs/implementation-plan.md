# Implementation Plan — TokenNyala Landing Page

## Goal
Build a polished, static HTML/CSS/JavaScript landing page for a desktop and mobile interview presentation.

## File Structure

- `index.html` — complete page markup
- `styles.css` — design system and responsive layout
- `script.js` — package selection, language switch, modal, and success state
- `assets/` — optional SVG/icon files if separated

## Section Build Order

1. Document setup and design tokens.
2. Navigation and mobile menu.
3. Hero with project-preview illustration.
4. Three-step how-it-works strip.
5. Interactive package picker.
6. Benefits and practical-estimate example.
7. FAQ and trust section.
8. Final CTA and footer.
9. Purchase modal and success state.

## Interaction Requirements

### Package Picker
- Three intents: Learn, Prototype, Work.
- Selecting intent updates recommended package and estimate copy.
- Package cards update selected state and amount in modal.
- Buttons expose keyboard focus and have 44px minimum height.

### Language Switch
- Indonesian is default.
- English switch updates visible copy using a JavaScript translation object.
- Dynamic package and checkout copy update too.
- Persist selection in `localStorage` (key `tn-lang`). Only the language preference is stored.

### Checkout Modal
- Opens from primary CTAs and package cards.
- Displays selected nominal, bonus, fee, and total.
- Uses static mock payment methods.
- One contact field accepts **email or Indonesian phone number**, with a persistent label and inline validation (see technical-spec → Form Validation).
- Confirm button shows success state.
- Modal closes with Escape or close button and traps keyboard focus.

## Responsive Behavior (Mobile First)

Build every section at 320–375px first, then add `md:` and `lg:` enhancements. See `docs/v3-ground-rules.md`.

- Base/mobile: menu collapse, stacked hero, full-width intent tabs, stacked cards, bottom-sheet checkout.
- `md:` (768px): 2-column package grid, centered checkout dialog.
- `lg:` (1024px): full navigation, 2-column hero, 3-card package grid.

## Data Model

```js
const packages = {
  learn: { amount: 50000, bonus: 5000, label: "Mulai", estimate: "20–30 sesi" },
  prototype: { amount: 100000, bonus: 15000, label: "Bangun", estimate: "40–60 sesi" },
  work: { amount: 250000, bonus: 50000, label: "Scale", estimate: "100+ sesi" }
}
```

Use estimates as illustrative and clearly state that actual usage varies.

## Tech Constraints

- No framework required.
- No external build process.
- Google Fonts may be imported, but provide system-font fallback.
- Use inline SVG or CSS illustrations, avoiding copyrighted assets.
- Browser support: current Chrome, Safari, Firefox, Edge.

## Quality Checklist

- Mobile menu keyboard operable.
- Modal focus trap and Escape close.
- Form labels and status announcements.
- Color contrast passes for primary text and CTA.
- Reduced-motion CSS.
- No horizontal overflow at 320px, 375px, 768px, 1024px, 1440px, and 667×375 landscape — checked after **each** section, not only at the end.
- CTA and package copy remain understandable without technical context.
- Prototype labels clarify no real transaction occurs.

## Presentation Enhancements

- Subtle entrance transitions for hero content.
- Animated credit meter only on package selection and success.
- Cursor-following highlight intentionally avoided to keep the experience restrained.
