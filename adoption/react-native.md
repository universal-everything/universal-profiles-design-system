# Adoption guide: React Native

Status: proposed (the guide migrates the shipped mobile app file by file; the shipped components stay)

## Principle

The generated theme mirrors the shapes the app already uses (`palette.neutral[20]`, component constants, glass constants), so call sites migrate mechanically. Nothing is replaced wholesale.

## Steps

1. **Add the theme.** Copy or reference `tokens/build/react-native/theme.ts`. It exports `palette`, `lightColors`, `darkColors`, `lightTheme`, `darkTheme`, `spacing`, `radius`, `size`, `opacity`, `blur`, `motion`, `identicon`, `darkIdenticon`, `typography`, `typographyAliases`, `components`, `darkComponents`, `shadows`, `glass` and `maxFontSizeMultiplier`. It depends only on `react-native`. Read component tokens and the identicon table through the active theme (`theme.components`, `theme.identicon`): `lightTheme` carries the light-resolved objects and `darkTheme` the dark-resolved ones, so the bare `components` and `identicon` exports are only correct for light mode.
2. **Alias the palette.** Point the app's colour palette module at `palette` so `colorPalette.neutral[20]` keeps resolving while new code reads semantic roles (`theme.colors.text.default`).
3. **Typography.** Map the 38 variant names through `typographyAliases` to roles; the aliases resolve to `typography[role]` objects with the font-file names the app loads (`InterSemiBold`, `PTMonoBold`). Apply `maxFontSizeMultiplier` per role.
4. **Glass.** Read blur intensities, tints, the Android experimental blur method, the Android tint mode and the overlay from `glass`; the platform pairs are resolved for the current platform.
5. **Address Signature.** Replace the local gradient helper, username formatter and truncation with `packages/address-signature`: `gradientReactNative(address)` for the cover, `displayNameParts(name, address)` for the username component, `sliceAddress` for rows and detail views, `identiconSeed` for the identicon cache key. Keep the identicon library; the package proves parity with it.
6. **Components.** Migrate in this order: profile view and panel (`theme.components["profile-card"]`, `theme.components["glass-panel"]`), bottom bar (`theme.components["tab-bar"]`, inactive colour instead of opacity, tint 0.80), buttons and glass buttons, inputs, tags and network tag (dot plus ink text), list rows, sheets and dialogs, toggles (on-state `status.success.control`), skeleton.
7. **Retire drift.** Remove the older profile-image component in favour of the identicon component; delete the duplicate title variant; replace hard-coded network hexes with `lightColors.network`; rename the LUKSO mark component; drop the 18 MB raster-in-SVG; move the developer screens' utility greys to tokens.
8. **Dark mode.** Provide `darkTheme` through a theme context bound to the platform colour scheme; every component colour read through `theme.components` then resolves to its dark value (labels on the bar, the profile-card username and suffix, button fills). Audit glass values on a device (OPEN-07).
9. **Accessibility.** Add labels to icon-only controls, `maxFontSizeMultiplier` per role, reduce-motion handling, and localise tab labels.
10. **Verification.** Run this repository's `node scripts/validate.mjs` after token changes; run the app's tests; compare rendered identicons and gradients against the fixtures in `packages/address-signature/test/fixtures.json`.

## Mapping table

| App today | Theme |
|---|---|
| `colorPalette.neutral[98]` screen background | `theme.colors.surface.canvas` |
| `colorPalette.neutral[20]` text | `theme.colors.text.default` |
| `neutral[60]` suffix and secondary labels | `theme.colors.text.muted` |
| `neutral[70]` placeholder | `theme.colors.text.placeholder` |
| `GLASS_BG_COLOR` and the Android value | `glass.tint(theme.colors)` |
| `GLASS_PANEL_RADIUS` 32 | `glass.panelRadius` |
| `GLASS_TAB_BAR_BG_COLOR` 0.60 or 0.80 | `glass.barTint(theme.colors)` (0.80) |
| tab item `opacity 0.5` | `theme.components["tab-bar"]["inactive-color"]`, opacity 1 |
| `GlassToggle` system green | `theme.components["glass-toggle"]["track-on"]` |
| `#FE005B`, `#FFB84C` literals | `theme.colors.network["lukso-mainnet"]`, `["lukso-testnet"]` |
| `LUKSOShadows` presets | `shadows.card`, `shadows.floating`, `shadows.panel`, `shadows.avatar` |
| `withTiming(…, 600, Easing.out(Easing.exp))` | `motion.duration.panel`, `motion.easing["out-expo"]` |

Examples: `examples/react-native/ProfileCard.tsx`, `GlassPanel.tsx`, `TabBar.tsx`.

## Evidence

SRC-MOBILE-APP theme, glass constants, typography styles, components and drift findings.
