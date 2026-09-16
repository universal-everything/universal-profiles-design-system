# Imagery

Status: observed for the soft-object family and the dark stage register; proposed for the two-family rule, the generated set and the briefs

Universal Profiles imagery has exactly two families. Everything else is retired.

## Family 1: address-derived backgrounds (procedural)

Deterministic backgrounds generated from a profile address by `packages/address-signature`:

- **Linear**: the 90 degree address gradient over the cover fallback, the same recipe as the in-app cover.
- **Aura**: the two address stops as soft radial blobs on the canvas with faint grain, for hero sections, store frames and social backgrounds.
- **Share card**: the complete profile card with the signature, for link previews and social posts.

They exist for every profile that exists, they need no rights clearance, and they never repeat unless the address repeats. Examples for public test-vector addresses live in `../assets/backgrounds/address-gradient/` with a recipe file that any renderer can reproduce. When no profile is present, use the campaign's or event's own profile address (official addresses are pending, OPEN-19).

## Family 2: soft-plastic and frosted-glass 3D objects (original renders)

Premium soft-plastic pastel periwinkle objects inside frosted glass: the profile card, the UP! container cube, an envelope, a lock, a music note, a game controller, a picture frame, a chat bubble, cultural-token objects. Calm studio lighting, matte materials, no neon rims, neither readable text nor faces, and no invented logos. The official UP! box appears only where the owner has authorized its depiction on record: the twelve expressive slides-v2 backgrounds under decision 0012 (`../decisions/0012-branded-slide-backgrounds.md`) and decision 0013 (`../decisions/0013-container-cube-slide-backgrounds.md`), and the twelve additive ambient backgrounds under decision 0014. It is always a solid, closed and sealed container cube: a monolithic rounded die with smooth continuous top and side planes and the white UP! once on the front face, never a flat badge, a tile or anything with openings, lids or inserts. Decision 0014 covers exactly its twelve scenes and two overview sheets and grants no extraction or trademark licence; every other object stays blank. Light register on `surface.canvas`, dark register on neutral 10 or the near-black title canvas.

The twenty-eight images under `../assets/generated/` are the members of this family produced under recorded provenance:

| File | Brief | Use |
|---|---|---|
| `heroes/profile-passport-light.png` | IB-02 | README hero, website hero (light), store first screenshot backdrop |
| `heroes/profile-passport-dark.png` | IB-02 | Dark hero, deck opener |
| `backgrounds/title-light.png` | IB-10 | Light title slides and social titles |
| `backgrounds/title-dark.png` | IB-10 | Dark title slides and social titles |
| `backgrounds/slides-v2/*-light.png` and `*-dark.png` (six families: identity orbits, glass profile stack, address ribbons, modular constellation, identity network, iridescent horizon) | IB-12 | Presentation backgrounds with measured text-safe zones, each a layered identity collage showing one or more official UP! container cubes, solid, closed and sealed, under decisions 0012 and 0013 (the mark stays its owner's trademark; no extraction); see `../assets/generated/backgrounds/README.md` |
| `backgrounds/slides-v3-ambient/*-light.png` and `*-dark.png` (six families: quiet corner, quiet corner left, distant horizon, peripheral frame, mist orbit right, mist orbit left) | IB-13 | Additive, subordinate ambient presentation infrastructure for body copy, charts and transparent screens: one or two closed UP! container cubes at the edge, twenty cubes across the set, stricter measured zones and at least 65 percent visually quiet by visual review plus the safe-zone proxy; decision 0014, no extraction |

Every raster records its method, prompt, hashes, dimensions, register and safe zone in `PROVENANCE.json`, and the branded slide backgrounds also their generation id, reference inputs and embedded-mark count. The expressive set remains pinned by `--only branded`; the separate stricter ambient set is pinned by `--only ambient`, without weakening slides-v2. New members are produced from `briefs.md`.

The shipped posters and the app icon belong to the same family but have no recorded author or licence, so they are not republished. The four shipped onboarding illustrations are the exception: they are republished under `../assets/slides/onboarding/` at the product owner's request (`../decisions/0011-owner-authorized-product-visuals.md`) as observed shipped product art, byte-identical to the mobile bundle, with the rights position recorded; they show the app as it is and are not the source for new illustration (IB-04 proposes their refresh). Five app screens exported from the mobile design file are published under `../assets/screenshots/mobile-app/` on the same authorization; they are product screens, not imagery.

Partner app icons (for example the Proof of Presence icon explored on the brand board) belong to their apps; their final exports and colour roles are not recorded here (OPEN-16).

## Retired

Neon and cyberpunk key art, circuit textures, generic AI dreamscape landscapes and the parent brand's pink dreamscape covers (the iridescent-horizon slides-v2 family is the one admitted landscape, a product-specific scene in the system's materials under `../decisions/0013-container-cube-slide-backgrounds.md`), dot-matrix arrows, mascots, stock photography of people using phones, AI-generated tiles without provenance. See `../patterns/obsolete.md`.

## Rules for producing new imagery

1. Start from a brief in `briefs.md`; keep its negative constraints verbatim. IB-12 is the expressive family and IB-13 the separate ambient family; do not merge their density or safe-zone contracts.
2. Produce light and dark variants and every listed crop.
3. Record provenance (method, tool, model, prompt, seed if any, date, operator, post-processing, licence) in the directory's `PROVENANCE.json` and run the validator.
4. Never trace private board renders or the posters; describe, then generate. Recorded public repository files may serve as references: slides-v2 used the already-public onboarding illustrations, while slides-v3-ambient used recorded title, slides-v2 and earlier ambient files; one superseded ambient draft is retained by hash-only lineage. Public records use repository-relative paths only. A new image that shows a mark needs its own recorded authorization first because decisions 0012/0013 and 0014 cover only their exact pinned sets.
5. Cover images of real profiles are the users' own; product screenshots for stores show real interface.

## Evidence

SRC-POSTER-2025, SRC-NFTNYC-2026, SRC-ONBOARDING-ART (republished under decision 0011, R-37), SRC-APP-ICON, SRC-FIGMA-UP-BOARD imagery section (object family corroborated; board assets excluded for rights; the earlier badge and open-receptacle depictions are superseded as geometry references, decisions 0012 and 0013, R-39 and R-40), SRC-ONBOARDING-ART (the three onboarding illustrations used as style and composition references for slides-v2), SRC-FIGMA-MOBILE-UPDATES (five exported screens, R-38), SRC-GENERATED-IMAGES (twenty-eight files, IB-02, IB-10, IB-12, IB-13).
