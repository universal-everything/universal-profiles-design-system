# Framing and safe zones

Status: proposed (derived from the observed poster, deck and social structures; the board's social geometry is OPEN-14)

## Formats

| Surface | Size | Safe zone | Hero placement | Lockup |
|---|---|---|---|---|
| README and website hero | 16 by 9 (1672 by 941 delivered) | Copy in the left 42 percent; keep 6 percent margins | Card in the right third | none on the image |
| Link preview | 1200 by 630 | 5 percent margins; some platforms crop to 1.91 by 1 or square, keep the card inside the central 60 percent | Card right or centred | none |
| Social post | 1080 by 1080 and 1600 by 900 (2 by 1 in practice) | 8 percent margins; avoid the bottom 12 percent where captions overlay | Card centred, cube ornament pair top left and bottom right | bottom centre, 78 by 18 at 752 wide (board template proportion) |
| Story and short video | 1080 by 1920 | Top 14 percent and bottom 20 percent reserved for platform chrome | Card in the upper middle, headline above | bottom centre above the reserved area |
| Poster | 3 by 4 (6144 by 8192) | 6 percent bleed-safe margin | Card centred; headline top; call to action and QR below | bottom, with Powered by LUKSO separated by the rule |
| Deck title, campaign, section or closing slide | 1920 by 1080 (16 by 9) | Left 55 percent text-safe on title backgrounds; compact per-family measured zones for expressive slides-v2 in `../assets/generated/backgrounds/README.md`; page number bottom right; tracked label top left | Where the expressive family's subject sits | header row |
| Deck body, chart or product-screen slide | 1920 by 1080 (16 by 9) | The shared light/dark rectangle of a slides-v3-ambient pair: left or right 64/68 percent, upper 72 percent, or central 60 by 76 percent; use the exact family rectangle | One or two cubes and supporting forms at the edge, outside the copy rectangle | header row |
| Store screenshots | 1290 by 2796, 1284 by 2778, 1080 by 2400 | Top 18 percent headline; 6 percent device margin | Device frame centred | none |
| App icon | 1024 square | Platform masks; keep the badge glyph within the central 66 percent | | the badge itself |

## Composition rules

- Copy sits in the quiet area of the image. The delivered heroes keep the left 42 percent empty and the title backgrounds the left 55 percent. Every expressive slides-v2 background declares a measured zone (light at least 200, dark at most 64, deviation at most 20). Every ambient slides-v3 background declares a larger, stricter pair rectangle (light at least 220, dark at most 36, deviation at most 12); the six exact rectangles and measurements are in `../assets/generated/backgrounds/README.md`.
- Use ambient backgrounds behind body copy, charts and transparent screens; use expressive slides-v2 for campaign, hero, section-divider and closing moments. Do not treat ambient as a replacement for slides-v2 or move copy outside either set's recorded rectangle.
- Darker gradient stops stay away from the lockup corner.
- One accent phrase; body text neutral; names and addresses PT Mono.
- Never put text over the busiest part of a cover image without the glass tier or a solid tint.
- Generic composition templates (thirds, golden ratio, canon grids) from the evidence are not brand rules; use this table.

## Evidence

SRC-POSTER-2025 composition, SRC-NFTNYC-2026 slide structure, SRC-FIGMA-UP-BOARD social template geometry (1131:22735, 1131:27438) and app-icon tile (2846:1515), SRC-GENERATED-IMAGES prompts (negative-space constraints) and measured safe zones.
