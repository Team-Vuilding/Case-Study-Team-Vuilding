export function trackCursorGlow(element, host = window) {
  const reduced = host.matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = host.matchMedia('(hover: hover) and (pointer: fine)');
  let frame = null;
  let x = 0;
  let y = 0;
  const hide = () => {
    if (frame !== null) host.cancelAnimationFrame(frame);
    frame = null;
    element.dataset.active = 'false';
  };
  const move = event => {
    if (reduced.matches || !mouse.matches || event.pointerType !== 'mouse') return;
    x = event.clientX;
    y = event.clientY;
    if (frame !== null) return;
    frame = host.requestAnimationFrame(() => {
      frame = null;
      element.style.transform = `translate3d(${x - 140}px, ${y - 140}px, 0)`;
      element.dataset.active = 'true';
    });
  };
  const leave = event => { if (!event.relatedTarget) hide(); };
  host.addEventListener('pointermove', move, { passive: true });
  host.addEventListener('pointerout', leave);
  host.addEventListener('blur', hide);
  reduced.addEventListener('change', hide);
  mouse.addEventListener('change', hide);
  return () => {
    hide();
    host.removeEventListener('pointermove', move);
    host.removeEventListener('pointerout', leave);
    host.removeEventListener('blur', hide);
    reduced.removeEventListener('change', hide);
    mouse.removeEventListener('change', hide);
  };
}
