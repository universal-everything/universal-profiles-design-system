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

Premium soft-plastic pastel periwinkle objects inside frosted glass: the profile card, the badge cube, an envelope, a lock, a music note, a game controller, a picture frame, a chat bubble, cultural-token objects. Calm studio lighting, matte materials, no neon rims, no readable text, no faces, no logos. Light register on `surface.canvas`, dark register on neutral 10 or the near-black title canvas.

The four images under `../assets/generated/` are the first members of this family produced under recorded provenance:

| File | Brief | Use |
|---|---|---|
| `heroes/profile-passport-light.png` | IB-02 | README hero, website hero (light), store first screenshot backdrop |
| `heroes/profile-passport-dark.png` | IB-02 | Dark hero, deck opener |
| `backgrounds/title-light.png` | IB-10 | Light title slides and social titles |
| `backgrounds/title-dark.png` | IB-10 | Dark title slides and social titles |

Every raster records its method, prompt, hashes and dimensions in `PROVENANCE.json`; the validator checks them. The shipped posters, onboarding art and app icon belong to the same family but have no recorded author or licence, so they are not republished; new members are produced from `briefs.md`.

Partner app icons (for example the Proof of Presence icon explored on the brand board) belong to their apps; their final exports and colour roles are not recorded here (OPEN-16).

## Retired

Neon and cyberpunk key art, circuit textures, pink dreamscape landscapes, dot-matrix arrows, mascots, stock photography of people using phones, AI-generated tiles without provenance. See `../patterns/obsolete.md`.

## Rules for producing new imagery

1. Start from a brief in `briefs.md`; keep its negative constraints verbatim.
2. Produce light and dark variants and every listed crop.
3. Record provenance (method, tool, model, prompt, seed if any, date, operator, post-processing, licence) in the directory's `PROVENANCE.json` and run the validator.
4. Never trace private board renders or the posters; describe, then generate.
5. Cover images of real profiles are the users' own; product screenshots for stores show real interface.

## Evidence

SRC-POSTER-2025, SRC-NFTNYC-2026, SRC-ONBOARDING-ART, SRC-APP-ICON, SRC-FIGMA-UP-BOARD imagery section (object family corroborated; board assets excluded for rights), SRC-GENERATED-IMAGES.
