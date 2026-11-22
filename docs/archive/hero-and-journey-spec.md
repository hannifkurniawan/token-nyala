# Hero and Journey Visual Specification — TokenNyala

## Hero Structure

### Desktop

```text
[Eyebrow]

[Headline]                    [Project Preview Board]
[Supporting copy]             [Prompt → Preview]
[Primary CTA] [Secondary]     [Balance Meter]
[Trust row]                   [Status: READY TO BUILD]
```

### Mobile

```text
[Eyebrow]
[Headline]
[Supporting copy]
[Primary CTA]
[Secondary CTA]
[Trust row]
[Compact project preview]
[Balance meter]
```

## Hero Copy Priority

1. Pain: momentum could stop.
2. Promise: choose the right balance.
3. Action: top up and continue building.

H1 should communicate the problem without using `AI credit`, `token`, or `API`:

**Recommended:** `Mulai vibecoding. Jangan berhenti di tengah jalan.`

## Hero Visual

Create a mock project board that shows a user building a product:

```text
Project: Event Landing Page
Prompt: Make the hero warmer and simpler

[Code State]           [Preview Card]
Writing component...  Event page ready

Saldo aktif: Rp100.000
Estimate: 40–60 small sessions
Status: Nyala
```

The illustration should communicate:
- Prompting
- Previewing
- Credit remaining
- Progress
- Package fit

Avoid neural-network backgrounds and generic AI head illustrations.

## Visual Animation

- Board cards enter from the right over 450ms.
- Balance meter fills only after package selection.
- Status dot changes from gray to XL Teal when package selected.
- No continuous blinking or heavy parallax.

## Journey Section

### Section Title
`Dari ide ke proyek, tanpa langkah yang membingungkan.`

### Cards

1. **Pilih tujuan**
   - Belajar
   - Prototype
   - Kerja

2. **Bayar sesuai paket**
   - Nominal jelas
   - Tidak ada biaya tambahan
   - Metode lokal

3. **Lanjutkan membangun**
   - Ringkasan riwayat
   - Status saldo
   - Kembali ke proyek

## Package Journey

### Intent State

Ayu selects **Belajar**:
- Recommendation: Rp50.000
- Estimate: 20–30 small sessions
- Helper: coba satu project kecil.

Raka selects **Prototype**:
- Recommendation: Rp100.000
- Estimate: 40–60 small sessions
- Helper: iterasi satu prototype aktif.

Dimas selects **Kerja**:
- Recommendation: Rp250.000
- Estimate: 100+ small sessions
- Helper: kebutuhan proyek berkelanjutan.

## Package Card Layout

```text
[Intent fit]
[Paket Bangun]
Rp100.000
[Bonus Rp15.000]
Sekitar 40–60 sesi kecil
Cocok untuk prototype aktif
[Pilih & lanjutkan]
```

Only one card should appear visually recommended per intent state.

## Product Outcome Section

Use the phrase:

**“Jangan hanya beli saldo. Pastikan proyekmu punya waktu untuk jadi.”**

Show a mock before and after:

```text
Before                  After
Stuck at 80%             Prototype ready
Balance unclear          Balance visible
Guessing package         Package matched
```

## Trust Section

Place local trust cues near checkout and package selection, not only in the footer:

- QRIS / E-Wallet / Virtual Account
- Rincian biaya sebelum bayar
- Email or phone number for purchase evidence
- Support link
- Estimated usage disclaimer

Do not imply real regulatory, tax, or payment certification unless content is verified.

## Mobile Checkout

- Opens from bottom of viewport.
- Drag handle for visual affordance.
- Close button remains visible.
- Package summary remains sticky.
- Primary button remains fixed above safe area.
- Form is single-column.
- Payment method is two-column only at 640px and wider.

## Responsive Rules (Mobile First)

Desain dimulai dari mobile; layar lebih lebar hanya menambah kolom. Breakpoint mengikuti `docs/archive/technical-spec.md` (default Tailwind).

- Base (320px+): satu kolom — hero, trust, package, checkout bottom sheet.
- `md:` 768px+: package cards 2 kolom, checkout menjadi dialog di tengah.
- `lg:` 1024px+: hero 2 kolom, 3 package cards, navigasi desktop.
- `xl:` 1280px+: konten dibatasi 1184px.

## Prototype Labels

Use a small, clear footer label where relevant:

`Konsep interaktif — no real payment`

Avoid putting this warning too prominently in the hero so the prototype remains credible for interview presentation.
