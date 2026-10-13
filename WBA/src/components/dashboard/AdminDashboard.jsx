import React, { useState, useEffect, useCallback } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import DashboardOverview from './DashboardOverview';
import InventorySection from './InventorySection';
import PurchaseHistorySection from './PurchaseHistorySection';
import AuditLogsSection from './AuditLogsSection';
import NotificationDrawer from './NotificationDrawer';
import ManageAccountsSection from './ManageAccountsSection';
import HelpCenterSection from './HelpCenterSection';
import { isTabAllowed, getDefaultTab } from '../../data/rbac';
import './dashboard.css';
import useApiData from '../../services/useApiData';

export default function AdminDashboard({ currentUser, onLogout, theme, onToggleTheme }) {
  const accessLevel = currentUser?.accessLevel || 'admin';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (window.matchMedia('(max-width: 900px)').matches) {
      setIsMobileSidebarOpen((prev) => !prev);
      return;
    }
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Helper to parse and sanitize active tab from hash or storage
  const resolveInitialTab = useCallback(() => {
    try {
      const hashTab = window.location.hash.replace(/^#\/?/, '').trim();
      if (hashTab && isTabAllowed(accessLevel, hashTab)) {
        return hashTab;
      }
      const savedTab = localStorage.getItem('wba_active_tab');
      if (savedTab && isTabAllowed(accessLevel, savedTab)) {
        return savedTab;
      }
    } catch {
      // ignore
    }
    return getDefaultTab(accessLevel);
  }, [accessLevel]);

  const [activeTab, setActiveTab] = useState(resolveInitialTab);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const alerts = useApiData('dashboard/alerts');

  // Sync state with URL hash and listen for direct manual URL changes
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
      if (rawHash === 'help') return;
      if (!rawHash) {
        return;
      }
      if (isTabAllowed(accessLevel, rawHash)) {
        setActiveTab(rawHash);
        try {
          localStorage.setItem('wba_active_tab', rawHash);
        } catch {
          // ignore
        }
      } else {
        // Direct unauthorized URL entry: reject and redirect to safe default
        const fallback = getDefaultTab(accessLevel);
        setActiveTab(fallback);
        window.location.hash = `#/${fallback}`;
        try {
          localStorage.setItem('wba_active_tab', fallback);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [accessLevel]);

  // Keep hash synchronized with activeTab
  useEffect(() => {
    if (window.location.hash !== `#/${activeTab}`) {
      window.location.hash = `#/${activeTab}`;
    }
  }, [activeTab]);

  const handleSelectTab = (tab) => {
    if (!isTabAllowed(accessLevel, tab)) {
      console.warn(`[RBAC] Navigation to '${tab}' blocked for accessLevel: ${accessLevel}`);
      return;
    }
    setActiveTab(tab);
    try {
      localStorage.setItem('wba_active_tab', tab);
    } catch {
      // ignore storage error
    }
  };


  const PAGE_TITLES = {
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    'purchase-history': 'Purchase History',
    'audit-logs': 'Audit Logs',
    'manage-accounts': 'Manage Accounts',
    'help-center': 'Help Center',
  };

  const renderContent = () => {
    // Route guard: strictly prevent rendering unauthorized tabs
    if (!isTabAllowed(accessLevel, activeTab)) {
      return (
        <div className="wba-grid-container">
          <div className="wba-glow-card" style={{ textAlign: 'center', padding: '60px 40px', border: '1px solid rgba(239, 68, 68, 0.45)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚫</div>
            <h2 style={{ color: 'var(--wba-inline-critical)', fontSize: '1.4rem', marginBottom: '8px' }}>Access Denied</h2>
            <p style={{ color: 'var(--wba-inline-accent)', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 20px' }}>
              Your account (<strong>{currentUser?.name || 'User'}</strong> — <em>{currentUser?.role || 'Staff'}</em>) is not authorized to access this section.
            </p>
            <button
              type="button"
              className="wba-btn-primary"
              onClick={() => handleSelectTab(getDefaultTab(accessLevel))}
            >
              Return to Authorized Dashboard
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview currentUser={currentUser} />;
      case 'inventory':
        return <InventorySection currentUser={currentUser} />;
      case 'purchase-history':
        return <PurchaseHistorySection currentUser={currentUser} />;
      case 'audit-logs':
        return <AuditLogsSection currentUser={currentUser} />;
      case 'manage-accounts':
        return <ManageAccountsSection currentUser={currentUser} />;
      case 'help-center':
        return <HelpCenterSection currentUser={currentUser} />;
      default:
        return <DashboardOverview currentUser={currentUser} />;
    }
  };

  return (
    <div className="wba-dashboard-app">
      {/* Background Ambient Violet Glows */}
      <div className="wba-ambient-blur-1" />
      <div className="wba-ambient-blur-2" />

      {/* Left Sidebar Navigation */}
      <DashboardSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAddProduct={() => handleSelectTab('inventory')}
        currentUser={currentUser}
      />
      {isMobileSidebarOpen && (
        <button
          type="button"
          className="wba-dash-sidebar-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Main Content Area */}
      <div className="wba-main-wrapper">
        <div className="wba-dashboard-frame">
          {/* Header Bar */}
          <DashboardHeader
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={handleToggleSidebar}
            currentRole={currentUser?.role || 'Admin'}
            currentUser={currentUser}
            pageTitle={PAGE_TITLES[activeTab] || 'Dashboard'}
            unreadAlertCount={alerts.data?.length || 0}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onLogout={onLogout}
            theme={theme}
            onToggleTheme={onToggleTheme}
          />

          {/* Tab Content */}
          <main className="wba-tab-content">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        currentUser={currentUser}
        notifications={alerts.data || []}
        loading={alerts.loading}
        error={alerts.error}
        onRetry={alerts.reload}
      />
    </div>
  );
}

