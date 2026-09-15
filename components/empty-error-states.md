# Empty and error states

Status: observed for the shipped copy-only empties and the error modal; proposed for the illustrated set and the offline state

## Anatomy

Optional illustration (small, quiet, from the empty-state brief IB-05 or the error brief IB-06), a one-line title in `type.title.s`, an optional one-line explanation in `type.body.m` and `text.muted`, and at most one action (secondary button).

## Variants

Empty list (no tokens, no collectibles, no activity, no connections, no apps, no followers), empty search, first-run empty (with a primary action), error (something went wrong, with retry), permission denied, offline, not found (profile or asset).

## States

Static; loading precedes the empty state (never flash an empty state before data arrives); retrying shows the loading modal or an inline spinner.

## Sizing

Illustrations 120 to 160 on mobile, 200 on the web; the block is vertically centred in the available area with `space.8` margins; text is centred.

## Behaviour

Empties name the thing that is empty and offer the next step. Errors say what happened, why if known and what to do; transient network errors are suppressed and retried silently. Offline shows a persistent banner in `status.warning.soft` rather than a modal.

## Accessibility

Illustrations are decorative (empty alt); the title carries the meaning. Error text uses `status.error.text` only for the emphasised line; body stays in ink. Actions are real buttons.

## Platform differences

The mobile error modal is a centred dialog; the web uses an inline alert. Offline detection is mobile first.

## Tokens

`type.title.s`, `type.body.m`, `text.default`, `text.muted`, `status.error.text`, `status.warning.soft`, `status.warning.text`, `space.8`, `button.*`.

## Status

Copy-only empties and the error modal observed; illustrations and offline proposed (assets pending the imagery briefs).

## Implementation notes

Reuse the shipped empty labels and the calm error modal on mobile; add illustrations only from the recorded briefs. Web placeholders keep the base-layer empty and no-image assets. Evidence: SRC-MOBILE-APP empty list strings, the error modal and the transient error filter; SRC-WEB-APP placeholder assets.
