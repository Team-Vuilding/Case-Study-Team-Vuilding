import React from 'react';

export default function AboutSection() {
  return (
    <section id="about" className="wba-section wba-about-section">
      <div className="wba-section-header">
        <span className="wba-badge">ABOUT WBA</span>
        <h2 className="wba-section-title">Intelligent Inventory &amp; Stock Intelligence</h2>
        <p className="wba-section-desc">
          WBA gives modern businesses end-to-end visibility into their supply chain and shelf velocity with AI-driven analytics.
        </p>
      </div>

      <div className="wba-about-grid">
        <div className="wba-about-card">
          <div className="wba-card-icon">⚡</div>
          <h3>Instant Sync</h3>
          <p>Multi-channel real-time stock synchronisation across all physical shelves and digital storefronts.</p>
        </div>

        <div className="wba-about-card">
          <div className="wba-card-icon">📊</div>
          <h3>Predictive Forecasting</h3>
          <p>Machine learning models predict stock depletion weeks in advance to prevent stockouts and lost revenue.</p>
        </div>

        <div className="wba-about-card">
          <div className="wba-card-icon">🔄</div>
          <h3>Automated Reordering</h3>
          <p>Seamless automated purchase orders connected directly with your verified suppliers and warehouses.</p>
        </div>
      </div>
    </section>
  );
}
