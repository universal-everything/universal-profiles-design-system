# Provenance

How every value and asset in this repository is traced to evidence, and what stays out.

## Files

| File | Purpose |
|---|---|
| [sources.json](sources.json) | The public source register: sixteen sources with category, authority, publication status, currency, identifiers (repository, commit, package version, design-file key and node ids) and what was inspected. Tokens cite them by `SRC-` key. |
| [open-items.md](open-items.md) | Every decision the evidence could not close, with the affected tokens and documents and the closing condition. Tokens cite them by `OPEN-` id. |
| [reconciliation.md](reconciliation.md) | Every contradiction between sources and the choice made, so that nothing is averaged silently. |
| [provenance.schema.json](provenance.schema.json) | Schema for the `PROVENANCE.json` records that accompany every asset directory. |

## Status vocabulary

| Status | Meaning |
|---|---|
| observed | Read from current production code, approved collateral or a cited design file, unchanged. |
| normalized | Derived from observed values by reconciling, rounding, renaming or extending an existing scale; the derivation is recorded in the token note or the reconciliation register. |
| proposed | New value or structure introduced by this system; not in production and not formally approved. |
| obsolete | Exists in production or older collateral but must not be used in new work; kept only for migration. |
| open | Placeholder awaiting an owner decision or missing evidence; carries an OPEN item. |

Every token carries `status`, `source`, `confidence` and, where relevant, `open` and `note` under `$extensions.up`; group-level values are inherited. A token's status never outranks the weakest status in its alias chain (a component token that resolves through a normalized or proposed value is itself normalized or proposed; see `../decisions/0009-status-follows-the-alias-chain.md`). Documents carry a `Status:` line and an `Evidence` section. The validator enforces all three.

## Source hierarchy

1. Current shipped mobile and web code and approved recent production behaviour.
2. Direct Universal Profile Board evidence, classified as current, observed, draft or obsolete per node.
3. Focused current mobile design-file nodes where they align with shipped behaviour.
4. Approved public and campaign collateral.
5. Parent-brand ideation and older exploratory boards as lineage only.

Contradictions are never averaged: the newer authoritative source wins and the conflict is logged.

## What is excluded from this repository

Private documents, decks and briefs; renders, exports, screenshots and temporary asset URLs from design files; pull-request screenshots; raster marks whose rights are unrecorded; account data, contacts, financing detail, unreleased strategy. The validator scans every text file for private paths, private URLs, document identifiers, credentials and session logs, and rejects private file types (logs, environment files, documents, archives, databases). Files git tracks are validated even when `.gitignore` matches them, so a forced `git add -f` cannot bypass the gate; only untracked ignored local state is skipped, and the gate proves both halves on a throwaway repository at every run.

## Asset provenance

Each directory under `assets/` carries a `PROVENANCE.json` listing every file with its hash, dimensions for rasters, brief id, method and, for generated images, the verbatim prompt. The validator recomputes hashes and reads raster headers. Generated procedural outputs are reproduced by their script in check mode.
