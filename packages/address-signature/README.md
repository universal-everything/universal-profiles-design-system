# @universal-profiles/address-signature

Deterministic, dependency-free helpers for the **Address Signature**: the identicon badge, the `#XXXX` suffix and the address-derived gradient that every Universal Profile carries on every surface. One implementation for web, React Native, build scripts and marketing generators, so the same profile always produces the same colours, badge and suffix.

Status: the algorithms marked **observed** reproduce shipped product behaviour exactly; the ones marked **proposed** extend it for marketing use. Package name and npm scope are not yet published (see `provenance/open-items.md`, OPEN-09).

## Install

The package has no dependencies and ships as an ES module. Until it is published, consume it by path:

```js
import { gradientCss, nameSuffix, identiconSvg } from "../packages/address-signature/src/index.mjs";
```

## API

| Function | Status | What it does |
|---|---|---|
| `isAddress(value)` | observed | `/^0x[0-9a-fA-F]{40}$/` |
| `normalizeAddress(value)` | normalized | Trimmed, lower-case, `0x`-prefixed address or `null` |
| `toChecksumAddress(value)` | observed | EIP-55 mixed-case encoding (keccak-256 built in) |
| `isChecksumAddress(value)` | normalized | Valid and either unmixed or correctly checksummed |
| `gradientStops(address, {alpha, theme})` | observed | `#RRGGBBAA` stops from bytes 1-3 and 18-20 at 50 percent alpha; neutral fallback when invalid |
| `gradientCss(address, opts)` | observed | `linear-gradient(90deg, start, end)` exactly as production |
| `gradientReactNative(address, opts)` | observed | `{ colors, start: {x:0,y:.5}, end: {x:1,y:.5} }` |
| `gradientSvg(address, opts)` | proposed | Self-contained SVG rectangle with the gradient over the cover fallback |
| `auraRecipe(address, {theme})` | proposed | Resolution-independent recipe: two blurred blobs on the canvas plus grain |
| `auraSvg(address, opts)` | proposed | SVG rendering of the aura recipe |
| `nameSuffix(address)` | observed | `#` plus characters 2-6 of the checksummed address |
| `displayName(name, address)` | observed | `@name#XXXX`; `anonymous-profile#XXXX` without prefix when the name is empty |
| `displayNameParts(name, address)` | observed | The same, split into prefix, name and suffix for separate styling |
| `sliceAddress(address, {leading, trailing})` | normalized | Checksummed `0x` + leading hex, three dots, trailing hex; presets 6/4 and 10/8 |
| `identiconSeed(address)` | observed | Lower-case address, the seed both products pass to their identicon library |
| `identiconData(address)` | observed | Colours and 8x8 grid, identical to the products' identicon output |
| `identiconSvg(address, {scale, round})` | observed | Crisp SVG identicon |
| `signatureSvg(address, {name, theme, width})` | proposed | Complete share card: gradient cover, avatar ring, badge, name and suffix |
| `IDENTICON_SIZES`, `identiconSizeFor(size)` | observed | Shared avatar, badge and ring table (16 to 120 px) |

## Algorithm notes

- **Gradient.** Production reads the raw address string and takes characters 2 to 8 and 36 to 42, which are the first and the last three bytes. Both stops carry alpha `0x80`. Invalid or missing addresses fall back to `#24354210` and `#24354220` (neutral ink at 6 and 12 percent) on light surfaces; this package adds a dark-theme fallback on `#F8FAFB`.
- **Suffix.** Characters 2 to 6 of the EIP-55 checksummed address, so casing is significant and stable: `0x5aAeb605...` becomes `#5aAe`. The suffix is never dropped from a name and is rendered in the muted text colour.
- **Anonymous profiles.** The product renders `anonymous-profile#XXXX` with no `@` prefix. The label is a translatable string in the app; pass `anonymousLabel` to localize it.
- **Identicon.** The 8x8 mirrored grid, three HSL colours and the seeded generator reproduce the products' identicon library exactly; the fixtures in `test/fixtures.json` were verified cell by cell against that library's PNG output. Both products lower-case the seed, so the badge for a profile is identical everywhere.
- **Truncation.** Mobile uses 6/4 in rows and 10/8 in detail views with `...`, and its externally-owned-account row shows `0x` + 4/4 followed by the `#EOA` label (an observed variant, R-36 in `provenance/reconciliation.md`); the web default is 6/6. The design system standardizes on 6/4 and 10/8 (see `foundations/address-signature.md`); there is no 4/4 preset, so pass `{ leading: 4, trailing: 4 }` only to reproduce the shipped row. `leading` and `trailing` must be non-negative integers; a zero `trailing` renders no trailing characters.
- **Alpha.** `alpha` is a fraction from 0 to 1 (1 is opaque) or an integer from 2 to 255; the default is `0x80`. Anything else throws, so an alpha of 1 never silently means 1/255.
- **Names.** `displayNameParts` trims the name, so a whitespace-only name is anonymous. This is a normalization: the shipped mobile username component does not trim and renders the spaces as a name (see `adoption/gap-register.md`).
- **Option validation.** The CSS and SVG builders validate their options rather than escaping them: widths, heights, scale and angle must be finite numbers, `radius` at least zero, `id` an XML id without spaces or quotes, and `background` a hex, `rgb()`, `hsl()` or named colour. Invalid options throw a `RangeError` or `TypeError`; profile names are escaped as before.

## Tests

```sh
node --test "packages/**/*.test.mjs"
```

Covers valid, invalid and missing addresses; checksum casing; multi-block keccak absorb (verified through the SHA3 sibling against `node:crypto`); alpha handling; option validation for the CSS and SVG builders; deterministic output across casing and repeated calls; fixture parity for checksums, suffixes, gradient stops and identicons; whitespace-only names; XML escaping of names and titles.
