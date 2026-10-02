import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import FeaturesSection from './components/FeaturesSection';
import WorkspaceAccess from './components/WorkspaceAccess';
import AdminDashboard from './components/dashboard/AdminDashboard';
import { authApi, getToken, setToken } from './services/api';
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
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(Boolean(getToken()));
  const [sessionError, setSessionError] = useState('');

  const [currentView, setCurrentView] = useState(() => getAccessRoute().view);

  const [selectedRole, setSelectedRole] = useState(() => getAccessRoute().role);
  const [isRolePickerOpen, setIsRolePickerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (currentUser) return undefined;
    const handleAccessRoute = () => {
      // Login stores the token before React removes this public-route listener.
      if (getToken()) return;
      const route = getAccessRoute();
      setCurrentView(route.view);
      setSelectedRole(route.role);
    };
    window.addEventListener('hashchange', handleAccessRoute);
    return () => window.removeEventListener('hashchange', handleAccessRoute);
  }, [currentUser]);

  useEffect(() => {
    let active = true;
    if (getToken()) {
      authApi.me().then(user => {
        if (active) { setCurrentUser(user); setCurrentView('dashboard'); }
      }).catch(error => {
        if (active && getToken()) setSessionError(error.message);
      }).finally(() => { if (active) setCheckingSession(false); });
    }
    const expired = () => { setSessionError(''); setCurrentUser(null); setCurrentView('landing'); window.location.hash = '#/home'; };
    window.addEventListener('wba-auth-expired', expired);
    return () => { active = false; window.removeEventListener('wba-auth-expired', expired); };
  }, []);

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
      localStorage.setItem('wba_active_tab', 'dashboard');
    } catch {
      // ignore storage error
    }
    window.location.hash = '#/dashboard';
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (error) { if (getToken()) { setSessionError(error.message); return; } }
    setToken(null);
    setIsRolePickerOpen(false);
    setCurrentUser(null);
    setCurrentView('landing');
    try {
      localStorage.removeItem('wba_active_tab');
    } catch {
      // ignore storage error
    }
    window.location.hash = '#/home';
  };

  if (checkingSession) return <main className="wba-access-page" role="status">Checking your session…</main>;
  if (sessionError) return <main className="wba-access-page"><p role="alert">{sessionError}</p><button type="button" onClick={() => window.location.reload()}>Retry connection</button></main>;
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
