# Button

Status: observed for the product button and glass button; normalized for the danger colours and pressed tints; proposed for the accent variant and the focus ring

## Anatomy

Container, optional leading icon, label in `button.label`, optional trailing icon, with `button.icon-gap` between them. Glass buttons add the blur layer, the tint gradient and the reflex edges.

## Variants

| Variant | Fill | Label | Border | Use |
|---|---|---|---|---|
| Primary | `button.primary.fill` (ink) | `button.primary.label` (white) | none | The one main action per screen |
| Secondary | `button.secondary.fill` (white) | `button.secondary.label` | `button.secondary.border` | Alternative actions |
| Ghost | transparent | `button.ghost.label` | none | Low-emphasis actions, dialog cancel |
| Danger | transparent | `button.danger.label` | `button.danger.border` | Destructive actions, outlined |
| Accent (proposed) | `button.accent.fill` | `button.accent.label` | none | Marketing and web calls to action; not used in the app today (OPEN-01) |
| Glass light, glass dark | tint gradients `glass.button-light-*`, `glass.button-dark-*` | `glass-button.label-color`, `glass-button.label-color-dark` | reflex edges | Actions on covers and glass panels (mobile) |

Web base-layer variants map as follows: primary and landing to Primary; secondary to Secondary; text, link, nav-text to Ghost; danger to Danger; success and warning use the status fills with their on-fill text.

## States

Default; hover (web: `card.shadow-hover` lift or darker fill); pressed (`*.fill-pressed`, glass scale `glass-button.press-scale`, glass tint pressed steps); focus-visible (ring `button.focus-ring-width` in `border.focus` offset by `button.focus-ring-offset`); disabled (`button.disabled-opacity`, glass tint disabled steps; never remove the label); loading (spinner replaces the leading icon, label may change to the loading text, width locked).

## Sizing

Small `button.height-s` 28 with `button.radius-s` and `button.padding-x-s`; medium `button.height-m` 48 with `button.radius-m` and `button.padding-x-m`. Glass default `glass-button.height` 54 with `glass-button.radius` 18; glass small 28 with `glass-button.radius-s`, or `glass-button.radius-pill` for the Buy and Send pills in token rows. Full-width buttons are the norm in sheets and onboarding; inline buttons size to content. Minimum target 44 on every platform: small buttons get extra hit area.

## Behaviour

One primary action per view. Destructive confirmations use the slide-to-confirm control instead of a red button. Loading locks the width and disables further presses. Icon-only buttons need a label for assistive technology and a tooltip on the web.

## Accessibility

Label contrast 4.5:1 on every fill (rows L-15 to L-17, L-21, L-25, L-54). Danger label uses `status.error.text` because the observed lighter red reached 3.27:1. Focus ring visible on the web at 3:1 (row L-33). Disabled buttons remain readable and announce their state. Glass labels use `text.on-glass-label` and the tint never drops below the values in `../foundations/elevation-and-glass.md`.

## Platform differences

Mobile has no hover and relies on the native ripple or highlight for the product button; glass buttons scale to 0.98. Web adds hover, focus-visible and keyboard activation. Glass buttons exist on mobile only until OPEN-08 is decided.

## Tokens

`button.*`, `glass-button.*`, `glass.button-*`, `interactive.*`, `status.error.text`, `accent.fill`, `accent.on-fill`, `border.focus`, `opacity.disabled`, `type.action.m`, `motion.scale.press`, `shadow.glass-button`.

## Status

Heights, radii, paddings, primary and secondary colours: observed. Pressed tints, danger colours, padding of the medium button: normalized. Accent variant and focus ring: proposed.

## Implementation notes

Web: `lukso-button` with `variant` and `size`, styled through the custom properties; add the focus ring rule from `../examples/web/profile-card.css`. React Native: the shipped product button and glass button, reading `components.button` and `components["glass-button"]` from the generated theme. Evidence: SRC-MOBILE-APP button and glass button components; SRC-WEB-COMPONENTS button typings.
