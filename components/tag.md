# Tag and chip

Status: observed for geometry and the solid and soft variants; normalized for the outlined colours and the network dot; proposed for the accent variant

## Anatomy

Container with `tag.radius` (or `tag.radius-chip` for pills), label in `tag.label`, optional leading dot or icon, optional trailing remove icon on editable chips.

## Variants

Solid (`tag.solid.fill` ink with white label), soft (`tag.soft.fill` muted card with ink label; the default for profile tags), outlined (`tag.outlined.border` with `tag.outlined.label`; filter chips), accent (`tag.accent.*`, proposed, OPEN-01), network (soft fill with a `tag.network-dot-size` dot in the network colour and the network name in ink; testnet uses `network-tag.fill-testnet` and `network-tag.border-testnet`).

## States

Static, selected (filter chips: solid fill), removable (trailing icon with its own 44 target), disabled.

## Sizing

Padding `tag.padding-x` 8 by `tag.padding-y` 4, label `type.body.s-strong`; chips add `space.2` between items and wrap. Network tag padding `network-tag.padding-x` 12 by `network-tag.padding-y` 4 with the pill radius.

## Behaviour

Profile tags are display only. Filter chips toggle and show a count. Network tags open the network switcher where switching is allowed.

## Accessibility

Labels 4.5:1 on every fill (rows L-39 to L-41). Network colour appears as a dot beside text so colour is never the only signal; the observed orange testnet label (1.72:1) is replaced by ink text. Removable chips expose "Remove {label}".

## Platform differences

None in geometry; mobile filter chips sit in a horizontal scroll row.

## Tokens

`tag.*`, `network-tag.*`, `surface.inverse`, `surface.card-muted`, `border.strong`, `text.muted`, `accent.soft`, `accent.soft-border`, `accent.default`, `status.warning.soft`, `status.warning.fill`, `network.*`.

## Status

Geometry and solid and soft variants observed; outlined colours and the network dot normalized; accent proposed.

## Implementation notes

Web: `lukso-tag` sizes and `is-rounded`. React Native: the shipped tag and the wallet filter chips reading `components.tag` and `components["network-tag"]`. Evidence: SRC-MOBILE-APP tag component, wallet filters, network pill; SRC-WEB-COMPONENTS tag typings.
