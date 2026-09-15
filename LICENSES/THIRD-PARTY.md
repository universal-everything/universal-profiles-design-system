# Third-party notices

This repository has no runtime dependencies. It references or reimplements the following.

| Item | Relationship | Notes |
|---|---|---|
| `@lukso/web-components` (LUKSO base layer) | Referenced, not included | Source of the neutral palette, base typography sizes, shadows and the identicon size table, cited as `SRC-WEB-COMPONENTS`. The package declares no licence field; treat as all rights reserved until confirmed (OPEN-04). Values are cited, not copied as code. |
| Identicon algorithm ("blockies", 8 by 8 mirrored identicons with a seeded generator) | Reimplemented in `packages/address-signature` | The original libraries are published under permissive licences; this repository contains an independent reimplementation written from the algorithm's behaviour and verified against the library both products use. No third-party code is included. |
| Keccak-256 | Implemented in `packages/address-signature/src/keccak.mjs` | Independent implementation of the public algorithm. |
| EIP-55 checksum | Implemented | Public specification; test vectors from the specification. |
| W3C Design Tokens Community Group format | Followed | Token file format. |
| Tailwind CSS | Targeted by the generated overlay preset | Not included. |
| React Native, Expo blur, linear gradient and SVG packages | Referenced by examples | Not included; examples type-check inside a consuming app. |
| Product source snapshots (mobile app, universaleverything.io) | Inspected as evidence | Cited by path and commit; no code copied. |
