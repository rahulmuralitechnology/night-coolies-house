---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: []
---

## Scope

The whole app: one Operate surface (map + listings roster + detail + shortlist/compare/insights). Mode: operate.

## Job

Owner and friends scan ~14,000 live rentals within 10 km of the office (LTM Solaris, Hebbal), narrow by rent/BHK/area/source, shortlist and compare a few, then open the source listing. Phone and laptop equally.

## Direction contract

THESIS: The office is the depot and every home is a drop on tonight's cab roster: the list is ordered and grouped by km from the 🤡 office, and distance is always the loudest number. Refuses the property-portal default of photo cards on white with a blue accent.

OWN-WORLD: Night indigo shell (deep blue-violet grounds, never pure black) lit by Bengaluru sodium-streetlight amber as the one action/selection colour; dark CARTO map tiles. Barlow for UI text, Barlow Condensed with tabular figures for km, rent and counts. Dense roster rows with hairline dividers, right-aligned figures, small caps band headers. Rent bands as a night ramp: teal, periwinkle, amber, rose. Day mode is the same system on cool grey-white.

STORY: Visitor sees the whole market around the office at once, understands which sources loaded and how many homes each gave, narrows with filters that answer instantly, picks a home and sees its drop line from the office, shortlists, compares, and leaves for the source site.

FIRST VIEWPORT: Desktop: indigo app bar (brand + 🤡, search, source status chips with counts, theme/export/share). Map fills the left; the roster panel is docked on the right (owner asked for controls on the right), about 420px: filter row (rent range, BHK chips, more-filters button), result count + sort, then km-band sticky headers (0–2 km, 2–4 km…) over dense roster rows (km | title + locality + BHK/area | rent | source dot). Phone: full map, app bar, the roster and filters in a right-side drawer opened from a bottom "N homes" bar; detail as a bottom sheet.

FORM: Night-shift cab roster (candidate 7 of 7 on my grounded list, assigned). Signature move: selecting a home draws an amber dashed drop line from the office to it on the map with its km label, and the roster's km-band headers read as drop stops. Seed key 917fdfb5. Raises kept from declined challengers: dense rows without whitespace inflation (Japanese high-density web); one restrained type scale where rank is weight/case (timetable slide rack); right-aligned tight tabular figures (cassette j-card); source bar proportional to listing count (manual tab rail).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
