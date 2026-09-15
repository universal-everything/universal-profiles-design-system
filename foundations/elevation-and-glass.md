# Elevation and glass

Status: observed for the tiers, shadows and glass constants; normalized for the bar tint and the inactive colours; proposed for the dark glass values (OPEN-07) and for any web use of glass (OPEN-08)

## Four tiers

| Tier | Name | Light surface | Dark surface | Shadow | Where |
|---|---|---|---|---|---|
| 0 | Canvas | `surface.canvas` | neutral 10 | none | Screens, pages |
| 1 | Card | `surface.card` on `border.default` or `shadow.card` | neutral 15 | `shadow.card` | Flat cards, inputs, toasts, list groups on the web |
| 2 | Floating glass | `surface.glass` over blur, reflex edges | `surface.glass` (dark, proposed) | `shadow.glass-panel` on iOS, none on Android | Glass cards, buttons, bars, settings groups on mobile |
| 3 | Sheet and panel | `surface.card` (sheets) or the glass panel (profile panel) with `radius.2xl` top corners | same | `shadow.panel` ambient | The profile panel, bottom sheets, dialogs |
| Scrim | | `surface.scrim` (ink at 80 percent) | black at 80 percent | | Behind sheets and dialogs |

Shadows are ink-tinted (`color.neutral.35` at low alpha) so they read as tinted air rather than grey smoke: `shadow.drop` for rows and chips, `shadow.card` for resting cards, `shadow.floating` for menus and raised tiles, `shadow.panel` under the profile panel, `shadow.avatar` under the floating avatar. React Native consumers get the same presets as shadow props with an elevation hint in the generated theme.

## The glass tier

Glass is one elevation tier, not the identity. It makes a floating surface legible over an arbitrary cover image.

Recipe (mobile): blur the content behind the surface with `blur.panel-ios` 60 or `blur.panel-android` 80 (cards 80 and 100, bars 20 and 60), tint it with `surface.glass` (`rgba(234, 238, 243, 0.72)` on iOS, `surface.glass-android` at 0.60 on Android because its blur method renders lighter), draw a 1 px highlight on the top and left edges with `border.glass-reflex` and a counter edge on the bottom and right with `border.glass-counter`, and add the iOS shadow `shadow.glass-panel`. Glass cards add the horizontal tint gradient `glass.card-tint-start` to `glass.card-tint-end`; the bottom bar uses `surface.glass-bar` with the hairline pair `border.glass-bar-dark` over `border.glass-bar-bright`.

Platform facts that shape the recipe:

- Android only renders a visible blur through the experimental blur method; full-screen glass there uses a blurred copy of the cover (`blur.screen-android-image` 25) plus the overlay `glass.android-overlay` because sibling views cannot be blurred.
- A light blur tint brightens the whole Android screen, so Android uses the default tint.
- Android elevation ignores border radius, so decorative shadows are drawn with a radius-aware shadow view and glass components draw no shadow on Android.
- Inset shadows exist only on iOS; reflex edges are built from two bordered views.

## Contrast on glass

Glass sits over content the system does not control. The tokens are chosen so that the worst case still passes:

- Ink on the 0.72 tint over pure black composites to 5.48:1; over saturated red 6.70:1 (rows L-04, L-05).
- The bottom bar tint is normalized to 0.80 on both platforms because the observed 0.60 iOS tint drops active labels to 4.43:1 over a black cover; inactive items use `interactive.unselected-on-glass` at full opacity instead of 50 percent opacity (row L-37).
- Secondary text on glass over a black cover is not guaranteed (row L-10). Components either promote it to `text.default`, or switch to the opaque `surface.glass-solid` tint when a luminance probe of the cover behind them reads darker than the threshold in `../accessibility/README.md`.
- Accent text and brand-coloured icons never sit on translucent glass.

## Web use

The web ships tier 0 and tier 1 only. Adopting tier 2 over cover images (profile header, share cards) with `blur.web` 24 px is proposed and recorded as OPEN-08; until decided, web surfaces stay flat and use `surface.glass-solid` where a tinted panel is needed.

## Evidence

SRC-MOBILE-APP glass constants module, glass panel, glass button, bottom bar shell, screen background and shadow presets; platform notes from the shipped app's engineering guide; SRC-WEB-COMPONENTS shadow presets; contrast figures from `../accessibility/contrast-report.md`.
