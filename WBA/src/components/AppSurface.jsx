import { useEffect, useState } from 'react';
import './app-surface.css';

export default function AppSurface({ children }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const syncVisibility = () => setPaused(document.hidden);
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => document.removeEventListener('visibilitychange', syncVisibility);
  }, []);

  return <div className="wba-app-shell" data-ambient-paused={paused}>
    <div className="wba-ambient-background" aria-hidden="true">
      <div className="wba-bg-ambient-top" />
      <div className="wba-bg-ambient-right" />
      <div className="wba-bg-ambient-center" />
    </div>
    {children}
  </div>;
}
