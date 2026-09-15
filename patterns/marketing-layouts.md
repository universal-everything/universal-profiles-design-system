# Marketing layouts

Status: observed for the poster and stage-deck structures; proposed for the social template, store frames and responsive marketing pages (OPEN-13, OPEN-14)

## Purpose

Make marketing surfaces recognisably Universal Profiles with the same signature as the product: the profile card as hero, address-born backgrounds, one accent phrase, and the lockup with Powered by LUKSO.

## Flow

| Surface | Structure |
|---|---|
| Poster (3:4) | Headline in two lines with the second line in the accent; the frosted-glass profile-card hero centred; a call-to-action line; a QR card; the product lockup and Powered by LUKSO at the bottom. Light and dark variants. |
| Deck title slide (16:9) | Dark canvas from the generated title background (`../assets/generated/backgrounds/title-dark.png`) or the light one; white or ink headline in `type.deck.h1`; one accent phrase in `accent.brand`; a tiny tracked label top left in `type.deck.caption`; page numbers bottom right. |
| Deck section and closing slides (16:9) | One of the six slides-v2 background families (`../assets/generated/backgrounds/slides-v2/`, each showing one or more official UP! boxes under decision 0012), the same family through a section, light or dark with the theme; copy inside the family's measured safe zone (`../assets/generated/backgrounds/README.md`), never over a box; iridescent horizon for dividers and closings. The depicted boxes are scenery, not the lockup: a slide that needs the mark uses the official files, and nothing is cropped out of a background to stand in for it. |
| Deck product slide (16:9) | Up to three transparent app screens from `../assets/screenshots/mobile-app/` at 299 by 634 on the right half of the title background, the middle one raised, copy on the left half; the worked examples are `../assets/slides/previews/app-showcase-light.png` and the dark file. Exploratory screens are labelled as such. The shipped onboarding art (`../assets/slides/onboarding/`) shows the onboarding as it ships. |
| Deck content slide | Headline in `type.deck.h2`, a numbered list with hairline dividers, a product screenshot or the hero image on the right; names and addresses in PT Mono even here. |
| Social post (2:1 and 1:1) | Canvas `surface.canvas` (the board templates use `#F7F9FB`, one unit away); a real profile card or grid capture from the current product, or a generated share card; the periwinkle cube ornament; the lockup bottom centre; headline in `type.deck.h3` with minus 2 percent tracking, sub-line in `type.deck.body`. |
| Link preview (1200 by 630) | The generated share card (`signatureSvg()`) or the light hero with the headline on the left 42 percent. |
| Store listing frames | The aura background from the address-signature package, a 1 px inner border in `border.glass-reflex`, headline space in the top 18 percent, the device frame centred with a 6 percent margin, captions in `type.deck.h3`. Screenshots are real product screens, never illustrations. |
| Responsive marketing page | Hero with the hero image on the right (light or dark by theme), headline left in `type.display.xl` scaling to `type.display.m` below `breakpoint.md`, an accent button and a ghost button, then alternating feature sections with soft-object illustrations, then a profile-card wall built from real profiles; the four pillars as a row of soft cards. Twelve columns above `breakpoint.lg`, one column below `breakpoint.sm`. |

Safe zones and framing per format are in `../imagery/framing-and-safe-zones.md`.

## Rules

- The card is the hero. Render cards from the current product or the generator, never from old captures; product screens come from the owner-authorized exports in `../assets/screenshots/mobile-app/` or from the current product.
- Backgrounds are either address-derived (linear or aura) or the original soft-object, title and slides-v2 images with recorded provenance. No neon, no dreamscapes, no stock people. The UP! boxes inside the slides-v2 images stay inside those images.
- One accent phrase per surface; body text stays neutral.
- The lockup uses official files only; the partner lockup is not used until OPEN-11 closes.
- Counts, prices and dated claims never appear.

## Accessibility

Headline contrast follows the theme tokens (ink on the light canvas, white on the dark title background). Text never sits over the busiest part of the hero image; keep it in the quiet left area. Social images carry their headline as alt text. Minimum text size on social images is 28 px at 1080 width.

## Status

Poster and deck structures observed in the 2025 posters and the 2026 stage deck; social geometry observed on the brand board and proposed for adoption (OPEN-14); deck scale proposed (OPEN-13); store frames and responsive pages proposed.

## Evidence

SRC-POSTER-2025, SRC-NFTNYC-2026, SRC-FIGMA-UP-BOARD social templates (1131:22735, 1131:27438), SRC-GENERATED-IMAGES (IB-10 and IB-12 backgrounds; the IB-12 files branded under decision 0012), SRC-FIGMA-MOBILE-UPDATES (exported screens, decision 0011).
