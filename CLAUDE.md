# Everyday AI — marketing site

Single-page static marketing site for Bernie's freelance AI-builds-for-individuals service.
No framework, no build step, no dependencies.

## Commands

- Run: `npm run dev` → http://localhost:8080
- Test: `npm test` (node --test; needs no install)

## Layout

- `index.html` — all copy, all demo cards (`data-demo` ids)
- `css/style.css` — design tokens at the top (`:root`), then components
- `js/main.js` — modal plumbing, nav, scroll reveal (ES module)
- `js/demos.js` — one registry entry per demo; `render(container)` builds the modal body
- `test/site.test.js` — keeps HTML cards ↔ demo registry in sync, smoke-tests the server

## Conventions

- Vanilla ES modules only; no npm dependencies without a strong reason.
- User-typed input must go through `esc()` (demos.js) or `textContent` — never raw into
  innerHTML.
- Demos are honest simulations: canned/sample data, always labeled as demos in the modal
  footer. Don't present them as live AI.
- Charts follow the dataviz specs already in place: single hue `#0d9488` (validated),
  bars ≤ 24px with 4px rounded data-ends, 2px sparklines, values in ink not series color.
- Content placeholders (prices, brand, email) are marked with `EDIT ME` comments in
  index.html.

## Default risk tier

Tier 1 (local static site, reversible, loud failures). Bump to Tier 2 if a backend, form
handling, payments, or deployment automation is ever added.
