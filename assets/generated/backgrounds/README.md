# Slide and background library

Status: proposed (generated for this system under recorded provenance; not approved brand imagery; the slide contract below is a system rule checked by the validator)

Fourteen 16:9 backgrounds for decks, social titles and documentation: the quiet title pair (IB-10) in this directory and the six-family `slides-v2` set (IB-12) in `slides-v2/`, each family in a light and a dark register. The two heroes in `../heroes/` follow the same contract and can open a deck. Verbatim prompts, hashes, dimensions, colour facts, content credentials and the measured text-safe zone of every file are in `../PROVENANCE.json`; the staged prompt file `slides-v2/PROMPTS.source.json` is kept byte-identical to those entries by the validator.

## Gallery

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../../slides/previews/backgrounds-dark-overview.png">
  <img alt="Contact sheet of the six slide backgrounds: address ribbons, glass profile stack, identity network, identity orbits, iridescent horizon and modular constellation" src="../../slides/previews/backgrounds-light-overview.png" width="100%">
</picture>

Contact sheets: [light](../../slides/previews/backgrounds-light-overview.png), [dark](../../slides/previews/backgrounds-dark-overview.png), in alphabetical order, two columns by three rows.

| Family | Light | Dark |
|---|---|---|
| Title (IB-10) | ![Light title background: a near-white canvas with one soft periwinkle bloom in the upper right](title-light.png) | ![Dark title background: a near-black canvas with one soft periwinkle bloom in the upper right](title-dark.png) |
| Address ribbons | ![Light background of translucent ribbons sweeping from the lower left to the upper right](slides-v2/address-ribbons-light.png) | ![Dark background of translucent ribbons sweeping from the lower left to the upper right](slides-v2/address-ribbons-dark.png) |
| Glass profile stack | ![Light background of layered translucent blank card planes on the left third](slides-v2/glass-profile-stack-light.png) | ![Dark background of layered smoked-glass blank card planes on the left third](slides-v2/glass-profile-stack-dark.png) |
| Identity network | ![Light background of sparse glowing nodes and orbital paths near the corners](slides-v2/identity-network-light.png) | ![Dark background of sparse glowing nodes and orbital paths near the corners](slides-v2/identity-network-dark.png) |
| Identity orbits | ![Light background of concentric orbits and a portal ring on the right third](slides-v2/identity-orbits-light.png) | ![Dark background of concentric orbits and a portal ring on the right third](slides-v2/identity-orbits-dark.png) |
| Iridescent horizon | ![Light background of iridescent mist and low wave forms across the bottom quarter](slides-v2/iridescent-horizon-light.png) | ![Dark background of iridescent mist and low wave forms across the bottom quarter](slides-v2/iridescent-horizon-dark.png) |
| Modular constellation | ![Light background of blank rounded cubes, spheres and tiles gathered at the lower right](slides-v2/modular-constellation-light.png) | ![Dark background of blank rounded cubes, spheres and tiles gathered at the lower right](slides-v2/modular-constellation-dark.png) |

## Files and safe zones

Safe zones are fractions of the width and height, measured on the files (mean luminance and its standard deviation inside the zone) and recorded per file in the provenance record; the prompt's intent is given for comparison. Put titles and body copy inside the zone; anything outside it needs the glass tier or a solid tint behind text.

| Family | File pair | Subject sits | Text-safe zone (x, y, width, height) | Prompt intent | Measured light | Measured dark |
|---|---|---|---|---|---|---|
| Title | `title-light.png`, `title-dark.png` | Bloom upper right | 0, 0, 0.55, 1 (left 55 percent) | left 55 percent quiet | 250, deviation 3 | 9, deviation 4 |
| Identity orbits | `slides-v2/identity-orbits-*.png` | Right third | 0, 0, 0.5, 1 (left half) | left 52 percent quiet | 251, deviation 3 | 9, deviation 5 |
| Glass profile stack | `slides-v2/glass-profile-stack-*.png` | Left third | 0.5, 0, 0.5, 1 (right half) | right 50 percent clean | 241, deviation 6 | 23, deviation 7 |
| Address ribbons | `slides-v2/address-ribbons-*.png` | Lower left and upper right | 0.15, 0.15, 0.5, 0.35 (centre-left band) | calm central zone | 246, deviation 7 | 18, deviation 9 |
| Modular constellation | `slides-v2/modular-constellation-*.png` | Lower right | 0, 0, 0.58, 0.5 (upper left) | upper-left 58 percent quiet | 250, deviation 1 | 23, deviation 6 |
| Identity network | `slides-v2/identity-network-*.png` | Corners | 0.3, 0, 0.4, 0.75 (centre column) | centre and upper centre calm | 244, deviation 9 | 21, deviation 8 |
| Iridescent horizon | `slides-v2/iridescent-horizon-*.png` | Bottom quarter, glow upper right | 0, 0, 0.6, 0.5 (upper left) | upper 65 percent calm | 247, deviation 6 | 12, deviation 7 |

Luminance is 0 to 255. Every file is 1672 by 941 (two dark files, identity network and identity orbits, are 1671 by 941), 8-bit RGB without an alpha channel, the generator's native output; 1920 by 1080 masters have not been produced.

## Light and dark

- **Light register** for ink copy: `text.default` (the light ink) on a safe zone that measures at least 200; headline `type.deck.h1`, body `type.deck.body`, one accent phrase in `accent.brand`.
- **Dark register** for white copy: `text.default` of the dark theme (the canvas white) on a safe zone that measures at most 64; the accent phrase uses the dark brand step (`color.up.73`, which `accent.brand` resolves to in the dark theme).
- Pair by family: a deck uses one family per section and switches register with the theme, the way the README hero switches with `prefers-color-scheme`.
- Do not tint a light file to make it dark or the reverse; the pair exists for that.
- Secondary text never sits on the busy area: outside the safe zone use the glass panel (`glass-panel` in the components tier) or a solid `surface.card` tint behind the text, per the luminance rule in `../../../foundations/elevation-and-glass.md`.

## Crop and composition

- **Native 16:9** covers a 1920 by 1080 slide with a 15 percent upscale; use "scale to fill", never stretch. For 3840 by 2160 output, regenerate rather than upscale.
- **4:3 (1254 by 941)** and **1:1 (941 by 941)**: keep the side the subject sits on when the image is the point (identity orbits: right; glass profile stack: left; modular constellation: right; iridescent horizon: full width, anchored to the bottom; address ribbons and identity network: centre) and the opposite side when the copy is the point.
- **9:16 stories (529 by 941)**: identity network and iridescent horizon crop best (centre and bottom-anchored); the others lose their subject, so use the aura background from `packages/address-signature` instead.
- **Link previews (1200 by 630)**: the title pair or the heroes; the slides-v2 families are too detailed at that size.
- Keep 6 percent margins; page numbers bottom right; the tracked label top left in `type.deck.caption`; the lockup, when used, from official files only and never over the subject.
- The showcases in `../../slides/previews/` are worked compositions: three app screens at 299 by 634 on the right half of the title background, the left half free for copy.

## Usage

Deck software: set the file as the slide background (Keynote: Format, Background, Image Fill, Scale to Fill; PowerPoint: Format Background, Picture fill; Google Slides: Background, Choose image), then place text in the safe zone.

Web or documentation:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/generated/backgrounds/slides-v2/identity-orbits-dark.png">
  <img alt="" src="assets/generated/backgrounds/slides-v2/identity-orbits-light.png" width="100%">
</picture>
```

```css
.deck-title {
  background: var(--up-surface-canvas) url("assets/generated/backgrounds/slides-v2/identity-orbits-light.png") center / cover no-repeat;
  color: var(--up-text-default);
  padding: 6%;
  max-width: 50%; /* the identity-orbits safe zone */
}
@media (prefers-color-scheme: dark) {
  .deck-title { background-image: url("assets/generated/backgrounds/slides-v2/identity-orbits-dark.png"); }
}
```

Alt text: describe the picture when it carries meaning (the gallery table above has one line per file); an empty `alt` when it is decoration behind copy.

## Authority and status

| Item | Status | Meaning |
|---|---|---|
| The fourteen files | proposed | Original generated imagery for this system; not in production and not approved brand imagery |
| Safe zones | proposed, measured | Declared per file from the prompt and confirmed by measurement; the validator re-measures them |
| The slide contract | proposed | A system rule: 16:9 within 1 percent, at least 1600 by 900, 8-bit RGB, no alpha, intact content credentials, a light and a dark file per family, safe-zone luminance at least 200 (light) or at most 64 (dark) with a deviation of at most 20 |
| Prompts | observed | Verbatim in `slides-v2/PROMPTS.source.json` and the provenance record |
| Two prompts ask for "tiny controlled magenta and cyan accents" (modular constellation) | open for the brand owner | Magenta is reserved for the LUKSO network and LYX roles (decision 0005); the files stay proposed until the brand owner accepts or asks for a regeneration without the accent |

Every file carries a C2PA content-credentials manifest signed by OpenAI (software agent `gpt-image 2.0`); the manifest and the invisible watermark stay intact, and tools that read content credentials will identify the images as AI-generated. Licence: `../../../LICENSES/GENERATED-IMAGES.md`.

## Publication boundary

These files are public and may be reused under the repository licence. They are backgrounds, not marks: do not edit them into a logo, do not place them behind a mark reconstruction, do not present them as product screenshots. New members must be generated (never traced from private board renders), carry a provenance entry with the prompt and hash, and pass the contract; see `../../../imagery/briefs.md` (IB-12).

## Adding variations

1. Reuse a family prompt from `slides-v2/PROMPTS.source.json` (change only the primary request and the composition line) or write a new family inside the IB-12 frame; generate the light file, then the dark companion from the same description.
2. Keep the native output; do not upscale, crop or strip the manifest.
3. Name the pair `<family>-light.png` and `<family>-dark.png`, put them in `slides-v2/` (or a new set directory) and add the prompts to `PROMPTS.source.json` there.
4. Run `node scripts/inspect-png.mjs slides-v2/<family>-light.png --zone 0,0,0.5,1` to get the hash, dimensions, content-credentials timestamp and the luminance of the intended safe zone; adjust the zone until it measures light or dark enough and quiet, then add both entries to `../PROVENANCE.json` (`set`, `family`, `register`, `status: "proposed"`, `safeZone`, `prompt`, `brief`) and raise the set's `count` and `families`.
5. Update the contact sheets in `../../slides/previews/` (or add a new sheet) and record the placements; `node scripts/validate.mjs --only rasters` must pass, then `npm test`.
