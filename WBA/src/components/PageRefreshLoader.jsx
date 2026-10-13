import { useEffect, useState } from 'react';
import SessionLoader from './SessionLoader';

export default function PageRefreshLoader({ pending = false, children }) {
  const [pageReady, setPageReady] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let active = true;
    const ready = async () => {
      const logo = document.querySelector('.wba-session-logo-core img');
      if (logo?.decode) await logo.decode().catch(() => {});
      if (active) setPageReady(true);
    };
    if (document.readyState === 'complete') ready();
    else window.addEventListener('load', ready, { once: true });
    return () => { active = false; window.removeEventListener('load', ready); };
  }, []);

  useEffect(() => {
    if (!pageReady || pending) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setVisible(false), reducedMotion ? 0 : 400);
    return () => window.clearTimeout(timer);
  }, [pageReady, pending]);

  const showLoader = visible || pending;
  return <>
    <div className="wba-refresh-page-content" inert={showLoader} aria-busy={showLoader}>{children}</div>
    {showLoader && <SessionLoader leaving={pageReady && !pending} />}
  </>;
}
