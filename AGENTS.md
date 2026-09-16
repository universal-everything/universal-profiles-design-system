# AGENTS.md

This repository's contract for coding agents is `CLAUDE.md`. Read it in full before making changes; it is the single set of rules for every agent, whatever tool runs it. This file only adds pointers so that nothing here can drift from that contract.

- Rules, precedence, non-negotiables, component selection, accessibility gates, token usage, the Address Signature algorithm and the verification commands: `CLAUDE.md`.
- Where values live: `tokens/src` (edit) and `tokens/build` (generated, committed).
- Where evidence and open decisions live: `provenance/sources.json`, `provenance/open-items.md`, `provenance/reconciliation.md`.
- Where visual assets live and how to pick one: `assets/README.md` (slide backgrounds with safe zones, transparent app screens, shipped onboarding art, previews), every file with a provenance record the gate verifies.
- What must never enter the repository: private documents, screenshots of private files, temporary design-tool URLs, credentials, financing material, invented marks, mark files or masters, product visuals without a recorded owner authorization. `--only forbidden` enforces the list; `--only assets` and `--only rasters` prove provenance and pixel contracts. `--only branded` pins the twelve expressive slides-v2 scenes, including their four existing edits and lineage, under decision 0012 and decision 0013. The separate `--only ambient` lock pins the additive twelve slides-v3-ambient scenes and two overview sheets under decision 0014, with at most two cubes and stricter safe zones, without weakening slides-v2. Every container cube is solid, closed and sealed, a monolithic rounded die with smooth continuous top and side planes and the white UP! once on the front, never a flat badge, tile or opening. No decision grants an extraction or trademark licence; never crop out or reuse the mark.
- Definition of done for any change: `npm test` passes with zero errors and the change description lists the commands run.
- Playbooks with expected outcomes: `examples/agent-playbooks/README.md`.
