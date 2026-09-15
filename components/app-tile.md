# App tile

Status: observed for size, radius, columns and label; normalized for the add-tile border

## Anatomy

A square icon of `app-tile.size` 61 with `app-tile.radius` 8, a label in `app-tile.label` centred below in `app-tile.label-color`. The add tile is a dashed square in `app-tile.add-border` with a plus icon.

## Variants

App tile (partner app icon), add tile, edit-mode tile (wobble-free; shows a remove affordance), web sidebar entry (24 icon and title in a row).

## States

Default, pressed (scale `motion.scale.press`), disabled (`app-tile.disabled-opacity`), edit mode (long press), loading (skeleton square).

## Sizing

Four columns (`app-tile.columns`) of `app-tile.column-width` 72; the count derives from the width so wider phones gain a column. Gap `space.2`. Labels are one line of `type.label.micro` and truncate.

## Behaviour

Tapping opens the app in the in-app browser with the profile context. Long press enters edit mode for reordering and removal. The add tile opens the app directory.

## Accessibility

The tile's accessible name is the app name; the 10 pt label is not the only name. The dashed add border uses `border.strong` at 3:1 because the observed light dashed border was not perceivable. Icons need no alt text beyond the name.

## Platform differences

Grid tiles exist on mobile; the web lists apps in the sidebar and the apps page.

## Tokens

`app-tile.*`, `border.strong`, `type.label.micro`, `text.default`, `space.2`, `space.18`, `opacity.disabled`, `motion.scale.press`.

## Status

Observed with one normalization.

## Implementation notes

React Native: the shipped app card and add card reading `components["app-tile"]`. Partner app icons are supplied by the apps and are not part of this system. Evidence: SRC-MOBILE-APP app card, add card and apps list.
