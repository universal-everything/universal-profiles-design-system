# Components

Specifications, not implementations. Web surfaces compose the LUKSO base-layer components (`lukso-*` elements) with the tokens here; React Native surfaces use the shipped shared components and migrate them to the generated theme. Each specification lists anatomy, variants, states, sizing, behaviour, accessibility, platform differences, tokens, status and implementation notes.

| Specification | Web (base layer) | Mobile (shipped) |
|---|---|---|
| [button.md](button.md) | `lukso-button` | product button, glass button |
| [input.md](input.md) | `lukso-input`, `lukso-textarea`, `lukso-search`, `lukso-select` | text input, tags input, select and dropdowns |
| [controls.md](controls.md) | `lukso-checkbox`, `lukso-radio`, `lukso-switch` | checkbox, radio, toggle, glass toggle, slide-to-confirm |
| [tag.md](tag.md) | `lukso-tag` | tag, filter chip, network tag |
| [list-item.md](list-item.md) | asset and settings rows | token, collectible, activity, controller and settings rows |
| [card.md](card.md) | `lukso-card` | flat card, glass card |
| [profile-card.md](profile-card.md) (the UP Box) | profile card composition | profile view panel, QR card, preview |
| [identicon.md](identicon.md) | `lukso-profile`, `lukso-username` | profile identicon, username |
| [glass-surfaces.md](glass-surfaces.md) | proposed only | glass panel, bar, button, toggle, separator, screen background |
| [overlays.md](overlays.md) | `lukso-modal`, `lukso-alert`, `lukso-tooltip` | bottom sheet, dialogs, loading modal, toasts, tooltip |
| [navigation.md](navigation.md) | `lukso-navbar`, sidebar, top tabs | bottom tab bar, top tabs, headers, page indicator |
| [app-tile.md](app-tile.md) | apps sidebar entries | home grid tile, add tile |
| [qr-share-card.md](qr-share-card.md) | `lukso-qr-code` | QR screen, share sheet, generated share card |
| [empty-error-states.md](empty-error-states.md) | placeholders | empty lists, error modal, offline |
| [skeleton-loading.md](skeleton-loading.md) | placeholder lines, `lukso-progress` | shimmer skeleton, loading modal, progress icon |

Selection rules for agents and humans are in `../CLAUDE.md`. Token values are in `../tokens/build`.
