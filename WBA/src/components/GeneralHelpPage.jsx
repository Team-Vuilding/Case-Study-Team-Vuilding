import { useEffect, useRef } from 'react';
import Logo from './Logo';
import PublicFooter from './PublicFooter';
import './public-pages.css';
import HelpGuideBrowser from './HelpGuideBrowser';
import { GENERAL_HELP_ARTICLES, GENERAL_HELP_TOPICS, ROLE_NAMES } from '../data/helpCenter';

export default function GeneralHelpPage({ currentUser, theme, onToggleTheme, onSignIn }) {
  const titleRef = useRef(null);
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, []);
  return <div className="wba-dashboard-app wba-general-help">
    <header className="wba-general-help-nav">
      <a href={currentUser ? '#/dashboard' : '#/home'} aria-label={currentUser ? 'WBA workspace' : 'WBA home'}><Logo className="wba-nav-logo" /></a>
      <nav aria-label="Help Center navigation">
        <a href={currentUser ? '#/help-center' : '#/home'}>{currentUser ? 'Return to my task guides' : 'Back to home'}</a>
        <button type="button" className="wba-theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}><span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span></button>
      </nav>
    </header>
    <main className="wba-grid-container wba-help-center wba-general-help-main">
      <header className="wba-section-page-header"><div><h1 ref={titleRef} tabIndex={-1} className="wba-section-page-title">Help Center</h1><p className="wba-section-page-desc">General information about WBA, account access, inventory terms, and support.</p></div></header>
      <HelpGuideBrowser topics={GENERAL_HELP_TOPICS} articles={GENERAL_HELP_ARTICLES} title="General guides" searchPlaceholder="Try “sign in”, “available stock”, or “support”" />
      <section className="wba-glow-card wba-help-general-support" aria-labelledby="general-support-title">
        <h2 id="general-support-title">Looking for your task instructions?</h2>
        <p>{currentUser ? 'Your workspace has guides for your assigned role and a support ticket form.' : 'Sign in to see instructions for your assigned role and send a support ticket. If you cannot sign in, email support directly.'}</p>
        <div className="wba-help-page-actions">
          {currentUser ? <a className="wba-pill-btn" href="#/help-center">Open {ROLE_NAMES[currentUser.accessLevel]} task guides</a> : <button type="button" className="wba-btn-primary" onClick={onSignIn}>Sign in to your workspace</button>}
          <a href="mailto:vincentjamesguhiling@gmail.com">Email support</a>
        </div>
        <a href="#/contact">Contact Support</a>
      </section>
    </main>
    <PublicFooter />
  </div>;
}
