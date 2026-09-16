# Provenance

How every value and asset in this repository is traced to evidence, and what stays out.

## Files

| File | Purpose |
|---|---|
| [sources.json](sources.json) | The public source register: sixteen sources with category, authority, publication status, currency, identifiers (repository, commit, package version, design-file key and node ids) and what was inspected. Tokens cite them by `SRC-` key. |
| [open-items.md](open-items.md) | Every decision the evidence could not close, with the affected tokens and documents and the closing condition. Tokens cite them by `OPEN-` id. |
| [reconciliation.md](reconciliation.md) | Every contradiction between sources and the choice made, so that nothing is averaged silently. |
| [provenance.schema.json](provenance.schema.json) | Schema for the `PROVENANCE.json` records that accompany every asset directory: methods, per-method fields, sets, references, contracts, safe zones with their measurements, generation inputs and lineage, embedded marks, manual visual-review facts and compositions. |

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

Private documents, decks and briefs; renders, exports, screenshots and temporary asset URLs from design files; pull-request screenshots; raster marks whose rights are unrecorded; account data, contacts, financing detail, unreleased strategy. The only exceptions are named, owner-authorized files with a provenance record that states the authorization: today the five app screens exported from the Mobile app Updates file and the four shipped onboarding illustrations (`../decisions/0011-owner-authorized-product-visuals.md`), and two exact generated-background scopes that depict the official UP! container cube. Decisions [0012](../decisions/0012-branded-slide-backgrounds.md) and [0013](../decisions/0013-container-cube-slide-backgrounds.md) cover the twelve dense `slides-v2` scenes and their two overview sheets; decision [0014](../decisions/0014-ambient-slide-backgrounds.md) covers the twelve additive `slides-v3-ambient` scenes and their two overview sheets. These are publication-and-use decisions for the named files, not blanket brand approval or a trademark licence. The dense set was generated with the repository's already-public onboarding illustrations as style and composition references (recorded by hash); the private board exports behind its earlier, superseded depictions (the front-facing badge node 1131:25142 and the open-receptacle raw image node 1737:1014, both superseded) were cited by file key, node id and hash only and are not published. The ambient set cites only repository-relative public inputs and earlier ambient outputs except for one unpublished superseded mist-orbit-right dark draft retained by hash only in the dark mist-orbit lineage; it has no public path and is not published or licensed by decision 0014. The validator requires an authorization on every design-file export or shipped-asset copy and pins the two background selections independently. The validator scans every text file for private paths, private URLs, document identifiers, credentials and session logs, and rejects private file types (logs, environment files, documents, archives, databases). Files git tracks are validated even when `.gitignore` matches them, so a forced `git add -f` cannot bypass the gate; only untracked ignored local state is skipped, and the gate proves both halves on a throwaway repository at every run.

## Asset provenance

Each directory under `assets/` carries a `PROVENANCE.json` listing every file with its hash, dimensions for rasters, brief id, method and, for generated images, the verbatim prompt; a generation from references also records its generation id and its inputs by role, path and hash (repository files), by source key, frame, node id and hash for a superseded design-file export, or by hash alone for an unpublished superseded generated draft (never a local path or a temporary URL), plus the marks it depicts and, for the branded slide backgrounds, the closed-cube geometry the set requires. A precise-object edit of a generated file records, in an `edit` block, the edit's generation id and kind, the verbatim edit prompt and the edit target (the file's own superseded previous output) by hash, generation id and time stamp, and, when that target was itself an edit, every earlier edit of the chain as superseded `lineage` back to the generation output, and the branded lock pins all of them. Ambient assets additionally record per-file `ambientComposition` facts: the full-resolution visual-review statement, one normalized subject bound per visually counted cube, conservative cube and decorative-area maxima, quiet-area minimum, edge bias, centring and subject-to-safe-zone separation. Those declarations are review evidence, not automated pixel segmentation or mark recognition; the set-level `visualReview` block summarizes the family separately. Design-file exports record the node id, shipped copies the source path and commit, compositions their inputs and placements, and observed material its authorization and status. The validator recomputes hashes, reads raster headers and, where a record declares a contract, decodes the pixels: set-specific slide contracts for aspect, size, colour, intact content credentials, light and dark pairs and measured text-safe zones; a real alpha channel with a transparent exterior and a tight crop for the app screens; and a pixel match between every preview and its inputs. The dense `slides-v2` selection remains locked by `node scripts/validate.mjs --only branded`; the additive `slides-v3-ambient` selection and its stricter light-220, dark-36 and deviation-12 safe-zone contract are locked separately by `--only ambient`. Generated procedural outputs are reproduced by their script in check mode. `node scripts/inspect-png.mjs` prints the facts an entry needs.
