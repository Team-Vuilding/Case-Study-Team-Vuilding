import React, { useState, useEffect, useCallback } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import DashboardOverview from './DashboardOverview';
import InventorySection from './InventorySection';
import PurchaseHistorySection from './PurchaseHistorySection';
import AuditLogsSection from './AuditLogsSection';
import NotificationDrawer from './NotificationDrawer';
import { isTabAllowed, getDefaultTab } from '../../data/rbac';
import './dashboard.css';

export default function AdminDashboard({ currentUser, onLogout }) {
  const accessLevel = currentUser?.accessLevel || 'admin';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);

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
  const [liveLogs, setLiveLogs] = useState([]);

  // Sync state with URL hash and listen for direct manual URL changes
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
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

  const handleAddAuditLog = (newLog) => {
    setLiveLogs((prev) => [newLog, ...prev]);
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
            <h2 style={{ color: '#f87171', fontSize: '1.4rem', marginBottom: '8px' }}>Access Denied</h2>
            <p style={{ color: '#c4b5fd', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 20px' }}>
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
        return <InventorySection currentUser={currentUser} onTriggerAudit={handleAddAuditLog} />;
      case 'purchase-history':
        return <PurchaseHistorySection currentUser={currentUser} />;
      case 'audit-logs':
        return <AuditLogsSection currentUser={currentUser} externalLogs={liveLogs} />;
      case 'manage-accounts':
        return (
          <div className="wba-grid-container">
            <div className="wba-section-page-header">
              <div>
                <h2 className="wba-section-page-title">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Manage Accounts
                </h2>
                <p className="wba-section-page-desc">User account management — role assignments and access control.</p>
              </div>
            </div>
            <div className="wba-glow-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔐</div>
              <h3 style={{ color: '#ffffff', marginBottom: '8px' }}>Admin User Directory</h3>
              <p style={{ color: '#948aa8', fontSize: '0.88rem' }}>Active Administrator: {currentUser?.name} ({currentUser?.email})</p>
            </div>
          </div>
        );
      case 'help-center':
        return (
          <div className="wba-grid-container">
            <div className="wba-section-page-header">
              <div>
                <h2 className="wba-section-page-title">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Help Center
                </h2>
                <p className="wba-section-page-desc">Documentation, operational guides, and role references.</p>
              </div>
            </div>
            <div className="wba-glow-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📚</div>
              <h3 style={{ color: '#ffffff', marginBottom: '8px' }}>WBA Operational Reference</h3>
              <p style={{ color: '#948aa8', fontSize: '0.88rem' }}>Signed in as: {currentUser?.role} · Department: {currentUser?.department}</p>
            </div>
          </div>
        );
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

      {/* Main Content Area */}
      <div className="wba-main-wrapper">
        <div className="wba-dashboard-frame">
          {/* Header Bar */}
          <DashboardHeader
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => {
              setIsSidebarCollapsed((prev) => !prev);
              setIsMobileSidebarOpen(true);
            }}
            currentRole={currentUser?.role || 'Admin'}
            currentUser={currentUser}
            pageTitle={PAGE_TITLES[activeTab] || 'Dashboard'}
            unreadAlertCount={accessLevel === 'sales' ? 1 : accessLevel === 'purchasing' ? 1 : accessLevel === 'warehouse' ? 2 : 3}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onLogout={onLogout}
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
      />
    </div>
  );
}

