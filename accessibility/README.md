# Accessibility

Status: normalized for contrast and target rules (verified by script); proposed for the font-scaling caps, the reduced-motion rule and the glass luminance probe

Accessibility is a gate. The contrast report is regenerated from the tokens and fails validation when any gated pair drops below its threshold; the checklist is part of every review.

## Contrast

- Text 4.5:1, large text (24 px regular or 19 px bold and above) and non-text indicators 3:1, per WCAG 2.2 AA.
- Every text role passes on `surface.canvas`, `surface.card` and `surface.glass-solid` in both themes; see `contrast-report.md` (102 pairs, generated from `../tokens/contrast-pairs.json`).
- Glass is checked against worst-case covers: ink on the 0.72 tint over black and over saturated red passes; secondary text on glass over dark covers does not and is handled by the rule below; accent text never sits on translucent glass.
- Network colours are dots beside text; testnet text is ink, never orange.

## Glass and cover worst cases

Components on translucent glass either use `text.default` for everything they must convey, or probe the cover behind them: compute the relative luminance of the cover region behind the component (average of a downscaled crop); when it is below 0.18 (dark cover), switch that component's tint to `surface.glass-solid` or promote secondary text to `text.default`. The same rule covers text over cover images: never place text on a cover without the scrim or glass tier plus the probe. Users with reduce-transparency enabled get the solid tint everywhere.

## Dynamic type and font scaling

- Support platform text scaling. Caps per role, as exported by the React Native theme: 1.5 for interface text, 1.3 for mono names and addresses, 1.2 for tab labels.
- Layouts reflow: rows grow in height, pills wrap, names truncate before the suffix.
- Minimum sizes: 14 for reading, 12 for meta text, 11 only for tab labels in semibold, 10 only where an accessible name exists elsewhere.

## Targets and spacing

- Minimum interactive target 44 by 44 on every platform (`size.touch-target`); bar items are 60 high; small buttons and chips extend their hit area.
- At least `space.2` between adjacent targets.

## Focus

- Web: a visible focus ring of 2 px in `border.focus` (6.95:1 on white) with a 2 px offset on every interactive element; focus order follows reading order; overlays trap and restore focus.
- Mobile: keyboard and switch navigation follow the platform; custom gestures (panel drag, slide-to-confirm, swipe to close) have button alternatives.

## Motion

Every animation has a reduced-motion path: durations collapse to `motion.duration.instant`, skeleton shimmer becomes a static fill, parallax and scale effects are removed. Read `prefers-reduced-motion` on the web and the platform reduce-motion setting on mobile.

## Labels, alt text and names

- Every icon-only control has an accessible name; icons themselves are decorative.
- Avatars: "Profile image of @name#XXXX" or "Default profile image"; badges decorative when the name is present; cover images decorative; QR codes "QR code for @name#XXXX" with the link as text.
- Marketing images carry the headline as alt text; decorative backgrounds have empty alt text.
- Form fields have programmatic labels; errors are text, announced and associated with the field.

## Non-colour cues

State is never colour alone: selected tabs are labelled selected; network tags carry the name; errors carry text; permission state carries text; success uses a check plus text.

## Localisation

Names keep the `@name#XXXX` order in every locale; addresses stay left-to-right; labels are translatable (the shipped bar hard-codes English, see the gap register). Right-to-left layouts are untested (OPEN-17).

## Evidence

Contrast figures from the generated report; target sizes and bar heights from SRC-MOBILE-APP; the shipped app has 23 accessibility labels against 359 test identifiers, no font-scaling policy and no reduce-motion handling, which sets the gap list in `../adoption/gap-register.md`.
