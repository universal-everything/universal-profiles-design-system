# 0001 Product layer on the LUKSO base layer

Status: accepted
Date: 2026-09-14

## Context

`@lukso/web-components` is the only packaged design system in the ecosystem: neutral palette, Tailwind preset, Lit components, fonts and helpers. The mobile app re-implements the same palette by hand and drifts. Universal Profiles needs an accent, elevation tiers, the profile-card rules, dark mode and marketing guidance that the base layer does not carry.

## Decision

This repository is the Universal Profiles product layer. It imports the base-layer values, never redefines them, and adds the accent family, semantic roles, component and pattern specifications, the Address Signature package, imagery and governance. Where products diverge from the base layer, the difference is logged in the reconciliation register.

## Consequences

Web consumers compose the overlay preset after the base preset; React Native consumers alias the palette to the generated theme. Upstreaming the accent family and the identicon table to the base layer is desirable and tracked as OPEN-09.

## Evidence

SRC-WEB-COMPONENTS, SRC-WEB-APP, SRC-MOBILE-APP.
