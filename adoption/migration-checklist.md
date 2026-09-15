# Migration and adoption checklist

Status: proposed

Track adoption per product. A line is done when the code reads the token or helper and the old value is deleted.

## Both products

- [ ] Consume `packages/address-signature` for the gradient, suffix, display name, truncation and identicon seed; delete local copies.
- [ ] Identicon size table from the tokens (`identicon.*`); align the small badge to 16 (OPEN-06).
- [ ] Names always `@name#XXXX` with the suffix in `text.muted`; anonymous profiles `anonymous-profile#XXXX`.
- [ ] Network tags: dot plus ink text; testnet written.
- [ ] Status colours from `status.*` text and fill steps.
- [ ] Links in `text.link`; product primary buttons stay ink.
- [ ] Dark theme wired to a user or system setting.
- [ ] Accessibility gates from `accessibility/checklist.md`.

## Web

- [ ] `variables.css` included; overlay preset composed after the base preset.
- [ ] Base-layer components styled with the custom properties; focus ring rule added.
- [ ] Profile card per the specification; link-preview images from `signatureSvg()`.
- [ ] Secondary text moved from neutral 60 to `text.muted`.
- [ ] Glass decision recorded (OPEN-08).

## React Native

- [ ] Theme module added; palette aliased; typography aliases applied; `maxFontSizeMultiplier` per role.
- [ ] Glass constants read from `glass`; bar tint 0.80; inactive items by colour.
- [ ] Toggle on-state from the palette; danger button colours from `status.error.text`.
- [ ] Older profile-image component removed; duplicate title variant removed; LUKSO mark component renamed; raster-in-SVG removed; hard-coded hexes removed.
- [ ] Tab labels localised; icon-only controls labelled; reduce-motion handled.
- [ ] Dark glass values measured on a device (OPEN-07).

## Marketing

- [ ] Backgrounds from the address-signature generator or the recorded generated set; provenance recorded.
- [ ] Lockups from official files only; partner lockup withheld until OPEN-11.
- [ ] Deck scale and social geometry decisions recorded (OPEN-13, OPEN-14).

## Governance

- [ ] Every token change rebuilds `tokens/build` and passes `node scripts/validate.mjs`.
- [ ] Open items closed through `decisions/` records.
