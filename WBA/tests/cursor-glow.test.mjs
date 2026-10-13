import assert from 'node:assert/strict';
import { test } from 'node:test';
import { trackCursorGlow } from '../src/utils/cursorGlow.js';

test('weaving trail batches mouse updates, uses a fixed pool, and cancels on exit', () => {
  const listeners = new Map();
  const media = { matches: true, addEventListener() {}, removeEventListener() {} };
  let frame;
  let scheduled = 0;
  let cancelled = 0;
  const stamps = [];
  const threads = Array.from({ length: 8 }, () => ({ style: {}, animate(frames, options) {
    stamps.push({ frames, options });
    return { cancel() { cancelled++; } };
  } }));
  const host = {
    matchMedia: query => query.includes('reduced-motion') ? { ...media, matches: false } : media,
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: name => listeners.delete(name),
    requestAnimationFrame: fn => { frame = fn; scheduled++; return 1; },
    cancelAnimationFrame() {},
  };
  const element = { dataset: {}, querySelectorAll: () => threads };
  const cleanup = trackCursorGlow(element, host);
  listeners.get('pointermove')({ pointerType: 'touch', clientX: 20, clientY: 30 });
  assert.equal(scheduled, 0);
  const move = (x, y) => listeners.get('pointermove')({ pointerType: 'mouse', clientX: x, clientY: y });
  move(200, 300); move(250, 350);
  assert.equal(scheduled, 1);
  frame();
  assert.match(stamps[0].frames[0].transform, /translate3d\(160px, 300px, 0\)/);
  assert.equal(stamps[0].frames.at(-1).opacity, 0);
  assert.equal(stamps[0].options.duration, 650);
  move(251, 350); frame();
  assert.equal(stamps.length, 1, 'Tiny movements should not restamp the same area');
  for (let i = 1; i <= 10; i++) { move(250 + i * 25, 350); frame(); }
  assert.equal(threads.length, 8);
  assert.ok(cancelled >= 3, 'Old stamps must be cancelled before pool reuse');
  listeners.get('blur')();
  assert.equal(element.dataset.active, 'false');
  cleanup();
  assert.equal(listeners.size, 0);
});
