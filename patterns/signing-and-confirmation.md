# Signing and transaction confirmation

Status: observed for sheets, dialogs and slide-to-confirm; normalized for the confirmation hierarchy

## Purpose

Make every signature and transaction understandable and proportionate: light confirmation for reversible actions, deliberate confirmation for irreversible ones, and no surprise gas.

## Flow

1. **Request sheet.** What is being asked (send, sign a message, approve, deploy), who asks (app name and icon or the profile itself), the acting profile as a card preview, the amount in PT Mono with the currency code, the recipient as `@name#XXXX` with the identicon or a truncated address with its identicon, the network tag, and a fee line ("No gas on LUKSO" when relayed).
2. **Confirmation.** A primary button for reversible actions; slide-to-confirm for irreversible ones (sends, removals, deployments).
3. **Progress.** The loading modal with steps; the sheet cannot be dismissed while pending.
4. **Result.** A success state with the profile identicon and a summary, or a calm error with retry.

## Rules

- Recipients are always shown with their identicon; a bare address is never the only identifier.
- Amounts and addresses are PT Mono; currency codes use `type.currency.code`.
- Irreversible equals slide-to-confirm, no exceptions; destructive buttons are outlined, never solid red.
- Messages to sign are shown in full in a scrollable mono block with a "what this means" line.
- Never quote fiat values without the source; never imply a price.

## Accessibility

The sheet title names the action; amounts are read with units. The slider has a button alternative. Progress steps are announced. Error results keep focus on the retry action.

## Status

Observed in the shipped send and connect flows; the hierarchy rule is normalized from them.

## Evidence

SRC-MOBILE-APP send flow, slider button, loading modal, sending success screen; SRC-WEB-APP send page.
