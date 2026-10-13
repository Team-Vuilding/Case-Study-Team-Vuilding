import test from 'node:test';
import assert from 'node:assert/strict';
import { GENERAL_HELP_ARTICLES, ROLE_HELP, findHelpArticles, findGeneralHelpArticles } from '../src/data/helpCenter.js';

test('general help contains overview information without role-specific operations', () => {
  assert.ok(findGeneralHelpArticles({ query: 'sign in' }).length > 0);
  assert.ok(GENERAL_HELP_ARTICLES.some(article => article.id === 'terminology'));
  assert.ok(GENERAL_HELP_ARTICLES.every(article => !['archive', 'movement', 'create-order', 'manage-users'].includes(article.id)));
});

test('every role has a distinct task collection and relevant topics', () => {
  const firstGuides = new Set();
  for (const role of ['admin', 'warehouse', 'purchasing', 'sales']) {
    const guides = findHelpArticles({ role });
    assert.ok(guides.length > 0);
    firstGuides.add(guides[0].title);
    assert.ok(ROLE_HELP[role].topics.every(topic => guides.some(article => article.topic === topic.id)));
  }
  assert.equal(firstGuides.size, 4);
});

test('role guides cannot switch to another role or include general help', () => {
  const salesGuides = findHelpArticles({ role: 'sales', relevantOnly: false });
  assert.ok(salesGuides.every(article => article.topic === 'sales'));
  assert.equal(findHelpArticles({ role: 'sales', query: 'Archive' }).length, 0);
  assert.equal(findHelpArticles({ role: 'purchasing', query: 'Approve an order' }).length, 0);
  assert.equal(findHelpArticles({ role: 'warehouse', query: 'Create an account' }).length, 0);
  assert.equal(findHelpArticles({ role: 'unknown' }).length, 0);
  for (const role of Object.keys(ROLE_HELP)) {
    assert.ok(findHelpArticles({ role }).every(article => !GENERAL_HELP_ARTICLES.some(general => general.id === article.id)));
  }
});

test('search matches task instructions, trims whitespace, and combines with a topic', () => {
  assert.ok(findHelpArticles({ role: 'admin', query: '  RESERVED  ', topic: 'catalog' }).some(article => article.id === 'admin-archive'));
  assert.ok(findHelpArticles({ role: 'warehouse', query: 'dispatch' }).length > 0);
  assert.equal(findHelpArticles({ role: 'sales', query: 'no-such-help-topic' }).length, 0);
});
