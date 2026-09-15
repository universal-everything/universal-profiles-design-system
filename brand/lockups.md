# Marks and lockups

Status: observed for the badge typography, the lockup structure and the colour variants; open for the corner radius (OPEN-02), the vector masters and clear space (OPEN-03), the partner lockup and sub-brand (OPEN-11)

## What exists

| Mark | Observed construction | Where observed |
|---|---|---|
| **UP! badge** | A rounded square filled with the brand gradient (`accent.gradient-start` to `accent.gradient-end`, mirroring the app icon's `#A7ACF9` to `#6E7BE6`) carrying "UP!" in Inter Extra Bold, white, glyph height 44 percent of the badge side, tracking minus 2.2 percent, optically centred. A one-colour outline version (1.5 px rounded square with the glyphs) exists in the app for small interface use. Corner radius: about 12 percent of the side on the app icon and the app-icon exploration tile, 17.3 percent on the board's white badge (OPEN-02). | App icon (SRC-APP-ICON), brand board nodes 2988:1594 and 1565:477 and siblings (SRC-FIGMA-UP-BOARD), posters (SRC-POSTER-2025) |
| **Product lockup** | Badge, then a two-line wordmark "UNIVERSAL" (light weight) over "PROFILES" (bold), both in the periwinkle tint (posters sample about `#8494EE`, the board's second swatch), a thin vertical rule, then "Powered by" (Inter SemiBold) above the LUKSO wordmark with its distinctive open K. Black on light, white on dark. | Posters, 2026 stage deck closing slide, board social template lockup rasters (SRC-FIGMA-UP-BOARD nodes 1131:27447, 1131:27459, 1131:27471 and 1506:321) |
| **Partner lockup** | Badge plus "powered by" (Inter SemiBold, minus 2.2 percent tracking, line height 1.5) above the two-line wordmark. The board labels six tones for text and wordmark: white `#FAFAFA`, UP! grey `#D4CFDE`, light grey `#939A9F`, dark grey `#6D6D6D`, soft black `#1A1A1A`, black `#000000`. Reads "powered by Universal Profiles": an ecosystem badge for partner apps, distinct from the product lockup. No usage, clear-space or approval exists (OPEN-11). | Board nodes 1565:466 to 1565:541 |
| **Cube** | A 3D periwinkle soft-plastic cube with the badge face, used as the ornament in posters, the app splash and social templates. Rasters only. | App bundle, board nodes 1131:25142, 2862:1498 |
| **UP! CREATOR SPACE** | An exploratory sub-brand lockup on the board. Appears in no shipped product or collateral. Not approved (OPEN-11). | Board nodes 2868:1510, 2870:1541 |

## Colour variants

- Light surfaces: badge in the brand gradient, wordmark in `accent.brand` (light) or the poster tint; Powered by LUKSO in black.
- Dark surfaces: badge unchanged, wordmark in `accent.brand` (dark, `color.up.73`) or white; Powered by LUKSO in white.
- One-colour: the outline badge in `text.default` or `text.inverse`, wordmark in the same colour. Used at small sizes and in monochrome contexts.
- Never a magenta badge; magenta belongs to the LUKSO mark.

## Sizes and clear space

No clear-space or minimum-size rule has been drawn by the owners. Until masters and rules arrive:

- Minimum badge size 16 px on screens (the outline version below 24 px), 8 mm in print (proposed).
- Keep a clear space of at least the badge's side on every side of a lockup (proposed).
- Do not place a lockup over a busy cover without the glass tier or a solid tint behind it.

## What this repository does not do

- It does not ship the badge, wordmark, cube or Powered by LUKSO files. The folder `../assets/logos/` explains how to obtain official files.
- It does not reconstruct a vector from the specification above, under any label (`../decisions/0010-no-reconstruction-under-any-label.md`); the validator rejects a provenance record marked `reconstructed`.
- It does not include the board's raster wordmarks, private renders or the app bundle's rasters.

## Evidence

Badge glyph typography exact on two native board nodes (230.52 px and 128.066 px); lockup structure from the posters and the stage deck; six-tone labels from native board text nodes. Radius values: measured on the shipped app icon and read from the board's badge and tile nodes.
