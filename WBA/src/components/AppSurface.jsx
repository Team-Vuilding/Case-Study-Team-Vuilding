import { useEffect, useRef, useState } from 'react';
import { trackCursorGlow } from '../utils/cursorGlow';
import './app-surface.css';

export default function AppSurface({ children }) {
  const [paused, setPaused] = useState(false);
  const cursorRef = useRef(null);
  useEffect(() => trackCursorGlow(cursorRef.current), []);
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
    <div ref={cursorRef} className="wba-cursor-glow" aria-hidden="true" />
    {children}
  </div>;
}
