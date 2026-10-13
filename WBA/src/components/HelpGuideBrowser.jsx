import { useState } from 'react';
import { filterHelpArticles } from '../data/helpCenter';
import './dashboard/help-center.css';

export default function HelpGuideBrowser({ topics, articles, title, searchPlaceholder }) {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('all');
  const filtered = filterHelpArticles(articles, { topic, query });
  const clearFilters = () => { setQuery(''); setTopic('all'); };

  return <>
    <section className="wba-help-toolbar" aria-label="Find help">
      <label className="wba-input-group" htmlFor="help-search"><span className="wba-input-label">Search guides</span><input id="help-search" className="wba-input-field" type="search" placeholder={searchPlaceholder} value={query} onChange={event => setQuery(event.target.value)} /></label>
    </section>
    <div className="wba-help-layout">
      <nav className="wba-help-topics" aria-label="Help topics">
        <button type="button" className={topic === 'all' ? 'active' : ''} aria-pressed={topic === 'all'} onClick={() => setTopic('all')}><strong>All topics</strong><span>Browse {title.toLowerCase()}.</span></button>
        {topics.map(item => <button type="button" key={item.id} className={topic === item.id ? 'active' : ''} aria-pressed={topic === item.id} onClick={() => setTopic(item.id)}><strong>{item.title}</strong><span>{item.description}</span></button>)}
      </nav>
      <section className="wba-glow-card wba-help-guides" aria-labelledby="help-guides-title">
        <div className="wba-help-section-heading"><h2 id="help-guides-title">{topics.find(item => item.id === topic)?.title || title}</h2><p role="status">{filtered.length} {filtered.length === 1 ? 'guide' : 'guides'}</p></div>
        {filtered.length ? filtered.map(article => <details className="wba-help-article" key={article.id}>
          <summary><span><strong>{article.title}</strong><span className="wba-help-article-summary">{article.summary}</span></span><span className="wba-help-expand" aria-hidden="true">+</span></summary>
          <div className="wba-help-article-body"><ol>{article.steps.map(step => <li key={step}>{step}</li>)}</ol><p className="wba-help-note">{article.note}</p></div>
        </details>) : <div className="wba-help-empty"><h3>No guides match these filters</h3><p>Try another search or return to all topics.</p><button type="button" className="wba-pill-btn" onClick={clearFilters}>Clear filters</button></div>}
      </section>
    </div>
  </>;
}
