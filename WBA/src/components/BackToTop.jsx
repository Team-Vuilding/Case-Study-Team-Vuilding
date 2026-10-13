import { useEffect, useState } from 'react';

export default function BackToTop({ onBackToTop }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 320);
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  const returnToTop = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector('.wba-landing-page .wba-logo-link')?.focus({ preventScroll: true });
    onBackToTop?.();
  };

  if (!visible) return null;

  return <button type="button" className="wba-back-to-top" onClick={returnToTop} aria-label="Back to top" title="Back to top">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 12 6-6 6 6" /><path d="M12 6v13" /></svg>
  </button>;
}
