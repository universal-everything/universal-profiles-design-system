# Apps, the in-app browser and embedded surfaces

Status: observed for the browser and connect flows; proposed for the embedded product surface guidance

## Purpose

Let people use apps through their profile, inside the app's browser or on the web, with the profile always visible as the acting identity.

## Flow

- **Open an app** from the home grid or Browse: the in-app browser opens with a glass control bar (back, forward, reload, share, close), the address bar hiding the protocol until focused; the bottom tab bar slides out.
- **Connect**: the app requests a connection; the connect sheet (see `permissions-and-controllers.md`) shows the acting profile card and requested permissions.
- **Act**: requests arrive as sheets over the browser; the profile panel expands again when the browser closes.
- **External links** prompt a confirmation modal before leaving the app.
- **Embedded surfaces** (the profile viewer or product pages inside partner sites) keep the profile card anatomy and tokens and add the "powered by" attribution only with an approved lockup (OPEN-11).

## Rules

- The acting profile is always identifiable: the collapsed strip or the connect sheet shows `@name#XXXX` with the badge.
- Apps get the profile context through the embed parameters only for the product's own web app.
- The browser chrome uses the glass bar and never covers app content permanently.
- No app may restyle the profile card or the Address Signature inside the product's surfaces.

## Accessibility

Browser controls have labels and 44 targets; the address bar is a text field with a clear label; the close gesture (swipe down) has a button. Connection sheets trap focus and name the app.

## Status

Observed; embedded guidance proposed.

## Evidence

SRC-MOBILE-APP browser screen, bottom bar shell and browser items, external-link modal strings, embed parameters; SRC-WEB-APP embed views.
