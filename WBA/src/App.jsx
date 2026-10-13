import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import PublicFooter from './components/PublicFooter';
import { PrivacyPolicyPage, TermsOfServicePage } from './components/LegalPages';
import ContactSupportPage from './components/ContactSupportPage';
import Navbar from './components/Navbar';
import BackToTop from './components/BackToTop';
import darkLogo from './assets/wba-logo-dark.png';
import lightLogo from './assets/wba-logo-light.png';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import FeaturesSection from './components/FeaturesSection';
import WorkspaceAccess from './components/WorkspaceAccess';
import AdminDashboard from './components/dashboard/AdminDashboard';
import GeneralHelpPage from './components/GeneralHelpPage';
import SessionLoader from './components/SessionLoader';
import { authApi, getToken, setToken } from './services/api';
import { animateNavigation } from './utils/navigationMotion';
import './App.css';
import './landing-modern.css';

const ACCESS_LEVELS = ['admin', 'warehouse', 'purchasing', 'sales'];

function getAccessRoute() {
  const route = window.location.hash.replace(/^#\/?/, '');
  if (route === 'help') return { view: 'general-help', role: null };
  const role = route.startsWith('login/') ? route.slice(6) : null;
  if (ACCESS_LEVELS.includes(role)) return { view: 'role-login', role };
  return { view: 'landing', role: null };
}

function App() {
  const location = useLocation();
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
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const publicPage = ['/privacy', '/terms', '/help', '/contact'].includes(location.pathname.replace(/\/$/, ''));
    const selector = currentView === 'landing' && !publicPage ? `#${activeSection}` : 'main';
    const cancel = animateNavigation(document.querySelector(selector), motionPreference.matches);
    const handleMotionChange = () => { if (motionPreference.matches) cancel?.(); };
    motionPreference.addEventListener('change', handleMotionChange);
    return () => {
      cancel?.();
      motionPreference.removeEventListener('change', handleMotionChange);
    };
  }, [location.pathname, currentView, selectedRole, activeSection]);

  useEffect(() => {
    const handleAccessRoute = () => {
      const route = getAccessRoute();
      if (route.view === 'general-help') {
        setIsRolePickerOpen(false);
        setCurrentView('general-help');
        setSelectedRole(null);
        return;
      }
      if (currentUser) {
        setCurrentView('dashboard');
        return;
      }
      // Login stores the token before React removes this public-route listener.
      if (getToken()) return;
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
        if (active) { setCurrentUser(user); setCurrentView(getAccessRoute().view === 'general-help' ? 'general-help' : 'dashboard'); }
      }).catch(error => {
        if (active && getToken()) setSessionError(error.message);
      }).finally(() => { if (active) setCheckingSession(false); });
    }
    const expired = () => {
      setSessionError(''); setCurrentUser(null);
      if (getAccessRoute().view === 'general-help') { setCurrentView('general-help'); return; }
      setCurrentView('landing'); window.location.hash = '#/home';
    };
    window.addEventListener('wba-auth-expired', expired);
    return () => { active = false; window.removeEventListener('wba-auth-expired', expired); };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.href = theme === 'light' ? lightLogo : darkLogo;
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

  const rolePicker = isRolePickerOpen && <WorkspaceAccess
    role={null}
    onSelectRole={showRoleLogin}
    onClose={() => setIsRolePickerOpen(false)}
  />;

  if (['/privacy', '/terms', '/help', '/contact'].includes(location.pathname.replace(/\/$/, ''))) {
    const pageProps = { currentUser, theme, onToggleTheme: toggleTheme };
    return <><Routes>
      <Route path="/privacy" element={<PrivacyPolicyPage {...pageProps} />} />
      <Route path="/terms" element={<TermsOfServicePage {...pageProps} />} />
      <Route path="/help" element={<GeneralHelpPage {...pageProps} onSignIn={showRoleSelection} />} />
      <Route path="/contact" element={<ContactSupportPage {...pageProps} />} />
    </Routes>{rolePicker}</>;
  }
  if (checkingSession) return <SessionLoader />;
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
      <PublicFooter />

      <BackToTop onBackToTop={() => setActiveSection('home')} />

      {rolePicker}

    </div>
  );
}

export default App;
