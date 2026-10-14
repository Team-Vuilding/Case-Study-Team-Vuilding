import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createResponseCache } from '../src/services/responseCache.js';

test('repeated and concurrent reads reuse one successful request until expiry', async () => {
  let now = 0;
  let calls = 0;
  const cache = createResponseCache(() => now);
  const load = async () => ({ data: ++calls });
  const [first, second] = await Promise.all([cache.load('items', load), cache.load('items', load)]);
  assert.deepEqual(first, second);
  await cache.load('items', load);
  assert.equal(calls, 1);
  assert.deepEqual(cache.peek('items'), { data: 1 });
  now = 15000;
  assert.deepEqual(cache.peek('items'), { data: 1 });
  assert.deepEqual(await cache.load('items', load), { data: 2 });
});

test('failed requests are never cached', async () => {
  const cache = createResponseCache();
  await assert.rejects(cache.load('items', async () => { throw new Error('offline'); }), /offline/);
  assert.equal(cache.peek('items'), undefined);
  assert.deepEqual(await cache.load('items', async () => ({ data: [] })), { data: [] });
});

test('clearing cache prevents old in-flight responses from replacing fresh data', async () => {
  const cache = createResponseCache();
  let finishOld;
  const old = cache.load('items', () => new Promise(resolve => { finishOld = resolve; }));
  await Promise.resolve();
  cache.clear();
  await cache.load('items', async () => ({ data: 'fresh' }));
  finishOld({ data: 'old' });
  await old;
  assert.deepEqual(cache.peek('items'), { data: 'fresh' });
});

test('manual reload bypasses cached data', async () => {
  const cache = createResponseCache();
  await cache.load('items', async () => ({ data: 'cached' }));
  assert.deepEqual(await cache.load('items', async () => ({ data: 'fresh' }), true), { data: 'fresh' });
  assert.deepEqual(cache.peek('items'), { data: 'fresh' });
});

test('expired fresh data stays visible while one background refresh supplies the new value', async () => {
  let now = 0;
  const cache = createResponseCache(() => now);
  await cache.load('items', async () => ({ data: 'previous' }));
  now = 16000;
  let finish;
  let calls = 0;
  const load = () => { calls++; return new Promise(resolve => { finish = resolve; }); };
  const first = cache.load('items', load);
  const second = cache.load('items', load, true);
  await Promise.resolve();
  assert.equal(calls, 1);
  assert.deepEqual(cache.peek('items'), { data: 'previous' });
  finish({ data: 'updated' });
  await Promise.all([first, second]);
  assert.deepEqual(cache.peek('items'), { data: 'updated' });
  now = 76000;
  assert.equal(cache.peek('items'), undefined);
});

test('recently used pages stay cached when new pages reach the memory limit', async () => {
  const cache = createResponseCache();
  await cache.load('items', async () => ({ data: 'inventory' }));
  for (let page = 0; page < 50; page++) {
    cache.peek('items');
    await cache.load('reports?page=' + page, async () => ({ data: page }));
  }
  assert.deepEqual(cache.peek('items'), { data: 'inventory' });
  assert.equal(cache.peek('reports?page=0'), undefined);
});

test('cache remains bounded as report pages and query strings change', async () => {
  const cache = createResponseCache();
  for (let page = 0; page <= 50; page++) await cache.load('reports?page=' + page, async () => ({ data: page }));
  assert.equal(cache.peek('reports?page=0'), undefined);
  assert.deepEqual(cache.peek('reports?page=50'), { data: 50 });
});
