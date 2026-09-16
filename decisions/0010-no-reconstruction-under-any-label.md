# 0010 No reconstruction of a mark under any label

Status: accepted; supersedes the "unless explicitly marked reconstructed" clause of 0007; remains the default rule outside the two exact owner-authorized generated-background sets: the twelve slides-v2 files and their sheets recorded in 0012 and corrected in 0013, and the twelve additive ambient files and their sheets recorded in 0014
Date: 2026-09-15

## Context

Decision 0007 prohibits reconstructing a vector mark from the observed construction rules but leaves an escape hatch for a reconstruction marked `reconstructed: true`, and `brand/lockups.md` repeated it. The non-negotiables in `CLAUDE.md` and `brand/misuse.md` state the rule without exception. Two readings of one rule invite the weaker one.

## Decision

The rule is absolute: this repository never creates, reconstructs or approximates the UP! badge, wordmark, cube, Powered by LUKSO lockup, the LUKSO mark or the Universal Everything mark, under any label. The `reconstructed` field stays in the provenance schema only so that the validator can reject any record that sets it to true. Official files come from the brand owner (OPEN-03, OPEN-04).

## Consequences

`brand/lockups.md` and the provenance schema no longer describe a permitted reconstruction; `scripts/validate.mjs` rejects a `reconstructed: true` entry. Decision 0007 stays in force for everything else and is not edited.

## Evidence

`CLAUDE.md` non-negotiables, `brand/misuse.md`, `decisions/0007-no-mark-reconstruction.md`.
