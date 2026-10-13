import assert from 'node:assert/strict';
import { test } from 'node:test';
import { trackCursorGlow } from '../src/utils/cursorGlow.js';

test('mouse tracking batches updates and cleans up pending work', () => {
  const listeners = new Map();
  const media = { matches: true, addEventListener() {}, removeEventListener() {} };
  let frame;
  let scheduled = 0;
  let cancelled = 0;
  const host = {
    matchMedia: query => query.includes('reduced-motion') ? { ...media, matches: false } : media,
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: name => listeners.delete(name),
    requestAnimationFrame: fn => { frame = fn; scheduled++; return 1; },
    cancelAnimationFrame: () => { cancelled++; },
  };
  const element = { style: {}, dataset: {} };
  const cleanup = trackCursorGlow(element, host);
  listeners.get('pointermove')({ pointerType: 'touch', clientX: 20, clientY: 30 });
  assert.equal(scheduled, 0);
  listeners.get('pointermove')({ pointerType: 'mouse', clientX: 200, clientY: 300 });
  listeners.get('pointermove')({ pointerType: 'mouse', clientX: 250, clientY: 350 });
  assert.equal(scheduled, 1);
  frame();
  assert.equal(element.style.transform, 'translate3d(110px, 210px, 0)');
  assert.equal(element.dataset.active, 'true');
  listeners.get('blur')();
  assert.equal(element.dataset.active, 'false');
  listeners.get('pointermove')({ pointerType: 'mouse', clientX: 300, clientY: 400 });
  cleanup();
  assert.equal(cancelled, 1);
  assert.equal(listeners.size, 0);
});
