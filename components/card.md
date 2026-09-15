# Card

Status: observed for radius, shadow and the base-layer variants; proposed for the hover lift

## Anatomy

Container with `card.radius`, `card.fill`, either `card.border` or `card.shadow`, `card.padding`, and content stacked with `card.gap`. Optional header row, optional cover.

## Variants

Flat card (default), bordered card (no shadow, `border.default`), muted card (`surface.card-muted` for quiet groups), cover card (a cover image or address gradient at the top; the profile card is the specialised case), glass card (mobile; see `glass-surfaces.md`), hoverable card (web, lifts to `card.shadow-hover`), overlay card (dark scrim over a cover with white text; only with a luminance check).

Base-layer variants (basic, with header, profile, hero, dapp) map onto these; `is-eoa` marks the externally owned account styling.

## States

Default, hover (web lift), pressed (mobile highlight), selected (`accent.soft` fill and `accent.soft-border`), disabled, loading (skeleton content).

## Sizing

Radius `card.radius` 16 (`card.radius-s` 12 for small cards, `card.radius-l` 24 for QR and share cards); padding `card.padding` 16 or `card.padding-l` 24 for feature cards; gap `card.gap` 12. Cards are full width on mobile and span grid columns on the web.

## Behaviour

A card is either a container or a single target, never both: interactive cards have one action and no nested controls except a menu at the top right.

## Accessibility

Content contrast follows the surface tokens. Interactive cards expose a link or button role and a name from their title. Overlay text on covers needs the scrim or glass tier and a luminance check (see `../accessibility/README.md`).

## Platform differences

Web cards use `shadow.card`; mobile flat cards use the border or the shadow view with the radius; glass cards replace flat cards inside the redesigned mobile screens.

## Tokens

`card.*`, `surface.card`, `surface.card-muted`, `border.default`, `shadow.card`, `shadow.floating`, `radius.l`, `space.4`, `space.6`, `accent.soft`, `accent.soft-border`.

## Status

Radius, shadow and variants observed; hover lift proposed.

## Implementation notes

Web: `lukso-card` with `variant`, `border-radius`, `shadow`, `is-hoverable`, `has-overlay`. React Native: the shipped glass panel with radius 16 or a plain view with `components.card`. Evidence: SRC-WEB-COMPONENTS card typings; SRC-MOBILE-APP glass panel and QR card.
