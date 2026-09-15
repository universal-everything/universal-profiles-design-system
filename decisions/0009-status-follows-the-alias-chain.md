# 0009 A token's status never outranks its alias chain

Status: accepted
Date: 2026-09-15

## Context

Component tokens inherit their status from a group-level declaration, and most component groups are observed because the component exists in production. Fifty component tokens therefore published `observed` while resolving, through their alias chain, to normalized or proposed values (the suffix colour, the placeholder colour, the bar tint, the pressed fills), and the dark theme's overrides kept light-theme statuses and sources. A consumer reading `tokens.flat.json` or `tokenMeta` was told the value was what production ships when the reconciliation register said otherwise.

## Decision

A token's status never outranks the weakest status in its alias chain, in the order observed, normalized, proposed, open, and a token that is not obsolete never resolves through an obsolete token. The validator enforces the rule on every declared status of the light theme and on every token a theme file overrides. Tokens whose alias target is weaker carry an explicit status and a note naming the target. Theme-file metadata wins over the base token's metadata at every level, so a theme's group-level status applies to every override beneath it. Component tokens are not re-declared per theme; the dark output reports their status as the weakest status along their dark alias chain.

## Consequences

Fifty-one tokens moved from observed or normalized to normalized or proposed with explicit notes; the dark output reports every dark override as proposed, which is what `tokens/src/themes/dark.json` has always stated. Promotion still requires evidence and a decision record; this rule only ever demotes. `tokens/README.md` documents the rule; `scripts/validate.mjs` fails on any new violation.

## Evidence

`scripts/lib/tokens.mjs` (`effectiveStatus`, `applyThemeOverrides`), `scripts/validate.mjs` (tokens check), `provenance/reconciliation.md` entries R-04 to R-12 and R-20.
