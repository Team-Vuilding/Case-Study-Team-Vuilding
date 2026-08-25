import React from 'react';
import Logo from './Logo';

export default function Navbar({ onOpenLogin, activeSection, setActiveSection }) {
  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="wba-header">
      <div className="wba-header-container">
        <a href="#home" className="wba-logo-link" onClick={(e) => handleNavClick(e, 'home')}>
          <Logo className="wba-nav-logo" />
        </a>

        <nav className="wba-nav">
          <ul className="wba-nav-list">
            <li>
              <a
                href="#home"
                className={`wba-nav-link ${activeSection === 'home' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, 'home')}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#about"
                className={`wba-nav-link ${activeSection === 'about' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, 'about')}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#features"
                className={`wba-nav-link ${activeSection === 'features' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, 'features')}
              >
                Features
              </a>
            </li>
          </ul>
        </nav>

        <div className="wba-header-actions">
          <button
            type="button"
            className="wba-login-btn"
            onClick={onOpenLogin}
            id="login-button"
          >
            LOG IN
          </button>
        </div>
      </div>
    </header>
  );
}
