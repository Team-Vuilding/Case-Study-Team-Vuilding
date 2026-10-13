import { useEffect, useRef } from 'react';
import Logo from './Logo';
import PublicFooter from './PublicFooter';
import './public-pages.css';
export default function PublicPageLayout({ title, description, currentUser, theme, onToggleTheme, children }) {
  const titleRef = useRef(null);
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | WBA`;
    titleRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => { document.title = previousTitle; };
  }, [title]);
  return <div className="wba-public-page">
    <header className="wba-public-nav">
      <a href={currentUser ? '#/dashboard' : '#/home'} aria-label="WBA home"><Logo className="wba-nav-logo" /></a>
      <nav aria-label="Page navigation"><a href={currentUser ? '#/dashboard' : '#/home'}>{currentUser ? 'Back to workspace' : 'Back to home'}</a>
        <button type="button" className="wba-theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}><span aria-hidden="true">{theme === 'dark' ? '\u2600' : '\u263e'}</span></button>
      </nav>
    </header>
    <main className="wba-public-main"><header className="wba-public-heading"><p className="wba-public-eyebrow">WBA / Resources</p><h1 tabIndex={-1} ref={titleRef}>{title}</h1><p>{description}</p></header>{children}</main>
    <PublicFooter />
  </div>;
}
