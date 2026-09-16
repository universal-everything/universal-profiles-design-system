# Security

This repository contains design tokens, documentation, small dependency-free scripts, SVG assets and PNG images with provenance records. It runs no services and stores no secrets.

## Reporting

Report a vulnerability privately through the repository's security advisory feature rather than a public issue. Include the affected file, the steps to reproduce and the impact. Reports are acknowledged within five working days.

## Scope

In scope: the scripts under `scripts/` and `packages/`, the generated outputs, and any content that would leak private material (see the forbidden-content scan in `scripts/validate.mjs`). Out of scope: the products that consume this system; report those to their own repositories.

## Practices

- No dependencies, no network access, no install step; scripts read and write only inside the repository.
- Generated files are deterministic and checked for drift (for the composed contact sheets the contract is the decoded pixels; their bytes depend on the zlib of the Node that wrote them, and a matching sheet is never rewritten).
- Assets carry hashes that the validator verifies; PNGs are decoded by the gate's own reader, so a file that is not a well-formed PNG (bad signature, chunk length or CRC) fails validation.
- Private evidence never enters the repository; the validator scans every text file for private paths, URLs, identifiers and credentials.
- The dense branded slide backgrounds were generated from already-public repository files (the onboarding illustrations, pinned by hash); the private board exports behind the earlier, superseded depictions are cited by file key, node id and SHA-256 only, never copied. The `branded` check requires those citations, keeps `assets/logos/` free of mark files and rejects any text that names a superseded reference as current.
- The additive `slides-v3-ambient` backgrounds cite repository-relative public inputs or earlier ambient outputs. One unpublished superseded draft is retained by SHA-256 only in the dark mist-orbit lineage, with no public or local path; it is not a repository asset. The separate `ambient` check pins the twelve-file selection and two overview sheets, rejects any unpinned file or edit and applies the closed-cube guards without broadening or weakening the dense `branded` fixture.
- Decisions 0012 and 0013 authorize only the twelve dense scenes and their two overview sheets; decision 0014 authorizes only the twelve ambient scenes and their two overview sheets. None of those decisions publishes a mark master, grants a trademark licence or authorizes further branded files.
