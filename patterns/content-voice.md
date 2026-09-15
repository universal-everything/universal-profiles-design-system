# Content on screens

Status: normalized (applies `../foundations/voice-and-copy.md` to concrete surfaces)

## Purpose

Give writers and agents exact patterns for the copy that appears most often, so screens sound like one product.

## Flow

Copy is written in this order: what the user wants to do, what will happen, what they must know, then the action.

| Surface | Pattern | Example |
|---|---|---|
| Screen title | Noun or short verb phrase, sentence case | "Controllers", "Send tokens" |
| Primary button | Verb, two words maximum | "Send", "Connect to {app}", "Let's go!" (onboarding only) |
| Destructive action | Consequence line above a slide-to-confirm | "This removes {controller} from your profile." |
| Input label and helper | Label is the noun; helper is one sentence; error says what to fix | "Name" · "Shown next to your profile everywhere." · "Names can't contain spaces." |
| Empty state | Name the empty thing and the next step | "No collectibles yet." · "Browse apps" |
| Error | What happened, why, what next | "Couldn't load your activity. The network didn't respond. Try again." |
| Consent and permissions | The actor, the verb, the scope | "{app} can read your profile and request transactions." |
| Network warning | Name the network and the consequence | "You're switching to LUKSO Testnet. Assets here have no value." |
| Toast | Two words to one line, past tense | "Copied", "Backup saved" |
| Marketing headline | One accent phrase, one metaphor | "Your Profile for the New Web3" |

## Rules

- Never "wallet" for the product; "Wallet" is the assets tab.
- Names always as `@name#XXXX`; addresses always mono; never a bare hex when a name exists.
- No prices, market figures, counts, "closed beta", "waitlist".
- Second person, sentence case, one exclamation mark only in onboarding.
- Builder register (standards numbers) only in builder detail views and documentation.

## Accessibility

Copy is the accessible name in most cases: buttons name their action with the object ("Connect to {app}"), errors are complete sentences, and link text says where it goes.

## Status

Normalized from shipped strings and sanctioned lines.

## Evidence

SRC-MOBILE-APP translation strings; SRC-NFTNYC-2026 lines; SRC-CAMPAIGN-BRIEFS messages.
