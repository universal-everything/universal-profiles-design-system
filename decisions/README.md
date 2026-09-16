# Decisions

Architecture-decision records for choices that shape the system. One file per decision, numbered, never edited after acceptance (add a superseding record instead). Closing an open item requires a record here and the matching token or document change in the same pull request.

| Record | Decision | Status |
|---|---|---|
| [0001-layer-model.md](0001-layer-model.md) | Product layer on the LUKSO base layer; nothing redefined | accepted |
| [0002-status-vocabulary.md](0002-status-vocabulary.md) | Five statuses on every token and guideline | accepted |
| [0003-address-signature-algorithm.md](0003-address-signature-algorithm.md) | One dependency-free implementation of the signature helpers, verified against production | accepted |
| [0004-accent-anchor.md](0004-accent-anchor.md) | Accent ramp anchored on the board swatch, roles proposed, approval not claimed | accepted as interim; OPEN-01 remains |
| [0005-magenta-reserved.md](0005-magenta-reserved.md) | LUKSO magenta reserved for network and LYX roles | accepted |
| [0006-glass-as-one-tier.md](0006-glass-as-one-tier.md) | Glass is an elevation tier, mobile only until decided for the web | accepted |
| [0007-no-mark-reconstruction.md](0007-no-mark-reconstruction.md) | No logo files until masters and rights arrive | accepted; reconstruction clause superseded by 0010 |
| [0008-validation-without-dependencies.md](0008-validation-without-dependencies.md) | All builds and checks run on Node alone | accepted |
| [0009-status-follows-the-alias-chain.md](0009-status-follows-the-alias-chain.md) | A token's status never outranks the weakest status in its alias chain; theme metadata wins over base metadata | accepted |
| [0010-no-reconstruction-under-any-label.md](0010-no-reconstruction-under-any-label.md) | No reconstruction of a mark under any label; supersedes the escape hatch in 0007 | accepted; remains the default outside two exact owner-authorized generated-background sets: slides-v2 under 0012 and 0013, and the additive ambient set under 0014 |
| [0011-owner-authorized-product-visuals.md](0011-owner-authorized-product-visuals.md) | Five app screens and the four onboarding illustrations admitted as named, owner-authorized exceptions to the publication boundary; twelve slide backgrounds added as proposed assets; the validator proves the boundary | accepted |
| [0012-branded-slide-backgrounds.md](0012-branded-slide-backgrounds.md) | The twelve slide backgrounds replaced by owner-requested scenes that depict the official UP! box from the owner's reference; a publication and use decision for these files only, not brand approval; the mark stays unlicensed and the standalone reference unpublished; the validator pins the selection | accepted; reference node and geometry superseded by 0013 |
| [0013-container-cube-slide-backgrounds.md](0013-container-cube-slide-backgrounds.md) | The owner's correction: the Universal Profile is a container, but the UP! object in the twelve slide backgrounds is a solid, closed and sealed container cube (a monolithic rounded die with smooth, continuous top and side planes and the white UP! once on the front face; no hole, slot, lid, rim, cavity or insert), never a flat badge or tile; the files regenerated inside the layered composition language of the already-public onboarding illustrations, the front-facing badge node and the open-receptacle raw image node both superseded, a staged open-receptacle draft rejected and never published, the authorization scope and the extraction restriction unchanged; four files replaced after the final review and the final visual cleanup by precise-object edits of their own generation output (the two sneakers and a blank cube replaced by brand-neutral objects, the dark identity-orbits cube tops re-rendered, the sculpture behind a cube removed; two of them through a chain of two edits), the light address-ribbons count corrected to five; the validator pins the polarity-aware geometry contract (a keyword and pattern gate over the prompts) and the four edits with their lineage | accepted |
| [0014-ambient-slide-backgrounds.md](0014-ambient-slide-backgrounds.md) | A separate additive family of twelve low-contrast ambient slide backgrounds in six light/dark pairs, with one or two solid closed UP! container cubes, large measured copy-safe zones, strict 220/36/deviation-12 thresholds and an independent validator; slides-v2 remains the expressive campaign family; publication and use authorized for these exact files and their two sheets, not blanket brand approval or a trademark licence | accepted |

Template:

```markdown
# NNNN Title

Status: accepted | proposed | superseded by NNNN
Date: YYYY-MM-DD
Closes: OPEN-nn (if any)

## Context
## Decision
## Consequences
## Evidence
```
