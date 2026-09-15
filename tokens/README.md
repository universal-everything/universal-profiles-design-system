# Tokens

Design tokens in the W3C Design Tokens Community Group (DTCG) format, with the deviations listed under "Format notes", and generated outputs for every consumer. Edit `src/`, run `node scripts/build-tokens.mjs`, commit `build/`.

## Layout

```
tokens/
├── src/
│   ├── $metadata.json            # tier order, themes, status vocabulary, extension fields
│   ├── primitive/                # color, typography, dimension, radius, shadow, motion, opacity, blur
│   ├── semantic/                 # color roles (surface, text, border, accent, interactive, status, network, avatar, gradient, glass), typography roles
│   ├── component/                # button, input, tag, list, card, glass, identicon, navigation, overlay, profile-card, qr, controls, typography-aliases
│   └── themes/dark.json          # semantic overrides for the dark theme
├── contrast-pairs.json           # designated foreground and background pairs with thresholds
└── build/                        # generated, committed
    ├── css/variables.css         # --up-* custom properties; light on :root, dark under [data-theme="dark"] and .dark, auto under [data-theme="auto"]
    ├── ts/tokens.ts              # typed nested object, dark overrides, per-token meta, cssVar()
    ├── react-native/theme.ts     # palette, light and dark colours, typography with font-file names, glass, shadows, components
    ├── json/tokens.flat.json     # every token with value, css, status, statusVia, source, confidence, open id
    ├── json/tokens.dark.flat.json, tokens.nested.json, tokens.meta.json
    ├── tailwind/preset.cjs       # overlay preset composed after the LUKSO base preset
    └── figma/variables.json, text-styles.json, effect-styles.json
```

## Naming

Dotted paths `group.item.variant` in lower-case kebab-case ASCII. CSS `--up-group-item-variant`; TypeScript `tokens.group.item.variant`; Tailwind classes per the preset comment. Component tokens reference semantic or primitive tokens; semantic tokens reference primitives (and, rarely, other semantics); primitives reference nothing.

## Metadata

Every token resolves `$extensions.up`: `status` (observed, normalized, proposed, obsolete, open), `source` (`SRC-` key plus an optional locator, see `../provenance/sources.json`), `confidence` (high, medium, low), optional `open` (`OPEN-nn`, see `../provenance/open-items.md`), optional `note`, optional `deprecated`. Group-level values are inherited by every token beneath.

A token's status never outranks the weakest status in its alias chain (observed, then normalized, proposed, open): a component token that resolves through a normalized or proposed value is itself normalized or proposed, and a token that is not obsolete never resolves through an obsolete one. The validator enforces this on the declared statuses, so tokens whose alias target is weaker carry an explicit status and a note naming the target (see `../decisions/0009-status-follows-the-alias-chain.md`).

Theme files (`src/themes/dark.json`) re-declare metadata for the tokens they override, and their metadata wins over the base token's at every level, so the theme's group-level status applies to every override beneath it. Component tokens are not listed in a theme file; `build/json/tokens.dark.flat.json` reports their dark status as the weakest status along their dark alias chain, which is why a component colour that resolves through a proposed dark override is reported as proposed there. Each record's `statusVia` names the token that carries that weaker status (for `button.primary.fill` in dark it is `interactive.primary`), so a single record explains its own status; it is null when the token's own declared status already is the weakest, and always null in `tokens.flat.json`, where the status is the declared one. `source` stays the token's own evidence in both files.

## Format notes

The sources follow the DTCG format (`$value`, `$type`, `$description`, `$extensions`, `{alias}` references, group inheritance of `$type`) with these deviations, which an importer such as Style Dictionary or Tokens Studio may need an adapter for:

- Shadow parts (`offsetX`, `offsetY`, `blur`, `spread`) are CSS strings such as `"0px"` rather than dimension objects.
- `lineHeight` inside typography values is a dimension (`{ "value": 24, "unit": "px" }`), not the format's unitless number, because both products set line heights in pixels or points.
- `$metadata.json` is a repository file, not part of the format; its `$schema` points at the format's specification page rather than a JSON Schema document.
- Themes are expressed as an override file per theme rather than through the format's (still draft) theming proposal.
- `$extensions.up` carries the provenance fields above; group-level `$extensions` are inherited.

## Counts

Reported by `build/json/tokens.meta.json`: total tokens, dark overrides and the count per status. `openItems` lists the tokens behind each open decision.

## Consuming

- Web: include `build/css/variables.css`; compose `build/tailwind/preset.cjs` after the base preset. See `../adoption/web.md`. The `--up-type-*` custom properties are `font` shorthands (weight, size, line height, family); the shorthand cannot carry tracking or case. Every typography token emits a `-letter-spacing` longhand (0 where untracked), which the tracked roles `type.label.caps`, `type.label.nav`, `type.deck.h1`, `type.deck.h2` and `type.deck.h3` need (also the aliases `type-alias.h4` and `type-alias.nav-11-regular` and the component token `tab-bar.label`). A `-text-transform` longhand exists only for the uppercase roles `type.label.caps`, `type.currency.code` and `type.deck.caption` (and the aliases `type-alias.h4` and `type-alias.currency-10-bold-uppercase`); the Tailwind preset carries the tracking in its `fontSize` entries and no text-transform.
- React Native: import `build/react-native/theme.ts`. See `../adoption/react-native.md`.
- Tools and agents: read `build/json/tokens.flat.json` for values with provenance.
- Design tools: `build/figma/variables.json` follows the variables REST payload; the import has not yet been exercised (OPEN-10).

## Rules

- Never write a colour, size or duration outside `src/`.
- Never edit `build/`; the validator fails on drift.
- A token change that affects a designated pair must keep `../accessibility/contrast-report.md` passing; add pairs to `contrast-pairs.json` when new roles appear.
- Do not promote a status without the evidence and a decision record.
