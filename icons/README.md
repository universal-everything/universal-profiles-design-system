# Icons

Status: observed for the stroke, the render sizes and the colour rule; normalized for the 32-unit drawing grid (the largest product render size; the shipped icon sets are drawn on mixed 24, 20 and 16-unit boxes, see R-35 in `../provenance/reconciliation.md`); proposed for the starter set and the manifest format

## Rules

- **Grid (normalized):** new icons are drawn on 32 by 32 units, `viewBox="0 0 32 32"`, live area 4 to 28, optical adjustments allowed within 1 unit. The shipped sets are not redrawn: the mobile icon components use mostly 24-unit boxes (also 20 and 16, a few 32) and the base-layer element uses 24; 32 is the largest size both products render at, so a 32-unit drawing scales down cleanly to 24 and 16.
- **Stroke:** 1.5 units, round caps and round joins, no fills. The starter set has no filled glyph; if a product ever needs one for an active state (check, minus, pulse dot), draw it as a separate file with `-filled` in the name and `"filled": true` in the manifest.
- **Colour:** `stroke="currentColor"` (or `fill="currentColor"` for filled glyphs). Icons never carry their own colour; network and brand logos are the only exception and live outside this set.
- **Sizes:** `size.icon-s` 16, `size.icon-m` 24 (default), `size.icon-l` 32, `size.icon-xl` 48. Below 16 use the outline badge or text.
- **States:** inactive icons use colour (`interactive.unselected`, `interactive.unselected-on-glass`), never opacity; active icons use `interactive.selected`; disabled icons follow the control's opacity; permission icons switch between two colours rather than two files.
- **Accessibility:** icons are decorative by default (`aria-hidden`, `accessible={false}`); icon-only controls take their name from the manifest's `label` or a more specific one. Every icon has its own default label so that two controls never announce the same name (the shipped headers use `arrow-left` for "Back"; `chevron-left` is "Previous"); the validator rejects duplicates. Never rely on an icon alone to convey state.
- **Files:** kebab-case names, one concept per file, no scripts, images, external references or hard-coded colours. `scripts/validate.mjs` lints every file against these rules and against `manifest.json`.

## Categories

| Category | Contents |
|---|---|
| navigation | Chevrons, arrows, close, more, drag handle |
| actions | Check, plus, minus, search, copy, share, edit, refresh, filter, delete, download, upload |
| status | Info, warning, error, success, offline |
| product | Profile, wallet, activity, browse, QR code, scan, settings, lock and unlock, key, link, globe, network, image, grid, list, bell, send, receive, swap, device, eye and eye-off, external link, clock, spinner |

## Starter set

`src/` holds 53 original icons drawn for this repository to the rules above. They are a publishable starting point, not the product icon sets: the mobile app ships 108 registered icons (system, navigation, 33 permission pairs, network logos, monochrome social logos, brand glyphs) as inline SVG strings, and the web ships its own element with a name map. Those sets stay in their repositories.

## Canonical sources and export workflow

1. Product icons are exported from the design source at 32 by 32 with strokes expanded to 1.5 units, then optimised (remove metadata, merge paths, keep `viewBox`).
2. Replace every colour with `currentColor` and remove fills on stroked icons.
3. Name the file after the concept, add it to `manifest.json` with category, label and keywords, and run `node scripts/validate.mjs --only icons`.
4. Generate platform outputs from the same source: React Native inline strings keeping the existing icon-name union stable, a name map for the web element, a sprite for marketing.
5. Network and brand logos (LUKSO, LYX, Base, Ethereum, social marks) are not part of this set: they keep their own colours and their own rights.

## Evidence

SRC-MOBILE-APP icon component (default 1.5 stroke, render sizes 16, 24, 32 and 48, default ink colour, secondary background option, 108 registered names drawn mostly on 24-unit boxes with 20, 16 and a few 32-unit boxes, 33 permission pairs); SRC-WEB-COMPONENTS icon element (24-unit boxes). The 32-unit drawing grid is a normalization of this system (R-35), not an observed product rule. The starter set is original work.
