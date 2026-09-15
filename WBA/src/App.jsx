import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import FeaturesSection from './components/FeaturesSection';
import LoginModal from './components/LoginModal';
import AdminDashboard from './components/dashboard/AdminDashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'landing'
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Handle successful login from modal
  const handleLoginSuccess = () => {
    setCurrentView('dashboard');
    setIsLoginOpen(false);
  };

  if (currentView === 'dashboard') {
    return (
      <AdminDashboard
        onViewLandingPage={() => setCurrentView('landing')}
      />
    );
  }

  return (
    <div className="wba-landing-page">
      {/* Background Ambient Glows */}
      <div className="wba-bg-ambient-top" />
      <div className="wba-bg-ambient-right" />

      {/* Header / Navbar */}
      <Navbar
        onOpenLogin={() => setIsLoginOpen(true)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content */}
      <main className="wba-main-content">
        {/* Exact Recreation Hero Section */}
        <Hero onGetStarted={() => setCurrentView('dashboard')} />

        {/* Detailed Landing Sections */}
        <AboutSection />
        <FeaturesSection />
      </main>

      {/* Footer */}
      <footer className="wba-footer">
        <div className="wba-footer-content">
          <p>&copy; {new Date().getFullYear()} WBA Inc. All rights reserved.</p>
          <div className="wba-footer-links">
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#c084fc', cursor: 'pointer' }}
              onClick={() => setCurrentView('dashboard')}
            >
              Access Admin Dashboard
            </button>
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
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
