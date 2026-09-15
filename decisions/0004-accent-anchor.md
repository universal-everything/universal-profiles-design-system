# 0004 Accent ramp anchored on the board swatch

Status: accepted as interim (OPEN-01 remains open for formal confirmation)
Date: 2026-09-14

## Context

No shipped surface defines an accent. Evidence sits in a 227 to 247 degree band: the app icon, the posters, the stage deck and, most precisely, three labelled swatches on the private Universal Profile Board (`#6981EC`, `#8494EE`, `#A4B5FF`) shown without roles, variable bindings or sign-off. The earlier research proposal used hue 236.

## Decision

Re-anchor the accent family on the board's labelled key so the ramp contains it exactly: hue 229, saturation 78, with `color.up.67` equal to `#6981EC`. Roles are assigned by contrast: `color.up.56` for text, links and fills on light surfaces, `color.up.78` for dark text, `color.up.73` for the dark fill and brand, `color.up.82` to `color.up.67` for the brand gradient. The board values are recorded as observed tokens; the ramp and every role stay proposed. The board does not prove semantic roles or approval, and this record does not claim them.

## Consequences

Components use the accent only through `accent.*` and `text.link`. When the owner confirms or changes the anchor, only `tokens/src/primitive/color.json` and the contrast pairs change; the build regenerates everything else.

## Evidence

SRC-FIGMA-UP-BOARD palette section, SRC-APP-ICON, SRC-POSTER-2025, SRC-NFTNYC-2026; contrast rows L-12, L-13, L-16 to L-18, L-51 to L-53, D-08, D-09, D-12 to D-14, D-42 to D-46.
