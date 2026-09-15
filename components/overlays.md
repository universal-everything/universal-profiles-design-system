# Overlays: sheets, dialogs, toasts, tooltips

Status: observed for the sheet, dialog, toast and tooltip values; normalized for the sheet radius; proposed for the toast duration and the web dialog width

## Anatomy

Sheet: scrim, container with `sheet.radius` top corners, drag handle (`sheet.handle-width` by `sheet.handle-height` in `sheet.handle-color`, padded by `sheet.handle-padding-y`), centred title in `sheet.title` with `sheet.title-gap` below, content with `sheet.padding-x`, actions at the bottom above the safe area. Dialog: scrim, centred card with `dialog.radius` and `dialog.padding`, title in `dialog.title`, body in `dialog.body`, actions. Toast: card with `toast.radius`, `toast.padding`, `toast.border`, `toast.shadow`, title and body. Tooltip: `tooltip.fill` with `tooltip.text-color`, `tooltip.radius`, `tooltip.padding-x` and `tooltip.padding-y`.

## Variants

Bottom sheet (actions, forms, selectors, connect and deploy flows); dialog (confirmation, network switch warning, fatal error with retry); loading modal (spinner, step list for deployments); fullscreen modal (image upload, QR scanner); toast (info, success, error, warning; confirmation toasts with an action); tooltip; alert banner (inline, web) with the status soft tints.

## States

Closed, opening (`motion.duration.base`, `motion.easing.out-cubic`), open, dragging (sheet), dismissing; toasts auto-dismiss after `toast.duration` unless they carry an action; loading modals cannot be dismissed while a step runs.

## Sizing

Sheet padding 16 with the 24 radius; dialog padding 24, radius 16, `dialog.max-width-web` 480; toast padding 24; tooltip padding 12 by 8. Sheets take half or full height; dialogs size to content.

## Behaviour

Sheets for actions, dialogs for confirmations, slide-to-confirm inside sheets for irreversible actions. The scrim closes sheets and non-blocking dialogs; blocking dialogs require a button. Transient network errors are suppressed rather than toasted; fatal errors use the calm error modal with retry. Only one toast at a time.

## Accessibility

Focus moves into the overlay and returns on close; the scrim traps focus on the web; sheets expose a close button in addition to the gesture. Titles are the accessible name. Toast text meets 4.5:1 on the card and is announced politely; error toasts assertively. Tooltip text 4.5:1 on ink (row L-42) and never the only way to learn a control's name.

## Platform differences

Mobile sheets use the native sheet library with the 40 handle; the web uses the base-layer modal sizes small, medium, full, auto. Toasts sit above the bottom bar on mobile and at the top right on the web.

## Tokens

`sheet.*`, `dialog.*`, `toast.*`, `tooltip.*`, `surface.card`, `surface.scrim`, `surface.inverse`, `text.inverse`, `border.default`, `border.strong`, `shadow.floating`, `type.title.m`, `type.body.l`, `type.body.l-strong`, `type.body.m`, `type.body.s`, `motion.duration.base`, `motion.easing.out-cubic`.

## Status

Observed values with two normalizations (sheet radius, handle height) and two proposals (toast duration, web dialog width).

## Implementation notes

Web: `lukso-modal`, `lukso-alert`, `lukso-tooltip`, a toast utility styled with the tokens. React Native: the shipped bottom sheet, central and dialog modals, loading modal, toasts and tooltip reading `components.sheet`, `components.dialog`, `components.toast`, `components.tooltip`. Evidence: SRC-MOBILE-APP overlay components; SRC-WEB-COMPONENTS modal, alert and tooltip typings; SRC-FIGMA-MOBILE-UPDATES corroborates modal geometry.
