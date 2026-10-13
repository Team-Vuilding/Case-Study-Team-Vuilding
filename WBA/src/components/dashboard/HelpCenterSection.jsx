import { useEffect, useRef } from 'react';
import { ROLE_HELP } from '../../data/helpCenter';
import HelpGuideBrowser from '../HelpGuideBrowser';
import './help-center.css';

export default function HelpCenterSection({ currentUser }) {
  const titleRef = useRef(null);
  useEffect(() => { titleRef.current?.focus(); }, [currentUser.accessLevel]);
  const help = ROLE_HELP[currentUser.accessLevel];
  if (!help) return <p role="alert">Task guides are unavailable for this role. Ask your administrator to check your account.</p>;

  return <div className="wba-grid-container wba-help-center">
    <header className="wba-section-page-header">
      <div><h2 ref={titleRef} tabIndex={-1} className="wba-section-page-title">{help.title}</h2><p className="wba-section-page-desc">{help.description}</p></div>
      <div className="wba-help-page-actions">
        <a className="wba-pill-btn" href="#/help">General Help Center</a>
        <a className="wba-pill-btn wba-help-ticket-link" href="#/contact">Contact Support</a>
      </div>
    </header>
    <HelpGuideBrowser key={currentUser.accessLevel} topics={help.topics} articles={help.articles} title="My task guides" searchPlaceholder="Search your role’s tasks" />
  </div>;
}
