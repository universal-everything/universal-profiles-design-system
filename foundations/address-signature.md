# The Address Signature

Status: observed for the algorithm, the suffix, the badge and the gradient; normalized for the truncation presets and the seed rule; proposed for the aura backgrounds and the share-card generator

The Address Signature is the one signature element of the system: the triad of the **identicon badge**, the **`#XXXX` suffix** and the **address gradient**, always carried by the profile card whose avatar breaks the cover's edge. It is the subject itself made visible: a Universal Profile is an account, not an address, yet the address is the one thing every profile keeps forever, so colour and mark derive from it. The same profile therefore looks the same in the app, on the web, on a poster, on a QR card and in a social image.

## The three parts

| Part | Rule | Source of truth |
|---|---|---|
| Identicon badge | An 8 by 8 mirrored identicon generated from the lower-cased address, shown at the avatar's lower right with a ring in `avatar.badge-ring`. Mandatory on every avatar of `identicon.min-badge-size` (24) or larger. For externally owned accounts the identicon *is* the avatar and carries no badge. | `identiconData()` and `identiconSvg()` in `packages/address-signature` reproduce the products' identicon library exactly |
| `#XXXX` suffix | A hash sign followed by characters 2 to 6 of the EIP-55 checksummed address, set in the same PT Mono role as the name and in `text.muted`. Never dropped, never truncated, never recoloured for emphasis. | `nameSuffix()` |
| Address gradient | A 90 degree linear gradient from bytes 1 to 3 to bytes 18 to 20 of the address, both at 50 percent alpha, over `surface.cover-fallback`. The default cover wherever a profile has no cover image and the default abstract background for marketing. | `gradientStops()`, `gradientCss()`, `gradientReactNative()` |

## Names

- Named profiles render as `@name#XXXX`. The `@` is a product convention that survives translation.
- Anonymous profiles render as `anonymous-profile#XXXX` with no `@`; the label is translatable. The package trims names, so a whitespace-only name is anonymous; the shipped mobile component does not trim (a normalization, see `../adoption/gap-register.md`).
- The suffix takes `text.muted` and the name's size. Names may be truncated with an ellipsis; the suffix never is.
- Never show a bare hex address as the primary identifier when a name, `@name#XXXX` or an identicon can be shown instead.

## Addresses

- Truncated addresses are checksummed and use three ASCII dots: compact `0x` plus 6 characters, dots, 4 characters in rows and externally-owned-account labels; full `0x` plus 10, dots, 8 in detail views. Two observed variants are recorded and should migrate to the two presets: the web default of 6 and 6, and the mobile externally-owned-account row, which shows `0x` plus 4 characters, dots, 4 characters followed by the `#EOA` label (R-36 in `../provenance/reconciliation.md`). `sliceAddress()` implements the presets.
- Copy actions copy the full checksummed address and confirm with a toast.
- Addresses are always PT Mono, including in marketing.

## Gradient details

Production reads the address string as given and takes characters 2 to 8 and 36 to 42, so casing does not affect the colour. Invalid or missing addresses fall back to `gradient.address-fallback-start` and `gradient.address-fallback-end` (ink at 6 and 12 percent) in light mode; the dark theme uses the canvas white at the same alphas. Alpha stays 0x80 in product; marketing may raise it (the aura recipe uses 30 percent blobs on light and 45 percent on dark).

## Extensions for marketing (proposed)

- **Aura** (`auraRecipe()`, `auraSvg()`): the two stops as soft radial blobs at (22 percent, 30 percent) and (78 percent, 72 percent), radius 55 percent of the short edge, blurred by 12 percent, with 4 percent monochrome grain; light canvas `surface.canvas`, dark canvas neutral 10.
- **Share card** (`signatureSvg()`): a complete self-contained card with the gradient cover, the avatar ring, the identicon badge, the name with suffix and the truncated address, in light or dark.
- Example outputs for public test-vector addresses live in `../assets/backgrounds/address-gradient/`; the recipe file there lets any renderer reproduce them without rasters.

## Rules for every surface

1. The profile card is the hero; when no profile is present, use the campaign's or event's own profile signature.
2. Never omit the badge at 24 px or larger. Never crop the avatar ring.
3. Never hand-pick a profile colour, tint the identicon, or replace it with an illustration.
4. Keep the avatar ring in the surface colour (`avatar.ring`) so the edge-breaking moment reads on any cover.
5. Web and mobile must consume the same helpers; local copies drift.

## Evidence

SRC-MOBILE-APP address gradient helper, username formatter (checksummed slice 2 to 6, anonymous label), username component (rows 6 and 4, detail views 10 and 8, the externally-owned-account row 4 and 4 with the `#EOA` label), identicon component and its library; SRC-WEB-COMPONENTS gradient and slicing helpers, profile and username components; SRC-WEB-APP profile card composition. The identicon reimplementation was verified against the library output for seven addresses (see `../packages/address-signature/test/fixtures.json`). Marketing extensions are proposals of this system.
