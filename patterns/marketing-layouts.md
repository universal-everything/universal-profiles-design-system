# Marketing layouts

Status: observed for the poster and stage-deck structures; proposed for the social template, store frames and responsive marketing pages (OPEN-13, OPEN-14)

## Purpose

Make marketing surfaces recognisably Universal Profiles with the same signature as the product: the profile card as hero, address-born backgrounds, one accent phrase, and the lockup with Powered by LUKSO.

## Flow

| Surface | Structure |
|---|---|
| Poster (3:4) | Headline in two lines with the second line in the accent; the frosted-glass profile-card hero centred; a call-to-action line; a QR card; the product lockup and Powered by LUKSO at the bottom. Light and dark variants. |
| Deck title slide (16:9) | Dark canvas from the generated title background (`../assets/generated/backgrounds/title-dark.png`) or the light one; white or ink headline in `type.deck.h1`; one accent phrase in `accent.brand`; a tiny tracked label top left in `type.deck.caption`; page numbers bottom right. |
| Deck content slide | Headline in `type.deck.h2`, a numbered list with hairline dividers, a product screenshot or the hero image on the right; names and addresses in PT Mono even here. |
| Social post (2:1 and 1:1) | Canvas `surface.canvas` (the board templates use `#F7F9FB`, one unit away); a real profile card or grid capture from the current product, or a generated share card; the periwinkle cube ornament; the lockup bottom centre; headline in `type.deck.h3` with minus 2 percent tracking, sub-line in `type.deck.body`. |
| Link preview (1200 by 630) | The generated share card (`signatureSvg()`) or the light hero with the headline on the left 42 percent. |
| Store listing frames | The aura background from the address-signature package, a 1 px inner border in `border.glass-reflex`, headline space in the top 18 percent, the device frame centred with a 6 percent margin, captions in `type.deck.h3`. Screenshots are real product screens, never illustrations. |
| Responsive marketing page | Hero with the hero image on the right (light or dark by theme), headline left in `type.display.xl` scaling to `type.display.m` below `breakpoint.md`, an accent button and a ghost button, then alternating feature sections with soft-object illustrations, then a profile-card wall built from real profiles; the four pillars as a row of soft cards. Twelve columns above `breakpoint.lg`, one column below `breakpoint.sm`. |

Safe zones and framing per format are in `../imagery/framing-and-safe-zones.md`.

## Rules

- The card is the hero. Render cards from the current product or the generator, never from old captures.
- Backgrounds are either address-derived (linear or aura) or the original soft-object and title images with recorded provenance. No neon, no dreamscapes, no stock people.
- One accent phrase per surface; body text stays neutral.
- The lockup uses official files only; the partner lockup is not used until OPEN-11 closes.
- Counts, prices and dated claims never appear.

## Accessibility

Headline contrast follows the theme tokens (ink on the light canvas, white on the dark title background). Text never sits over the busiest part of the hero image; keep it in the quiet left area. Social images carry their headline as alt text. Minimum text size on social images is 28 px at 1080 width.

## Status

Poster and deck structures observed in the 2025 posters and the 2026 stage deck; social geometry observed on the brand board and proposed for adoption (OPEN-14); deck scale proposed (OPEN-13); store frames and responsive pages proposed.

## Evidence

SRC-POSTER-2025, SRC-NFTNYC-2026, SRC-FIGMA-UP-BOARD social templates (1131:22735, 1131:27438), SRC-GENERATED-IMAGES.
