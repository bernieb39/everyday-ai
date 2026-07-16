import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { demos } from '../js/demos.js';
import { createSiteServer } from '../server.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const PAGES = ['index.html', 'everyday.html', 'business.html'];
const pages = {};
for (const p of PAGES) pages[p] = await readFile(join(root, p), 'utf8');

test('demo cards on the everyday page stay in sync with the registry', () => {
  const cardIds = [...pages['everyday.html'].matchAll(/data-demo="([^"]+)"/g)].map((m) => m[1]);
  const registryIds = Object.keys(demos);
  assert.deepEqual(new Set(cardIds), new Set(registryIds));
  assert.equal(cardIds.length, new Set(cardIds).size, 'duplicate data-demo ids in HTML');
  assert.equal(registryIds.length, 10, 'the site promises ten demos');
  // full demo cards live on the everyday page only
  assert.doesNotMatch(pages['index.html'], /data-demo="/);
  assert.doesNotMatch(pages['business.html'], /data-demo="/);
});

test('inline demo links point at real registry entries', () => {
  for (const [name, html] of Object.entries(pages)) {
    for (const [, id] of html.matchAll(/data-demo-link="([^"]+)"/g)) {
      assert.ok(id in demos, name + ': data-demo-link to unknown demo "' + id + '"');
    }
  }
});

test('every demo entry is complete', () => {
  for (const [id, demo] of Object.entries(demos)) {
    assert.ok(demo.icon, id + ': missing icon');
    assert.ok(demo.title, id + ': missing title');
    assert.ok(['One-shot build', 'Ongoing service'].includes(demo.package),
      id + ': package must match a package name shown on the site');
    assert.equal(typeof demo.render, 'function', id + ': render must be a function');
  }
});

test('demo package mix shows both package types', () => {
  const pkgs = Object.values(demos).map((d) => d.package);
  assert.ok(pkgs.includes('One-shot build'));
  assert.ok(pkgs.includes('Ongoing service'));
});

test('internal anchors resolve to element ids on their own page', () => {
  for (const [name, html] of Object.entries(pages)) {
    const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    assert.ok(anchors.length > 0, name + ': expected some internal anchors');
    for (const a of anchors) {
      assert.ok(html.includes('id="' + a + '"'), name + ': broken anchor #' + a);
    }
  }
});

test('cross-page links point at pages that exist', () => {
  for (const [name, html] of Object.entries(pages)) {
    const links = [...html.matchAll(/href="([^"#]+\.html)"/g)].map((m) => m[1]);
    for (const l of links) {
      assert.ok(PAGES.includes(l), name + ': link to unknown page ' + l);
    }
  }
  // every audience page is reachable from the landing page
  assert.ok(pages['index.html'].includes('href="everyday.html"'));
  assert.ok(pages['index.html'].includes('href="business.html"'));
});

test('referenced local assets exist on disk', async () => {
  for (const [name, html] of Object.entries(pages)) {
    const refs = [...html.matchAll(/(?:href|src)="(?!https?:|mailto:|data:|#)([^"]+)"/g)].map((m) => m[1]);
    assert.ok(refs.includes('css/style.css'), name + ': stylesheet not referenced');
    assert.ok(refs.includes('js/main.js'), name + ': main.js not referenced');
    for (const ref of refs) {
      await assert.doesNotReject(access(join(root, ref)), name + ': missing asset ' + ref);
    }
  }
});

test('HTML basics on every page: title, viewport, lang, one h1', () => {
  for (const [name, html] of Object.entries(pages)) {
    assert.match(html, /<title>[^<]+<\/title>/, name);
    assert.match(html, /name="viewport"/, name);
    assert.match(html, /<html lang="en">/, name);
    assert.equal([...html.matchAll(/<h1[\s>]/g)].length, 1, name + ': exactly one h1');
  }
});

test('main.js is valid syntax and fails only on missing DOM in Node', async () => {
  // A parse error would throw SyntaxError; reaching the ReferenceError proves the
  // module parses and is genuinely DOM-dependent (as documented in CLAUDE.md).
  await assert.rejects(import('../js/main.js'), /document is not defined/);
});

test('server serves the site end-to-end', async () => {
  const server = createSiteServer();
  await new Promise((r) => server.listen(0, r));
  const base = 'http://localhost:' + server.address().port;
  try {
    const home = await fetch(base + '/');
    assert.equal(home.status, 200);
    assert.match(home.headers.get('content-type'), /text\/html/);
    assert.match(await home.text(), /Everyday AI/);

    for (const p of ['everyday.html', 'business.html']) {
      const page = await fetch(base + '/' + p);
      assert.equal(page.status, 200, p);
      assert.match(page.headers.get('content-type'), /text\/html/, p);
    }

    const css = await fetch(base + '/css/style.css');
    assert.equal(css.status, 200);
    assert.match(css.headers.get('content-type'), /text\/css/);

    const js = await fetch(base + '/js/demos.js');
    assert.equal(js.status, 200);
    assert.match(js.headers.get('content-type'), /javascript/);

    const missing = await fetch(base + '/nope.html');
    assert.equal(missing.status, 404);

    const traversal = await fetch(base + '/../../../../etc/passwd');
    assert.notEqual(traversal.status, 200);
  } finally {
    server.close();
  }
});
