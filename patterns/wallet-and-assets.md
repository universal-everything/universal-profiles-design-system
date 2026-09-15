# Wallet and assets

Status: observed

## Purpose

Show what a profile holds and let it send and receive, inside the profile, without turning the product into a wallet. "Wallet" names this section only.

## Flow

1. **Wallet tab** with top tabs Tokens and Collectibles; a filter row (outlined chips, a round search button, a sort select); the "Owned" chip.
2. **Token rows**: 40 logo (the LUKSO mark in magenta for LYX on mainnet, warning yellow on testnet), name in `type.title.s`, balance in `type.body.m-strong` and fiat in `type.body.s`, small glass Buy and Send pills.
3. **Collectible rows and grids**: square thumbnails with `radius.s`, collection name, count.
4. **Asset detail**: hero image or the token logo, name and symbol, balance, actions (Send, Receive, view on the explorer), metadata rows.
5. **Send**: recipient input with identicon preview, amount input with unit and max, review sheet (see `signing-and-confirmation.md`), slide-to-confirm.
6. **Receive**: the QR card with the profile's address and identicon.

## Rules

- Balances and addresses are PT Mono; symbols in `type.currency.code`.
- The LUKSO mark and magenta appear only as the LYX logo and the network dot.
- Fiat values are secondary (`text.muted`, `type.body.s`) and never headline a screen.
- Empty lists use the empty pattern; loading uses skeleton rows.
- No price charts, market data or trading language on Universal Profiles surfaces.

## Accessibility

Rows read "{name}, {balance} {symbol}"; pills are separate labelled targets. Filter chips expose their selected state and count. The search button has a label. Colour logos never carry meaning alone.

## Status

Observed in the shipped wallet, send and receive flows.

## Evidence

SRC-MOBILE-APP wallet module, token list item, filters, send flow, QR screen; SRC-WEB-APP asset pages and send page.
