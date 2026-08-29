import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import FeaturesSection from './components/FeaturesSection';
import LoginModal from './components/LoginModal';
import './App.css';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  return (
    <div className="wba-landing-page">
      {/* Background Ambient Glows */}
      <div className="wba-bg-ambient-top"></div>
      <div className="wba-bg-ambient-right"></div>

      {/* Header / Navbar */}
      <Navbar
        onOpenLogin={() => setIsLoginOpen(true)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content */}
      <main className="wba-main-content">
        {/* Exact Recreation Hero Section */}
        <Hero onGetStarted={() => setIsLoginOpen(true)} />

        {/* Detailed Landing Sections */}
        <AboutSection />
        <FeaturesSection />
      </main>

      {/* Footer */}
      <footer className="wba-footer">
        <div className="wba-footer-content">
          <p>&copy; {new Date().getFullYear()} WBA Inc. All rights reserved.</p>
          <div className="wba-footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Support</a>
          </div>
        </div>
      </footer>

      {/* Interactive Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </div>
  );
}

export default App;
