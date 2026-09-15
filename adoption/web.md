# Adoption guide: web

Status: proposed (the guide reuses the LUKSO base-layer components and the shipped web patterns; it replaces nothing)

## What changes and what does not

Keep `@lukso/web-components`, its Tailwind preset and the existing page composition. Add the Universal Profiles layer on top: the CSS custom properties, the overlay preset, the Address Signature package and the specifications.

## Steps

1. **Include the tokens.** Import `tokens/build/css/variables.css` once, before component styles. Light values live on `:root`; dark values under `[data-theme="dark"]` and `.dark`; `[data-theme="auto"]` follows the system. The base layer's `.dark` class convention is honoured. Typography roles are `font` shorthands (`font: var(--up-type-body-m)`), which cannot carry tracking or case: for the tracked roles (`type.label.caps`, `type.label.nav`, `type.deck.h1`, `type.deck.h2`, `type.deck.h3`) add `letter-spacing: var(--up-type-<role>-letter-spacing)`, and for the uppercase roles (`type.label.caps`, `type.currency.code`, `type.deck.caption`) add `text-transform: var(--up-type-<role>-text-transform)`. Every role emits a letter-spacing longhand (0 where untracked); only those three uppercase roles emit a text-transform longhand.
2. **Compose the Tailwind presets.** In the Tailwind configuration: `presets: [require("@lukso/web-components/tailwind.config"), require("<path>/tokens/build/tailwind/preset.cjs")]`. The overlay only extends: `text-ink`, `text-ink-muted`, `bg-surface-card`, `border-edge`, `text-accent`, `bg-up-96`, `text-title-l`, `rounded-up-m`, `shadow-up-card`, `duration-up-fast`, `bg-up-brand-gradient`, `backdrop-blur-up-glass`. Semantic colours are `var()` references, so opacity modifiers do not apply to them; use primitives for those. The `fontSize` entries carry the tracking of the tracked roles (`text-label-caps`, `text-label-nav`, `text-deck-h1` to `text-deck-h3`) but no text-transform: add Tailwind's `uppercase` utility to `text-label-caps`, `text-currency-code` and `text-deck-caption`.
3. **Adopt the Address Signature helpers.** Replace local copies of the gradient and slicing helpers with `packages/address-signature`: `gradientCss(address)` for covers, `displayNameParts(name, address)` for `lukso-username`, `sliceAddress(address, { leading: 10, trailing: 8 })` for detail views, `identiconSvg(address)` where an inline identicon is needed, `signatureSvg(address, { name })` for link-preview images.
4. **Style base-layer components with the tokens.** `lukso-button`, `lukso-input`, `lukso-tag`, `lukso-card`, `lukso-profile`, `lukso-username`, `lukso-modal` keep their APIs; set the custom properties they expose to the `--up-*` values and add the focus ring rule from `examples/web/profile-card.css`.
5. **Profile card.** Follow `components/profile-card.md`: cover 170, avatar 120 with a 4 px ring in `--up-avatar-ring`, badge from the identicon table, name `@name#XXXX` with the suffix in `--up-text-muted`. Example: `examples/web/profile-card.html`.
6. **Accent.** Use `--up-text-link` for links and `--up-accent-fill` for marketing calls to action only; product primary buttons stay ink. Keep magenta for LYX and network roles.
7. **Dark mode.** Wire the base theme mixin to a user setting and the `data-theme` attribute; the tokens already carry both themes. Test the contrast rows D-01 to D-46 on real pages.
8. **Glass.** Do not add blur on the web until OPEN-08 is decided; use `--up-surface-glass-solid` for tinted panels.
9. **Verification.** Run `node scripts/validate.mjs` in this repository after token changes, and the web app's own accessibility check on the composed pages.

## Mapping table

| Web today | Universal Profiles layer |
|---|---|
| `var(--neutral-98)` body background | `var(--up-surface-canvas)` (same value in light; themed in dark) |
| `var(--neutral-20)` text | `var(--up-text-default)` |
| `neutral-60` secondary text | `var(--up-text-muted)` (AA-safe) |
| `backgroundGradient(address)` | `gradientCss(address)` |
| `sliceAddress(address)` 6 and 6 | `sliceAddress(address)` 6 and 4, or 10 and 8 |
| profile outline `neutral-100` | `var(--up-avatar-ring)` |
| shadow `1xl` | `var(--up-shadow-card)` |

## Evidence

SRC-WEB-APP Tailwind configuration and global styles; SRC-WEB-COMPONENTS preset, helpers and component typings.
