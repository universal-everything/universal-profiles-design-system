# Identicon and avatar

Status: observed for the size table, variants and the identicon algorithm; open for the small badge size (OPEN-06)

## Anatomy

Avatar circle (image or fallback glyph) with a ring in `identicon.ring-color`, and the identicon badge circle at the lower right with `identicon.badge-ring-color`, inset by `identicon.badge-offset`.

## Variants

Default (profile image plus badge), anonymous (person glyph in `identicon.fallback-glyph` on `identicon.fallback-fill`, plus badge), externally owned account (the identicon fills the avatar, no badge), smart contract (code glyph card), token (hexagon-cube glyph on the fallback fill), square (assets and collections use `radius.s` instead of a circle).

## States

Loading (`surface.skeleton` circle), error (fallback glyph, badge still drawn), pressed (opens the image or the profile), stacked (overlapping avatars in a followers row with `space.1` negative overlap and the ring keeping them separable).

## Sizing

| Size | Avatar | Badge | Ring |
|---|---|---|---|
| 2xs | 16 | 8 | 1 |
| xs | 24 | 12 | 1 |
| s | 40 | 16 (mobile 14 today, OPEN-06) | 2 |
| m | 56 | 20 | 2 |
| l | 80 | 24 | 2.5 |
| xl | 96 | 28 | 3 |
| 2xl | 120 | 36 | 3.5 |

Badges are mandatory from `identicon.min-badge-size` 24 upwards; at 16 the badge would be 8 px and is omitted. Hero contexts override the ring (7 on the mobile home panel, 4 on the web profile page).

## Behaviour

The badge is the address identicon generated from the lower-cased address by the same algorithm on every platform (`packages/address-signature` reproduces it). It never animates, tints or swaps for an illustration. Tapping opens the image viewer (web) or the profile actions (mobile).

## Accessibility

Alt text: "Profile image of @name#XXXX" or "Default profile image". The badge is decorative when the name is shown; when the avatar stands alone (followers row), the accessible name is the display name. Rings are the surface colour so avatars separate from any cover.

## Platform differences

Web renders the badge with an outline of the ring width; mobile renders a ring view. The older mobile profile image component uses a different table (24 / 10, 48 / 16) and is retired in favour of the identicon component.

## Tokens

`identicon.*`, `avatar.ring`, `avatar.badge-ring`, `surface.avatar-fallback`, `surface.skeleton`, `size.identicon-*`.

## Status

Table and variants observed in the base layer and the mobile identicon component; the small badge is open; the minimum badge size is proposed.

## Implementation notes

Web: `lukso-profile` with `profile-url`, `profile-address`, `has-identicon`, `size`, `is-square`. React Native: the shipped profile identicon with `size` and `borderWidth`. Evidence: SRC-WEB-COMPONENTS profile size map; SRC-MOBILE-APP identicon component size constants and its identicon library; parity fixtures in `../packages/address-signature/test/fixtures.json`.
