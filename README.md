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

This is a frontend prototype. Rental requests and purchase inquiries show a local confirmation and are not sent to owners. Authentication, payments, real availability, messaging, and uploaded equipment photography require a backend. Listing photos are illustrative and hosted externally; production should use licensed owner-uploaded images. Google Fonts are loaded externally, with local system fallbacks.

When hosting the production build, configure the host to serve `index.html` for frontend routes such as `/community` and `/how-it-works`. Vite's development and preview servers handle these routes automatically.

## Prioritized frontend roadmap

1. **Equipment pages — implemented:** shareable URLs, galleries with keyboard controls and image fallbacks, specifications, pickup information, save/share actions, and rent/buy modes.

2. **Listing creation and editing — implemented:** drag-and-drop photo uploads (up to six JPG/PNG/WebP photos, 10 MB each), resized browser-local IndexedDB image storage, cover selection, explicit draft saving/restoration, category-specific specs, and editing through your account.

3. **Owner dashboard — implemented:** `/dashboard` manages locally created listings, edit/pricing actions, active/paused/sold states, blocked availability dates, rental requests and purchase inquiries, and local accept/decline actions. A labeled sample-request button lets you try the workflow.

4. **Rental flow — implemented:** availability calendar and date-range validation, daily/weekly/30-day pricing, refundable deposits, pickup/delivery choices, itemized quotes, review and reference-number confirmation, and persisted rental/purchase requests linked to the dashboard. Accepted rentals reserve their dates; blocked dates and overlaps are rejected. Owners can configure rates and delivery in the listing editor. Run `npm test` for date, pricing, and availability boundary tests. No payments are processed.
