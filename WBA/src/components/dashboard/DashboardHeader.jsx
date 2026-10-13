import React, { useState, useRef, useEffect } from 'react';
import { authApi } from '../../services/api';
import WorkspaceDialog from '../WorkspaceDialog';

export default function DashboardHeader({
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
          aria-label="Toggle navigation"
          title="Toggle navigation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>

        <span className="wba-header-separator" aria-hidden="true">|</span>

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
          title={`${unreadAlertCount} unread notifications`}
          aria-haspopup="dialog"
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
                width: 'min(260px, calc(100vw - 32px))',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-accent)',
                borderRadius: '12px',
                padding: '16px',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <strong style={{ display: 'block', color: 'var(--wba-inline-strong)', fontSize: '0.9rem' }}>{currentUser?.name}</strong>
                <span style={{ display: 'block', color: 'var(--wba-inline-muted)', fontSize: '0.78rem', marginTop: '2px', overflowWrap: 'anywhere' }}>{currentUser?.email}</span>
                <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.7rem', color: 'var(--wba-inline-accent)', background: 'color-mix(in srgb, var(--wba-inline-accent) 12%, transparent)', padding: '2px 8px', borderRadius: '6px' }}>
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
                    border: '1px solid color-mix(in srgb, var(--wba-inline-warning) 35%, transparent)',
                    background: 'color-mix(in srgb, var(--wba-inline-warning) 8%, transparent)',
                    color: 'var(--wba-inline-warning)',
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
                    border: '1px solid var(--border-subtle)',
                    background: 'transparent',
                    color: 'var(--wba-inline-accent)',
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
        <WorkspaceDialog onClose={() => setIsDeactivateModalOpen(false)} labelledBy="deactivate-dialog-title" busy={isDeactivating} className="wba-confirm-dialog">
            <h2 id="deactivate-dialog-title">Deactivate your account?</h2>
            <div className="wba-recovery-notice"><strong>30-day recovery</strong><p>Access stops immediately. Sign in again before {scheduledDeletionDate} to recover your account. After that date, it becomes eligible for permanent deletion.</p></div>

            <form onSubmit={handleConfirmDeactivation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label className="wba-input-group">
                <span className="wba-input-label">
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
                <p className="wba-modal-error" role="alert">
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
                  className="wba-btn-primary wba-danger-button"
                  disabled={isDeactivating}
                >
                  {isDeactivating ? 'Deactivating…' : 'Deactivate account'}
                </button>
              </div>
            </form>
        </WorkspaceDialog>
      )}
    </header>
  );
}
