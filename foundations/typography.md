# Typography

Status: observed for families, sizes and line heights; normalized for the role scale; proposed for the display and deck roles (OPEN-13)

## Families

- **Inter** for interface text. Weights 400, 500, 600 and 700 in product; 800 only for the UP! badge glyph, which is governed by `../brand/lockups.md`.
- **PT Mono** for anything that belongs to the chain: profile names, the `#XXXX` suffix, addresses, balances, transaction values. Weights 400 and 700.

Both are licensed under the SIL Open Font License 1.1; see `../LICENSES/FONTS.md`. The repository does not bundle font files.

Faces that appear in evidence but are not part of the system: Suisse BP Int'l (parent-brand past guidebook), Fira Code (a swatch-label face on the brand board), SF Compact Display and SF Mono (parent-brand ideation), SF Pro (the iOS system font in status bars of mocks). Do not use them.

## Product roles

Sizes are CSS pixels on the web and points in React Native. Every size and line height is observed in production; grouping into roles is the normalization. Mobile variant names map onto roles through `type-alias.*` so migration is mechanical.

| Role | Face | Size / line | Weight | Use |
|---|---|---|---|---|
| `type.title.l` | Inter | 24 / 28 | 500 | Screen titles |
| `type.title.m` | Inter | 21 / 26 | 600 | Section titles, sheet and dialog titles |
| `type.title.s` | Inter | 17 / 22 | 600 | Row titles, asset names, top tabs |
| `type.label.l` | Inter | 14 / 17 | 700 | Bold labels |
| `type.label.caps` | Inter | 12 / 15, uppercase, tracking 0.02 | 700 | Section labels |
| `type.label.nav` | Inter | 11 / 13, tracking 0.08 | 600 | Bottom tab labels; the only role below 12 |
| `type.label.micro` | Inter | 10 / 12 | 500 | App-tile labels and currency codes; needs an accessible name elsewhere |
| `type.body.l`, `type.body.l-strong` | Inter | 16 / 24 | 400, 600 | Body, input values, input and button labels |
| `type.body.m` and variants | Inter | 14 / 22 | 400, 500, 600 | Secondary text, descriptions, errors, balances |
| `type.body.s` and variants | Inter | 12 / 20 | 400 to 700 | Meta text, fiat values; minimum informational size |
| `type.body.caption` | Inter | 13 / 20 | 400 | Captions and helper text |
| `type.action.m`, `type.action.l` | Inter | 16 / 24, 17 / 22 | 600 | Button labels; large labels and standalone links |
| `type.mono.xl` | PT Mono | 23 / 32 | 700 | Hero username on the profile card |
| `type.mono.l`, `type.mono.l-strong` | PT Mono | 16 / 22 | 400, 700 | Addresses and balances in rows |
| `type.mono.m` | PT Mono | 14 / 18 | 700 | Usernames in lists and the collapsed panel |
| `type.mono.s`, `type.mono.s-strong` | PT Mono | 12 / 14 | 400, 700 | Truncated addresses |
| `type.mono.xs` | PT Mono | 10 / 14 | 700 | Badges only |
| `type.currency.code`, `type.currency.s`, `type.currency.m` | Inter | 10 / 20 uppercase, 10 / 20, 14 / 20 | 700, 600 | Currency codes and fiat values |
| `type.display.m`, `type.display.l`, `type.display.xl` | Inter | 32 / 38, 40 / 48, 48 / 58 | 600 | Web hero and marketing headings |

The `#XXXX` suffix inherits the size of its name and takes `text.muted`. Names never wrap onto a second line; truncate the name, never the suffix.

On the web, `font: var(--up-type-<role>)` sets weight, size, line height and family only. Every role emits a `letter-spacing` longhand (`--up-type-<role>-letter-spacing`, 0 for untracked roles); the tracked roles need it: `type.label.caps`, `type.label.nav`, `type.deck.h1`, `type.deck.h2` and `type.deck.h3`, their aliases `type-alias.h4` and `type-alias.nav-11-regular`, and the component token `tab-bar.label`. Only the uppercase roles emit a `text-transform` longhand (`--up-type-<role>-text-transform`): `type.label.caps`, `type.currency.code` and `type.deck.caption`, with the aliases `type-alias.h4` and `type-alias.currency-10-bold-uppercase`. React Native carries `letterSpacing` on every role and `textTransform` on the uppercase roles; the Tailwind preset carries the tracking inside its `fontSize` entries and no text-transform, so add the `uppercase` utility to those three roles.

## Deck scale (proposed)

`type.deck.h1` 60 / 72 bold with minus 5 percent tracking, `type.deck.h2` 48 / 58 semibold minus 3 percent, `type.deck.h3` 40 / 48 semibold minus 2 percent, `type.deck.body` 20 / 28, `type.deck.caption` 16 / 22 uppercase. Read from the brand board's type slide; adopted only for presentations and social titles, never inside product screens (OPEN-13). PT Mono rules still apply to names and addresses on slides.

## Font scaling

- Respect platform text scaling. Cap the multiplier per role so the layout survives: 1.5 for interface text, 1.3 for mono names and addresses, 1.2 for tab labels. The React Native theme exports `maxFontSizeMultiplier` with these values.
- Body text is never below 14 for reading; 12 is the floor for informational text; 11 exists only for tab labels and only in semibold; 10 only where an accessible name exists elsewhere.
- Do not reduce a role's size to fit; shorten the copy or wrap the layout instead.

## Do and do not

- Do set balances, addresses and names in PT Mono even on marketing surfaces.
- Do use sentence case everywhere except the wordmark lockup and the uppercase label roles.
- Do not create sizes outside the token list; do not use letter spacing on body text.

## Evidence

SRC-MOBILE-APP typography style sheet (38 variants, weights, line heights), SRC-WEB-COMPONENTS font size and line-height lists and bundled faces, SRC-FIGMA-MOBILE-UPDATES (Inter 14 / 22 and 12 / 20 corroborated), SRC-FIGMA-UP-BOARD (deck hierarchy slide 1131:25959). Normalizations recorded in `../provenance/reconciliation.md`: the duplicate title variant, the tab label rendered semibold at every call site, the merged 17 pt action role.
