# Onboarding

Status: observed (shipped flow); proposed for the refreshed illustrations (IB-04)

## Purpose

Take someone from installing the app to owning a forever profile without crypto knowledge, in one sitting, while being honest about the one irreversible choice.

## Flow

1. **Intro carousel.** Five swipeable slides, one bold phrase each, with a soft-object illustration: you are about to create a Universal Profile; it is a public account for the new web; it lives on the LUKSO blockchain and is truly yours; this device is the first controller and no one else has control; create your first forever profile. Swipe hint below; a primary button on the last slide.
2. **Device security.** Biometric or passcode prompt with a plain explanation of what it protects.
3. **Choose your forever address.** A horizontal carousel of pre-derived addresses shown as identicons; the user swipes to the one they like. Copy makes the consequence explicit ("You can not change your address, so choose wisely."). Primary button "Let's go!".
4. **Profile details.** Name, description, photo (camera or library), tags and links, with inputs from `../components/input.md`; a live preview card shows the Address Signature forming.
5. **Deployment.** The loading modal with visible steps ("Initiating Universal Profile", "Uploading profile data"), gasless through the relayer; then the home screen with the new profile's panel.
6. **Testnet notice** where applicable: the network tag and a warning agreement before continuing.

## Rules

- The profile card preview is the hero of steps 3 to 5; the identicon the user picked becomes the badge everywhere.
- One idea per slide, one primary action per screen, no skippable consequences: the forever-address warning cannot be hidden.
- Playful exclamations are allowed here and nowhere else.
- Never mention seed phrases (there are none), gas prices, or counts of existing profiles.
- Illustrations follow the soft-object family; the current set with magenta bleed is replaced by IB-04 when produced.

## Accessibility

Carousel slides are reachable with next and previous buttons; the swipe hint is not the only affordance. Identicons in the address carousel have accessible names built from the truncated address. Reduced motion disables the slide parallax and the shimmer. Every step's primary button is 48 high and full width.

## Status

Flow observed in the shipped app; illustration refresh proposed. The two-button "Create or Import" first screen on the brand board is obsolete.

## Evidence

SRC-MOBILE-APP onboarding strings, get-started carousel (its four illustrations are republished under `../assets/slides/onboarding/`, decision 0011), choose-identicon screen and form, deployment steps; SRC-FIGMA-UP-BOARD create-profile frame 1737:1009 (superseded flow; corroborates neutral tokens and the cube hero); SRC-FIGMA-MOBILE-UPDATES deployment screens 672:29382 and 672:30132 (an exploration, exported under `../assets/screenshots/mobile-app/`; not the shipped gasless flow).
