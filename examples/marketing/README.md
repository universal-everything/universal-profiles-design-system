# Marketing examples

How to produce the recurring marketing assets from the generators and the recorded imagery, without design tools.

## Link preview (1200 by 630)

```sh
node -e 'import("./packages/address-signature/src/index.mjs").then(m => process.stdout.write(m.signatureSvg("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", { name: "sample-one", width: 1200 })))' > preview.svg
```

Rasterise the SVG at 1x for the preview image and at 2x for social. Dark variant: add `theme: "dark"`. Example outputs: `../../assets/backgrounds/address-gradient/examples/*-share-card-1200-*.svg`.

## Aura background (any size)

```sh
node -e 'import("./packages/address-signature/src/index.mjs").then(m => process.stdout.write(m.auraSvg("0x…", { width: 1080, height: 1920, theme: "light" })))' > story-background.svg
```

Place the headline in the left 40 percent, the lockup bottom centre, and keep the darker blob away from the lockup. Safe zones per format: `../../imagery/framing-and-safe-zones.md`.

## Title slide

Use `../../assets/generated/backgrounds/title-dark.png` (or the light variant) as the slide background; headline in the deck h1 role (Inter Bold 60 with minus 5 percent tracking) in white, one accent phrase in `#8498F0` (`color.up.73`, the dark brand step); tracked label top left in the deck caption role; page number bottom right. Keep text in the left 55 percent.

## Section and closing slides

Pick a family from `../../assets/generated/backgrounds/slides-v2/` (six families, each `-light.png` and `-dark.png`, each a layered identity collage showing one or more official UP! container cubes) and keep copy inside the family's measured safe zone from `../../assets/generated/backgrounds/README.md`; for example identity network keeps the left 30 percent free, glass profile stack the right 34 percent, iridescent horizon the upper-left half by 42 percent, and modular constellation a centre column. The zones are tighter than a half slide because the scenes are dense; the same rectangle holds in both registers. Use one family per section and the same register throughout a deck; light files take ink copy, dark files white copy. Use the files whole: the cubes are part of the scene and may not be cropped out to serve as the mark (`../../decisions/0012-branded-slide-backgrounds.md`, `../../decisions/0013-container-cube-slide-backgrounds.md`). Contact sheets for choosing: `../../assets/slides/previews/backgrounds-light-overview.png` and the dark sheet.

## Body-copy and chart slides

Use `../../assets/generated/backgrounds/slides-v3-ambient/` when the content must lead. Quiet corner and mist orbit right leave the left 68 or 64 percent calm; their left companions leave the right side calm; distant horizon leaves the upper 72 percent; peripheral frame leaves a central 60 by 76 percent rectangle. Put headings, body copy, charts and transparent product screens inside the exact measured rectangle in the backgrounds README. These files meet the stricter ambient measurements (light at least 220, dark at most 36, deviation at most 12) and contain at most two cubes, with twenty across the twelve-file set. They are additive proposed infrastructure, not hero art and not a replacement for slides-v2. Contact sheets: `../../assets/slides/previews/ambient-backgrounds-light-overview.png` and the dark sheet.

## Product slide

Compose transparent screens over an ambient family whose quiet rectangle fits the layout; keep every screen and line of copy clear of the edge objects and cubes. For the existing worked example, scale three screens to 299 by 634 over the title background at x 980, 1290 and 1600, with the middle one raised 40 pixels; `../../assets/slides/previews/app-showcase-light.png` and the dark file preserve that recipe. Label the paywall and deployment screens as an exploration. The shipped onboarding illustrations show onboarding as it ships and go over `surface.canvas` or a light background.

## Website or README hero

`../../assets/generated/heroes/profile-passport-light.png` with copy in the left 42 percent; swap to the dark file under a dark theme with a `<picture>` element. The README shows the pattern.

## Store frames

Aura background in light and dark, a 1 px inner border in the glass reflex colour, headline space in the top 18 percent, the device frame centred with a 6 percent margin, captions in the deck h3 role. Screenshots must be real interface.

## Rules

- Never rebuild the marks; obtain official files (see `../../assets/logos/README.md`).
- Record provenance for every new raster in the directory's `PROVENANCE.json` (`node scripts/inspect-png.mjs <file>` prints the hash, size, alpha facts and safe-zone luminance) and run `--only assets`, `--only rasters`, `--only branded` and `--only ambient`; the two background locks stay separate.
- Decisions 0012/0013 cover exactly the twelve expressive scenes and their two overview sheets; decision 0014 covers exactly the twelve ambient scenes and their two overview sheets. Neither authorizes extracting the UP! mark, and a further branded background needs a new recorded authorization.
- No counts, prices, "closed beta", neon, generic AI dreamscapes (the iridescent-horizon slides-v2 family is the one admitted landscape, decision 0013) or stock people.
