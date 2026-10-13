import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const server = await createServer({
  root: fileURLToPath(new URL('../', import.meta.url)),
  server: { middlewareMode: true, ws: false },
  appType: 'custom',
  ssr: { external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-router-dom'] },
});
after(() => server.close());
const { default: App } = await server.ssrLoadModule('/src/App.jsx');
const { default: RoleHelp } = await server.ssrLoadModule('/src/components/dashboard/HelpCenterSection.jsx');
const { default: GeneralHelp } = await server.ssrLoadModule('/src/components/GeneralHelpPage.jsx');
const render = (Component, props) => renderToStaticMarkup(Component === App ? createElement(MemoryRouter, { initialEntries: [globalThis.window.location.hash.slice(1)] }, createElement(Component, props)) : createElement(Component, props));

test('restoring a dashboard session shows the branded loader instead of a content skeleton', () => {
  const previousWindow = globalThis.window;
  const previousStorage = globalThis.sessionStorage;
  globalThis.window = { location: { hash: '#/dashboard' } };
  globalThis.sessionStorage = { getItem: () => 'session-test-fixture' };
  try {
    const html = render(App);
    assert.match(html, /wba-session-loader/);
    assert.match(html, /wba-logo-image/);
    assert.match(html, /aria-label="Loading page"/);
    assert.match(html, /wba-inventory-backdrop/);
    assert.doesNotMatch(html, /Checking your session|Preparing your workspace/);
    assert.equal((html.match(/role="status"/g) || []).length, 1);
    assert.match(html, /aria-busy="true"/);
    assert.doesNotMatch(html, /wba-skeleton|wba-dash-sidebar/);
  } finally {
    globalThis.window = previousWindow;
    globalThis.sessionStorage = previousStorage;
  }
});

test('a visitor gets the global refresh overlay while the landing page mounts underneath', () => {
  const previousWindow = globalThis.window;
  const previousStorage = globalThis.sessionStorage;
  globalThis.window = { location: { hash: '#/home' } };
  globalThis.sessionStorage = { getItem: () => null };
  try {
    const html = render(App);
    assert.match(html, /wba-landing-page/);
    assert.match(html, /wba-session-loader/);
    assert.match(html, /inert=""/);
    assert.doesNotMatch(html, /Checking your session|Preparing your workspace/);
  } finally {
    globalThis.window = previousWindow;
    globalThis.sessionStorage = previousStorage;
  }
});

test('the refresh overlay covers every public and sign-in route without removing page content', () => {
  const previousWindow = globalThis.window;
  const previousStorage = globalThis.sessionStorage;
  globalThis.sessionStorage = { getItem: () => null };
  try {
    for (const route of ['help', 'privacy', 'terms', 'contact', 'login/admin', 'login/warehouse', 'login/purchasing', 'login/sales']) {
      globalThis.window = { location: { hash: `#/${route}` } };
      const html = render(App);
      assert.match(html, /wba-session-loader/);
      assert.match(html, /wba-refresh-page-content/);
      assert.match(html, /<h1/);
      assert.equal((html.match(/role="status" aria-label="Loading page"/g) || []).length, 1);
      assert.match(html, /inert=""/);
      assert.doesNotMatch(html, /Checking your session|Preparing your workspace/);
    }
  } finally {
    globalThis.window = previousWindow;
    globalThis.sessionStorage = previousStorage;
  }
});

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

test('each workspace shows its own task collection and directs support to Contact Support', () => {
  for (const [role, title] of [['admin', 'Admin'], ['warehouse', 'Warehouse Staff'], ['purchasing', 'Purchasing Manager'], ['sales', 'Sales Staff']]) {
    const html = render(RoleHelp, { currentUser: { accessLevel: role, email: 'qa@example.com' } });
    assert.match(html, new RegExp(title + ' task guides'));
    assert.match(html, /href="#\/help"/);
    assert.match(html, /href="#\/contact"/);
    assert.doesNotMatch(html, /id="ticket-description"|mailto:|Send a ticket/);
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
  assert.match(html, /href="#\/contact"/);
  assert.doesNotMatch(html, /mailto:|Email support/);
});

test('public help directs questions to Contact Support without direct email', () => {
  const html = render(GeneralHelp, { theme: 'light' });
  assert.match(html, /href="#\/contact"/);
  assert.doesNotMatch(html, /mailto:|Email support|email support directly/);
});
