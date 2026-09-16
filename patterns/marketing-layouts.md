# Marketing layouts

Status: observed for the poster and stage-deck structures; proposed for the social template, store frames and responsive marketing pages (OPEN-13, OPEN-14)

## Purpose

Make marketing surfaces recognisably Universal Profiles with the same signature as the product: the profile card as hero, address-born backgrounds, one accent phrase, and the lockup with Powered by LUKSO.

## Flow

| Surface | Structure |
|---|---|
| Poster (3:4) | Headline in two lines with the second line in the accent; the frosted-glass profile-card hero centred; a call-to-action line; a QR card; the product lockup and Powered by LUKSO at the bottom. Light and dark variants. |
| Deck title slide (16:9) | Dark canvas from the generated title background (`../assets/generated/backgrounds/title-dark.png`) or the light one; white or ink headline in `type.deck.h1`; one accent phrase in `accent.brand`; a tiny tracked label top left in `type.deck.caption`; page numbers bottom right. |
| Deck section and closing slides (16:9) | One of the six slides-v2 background families (`../assets/generated/backgrounds/slides-v2/`, each a layered identity collage showing one or more official UP! container cubes, solid, closed and sealed, under decisions 0012 and 0013), the same family through a section, light or dark with the theme; copy inside the family's measured safe zone (`../assets/generated/backgrounds/README.md`; the zones are compact and shared by both registers), never over a cube or the objects around it; iridescent horizon for dividers and closings. The depicted cubes are scenery, not the lockup: a slide that needs the mark uses the official files, and nothing is cropped out of a background to stand in for it. |
| Deck body or chart slide (16:9) | One of the six additive slides-v3-ambient families (`../assets/generated/backgrounds/slides-v3-ambient/`), chosen so its edge cluster stays clear of the content. Headline in `type.deck.h2`, body in `type.deck.body`, charts and tables inside the family's large measured rectangle; light for ink, dark for white. Ambient is subordinate presentation infrastructure, not hero art and not a replacement for slides-v2. |
| Deck product slide (16:9) | A slides-v3-ambient family behind one to three transparent app screens from `../assets/screenshots/mobile-app/`, with both copy and screens inside the recorded quiet rectangle and clear of the edge cubes. The title-background showcases (`../assets/slides/previews/app-showcase-light.png` and dark) remain worked placement examples. Exploratory screens are labelled as such; the shipped onboarding art shows onboarding as it ships. |
| Social post (2:1 and 1:1) | Canvas `surface.canvas` (the board templates use `#F7F9FB`, one unit away); a real profile card or grid capture from the current product, or a generated share card; the periwinkle container cube ornament from official files (the solid, closed UP! box, never a flat badge; `../brand/lockups.md`); the lockup bottom centre; headline in `type.deck.h3` with minus 2 percent tracking, sub-line in `type.deck.body`. |
| Link preview (1200 by 630) | The generated share card (`signatureSvg()`) or the light hero with the headline on the left 42 percent. |
| Store listing frames | The aura background from the address-signature package, a 1 px inner border in `border.glass-reflex`, headline space in the top 18 percent, the device frame centred with a 6 percent margin, captions in `type.deck.h3`. Screenshots are real product screens, never illustrations. |
| Responsive marketing page | Hero with the hero image on the right (light or dark by theme), headline left in `type.display.xl` scaling to `type.display.m` below `breakpoint.md`, an accent button and a ghost button, then alternating feature sections with soft-object illustrations, then a profile-card wall built from real profiles; the four pillars as a row of soft cards. Twelve columns above `breakpoint.lg`, one column below `breakpoint.sm`. |

Safe zones and framing per format are in `../imagery/framing-and-safe-zones.md`.

## Rules

- The card is the hero. Render cards from the current product or the generator, never from old captures; product screens come from the owner-authorized exports in `../assets/screenshots/mobile-app/` or from the current product.
- Backgrounds are address-derived (linear or aura) or recorded soft-object images: title, expressive slides-v2 and ambient slides-v3. Use expressive scenes for campaign, hero, section and closing moments; use ambient scenes for body copy, charts and screens. No neon, no generic AI dreamscapes (the iridescent-horizon slides-v2 family is the one admitted landscape), no stock people. The UP! container cubes stay inside their complete images; decisions 0012/0013 and 0014 grant no extraction or trademark licence.
- One accent phrase per surface; body text stays neutral.
- The lockup uses official files only; the partner lockup is not used until OPEN-11 closes.
- Counts, prices and dated claims never appear.

## Accessibility

Headline contrast follows the theme tokens (ink on the light canvas, white on the dark title background). Text never sits over the busiest part of the hero image; keep it in the quiet left area. Social images carry their headline as alt text. Minimum text size on social images is 28 px at 1080 width.

## Status

Poster and deck structures observed in the 2025 posters and the 2026 stage deck; social geometry observed on the brand board and proposed for adoption (OPEN-14); deck scale proposed (OPEN-13); store frames and responsive pages proposed.

## Evidence

SRC-POSTER-2025, SRC-NFTNYC-2026, SRC-FIGMA-UP-BOARD social templates (1131:22735, 1131:27438), SRC-GENERATED-IMAGES (IB-10 title, IB-12 expressive backgrounds under decisions 0012/0013, and IB-13 ambient backgrounds under decision 0014), SRC-FIGMA-MOBILE-UPDATES (exported screens, decision 0011).
