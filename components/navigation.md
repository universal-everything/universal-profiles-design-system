# Navigation: tab bar, top tabs, headers

Status: observed for the five-slot bar, top tabs and headers; normalized for inactive colours; open for the centre action size (OPEN-12)

## Anatomy

Bottom tab bar: glass bar shell, five items (icon `tab-bar.icon-size` 24 over a label in `tab-bar.label`), the centre item raised as a `tab-bar.action-size` circle in `tab-bar.action-fill` with its icon in `tab-bar.action-icon`. Top tabs: items with `top-tabs.padding-x` and `top-tabs.padding-y`, label in `top-tabs.label`, an indicator of `top-tabs.indicator-height` in `top-tabs.indicator-color` spanning the active item. Screen header: back button (`screen.back-button-size`, radius `screen.back-button-radius`), title, optional trailing action. Settings pill header: glass pill of `header.pill-height` with the back chevron and the title in `header.title`. Page indicator: dots of `page-indicator.dot-size` with `page-indicator.gap`.

## Variants

Bottom bar (Wallet, Activity, Browse as the raised centre action, QR, Settings); browser control bar (same shell with browser items); top tabs (two to four items: Tokens and Collectibles); screen header; pill header; navbar and collapsible apps sidebar on the web.

## States

Active item (`tab-bar.label-color`, `top-tabs.active-color`), inactive (`tab-bar.inactive-color`, `top-tabs.inactive-color`, both at full opacity), pressed (platform highlight), hidden (bar slides out by its height plus `tab-bar.slide-overshoot` while the browser is focused), badge (yellow `header.badge-fill` dot on a header icon).

## Sizing

Bar item height `tab-bar.item-height` 60; five slots; centre action 56 (open); top tab padding 10 by 20; back button 44; pill header 48.

## Behaviour

The bar persists across the five sections and hides only in the browser. The centre action opens Browse. Top tabs swipe between pages with the indicator following. Profile paging on the home screen uses the page indicator dots.

## Accessibility

Inactive items use colour, not opacity, so labels keep 4.5:1 over any cover (rows L-37, L-38). Every item has a label; icon-only header actions carry accessible names. The active tab is exposed as selected. Labels are localised (the shipped bar hard-codes English labels, see `../adoption/gap-register.md`). Targets are 60 high and at least 44 wide.

## Platform differences

The bottom bar exists on mobile only; the web uses the navbar and sidebar. iOS adds `glass-bar.padding-x-ios`; Android neutralises the injected elevation.

## Tokens

`tab-bar.*`, `top-tabs.*`, `header.*`, `screen.*`, `page-indicator.*`, `glass-bar.*`, `interactive.selected`, `interactive.unselected`, `interactive.unselected-on-glass`, `type.label.nav`, `type.title.s`, `type.body.l-strong`, `motion.duration.base`, `motion.easing.out-cubic`.

## Status

Structure observed; inactive colours and pill height normalized; action size open; dot size proposed.

## Implementation notes

React Native: the shipped bottom tab bar and items, top tab bar, screen header and settings header reading `components["tab-bar"]`, `components["top-tabs"]`, `components.header`, `components.screen`. Web: `lukso-navbar` and the sidebar. The pre-redesign five-tab bar (Profile, Wallet, Discover, Activity, Permissions) is obsolete. Evidence: SRC-MOBILE-APP navigation components; SRC-WEB-COMPONENTS navbar.
