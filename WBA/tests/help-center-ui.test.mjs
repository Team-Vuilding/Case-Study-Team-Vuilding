import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const server = await createServer({
  root: fileURLToPath(new URL('../', import.meta.url)),
  server: { middlewareMode: true, ws: false },
  appType: 'custom',
  ssr: { external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime'] },
});
after(() => server.close());
const { default: App } = await server.ssrLoadModule('/src/App.jsx');
const { default: RoleHelp } = await server.ssrLoadModule('/src/components/dashboard/HelpCenterSection.jsx');
const { default: GeneralHelp } = await server.ssrLoadModule('/src/components/GeneralHelpPage.jsx');
const render = (Component, props) => renderToStaticMarkup(createElement(Component, props));

test('general help opens directly outside the landing page without a session', () => {
  const previousWindow = globalThis.window;
  const previousStorage = globalThis.sessionStorage;
  globalThis.window = { location: { hash: '#/help' } };
  globalThis.sessionStorage = { getItem: () => null };
  try {
    const html = render(App);
    assert.match(html, /wba-general-help/);
    assert.match(html, /What is WBA\?/);
    assert.doesNotMatch(html, /wba-landing-page|id="home"|id="features"/);
    assert.doesNotMatch(html, /id="ticket-description"/);
  } finally {
    globalThis.window = previousWindow;
    globalThis.sessionStorage = previousStorage;
  }
});

test('a saved session does not block public help behind backend session checks', () => {
  const previousWindow = globalThis.window;
  const previousStorage = globalThis.sessionStorage;
  globalThis.window = { location: { hash: '#/help' } };
  globalThis.sessionStorage = { getItem: () => 'session-test-fixture' };
  try {
    const html = render(App);
    assert.match(html, /wba-general-help/);
    assert.doesNotMatch(html, /Checking your session/);
  } finally {
    globalThis.window = previousWindow;
    globalThis.sessionStorage = previousStorage;
  }
});

test('each workspace shows only its own task collection and keeps support tickets', () => {
  for (const [role, title] of [['admin', 'Admin'], ['warehouse', 'Warehouse Staff'], ['purchasing', 'Purchasing Manager'], ['sales', 'Sales Staff']]) {
    const html = render(RoleHelp, { currentUser: { accessLevel: role, email: 'qa@example.com' } });
    assert.match(html, new RegExp(title + ' task guides'));
    assert.match(html, /href="#\/help"/);
    assert.match(html, /id="ticket-description"/);
    assert.doesNotMatch(html, /Guides for my role|across all roles|What is WBA\?/);
    if (role !== 'admin') assert.doesNotMatch(html, /Create an account or reset a password|Archive, restore, or remove a product/);
    if (role !== 'warehouse') assert.doesNotMatch(html, /Dispatch stock using a SKU/);
  }
});

test('general help offers the signed-in user a route back to their task guides', () => {
  const html = render(GeneralHelp, { currentUser: { accessLevel: 'sales' }, theme: 'light' });
  assert.match(html, /href="#\/help-center"/);
  assert.match(html, /Sales Staff task guides/);
  assert.doesNotMatch(html, /id="ticket-description"/);
});
