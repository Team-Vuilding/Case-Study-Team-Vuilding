import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import FeaturesSection from './components/FeaturesSection';
import LoginModal from './components/LoginModal';
import AdminDashboard from './components/dashboard/AdminDashboard';
import './App.css';

function App() {
  // Check localStorage for persisted user session across page refreshes
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('wba_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState(() => {
    try {
      const savedUser = localStorage.getItem('wba_auth_user');
      return savedUser ? 'dashboard' : 'landing';
    } catch {
      return 'landing';
    }
  });

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
    setIsLoginOpen(false);
    try {
      localStorage.setItem('wba_auth_user', JSON.stringify(user));
    } catch {
      // ignore storage error
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    try {
      localStorage.removeItem('wba_auth_user');
      localStorage.removeItem('wba_active_tab');
    } catch {
      // ignore storage error
    }
  };

  if (currentView === 'dashboard' && currentUser) {
    return (
      <AdminDashboard
        currentUser={currentUser}
        onLogout={handleLogout}
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
        <Hero onGetStarted={() => setIsLoginOpen(true)} />
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

      {/* Login Modal — fixed, above all landing page content */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
