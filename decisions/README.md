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
| [0010-no-reconstruction-under-any-label.md](0010-no-reconstruction-under-any-label.md) | No reconstruction of a mark under any label; supersedes the escape hatch in 0007 | accepted; remains the default, with one owner-authorized depiction inside the twelve pinned slide backgrounds recorded in 0012 |
| [0011-owner-authorized-product-visuals.md](0011-owner-authorized-product-visuals.md) | Five app screens and the four onboarding illustrations admitted as named, owner-authorized exceptions to the publication boundary; twelve slide backgrounds added as proposed assets; the validator proves the boundary | accepted |
| [0012-branded-slide-backgrounds.md](0012-branded-slide-backgrounds.md) | The twelve slide backgrounds replaced by owner-requested scenes that depict the official UP! box from the owner's reference; a publication and use decision for these files only, not brand approval; the mark stays unlicensed and the standalone reference unpublished; the validator pins the selection | accepted |

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
