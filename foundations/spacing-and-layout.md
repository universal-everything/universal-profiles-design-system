# Spacing and layout

Status: observed for the 4-point scale and gutters; normalized for the 40 and 64 steps; proposed for the web grid guidance

## Scale

`space.1` 4, `space.2` 8, `space.3` 12, `space.4` 16, `space.5` 20, `space.6` 24, `space.8` 32, `space.10` 40, `space.12` 48, `space.16` 64, plus the web extras `space.17` 68, `space.18` 72, `space.22` 88 and `space.30` 120 that the base layer adds. Measured usage: 16 and 24 dominate horizontal padding, 8 dominates gaps.

| Purpose | Token |
|---|---|
| Gap between related elements (icon and label, rows in a group) | `space.2` |
| Screen gutter, default padding of cards, inputs and sheets | `space.4` |
| Section spacing, modal padding, header-to-content | `space.6` |
| Vertical rhythm between groups on a screen | `space.8` |
| Marketing section spacing on the web | `space.12` to `space.30` |

The scale equals the utility-framework default spacing scale (a step is 4 px), so web consumers keep using their spacing utilities; the tokens document intent, they do not introduce new values.

## Mobile layout

- One column, gutters `space.4`, safe-area aware. Bottom padding uses the safe-area inset once on Android and half on iOS, matching the shipped bars.
- The home app grid is four columns of `app-tile.size` (61) tiles; the column count derives from floor(width / 72) minus 1 so wider phones gain a column.
- Bottom bar item height is `tab-bar.item-height` (60); content above it keeps `space.4` clearance plus the bar height.
- The profile panel takes three positions (collapsed strip `profile-card.collapsed-height`, half, full); see `../components/profile-card.md`.

## Web layout

- Content column `size.content-max-width` (880) centred, gutters `space.4` below the `breakpoint.md` and `space.6` above.
- Breakpoints `breakpoint.sm` 640, `breakpoint.md` 768, `breakpoint.lg` 1024, `breakpoint.xl` 1270 (the product override).
- Grid pages use the profile-card column plus a widget canvas; marketing pages use a 12-column grid with `space.6` gutters above `breakpoint.lg` (proposed).

## Do and do not

- Do align everything to the 4-point grid; optical adjustments are allowed for icons inside pills.
- Do keep 16 as the outer gutter on mobile even inside glass panels.
- Do not introduce 6, 10 or 14 spacing values; use the nearest step.

## Evidence

SRC-MOBILE-APP padding and gap literal counts (16 in 39 places, 24 in 32, 8 gaps in 34), tile and column logic in the home grid, safe-area multipliers; SRC-WEB-APP content width and breakpoint override; SRC-WEB-COMPONENTS spacing extras.
