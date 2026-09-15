import React from 'react';

export default function DashboardHeader({
  isSidebarCollapsed,
  onToggleSidebar,
  currentRole = 'Admin',
  unreadAlertCount = 3,
  onOpenNotifications,
  onOpenAddProduct,
  onViewLandingPage,
}) {
  return (
    <header className="wba-header">
      <div className="wba-header-left">
        <button
          type="button"
          className="wba-toggle-btn"
          onClick={onToggleSidebar}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>

        <span className="wba-header-separator">|</span>

        <div className="wba-header-title-wrap">
          <svg className="wba-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <h1 className="wba-header-title">Dashboard</h1>
        </div>
      </div>

      <div className="wba-header-right">
        {onViewLandingPage && (
          <button
            type="button"
            className="wba-pill-btn"
            style={{ border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c4b5fd' }}
            onClick={onViewLandingPage}
          >
            ← View Storefront
          </button>
        )}

        <div className="wba-role-badge" title="Role-based access level: Full Administrative Privileges">
          <span className="wba-role-dot" />
          <span>{currentRole}</span>
        </div>

        <button
          type="button"
          className="wba-icon-btn"
          onClick={onOpenNotifications}
          aria-label="View notifications and alerts"
          title={`${unreadAlertCount} critical operational alerts`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadAlertCount > 0 && <span className="wba-notification-badge" />}
        </button>

        <div className="wba-user-avatar" title="Signed in as Vincent (Admin)">
          V
        </div>
      </div>
    </header>
  );
}
