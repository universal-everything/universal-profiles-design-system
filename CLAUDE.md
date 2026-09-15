# CLAUDE.md: Universal Profiles design system

You are working in the Universal Profiles design-system repository, or in a product repository that consumes it. Follow these rules exactly. Do not invent brand decisions; when the evidence is missing, the answer is an open item, not a guess.

## What this is

- The Universal Profiles product layer on top of the LUKSO base layer (`@lukso/web-components`). Tokens live in `tokens/src` (DTCG JSON); generated outputs in `tokens/build` are committed and must be rebuilt with `node scripts/build-tokens.mjs` in the same change as any token edit.
- Source of truth order inside the repository: (1) `tokens/src`, (2) `foundations/`, (3) `components/`, (4) `patterns/`, (5) `brand/`. If two disagree, fix the lower one and say so.
- Evidence hierarchy behind the repository: shipped mobile and web code first, then the Universal Profile Board evidence classified per node, then focused current mobile design-file nodes, then approved public collateral, then parent-brand ideation as lineage only. Design boards are evidence, not sources: where a board disagrees with shipped code, code wins and the disagreement is logged in `provenance/reconciliation.md`.

## Status discipline

Every token and guideline carries one of: observed, normalized, proposed, obsolete, open. Never describe a proposed value as approved. Never promote a status without evidence and a record in `decisions/`. Anything that depends on an owner decision cites its `OPEN-nn` id from `provenance/open-items.md`.

## Non-negotiables

- Never create, modify, stylise or reconstruct the UP!, LUKSO or Universal Everything marks. No mark files exist here by design; obtain official files (see `assets/logos/README.md`). The twelve slide backgrounds in `assets/generated/backgrounds/slides-v2/` depict the official UP! box under the owner's recorded authorization (decision 0012); they are scenes, not mark files: never extract, crop out or reuse the boxes or the mark from them, never present them as the mark, and never generate a new depiction of a mark without a new recorded owner authorization.
- Never add a colour, size, duration or font outside `tokens/src`. The only accent is `color.up.*` through the `accent.*` roles; LUKSO magenta (`network.lukso-mainnet`) is for the LUKSO network and LYX only.
- Fonts are Inter (interface) and PT Mono (names, `#XXXX`, addresses, balances). Names render as `@name#XXXX`; anonymous profiles as `anonymous-profile#XXXX`; the suffix is never dropped or truncated.
- Every profile representation uses the Address Signature from `packages/address-signature`: identicon badge at 24 px and above (a system rule with status proposed, `identicon.min-badge-size`), the checksummed suffix, the address gradient fallback. Never hand-pick a profile colour or replace the identicon.
- No neon, glow, cyberpunk, generic glassmorphism outside the glass tier, mascots, dreamscapes, stock people, AI-invented logos or parent-brand-only motifs on Universal Profiles surfaces.
- Voice: clear, direct, second person, sentence case, culture over finance, "an account, not an address". Never call the product a wallet (Wallet is the assets tab). Never quote prices, market figures or counts.
- Assets: every file under `assets/` needs a `PROVENANCE.json` entry (method, tool or model, prompt, hash, dimensions, licence; for observed material the source, node id or bundle path, status and the recorded owner authorization). Never commit private documents, screenshots of private files, temporary design-tool URLs, or rasters with unrecorded rights; the only admitted product visuals are the owner-authorized files listed in `decisions/0011-owner-authorized-product-visuals.md`, and a new export or bundle copy needs its own recorded authorization.

## Component selection

1. Web: compose the base-layer element (`lukso-button`, `lukso-input`, `lukso-tag`, `lukso-card`, `lukso-profile`, `lukso-username`, `lukso-modal`) and style it with the `--up-*` custom properties. Do not write a parallel component when a base-layer element exists.
2. React Native: use the shipped shared component and read every value from `tokens/build/react-native/theme.ts` (`theme.components` and `theme.identicon` through the active `lightTheme` or `darkTheme`, plus `typography`, `glass`, `shadows`); the bare `components` and `identicon` exports are light-only. Do not fork a component to change a number.
3. Surfaces: canvas for screens, card for content, the glass tier only on mobile over covers, sheets for actions, dialogs for confirmations, slide-to-confirm for irreversible actions.
4. Profiles: hero card on the home panel or profile page, compact rows in lists, the QR card for sharing, `signatureSvg()` for link previews.
5. Feedback: skeleton for lists and cards, spinner for actions, loading modal for multi-step operations, toast for confirmations, the calm error modal for failures, the empty pattern for empties.
6. Read the matching file in `components/` or `patterns/` before building; if no specification exists, write it first (anatomy, variants, states, sizing, behaviour, accessibility, platform differences, tokens, status, implementation notes).

## Accessibility gates

Text 4.5:1 and indicators 3:1 on the pairs in `tokens/contrast-pairs.json` (checked by `node scripts/contrast-report.mjs --check`); secondary and accent text never on translucent glass without the luminance rule; targets 44 by 44; visible focus on the web; a reduced-motion path for every animation; labels on icon-only controls; alt text per `accessibility/README.md`; state never colour-only; font scaling per role caps.

## Token usage

- CSS: `var(--up-text-default)`, `var(--up-surface-card)`, typography shorthand `font: var(--up-type-body-m)`; the tracked roles (`type.label.caps`, `type.label.nav`, `type.deck.h1`, `type.deck.h2`, `type.deck.h3`) also need `letter-spacing: var(--up-type-<role>-letter-spacing)`, and the uppercase roles (`type.label.caps`, `type.currency.code`, `type.deck.caption`) also need `text-transform: var(--up-type-<role>-text-transform)`; no other role emits a text-transform longhand.
- Tailwind: compose the overlay preset after the base preset; classes `text-ink`, `bg-surface-card`, `text-accent`, `text-up-56`, `rounded-up-m`, `shadow-up-card`, `text-title-l`.
- TypeScript: `tokens.text.default`, `cssVar("text.default")`, `tokenMeta["accent.default"].status`.
- React Native: `lightTheme.colors.text.default`, `theme.components["glass-panel"].radius`, `typography["mono.xl"]`, `maxFontSizeMultiplier.mono`.
- Add a token: edit `tokens/src`, give it `status`, `source` (`SRC-` key from `provenance/sources.json`), `confidence`, optional `open`; add contrast pairs if it colours text or indicators; rebuild; validate.

## Address Signature algorithm

- Valid address: `^0x[0-9a-fA-F]{40}$`; normalize to lower-case; checksum with EIP-55 (keccak-256 of the lower-case hex, upper-case a nibble where the hash nibble is 8 or above).
- Gradient: stops `#` + characters 2 to 8 + `80` and `#` + characters 36 to 42 + `80` of the address (bytes 1 to 3 and 18 to 20 at 50 percent alpha), `linear-gradient(90deg, start, end)` over `surface.cover-fallback`; React Native `LinearGradient` from x 0 to x 1 at y 0.5. Invalid or missing: `#24354210` to `#24354220` (light) or `#F8FAFB10` to `#F8FAFB20` (dark).
- Suffix: `#` + characters 2 to 6 of the checksummed address.
- Display name: `@` + name + suffix; an empty or whitespace-only (trimmed) name gives `anonymous-profile` + suffix with no `@`.
- Truncation: checksummed `0x` + 6 characters + `...` + 4 characters (compact) or `0x` + 10 + `...` + 8 (full).
- Identicon: the 8 by 8 mirrored identicon algorithm both products use, seeded with the lower-case address; `identiconData()` and `identiconSvg()` reproduce it exactly.
- Sizes: avatar, badge, ring = 16/8/1, 24/12/1, 40/16/2, 56/20/2, 80/24/2.5, 96/28/3, 120/36/3.5 (observed); badge mandatory from 24 (system rule, proposed); ring in `avatar.ring`.

## Workflow

1. Read the relevant `foundations/`, `components/` or `patterns/` document.
2. Change tokens only in `tokens/src`; run `node scripts/build-tokens.mjs && node scripts/contrast-report.mjs`.
3. For images, follow `imagery/briefs.md` (slide backgrounds: IB-12), record provenance (`node scripts/inspect-png.mjs <file>` prints the facts), run `node scripts/validate.mjs --only assets`, `--only rasters` and, for the slide backgrounds or contact sheets, `--only branded` (the selection is pinned in `scripts/validate/branded-backgrounds.json`; recompose the sheets with `node scripts/compose-previews.mjs`). Pick backgrounds and screens from `assets/README.md`; keep copy inside the safe zone recorded for the file; generated backgrounds are proposed (the UP! box they depict is an observed mark under an owner-authorized publication decision, not brand approval), app screens observed (the paywall and deployment screens exploratory), onboarding art observed shipped product art. Never describe the branded backgrounds as unbranded: they show the UP! mark on the official 3D UP! boxes and nothing else that reads as a word or mark.
4. Keep web and React Native guidance in sync; a change to one requires the other or a line in `adoption/gap-register.md`.
5. Do not install packages, add dependencies or use the network; the gate must keep running on Node alone.
6. Before finishing: `npm test` must pass with zero errors; report the exact commands and results.

## Verification commands

```sh
npm test                                        # full gate
node scripts/validate.mjs --only tokens         # metadata, aliases, tiers, naming
node scripts/validate.mjs --only contrast       # designated pairs and report drift
node scripts/validate.mjs --only docs           # required files, links, headings, status lines
node scripts/validate.mjs --only assets         # provenance hashes, dimensions, briefs, per-method fields, staged prompts
node scripts/validate.mjs --only rasters        # slide contract, alpha and crop facts, preview compositions (pixels decoded on Node alone)
node scripts/validate.mjs --only branded        # the pinned branded-background selection: files, prompts, reference, safe zones, contact sheets, decision, wording
node scripts/validate.mjs --only forbidden      # private paths, URLs, identifiers, credentials
node scripts/validate.mjs --only icons          # grid, stroke, colour, manifest
node --test "packages/**/*.test.mjs"            # address-signature tests
node --test "scripts/**/*.test.mjs"             # PNG reader tests (decoder, alpha facts, content credentials)
```

## Where things are

Tokens `tokens/src` to `tokens/build/{css,ts,react-native,json,tailwind,figma}`; signature helpers `packages/address-signature`; icons `icons/src` with `icons/manifest.json`; imagery `imagery/` and the asset library `assets/` (index `assets/README.md`; slide backgrounds `assets/generated/backgrounds/` with its README, the twelve branded files pinned in `scripts/validate/branded-backgrounds.json`; app screens `assets/screenshots/mobile-app/`; onboarding art and previews `assets/slides/`, the contact sheets composed by `scripts/compose-previews.mjs`); rules `foundations/`, `brand/`, `components/`, `patterns/`; accessibility `accessibility/`; adoption `adoption/`; evidence `provenance/`; decisions `decisions/`; examples `examples/`.
