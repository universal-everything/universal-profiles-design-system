# Changelog

All notable changes to this repository. The format follows Keep a Changelog; versions follow `GOVERNANCE.md`.

## Unreleased

### Fixed

- React Native theme: `darkTheme` now carries dark-resolved `components` and `identicon` objects (`darkComponents`, `darkIdenticon`); previously it reused the light objects, so labels, usernames and button fills rendered light ink on dark surfaces. The validator reads the emitted file back and fails if any component-tier dark override is missing.
- Token metadata: a token's status may no longer outrank the weakest status in its alias chain (decision 0009). Fifty-one tokens that resolved through normalized or proposed values now declare that status with a note; theme-file metadata wins over base metadata, so every dark override is reported as proposed with the dark evidence as its source, and `tokens.dark.flat.json` reports component tokens with the weakest status along their dark chain.
- Icons: the 32-unit drawing grid is documented as a normalization, not an observed product rule; the shipped sets are drawn mostly on 24-unit boxes (R-35). No filled variants are claimed; the `globe` icon is labelled "Web" so it no longer collides with `network`.
- Validator: the generated TypeScript is now really parsed (types stripped with `node:module`, then parsed as ES modules); `node --check` had accepted any ES-module `.ts` file unread. The documented Node floor is 22.13 and CI runs 22.13, 22 and 24.
- Validator: every file must be a known text type or a PNG under `assets/`; session logs, environment files, documents, archives, databases and binaries elsewhere are rejected, binary content in text types is rejected, `.gitignore` must ignore `*.jsonl`, `*.pdf`, `.env` and `.env.*`, and eleven credential patterns (API keys, GitHub, AWS, Slack, Figma and Google tokens, private keys, JWTs, npm auth tokens, environment-style assignments, SSH keys) were added.
- Address Signature: `alpha` reads 0 to 1 as a fraction (1 is opaque) and 2 to 255 as an integer, so 1 no longer means 1/255; generator options (widths, heights, scale, angle, radius, ids, background colours, slice counts) are validated instead of interpolated; `sliceAddress` with a zero trailing count no longer re-appends the whole address; keccak input types are checked. Existing valid outputs are unchanged. Tests cover multi-block absorb, escaping, option validation, whitespace-only names and non-table identicon sizes.
- Provenance: the generated images record the `gpt-image 2.0` software agent, the embedded C2PA content credentials and watermark, a licence and a role label instead of a personal name; provenance records must carry a licence and may never mark a file as reconstructed (decision 0010).
- Documentation: DTCG format deviations, the typography longhands for tracked and uppercase roles, the maintainer wording, node-id citations, generic phrasing for confidential sources, the proposed status of the badge threshold, and the whitespace-trimming normalization of names.
- Validator: files git tracks are validated even when `.gitignore` matches them, so a forced `git add -f` of a session log, a PDF or an environment file no longer passes the gate; only untracked ignored local state is skipped. A `mutation` check plants such files in a throwaway repository, force-adds them and requires the forbidden check to reject exactly those while the untracked ignored copies beside them stay excluded. The gate needs git on the path.
- Documentation: the typography longhand guidance now names only longhands that exist per role. Every role emits a letter-spacing longhand, which the tracked roles (`type.label.caps`, `type.label.nav`, `type.deck.h1`, `type.deck.h2`, `type.deck.h3`) need; only `type.label.caps`, `type.currency.code` and `type.deck.caption` emit a text-transform longhand; the Tailwind preset carries tracking in its `fontSize` entries and no text-transform.
- Icons: `chevron-left` is labelled "Previous" so that it no longer shares "Back" with `arrow-left`, the icon the shipped headers use for back; every default accessible label must now be unique. No SVG changed.
- Provenance: the mobile externally-owned-account row's truncation (`0x` plus 4 characters, dots, 4 characters, then the `#EOA` label) is recorded as an observed variant (R-36); the normalized presets 6 and 4 and 10 and 8 are unchanged.
- Tokens: every record in `tokens.flat.json` and `tokens.dark.flat.json` carries `statusVia`, the token whose weaker status a dark record inherited through its alias chain (null when the status is the token's own, and throughout the light file). No value changed.

## 0.1.0 (2026-09-14)

Initial public structure.

### Added

- DTCG token sources for primitives, semantics, components and the dark theme, with status, source, confidence and open-item metadata on every token; generated CSS, TypeScript, React Native, flat and nested JSON, Tailwind overlay preset and design-tool payloads.
- The UP accent family anchored on the brand board's labelled periwinkle swatch (hue 229, saturation 78), with the board values recorded as observed tokens and roles kept as proposals (OPEN-01).
- Deck typography roles (proposed, OPEN-13).
- `packages/address-signature`: checksum, gradient stops and recipes, suffix, display name, truncation, identicon reimplementation verified against the products' library, aura and share-card SVG generators, with tests and fixtures.
- Procedural address-gradient examples and recipes with provenance.
- Foundations, brand, fifteen component specifications, twelve patterns including the obsolete register, icon rules with a manifest and 53 original starter icons, imagery guide with eleven briefs and safe zones, accessibility rules and checklist, adoption guides, migration checklist, gap register, provenance registers, reconciliation register, eight decision records.
- Four original generated images (hero light and dark, title backgrounds light and dark) with verified provenance.
- Web and React Native examples, marketing recipes, agent playbooks.
- Validation gate (`npm test`): JSON, tokens, build drift, contrast, documents and links, assets and provenance, forbidden content, sources and open items, icons, examples, package hygiene, package tests.
- Governance, contributing, security, code of conduct, licence, trademark and third-party notices.
