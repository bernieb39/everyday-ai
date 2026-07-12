import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { demos } from '../js/demos.js';
import { createSiteServer } from '../server.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const html = await readFile(join(root, 'index.html'), 'utf8');

test('demo cards in HTML and demo registry stay in sync', () => {
  const cardIds = [...html.matchAll(/data-demo="([^"]+)"/g)].map((m) => m[1]);
  const registryIds = Object.keys(demos);
  assert.deepEqual(new Set(cardIds), new Set(registryIds));
  assert.equal(cardIds.length, new Set(cardIds).size, 'duplicate data-demo ids in HTML');
  assert.equal(registryIds.length, 10, 'the site promises ten demos');
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

test('internal anchors resolve to element ids', () => {
  const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  assert.ok(anchors.length > 0);
  for (const a of anchors) {
    assert.ok(html.includes('id="' + a + '"'), 'broken anchor: #' + a);
  }
});

test('referenced local assets exist on disk', async () => {
  const refs = [...html.matchAll(/(?:href|src)="(?!https?:|mailto:|data:|#)([^"]+)"/g)].map((m) => m[1]);
  assert.ok(refs.includes('css/style.css'));
  assert.ok(refs.includes('js/main.js'));
  for (const ref of refs) {
    await assert.doesNotReject(access(join(root, ref)), 'missing asset: ' + ref);
  }
});

test('HTML basics: title, viewport, lang, one h1', () => {
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /<html lang="en">/);
  assert.equal([...html.matchAll(/<h1[\s>]/g)].length, 1);
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
