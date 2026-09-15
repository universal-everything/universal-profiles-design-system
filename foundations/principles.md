# Principles

Status: normalized (the principles codify observed behaviour; the direction statement is proposed)

## What Universal Profiles look like

Universal Profiles look like a calm, precise passport for the new web: a neutral, well-lit canvas; Inter for words and PT Mono for anything that belongs to the chain; one accent, UP periwinkle, used sparingly as a frame; and, at the centre of every surface, the profile card carrying its Address Signature: the identicon badge, the `#XXXX` suffix and the gradient born from the address itself. Surfaces float like frosted glass on mobile and sit as clean cards on the web, but the identity never changes. The tone is human and direct, culture over finance, an account not an address, and never neon.

## Five principles

1. **The profile is the hero.** Every product and marketing surface is organised around a profile card. When a real profile exists, show it; when none exists, show the address-derived signature of the campaign's or event's own profile rather than an invented graphic.
2. **Colour is earned from the address, not chosen.** The cover fallback, the identicon and the suffix all derive from the profile's address. Hand-picked profile colours are not allowed; the UP accent is the frame, never the subject.
3. **Two typefaces, two registers.** Inter carries interface language. PT Mono carries anything that is of the chain: names, suffixes, addresses, balances. Mixing the registers blurs what the user owns.
4. **Quiet surfaces, one elevation language.** A neutral canvas, white cards, and a single frosted-glass tier for floating surfaces on mobile. No neon, no glow, no decorative gradients other than the brand gradient and the address gradient.
5. **Accessible by default, verified by script.** Text contrast, target size, focus, motion and labelling are gates, not aspirations. The contrast report in `../accessibility/contrast-report.md` is regenerated from the tokens and fails the build when a pair regresses.

## Layer relationship

| Layer | Owner | What it defines | Where it lives |
|---|---|---|---|
| LUKSO base layer | `@lukso/web-components` | Neutral and semantic palettes, Tailwind preset, Lit components, fonts, identicon size table, address helpers | The published package (SRC-WEB-COMPONENTS) |
| Universal Profiles product layer | this repository | The UP accent family, elevation tiers including glass, profile-card and Address Signature rules, dark theme, typography roles, component and pattern specifications, marketing system, imagery, provenance | `tokens/`, `foundations/`, `components/`, `patterns/`, `brand/`, `imagery/` |
| Products | mobile app, universaleverything.io, extension, SDK user interfaces | Screens and flows composed from both layers | Product repositories |

The product layer never redefines a base-layer value. Where the two disagree, the base layer is imported and the difference is recorded in `../provenance/reconciliation.md`. LUKSO magenta `color.network.lukso-mainnet` belongs to the LUKSO network and the LYX token only; it is never the Universal Profiles accent.

## Two audiences, one system

The system serves a consumer register (profile, culture, forever profile) and a builder register (standards numbers, controllers, relay calls). Both are legitimate. The mistake to avoid is mixing them on one surface: consumer screens never show a standards number; builder documentation never hides one.

## Evidence

Shipped mobile app 1.29.0 (SRC-MOBILE-APP), universaleverything.io (SRC-WEB-APP), the base-layer package (SRC-WEB-COMPONENTS), the 2025 posters (SRC-POSTER-2025) and the 2026 stage deck (SRC-NFTNYC-2026) agree on the five recurring traits: profile card with a floating avatar, address-derived colour and badge, Inter plus PT Mono, the hue-206 neutral canvas and a periwinkle accent band. The direction statement and the layer model are proposals of this system.
