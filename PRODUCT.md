# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The owner and a few friends looking for a rental home near their office, LTM Tower S2, Solaris (Hebbal, Bengaluru, 13.0690331, 77.5919998). They use it on both phone and laptop, in short sessions while house-hunting: scanning what's available nearby, narrowing by budget and size, comparing a few, and opening the original listing to contact the owner.

## Product Purpose

Night Coolies House puts every rental within 10 km of the office on one map, pulled live from several listing sites at once, so nobody has to search each site separately. Success is finding a shortlist of realistic homes (right rent, right size, short commute) quickly, then jumping to the source listing.

## Positioning

One map that merges OLX, NoBroker, MagicBricks, Square Yards and Stanza Living listings around a single fixed point (the office), measured by distance from it. No listing site offers a cross-site view centred on your own commute.

## Operating Context

- Listings are fetched live on every page load; nothing is stored server-side.
- Thousands of listings (around 14,000 within 10 km) render at once; NoBroker supplies most of them.
- Users click through to the original site to contact owners; the app does not handle contact, booking or payment.
- Deployed on Netlify; all sources other than OLX are proxied (Vite dev proxy locally, `public/_redirects` on Netlify).

## Capabilities and Constraints

- Sources: OLX (approximate area-level coordinates), NoBroker (exact, distance-sorted API), MagicBricks and Square Yards (scraped from search pages by nearby localities), Stanza Living (PGs, priced per bed).
- Filters: text search, rent range, area range, BHK, furnishing, listed by, source; sort by price, distance, date.
- Features: favourites, compare up to 3, CSV export, shareable filter URL, price-band legend, analytics summary, dark mode, click-to-set a custom centre with a radius circle.
- Stack: React 18 + Vite + react-leaflet with OpenStreetMap tiles. The redesign uses MUI (requested by the owner).
- Scraped sources can break when sites change their markup; the UI must tolerate a source returning zero results.
- Same home may appear on multiple sites; no cross-site de-duplication.
- Favourites and compare are in-memory only (lost on reload) — undecided whether to persist.

## Brand Commitments

- Name: "Night Coolies House" — keep.
- The clown 🤡 marker for the office location — keep (owner's explicit choice; it's an in-joke).

## Evidence on Hand

Live listing data only. No testimonials, users, metrics or claims exist; do not fabricate any.

## Product Principles

- The commute is the anchor: distance from the office is always visible and sortable.
- Show the whole market, then narrow fast: filtering must feel instant even with thousands of listings.
- Be honest about the data: say where each listing comes from, when coordinates are approximate, and when a source failed.
- Get out of the way on a phone: the map stays usable; controls appear when asked for.
