# QR and share cards

Status: observed for the QR screen and code style; proposed for the generated share card and OG image

## Anatomy

QR screen: a white card with `qr.card-radius` 24 and `qr.card-padding` 24, the QR code drawn with `qr.dot-style` extra-rounded dots and corner squares in `qr.ink` on `qr.background`, quiet zone `qr.margin`, the profile avatar (`qr.avatar-size` 80) floating above the card's top edge with the ring, and the gradient username below the code. Share card: the generated card from `signatureSvg()` with the address gradient cover, avatar ring, identicon badge, name with suffix and the truncated address.

## Variants

Profile QR (encodes the profile link), generic QR (addresses, links), share sheet (shares the card as an image and the link as text), OG image (1200 by 630 share card for link previews), poster QR (the code on the print poster).

## States

Loading (skeleton card), generated, shared (system share sheet), screenshot-blocked (the share screen blocks screenshots on mobile), error (calm error modal with retry).

## Sizing

Code minimum `qr.min-size` 160 on screen; the card spans the screen width minus gutters on mobile; OG image 1200 by 630; social 1080 by 1080 and 1080 by 1920.

## Behaviour

The avatar floats above the card instead of covering the code's centre, so scanners read the code reliably. The share action shares a file plus the link. The card stays white in dark mode.

## Accessibility

The QR image has alt text "QR code for @name#XXXX" and the link is available as text beside it. Contrast of the code is ink on white. The share button and the copy-link button have labels.

## Platform differences

Mobile renders the QR with the native library; the web uses the base-layer QR element. Screenshot blocking is mobile only.

## Tokens

`qr.*`, `profile-card.avatar-size-qr`, `avatar.ring`, `color.static.white`, `color.neutral.10`, `radius.xl`, `space.1`, `space.6`, `size.identicon-l`.

## Status

QR screen observed; share card and OG generator proposed.

## Implementation notes

Web: `lukso-qr-code` and the share element; OG images from `signatureSvg()` at 1200 wide. React Native: the shipped QR code and profile QR screen reading `components.qr`. Examples: `../assets/backgrounds/address-gradient/examples/` share cards. Evidence: SRC-MOBILE-APP QR components and share modal; SRC-WEB-COMPONENTS QR element.
