# Shape and radius

Status: observed

Corners are soft but not bubbly. Two radii dominate production: 12 for controls and inputs, 8 for small elements. Larger radii are reserved for surfaces that float.

| Token | Value | Used by |
|---|---|---|
| `radius.none` | 0 | Full-bleed covers, list edges |
| `radius.xs` | 4 | Skeleton lines, tiny badges |
| `radius.s` | 8 | Small buttons, tags, tooltips, checkboxes, app tiles |
| `radius.m` | 12 | Medium buttons, inputs, toasts, small cards |
| `radius.l` | 16 | Cards, glass cards, dialogs |
| `radius.xl` | 24 | QR and share cards, bottom sheets |
| `radius.2xl` | 32 | Glass panel top corners |
| `radius.pill` | 999 | Chips, pill headers, small glass buttons, network tags |

Special values kept as component tokens rather than scale steps: `glass-button.radius` 18, `slider-confirm.track-radius` 44 with a 32 knob radius, `screen.back-button-radius` 22, `checkbox.radius` 8 on a 28 box, `radio.size` 20 (circular).

## Rules

- Nested radii subtract the padding: a 16 card with 8 padding holds 8-radius children.
- Avatars and identicon badges are always circles; the only square profile image is the EOA blockie rendered as the avatar itself.
- App icons and the UP! badge use a superellipse-like rounded square; the exact radius ratio is open (OPEN-02).
- Do not mix pill and rectangular shapes inside one row of controls.

## Evidence

SRC-MOBILE-APP border-radius literals (12 in 47 places, 8 in 42, 24 in 10, 20 in 7), glass constants, slider and header components; SRC-WEB-COMPONENTS radius list; SRC-FIGMA-MOBILE-UPDATES modal radius 36.25 recorded as an exploration value, not adopted.
