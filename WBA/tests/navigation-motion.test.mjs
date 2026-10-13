import assert from 'node:assert/strict';
import { test } from 'node:test';
import { animateNavigation } from '../src/utils/navigationMotion.js';

test('navigation remains interactive during a short visual transition', () => {
  let cancelled = false;
  let options;
  const element = { animate(frames, settings) {
    assert.equal(frames.at(-1).opacity, 1);
    options = settings;
    return { cancel() { cancelled = true; } };
  } };
  const cleanup = animateNavigation(element, false);
  assert.ok(options.duration > 0 && options.duration <= 200);
  assert.equal(options.delay || 0, 0);
  assert.equal(element.inert, undefined);
  assert.equal(element.style, undefined);
  cleanup();
  assert.equal(cancelled, true);
});

test('reduced motion and unsupported browsers leave content immediately available', () => {
  const element = { animate() { assert.fail('Motion must not run'); } };
  assert.equal(animateNavigation(element, true), undefined);
  assert.equal(animateNavigation(null, false), undefined);
  assert.equal(animateNavigation({}, false), undefined);
});
