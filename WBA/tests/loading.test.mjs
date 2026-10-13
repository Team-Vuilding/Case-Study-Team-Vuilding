import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const server = await createServer({
  root: fileURLToPath(new URL('../', import.meta.url)),
  server: { middlewareMode: true },
  appType: 'custom',
  ssr: { external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime'] },
});
after(() => server.close());
const { default: ApiStatus } = await server.ssrLoadModule('/src/components/ApiStatus.jsx');
const { Skeleton, SkeletonText } = await server.ssrLoadModule('/src/components/SkeletonLoader.jsx');
const { default: InventoryLedger } = await server.ssrLoadModule('/src/components/dashboard/RealTimeInventoryLedger.jsx');
const render = (Component, props, children) => renderToStaticMarkup(createElement(Component, props, children));

test('pending API data shows a skeleton and one contextual loading announcement', () => {
  const html = render(ApiStatus, { loading: true, loadingLabel: 'Loading inventory…' });
  assert.match(html, /wba-skeleton/);
  assert.match(html, /Loading inventory…/);
  assert.equal((html.match(/role="status"/g) || []).length, 1);
  assert.match(html, /aria-busy="true"/);
  assert.doesNotMatch(html, /<button|<input|<select/);
});

test('loading displays the section placeholder supplied by its caller', () => {
  const html = render(ApiStatus, { loading: true }, createElement(SkeletonText, { lines: 2 }));
  assert.equal((html.match(/class="wba-skeleton /g) || []).length, 2);
});

test('an API error keeps the retry action and takes priority over loading', () => {
  const html = render(ApiStatus, { loading: true, error: 'Connection unavailable', onRetry: () => {} });
  assert.match(html, /role="alert"/);
  assert.match(html, /Connection unavailable/);
  assert.match(html, /Try again/);
  assert.doesNotMatch(html, /wba-skeleton|aria-busy/);
});

test('completed requests remove the loading status', () => {
  assert.equal(render(ApiStatus, { loading: false, error: '' }), '');
});

test('placeholder primitives stay decorative and respect zero dimensions', () => {
  const html = render(Skeleton, { width: 0, height: 0, 'aria-hidden': false });
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /width:0px/);
  assert.match(html, /height:0px/);
});

const product = { id: 1, name: 'Test appliance', sku: 'TEST-001', category: 'A', warehouseBin: 'BIN-01', unitPrice: 100,
  physicalOnHand: 0, paperSpreadsheetCount: 0, reserved: 0, allocated: 0, canArchive: true };

test('administrators see archive controls and an explanation for ineligible products', () => {
  const html = render(InventoryLedger, { items: [product, { ...product, id: 2, name: 'Stocked appliance', physicalOnHand: 1,
    canArchive: false, archiveBlockReason: 'Resolve stock first.' }], currentUser: { accessLevel: 'admin' }, onArchive: () => {} });
  assert.match(html, /aria-label="Archive Test appliance"/);
  assert.match(html, /disabled="" aria-label="Archive Stocked appliance"/);
  assert.match(html, /id="archive-blocked-2">Resolve stock first\./);
});

test('warehouse, purchasing, and sales users do not see archive controls', () => {
  for (const accessLevel of ['warehouse', 'purchasing', 'sales']) {
    const html = render(InventoryLedger, { items: [product], currentUser: { accessLevel } });
    assert.doesNotMatch(html, /aria-label="Archive/);
  }
});
