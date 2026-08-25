import React, { useState } from 'react';

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      title: 'Smart Stock Velocity Tracker',
      tag: 'Live Telemetry',
      desc: 'Monitor real-time product movement per store aisle or SKU with dynamic heatmaps and velocity indexes.',
      metrics: ['99.98% Inventory Precision', '< 50ms Telemetry Sync', '24/7 Automated Shelf Scans'],
    },
    {
      title: 'Dynamic Reorder Automation',
      tag: 'Autonomous AI',
      desc: 'Set smart thresholds that automatically negotiate lead-time variances and fire purchase triggers.',
      metrics: ['Zero Stockouts Guaranteed', '40% Reduced Holding Cost', 'Direct Supplier API Integrations'],
    },
    {
      title: 'Revenue & Margin Intelligence',
      tag: 'Financial Insights',
      desc: 'Understand exactly which items yield top margins and where shelf-space yields maximum ROI.',
      metrics: ['Item Profitability Dashboards', 'Shrinkage & Waste Analytics', 'Automated Margin Alerts'],
    },
  ];

  return (
    <section id="features" className="wba-section wba-features-section">
      <div className="wba-section-header">
        <span className="wba-badge">FEATURES</span>
        <h2 className="wba-section-title">Built For Scale, Speed, and Certainty</h2>
        <p className="wba-section-desc">
          Everything your operations team needs to eliminate stockouts and maximize shelf productivity.
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
