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

## Website or README hero

`../../assets/generated/heroes/profile-passport-light.png` with copy in the left 42 percent; swap to the dark file under a dark theme with a `<picture>` element. The README shows the pattern.

## Store frames

Aura background in light and dark, a 1 px inner border in the glass reflex colour, headline space in the top 18 percent, the device frame centred with a 6 percent margin, captions in the deck h3 role. Screenshots must be real interface.

## Rules

- Never rebuild the marks; obtain official files (see `../../assets/logos/README.md`).
- Record provenance for every new raster in the directory's `PROVENANCE.json` and run `node scripts/validate.mjs --only assets`.
- No counts, prices, "closed beta", neon, dreamscapes or stock people.
