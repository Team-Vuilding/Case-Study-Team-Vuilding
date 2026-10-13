import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sendSupportRequest } from '../src/services/support.js';

const details = {
  name: '  Visitor  ', email: ' visitor@example.com ', category: 'Technical',
  subject: ' Stock count question ', message: ' Please help with the stock count. ', consent: true,
};
const success = () => new Response(JSON.stringify({ success: true }), { status: 200 });

test('browser delivery sends only support fields and returns the reference included in the email', async () => {
  let payload;
  const result = await sendSupportRequest({ ...details, access_key: 'attacker-key', to: 'attacker@example.com', token: 'session-secret', role: 'admin' }, {
    accessKey: 'test-form-key',
    fetchRequest: async (url, options) => {
      assert.equal(url, 'https://api.web3forms.com/submit');
      assert.equal(options.method, 'POST');
      assert.equal(options.headers['Content-Type'], 'application/json');
      assert.equal(options.credentials, 'omit');
      assert.ok(options.signal instanceof AbortSignal);
      assert.equal(options.headers.Authorization, undefined);
      payload = JSON.parse(options.body);
      return success();
    },
  });
  assert.match(result.data.reference, /^WBA-[A-F0-9-]{36}$/);
  assert.equal(result.data.status, 'sent');
  assert.deepEqual(payload, {
    access_key: 'test-form-key', from_name: 'WBA Support', name: 'Visitor', email: 'visitor@example.com',
    subject: `[WBA Support] ${result.data.reference}: Stock count question`,
    category: 'Technical', message: 'Please help with the stock count.', reference: result.data.reference,
  });
});

test('missing configuration stops before contacting the provider', async () => {
  let called = false;
  await assert.rejects(sendSupportRequest(details, { accessKey: ' ', fetchRequest: async () => { called = true; } }), error => error.status === 503);
  assert.equal(called, false);
});

test('invalid fields and missing consent cannot be submitted', async () => {
  for (const [field, value] of Object.entries({ name: '\nInjected', email: 'bad-email', category: 'Unknown', subject: '\r\nBcc: injected@example.com', message: ' short ', consent: false })) {
    let called = false;
    await assert.rejects(sendSupportRequest({ ...details, [field]: value }, { accessKey: 'test', fetchRequest: async () => { called = true; } }), error => error.status === 422 && Boolean(error.data.errors[field]));
    assert.equal(called, false);
  }
});

test('oversized fields are rejected before sending', async () => {
  for (const [field, length] of Object.entries({ name: 101, email: 255, subject: 121, message: 5001 })) {
    await assert.rejects(sendSupportRequest({ ...details, [field]: 'x'.repeat(length) }, { accessKey: 'test', fetchRequest: () => { throw new Error('Must not send'); } }), error => error.status === 422 && Boolean(error.data.errors[field]));
  }
});

test('all contact categories are supported', async () => {
  for (const category of ['Technical', 'Billing', 'Account', 'Feedback']) {
    const result = await sendSupportRequest({ ...details, category }, { accessKey: 'test', fetchRequest: async () => success() });
    assert.equal(result.data.status, 'sent');
  }
});

test('HTTP errors and malformed success responses never confirm delivery or expose provider content', async () => {
  for (const [status, body] of [[400, { success: false, message: 'private-provider-detail' }], [500, { success: true }], [200, {}], [200, { success: 'true' }], [200, { success: false }]]) {
    await assert.rejects(sendSupportRequest(details, { accessKey: 'test', fetchRequest: async () => new Response(JSON.stringify(body), { status }) }), error => {
      assert.equal(error.status, 502);
      assert.match(error.reference, /^WBA-/);
      assert.ok(error.message.includes(error.reference));
      assert.ok(!error.message.includes('private-provider-detail'));
      return true;
    });
  }
});

test('non-JSON provider responses are not treated as success', async () => {
  await assert.rejects(sendSupportRequest(details, { accessKey: 'test', fetchRequest: async () => new Response('<html>Private error</html>') }), error => error.status === 502);
});

test('provider rate limits use a generic retry message', async () => {
  await assert.rejects(sendSupportRequest(details, { accessKey: 'test', fetchRequest: async () => new Response(JSON.stringify({ success: false, message: 'private-detail' }), { status: 429 }) }), error => error.status === 429 && !error.message.includes('private-detail'));
});

test('network failures and timeouts do not retry an uncertain submission', async () => {
  for (const failure of [new Error('private-network-detail'), new DOMException('Timed out', 'AbortError')]) {
    let calls = 0;
    await assert.rejects(sendSupportRequest(details, { accessKey: 'test', fetchRequest: async () => { calls++; throw failure; } }), error => error.status === 502 && Boolean(error.reference) && !error.message.includes('private-network-detail'));
    assert.equal(calls, 1);
  }
});
