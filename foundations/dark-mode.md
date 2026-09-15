# Dark mode

Status: proposed (the base layer exposes dark mode as a class and a theme mixin; neither product ships it yet; glass values are OPEN-07)

## How the dark theme is derived

Dark mode is a first-class theme from day one because the 2026 stage collateral already uses the dark register: near-black canvas, white type, one periwinkle accent. The theme file `tokens/src/themes/dark.json` overrides only semantic tokens; primitives and component tokens never change per theme.

| Role | Light | Dark | Note |
|---|---|---|---|
| `surface.canvas` | neutral 98 | neutral 10 | |
| `surface.card` | white | neutral 15 | |
| `surface.inverse` | neutral 20 | neutral 98 | Primary button and tooltip invert |
| `text.default` | neutral 20 | neutral 98 | 16.65:1 on the dark canvas |
| `text.muted` | neutral 40 | neutral 65 | 7.09:1 on the canvas, 6.12:1 on cards |
| `text.link`, `accent.default` | `color.up.56` | `color.up.78` | 7.90:1 on the canvas |
| `accent.fill` with `accent.on-fill` | `color.up.56` with white | `color.up.73` with neutral 10 | The accent button inverts like the primary button |
| `accent.brand` | `color.up.67` | `color.up.73` | |
| `border.default`, `border.focus` | neutral 90, neutral 35 | neutral 25, neutral 75 | |
| `avatar.ring`, `avatar.badge-ring` | white | neutral 10 | The ring is always the surface colour so the avatar still breaks the cover edge |
| `gradient.username-*` | neutral 40 to 20 | neutral 90 to 100 | |
| `gradient.address-fallback-*` | ink at 6 and 12 percent | canvas white at 6 and 12 percent | |
| `surface.glass`, `surface.glass-bar` | tints of `#EAEEF3` and white | tints of neutral 10 | Proposed; no dark glass exists in production (OPEN-07) |
| Status text | darker steps | lighter steps (green 63, red 65, yellow 65, blue 75) | Soft tints are hand-set dark hues |

The address gradient itself does not change with theme: the stops are the profile's own colour at 50 percent alpha and composite over `surface.cover-fallback` in either theme.

## Switching

- Web: `[data-theme="dark"]` or the `.dark` class on the root, and `[data-theme="auto"]` to follow the system. The generated `variables.css` carries all three.
- React Native: `darkTheme` from the generated theme; pair it with the platform colour scheme hook.
- The QR card stays white in both themes so scanners read it.

## Open

Dark glass tints, reflex edges and button tints are mirrored from the light alphas and have not been measured on a device (OPEN-07). The accent steps depend on OPEN-01.

## Evidence

SRC-WEB-COMPONENTS dark-mode class and the base theme mixin; SRC-NFTNYC-2026 dark register; SRC-MOBILE-APP has no dark styling. Contrast rows D-01 to D-46 in `../accessibility/contrast-report.md`.
