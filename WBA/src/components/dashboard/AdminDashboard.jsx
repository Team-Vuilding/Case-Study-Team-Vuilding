import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import DashboardOverview from './DashboardOverview';
import InventorySection from './InventorySection';
import PurchaseHistorySection from './PurchaseHistorySection';
import AuditLogsSection from './AuditLogsSection';
import NotificationDrawer from './NotificationDrawer';
import './dashboard.css';

export default function AdminDashboard({ currentUser, onLogout }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [liveLogs, setLiveLogs] = useState([]);

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
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'inventory':
        return <InventorySection onTriggerAudit={handleAddAuditLog} />;
      case 'purchase-history':
        return <PurchaseHistorySection />;
      case 'audit-logs':
        return <AuditLogsSection externalLogs={liveLogs} />;
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
              <h3 style={{ color: '#ffffff', marginBottom: '8px' }}>Account Management</h3>
              <p style={{ color: '#948aa8', fontSize: '0.88rem' }}>User roles and permissions management will be available in a future release.</p>
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
                <p className="wba-section-page-desc">Documentation, guides, and operational references.</p>
              </div>
            </div>
            <div className="wba-glow-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📚</div>
              <h3 style={{ color: '#ffffff', marginBottom: '8px' }}>Help & Documentation</h3>
              <p style={{ color: '#948aa8', fontSize: '0.88rem' }}>Operational documentation and user guides coming soon.</p>
            </div>
          </div>
        );
      default:
        return <DashboardOverview />;
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
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddProduct={() => setActiveTab('inventory')}
      />

      {/* Main Content Area */}
      <div className="wba-main-wrapper">
        <div className="wba-dashboard-frame">
          {/* Header Bar */}
          <DashboardHeader
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
            currentRole={currentUser?.role || 'Admin'}
            currentUser={currentUser}
            pageTitle={PAGE_TITLES[activeTab] || 'Dashboard'}
            unreadAlertCount={3}
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
      />
    </div>
  );
}
