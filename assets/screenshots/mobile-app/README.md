# Mobile app screens

Status: observed (design-file exports, unchanged); the paywall and deployment screens are exploratory, not production authority

Five transparent PNG exports of app screens from the Mobile app Updates design file (`SRC-FIGMA-MOBILE-UPDATES`, file key `gKNmK9MxvHWhewBvYe99Vo`), published at the product owner's explicit request of 2026-09-15 (`../../../decisions/0011-owner-authorized-product-visuals.md`). They are the only design-file exports the repository admits; the boundary in `../../../provenance/README.md` still excludes every other render, export or screenshot.

## Gallery

| Screen | Node | Status | File |
|---|---|---|---|
| App home | 841:17486 | observed, current design-file screen | ![App home screen of the Universal Profiles app as drawn in the design file](app-home.png) |
| In-app browser | 841:17668 | observed, current design-file screen | ![In-app browser screen as drawn in the design file](in-app-browser.png) |
| Paywall | 672:24756 | observed, exploratory | ![Paywall step of the in-app-purchase exploration](gas-paywall.png) |
| Deployment, preparing | 672:29382 | observed, exploratory | ![Preparing step of the deployment sequence in the exploration](deployment-preparing.png) |
| Deployment, success | 672:30132 | observed, exploratory | ![Success step of the deployment sequence in the exploration](deployment-success.png) |

The screens render at their native 391 by 828 above (GitHub scales them to the column); use them at 1x or scale down.

## Facts the validator proves

Every file is 391 by 828, 8-bit RGBA with a real alpha channel: the exterior of the rounded device shape is fully transparent (all four corners and about a tenth of the edge pixels), there are no semi-transparent pixels, and no transparent row or column at any edge, so the crop is tight. The hashes, the `Software=Figma` export marker and the export and re-encoding timestamps are recorded in `PROVENANCE.json`; `node scripts/validate.mjs --only rasters` re-measures the alpha facts and `--only assets` the hashes at every run.

## Authority

- **App home** and **in-app browser** are current design-file screens: observed and unchanged. The rules for the shipped surfaces are in `../../../components/profile-card.md`, `../../../components/navigation.md` and `../../../patterns/dapp-and-browser-surfaces.md`; shipped code wins where a screen and a rule disagree.
- **Paywall, preparing and success** belong to one in-app-purchase exploration in the same file (the source register notes it predates the September 2026 redesign). They are observed as drawn, not production behaviour: the shipped deployment is gasless through the relayer (`../../../patterns/onboarding.md`). Label them as an exploration whenever they are shown.
- Names, figures, balances or addresses drawn in the screens are whatever the design file carries at those nodes; never quote them as product data (the voice rules forbid counts and prices anyway).

## Usage

- Compose over a background from `../../generated/backgrounds/`; the showcases in `../../slides/previews/` place three screens at 299 by 634 on the right half of the title background with the left half free for copy, and the provenance record there lists the exact placements.
- Keep the transparent exterior: place the PNG directly, no white box behind it, no added device bezel; the rounded shape of the export is the frame.
- Add a soft shadow if the background is light and busy; on the dark title background the screens need none.
- Store-style frames follow IB-09 in `../../../imagery/briefs.md`: real interface only, headline space in the top 18 percent, the device centred with a 6 percent margin.
- Alt text names the screen and, for the exploration, says so ("Paywall step of an in-app-purchase exploration").

Markdown:

```markdown
![App home screen of the Universal Profiles app](assets/screenshots/mobile-app/app-home.png)
```

HTML at half size beside copy:

```html
<img src="assets/screenshots/mobile-app/app-home.png" width="196" height="414" alt="App home screen of the Universal Profiles app">
```

## Publication boundary

The files are published for documentation and presentation of the app. Rights stay with the product owner; they are outside this repository's Apache-2.0 grant, and marks that appear in them stay all rights reserved (`../../../TRADEMARKS.md`). Do not crop a mark out of a screen for reuse, do not edit the interface, do not present the exploration as shipped, and do not add further exports without an owner authorization recorded in `../../../decisions/`. Cite the file by key and node id only; never a design-file URL, a temporary asset URL or account details.
