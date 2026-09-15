# Accessibility checklist

Status: proposed (review checklist derived from `README.md`)

Use for every screen, component and marketing asset. Each line is pass or fail.

## Colour and contrast

- [ ] Text uses a `text.*` role on a `surface.*` it is paired with in the contrast report.
- [ ] Large text and indicators reach 3:1; body text 4.5:1; both themes checked.
- [ ] Nothing on translucent glass relies on secondary or accent text without the luminance rule.
- [ ] Colour is never the only signal (tabs, networks, errors, permissions, success).
- [ ] No colours outside the tokens.

## Text

- [ ] Roles from the type scale only; no size below 12 except tab labels.
- [ ] Scales with platform text settings up to the role's cap without clipping.
- [ ] Names show `@name#XXXX`; suffix never truncated; addresses in PT Mono.
- [ ] Copy follows `../patterns/content-voice.md`.

## Targets and layout

- [ ] Every target at least 44 by 44 with `space.2` between neighbours.
- [ ] Reading order matches visual order; landmarks and headings are present on the web.
- [ ] Layout survives 1.3 to 1.5 times text scaling and the smallest supported width.

## Interaction

- [ ] Visible focus on the web; logical focus order; overlays trap and restore focus.
- [ ] Gestures have button alternatives (panel expand and collapse, slider confirm, swipe to close).
- [ ] Loading, empty and error states announce themselves; errors keep focus on the fix.
- [ ] Reduced motion honoured.

## Names and media

- [ ] Icon-only controls named; icons decorative.
- [ ] Avatars, QR codes and marketing images have the prescribed alt text; decorative images empty alt.
- [ ] Form fields labelled; helper and error text associated.

## Platform

- [ ] Android glass fallbacks render legible text (solid tint when blur is unavailable).
- [ ] iOS and Android safe areas respected; the bottom bar never covers content.
- [ ] Web keyboard operable end to end.

## Verification

- [ ] `node scripts/validate.mjs` passes (contrast, tokens, links).
- [ ] Manual check with a screen reader on one platform for new flows.
