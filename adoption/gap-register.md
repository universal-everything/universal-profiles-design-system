# Gap register

Status: observed (gaps measured in the shipped products) and open (decisions pending)

| Gap | Where | Impact | Resolution path |
|---|---|---|---|
| Two identicon size tables (older profile image component versus the identicon component) | Mobile | Badge sizes differ at two steps | Retire the older component; tokens carry one table |
| Small badge 14 versus 16 | Mobile versus web | Visual mismatch at 40 px avatars | OPEN-06 |
| Local copies of the gradient, formatter and slicing helpers on each platform | Both | Silent drift risk in the signature | Consume `packages/address-signature` |
| Web address truncation 6 and 6 versus mobile 6 and 4 and 10 and 8; the mobile externally-owned-account row uses 4 and 4 with the `#EOA` label (R-36) | Both | Different strings for the same address | Presets in the package; the web default and the mobile EOA row migrate |
| No accent token in either product; four uses of a muted slate as accent | Both | Marketing and product disagree | OPEN-01, then `accent.*` |
| Hard-coded network colours in five files; testnet one unit off the palette | Mobile | Drift | `network.*` tokens |
| Off-palette literals (`#1C2A3A` glass label, `#E5E5E5` dashed border, system green toggle, utility greys in developer screens) | Mobile | Inconsistent, some fail contrast | Tokens listed in `provenance/reconciliation.md` |
| Inactive tab items at 50 percent opacity; bar tint 0.60 on iOS | Mobile | Labels below 4.5:1 over dark covers | `interactive.unselected-on-glass`, bar tint 0.80 |
| Secondary text at neutral 60; placeholders at neutral 70 | Both | 2.86:1 and 2.11:1 | `text.muted`, `text.placeholder` |
| No font-scaling policy; no reduce-motion handling; 23 accessibility labels against 359 test ids | Mobile | Accessibility failures | Adoption guide steps 3 and 9 |
| Hard-coded English tab labels | Mobile | Localisation gap | Localise; OPEN-17 for right-to-left |
| No dark mode shipped though the base layer supports it | Both | Stage register unavailable in product | Dark theme tokens; OPEN-07 for glass |
| Glass on the web undecided | Web | Divergent surface language over covers | OPEN-08 |
| No vector masters, clear space or licence for the marks | Brand | Cannot ship logo files | OPEN-02, OPEN-03, OPEN-04 |
| Base-layer package declares no licence; version inspected behind the pinned version | Web | Legal and drift risk | OPEN-04, OPEN-09 |
| Figma variables payload untested | Design | Import may need mapping | OPEN-10 |
| Official profile addresses for background presets unknown | Marketing | Sample addresses only | OPEN-19 |
| Cultural-token and tile renders without provenance | Marketing | Cannot reuse | OPEN-20, brief IB-11 |
| Empty states are text only; one error illustration | Both | Flat experience | Briefs IB-05, IB-06 |
| Onboarding art carries magenta bleed and a rocket metaphor | Mobile | Off-brand accents | Brief IB-04 |
| 18 MB raster wrapped as an SVG in the bundle | Mobile | Asset pipeline | Remove; use the generated set |
| Username component does not trim, so a whitespace-only name renders as a named profile | Mobile | `@   #XXXX` instead of the anonymous form | `displayNameParts()` trims; adopt the package (adoption guide step 5) |
