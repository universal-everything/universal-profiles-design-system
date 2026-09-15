# Slides: onboarding art and previews

Status: observed for the onboarding illustrations (shipped product art, unchanged); proposed for the previews (compositions of repository files)

Two directories for deck work: `onboarding/` holds the four illustrations the shipped app uses in its get-started carousel, copied byte for byte from the mobile bundle; `previews/` holds four compositions made only from files in this repository, for the README gallery and for choosing backgrounds.

## Onboarding art

| Slide | File | Size | Alt text |
|---|---|---|---|
| 1 | ![First get-started illustration of the shipped app](onboarding/get-started-1.png) | 1080 by 838 | First get-started illustration of the shipped app |
| 2 | ![Second get-started illustration of the shipped app](onboarding/get-started-2.png) | 1000 by 996 | Second get-started illustration of the shipped app |
| 3 | ![Third get-started illustration of the shipped app](onboarding/get-started-3.png) | 1000 by 1000 | Third get-started illustration of the shipped app |
| 4 | ![Fourth get-started illustration of the shipped app](onboarding/get-started-4.png) | 1000 by 1000 | Fourth get-started illustration of the shipped app |

- **What they are:** the files `assets/image/get-started-1.png` to `get-started-4.png` of the mobile application at the audited commit `8d8f9f8c` (version 1.29.0, `SRC-MOBILE-APP`), verified by hash; 8-bit RGBA with transparent backgrounds and the margins the bundle ships. Nothing here was generated, edited, scaled or re-encoded.
- **Status:** observed shipped product art. It shows the app as it is; it is not new work of this repository and not the source for new illustration. The soft-object family is regenerated under recorded provenance from `../../imagery/briefs.md`; IB-04 proposes the refreshed set that replaces these slides, and the gap register notes the shipped set's magenta bleed and rocket metaphor.
- **Rights:** third-party project assets. The mobile repository carries the Apache License 2.0 with the notice "Copyright 2023 LUKSO Blockchain GmbH"; the illustration files carry no separate notice and their illustrator or generator is not recorded there. They are republished at the product owner's request (`../../decisions/0011-owner-authorized-product-visuals.md`); this repository adds no licence of its own and OPEN-04 stays open for the rights statement. See `../../LICENSES/THIRD-PARTY.md`.
- **Use:** decks and documentation about the shipped onboarding (`../../patterns/onboarding.md`), store-style frames of the shipped app. Place them over `surface.canvas` or a light background from `../generated/backgrounds/`; keep the transparent background; do not recolour, crop the objects or combine them into a mark.

## Previews

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="previews/app-showcase-dark.png">
  <img alt="Three app screens, home, in-app browser and deployment success, over the title background, with the left half empty for copy" src="previews/app-showcase-light.png" width="100%">
</picture>

| File | Size | What it shows | Inputs |
|---|---|---|---|
| `previews/app-showcase-light.png` | 1920 by 1080 | Three app screens on the right half of the light title background, the in-app browser raised; the left half free for ink copy | `../generated/backgrounds/title-light.png`; `../screenshots/mobile-app/app-home.png`, `in-app-browser.png`, `deployment-success.png` at 299 by 634 |
| `previews/app-showcase-dark.png` | 1920 by 1080 | The same over the dark title background, for white copy | the dark title file and the same screens |
| `previews/backgrounds-light-overview.png` | 1296 by 1158 | Contact sheet of the six light slide backgrounds | the six `slides-v2/*-light.png` files at 600 by 338, two columns by three rows, 24 pixel margins, 48 pixel gutters, on the dark canvas |
| `previews/backgrounds-dark-overview.png` | 1296 by 1158 | Contact sheet of the six dark slide backgrounds | the six `slides-v2/*-dark.png` files, same grid |

The order in the sheets is alphabetical: address ribbons, glass profile stack, identity network, identity orbits, iridescent horizon, modular constellation.

- **How they are checked:** `previews/PROVENANCE.json` records every input and its placement (x, y, width, height), and `node scripts/validate.mjs --only rasters` scales each input to its placement and measures the difference against the preview (tolerance 6 of 255), and compares the corners of the showcases with the scaled title background. A preview that stops matching its inputs fails the gate.
- **Status:** proposed; derived material that inherits the licences of its inputs. The two background overview sheets contain generated-background pixels only and follow `../../LICENSES/GENERATED-IMAGES.md`. The two app-showcase previews are mixed works: generated-background pixels follow those terms, while embedded app-screen pixels retain the owner-rights, documentation-and-presentation-use-only terms in `../screenshots/mobile-app/PROVENANCE.json`; the combined app-showcase files are not wholly covered by this repository's Apache-2.0 grant. Use the previews to pick files or as worked examples of the composition rules; they are not delivery masters.
- **Regenerating:** compose from the inputs again (any raster tool; the recipe is the placement table), keep the canvas `#121B21` for the sheets, and update the hash in the record. When a new background family is added, extend the sheet by one row and record the two new placements.

## Composition recipe (showcase)

1. Scale the title background to 1920 by 1080.
2. Place three screens at 299 by 634: x 980, 1290 and 1600; y 219 for the outer two and 179 for the middle one (raised 40 pixels).
3. Add a soft shadow under the screens on the light register.
4. Copy goes in the left half: headline in `type.deck.h1`, one accent phrase in `accent.brand`, body in `type.deck.body`.
