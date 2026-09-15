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
