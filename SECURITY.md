# Security

This repository contains design tokens, documentation, small dependency-free scripts and SVG assets. It runs no services and stores no secrets.

## Reporting

Report a vulnerability privately through the repository's security advisory feature rather than a public issue. Include the affected file, the steps to reproduce and the impact. Reports are acknowledged within five working days.

## Scope

In scope: the scripts under `scripts/` and `packages/`, the generated outputs, and any content that would leak private material (see the forbidden-content scan in `scripts/validate.mjs`). Out of scope: the products that consume this system; report those to their own repositories.

## Practices

- No dependencies, no network access, no install step; scripts read and write only inside the repository.
- Generated files are deterministic and checked for drift.
- Assets carry hashes that the validator verifies.
- Private evidence never enters the repository; the validator scans every text file for private paths, URLs, identifiers and credentials.
