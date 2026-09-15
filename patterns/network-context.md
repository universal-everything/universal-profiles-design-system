# Network context and cross-chain identity

Status: observed for network tags and the switch dialog; normalized for the dot-plus-text rule; open for the Ethereum colour (OPEN-05)

## Purpose

Keep people certain which network they are acting on, and explain that the same profile can be deployed to other networks without promising that it is everywhere.

## Flow

- **Network tag** at the top left of the home screen and on cards: a pill with the network dot (`network.lukso-mainnet` magenta, `network.lukso-testnet` yellow, `network.base` blue, Ethereum placeholder) and the network name; testnet writes "Testnet" and uses the warning tint.
- **Switching** opens a confirmation dialog with warning copy; switching to a testnet requires acknowledging the testnet warning once.
- **Deployed networks pill** on the profile card ("{count} Networks") opens the deployments sheet; undeployed networks show a "Deploy" action with the cross-chain explanation ("Cross-chain deployment is currently only supported for Base and Ethereum.").
- **Assets** show a small network logo beside token logos when the profile is on more than one network.

## Rules

- Network colour is a dot or logo beside ink text; it is never the text colour, never a background, never the only signal.
- LUKSO magenta means the LUKSO network or LYX; it never tints a Universal Profiles element.
- Say "can be deployed to other networks"; never "works on every chain".
- The profile address is the same on every network; the signature (badge, suffix, gradient) does not change per network.

## Accessibility

Tags expose "Network: LUKSO Testnet". Dialogs explain the consequence in the first sentence. Dots meet 3:1 on cards where they are decorative reinforcement (rows L-43, L-44); the text carries the meaning.

## Status

Observed; the dot rule is a normalization of the observed orange testnet label; Ethereum colour open.

## Evidence

SRC-MOBILE-APP network logo helper, networks list, home network pill, deployment strings; SRC-WEB-APP network selector.
