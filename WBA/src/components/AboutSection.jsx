import React from 'react';

export default function AboutSection() {
  return (
    <section id="about" className="wba-section wba-about-section">
      <div className="wba-section-header">
        <span className="wba-badge">ABOUT WBA</span>
        <h2 className="wba-section-title">Built around the way inventory moves</h2>
        <p className="wba-section-desc">
          WBA brings stock counts, demand, and operational activity together so each team can act with confidence.
        </p>
      </div>

      <div className="wba-about-grid">
        <div className="wba-about-card">
          <div className="wba-card-icon">⚡</div>
          <h3>Know what is available</h3>
          <p>See stock on hand alongside reservations and picking activity before making a commitment.</p>
        </div>

        <div className="wba-about-card">
          <div className="wba-card-icon">📊</div>
          <h3>Plan for demand</h3>
          <p>Compare seasonal demand patterns with available stock and reorder guidance.</p>
        </div>

        <div className="wba-about-card">
          <div className="wba-card-icon">🔄</div>
          <h3>Protect older stock</h3>
          <p>Track batch age and expiry to help warehouse teams pick stock in the right order.</p>
        </div>
      </div>
    </section>
  );
}
