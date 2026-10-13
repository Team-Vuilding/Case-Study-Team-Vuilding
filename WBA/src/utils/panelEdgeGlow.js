const panels = '.wba-glow-card, .wba-qr-tools, .wba-public-panel, .wba-dashboard-frame, .wba-dash-sidebar, .wba-about-card, .wba-features-container, .wba-preview, dialog.wba-workspace-dialog, dialog.wba-product-form, .wba-product-dialog';

export function trackPanelEdgeGlow(host = window) {
  const reduced = host.matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = host.matchMedia('(hover: hover) and (pointer: fine)');
  let active = null;
  let candidate = null;
  let frame = null;
  let x = 0;
  let y = 0;
  const clearActive = () => {
    if (!active) return;
    active.classList.remove('wba-edge-flare');
    for (const property of ['--wba-edge-x', '--wba-edge-y', '--wba-edge-strength']) active.style.removeProperty(property);
    active = null;
  };
  const hide = () => {
    if (frame !== null) host.cancelAnimationFrame(frame);
    frame = null;
    candidate = null;
    clearActive();
  };
  const move = event => {
    if (reduced.matches || !mouse.matches || event.pointerType !== 'mouse' || host.document.hidden) { hide(); return; }
    candidate = event.target?.closest?.(panels);
    x = event.clientX;
    y = event.clientY;
    if (frame !== null) return;
    frame = host.requestAnimationFrame(() => {
      frame = null;
      if (!candidate?.isConnected) { clearActive(); return; }
      const bounds = candidate.getBoundingClientRect();
      const localX = x - bounds.left;
      const localY = y - bounds.top;
      const distance = Math.min(localX, localY, bounds.width - localX, bounds.height - localY);
      if (distance < 0 || distance >= 32) { clearActive(); return; }
      if (active !== candidate) { clearActive(); active = candidate; active.classList.add('wba-edge-flare'); }
      active.style.setProperty('--wba-edge-x', `${localX}px`);
      active.style.setProperty('--wba-edge-y', `${localY}px`);
      active.style.setProperty('--wba-edge-strength', ((1 - distance / 32) * .7).toFixed(3));
    });
  };
  const leave = event => { if (!event.relatedTarget) hide(); };
  const visibility = () => { if (host.document.hidden) hide(); };
  host.addEventListener('pointermove', move, { passive: true });
  host.addEventListener('pointerout', leave);
  host.addEventListener('pointercancel', hide);
  host.addEventListener('blur', hide);
  host.addEventListener('resize', hide);
  host.addEventListener('scroll', hide, { passive: true, capture: true });
  host.document.addEventListener('visibilitychange', visibility);
  reduced.addEventListener('change', hide);
  mouse.addEventListener('change', hide);
  return () => {
    hide();
    host.removeEventListener('pointermove', move);
    host.removeEventListener('pointerout', leave);
    host.removeEventListener('pointercancel', hide);
    host.removeEventListener('blur', hide);
    host.removeEventListener('resize', hide);
    host.removeEventListener('scroll', hide, true);
    host.document.removeEventListener('visibilitychange', visibility);
    reduced.removeEventListener('change', hide);
    mouse.removeEventListener('change', hide);
  };
}
