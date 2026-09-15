# Glass surfaces

Status: observed for every mobile value; normalized for the bar tint and inactive colours; proposed for the dark values (OPEN-07) and any web use (OPEN-08)

## Anatomy

A blur layer, a tint layer, an optional tint gradient, a reflex edge on the top and left, a counter edge on the bottom and right, and content. Panels add an ambient shadow; bars add the hairline pair; screens add the blurred cover copy on Android.

## Variants

| Surface | Radius | Tint | Blur (iOS, Android) | Edges |
|---|---|---|---|---|
| Glass panel (profile panel) | `glass-panel.radius` 32 top corners | `glass-panel.tint` | `glass-panel.blur-ios` 60, `glass-panel.blur-android` 80 | reflex 1 px, ambient `glass-panel.ambient-shadow` |
| Glass card (settings groups, notices) | `glass-panel.card-radius` 16 | tint plus `glass.card-tint-start` to `-end` | 80, 100 | reflex 1.5 px, highlight and counter edges |
| Glass button | `glass-button.radius` 18, small 8, pill | `glass.button-light-*` or `glass.button-dark-*` | `glass-button.blur-light` 60, `glass-button.blur-dark` 40 | highlight and counter opacities per state |
| Glass bar (bottom bar, browser bar) | none | `glass-bar.tint` 0.80 | `glass-bar.blur-ios` 20, `glass-bar.blur-android` 60 | `glass-bar.edge-dark` over `glass-bar.edge-bright` |
| Glass toggle | 16 | `glass-toggle.track-off`, `glass-toggle.track-on` | inherits | none |
| Glass separator | | `glass-separator.shadow-line` over `glass-separator.light-line`, 1 px each | | |
| Glass screen background | | blurred cover plus `glass.android-overlay` (Android) or the tint over a blur view (iOS) | `blur.screen-android-image` 25 | |
| Pill header | `header.pill-radius` | glass card tint, no shadow | card values | reflex |

## States

Rest, pressed (buttons: `glass-button.press-scale`, pressed tint and edge opacities), disabled (disabled tint and edge opacities), scrolled (bars keep their tint; content fades under the status bar with the scroll fade mask), Android fallback (solid tint `glass-panel.tint-solid` when blur is unavailable).

## Sizing

Panel padding `glass-panel.padding` 16; card padding 16; separators 2 px total; bars follow `tab-bar.item-height`.

## Behaviour

Glass surfaces never stack more than two deep (a card on a panel). Nothing animates the blur radius. Content behind a full-screen glass is the cover, blurred; the profile panel expands over it.

## Accessibility

Text on glass follows the contrast rules in `../foundations/elevation-and-glass.md`: ink passes on the 0.72 tint over any cover; secondary text and accent text do not, so components promote them or switch to the solid tint when the cover behind reads dark. Reduce-transparency settings switch every glass surface to the solid tint.

## Platform differences

All values differ per platform by design (blur method, tint alpha, shadows, edges); the generated theme exposes a `glass` object that resolves them. The web has no glass tier today.

## Tokens

`glass-panel.*`, `glass-button.*`, `glass-bar.*`, `glass-toggle.*`, `glass-separator.*`, `glass.*`, `surface.glass*`, `border.glass-*`, `blur.*`, `shadow.glass-panel`, `shadow.glass-button`, `shadow.panel`.

## Status

Observed on mobile; bar tint and inactive item colours normalized; dark and web proposed.

## Implementation notes

React Native: the shipped glass panel, glass button, glass toggle, glass separator, bottom bar shell and screen background, reading `glass` and the component objects from the generated theme. Web: none until OPEN-08 closes; use `surface.glass-solid` for tinted panels. Evidence: SRC-MOBILE-APP glass constants module and glass components; the shipped app's engineering notes on Android blur, tint and shadow behaviour.
