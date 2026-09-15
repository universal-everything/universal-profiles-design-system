# Agent playbooks

Prompts for Claude Code and compatible agents working in a product repository that consumes this design system, with the outcome each should produce. Every playbook assumes the agent has read `../../CLAUDE.md`.

## 1. Add a new mobile screen

Prompt: "Add a Settings screen section that lists connected apps with a remove action. Follow the Universal Profiles design system: use the generated theme, the list-item and glass-surfaces specifications, and the permissions pattern."

Expected outcome: a glass card (`components["glass-panel"]`, card radius) holding list rows (`components["list-item"]` sizes, `type.title.s` and `type.body.m` roles, `text.muted` subtitle), a chevron at `opacity.hint`, remove through slide-to-confirm in a sheet, copy per `patterns/content-voice.md`, every icon-only control labelled, no literal colours or sizes, `maxFontSizeMultiplier` per role.

## 2. Render a profile anywhere

Prompt: "Show the profile that owns this asset in the header."

Expected outcome: a compact profile row with the avatar from the identicon table (badge mandatory at 24 px and up), the name from `displayNameParts()` as `@name#XXXX` with the suffix in `text.muted`, the address gradient as the fallback cover, and the identicon from the same helpers; never a bare hex address when a name exists.

## 3. Make a social post image

Prompt: "Create a 1080 by 1080 announcement image for the new backup feature."

Expected outcome: canvas `surface.canvas`, a share card generated with `signatureSvg()` for the campaign's own profile (or a real product capture), headline in the deck h3 role with one accent phrase, lockup from official files bottom centre, safe zones from `imagery/framing-and-safe-zones.md`, alt text equal to the headline, no counts or prices, provenance recorded if a new raster is produced.

## 4. Write an error message

Prompt: "Write the error shown when a restore fails because the backup file has no key for this profile."

Expected outcome: "This backup holds no key that controls this profile, so it can't be restored to this device." followed by one action ("Choose another backup"); sentence case; no exclamation mark; announced assertively; retry keeps focus.

## 5. Add a token

Prompt: "We need a colour for a new 'pending' status."

Expected outcome: a proposal in `tokens/src/semantic/color.json` adding a pending group beside `status.info` that references existing primitives (a `color.blue` or `color.yellow` step), `status: "proposed"` with source and confidence, contrast pairs added for text and fill in both themes, `node scripts/build-tokens.mjs` and `node scripts/contrast-report.mjs` run, `node scripts/validate.mjs` passing, and a note in the change description that the value awaits product adoption.

## 6. Verify a page against the system

Prompt: "Check this page for design-system compliance."

Expected outcome: a list of literal colours, sizes and fonts replaced by tokens; contrast checked against the report; names shown as `@name#XXXX`; accent used only for links and marketing calls to action; magenta only on LYX and network roles; missing labels and focus rings reported; the accessibility checklist filled in.

## 7. Build a deck slide

Prompt: "Make a 16:9 section slide about multichain profiles with a dark background and a product screenshot."

Expected outcome: a background from `assets/generated/backgrounds/slides-v2/` in the dark register (one family per section; `identity-network-dark.png` or `identity-orbits-dark.png` for this topic), copy inside the family's measured safe zone from `assets/generated/backgrounds/README.md` in `type.deck.h2` and `type.deck.body` with one accent phrase, a transparent screen from `assets/screenshots/mobile-app/` placed at 299 by 634 outside the safe zone (never an old capture, never the exploratory screens without a label), alt text per file, no counts or prices, and no new raster committed without a provenance entry.

## 8. Add background variations

Prompt: "Generate two more slide backgrounds in the identity-orbits family."

Expected outcome: prompts derived from the family's entry in `assets/generated/backgrounds/slides-v2/PROMPTS.source.json` inside the IB-12 frame (background only, no text, no logos, no people, no devices, both registers), the native files added to `slides-v2/` as `<family>-light.png` and `<family>-dark.png`, `node scripts/inspect-png.mjs <file> --zone x,y,w,h` used to record the hash, dimensions, content-credentials time stamp and a safe zone that measures light or dark enough and quiet, entries added to `assets/generated/PROVENANCE.json` and to the prompt file with `status: "proposed"`, the set's count and family list raised, the contact sheets updated with their placements, and `node scripts/validate.mjs --only assets`, `--only rasters` and `npm test` passing.
