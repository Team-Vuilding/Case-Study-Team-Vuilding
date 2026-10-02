import React, { useState } from 'react';

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      title: 'One inventory ledger',
      tag: 'STOCK VISIBILITY',
      desc: 'See on-hand stock, reservations, picking activity, and available-to-sell quantities in one view.',
      metrics: ['SKU-level stock details', 'Count mismatch alerts', 'Available-to-promise status'],
    },
    {
      title: 'Demand and expiry insights',
      tag: 'PLANNING',
      desc: 'Compare monthly demand with stock on hand and prioritize older batches before they expire.',
      metrics: ['Monthly demand overview', 'Reorder point guidance', 'Batch expiry tracking'],
    },
    {
      title: 'A shared operations record',
      tag: 'TEAM WORKFLOW',
      desc: 'Keep purchasing, warehouse, and sales teams working from the same operational picture.',
      metrics: ['Role-based dashboards', 'Purchase history', 'Audit activity'],
    },
  ];

  return (
    <section id="features" className="wba-section wba-features-section">
      <div className="wba-section-header">
        <span className="wba-badge">FEATURES</span>
        <h2 className="wba-section-title">The tools your team needs to stay ahead</h2>
        <p className="wba-section-desc">
          Clear inventory information for the decisions you make every day.
        </p>
      </div>

      <div className="wba-features-container">
        <div className="wba-feature-tabs">
          {features.map((feat, idx) => (
            <button
              key={idx}
              className={`wba-tab-btn ${activeTab === idx ? 'active' : ''}`}
              onClick={() => setActiveTab(idx)}
            >
              <span className="wba-tab-index">0{idx + 1}</span>
              <span className="wba-tab-title">{feat.title}</span>
            </button>
          ))}
        </div>

        <div className="wba-feature-display">
          <div className="wba-feature-badge">{features[activeTab].tag}</div>
          <h3 className="wba-feature-title">{features[activeTab].title}</h3>
          <p className="wba-feature-desc">{features[activeTab].desc}</p>
          
          <div className="wba-feature-metrics">
            {features[activeTab].metrics.map((metric, i) => (
              <div key={i} className="wba-metric-pill">
                <span className="wba-metric-check">✓</span>
                <span>{metric}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
