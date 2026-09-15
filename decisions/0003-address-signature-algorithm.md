# 0003 One implementation of the Address Signature helpers

Status: accepted
Date: 2026-09-14
Closes: OPEN-18

## Context

Both products implement the address gradient, the suffix and the truncation locally with the same algorithm, and both depend on the same identicon library. Local copies drift (the web truncates 6 and 6, mobile 6 and 4 and 10 and 8).

## Decision

`packages/address-signature` is the single dependency-free implementation: EIP-55 checksum with a built-in keccak, gradient stops from bytes 1 to 3 and 18 to 20 at 50 percent alpha, the checksummed 2 to 6 suffix, display names including the anonymous form, two truncation presets, and an exact reimplementation of the identicon algorithm with the lower-cased seed. Parity was verified cell by cell against the identicon library's output for seven addresses and recorded as fixtures.

## Consequences

Products replace local helpers with the package. The identicon seed casing question is closed: lower-case, as both products already do through the library. Marketing generators (aura, share card) build on the same functions.

## Evidence

SRC-MOBILE-APP gradient helper, username formatter, identicon component; SRC-WEB-COMPONENTS helpers and profile component; fixtures in `packages/address-signature/test/fixtures.json`.
