# Profile creation, backup, restore and import

Status: observed for the shipped flows; normalized for the state vocabulary

## Purpose

Let people create profiles, deploy them to other networks, keep encrypted backups, restore on a new device and import a profile from the browser extension, always knowing what each step controls.

## Flow

- **Create:** the onboarding flow from step 3 onwards, reachable again from Settings for additional profiles; each new profile pages into the home screen's multi-profile carousel with page indicator dots.
- **Deploy to another network:** a sheet listing supported networks (LUKSO, Base, Ethereum) with the network tag and a plain description; a confirmation dialog; the loading modal with steps; the "{count} Networks" pill afterwards on the profile card.
- **Backup:** a file-based encrypted backup with an optional password and hint; the copy states the consequence of losing the password; per-profile status rows show the last automatic backup.
- **Restore:** pick the file, enter the password, see per-profile results with an error icon and a reason where a profile cannot be restored ("This backup holds no key that controls this profile, so it can't be restored to this device."); profile networks are shown before restore.
- **Import from the extension:** scan the extension's QR, follow the numbered instruction steps, confirm.

## Rules

- Irreversible steps use slide-to-confirm; reversible ones use a primary button.
- The profile card preview shows what will be created or restored, with the badge and suffix, before the user commits.
- Backup and restore copy is honest and specific; no exclamation marks in warnings.
- Networks are named in words with the dot; testnet is written.

## Accessibility

Step lists are exposed as lists with the current step marked. File pickers and scanners have button alternatives and clear labels. Password fields have show and hide with labelled controls. Errors per profile are announced with the reason text.

## Status

Observed in the shipped app; the state vocabulary (pending, done, failed with reason) is normalized from the backup screens.

## Evidence

SRC-MOBILE-APP backup and restore screens, deployment sheet and strings, import instruction steps.
