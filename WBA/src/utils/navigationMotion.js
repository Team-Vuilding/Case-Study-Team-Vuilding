// Presentation only: callers update navigation and start fetching immediately.
export function animateNavigation(element, reducedMotion) {
  if (reducedMotion || !element?.animate) return;
  const animation = element.animate([{ opacity: 0.82 }, { opacity: 1 }], {
    duration: 180,
    easing: 'ease-out',
  });
  return () => animation.cancel();
}
