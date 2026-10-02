import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import FeaturesSection from './components/FeaturesSection';
import WorkspaceAccess from './components/WorkspaceAccess';
import AdminDashboard from './components/dashboard/AdminDashboard';
import { getActiveAccount } from './data/authAccounts';
import './App.css';
import './landing-modern.css';

const ACCESS_LEVELS = ['admin', 'warehouse', 'purchasing', 'sales'];

function getAccessRoute() {
  const route = window.location.hash.replace(/^#\/?/, '');
  const role = route.startsWith('login/') ? route.slice(6) : null;
  if (ACCESS_LEVELS.includes(role)) return { view: 'role-login', role };
  return { view: 'landing', role: null };
}

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('wba_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });
  // Check localStorage for persisted user session across page refreshes
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('wba_auth_user');
      return savedUser ? getActiveAccount(JSON.parse(savedUser).id) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState(() => {
    try {
      const savedUser = localStorage.getItem('wba_auth_user');
      return savedUser && getActiveAccount(JSON.parse(savedUser).id) ? 'dashboard' : getAccessRoute().view;
    } catch {
      return getAccessRoute().view;
    }
  });

  const [selectedRole, setSelectedRole] = useState(() => getAccessRoute().role);
  const [isRolePickerOpen, setIsRolePickerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (currentUser) return undefined;
    const handleAccessRoute = () => {
      try {
        const savedUser = localStorage.getItem('wba_auth_user');
        if (savedUser && getActiveAccount(JSON.parse(savedUser).id)) return;
      } catch {
        // ignore an invalid saved session
      }
      const route = getAccessRoute();
      setCurrentView(route.view);
      setSelectedRole(route.role);
    };
    window.addEventListener('hashchange', handleAccessRoute);
    return () => window.removeEventListener('hashchange', handleAccessRoute);
  }, [currentUser]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem('wba_theme', theme);
    } catch {
      // ignore storage error
    }
  }, [theme]);

  const toggleTheme = () => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));

  const showRoleSelection = () => {
    setIsRolePickerOpen(true);
  };

  const showRoleLogin = (role) => {
    if (!ACCESS_LEVELS.includes(role)) return;
    setIsRolePickerOpen(false);
    window.location.hash = `#/login/${role}`;
    setSelectedRole(role);
    setCurrentView('role-login');
  };

  const showLanding = () => {
    setIsRolePickerOpen(false);
    window.location.hash = '#/home';
    setSelectedRole(null);
    setCurrentView('landing');
  };

  const showRolePickerFromLogin = () => {
    window.location.hash = '#/home';
    setSelectedRole(null);
    setCurrentView('landing');
    setIsRolePickerOpen(true);
  };

  const handleLoginSuccess = (user) => {
    setIsRolePickerOpen(false);
    try {
      localStorage.setItem('wba_auth_user', JSON.stringify(user));
      localStorage.setItem('wba_active_tab', 'dashboard');
    } catch {
      // ignore storage error
    }
    window.location.hash = '#/dashboard';
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsRolePickerOpen(false);
    setCurrentUser(null);
    setCurrentView('landing');
    try {
      localStorage.removeItem('wba_auth_user');
      localStorage.removeItem('wba_active_tab');
    } catch {
      // ignore storage error
    }
    window.location.hash = '#/home';
  };

  if (currentView === 'dashboard' && currentUser) {
    return (
      <AdminDashboard
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (currentView === 'role-login') {
    return (
      <WorkspaceAccess
        key={selectedRole}
        role={selectedRole}
        onSelectRole={showRoleLogin}
        onBack={showRolePickerFromLogin}
        onHome={showLanding}
        onSuccess={handleLoginSuccess}
        theme={theme}
        onToggleTheme={toggleTheme}
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
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content */}
      <main className="wba-main-content">
        <Hero onGetStarted={showRoleSelection} />
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

      {isRolePickerOpen && (
        <WorkspaceAccess
          role={null}
          onSelectRole={showRoleLogin}
          onClose={() => setIsRolePickerOpen(false)}
        />
      )}

    </div>
  );
}

export default App;
