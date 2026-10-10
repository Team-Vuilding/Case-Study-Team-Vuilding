import React, { useState, useRef, useEffect } from 'react';
import { authApi } from '../../services/api';

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
  const initials = currentUser?.initials || currentUser?.name?.split(' ').map((n) => n[0]).join('') || 'A';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivateError, setDeactivateError] = useState('');
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [scheduledDeletionDate, setScheduledDeletionDate] = useState('');
  const menuRef = useRef(null);

  // Close user dropdown menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleOpenDeactivateModal = () => {
    setScheduledDeletionDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
      month: 'long', day: 'numeric', year: 'numeric',
    }));
    setIsMenuOpen(false);
    setDeactivatePassword('');
    setDeactivateError('');
    setIsDeactivateModalOpen(true);
  };

  const handleConfirmDeactivation = async (event) => {
    event.preventDefault();
    if (!deactivatePassword || isDeactivating) return;
    setIsDeactivating(true);
    setDeactivateError('');
    try {
      await authApi.deactivate(deactivatePassword);
      setIsDeactivateModalOpen(false);
      if (onLogout) {
        onLogout();
      }
    } catch (err) {
      setDeactivateError(err.message || 'Failed to deactivate account.');
    } finally {
      setIsDeactivating(false);
    }
  };

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

        {/* Theme Toggle */}
        <button
          type="button"
          className="wba-icon-btn wba-dashboard-theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
        </button>

        {/* Notification Bell */}
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

        {/* User Avatar with Profile & Account Menu */}
        <div ref={menuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="wba-user-avatar"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            aria-label="User account menu"
            title={`${currentUser?.name || 'User'} (${currentUser?.email}) - Click for options`}
            style={{ cursor: 'pointer', border: 'none' }}
          >
            {initials}
          </button>

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

          {/* User Menu Dropdown */}
          {isMenuOpen && (
            <div
              className="wba-account-menu-popover"
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '260px',
                background: '#130d24',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                borderRadius: '12px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)',
                padding: '16px',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ borderBottom: '1px solid rgba(168, 85, 247, 0.18)', paddingBottom: '10px' }}>
                <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem' }}>{currentUser?.name}</strong>
                <span style={{ display: 'block', color: '#a79cb8', fontSize: '0.78rem', marginTop: '2px', wordBreak: 'break-all' }}>{currentUser?.email}</span>
                <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.7rem', color: '#c084fc', background: 'rgba(192, 132, 252, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>
                  {currentUser?.role || currentRole}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleOpenDeactivateModal}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    background: 'rgba(245, 158, 11, 0.08)',
                    color: '#fbbf24',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span aria-hidden="true">⚠️</span>
                  <span>Deactivate Account</span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    background: 'transparent',
                    color: '#e9d5ff',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span aria-hidden="true">🚪</span>
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Deactivation Modal */}
      {isDeactivateModalOpen && (
        <div className="wba-dash-modal-overlay" onClick={() => setIsDeactivateModalOpen(false)}>
          <div
            className="wba-dash-modal-card"
            style={{ maxWidth: '500px', border: '1.5px solid rgba(245, 158, 11, 0.5)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="deactivate-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="wba-modal-close-btn"
              onClick={() => setIsDeactivateModalOpen(false)}
              aria-label="Close deactivation modal"
            >
              &times;
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <h2 id="deactivate-dialog-title" style={{ color: '#fff', fontSize: '1.25rem', margin: 0 }}>
                Deactivate Your Account
              </h2>
            </div>

            <div
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '10px',
                padding: '14px',
                margin: '14px 0',
                fontSize: '0.85rem',
                lineHeight: 1.55,
                color: '#fef3c7',
              }}
            >
              <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>
                30-Day Recovery Period Policy:
              </p>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Your access will be suspended immediately upon confirmation.</li>
                <li>You will have <strong>30 days</strong> to recover your account simply by signing back in.</li>
                <li>
                  Permanent deletion deadline: <strong>{scheduledDeletionDate}</strong>.
                </li>
                <li>
                  After this deadline, the server will <strong>permanently and irreversibly delete</strong> your account.
                </li>
              </ul>
            </div>

            <form onSubmit={handleConfirmDeactivation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label className="wba-input-group">
                <span className="wba-input-label" style={{ color: '#e9d5ff' }}>
                  Confirm your password to proceed
                </span>
                <input
                  type="password"
                  className="wba-input-field"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your current password"
                  value={deactivatePassword}
                  onChange={(e) => {
                    setDeactivatePassword(e.target.value);
                    setDeactivateError('');
                  }}
                />
              </label>

              {deactivateError && (
                <p className="wba-modal-error" role="alert" style={{ color: '#f87171', margin: 0, fontSize: '0.84rem' }}>
                  {deactivateError}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="wba-pill-btn"
                  onClick={() => setIsDeactivateModalOpen(false)}
                  disabled={isDeactivating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="wba-btn-primary"
                  style={{
                    background: '#dc2626',
                    borderColor: '#ef4444',
                    color: '#fff',
                  }}
                  disabled={isDeactivating}
                >
                  {isDeactivating ? 'Deactivating…' : 'Confirm Deactivation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
