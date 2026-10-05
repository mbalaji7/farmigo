# Farmigo

A warm, responsive farm equipment marketplace built with **React, Vite, and TypeScript**. Uses USD pricing and sample listings in Iowa.

## Run locally

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

## Included

- Responsive marketplace with rent and buy views
- Separate marketplace (`/`), How it works (`/how-it-works`), and Our community (`/community`) pages, with direct links and browser history support
- Search and equipment listings lead the marketplace; the introductory hero lives on How it works
- Subtle page transitions, staggered card entrances, section reveals, and animated FAQ expansion, respecting reduced-motion preferences
- Equipment search by keyword and city, state, or ZIP
- Category, condition, and maximum-price filters; price sorting
- Shareable equipment detail pages (`/equipment/:id`) with photo galleries, fullscreen images, specifications, attachments, owner information, pickup details, and rental/purchase actions
- Saved equipment and demo listings persisted in browser localStorage
- Demo listing form with input validation
- Accessible dialogs with focus trapping, Escape dismissal, and keyboard controls
- Mobile navigation and reduced-motion support

This is a frontend prototype. Rental requests and purchase inquiries show a local confirmation and are not sent to owners. Production authentication, payments, live availability, messaging delivery, verification, and shared photo storage require a backend. Demo accounts, requests, conversations, and reviews are local browser data; uploaded photos are stored in IndexedDB. Sample listing photos are illustrative and include externally hosted images; production should use licensed owner-uploaded images. Google Fonts are loaded externally, with local system fallbacks.

When hosting the production build, configure the host to serve `index.html` for frontend routes such as `/community` and `/how-it-works`. Vite's development and preview servers handle these routes automatically.

## Eight priority features

1. **Equipment pages — implemented:** shareable URLs, galleries with keyboard controls and image fallbacks, specifications, pickup information, save/share actions, and rent/buy modes.

2. **Listing creation and editing — implemented:** drag-and-drop photo uploads (one to six JPG/PNG/WebP photos, at least 800 × 600 px and 10 MB each), resized browser-local IndexedDB image storage, cover selection, explicit draft saving/restoration, category-specific specs, and editing through your account. New rental listings start with sensible local-demo defaults: Tractors, Good condition, delivery enabled, and a $75 delivery fee; location and pricing require owner input.

3. **Owner dashboard — implemented:** `/dashboard` manages locally created listings, edit/pricing actions, active/paused/sold states, blocked availability dates, rental requests and purchase inquiries, and local accept/decline actions. A labeled sample-request button lets you try the workflow.

4. **Rental flow — implemented:** availability calendar and date-range validation, daily/weekly/30-day pricing, refundable deposits, pickup/delivery choices, itemized quotes, review and reference-number confirmation, and persisted rental/purchase requests linked to the dashboard. Accepted rentals reserve their dates; blocked dates and overlaps are rejected. Owners can configure rates and delivery in the listing editor. Run `npm test` for date, pricing, and availability boundary tests. No payments are processed.

5. **Accounts and profiles — implemented:** `/account` offers local demo sign-up/sign-in, sign-out, farm-profile editing, saved equipment, and account-linked request history with cancellation. Signed-in details prefill booking forms. Demo passwords are never persisted or validated; this is not production authentication. Listings created before the first demo account are associated with that account.

6. **Messaging — implemented:** `/messages` provides searchable equipment-linked conversations, persistent message threads, local read/unread state, a composer, equipment links, and mobile conversation navigation. Start from Message owner on an equipment page; explicit sample/reply controls demonstrate the owner side. Nothing is sent externally.

7. **Discovery and shareable search — implemented:** brand, horsepower range, model-year range, operating-hours, condition, price and distance filters combine with rent/buy, category, and sorting. Applied searches are encoded in URLs and restore on reload/back navigation. Radius searches use clearly labeled demo Iowa city-center estimates; no geolocation is collected. Use Copy search link to share your search. Numeric parsing, filter combinations, and distance behavior have automated tests.

8. **Owner profiles and reviews — implemented:** `/owners/:ownerId` shows a farm biography, location, active equipment, message action, review summaries, sorted sample/local reviews, and one local demo review per signed-in neighbor. Verification and response-time labels explain their illustrative status. User farm profiles populate their public demo owner pages; real transaction verification requires a backend.

## Verification

`npm run build` runs TypeScript checks and produces the production bundle. `npm test` covers rental pricing, date boundaries, availability conflicts, URL filter round trips, and radius/filter combinations. Browser smoke checks cover equipment URLs, gallery controls, uploaded photos, drafts, dashboard actions, booking confirmation, account sessions, persistent conversations, shareable searches, owner profiles, review persistence, and mobile layouts.

## Backend integration boundaries

- Replace local demo sessions with secure authentication; never use this demo sign-in as an authorization mechanism.
- Move listings, photos, requests, profiles, messages, and reviews to server-backed services. Browser storage is device-specific and users can modify it.
- Validate rates, availability, transport charges, ownership, and review eligibility on the server before accepting bookings or collecting payment.
- Replace demo city-center distance estimates with verified locations/geocoding and implement an actual verification process.
- Configure the production host to serve `index.html` for all frontend routes.

## Second priority feature batch

1. **Equipment comparison:** persist up to three selections, compare rental/purchase prices, specifications, attachments and transport side by side at `/compare`, and remove/clear selections. Mobile tables scroll within their own region. Shared readability improvements increase supporting text contrast, form text size, control targets, card spacing, and mobile typography.
2. **Date-based search:** optional start/end dates filter out blocked dates and accepted bookings, reject incomplete/past/overlong ranges, survive shared URLs, and prefill booking forms. A mobile booking bar links to the date controls. Availability remains browser-local.
3. **Map/list discovery:** a self-contained approximate Iowa city-center map groups matching listings, selects cities, and synchronizes the equipment list. Zoom and reset controls work with keyboard input. Locations outside the six demo cities remain visible in the list. This is a schematic map with no street routing or precise pickup coordinates; replace it with licensed map/geocoding services for production.
4. **Saved searches:** named filter/date snapshots at `/saved-searches` and in the marketplace, account/guest-specific local persistence, run/remove actions, and optional local new-match previews with seen-state controls. Applied filter chips can be removed independently. Email/push delivery requires a backend.
5. **Compatibility details:** owner-editable minimum tractor power, PTO, hitch, hydraulics, transport dimensions/weight, equipment-page details, comparison rows, and a preliminary tractor-fit checker. Unspecified requirements are never inferred; connection matches and mismatches still require owner confirmation.
6. **Rental progress:** `/rentals/:id` links from booking confirmation, account history, and dashboard requests. Accepted rentals progress through ready-for-pickup, in-use, and returned stages. Pickup instructions, persisted condition notes, and up to six device-local pickup/return photos accompany the timeline. Pending/declined/cancelled requests cannot advance. Real handovers and deposit handling require backend support.
7. **Equipment wanted:** `/wanted` provides a searchable/category-filtered board, signed-in demo posts with location, budget and needed-by dates, 30-day expiry, fulfilled/reopen controls, and owner responses attached to active matching listings. Duplicate offers are prevented. The sample post is labeled; posts and offers are local demo records with no external delivery.
8. **Owner insights:** `/insights` reports measured local listing views/save actions, real demo requests (excluding sample requests), accepted rental quote values excluding deposits, pending requests, recorded returns, daily-view trends, per-listing performance, and upcoming accepted rentals. Periods are selectable (7/30/90 days). No earnings or external analytics are fabricated; activity is browser-local and limited to the most recent 2,000 events. Dashboard/account navigation links to insights.

### Readability and verification for the second batch

Shared styling increases secondary text contrast, uses 16px form inputs, readable paragraph spacing, larger card/specification text, larger touch targets, responsive single-column mobile layouts, and contained scrolling for wide comparison/performance tables. A skip link, reduced-motion behavior, visible focus states, and semantic table headings support keyboard navigation. The README describes production boundaries for each feature. Run `npm run build` and `npm test`; browser checks verify comparison, date prefill, city pins, saved searches, compatibility, rental stages, wanted posts, insights, and desktop/mobile layouts. Layout checks cover 360px, 390px, 768px, 1024px and the default desktop viewport. Rental dates expand on demand so the initial search stays compact.

### Responsive spacing

The search form uses explicit grid columns: one aligned row on desktop, two rows on tablets, and stacked fields with a full-width action on phones. Optional rental dates expand into their own section, with keyboard order following the fields before the search action. Shared responsive gutters align the header and page content. Marketplace tools use consistent gaps, compact saved-search padding, and a grouped view/count/sort toolbar; empty filter chips consume no space.

Browser viewport checks cover 320–1440px, including both sides of the 700px and 1100px search breakpoints. Main pages are checked at 390px, 768px, and 1280px for page-level horizontal overflow. Expanded date controls, saved searches, and the mobile filter dialog are also checked. These checks use emulated viewport sizes rather than physical devices.

### Liquid glass appearance

Farmigo uses translucent, blurred surfaces across the header, marketplace tools, cards, dialogs, and footer. The fixed **Glass** button opens a Clear-to-Frosted slider; its setting is persisted in browser storage. Smooth scrolling is enabled for in-page navigation and reduced-motion preferences switch it off.
