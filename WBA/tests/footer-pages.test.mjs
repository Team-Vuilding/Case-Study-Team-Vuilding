import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
const server = await createServer({ root: fileURLToPath(new URL('../', import.meta.url)), server: { middlewareMode: true, ws: false }, appType: 'custom', ssr: { external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-router-dom'] } });
after(() => server.close());
const { default: App } = await server.ssrLoadModule('/src/App.jsx');
for (const [path, title] of [['privacy', 'Privacy Policy'], ['terms', 'Terms of Service'], ['help', 'Help Center'], ['contact', 'Contact Support']]) {
  test(`${path} is publicly routable even with a saved session`, () => {
    const previousWindow = globalThis.window;
    const previousStorage = globalThis.sessionStorage;
    globalThis.window = { location: { hash: `#/${path}` } };
    globalThis.sessionStorage = { getItem: () => 'saved-token' };
    try {
      const html = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [`/${path}`] }, createElement(App)));
      assert.match(html, new RegExp(title));
      assert.match(html, /<h1/);
      assert.doesNotMatch(html, /Checking your session|wba-landing-page/);
      for (const route of ['privacy', 'terms', 'help', 'contact']) assert.ok(html.includes(`href="#/${route}"`));
      if (path === 'contact') {
        for (const field of ['name', 'email', 'category', 'subject', 'message']) assert.ok(html.includes(`name="${field}"`));
        assert.match(html, /Open email draft/);
        assert.match(html, /Live chat is not currently available/);
      }
    } finally { globalThis.window = previousWindow; globalThis.sessionStorage = previousStorage; }
  });
}
test('public FAQ search covers the requested topics', async () => {
  const { findGeneralHelpArticles, GENERAL_HELP_TOPICS } = await server.ssrLoadModule('/src/data/helpCenter.js');
  for (const title of ['Inventory Management', 'Account Settings', 'Stock Count Mismatches', 'Billing']) assert.ok(GENERAL_HELP_TOPICS.some(topic => topic.title === title));
  assert.ok(findGeneralHelpArticles({ query: '  BILLING  ' }).length);
  assert.ok(findGeneralHelpArticles({ query: 'mismatch' }).length);
  assert.equal(findGeneralHelpArticles({ query: 'no-such-question' }).length, 0);
});

test('email draft encodes user content without injecting mail headers', async () => {
  const { createSupportEmail } = await server.ssrLoadModule('/src/data/supportContact.js');
  const url = createSupportEmail({ name: '  Alex  ', email: 'alex@example.com', category: 'Feedback', subject: 'Question & improvement?\nbcc=someone@example.com', message: 'SKU #123 & quantity +2\nThanks' });
  const parsed = new URL(url);
  assert.equal(parsed.pathname, 'vincentjamesguhiling@gmail.com');
  assert.deepEqual([...parsed.searchParams.keys()], ['subject', 'body']);
  assert.match(parsed.searchParams.get('body'), /Name: Alex\nEmail: alex@example.com/);
  assert.match(parsed.searchParams.get('body'), /SKU #123 & quantity \+2\nThanks/);
});

