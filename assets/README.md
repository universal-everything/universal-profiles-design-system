# Asset library

Status: proposed for the generated backgrounds, heroes and previews; observed for the app screens and the shipped onboarding art; procedural examples regenerate from their script

Every raster and vector under this directory is listed, with its hash, in the `PROVENANCE.json` of its directory, and `npm test` re-verifies hashes, dimensions, pixel contracts and the publication boundary at every run. No mark file lives here: the logos folder is empty by design. The twelve slide backgrounds depict the official UP! box inside generated scenes under the owner's recorded authorization (`../decisions/0012-branded-slide-backgrounds.md`); the mark on them is not licensed for extraction or standalone reuse.

## Directories

| Directory | Files | What | Status | Read |
|---|---|---|---|---|
| `generated/backgrounds/slides-v2/` | 12 PNG, 6 families, light and dark | Presentation backgrounds, 16:9, generated with recorded prompts; each shows one or more official UP! boxes (owner-authorized depiction, decision 0012; the mark stays unlicensed) | proposed (the depicted box: observed reference) | [generated/backgrounds/README.md](generated/backgrounds/README.md) |
| `generated/backgrounds/` | 2 PNG | The quiet title-slide pair (IB-10) | proposed | same |
| `generated/heroes/` | 2 PNG | The profile-card hero, light and dark (IB-02) | proposed | [../imagery/README.md](../imagery/README.md) |
| `screenshots/mobile-app/` | 5 PNG, transparent | Design-file exports of app screens, owner-authorized | observed (three exploratory) | [screenshots/mobile-app/README.md](screenshots/mobile-app/README.md) |
| `slides/onboarding/` | 4 PNG, transparent | The shipped onboarding illustrations, copied from the mobile bundle | observed | [slides/README.md](slides/README.md) |
| `slides/previews/` | 4 PNG | App showcases and background contact sheets composed from the files above (the sheets by `scripts/compose-previews.mjs`; they inherit the mark restriction of the backgrounds) | proposed | [slides/README.md](slides/README.md) |
| `backgrounds/address-gradient/` | 21 SVG | Procedural address-gradient examples and the recipe file (IB-01) | procedural | [../imagery/README.md](../imagery/README.md) |
| `logos/` | none | Why no mark files exist and how to obtain official ones | | [logos/README.md](logos/README.md) |

Counts: 16 generated images, 5 app screens, 4 onboarding illustrations, 4 previews, 21 procedural examples; 5 provenance records.

## Picking a file

- A slide or a social title: a background from `generated/backgrounds/` (quiet title pair) or `generated/backgrounds/slides-v2/` (six families, each showing one or more official UP! boxes), light for ink copy, dark for white copy; safe zones in the backgrounds README. Use a branded background whole; never crop a box out of it to stand in for the mark.
- A README, website or deck opener: `generated/heroes/profile-passport-light.png` or the dark file, copy in the left 42 percent.
- Showing the app: a screen from `screenshots/mobile-app/` composed over a background (the showcases in `slides/previews/` are worked examples), or the shipped onboarding art from `slides/onboarding/`.
- A background that belongs to one profile: the procedural gradient or aura from `packages/address-signature`, examples in `backgrounds/address-gradient/`.

## Adding a file

1. Follow a brief in `../imagery/briefs.md` (backgrounds: IB-12) or the method rules below.
2. Put the file in the directory whose record matches its method; do not mix generated, exported and copied files in one record.
3. Add an entry to that directory's `PROVENANCE.json`: path, `sha256`, `dimensions`, status, and per method the prompt (generated), the node id (design-file export), the source path and commit (shipped copy) or the inputs and placements (composition). `node scripts/inspect-png.mjs <file>` prints the hash, dimensions, colour type, alpha facts, content credentials and safe-zone measurements to paste from. A generated file that shows a mark needs a recorded owner authorization and a decision record first (decision 0012 covers the twelve pinned slide backgrounds only), its reference inputs cited by node id and hash, and an `embeddedMarks` block.
4. Run `node scripts/validate.mjs --only assets`, `--only rasters` and, for the slide backgrounds and contact sheets, `--only branded` (extend `scripts/validate/branded-backgrounds.json` when a pinned file changes), then `npm test`.

Methods the validator accepts: `OpenAI built-in image generation` or `ai-generated` (prompt required, content credentials checked when the record declares them), `procedural` (script and inputs), `design-file export` (source key, node id, status, authorization), `shipped-asset copy` (source key, repository and commit, source path, status, authorization), `composition` (inputs that are themselves recorded assets; the validator measures every placement).

## Publication boundary

Public by design: the generated images (Apache-2.0 for the scene pixels per `../LICENSES/GENERATED-IMAGES.md`; the UP! mark depicted in the twelve slide backgrounds is not licensed for extraction or standalone reuse, `../decisions/0012-branded-slide-backgrounds.md`), the procedural examples, and the two owner-authorized exceptions recorded in `../decisions/0011-owner-authorized-product-visuals.md` (the five app screens and the four onboarding illustrations, rights per their records). Still excluded: mark files and masters (including the UP! box reference the generator followed, cited by node id and hash only), board renders, private documents and screenshots of private files, temporary design-tool URLs, product screens or bundle files without an owner authorization on record. `node scripts/validate.mjs --only forbidden` scans for the excluded material; `--only branded` pins the branded backgrounds.
