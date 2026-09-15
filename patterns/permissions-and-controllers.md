# Permissions and controllers

Status: observed for the controller list, permission sections and copy; proposed for the agent register wording

## Purpose

Show who can act for a profile (devices, apps, agents), what each is allowed to do in plain language, and let people revoke or adjust without fear.

## Flow

1. **Controllers list.** Rows with a device or app icon, the controller's name, a one-line permission summary and a chevron; the current device is marked.
2. **Controller detail.** Sections of permissions using the permission icon pairs (active and inactive states drawn in colour, not separate files), each with a plain-language description ("{controllerName} can update all your profile data."). Actions: edit permissions, remove controller (slide-to-confirm).
3. **Connect an app.** A sheet showing the app's name and icon, the profile that will connect (card preview), the requested permissions as a checklist, and Connect or Cancel.
4. **Authorise an agent or external service.** The same sheet with a stronger emphasis on scope and duration; agents are named as controllers, never as users.

## Rules

- Plain language first; the standards names (LSP6, key manager) appear only in a builder detail.
- Permission state is shown by icon colour plus text, never colour alone.
- Removing the last controller is impossible from the interface; the copy explains why.
- Requests from apps never pre-check dangerous permissions.

## Accessibility

Permission rows expose "{permission}, allowed" or "not allowed". The connect sheet's primary action is labelled with the app name ("Connect to {app}"). Icon pairs meet 3:1 in their active colour.

## Status

Observed in the shipped app; the agent wording is proposed.

## Evidence

SRC-MOBILE-APP permissions module, controller rows, permission item and the 33 permission icons; permission descriptions in the translation strings; SRC-LUKSO-DOCS key-manager vocabulary.
