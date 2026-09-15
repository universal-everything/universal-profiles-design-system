# 0008 Validation without dependencies

Status: accepted
Date: 2026-09-14

## Context

Consumers and agents must be able to verify the repository without installing packages, and generated outputs must be reproducible.

## Decision

Token builds, the contrast report, the background generator and the full validation gate are Node scripts with no dependencies. Generated outputs are committed and checked for drift. `npm test` runs the whole gate.

## Consequences

No lockfile, no install step, no network. Tooling that needs dependencies (visual snapshot rendering, design-tool sync) lives outside this repository or behind an explicit opt-in.

## Evidence

`package.json`, `scripts/`.
