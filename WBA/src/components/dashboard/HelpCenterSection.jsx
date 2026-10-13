import { useState } from 'react';
import { findHelpArticles, HELP_TOPICS, ROLE_NAMES } from '../../data/helpCenter';
import SupportTicketForm from './SupportTicketForm';
import './help-center.css';

export default function HelpCenterSection({ currentUser }) {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('all');
  const [relevantOnly, setRelevantOnly] = useState(true);
  const articles = findHelpArticles({ role: currentUser.accessLevel, topic, query, relevantOnly });
  const clearFilters = () => { setQuery(''); setTopic('all'); setRelevantOnly(false); };

  return <div className="wba-grid-container wba-help-center">
    <header className="wba-section-page-header">
      <div><h1 className="wba-section-page-title">Help Center</h1><p className="wba-section-page-desc">Practical guides for your WBA workspace, with help when something goes wrong.</p></div>
      <a className="wba-pill-btn wba-help-ticket-link" href="#support-ticket" onClick={event => { event.preventDefault(); document.getElementById('ticket-title')?.focus(); document.getElementById('support-ticket')?.scrollIntoView({ block: 'start' }); }}>Send a ticket ↗</a>
    </header>
    <section className="wba-help-toolbar" aria-label="Find help">
      <label className="wba-input-group" htmlFor="help-search"><span className="wba-input-label">Search guides</span><input id="help-search" className="wba-input-field" type="search" placeholder="Try “archive”, “QR”, or “access denied”" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <label className="wba-help-role-filter"><input type="checkbox" checked={relevantOnly} onChange={event => setRelevantOnly(event.target.checked)} />Guides for my role · {ROLE_NAMES[currentUser.accessLevel]}</label>
    </section>
    <div className="wba-help-layout">
      <nav className="wba-help-topics" aria-label="Help topics">
        <button type="button" className={topic === 'all' ? 'active' : ''} aria-pressed={topic === 'all'} onClick={() => setTopic('all')}><strong>All topics</strong><span>Browse the operational reference.</span></button>
        {HELP_TOPICS.map(item => <button type="button" key={item.id} className={topic === item.id ? 'active' : ''} aria-pressed={topic === item.id} onClick={() => setTopic(item.id)}><strong>{item.title}</strong><span>{item.description}</span></button>)}
      </nav>
      <section className="wba-glow-card wba-help-guides" aria-labelledby="help-guides-title">
        <div className="wba-help-section-heading"><h2 id="help-guides-title">{HELP_TOPICS.find(item => item.id === topic)?.title || 'Operational guides'}</h2><p role="status">{articles.length} {articles.length === 1 ? 'guide' : 'guides'}{relevantOnly ? ' for your role' : ' across all roles'}</p></div>
        {articles.length ? articles.map(article => <details className="wba-help-article" key={article.id}>
          <summary><span><strong>{article.title}</strong><span className="wba-help-article-summary">{article.summary}</span></span><span className="wba-help-expand" aria-hidden="true">+</span></summary>
          <div className="wba-help-article-body"><p className="wba-help-article-roles">For: {article.roles.map(role => ROLE_NAMES[role]).join(', ')}</p><ol>{article.steps.map(step => <li key={step}>{step}</li>)}</ol><p className="wba-help-note">{article.note}</p></div>
        </details>) : <div className="wba-help-empty"><h3>No guides match these filters</h3><p>Try another search or browse the guides for all roles.</p><button type="button" className="wba-pill-btn" onClick={clearFilters}>Show all guides</button></div>}
      </section>
    </div>
    <SupportTicketForm currentUser={currentUser} />
  </div>;
}
