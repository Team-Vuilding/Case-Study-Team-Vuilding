export function trackCursorGlow(element, host = window) {
  const reduced = host.matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = host.matchMedia('(hover: hover) and (pointer: fine)');
  const threads = [...element.querySelectorAll('.wba-cursor-thread')];
  const animations = threads.map(() => null);
  let frame = null;
  let x = 0;
  let y = 0;
  let previous = null;
  let index = 0;
  const hide = () => {
    if (frame !== null) host.cancelAnimationFrame(frame);
    frame = null;
    previous = null;
    element.dataset.active = 'false';
    animations.forEach((animation, i) => {
      animation?.cancel();
      animations[i] = null;
      threads[i].style.willChange = 'auto';
    });
  };
  const move = event => {
    if (reduced.matches || !mouse.matches || event.pointerType !== 'mouse' || host.document?.hidden) return;
    x = event.clientX;
    y = event.clientY;
    if (frame !== null) return;
    frame = host.requestAnimationFrame(() => {
      frame = null;
      if (!threads.length || !threads[0].animate) return;
      const dx = previous ? x - previous.x : 0;
      const dy = previous ? y - previous.y : 0;
      if (previous && Math.hypot(dx, dy) < 12) return;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const slot = index++ % threads.length;
      const thread = threads[slot];
      animations[slot]?.cancel();
      thread.style.willChange = 'transform, opacity';
      const position = `translate3d(${x - 90}px, ${y - 50}px, 0) rotate(${angle}deg)`;
      const animation = thread.animate([
        { transform: `${position} scale(0.75, 0.8)`, opacity: 0.7 },
        { transform: `${position} scale(1.35, 1.4)`, opacity: 0 },
      ], { duration: 650, easing: 'ease-out', fill: 'forwards' });
      animations[slot] = animation;
      animation.finished?.then(() => {
        if (animations[slot] !== animation) return;
        animation.cancel();
        animations[slot] = null;
        thread.style.willChange = 'auto';
      }).catch(() => {});
      previous = { x, y };
      element.dataset.active = 'true';
    });
  };
  const leave = event => { if (!event.relatedTarget) hide(); };
  const visibility = () => { if (host.document.hidden) hide(); };
  host.addEventListener('pointermove', move, { passive: true });
  host.addEventListener('pointerout', leave);
  host.addEventListener('blur', hide);
  host.document?.addEventListener('visibilitychange', visibility);
  reduced.addEventListener('change', hide);
  mouse.addEventListener('change', hide);
  return () => {
    hide();
    host.removeEventListener('pointermove', move);
    host.removeEventListener('pointerout', leave);
    host.removeEventListener('blur', hide);
    host.document?.removeEventListener('visibilitychange', visibility);
    reduced.removeEventListener('change', hide);
    mouse.removeEventListener('change', hide);
  };
}
