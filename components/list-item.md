# List item

Status: observed for the row anatomy and roles; normalized for the minimum height and divider

## Anatomy

Leading visual (token logo, identicon or icon), title in `list-item.title`, subtitle in `list-item.subtitle`, trailing value in `list-item.value` with an optional secondary value in `list-item.value-secondary`, and a trailing affordance (chevron in `list-item.chevron-color` at `list-item.chevron-opacity`, toggle, or small glass buttons).

## Variants

Token row (40 logo, name, balance and fiat, Buy and Send pills), collectible row (square thumbnail with `radius.s`), activity row (counterpart identicon, action, mono value, time), controller row (device icon, controller name, permission summary, chevron), settings row (24 icon, title, description, chevron or toggle), permission row (permission icon pair, plain-language description), selectable row (radio or check at the trailing edge).

## States

Default, pressed (platform highlight), selected (`accent.soft` fill on the web, check mark on mobile), disabled (`opacity.disabled`), loading (skeleton row), swipe actions (mobile, where the row supports them).

## Sizing

Minimum height `list-item.min-height` 56; padding `list-item.padding-x` 16 by `list-item.padding-y` 8; gap `list-item.gap` 12; leading `list-item.leading-size` 40 or `list-item.leading-icon-size` 24. Dividers `list-item.divider` inside cards; glass groups use the glass separator instead.

## Behaviour

The whole row is the target; inline pills are separate targets with their own labels. Mono values (balances, addresses) align right and never wrap. Long titles truncate; subtitles may wrap to two lines.

## Accessibility

Row accessible name is "{title}, {subtitle}, {value}". Chevrons are decorative. Secondary text uses `text.muted` (4.5:1 on canvas and cards, rows L-06 to L-08); on translucent glass it falls back per `../foundations/elevation-and-glass.md`.

## Platform differences

Mobile rows live inside glass cards with the two-line separator; web rows live in flat cards with the subtle divider. Swipe actions are mobile only.

## Tokens

`list-item.*`, `text.default`, `text.muted`, `type.title.s`, `type.body.m`, `type.body.m-strong`, `type.body.s`, `type.mono.l`, `border.subtle`, `size.identicon-s`, `size.icon-m`, `opacity.hint`.

## Status

Anatomy and roles observed; minimum height and divider normalized.

## Implementation notes

Web: asset rows and settings rows built from base-layer primitives. React Native: the shipped token, collectible, controller, permission and settings rows reading `components["list-item"]`. Evidence: SRC-MOBILE-APP token list item, settings list, permission item; SRC-WEB-APP asset rows.
