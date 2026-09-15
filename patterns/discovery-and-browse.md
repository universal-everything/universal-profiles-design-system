# Discovery and Browse

Status: observed for the home grid and Browse; normalized for naming ("Browse", never "Discover")

## Purpose

Help people find apps and profiles through their own home screen first, then through Browse, without a store metaphor.

## Flow

- **Home = identity gateway**: the cover as wallpaper, the four-column app grid over it (default apps first, user-added apps after, the add tile last), the profile panel from the bottom, the five-slot bar with the raised Browse action, the network tag top left, scan and settings top right, multi-profile paging dots.
- **Browse** (centre action): the apps directory grouped by category with app tiles and short descriptions, a search field, and a "recently used" row.
- **Web**: the collapsible apps sidebar, the apps page, trending profiles and collections; the Grid on profile pages holds widgets.
- **Adding an app**: from Browse or the add tile; the tile appears in the grid; long press reorders or removes.

## Rules

- The section is called Browse in every product; "Discover" is retired.
- Tiles show the app's own icon; the system never redraws partner icons.
- The grid never exceeds the width-derived column count; labels are one line.
- Profiles in discovery surfaces are shown as compact profile rows with the badge and suffix.

## Accessibility

Tiles and rows have full names; the grid is a list for assistive technology with a position count; the centre action is labelled "Browse". Long-press edit mode has a menu alternative.

## Status

Observed; naming normalized.

## Evidence

SRC-MOBILE-APP home apps list, default apps order, Browse tab, apps directory; SRC-WEB-APP sidebar and apps pages. The pre-redesign "Discover" tab is obsolete (see `obsolete.md`).
