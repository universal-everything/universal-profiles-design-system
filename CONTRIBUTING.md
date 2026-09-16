# Contributing

## Before you start

- Read `CLAUDE.md`; it applies to people as much as to agents.
- Check `provenance/open-items.md`: if your change depends on an open decision, get the decision first and record it in `decisions/`.
- Node 22.13 or newer (the gate parses the generated TypeScript with `node:module`'s type stripper, which arrived in 22.13) and git on the path (the gate reads the index and runs a force-add mutation in a throwaway repository). No dependencies to install; `npm test` runs the whole gate.

## Kinds of change

| Change | What to do |
|---|---|
| Token value or new token | Edit `tokens/src`; set `status`, `source`, `confidence`, optional `open` and `note`; add contrast pairs if text or indicators are affected; run `node scripts/build-tokens.mjs` and `node scripts/contrast-report.mjs`; commit `tokens/build` and `accessibility/contrast-report.md` with the source change |
| Specification or pattern | Keep the required sections (components: anatomy, variants, states, sizing, behaviour, accessibility, platform differences, tokens, status, implementation notes; patterns: purpose, flow, rules, accessibility, status, evidence); cite `SRC-` keys; use token names in backticks |
| Status promotion | Only with evidence (shipped code or a sign-off) and a decision record |
| Asset | Follow the appropriate brief in `imagery/briefs.md` (dense slide backgrounds: IB-12; `slides-v3-ambient`: IB-13); add or update the directory's `PROVENANCE.json` (method, tool or model, prompt, hash, dimensions, licence; register and safe zone with measured figures for backgrounds; node id, source path or composition inputs plus status and authorization for observed material; generation inputs and `embeddedMarks` for an owner-authorized depiction of a mark; per-asset `ambientComposition` facts for ambient cube and decorative area, quiet area, placement, normalized subject bounds and safe-zone separation, distinct from the set-level `visualReview` summary); `node scripts/inspect-png.mjs <file>` prints the pixel and content-credential facts. Run `node scripts/validate.mjs --only assets` and `--only rasters`; run `--only branded` for a dense background or its sheet and `--only ambient` for an ambient background or its sheet; update only the matching fixture deliberately and recompose sheets with `node scripts/compose-previews.mjs`. No raster may carry unrecorded rights, and no product visual or depiction of a mark may enter without a recorded owner authorization: decisions 0012 and 0013 cover exactly the twelve dense files and two sheets; decision 0014 separately covers exactly the twelve ambient files and two sheets. Any depiction of the UP! object is the solid, closed and sealed container cube (a monolithic rounded die with smooth continuous top and side planes and the white UP! once on the front; no hole, slot, lid, rim, cavity or insert), never a flat badge or tile; a branded prompt must state that geometry in the positive and reject the openings in its Avoid line. Ambient prompts must additionally preserve the one-or-two-cube, edge-biased, quiet-area contract and reject dense or hero-art composition. A further branded file requires a new recorded authorization. |
| Icon | Draw on the 32 grid at 1.5 stroke in `currentColor`; add to `icons/manifest.json`; run `node scripts/validate.mjs --only icons` |
| Script | Dependency-free, deterministic in what it produces (for a raster, its decoded pixels; encoded bytes may differ between Node versions), idempotent (an output that already matches is not rewritten), with a `--check` mode when it generates files |
| Open item closed | Update the row in `provenance/open-items.md`, add a `decisions/` record, update the tokens or documents that cited it |

## Pull request checklist

- [ ] `npm test` passes with zero errors.
- [ ] Generated files were rebuilt and are committed.
- [ ] New or changed tokens carry status, source and confidence; contrast pairs cover new text and indicator roles.
- [ ] Documents cite evidence and use the status vocabulary.
- [ ] Nothing private, no absolute paths, no temporary URLs, no credentials (the forbidden scan passes).
- [ ] Changelog entry under Unreleased.

## Style

Plain, direct prose; sentence case; no process narration in public documents; token names and file paths in backticks; numbers only when they change what the reader does.

## Review

Two reviews for token, brand and accessibility changes (one design, one engineering); one review for documentation fixes. `GOVERNANCE.md` defines the maintainer role; the current maintainers are the repository's collaborators with write access, kept in the repository settings rather than in a file.
