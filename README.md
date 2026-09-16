# Universal Profiles design system

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/generated/heroes/profile-passport-dark.png">
  <img alt="A frosted-glass profile card with soft periwinkle objects tumbling through its cover, a circular avatar breaking the cover's edge and a small satellite badge, with ghosted cards fanning behind it" src="assets/generated/heroes/profile-passport-light.png" width="100%">
</picture>

The Universal Profiles product layer on top of the LUKSO base layer: tokens, foundations, component and pattern specifications, the Address Signature package, imagery and a validation gate that runs on Node alone. Built for product teams and for coding agents, with every value traced to evidence and labelled with its status.

Universal Profiles look like a calm, precise passport for the new web: a neutral canvas, Inter for words and PT Mono for anything that belongs to the chain, one periwinkle accent used as a frame, and at the centre of every surface the profile card carrying its Address Signature: the identicon badge, the `#XXXX` suffix and the gradient born from the address itself.

## Visual assets

Backgrounds for decks and titles, transparent app screens, the shipped onboarding art and ready-made previews, every file with a verified provenance record; the index is `assets/README.md`.

**Slide backgrounds** (proposed; two six-family light/dark sets plus the title pair; safe zones, crops and usage in [assets/generated/backgrounds/README.md](assets/generated/backgrounds/README.md)). Use the expressive `slides-v2` scenes for campaign, hero, section-divider and closing slides; use the quieter `slides-v3-ambient` scenes behind body copy, charts and transparent product screens. All twenty-four family files show one or more official UP! container cubes under the set-specific owner authorizations ([decision 0012](decisions/0012-branded-slide-backgrounds.md), corrected by [decision 0013](decisions/0013-container-cube-slide-backgrounds.md), for the twelve expressive files and their two overview sheets; [decision 0014](decisions/0014-ambient-slide-backgrounds.md) for exactly the twelve ambient files and their two overview sheets). The Universal Profile is a container, but the cube that stands for it is solid, closed and sealed, never a flat badge and never something that opens; the UP! mark remains a trademark of its owner and may not be cropped out or reused as a mark ([LICENSES/GENERATED-IMAGES.md](LICENSES/GENERATED-IMAGES.md)). Expressive set:

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/slides/previews/backgrounds-dark-overview.png">
  <img alt="Contact sheet of the six branded slide backgrounds, each a layered identity collage with one or more solid closed UP! container cubes: address ribbons, glass profile stack, identity network, identity orbits, iridescent horizon and modular constellation" src="assets/slides/previews/backgrounds-light-overview.png" width="100%">
</picture>

Ambient set:

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/slides/previews/ambient-backgrounds-dark-overview.png">
  <img alt="Contact sheet of the six ambient slide backgrounds, each a quiet edge-biased scene with one or two solid closed UP! container cubes: distant horizon, mist orbit left, mist orbit right, peripheral frame, quiet corner and quiet corner left" src="assets/slides/previews/ambient-backgrounds-light-overview.png" width="100%">
</picture>

**App screens** (observed design-file exports with transparent exteriors; the paywall and deployment screens are an exploration, not shipped behaviour; [assets/screenshots/mobile-app/README.md](assets/screenshots/mobile-app/README.md)):

<p>
  <img src="assets/screenshots/mobile-app/app-home.png" width="156" alt="App home screen of the Universal Profiles app">
  <img src="assets/screenshots/mobile-app/in-app-browser.png" width="156" alt="In-app browser screen">
  <img src="assets/screenshots/mobile-app/gas-paywall.png" width="156" alt="Paywall step of an in-app-purchase exploration">
  <img src="assets/screenshots/mobile-app/deployment-preparing.png" width="156" alt="Preparing step of the deployment exploration">
  <img src="assets/screenshots/mobile-app/deployment-success.png" width="156" alt="Success step of the deployment exploration">
</p>

**Onboarding art** (observed shipped illustrations, copied from the mobile bundle at the audited commit; [assets/slides/README.md](assets/slides/README.md)):

<p>
  <img src="assets/slides/onboarding/get-started-1.png" width="196" alt="First get-started illustration of the shipped app">
  <img src="assets/slides/onboarding/get-started-2.png" width="196" alt="Second get-started illustration of the shipped app">
  <img src="assets/slides/onboarding/get-started-3.png" width="196" alt="Third get-started illustration of the shipped app">
  <img src="assets/slides/onboarding/get-started-4.png" width="196" alt="Fourth get-started illustration of the shipped app">
</p>

**Slide preview** (a composition of the screens over the title background, with the recipe in the same README):

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/slides/previews/app-showcase-dark.png">
  <img alt="Three app screens, home, in-app browser and deployment success, over the title background, with the left half empty for copy" src="assets/slides/previews/app-showcase-light.png" width="100%">
</picture>

## Status legend

| Status | Meaning |
|---|---|
| observed | Read from shipped code, approved collateral or a cited design file, unchanged |
| normalized | Derived from observed values by reconciling, rounding, renaming or extending a scale; derivation recorded |
| proposed | Introduced by this system; not in production and not formally approved |
| obsolete | Exists in evidence but must not be used in new work |
| open | Placeholder awaiting a decision; carries an `OPEN-nn` id in `provenance/open-items.md` |

Every token carries a status, a source key and a confidence; every document carries a `Status:` line and an evidence section.

## Source hierarchy

1. Current shipped mobile and web code and approved recent production behaviour.
2. Direct Universal Profile Board evidence, classified per node.
3. Focused current mobile design-file nodes where they align with shipped behaviour.
4. Approved public and campaign collateral.
5. Parent-brand ideation and older exploratory boards as lineage only.

Contradictions are never averaged; the newer authoritative source wins and the choice is logged in `provenance/reconciliation.md`. Private documents, renders, screenshots and temporary URLs are excluded from the repository and the validator scans for them.

## Quick start

Requires Node 22.13 or newer (the gate parses the generated TypeScript with the type stripper that arrived in 22.13) and git on the path (the gate reads the index so that files tracked despite `.gitignore` are validated, and proves in a throwaway repository that a forced add of a private file is rejected). Nothing to install.

```sh
npm test                                  # the full gate (tokens, build drift, contrast, docs, assets, rasters, separate branded and ambient locks, forbidden content, sources, icons, examples and package tests)
node scripts/build-tokens.mjs             # regenerate tokens/build after editing tokens/src
node scripts/contrast-report.mjs          # regenerate accessibility/contrast-report.md
node scripts/generate-address-backgrounds.mjs   # regenerate the example backgrounds and share cards
node scripts/compose-previews.mjs         # recompose the expressive and ambient contact sheets (--check to compare)
node scripts/inspect-png.mjs assets/generated/backgrounds/title-light.png   # facts about a raster (hash, size, alpha, content credentials, safe-zone luminance)
```

Consume the tokens: `tokens/build/css/variables.css` on the web (plus `tokens/build/tailwind/preset.cjs` after the LUKSO preset), `tokens/build/react-native/theme.ts` in React Native, `tokens/build/json/tokens.flat.json` for tools. Consume the signature helpers from `packages/address-signature`. Guides: `adoption/web.md`, `adoption/react-native.md`.

## Map

| Path | Content |
|---|---|
| `CLAUDE.md`, `AGENTS.md` | The implementation contract for coding agents |
| `tokens/` | Token sources (DTCG JSON), contrast pairs, generated CSS, TypeScript, React Native, JSON, Tailwind preset and design-tool payloads |
| `foundations/` | Principles, colour, typography, spacing, shape, elevation and glass, motion, dark mode, responsive, the Address Signature, voice |
| `brand/` | Marks and lockups (observed, no masters), narrative, misuse, the relationship to LUKSO |
| `components/` | Fifteen specifications: button, input, controls, tag, list item, card, profile card (the UP Box), identicon, glass surfaces, overlays, navigation, app tile, QR and share cards, empty and error states, skeleton |
| `patterns/` | Onboarding, creation and recovery, permissions, signing, network context, wallet, apps and browser, discovery, empty and error flows, marketing layouts, content voice, the obsolete register |
| `packages/address-signature/` | Dependency-free helpers: checksum, gradient, suffix, display name, truncation, identicon, aura and share-card SVG, with tests and parity fixtures |
| `icons/` | The icon rules, a manifest and 53 original starter icons |
| `imagery/` | The two imagery families, thirteen production briefs, framing and safe zones |
| `assets/` | The asset library: twenty-eight generated images (twenty-six backgrounds including the title pair, plus two heroes), five transparent app screens, four shipped onboarding illustrations, six previews, procedural address-gradient examples and recipes, one provenance record per directory, the logos note; the twenty-four family backgrounds depict the official UP! container cube under decisions 0012, 0013 and 0014 |
| `accessibility/` | Rules, checklist and the generated contrast report |
| `adoption/` | Web and React Native guides, migration checklist, gap register |
| `provenance/` | Source register, open items, reconciliation register, provenance schema |
| `decisions/` | Decision records |
| `examples/` | Web and React Native examples, marketing recipes, agent playbooks |
| `scripts/` | Build, report, generator, the PNG inspector, the contact-sheet composer and the validation gate (with its dependency-free PNG reader and writer, separate pinned expressive and ambient background selections and tests) |

## For Claude Code and other agents

Read `CLAUDE.md` first. In short: change values only in `tokens/src` and rebuild; render every profile with the Address Signature helpers; keep magenta for LUKSO network and LYX roles; never invent a mark or extract the UP! container cube from either background set; keep the expressive and ambient contracts separate; meet the accessibility gates; record provenance for every asset; pick backgrounds and screens from `assets/README.md` and keep copy inside the recorded safe zones; run `npm test` before finishing. `AGENTS.md` points other agents to the same contract.

## Governance

Versioning, review and release rules are in `GOVERNANCE.md`; contributions in `CONTRIBUTING.md`; licensing in `LICENSE`, `TRADEMARKS.md` and `LICENSES/`. Open decisions that need an owner are listed in `provenance/open-items.md`.
