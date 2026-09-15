# Selection controls

Status: observed for sizes; normalized for boundaries and the on-state colour; proposed for the radio dot size

## Anatomy

Checkbox: a 28 box with `checkbox.radius` and a check mark. Radio: a 20 circle with an inner dot. Switch: a 56 by 32 track with a 26 thumb (flat) or the glass toggle with the same geometry. Slide-to-confirm: a 56-high track with a 48 knob that the user drags to the end.

## Variants

Checkbox, radio (grouped), switch (flat, web and mobile settings), glass toggle (mobile settings on glass), slide-to-confirm (irreversible actions).

## States

Off, on (`checkbox.fill-checked`, `radio.fill-selected`, `switch.track-on` or `glass-toggle.track-on`), disabled (`opacity.disabled`, glass `glass-toggle.disabled-opacity`), focus-visible (web ring), slider idle, dragging, confirmed (`slider-confirm.track-fill-complete`), disabled.

## Sizing

`checkbox.size` 28, `radio.size` 20 with `radio.dot-size` 10, `switch.track-width` 56 by `switch.track-height` 32 with `switch.thumb-size` 26, `slider-confirm.track-height` 56 with `slider-confirm.knob-size` 48 and `slider-confirm.track-radius` 44. Every control has a 44 minimum hit area.

## Behaviour

Switches apply immediately; checkboxes are collected on submit. The slider commits only when the knob reaches the end and snaps back otherwise; it is the only control for irreversible actions (deploy, delete, restore over existing data).

## Accessibility

Boundaries use `border.strong` at 3:1 because the observed light border was not perceivable (rows L-34, L-35). The on-state track uses `status.success.control` at 3:1 against white and the glass tint (rows L-22, L-49) instead of the platform system green. State is exposed as checked or selected, and the slider has a button alternative ("Confirm") for assistive technology and keyboard users.

## Platform differences

Mobile settings use the glass toggle on glass cards; the web uses the flat switch. The slider exists on mobile only; the web uses a typed confirmation dialog.

## Tokens

`checkbox.*`, `radio.*`, `switch.*`, `glass-toggle.*`, `slider-confirm.*`, `border.strong`, `interactive.primary`, `status.success.control`, `opacity.disabled`, `opacity.disabled-glass`.

## Status

Sizes observed; border and on-state colours normalized; radio dot proposed.

## Implementation notes

Web: `lukso-checkbox`, `lukso-radio-group`, `lukso-switch`. React Native: the shipped checkbox, radio, toggle, glass toggle and slider button, reading `components.checkbox`, `components.radio`, `components.switch`, `components["glass-toggle"]` and `components["slider-confirm"]`. Evidence: SRC-MOBILE-APP control components; SRC-WEB-COMPONENTS switch and checkbox typings.
