import assert from 'node:assert/strict';
import { test } from 'node:test';
import { trackPanelEdgeGlow } from '../src/utils/panelEdgeGlow.js';

function setup() {
  const listeners = new Map();
  const media = new Map();
  const frames = new Map();
  const panels = [];
  let nextFrame = 0;
  const host = {
    document: { hidden: false, querySelectorAll: selector => selector === 'dialog[open]' ? [] : panels, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) },
    matchMedia(query) {
      const value = { matches: query.includes('hover: hover'), addEventListener: (_, fn) => { value.change = fn; }, removeEventListener: () => { value.change = null; } };
      media.set(query, value);
      return value;
    },
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: name => listeners.delete(name),
    requestAnimationFrame(fn) { frames.set(++nextFrame, fn); return nextFrame; },
    cancelAnimationFrame: id => frames.delete(id),
  };
  const panel = (bounds = { left: 100, top: 100, width: 400, height: 200 }) => {
    const classes = new Set();
    const styles = new Map();
    const element = { isConnected: true, classes, styles, classList: { add: value => classes.add(value), remove: value => classes.delete(value) },
      style: { setProperty: (key, value) => styles.set(key, value), removeProperty: key => styles.delete(key) },
      getBoundingClientRect: () => bounds };
    panels.push(element);
    return element;
  };
  const cleanup = trackPanelEdgeGlow(host);
  return { host, listeners, media, frames, panel, cleanup,
    move(target, x, y, pointerType = 'mouse') { listeners.get('pointermove')({ target: { closest: () => target }, clientX: x, clientY: y, pointerType }); },
    flush() { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()); } };
}

test('panel flare follows the nearest edge, batches movement, and stays off over content', () => {
  const fixture = setup();
  const panel = fixture.panel();
  fixture.move(panel, 110, 130); fixture.move(panel, 104, 150);
  assert.equal(fixture.frames.size, 1);
  fixture.flush();
  assert.ok(panel.classes.has('wba-edge-flare'));
  assert.equal(panel.styles.get('--wba-edge-x'), '4px');
  assert.equal(panel.styles.get('--wba-edge-y'), '50px');
  assert.ok(Number(panel.styles.get('--wba-edge-strength')) > 0);
  fixture.move(panel, 300, 200); fixture.flush();
  assert.equal(panel.classes.size, 0);
  assert.equal(Number(panel.styles.get('--wba-edge-strength')), 0);
  fixture.cleanup();
  assert.equal(panel.styles.size, 0);
});

test('adjacent panel edges glow together across the gap with symmetric brightness', () => {
  const fixture = setup();
  const first = fixture.panel();
  const second = fixture.panel({ left: 524, top: 100, width: 400, height: 200 });
  fixture.move(null, 512, 200); fixture.flush();
  assert.ok(first.classes.has('wba-edge-flare'));
  assert.ok(second.classes.has('wba-edge-flare'));
  assert.equal(first.styles.get('--wba-edge-strength'), second.styles.get('--wba-edge-strength'));
  const middleStrength = Number(first.styles.get('--wba-edge-strength'));
  fixture.move(first, 496, 200); fixture.flush();
  assert.ok(first.classes.has('wba-edge-flare'));
  assert.ok(second.classes.has('wba-edge-flare'));
  assert.ok(Number(first.styles.get('--wba-edge-strength')) > middleStrength);
  assert.ok(Number(second.styles.get('--wba-edge-strength')) < middleStrength);
  fixture.cleanup();
});

test('route removal, scrolling, and cleanup clear every nearby panel effect', () => {
  const fixture = setup(); const first = fixture.panel(); const second = fixture.panel();
  fixture.move(first, 104, 150); fixture.flush();
  fixture.listeners.get('scroll')();
  assert.equal(first.classes.size, 0);
  assert.equal(second.classes.size, 0);
  second.isConnected = false;
  fixture.move(second, 104, 150); fixture.flush();
  assert.equal(second.classes.size, 0);
  fixture.move(first, 104, 150);
  fixture.cleanup();
  assert.equal(fixture.frames.size, 0);
  assert.equal(fixture.listeners.size, 0);
  assert.equal(first.styles.size, 0);
});

test('touch, reduced motion, and loss of hover capability never leave a cursor flare', () => {
  const fixture = setup(); const panel = fixture.panel();
  fixture.move(panel, 104, 150, 'touch');
  assert.equal(fixture.frames.size, 0);
  fixture.move(panel, 104, 150); fixture.flush();
  const reduced = fixture.media.get('(prefers-reduced-motion: reduce)');
  reduced.matches = true; reduced.change();
  assert.equal(panel.classes.size, 0);
  fixture.move(panel, 104, 150);
  assert.equal(fixture.frames.size, 0);
  reduced.matches = false;
  fixture.media.get('(hover: hover) and (pointer: fine)').matches = false;
  fixture.move(panel, 104, 150);
  assert.equal(fixture.frames.size, 0);
  fixture.cleanup();
});
