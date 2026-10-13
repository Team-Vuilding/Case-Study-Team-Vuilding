const panels = '.wba-glow-card, .wba-qr-tools, .wba-public-panel, .wba-dashboard-frame, .wba-dash-sidebar, .wba-about-card, .wba-features-container, .wba-preview, dialog.wba-workspace-dialog, dialog.wba-product-form, .wba-product-dialog';

export function trackPanelEdgeGlow(host = window) {
  const reduced = host.matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = host.matchMedia('(hover: hover) and (pointer: fine)');
  let active = new Set();
  let frame = null;
  let x = 0;
  let y = 0;
  const clearPanel = panel => {
    panel.classList.remove('wba-edge-flare');
    panel.style.setProperty('--wba-edge-strength', '0');
  };
  const hide = () => {
    if (frame !== null) host.cancelAnimationFrame(frame);
    frame = null;
    active.forEach(clearPanel);
    active.clear();
  };
  const move = event => {
    if (reduced.matches || !mouse.matches || event.pointerType !== 'mouse' || host.document.hidden) { hide(); return; }
    x = event.clientX;
    y = event.clientY;
    if (frame !== null) return;
    frame = host.requestAnimationFrame(() => {
      frame = null;
      const dialogs = [...host.document.querySelectorAll('dialog[open]')];
      const scope = dialogs.at(-1) || host.document;
      const candidates = [...scope.querySelectorAll(panels)];
      if (scope.matches?.(panels)) candidates.unshift(scope);
      const nearby = [];
      for (const panel of candidates) {
        if (!panel.isConnected || (panel.checkVisibility && !panel.checkVisibility())) continue;
        const bounds = panel.getBoundingClientRect();
        if (!bounds.width || !bounds.height) continue;
        const localX = x - bounds.left;
        const localY = y - bounds.top;
        const outsideX = Math.max(-localX, localX - bounds.width, 0);
        const outsideY = Math.max(-localY, localY - bounds.height, 0);
        const distance = outsideX || outsideY ? Math.hypot(outsideX, outsideY)
          : Math.min(localX, localY, bounds.width - localX, bounds.height - localY);
        if (distance < 48) nearby.push({ panel, localX, localY, distance });
      }
      const next = new Set(nearby.map(({ panel }) => panel));
      for (const panel of active) if (!next.has(panel)) clearPanel(panel);
      for (const { panel, localX, localY, distance } of nearby) {
        panel.classList.add('wba-edge-flare');
        panel.style.setProperty('--wba-edge-x', `${localX}px`);
        panel.style.setProperty('--wba-edge-y', `${localY}px`);
        panel.style.setProperty('--wba-edge-strength', ((1 - distance / 48) * .7).toFixed(3));
      }
      active = next;
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
    const touched = new Set([...host.document.querySelectorAll(panels), ...active]);
    hide();
    for (const panel of touched) {
      for (const property of ['--wba-edge-x', '--wba-edge-y', '--wba-edge-strength']) panel.style.removeProperty(property);
    }
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
