# AGENTS.md

This repository's contract for coding agents is `CLAUDE.md`. Read it in full before making changes; it is the single set of rules for every agent, whatever tool runs it. This file only adds pointers so that nothing here can drift from that contract.

- Rules, precedence, non-negotiables, component selection, accessibility gates, token usage, the Address Signature algorithm and the verification commands: `CLAUDE.md`.
- Where values live: `tokens/src` (edit) and `tokens/build` (generated, committed).
- Where evidence and open decisions live: `provenance/sources.json`, `provenance/open-items.md`, `provenance/reconciliation.md`.
- What must never enter the repository: private documents, screenshots of private files, temporary design-tool URLs, credentials, financing material, invented marks. `node scripts/validate.mjs --only forbidden` enforces the list in `scripts/validate/forbidden.json`.
- Definition of done for any change: `npm test` passes with zero errors and the change description lists the commands run.
- Playbooks with expected outcomes: `examples/agent-playbooks/README.md`.
