import React from 'react';

export default function DashboardHeader({
  isSidebarCollapsed,
  onToggleSidebar,
  currentRole = 'Admin',
  currentUser,
  pageTitle = 'Dashboard',
  unreadAlertCount = 3,
  onOpenNotifications,
  onLogout,
  theme,
  onToggleTheme,
}) {
  const initials = currentUser?.initials || currentUser?.name?.split(' ').map(n => n[0]).join('') || 'A';

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
          <h1 className="wba-header-title">{pageTitle}</h1>
        </div>
      </div>

      <div className="wba-header-right">
        {/* Role Badge */}
        <div className="wba-role-badge" title={`Signed in as: ${currentUser?.name || 'Admin'} · ${currentRole}`}>
          <span className="wba-role-dot" />
          <span>{currentRole}</span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="wba-icon-btn wba-dashboard-theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
        </button>
        <button
          type="button"
          className="wba-icon-btn"
          onClick={onOpenNotifications}
          aria-label="View notifications and alerts"
          title={`${unreadAlertCount} operational alerts`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadAlertCount > 0 && <span className="wba-notification-badge" />}
        </button>

        {/* User Avatar with logout tooltip */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            className="wba-user-avatar"
            title={`${currentUser?.name || 'Admin'} · ${currentUser?.department || ''}`}
          >
            {initials}
          </div>
          {onLogout && (
            <button
              type="button"
              className="wba-toggle-btn"
              onClick={onLogout}
              title="Sign out"
              aria-label="Sign out"
              style={{ width: '34px', height: '34px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
