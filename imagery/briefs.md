# Image briefs

Status: proposed (production briefs; IB-01 is implemented procedurally, IB-02, IB-10 and IB-12 have delivered assets under `../assets/generated/`)

Global rules for every brief: no neon rim light, no circuit-board or hex-grid textures, no lens flares, no invented logos or wordmarks, no readable interface text (blank bars instead), no faces or people, no magenta except where the LUKSO mark is explicitly requested, no dreamscape landscapes. Every output ships with a provenance record (method, tool or model, verbatim prompt, seed if available, date, operator, post-processing, licence) and light and dark variants. Colour anchors: key `accent.brand` (`#6981EC`), highlight `color.up.82` (`#ADBAF5`), shadow `color.up.50` (`#1C41E3`); canvases `#F8FAFB` light and `#121B21` dark; ink `#243542`. The delivered IB-02 and IB-10 assets were produced with the earlier proposal anchors (`#7B83EA`, `#C2C5F5`, `#5862E4`), which sit in the same band; they remain valid.

Priority: IB-01, IB-02, IB-05, IB-03, IB-06, IB-04, IB-07, IB-08, IB-09, IB-10, IB-11, IB-12 (further variations on request).

## IB-01 Address-gradient background set (procedural)

- **Why:** the Address Signature is the system's signature element; marketing needs a background family that belongs to Universal Profiles and requires no rights.
- **Method:** `packages/address-signature` from a real address: (a) the 90 degree linear gradient, (b) the aura: blob A at 22 percent by 30 percent with the first stop, blob B at 78 percent by 72 percent with the second, radius 55 percent of the short edge, alpha 30 percent (45 on dark), blur 12 percent of the short edge, 4 percent monochrome grain.
- **Formats:** SVG for both; raster exports at 2560 by 1440, 1440 by 2560, 1200 by 630, 1080 by 1080, 1080 by 1920; keep the darker stop away from the lower-right lockup area.
- **Status:** implemented; examples in `../assets/backgrounds/address-gradient/`. Presets for official profiles await OPEN-19.

## IB-02 Hero: the profile card as a passport

- **Why:** the canonical hero for the README, the website, the store's first screenshot and decks, replacing the posters' render whose masters and rights are unavailable.
- **Prompt:** studio 3D render of a frosted-glass profile card standing at a 12 degree tilt on a seamless canvas, a rounded cover area with gently tumbling soft-plastic periwinkle objects (a blank rounded cube, a lock, an envelope, a music note, a small game controller, a picture frame, a chat bubble), a large blank white circular avatar breaking the cover's lower edge with a small satellite circle at its lower right, three blank pill tabs and three rows of blank bars, five ghosted translucent cards fanning backward at small increments; soft overhead key light, gentle contact shadow, matte materials; the left 42 percent kept empty for copy.
- **Dark variant:** the same on the dark canvas with dark glass and warm-white highlights, no bloom.
- **Formats:** 16 by 9 master, plus crops for 2560 by 1440, 1440 by 2560, 1200 by 630 and the 3 by 4 poster.
- **Status:** delivered (light and dark) under `../assets/generated/heroes/` at the generator's native 1672 by 941 (16 by 9); the 2560 by 1440 master and the crops listed above have not been produced. Generated with `gpt-image 2.0`; see the provenance record for the embedded content credentials.

## IB-03 The Address Signature explainer

- **Why:** one teachable image for documentation and the "how your profile looks" explainer.
- **Prompt:** flat-lit 3D render on the light canvas: a large blank circular avatar with a small pixel-block badge at its lower right in muted periwinkle and teal blocks (blocks, not a real identicon), a floating monospaced blank bar beneath it ending in a slightly darker four-character block, and behind both a wide soft horizontal gradient band from the highlight to the shadow accent at 50 percent alpha; three thin leader lines; no text.
- **Formats:** 2400 by 1350, light and dark. A vector version composed from real components replaces it when the documentation site exists (the generated share card already covers the component version).

## IB-04 Onboarding set refresh (four slides)

- **Why:** the shipped set mixes periwinkle with magenta accents and a rocket-and-gears metaphor; the refresh aligns the slides with the pillars.
- **Shared style:** soft-plastic periwinkle objects in tinted glass on the light canvas, overhead key light, 4 by 3, no text.
- **Slides:** (1) Your profile: one frosted card with an avatar breaking its edge and a tiny satellite circle, three drifting blank cards around it. (2) Truly yours: a card with a rounded padlock in front and three small key-shaped tokens orbiting it, one closer. (3) Every chain, every app: one card at the centre with five translucent rounded tiles fanning out on soft glass shelves. (4) Forever address: a row of five circular avatars, the centre one raised and lit, each with a distinct blocky badge, on a soft gradient band.
- **Formats:** 1200 by 900 with transparent objects, 2x and 3x, dark variants.

## IB-05 Empty-state illustrations

- **Why:** empties are plain text today; a small quiet set improves both products.
- **Set:** no tokens: an open empty rounded tray; no collectibles: an empty picture frame leaning on a small block; no activity: a flat heartbeat line on a small card; no connections: two rounded plugs almost touching; no apps: a dashed rounded square tile; no followers: two overlapping empty circles.
- **Style:** monochrome-tinted soft objects in `color.up.86` and `color.up.78` only, generous white space, 1 by 1.
- **Formats:** SVG preferred (tintable through `currentColor`), fallback PNG 512 at 2x and 3x; dark variants in `color.purple.31` and `color.purple.41`.

## IB-06 Error and warning illustrations

- **Why:** the fallen-cube error art is the only error image; a light and dark pair plus warning and offline siblings are needed.
- **Prompts:** error: the badge cube tipped on its edge with its lid open, nothing spilling, soft contact shadow; warning: the cube upright with a small rounded triangular sign leaning on it, no glyph; offline: the cube with a thin broken ring around it.
- **Formats:** 600 by 600 transparent, 2x and 3x, dark variants.

## IB-07 Cross-chain hero

- **Why:** the multichain narrative is the 2026 focus and has no approved visual.
- **Prompt:** one frosted profile card at the centre of the light stage; three thin translucent glass rails leave the card toward three small rounded platforms, each holding a blank rounded disc (no chain logos); the rails catch soft periwinkle light; overhead key light; wide 16 by 9; the left 40 percent empty for a headline; no text.
- **Formats:** 2560 by 1440, 1200 by 630, dark variant.

## IB-08 Proof of Presence illustration

- **Why:** a flagship story with no visual beyond the partner app icon.
- **Prompt:** a frosted profile card touched by a small rounded credential coin that snaps into a slot on the card's lower edge, a subtle circular check indentation on the coin, a doorway-like glass frame in the background, the light stage, periwinkle materials, no text.
- **Formats:** 2400 by 1350 and 1080 by 1350, dark variant.

## IB-09 Store screenshot frames

- **Why:** store listings need frames consistent with the posters; screenshots must show real interface.
- **Background only:** IB-01 aura backgrounds in light and dark with a 1 px inner border in the glass reflex colour; headline space in the top 18 percent; device frame centred with a 6 percent margin; captions in the deck h3 role.
- **Formats:** 1290 by 2796 and 1284 by 2778 (iOS), 1080 by 2400 (Android).

## IB-10 Deck and social title backgrounds

- **Why:** the dark stage register needs a subtle background family without neon.
- **Prompt (dark):** near-black `#08080A` canvas with a single very soft periwinkle bloom at about 12 percent perceived opacity offset to the upper right and fading over about 60 percent of the height, 2 percent monochrome film grain, no shapes, no lines, no text; the left 55 percent quiet and text-safe. **Light:** the same on `#F8FAFB` with the bloom at about 18 percent.
- **Formats:** 1920 by 1080, 1080 by 1080, 1080 by 1920.
- **Status:** delivered (light and dark) under `../assets/generated/backgrounds/` at the generator's native 1672 by 941; the 1920 by 1080, 1080 by 1080 and 1080 by 1920 formats have not been produced. Generated with `gpt-image 2.0`; see the provenance record for the embedded content credentials.

## IB-11 Cultural-token object set

- **Why:** the token vocabulary (fan token, proof of attendance, ticket, membership, badge, voting) appears on the brand board only as renders and AI tiles without provenance (OPEN-20); the objects are worth having under recorded rights.
- **Prompt:** six periwinkle glass objects on the light canvas, one per subject: a fan token disc, a proof-of-attendance stamp, a ticket stub, a membership card, a badge, a voting slip; camera three-quarter top; the same materials as the cube family; no neon; no text.
- **Formats:** 1200 by 1200 each, transparent, dark variants. Descriptive reference only; do not trace the board renders.

## IB-12 Presentation background family (slides-v2)

- **Why:** the title pair (IB-10) is one quiet background; decks need a family of abstract backgrounds with room for copy, in both registers, produced under recorded provenance. The product owner asked on 2026-09-15 for the first twelve to be visible in the repository and for many more variations (`../decisions/0011-owner-authorized-product-visuals.md`).
- **Shared prompt frame:** "Use case: productivity-visual. Asset type: 16:9 Universal Profiles presentation background." Premium modern 3D editorial abstraction, restrained and spatial; translucent glass, frosted or smoked acrylic, soft volumetric haze, extremely subtle fine grain. Light register: white, cool mist, pale periwinkle, `#A4B5FF`, `#8494EE`, tiny cool slate accents. Dark register: near-black `#0B1015`, cool slate `#121B21`, deep indigo, `#6981EC`, `#8494EE`, restrained cool-white highlights. No dominant pink.
- **Families delivered (light and dark each):** identity orbits (concentric orbits and one portal ring, cluster on the right third, left 52 percent quiet); glass profile stack (layered blank card planes on the left third, right 50 percent clean); address ribbons (translucent ribbons inspired by address-derived colour signatures, lower left to upper right, calm central zone); modular constellation (blank rounded cubes, spheres and tiles along the lower-right edge, upper-left 58 percent quiet); identity network (sparse nodes, orbital paths and halos near the corners, centre calm); iridescent horizon (mist and low wave forms across the bottom quarter, upper 65 percent calm).
- **Constraints (verbatim in every prompt):** background only; no words, letters, numbers or hexadecimal strings; no logos, UI screenshots, people, hands, devices, coins, blockchain symbols, maps, grids or watermarks; all cards and tiles blank; preserve large usable negative space; 16:9 landscape.
- **Formats:** the generator's native 16:9 (1672 by 941 delivered; two files at 1671 by 941); 1920 by 1080, 1080 by 1080 and 1080 by 1920 not yet produced. Every file must meet the slide contract in `../assets/generated/PROVENANCE.json` (aspect, minimum size, 8-bit RGB, intact content credentials, a declared and measured text-safe zone, a light and a dark file per family), which `node scripts/validate.mjs --only rasters` checks.
- **Status:** delivered (twelve files) under `../assets/generated/backgrounds/slides-v2/` with the verbatim prompts in `PROMPTS.source.json` there and in the provenance record; proposed, not approved brand imagery. New variations: copy a family prompt or write a new family inside the shared frame, generate both registers, record provenance, measure the safe zone, update the contact sheets; see `../assets/generated/backgrounds/README.md`.

## Not recommended

Mascots; neon or cyberpunk key art; pink dreamscape landscapes; stock photography of people using phones; any regeneration of the marks.
