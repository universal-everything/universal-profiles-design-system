# 0006 Glass is one elevation tier

Status: accepted
Date: 2026-09-14

## Context

The September 2026 mobile redesign introduced frosted-glass panels, bars, cards and buttons over the cover image, with documented Android fallbacks. The web stays flat. Glassmorphism as a style would be generic; as an elevation tier it solves legibility over arbitrary covers.

## Decision

Glass is tier 2 of a four-tier elevation model (canvas, card, floating glass, sheet and panel). Its values are tokens with platform pairs. It exists on mobile; web adoption over covers is a product decision (OPEN-08). Contrast on glass is checked against worst-case covers and components fall back to the solid tint.

## Consequences

Web and mobile read as one family without forcing blur everywhere; dark glass values remain proposals until measured (OPEN-07).

## Evidence

SRC-MOBILE-APP glass constants and components; contrast rows L-04, L-05, L-10, L-37, L-38.
