---
name: Night Coolies House
description: Every rental within 10 km of the office on one night map, read like a cab drop roster.
colors:
  sodium-amber: "#FFB23F"
  sodium-amber-deep: "#E09520"
  sodium-amber-ink: "#1F1400"
  sodium-wash: "rgba(255, 178, 63, 0.14)"
  pin-periwinkle: "#8F9BFF"
  night-ground: "#0E1126"
  night-paper: "#161A35"
  night-raised: "#1E2344"
  input-well: "rgba(0, 0, 0, 0.18)"
  moonlight-text: "#ECEAF6"
  dusk-text: "#A3A8CC"
  faded-text: "#6B7099"
  hairline: "rgba(160, 170, 235, 0.14)"
  tooltip-ink: "#2A3058"
  shell-bar: "#151935"
  shell-muted: "#A9AEDA"
  band-budget: "#3DD6A3"
  band-mid: "#6CB8FF"
  band-upper: "#B490FF"
  band-premium: "#FF6B8B"
  alert-rose: "#FF6B81"
  day-amber: "#9A5B00"
  day-amber-deep: "#7A4700"
  day-periwinkle: "#4B55C8"
  day-ground: "#E9EBF5"
  day-paper: "#FFFFFF"
  day-raised: "#F3F4FA"
  day-text: "#171A33"
  day-text-secondary: "#555A7C"
  day-hairline: "rgba(30, 35, 80, 0.12)"
  day-tooltip-ink: "#22264A"
  day-band-budget: "#0E9E70"
  day-band-mid: "#2F7FD8"
  day-band-upper: "#7B52DB"
  day-band-premium: "#D93A5C"
  day-alert-rose: "#C62F4B"
typography:
  brand:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.35
  row-title:
    fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
  caption:
    fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
  band-header:
    fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "0.12em"
  button:
    fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    letterSpacing: "0.01em"
  figure:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.1
    fontFeature: "\"tnum\""
  figure-large:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "\"tnum\""
rounded:
  swatch: "2px"
  label: "6px"
  button: "8px"
  base: "10px"
  chip: "16px"
  sheet: "16px"
  photo: "20px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  app-bar:
    backgroundColor: "{colors.shell-bar}"
    textColor: "{colors.moonlight-text}"
    typography: "{typography.brand}"
    height: "56px"
  button-primary:
    backgroundColor: "{colors.sodium-amber}"
    textColor: "{colors.sodium-amber-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "6px 16px"
  button-primary-hover:
    backgroundColor: "{colors.sodium-amber-deep}"
    textColor: "{colors.sodium-amber-ink}"
  button-homes-pill:
    backgroundColor: "{colors.sodium-amber}"
    textColor: "{colors.sodium-amber-ink}"
    rounded: "{rounded.pill}"
    padding: "8px 24px"
  button-pin:
    backgroundColor: "{colors.night-paper}"
    textColor: "{colors.pin-periwinkle}"
    rounded: "{rounded.button}"
    padding: "5px 15px"
  input-search:
    backgroundColor: "{colors.input-well}"
    textColor: "{colors.moonlight-text}"
    typography: "{typography.body}"
    rounded: "{rounded.base}"
    padding: "8.5px 14px"
  chip-band:
    backgroundColor: "{colors.night-paper}"
    textColor: "{colors.dusk-text}"
    rounded: "{rounded.chip}"
    height: "24px"
  toggle-bhk-selected:
    backgroundColor: "{colors.sodium-wash}"
    textColor: "{colors.sodium-amber}"
    typography: "{typography.button}"
    padding: "4px 12px"
  roster-panel:
    backgroundColor: "{colors.night-paper}"
    width: "420px"
  band-header:
    backgroundColor: "{colors.night-paper}"
    textColor: "{colors.sodium-amber}"
    typography: "{typography.band-header}"
    height: "32px"
    padding: "0 16px"
  roster-row:
    backgroundColor: "{colors.night-paper}"
    textColor: "{colors.moonlight-text}"
    typography: "{typography.row-title}"
    padding: "8px 16px"
  roster-row-selected:
    backgroundColor: "{colors.sodium-wash}"
    textColor: "{colors.sodium-amber}"
  detail-card:
    backgroundColor: "{colors.night-paper}"
    rounded: "{rounded.base}"
    padding: "16px"
    width: "380px"
  detail-sheet:
    backgroundColor: "{colors.night-paper}"
    rounded: "{rounded.sheet}"
    padding: "16px"
  drop-label:
    backgroundColor: "{colors.sodium-amber}"
    textColor: "{colors.sodium-amber-ink}"
    typography: "{typography.figure}"
    rounded: "{rounded.label}"
    padding: "2px 8px"
  tooltip:
    backgroundColor: "{colors.tooltip-ink}"
    textColor: "{colors.moonlight-text}"
    typography: "{typography.caption}"
---

# Design System: Night Coolies House

## Overview

**Creative North Star: "The Night Cab Roster"**

The office is the depot and every home is a drop on tonight's cab roster. The map is a night city in deep blue-violet, never pure black, and the only warm light in it is Bengaluru sodium-streetlight amber. Amber marks whatever you can act on and whatever you have picked. Everything else stays cool: the indigo shell, the moonlit text, the rent ramp of teal, periwinkle, violet and rose.

The roster is dense on purpose. Rows are about 52px tall, separated by hairline dividers, with right-aligned tabular figures. Distance from the 🤡 office is always the loudest number on screen. Rank comes from weight, case and the condensed figure face, not from a big type scale or whitespace. Day mode is the same system on cool grey-white with darker inks; the app bar stays night indigo in both modes.

The system refuses the property-portal default of photo cards on white with a blue accent. Photos appear only inside the detail view, never as the unit of the list.

**Key Characteristics:**
- Night indigo grounds layered by tone (ground, paper, raised), never pure black.
- One warm accent, sodium amber, used only for action and selection.
- Distance leads every row and every detail, set in Barlow Condensed with tabular figures.
- Rent is encoded as a four-step cool-to-warm night ramp on map dots, band dots and chips.
- The map always shows the office, the 2 km stop rings and the 10 km boundary. Selecting a home draws an amber dotted drop line out to it.
- The 🤡 office marker and favicon are a fixed brand commitment.

## Colors

The palette is a cool night: blue-violet neutrals, one sodium-amber light source, and a separate four-step rent ramp that never uses amber.

### Primary
- **Sodium Amber** (night `sodium-amber`, day `day-amber`): primary buttons, the "N homes" pill, the selected roster row's km figure, km-band header text, the detail view's km figure, the drop line, the selected marker ring, the km drop label, stop rings, shortlist hearts, focus outlines, text selection, the input caret, badges and the brand wordmark. Day mode uses a darker amber so it passes contrast on white.
- **Sodium Amber Deep** (`sodium-amber-deep` / `day-amber-deep`): the hover and pressed state of filled amber controls.
- **Sodium Ink** (`sodium-amber-ink`): text on filled amber (buttons, the pill, the drop label).
- **Sodium Wash** (`sodium-wash`, amber at 14%): the background of the selected roster row and of selected BHK toggles. Text selection uses amber at 35%.

### Secondary
- **Pin Periwinkle** (`pin-periwinkle` / `day-periwinkle`): reserved for geometry the user places. It colours the "Drop a pin" button, the teardrop pin, the dashed 2 km pin circle (fill at 6%) and the active-pin chip border.

### Tertiary: the rent ramp
- **Budget Teal** (`band-budget` / `day-band-budget`): rent under ₹10k.
- **Periwinkle** (`band-mid` / `day-band-mid`): ₹10k–20k.
- **Night Violet** (`band-upper` / `day-band-upper`): ₹20k–35k.
- **Rose** (`band-premium` / `day-band-premium`): ₹35k and up.

The ramp colours map markers (fill at 90% with a ground-coloured stroke), 7–10px band dots in rows, the legend and the detail view, and the rent filter chips (selected chips fill with the band colour at about 18%).

### Neutral
- **Night Ground** (`night-ground` / `day-ground`): the app and map background, and the stroke around map dots.
- **Night Paper** (`night-paper` / `day-paper`): panels, the roster, the detail card and sheet, sticky headers, the legend and attribution.
- **Night Raised** (`night-raised` / `day-raised`): placeholder backgrounds behind loading photos.
- **Shell Bar** (`shell-bar`, with `moonlight-text` and `shell-muted`): the app bar in both modes, and the browser theme colour.
- **Moonlight / Dusk / Faded Text** (`moonlight-text`, `dusk-text`, `faded-text`; day `day-text`, `day-text-secondary`): primary, secondary and disabled text.
- **Hairline** (`hairline` / `day-hairline`): every divider, row rule, input outline, toggle border, panel edge and Leaflet control border.
- **Tooltip Ink** (`tooltip-ink` / `day-tooltip-ink`): the tooltip background.
- **Alert Rose** (`alert-rose` / `day-alert-rose`): failed-source icons and the "no source reached" message.

### Named Rules
**The Sodium Light Rule.** Amber means "act here" or "this is the one you picked". It never encodes data, so it never appears in the rent ramp, and a non-interactive surface never gets an amber fill.

**The Hue-Is-Rent Rule.** Hue on the map and in the roster encodes rent and nothing else. Sources are told apart by name, position and amber opacity shades (100, 72, 52, 36, 24%), never by their own hues.

**The Never-Black Rule.** Dark grounds are blue-violet (`night-ground` and up). Pure #000 appears only as a translucent darkener (the input well, shadows).

## Typography

**Display Font:** Barlow Condensed (with Barlow, system-ui)
**Body Font:** Barlow (with system-ui, -apple-system, Segoe UI)

**Character:** A cab-company timetable. Barlow carries the labels plainly. Barlow Condensed with tabular figures sets every number you compare (km, rent, counts) so the columns line up like a duty sheet.

### Hierarchy
- **Brand** (700, 1.375rem, 1.1, Condensed): the "Night Coolies House" wordmark in amber in the app bar (1.25rem on phones).
- **Headline** (700, 1.125rem, 1.3): the listing title in the detail view and the "Homes" drawer title.
- **Title** (600, 1rem, 1.35): empty-state headings.
- **Row Title** (600, 0.875rem, 1.35): the roster row's place name (society, locality), one line with ellipsis.
- **Body** (400, 0.875rem, 1.45): descriptions (max 65ch, clamped to 5 lines with "Read full description"), result counts and the sort select.
- **Caption** (400, 0.75rem, 1.4): facts lines (BHK · sqft · furnishing), source names, units, fact labels and the app bar subline.
- **Band Header** (600, 0.6875rem, 0.12em, uppercase): the sticky "0–2 km from office" stop headers, in amber.
- **Figure** (600, Condensed, tabular): roster km at 20px, roster rent at 17px, result counts at 18px, the pill count at 19px, the drop label at 14px/700.
- **Figure Large** (700, 2rem, Condensed, tabular): rent and km in the detail view. The km figure is amber with an 18px "km" unit.

### Named Rules
**The Tabular Figure Rule.** Any number a user compares (km, rent, count) is set in the figure face with tabular numerals and right-aligned in its column. Inline counts in body text still use `tabular-nums`.

**The Loudest Number Rule.** Distance is the largest figure in a roster row (20px vs. 17px for rent) and shares top billing with rent in the detail view. Nothing else in a row is set larger.

## Layout

**Desktop (md, 900px and up):** an indigo app bar (56px, dense toolbar) over a two-column body. The map fills the left. A 420px roster panel docks on the right with a hairline left edge. It holds the Roster / Shortlist / Insights tabs (44px), the source bar and filters, the count and sort, then the scrolling roster. Selecting a home floats a 380px detail card over the map's top-right corner (12px inset, maximum height to the map bottom minus 40px). The map's floating controls shift left so they never sit under the card. The legend sits bottom-left of the map.

**Phone (below 900px):** a 52px app bar with the secondary actions in a "more" menu, and the map fills the rest. A centred amber pill ("6,709 homes") sits 28px above the bottom and opens the roster as a right drawer (min(92vw, 440px)) with a "Homes" title row. Selecting a home closes the drawer and opens the detail as a persistent bottom sheet (top corners 16px), capped at 60dvh. The sheet scrolls, and its action bar stays pinned to the bottom.

**Map framing:** on select, the map flies (0.6s) to the bounds of office plus home, padded so the whole drop line lands in the area no panel covers. On desktop that means the card width plus 64px on the right; on phone, the sheet height plus 24px at the bottom.

**Roster row grid:** `52px | 1fr | auto` (km | place + facts | rent + source), 12px gaps, 8px × 16px padding, hairline bottom rule. Rows load in pages of 80 through an intersection sentinel. Picking a home on the map reveals and scrolls to its row.

**Spacing rhythm:** an 8px base with 4, 6, 8, 12, 16, 24 and 32px steps in use. Panel sections pad 16px. Filter stacks gap 12px, and the panel's main blocks gap 16px.

## Elevation & Depth

Depth is mostly tonal: ground, paper, raised and the hairline do the work, and MUI's dark-mode overlay gradient is turned off (`backgroundImage: none`), so paper stays the declared colour. Shadows appear only on things that float over the map. Panels docked to the frame (app bar, roster aside, legend) have no shadow.

### Shadow Vocabulary
- **Map control** (MUI elevation 3): "Drop a pin" button and active-pin chip.
- **Homes pill** (MUI elevation 6): the phone "N homes" pill.
- **Floating card** (MUI elevation 8, plus hairline border): the desktop detail card.
- **Bottom sheet** (MUI elevation 12, plus hairline top border): the phone detail sheet.
- **Map label** (`0 2px 8px rgba(0,0,0,0.35)`): the amber km drop label. The office label uses the same shadow at 0.3.
- **Emoji lift** (`drop-shadow(0 2px 4px rgba(0,0,0,.45))`): the 🤡 office marker.

### Named Rules
**The Float-Only Shadow Rule.** A surface gets a shadow only when it floats over the map. Docked chrome stays flat and is separated by hairlines.

## Shapes

Gently rounded and functional. The theme base is 10px (inputs, the detail card, the Leaflet zoom bar). Buttons tighten to 8px, map labels to 6px (drop label) and 8px (office label), and source swatches to 2px squares. Band dots are true circles. The phone pill, the source bar (6px tall) and chips are capsules. Listing photos round at 10px and scroll-snap horizontally, at 180px tall and 260px wide (full width when there is only one). The bordered shortlist and compare buttons in the detail action bar use the 8px button radius. The bottom sheet rounds only its top corners (16px). On the map, stop rings and the drop line are dotted (round caps); the pin radius is dashed.

## Components

### Buttons
- **Shape:** gently rounded (8px); no elevation; no uppercase.
- **Primary:** filled sodium amber with sodium-ink text, 600 weight. Used for "Open on {source}" (full width in the action bar, with an open-in-new icon) and the phone pill.
- **Hover / Focus:** hover deepens to amber-deep. Focus is a 2px amber outline at 2px offset, applied globally through `:focus-visible`.
- **Text / Outlined:** amber text buttons for in-panel actions ("More", "Clear all filters", "Read full description"). Outlined for "Compare" and empty-state recovery. App-bar buttons inherit the shell text colour.
- **Pin control:** periwinkle outlined on paper with the map-control shadow; turns filled periwinkle while waiting for a tap.

### Chips
- **Rent band chips:** small (24px) capsules with a leading band dot. Unselected chips are outlined with a hairline border and dusk text. Selected chips fill with the band colour at about 18%, with moonlight text and no border.
- **Pin chip:** paper background with a periwinkle border and icon, showing "N homes within 2 km of pin", and deletable.

### Toggle buttons (BHK)
- Hairline-bordered segmented group (Any, 1, 2, 3, 4+), 600 weight, 4px × 12px. The selected segment gets amber text on sodium wash.

### Cards / Containers
- **Detail card (desktop):** night paper, 10px radius, hairline border, floating-card shadow, 380px wide, 16px padding, content-height.
- **Detail sheet (phone):** night paper, top corners 16px, bottom-sheet shadow, capped at 60dvh.
- **Detail content order:** title and summary with a close button, photo strip, then figure-large rent (band dot plus "per month") beside the amber km figure ("from office, straight line" or "approx."). Then a three-column fact grid (caption label over 600-weight value), the approximate-location notice for OLX, the clamped description, and a sticky action bar (primary button, then bordered heart and compare buttons that turn amber when on).
- **Legend:** paper, hairline border, no shadow, "Rent / month" caption over four dot-plus-label rows.

### Inputs / Fields
- **Style:** small outlined fields on a translucent dark well (paper in day mode), 10px radius, hairline outline, leading search icon, amber caret.
- **Focus:** MUI outline in amber (primary), plus the global focus ring on keyboard focus.
- **Sort:** a borderless standard select at 600 weight, right of the result count.

### Navigation
- **App bar:** shell-bar indigo in both modes with a muted hairline bottom border. It holds the amber condensed wordmark over a muted caption ("Homes within 10 km of …"), a compare icon with an amber count badge, then Refresh, Export CSV, Share and the theme toggle. Phones collapse these into a "more" menu. A 2px amber progress line runs along the bar's bottom while sources load.
- **Panel tabs:** full width, 44px, 600 weight, sentence case, with the amber indicator.

### Source Bar (signature)
A 6px capsule split in proportion to each source's listing count, in amber opacity shades. Below it, each source is a toggle (2px-square swatch, name, tabular count, or a spinner or rose error icon). Inactive sources dim to 45% (20% in the bar). Bar segments ease their width over 600ms (`cubic-bezier(0.16, 1, 0.3, 1)`) as sources finish loading.

### Roster Row and Stop Headers (signature)
Each row leads with distance: a right-aligned 20px figure over a "km" caption, which turns amber when the row is selected. Next comes the **place** (society, locality), not the listing's boilerplate title, over a caption facts line, with an amber heart if shortlisted. On the right sits the rent (7px band dot plus 17px figure) over the source name as a plain caption. When sorted by distance, sticky 32px stop headers split the list every 2 km ("2–4 km from office", amber band-header type, with a dusk "N homes" count on the right).

### Map Drop Line (signature)
- **Office:** the 🤡 emoji at 34px with a drop shadow, always on top, with an "Office · LTM Tower S2, Solaris" label on hover.
- **Stop rings:** faint amber dotted circles every 2 km (1px, 22% opacity, dash 2/10). They match the roster's stop headers. The 10 km boundary is stronger (1.5px, 55%, dash 2/8).
- **Home dots:** canvas circle markers filled with the rent-band colour and stroked in the ground colour. Radius steps up with zoom: 2.5px at zoom 12 or below, 3.5px at 13, 5px at 14, 6.5px at 15 and above.
- **Hover (desktop):** hovering a roster row draws a 10px moonlight ring on its dot.
- **Selected:** an amber dotted drop line (3px, dash 1/9, round caps) runs from the office to the home. The home becomes a 12px band-filled marker with a 3px amber ring inside a 15px ground-coloured halo. The amber km label is attached to its right.
- **Tiles:** Esri Canvas World Dark Gray (day: Light Gray) base plus reference label layers. A CSS filter on the base layer only tints it toward indigo. Night: `brightness(0.5) sepia(1) hue-rotate(200deg) saturate(2.4) contrast(1.05)`. Day: `sepia(0.4) hue-rotate(195deg) saturate(1.4)`. Labels stay untinted.

## Do's and Don'ts

### Do:
- **Do** lead every listing row and detail with distance from the office, in the figure face, larger than rent.
- **Do** keep amber for action and selection only: primary buttons, selected rows and toggles, the drop line, the km label, focus, caret and selection.
- **Do** encode rent with the four-band ramp (teal, periwinkle, violet, rose) and show the band dot next to every rent figure.
- **Do** name a listing by its place (society, locality) in lists. Keep the source's title for the detail headline.
- **Do** keep the 2 km stop rings on the map and the 2 km stop headers in the distance-sorted roster in step (both driven by the 2 km band).
- **Do** frame office and home together in the uncovered part of the map whenever a home is selected.
- **Do** keep the 🤡 office marker and favicon exactly as shipped. They are a brand commitment.
- **Do** separate docked surfaces with hairlines and reserve shadows for what floats over the map.

### Don't:
- **Don't** put amber, or any hue reserved for action, into the rent ramp or any other data encoding.
- **Don't** give sources their own hues. Distinguish them by name, order and amber opacity shades.
- **Don't** use pure black grounds or MUI's dark-mode paper gradient. Grounds are blue-violet tonal layers.
- **Don't** build list rows as photo cards. Photos live only in the detail view's scroll strip.
- **Don't** use the boilerplate listing title ("2 BHK Flat for Lease In …") as a roster row's main line.
- **Don't** replace the Esri Canvas tiles with CARTO basemaps (they now require an API key), and don't apply the tint filter to the label layer.
- **Don't** replace the 🤡 marker with a generic pin or logo.
