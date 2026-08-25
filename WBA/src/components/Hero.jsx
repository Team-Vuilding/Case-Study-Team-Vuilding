import React from 'react';
import CardsGraphic from './CardsGraphic';

export default function Hero({ onGetStarted }) {
  return (
    <section id="home" className="wba-hero-section">
      <div className="wba-hero-container">
        {/* Left Column: Headline & Subtitle */}
        <div className="wba-hero-content">
          <h1 className="wba-hero-title">
            Track Smarter, Stock<br />
            Better, Sell More.
          </h1>
          <p className="wba-hero-subtitle">
            Real-time tracking and smart reorder,<br />
            keeping your shelves full and your<br />
            customers happy.
          </p>
          <div className="wba-hero-actions">
            <button
              type="button"
              className="wba-cta-primary"
              onClick={onGetStarted}
            >
              Log In
            </button>
            <a href="#features" className="wba-cta-secondary">
              Explore Features &rarr;
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
