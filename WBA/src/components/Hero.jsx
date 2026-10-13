import React from 'react';
import CardsGraphic from './CardsGraphic';

export default function Hero({ onGetStarted }) {
  return (
    <section id="home" className="wba-hero-section">
      <div className="wba-bg-ambient-top" aria-hidden="true" />
      <div className="wba-bg-ambient-right" aria-hidden="true" />
      <div className="wba-bg-ambient-center" aria-hidden="true" />
      <div className="wba-hero-container">
        {/* Left Column: Headline & Subtitle */}
        <div className="wba-hero-content">
          <span className="wba-hero-eyebrow"><span /> INVENTORY OPERATIONS, SIMPLIFIED</span>
          <h1 className="wba-hero-title">
            A clearer view of <span>every item in stock.</span>
          </h1>
          <p className="wba-hero-subtitle">
            Track availability, spot count mismatches, and keep your team aligned from the warehouse to the storefront.
          </p>
          <div className="wba-hero-actions">
            <button
              type="button"
              className="wba-cta-primary"
              onClick={onGetStarted}
            >
              Log in
            </button>
            <a href="#features" className="wba-cta-secondary">
              Explore features &rarr;
            </a>
          </div>
        </div>

        {/* Right Column: Layered Colored Cards Graphic */}
        <div className="wba-hero-visual">
          <CardsGraphic />
        </div>
      </div>

      {/* Thin Horizontal Accent Divider Line */}
      <div className="wba-hero-divider"></div>
    </section>
  );
}
