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
