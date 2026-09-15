# Responsive and platform behaviour

Status: observed for breakpoints and the mobile layout; proposed for the marketing grid and density guidance

## Breakpoints and columns

| Range | Layout |
|---|---|
| Below `breakpoint.sm` (640) | One column; the profile card is full width with the avatar centred on the cover edge; the app grid keeps four columns of tiles |
| `breakpoint.sm` to `breakpoint.lg` | One content column of `size.content-max-width` (880) with `space.4` gutters; navigation collapses into the navbar menu |
| Above `breakpoint.lg` (1024) | Content column plus the collapsible apps sidebar; marketing pages use twelve columns with `space.6` gutters |
| Above `breakpoint.xl` (1270) | Grid pages gain their widget canvas beside the profile column |

## Density

- Touch surfaces use the observed control heights: 48 for medium buttons and inputs, 54 for the default glass button, 60 for bottom-bar items, 44 minimum for any target.
- Pointer surfaces may use the small 28 button and 40 leading visuals but keep 44 as the minimum interactive target on hover-capable devices as well.
- Rows never drop below `list-item.min-height` (56).

## Platform behaviour

- Mobile is portrait only; the glass tier, the profile panel gestures and the raised centre action exist only there.
- The web is flat (tiers 0 and 1) and keyboard operable; every control has a visible focus ring of `button.focus-ring-width` in `border.focus` with `button.focus-ring-offset`.
- The in-app browser hides the bottom bar while a page is focused; content that depends on the bar's height must observe its visibility.
- Right-to-left layouts are untested; the `@name#XXXX` convention must keep its order in every locale (OPEN-17).

## Evidence

SRC-WEB-APP breakpoint override and content width; SRC-MOBILE-APP portrait lock, bar heights, hit-slop usage and browser bar behaviour; SRC-WEB-COMPONENTS navbar and sidebar components.
