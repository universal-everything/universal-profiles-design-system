# 0007 No mark reconstruction

Status: accepted; the reconstruction clause is superseded by 0010
Date: 2026-09-14

## Context

No vector master of the UP! badge, wordmark, cube or the Powered by LUKSO lockup was supplied; rasters exist in the app bundle, the posters and a private board. The badge glyph typography is known exactly.

## Decision

The repository ships the observed construction rules and no mark files. Reconstructing a vector from the description is prohibited unless explicitly marked reconstructed and never presented as official. Official files are requested from the brand owner (OPEN-03) together with trademark and licence statements (OPEN-04).

## Consequences

`assets/logos/` holds a README only; marketing keeps using official files from the brand owner; the validator's asset checks apply to any file added later.

## Evidence

SRC-FIGMA-UP-BOARD logo nodes (rasters), SRC-APP-ICON, SRC-POSTER-2025.
