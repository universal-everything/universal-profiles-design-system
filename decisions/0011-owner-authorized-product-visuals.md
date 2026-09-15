# 0011 Owner-authorized product visuals in the public repository

Status: accepted
Date: 2026-09-15
Closes: none (OPEN-04 narrowed to the rights statement; the publication decision for the listed files is recorded here)

## Context

The publication boundary (`../provenance/README.md`) excluded every render, export or screenshot from design files and every bundle raster whose rights were unrecorded, so the repository showed the product only through generated imagery. On 2026-09-15 the product owner asked, in an authenticated private Discord conversation, for the staged presentation visuals to be visible in the repository and for many more background variations: twelve generated slide backgrounds, five transparent design-file exports of app screens (Mobile app Updates, file key `gKNmK9MxvHWhewBvYe99Vo`, nodes 841:17486, 841:17668, 672:24756, 672:29382 and 672:30132), the four shipped onboarding illustrations and four preview compositions.

## Decision

1. The five app screens and the four onboarding illustrations are admitted as named exceptions to the boundary, on the owner's explicit request, with their own provenance records (`assets/screenshots/mobile-app/PROVENANCE.json`, `assets/slides/onboarding/PROVENANCE.json`) that state the authorization, the source (file key and node ids; repository, commit `8d8f9f8c` and bundle path), the status and the rights position. No other export, render, screenshot or bundle file is admitted by this decision; each further one needs its own recorded authorization.
2. Status: the app home and in-app browser screens are observed current design-file screens; the paywall, preparing and success screens are observed but exploratory (an in-app-purchase exploration that predates the September 2026 redesign), never production authority; the onboarding art is observed shipped product art, not new work and not the source for new illustration (IB-04 stays the proposed refresh).
3. Rights: the screens stay the product owner's; the onboarding art carries the mobile repository's Apache License 2.0 notice (copyright 2023 LUKSO Blockchain GmbH) with no separate notice on the files and no recorded illustrator or generator. Neither set joins this repository's Apache-2.0 grant, no licence is invented, and OPEN-04 remains open for the formal rights statement.
4. The twelve backgrounds join the generated set as proposed assets under the existing record, with the staged prompt file kept byte-identical to the provenance entries; new variations follow IB-12.
5. The validator proves the boundary rather than trusting it: provenance methods `design-file export` and `shipped-asset copy` require a source key, a status and an authorization; `composition` previews must match their declared inputs pixel by pixel; the generated backgrounds must meet the slide contract; the forbidden scan still rejects design-file URLs, temporary asset URLs, private paths and credentials.

## Consequences

- `imagery/README.md`, `provenance/README.md`, `LICENSES/README.md`, `LICENSES/THIRD-PARTY.md` and `provenance/sources.json` no longer say that the onboarding art is not republished; they cite this record. Reconciliation entries R-37 and R-38 log the change.
- The README shows the backgrounds, screens, onboarding art and previews; `assets/README.md` indexes them.
- Product screens in the repository are design-file exports, not device captures; the shipped code remains the highest authority, and any disagreement between a screen and a rule is resolved in favour of the code and logged.

## Evidence

The owner's request of 2026-09-15 (authenticated private Discord conversation; cited by date, not reproduced); SRC-FIGMA-MOBILE-UPDATES (file key and the five node ids); SRC-MOBILE-APP (commit `8d8f9f8c`, `assets/image/get-started-1.png` to `get-started-4.png`, hashes identical to the copies here; repository LICENSE); SRC-GENERATED-IMAGES (prompts, hashes and content credentials of the twelve backgrounds).
