# Asset library

Status: proposed for the generated backgrounds, heroes and previews; observed for the app screens and the shipped onboarding art; procedural examples regenerate from their script

Every raster and vector under this directory is listed, with its hash, in the `PROVENANCE.json` of its directory, and `npm test` re-verifies hashes, dimensions, pixel contracts and the publication boundary at every run. No mark file lives here: the logos folder is empty by design. Twenty-four slide backgrounds depict the official UP! container cube, solid, closed and sealed: twelve expressive layered scenes under decision 0012 (`../decisions/0012-branded-slide-backgrounds.md`) and decision 0013 (`../decisions/0013-container-cube-slide-backgrounds.md`), plus twelve additive ambient scenes under decision 0014. These are set-specific owner-authorized depictions, not mark files or approved brand imagery; the mark on them is not licensed for extraction or standalone reuse.

## Directories

| Directory | Files | What | Status | Read |
|---|---|---|---|---|
| `generated/backgrounds/slides-v2/` | 12 PNG, 6 families, light and dark | Presentation backgrounds, 16:9, generated with recorded prompts in the layered language of the onboarding art; each shows one or more official UP! container cubes, solid, closed and sealed (owner-authorized depiction, decisions 0012 and 0013; the mark stays unlicensed) | proposed (the depicted cube: an observed mark) | [generated/backgrounds/README.md](generated/backgrounds/README.md) |
| `generated/backgrounds/slides-v3-ambient/` | 12 PNG, 6 families, light and dark | Quiet, subordinate presentation infrastructure for body copy, charts and transparent screens; edge-biased scenes with one or two official closed UP! container cubes and at least 65 percent visually quiet canvas by visual review plus the measured safe-zone proxy (owner-authorized depiction, decision 0014; the mark stays unlicensed) | additive and proposed (the depicted cube: an observed mark) | [generated/backgrounds/README.md](generated/backgrounds/README.md) |
| `generated/backgrounds/` | 2 PNG | The quiet title-slide pair (IB-10) | proposed | same |
| `generated/heroes/` | 2 PNG | The profile-card hero, light and dark (IB-02) | proposed | [../imagery/README.md](../imagery/README.md) |
| `screenshots/mobile-app/` | 5 PNG, transparent | Design-file exports of app screens, owner-authorized | observed (three exploratory) | [screenshots/mobile-app/README.md](screenshots/mobile-app/README.md) |
| `slides/onboarding/` | 4 PNG, transparent | The shipped onboarding illustrations, copied from the mobile bundle | observed | [slides/README.md](slides/README.md) |
| `slides/previews/` | 6 PNG | App showcases plus expressive and ambient background contact sheets composed from the files above (the sheets by `scripts/compose-previews.mjs`; they inherit the mark restriction of the backgrounds) | proposed | [slides/README.md](slides/README.md) |
| `backgrounds/address-gradient/` | 21 SVG | Procedural address-gradient examples and the recipe file (IB-01) | procedural | [../imagery/README.md](../imagery/README.md) |
| `logos/` | none | Why no mark files exist and how to obtain official ones | | [logos/README.md](logos/README.md) |

Counts: 28 generated images (26 backgrounds including the title pair, plus 2 heroes), 5 app screens, 4 onboarding illustrations, 6 previews, 21 procedural examples; 5 provenance records.

## Picking a file

- A title, campaign, hero, section divider or closing slide: the quiet title pair or an expressive `generated/backgrounds/slides-v2/` family. A body-copy, chart or transparent-screen slide: `generated/backgrounds/slides-v3-ambient/`. Choose light for ink copy and dark for white copy, keep copy inside the measured family rectangle in the backgrounds README, and use every branded background whole; never crop a cube out of it to stand in for the mark.
- A README, website or deck opener: `generated/heroes/profile-passport-light.png` or the dark file, copy in the left 42 percent.
- Showing the app: a screen from `screenshots/mobile-app/` composed over a background (the showcases in `slides/previews/` are worked examples), or the shipped onboarding art from `slides/onboarding/`.
- A background that belongs to one profile: the procedural gradient or aura from `packages/address-signature`, examples in `backgrounds/address-gradient/`.

## Adding a file

1. Follow a brief in `../imagery/briefs.md` (expressive backgrounds: IB-12; ambient backgrounds: the separate IB-13) or the method rules below.
2. Put the file in the directory whose record matches its method; do not mix generated, exported and copied files in one record.
3. Add an entry to that directory's `PROVENANCE.json`: path, `sha256`, `dimensions`, status, and per method the prompt (generated), the node id (design-file export), the source path and commit (shipped copy) or the inputs and placements (composition). `node scripts/inspect-png.mjs <file>` prints the hash, dimensions, colour type, alpha facts, content credentials and safe-zone measurements to paste from. A generated file that shows a mark needs a recorded owner authorization and a decision record first: decisions 0012 and 0013 cover exactly the twelve pinned expressive scenes and their two overview sheets, while decision 0014 covers exactly the twelve pinned ambient scenes and their two overview sheets. Record reference inputs by public repository path and hash, or a superseded unpublished input by hash-only lineage, and add an `embeddedMarks` block.
4. Run `node scripts/validate.mjs --only assets`, `--only rasters` and the set-specific lock: `--only branded` for slides-v2 or `--only ambient` for slides-v3-ambient. The ambient lock is additive and does not broaden or weaken the branded lock. Then run `npm test`.

Methods the validator accepts: `OpenAI built-in image generation` or `ai-generated` (prompt required, content credentials checked when the record declares them), `procedural` (script and inputs), `design-file export` (source key, node id, status, authorization), `shipped-asset copy` (source key, repository and commit, source path, status, authorization), `composition` (inputs that are themselves recorded assets; the validator measures every placement).

## Publication boundary

Public by design: the generated images (Apache-2.0 for the scene pixels per `../LICENSES/GENERATED-IMAGES.md`; the UP! mark depicted in the twenty-four family backgrounds is not licensed for extraction or standalone reuse under decisions 0012, 0013 and 0014), the procedural examples, and the two owner-authorized exceptions recorded in `../decisions/0011-owner-authorized-product-visuals.md` (the five app screens and the four onboarding illustrations, rights per their records). Decisions 0012 and 0013 authorize only the twelve expressive scenes and their two overview sheets; decision 0014 authorizes only the twelve ambient scenes and their two overview sheets. None grants extraction or a trademark licence. Still excluded: mark files and masters (including the superseded board exports behind the earlier depictions of the UP! container cube, cited by file key, node id and hash only), board renders, private documents and screenshots of private files, temporary design-tool URLs, product screens or bundle files without an owner authorization on record. `node scripts/validate.mjs --only forbidden` scans for the excluded material; `--only branded` pins slides-v2 and `--only ambient` separately pins slides-v3-ambient.
