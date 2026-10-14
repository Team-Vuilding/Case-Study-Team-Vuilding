import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const original = { fetch: globalThis.fetch, window: globalThis.window, sessionStorage: globalThis.sessionStorage };
const server = await createServer({ root: fileURLToPath(new URL('../', import.meta.url)), server: { middlewareMode: true, ws: false }, appType: 'custom' });
const api = await server.ssrLoadModule('/src/services/api.js');
const response = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });
let calls;
beforeEach(() => {
  const storage = new Map();
  globalThis.sessionStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  globalThis.window = new EventTarget();
  calls = [];
  globalThis.fetch = async (url, options) => { calls.push({ url, options }); return response({ data: calls.length }); };
  api.setToken('fixture-admin-session');
});
after(async () => { await server.close(); Object.assign(globalThis, original); });

test('API page reads are reused while manual reload always contacts the server', async () => {
  await api.apiRequest('items');
  await api.apiRequest('/items');
  assert.equal(calls.length, 1);
  assert.deepEqual(api.getCachedApiData('items'), { data: 1 });
  await api.apiRequest('items', { cache: 'reload' });
  assert.equal(calls.length, 2);
});

test('mutations and explicit refresh invalidate all cached page data', async () => {
  await api.apiRequest('items');
  await api.apiRequest('dashboard/metrics');
  await api.apiRequest('warehouse/movements', { method: 'POST', body: { quantity: 1 } });
  assert.equal(api.getCachedApiData('items'), undefined);
  assert.equal(api.getCachedApiData('dashboard/metrics'), undefined);
  await api.apiRequest('items');
  assert.equal(calls.length, 4);
  api.refreshData();
  assert.equal(api.getCachedApiData('items'), undefined);
});

test('changing users and signing out discard cached protected responses', async () => {
  await api.apiRequest('users');
  api.setToken('fixture-warehouse-session');
  assert.equal(api.getCachedApiData('users'), undefined);
  await api.apiRequest('items');
  assert.equal(calls[1].options.headers.Authorization, 'Bearer fixture-warehouse-session');
  api.setToken(null);
  assert.equal(api.getCachedApiData('items'), undefined);
});

test('authentication, SKU previews, and anonymous requests always reach the server', async () => {
  for (const endpoint of ['auth/me', 'items/sku-preview?hasShelfLife=1']) {
    await api.apiRequest(endpoint); await api.apiRequest(endpoint);
  }
  api.setToken(null);
  await api.apiRequest('items'); await api.apiRequest('items');
  assert.equal(calls.length, 6);
});

test('a previous session failing after login cannot sign out the new user', async () => {
  let finish;
  globalThis.fetch = () => new Promise(resolve => { finish = resolve; });
  const old = api.apiRequest('items');
  await Promise.resolve();
  api.setToken('fixture-new-session');
  finish(response({ message: 'Unauthenticated' }, 401));
  await assert.rejects(old, /Unauthenticated/);
  assert.equal(api.getToken(), 'fixture-new-session');
  assert.equal(api.getCachedApiData('items'), undefined);
});
