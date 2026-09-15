# Empty, loading, error and offline flows

Status: observed for skeletons, empties and the error modal; proposed for offline and illustrated empties

## Purpose

Keep every state calm and actionable: nothing flashes, nothing blames, and there is always a next step.

## Flow

- **Loading**: skeleton for lists and cards; spinner for actions; the loading modal for multi-step operations. Time out to an error with retry.
- **Empty**: title plus optional line plus at most one action (see `../components/empty-error-states.md`); first-run empties may carry a primary action.
- **Error**: transient network errors are retried silently; visible errors use the calm modal (title, reason, retry, dismiss) on mobile or an inline alert on the web; form errors stay inline under the field.
- **Offline**: a persistent warning banner at the top; cached content stays visible and read-only actions keep working; write actions are disabled with an explanation.
- **Not found**: a profile or asset page with the empty pattern and a link back.

## Rules

- Never show an empty state before the first load completes.
- Errors: what happened, why if known, what to do; sentence case; no exclamation marks.
- One retry path per error; never nested modals.
- Illustrations, when added, come from the recorded briefs and stay small and quiet.

## Accessibility

Loading containers announce busy; errors are announced assertively with the reason; banners are landmarks; retry keeps focus. Offline state is text, not colour.

## Status

Observed for loading, empty and error; offline and illustrations proposed.

## Evidence

SRC-MOBILE-APP skeleton, loading modal, empty list strings, error modal and transient-error filter; SRC-WEB-APP placeholder assets.
