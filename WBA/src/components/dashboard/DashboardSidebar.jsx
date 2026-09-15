import React from 'react';
import Logo from '../Logo';

export default function DashboardSidebar({
  isCollapsed = false,
  activeTab = 'dashboard',
  onSelectTab,
  onOpenAddProduct,
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="wba-nav-icon">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="wba-nav-icon">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      id: 'purchase-history',
      label: 'Purchase history',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="wba-nav-icon">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
          <path d="M2 12a10 10 0 0 1 18-6" />
        </svg>
      ),
    },
    {
      id: 'audit-logs',
      label: 'Audit logs',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="wba-nav-icon">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
      ),
    },
  ];

  return (
    <aside className={`wba-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="wba-sidebar-brand">
        <Logo className="wba-sidebar-logo" />
      </div>

      {/* Add Product Button */}
      <button
        type="button"
        className="wba-btn-add-product"
        onClick={onOpenAddProduct}
        title="Add New Product to Warehouse Catalog"
      >
        <span className="btn-icon-plus">+</span>
        {!isCollapsed && <span>Add product</span>}
      </button>

      {/* Main Navigation Section */}
      <div className="wba-nav-section-title">Overview</div>
      <ul className="wba-nav-list">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <li key={item.id} className="wba-nav-item">
              <button
                type="button"
                className={`wba-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => onSelectTab && onSelectTab(item.id)}
                title={item.label}
              >
                {item.icon}
                {!isCollapsed && <span className="wba-nav-text">{item.label}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Bottom Footer Items */}
      <div className="wba-sidebar-footer">
        <button
          type="button"
          className={`wba-nav-link ${activeTab === 'manage-accounts' ? 'active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('manage-accounts')}
          title="Manage Accounts"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="wba-nav-icon">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {!isCollapsed && <span className="wba-nav-text">Manage Accounts</span>}
        </button>

        <div className="wba-sidebar-divider" />

        <button
          type="button"
          className={`wba-nav-link ${activeTab === 'help-center' ? 'active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('help-center')}
          title="Help center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="wba-nav-icon">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {!isCollapsed && <span className="wba-nav-text">Help center</span>}
        </button>
      </div>
    </aside>
  );
}
