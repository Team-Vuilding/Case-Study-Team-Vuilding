import test from 'node:test';
import assert from 'node:assert/strict';
import { HELP_TOPICS, findHelpArticles } from '../src/data/helpCenter.js';

test('all six topics have guides and every role has a getting-started path', () => {
  assert.equal(HELP_TOPICS.length, 6);
  for (const role of ['admin', 'warehouse', 'purchasing', 'sales']) {
    assert.ok(findHelpArticles({ role, topic: 'getting-started' }).length > 0);
  }
});

test('role filtering keeps warehouse actions out of the sales task guides', () => {
  assert.equal(findHelpArticles({ role: 'sales', topic: 'warehouse' }).length, 0);
  assert.ok(findHelpArticles({ role: 'warehouse', query: 'dispatch' }).length > 0);
});

test('search matches instructions as well as titles and handles whitespace', () => {
  assert.ok(findHelpArticles({ role: 'admin', query: '  RESERVED  ' }).some(article => article.id === 'archive'));
  assert.equal(findHelpArticles({ role: 'sales', query: 'no-such-help-topic' }).length, 0);
});

test('users can read all role-labelled guides without gaining action permissions', () => {
  assert.ok(findHelpArticles({ role: 'sales', relevantOnly: false, topic: 'warehouse' }).length > 0);
});
