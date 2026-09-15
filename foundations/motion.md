# Motion

Status: observed for durations, easings and the press scale; normalized for the bezier approximations; proposed for the reduced-motion rule

Motion is functional: it explains where a surface came from and settles quickly. Nothing loops except the skeleton shimmer.

| Token | Value | Use |
|---|---|---|
| `motion.duration.instant` | 0 ms | Every animation under reduced motion |
| `motion.duration.fast` | 250 ms | Card hide and show, fades, toasts |
| `motion.duration.base` | 300 ms | Tab bar slide, sheet open, most transitions |
| `motion.duration.slow` | 500 ms | Web fade-in-up entrances |
| `motion.duration.panel` | 600 ms | Profile panel position changes |
| `motion.duration.shimmer` | 1200 ms | Skeleton loop, linear |
| `motion.easing.out-quad` | cubic-bezier(0.5, 1, 0.89, 1) | Fades |
| `motion.easing.out-cubic` | cubic-bezier(0.33, 1, 0.68, 1) | Slides |
| `motion.easing.out-expo` | cubic-bezier(0.16, 1, 0.3, 1) | Panel settle |
| `motion.easing.linear` | linear | Loops |
| `motion.scale.press` | 0.98 | Pressed glass buttons |
| `motion.scale.hover-lift` | 1.01 | Web avatar hover |

Recipes: the panel snaps between positions with `motion.duration.panel` and `motion.easing.out-expo`; the bottom bar hides with `motion.duration.base`, `motion.easing.out-cubic` and `tab-bar.slide-overshoot` 30 of extra travel; cards fade in `motion.duration.fast` with `motion.easing.out-quad`.

## Reduced motion (proposed rule)

Every animation has a reduced-motion path: durations collapse to `motion.duration.instant`, position changes become cuts, the shimmer becomes a static `surface.skeleton` fill, and parallax or scale effects are removed. Web reads `prefers-reduced-motion`; React Native reads the platform's reduce-motion setting. Production does not yet check it; the gap is listed in `../adoption/gap-register.md`.

## Do and do not

- Do keep transitions under 300 ms except the panel.
- Do animate opacity and transform only; never animate blur radius or layout on the glass tier.
- Do not add bounce, spring overshoot beyond the bar's 30 px, or looping decorative motion.

## Evidence

SRC-MOBILE-APP profile view timing calls (600 and 250), navigation bar slide (300 with overshoot), skeleton shimmer (1200), glass button press scale; SRC-WEB-COMPONENTS animation utilities (fade-in-up 500); SRC-WEB-APP avatar hover scale.
