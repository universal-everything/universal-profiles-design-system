# Skeleton and loading

Status: observed for the shimmer, the loading modal and the progress icon; proposed for the reduced-motion fallback

## Anatomy

Skeleton: shapes in `skeleton.base` with a highlight sweep in `skeleton.highlight` running `skeleton.duration` linearly; lines use `skeleton.radius`, avatars are circles, cards are the card radius. Loading modal: a dialog with a spinner and an optional step list. Progress icon: an inline circular indicator in the icon size.

## Variants

Line, circle, card, row (circle plus two lines), profile card (cover, avatar circle, name and counters), list (three rows), inline spinner, step list (current, done, pending steps for deployments and backups).

## States

Shimmering, static (reduced motion), complete (content fades in over `motion.duration.fast`).

## Sizing

Skeleton shapes match the content they replace; placeholder name widths on the web are 100 to 180 depending on size; rows keep `list-item.min-height`.

## Behaviour

Show skeletons for lists and cards, spinners for actions, the loading modal for blocking multi-step operations with visible step names. Never stack a spinner on a skeleton. Time out to an error state with retry after the network timeout.

## Accessibility

Skeletons are hidden from assistive technology and the container announces "Loading". Step lists read as a list with the current step marked. Reduced motion replaces the sweep with the static base fill.

## Platform differences

Mobile uses a GPU shimmer; the web animates a gradient with the same duration. The loading modal is mobile; the web uses inline progress.

## Tokens

`skeleton.*`, `surface.skeleton`, `surface.skeleton-highlight`, `motion.duration.shimmer`, `motion.easing.linear`, `motion.duration.fast`, `radius.xs`.

## Status

Observed with one proposal.

## Implementation notes

React Native: the shipped skeleton, loading modal and progress indicator reading `components.skeleton`. Web: placeholder lines and `lukso-progress`. Evidence: SRC-MOBILE-APP skeleton and loading components; SRC-WEB-APP placeholder line component.
