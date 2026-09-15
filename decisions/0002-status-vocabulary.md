# 0002 Status vocabulary on every token and guideline

Status: accepted
Date: 2026-09-14

## Context

The evidence mixes shipped code, unsigned brand boards, exploratory files and this system's own proposals. Readers and agents must know which is which without reading the research.

## Decision

Every token carries `status`, `source`, `confidence` and optionally `open` and `note`; every document carries a `Status:` line and an `Evidence` section. Statuses are observed, normalized, proposed, obsolete and open, defined in `provenance/README.md`. The validator enforces the fields and the vocabulary and rejects unknown source keys and open ids.

## Consequences

Promotion from proposed to observed happens only when a product ships the value or an owner signs it off, recorded in a decision. Nothing is described as approved unless a sign-off exists.

## Evidence

Token metadata in `tokens/src`; `scripts/validate.mjs`.
