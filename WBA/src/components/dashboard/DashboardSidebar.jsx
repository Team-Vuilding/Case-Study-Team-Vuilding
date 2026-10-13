import React, { useEffect, useState } from 'react';
import Logo from '../Logo';
import { isTabAllowed } from '../../data/rbac';
import WorkspaceDialog from '../WorkspaceDialog';

export default function DashboardSidebar({
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
  activeTab = 'dashboard',
  onSelectTab,
  currentUser,
}) {
  const accessLevel = currentUser?.accessLevel || 'admin';
  const [drawer, setDrawer] = useState({ requestedOpen: isMobileOpen, retained: isMobileOpen });
  if (drawer.requestedOpen !== isMobileOpen) {
    setDrawer({ requestedOpen: isMobileOpen, retained: true });
  }
  const drawerPresent = isMobileOpen || drawer.retained;
  const collapsed = isCollapsed && !drawerPresent;

  useEffect(() => {
    if (isMobileOpen || !drawer.retained) return;
    const immediate = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(max-width: 900px)').matches;
    const timeout = setTimeout(() => setDrawer(previous => ({ ...previous, retained: false })), immediate ? 0 : 180);
    return () => clearTimeout(timeout);
  }, [isMobileOpen, drawer.retained]);

  const sidebar = (
    <aside className={`wba-dash-sidebar ${collapsed ? 'collapsed' : ''} ${drawerPresent ? '' : 'mobile-closed'}`}>
      {/* Brand Logo matching reference */}
      <div className="wba-dash-sidebar-header">
        <Logo className="wba-dash-sidebar-logo" />
        <button
          type="button"
          className="wba-dash-mobile-toggle"
          onClick={onCloseMobile}
          aria-label="Close sidebar"
          title="Close sidebar"
        >
          ‹
        </button>
      </div>

      {/* Section Title */}
      {!collapsed && <div className="wba-dash-section-title">Overview</div>}

      {/* Main Nav Items */}
      <nav className="wba-dash-nav">
        {/* Dashboard */}
        <button
          type="button"
          className={`wba-dash-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('dashboard')}
          title="Dashboard"
        >
          <svg
            className="wba-dash-nav-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
          {!collapsed && <span className="wba-dash-nav-label">Dashboard</span>}
        </button>

        {/* Inventory */}
        <button
          type="button"
          className={`wba-dash-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('inventory')}
          title="Inventory"
        >
          <svg
            className="wba-dash-nav-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 3 9 5v8l-9 5-9-5V8z" />
            <path d="m3 8 9 5 9-5M12 13v8M7.5 5.5l9 5" />
          </svg>
          {!collapsed && <span className="wba-dash-nav-label">Inventory</span>}
        </button>

        {/* Purchase history */}
        {isTabAllowed(accessLevel, 'purchase-history') && (
          <button
            type="button"
            className={`wba-dash-nav-item ${activeTab === 'purchase-history' ? 'active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('purchase-history')}
            title="Purchase history"
          >
            <svg
              className="wba-dash-nav-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
            {!collapsed && <span className="wba-dash-nav-label">Purchase history</span>}
          </button>
        )}

        {/* Audit logs */}
        {isTabAllowed(accessLevel, 'audit-logs') && (
          <button
            type="button"
            className={`wba-dash-nav-item ${activeTab === 'audit-logs' ? 'active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('audit-logs')}
            title="Audit logs"
          >
            <svg
              className="wba-dash-nav-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            {!collapsed && <span className="wba-dash-nav-label">Audit logs</span>}
          </button>
        )}
      </nav>

      {/* Bottom Footer Navigation */}
      <div className="wba-dash-sidebar-bottom">
        {/* Manage Accounts (Admin only) */}
        {isTabAllowed(accessLevel, 'manage-accounts') && (
          <>
            <button
              type="button"
              className={`wba-dash-nav-item ${activeTab === 'manage-accounts' ? 'active' : ''}`}
              onClick={() => onSelectTab && onSelectTab('manage-accounts')}
              title="Manage Accounts"
            >
              <svg
                className="wba-dash-nav-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
                <circle cx="7" cy="15" r="1.5" />
                <line x1="12" y1="15" x2="18" y2="15" />
              </svg>
              {!collapsed && <span className="wba-dash-nav-label">Manage Accounts</span>}
            </button>
            <div className="wba-dash-divider" />
          </>
        )}

        {/* Help center */}
        <button
          type="button"
          className={`wba-dash-nav-item ${activeTab === 'help-center' ? 'active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('help-center')}
          title="Help center"
        >
          <svg
            className="wba-dash-nav-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {!collapsed && <span className="wba-dash-nav-label">Help center</span>}
        </button>
      </div>
    </aside>
  );
  return drawerPresent ? <WorkspaceDialog onClose={onCloseMobile} label="Workspace navigation" closeLabel="Close sidebar" className={`wba-sidebar-dialog ${isMobileOpen ? '' : 'wba-sidebar-closing'}`}>{sidebar}</WorkspaceDialog> : sidebar;
}
