# Everyday AI — marketing site

Single-page marketing site for a freelance "I build AI-powered tools for your everyday life"
service. Plain HTML/CSS/JS, zero dependencies. Ten interactive, simulated product demos show
visitors what a personal AI tool can do.

## Run

```sh
npm run dev        # serves the site at http://localhost:8080
```

(Or open `index.html` directly in a browser — everything is static.)

## Test

```sh
npm test           # node --test: structure checks + server smoke test
```

## Layout

- `index.html` — all page content and the demo cards
- `css/style.css` — the whole design system
- `js/main.js` — nav, modal plumbing, scroll reveals
- `js/demos.js` — the 10 interactive demo implementations (one entry per card)
- `server.js` — zero-dependency static dev server
- `test/site.test.js` — structural tests + server smoke test

## Editing content

- Prices, brand name, and contact email are plain text in `index.html` — search for
  `EDIT ME` comments.
- To add a demo: add a card in `index.html` with `data-demo="<id>"` and register the same
  id in `js/demos.js`. The test suite fails if the two ever drift apart.
