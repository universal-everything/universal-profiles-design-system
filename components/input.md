# Input

Status: observed for geometry and colours; normalized for the placeholder and error text steps and the vertical padding

## Anatomy

Label (`input.label`, above the field), field container with `input.border-width` border and `input.radius`, value text, optional leading or trailing icon or unit, helper text or error text below, optional character counter at the right of the helper row. Multiline fields grow from `input.multiline-min-height`.

## Variants

Text; password with the show and hide eye icons; search (leading search icon, clear action); amount (value in `input.value-mono`, unit at the right); address (mono value, paste and scan actions); textarea; select and dropdown (chevron trailing, options in a sheet on mobile and a popover on the web); tags input (chips inside the field); autocomplete.

## States

Default (`input.border`), focused (`input.border-focus`, 1 px; web also shows the focus ring), error (`input.border-error`, error text in `input.error-color` below), disabled (`opacity.disabled`, no interaction), read-only (no border change, copy action available), filled.

## Sizing

Minimum height `input.min-height` 48, horizontal padding `input.padding-x` 16, vertical padding `input.padding-y` 12 so a 24 line height fills 48. Label to field and field to helper gap `input.gap` 8. Full width inside forms.

## Behaviour

Validate on blur and on submit, not on every keystroke, except counters. Error text replaces helper text; both use `input.helper`. Amount fields format on blur; address fields checksum on blur and show the identicon when valid. The keyboard type matches the content (numeric for amounts, no autocorrect for names and addresses).

## Accessibility

Label is programmatically associated (`for` on the web, `accessibilityLabel` on mobile). Placeholder is `text.placeholder` at 4.76:1 and is never the only label. Error state is announced and not colour-only: the message text carries it (row L-47). Focus border reaches 6.95:1 (row L-33). Minimum font 16 for values to avoid zoom on mobile web.

## Platform differences

Mobile fields sit on `surface.card` inside sheets and screens; web fields use the base-layer input with the same tokens. Mobile selects open bottom sheets; web selects open popovers.

## Tokens

`input.*`, `border.default`, `border.focus`, `status.error.border`, `status.error.text`, `text.placeholder`, `text.muted`, `type.body.l`, `type.body.l-strong`, `type.body.m`, `type.mono.l`, `space.2`, `space.3`, `space.4`, `radius.m`.

## Status

Radius, borders, label role, multiline height: observed. Placeholder and error text colours, vertical padding: normalized (the observed placeholder step reached 2.11:1).

## Implementation notes

Web: `lukso-input`, `lukso-textarea`, `lukso-search`, `lukso-select` with the custom properties. React Native: the shipped text input, tags input and dropdown wrappers reading `components.input`. Evidence: SRC-MOBILE-APP text input, tags input and dropdown components; SRC-WEB-COMPONENTS input and textarea typings.
