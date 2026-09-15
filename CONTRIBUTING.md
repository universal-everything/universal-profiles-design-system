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
| Asset | Follow a brief in `imagery/briefs.md`; add or update the directory's `PROVENANCE.json` (method, tool or model, prompt, hash, dimensions, licence); no rasters with unrecorded rights |
| Icon | Draw on the 32 grid at 1.5 stroke in `currentColor`; add to `icons/manifest.json`; run `node scripts/validate.mjs --only icons` |
| Script | Dependency-free, deterministic, with a `--check` mode when it generates files |
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
