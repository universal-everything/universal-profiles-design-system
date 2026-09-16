# 0014 A separate ambient slide-background family for copy-heavy presentation work

Status: accepted
Date: 2026-09-16
Closes: none (OPEN-03 and OPEN-04 stay open; this record authorizes publication and use of the named files, not a mark file, brand approval or a trademark licence)

## Context

The twelve `slides-v2` backgrounds accepted under decisions 0012 and 0013 are expressive campaign scenes: dense, layered identity collages built around several solid closed UP! container cubes. They remain the presentation system's hero and section-divider imagery.

On 2026-09-16 the product owner asked, in an authenticated private conversation (cited by date, not reproduced), for an additional lower-contrast family with much larger quiet areas for headings, body copy, charts and transparent app screens. Treating that request as another variation of IB-12 would weaken the deliberate density of `slides-v2`, so the new work needs its own brief, set, measurements and validator.

## Decision

1. **Additive role.** Add `assets/generated/backgrounds/slides-v3-ambient/` as a second, proposed presentation-background set under brief IB-13. It contains twelve opaque 1672 by 941 PNGs in six light/dark pairs: `quiet-corner-light.png`, `quiet-corner-dark.png`, `quiet-corner-left-light.png`, `quiet-corner-left-dark.png`, `distant-horizon-light.png`, `distant-horizon-dark.png`, `peripheral-frame-light.png`, `peripheral-frame-dark.png`, `mist-orbit-right-light.png`, `mist-orbit-right-dark.png`, `mist-orbit-left-light.png` and `mist-orbit-left-dark.png`. It does not replace, revise or weaken `slides-v2`: the earlier set remains expressive hero and campaign imagery; this set is subordinate presentation infrastructure for copy-heavy slides.
2. **Ambient contract.** Every file shows one or two UP! container cubes, never more than two, for twenty cubes across the set. The cubes are solid, closed and sealed monolithic rounded dice with smooth continuous top and side planes and the exact white UP! once on the front; no opening, slot, lid, rim, cavity, recess or insert, and nothing enters or emerges. Cubes are edge-biased and never centred; their aggregate area is at most 16 percent, supporting decoration at most 25 percent, and at least 65 percent of the canvas is visually quiet. Subjects remain outside the copy-safe rectangle with at least 4 percent separation. No people, faces, footwear, rockets, third-party marks, uncontrolled text, watermarks, neon or cyberpunk lighting, dense collage or hero-art composition is admitted.
3. **Measured safe zones.** One rectangle is shared by the light and dark file of each family. The strict IB-13 thresholds are mean luminance at least 220 in a light file, at most 36 in a dark file, and luminance deviation at most 12 in either register. The selected pixels pass without reducing the proposed zones:

   | Family | Safe zone (x, y, width, height) | Light mean / deviation | Dark mean / deviation | Cubes per file |
   |---|---|---:|---:|---:|
   | quiet-corner | `0, 0, 0.68, 1` | 245.3 / 6.2 | 13.4 / 11.0 | 1 |
   | quiet-corner-left | `0.32, 0, 0.68, 1` | 244.4 / 7.1 | 12.4 / 10.3 | 1 |
   | distant-horizon | `0, 0, 1, 0.72` | 242.8 / 10.6 | 17.5 / 8.6 | 2 |
   | peripheral-frame | `0.2, 0.12, 0.6, 0.76` | 251.9 / 3.0 | 21.5 / 9.8 | 2 |
   | mist-orbit-right | `0, 0, 0.64, 1` | 241.9 / 7.7 | 11.6 / 7.3 | 2 |
   | mist-orbit-left | `0.36, 0, 0.64, 1` | 239.9 / 9.0 | 12.7 / 5.0 | 2 |

   Luminance and deviation are measured from decoded pixels. Cube geometry, cube and decorative area, quiet-area coverage, off-centre placement, separation and the absence of prohibited subjects or marks are visual-review facts, not claims of automated segmentation or mark recognition.
4. **Prompts, bytes and lineage.** The twelve delivered PNG bytes and their C2PA manifests stay intact. `PROMPTS.source.json`, `assets/generated/PROVENANCE.json` and `scripts/validate/ambient-backgrounds.json` pin every verbatim prompt, generation id, SHA-256 hash, C2PA time stamp, reference input, cube count and safe-zone measurement. Repository inputs are cited by repository-relative path and hash. One unpublished superseded mist-orbit-right dark draft is retained only as SHA-256 `8c95f2226f936d07fde166ff482571dad62cf3134e6726d03c0b0796817d6319` in the dark mist-orbit reference lineage; it has no public path, is not a repository asset and is not licensed or published by this decision. No private design export or local path is recorded.
5. **Exact authorization scope.** The owner authorizes publication and use of exactly the twelve files named in clause 1 and the two deterministic overview sheets `ambient-backgrounds-light-overview.png` and `ambient-backgrounds-dark-overview.png`. The authorization admits the official UP! container cube inside these scenes; it is not blanket authorization for a further image, variation or set. A new branded file still needs its own recorded owner authorization and decision.
6. **Rights.** The repository licence covers the generated scene pixels only, to the extent copyright subsists in them. The UP! mark remains its owner's trademark and is not licensed for extraction or standalone reuse. A cube or the mark may not be cropped out, traced, vectorised, isolated, altered, used as a logo, icon, sticker, lockup or app icon, or presented as an official mark file. The two overview sheets inherit the same restriction. Decision 0010 remains the default rule outside the exact scopes of decisions 0012, 0013 and this record.
7. **Status and use.** The files are proposed imagery, not approved brand imagery. Light files take ink copy and dark files take white copy, always inside the recorded safe zone. Atmospheric haze and low-contrast translucent supporting objects are permitted; the cube remains opaque and recognizable. The set is for slide backgrounds, not for extracting marks or replacing official lockups.
8. **Independent validation.** `node scripts/validate.mjs --only ambient` uses a separate fixture and tests. It pins the twelve files and two sheets, their prompts, ids, hashes, C2PA facts, dimensions, pairs, references, cube counts, safe zones and documentation; applies the closed-cube polarity guards without changing the slides-v2 fixture; rejects unpinned files or edits, more than two cubes, an insufficient quiet area, safe-zone drift, subjects in the safe zone, third-party marks, people, faces, footwear, rockets, dense or hero-art requests, openings, inserts, flat badges and mark-extraction language; and recomposes the overview pixels deterministically. `node scripts/validate.mjs --only branded` continues to prove the unchanged slides-v2 selection.

## Consequences

- IB-13 describes the ambient family independently of dense IB-12. Marketing guidance selects `slides-v2` for expressive campaign and section-divider work and `slides-v3-ambient` for content, chart and screenshot slides.
- `assets/generated/PROVENANCE.json` now records 28 generated images: the hero pair, title pair, twelve slides-v2 files and twelve ambient files. The asset library has four generated-background overview sheets and six previews in total.
- Reconciliation entry R-43 records why a new family and validator were chosen instead of changing slides-v2. OPEN-03 and OPEN-04 remain open: these scenes are not mark masters and do not settle the formal trademark policy.

## Evidence

The product owner's request of 2026-09-16 (authenticated private conversation; cited by date, not reproduced); SRC-GENERATED-IMAGES (the twelve selected PNGs, exact prompts, generation ids, hashes, C2PA time stamps, references, twenty cube depictions by visual review and measured safe zones); decisions 0010, 0012 and 0013.
