import React, { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import { authApi } from '../services/api';
import '../workspace-access.css';

const ROLES = [
  { id: 'admin', name: 'Admin', initial: 'A', description: 'Manage accounts, stock, and system activity.' },
  { id: 'warehouse', name: 'Warehouse staff', initial: 'W', description: 'Receive stock, verify counts, and track batches.' },
  { id: 'purchasing', name: 'Purchasing manager', initial: 'P', description: 'Review supply, demand, and purchase history.' },
  { id: 'sales', name: 'Sales staff', initial: 'S', description: 'Check sellable stock and customer reservations.' },
];

function calculateRemaining(deadline, currentTime) {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - currentTime;
  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    expired: false,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export default function WorkspaceAccess({ role, onSelectRole, onClose, onBack, onHome, onSuccess, theme, onToggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deactivationInfo, setDeactivationInfo] = useState(null);
  const [isReactivating, setIsReactivating] = useState(false);
  const [reactivationSuccess, setReactivationSuccess] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now);
  const countdown = calculateRemaining(deactivationInfo?.deletionAt, currentTime);

  const closeButtonRef = useRef(null);
  const selectedRole = ROLES.find((item) => item.id === role);

  useEffect(() => {
    if (selectedRole) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRole, onClose]);

  // Live countdown timer based on server deadline
  useEffect(() => {
    if (!deactivationInfo?.deletionAt) return undefined;
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [deactivationInfo?.deletionAt]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedRole || isSubmitting) return;
    setError('');
    setDeactivationInfo(null);
    setReactivationSuccess('');
    setIsSubmitting(true);
    try {
      const user = await authApi.login({ email, password, accessLevel: selectedRole.id });
      if (!user) {
        setError(`These credentials do not match an active ${selectedRole.name.toLowerCase()} account.`);
        return;
      }
      onSuccess(user);
    } catch (err) {
      if (err.data?.accountStatus === 'deactivated' || err.data?.accountStatus === 'expired') {
        setCurrentTime(Date.now());
        setDeactivationInfo(err.data);
      } else {
        setError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactivate = async () => {
    if (!selectedRole || isReactivating || !deactivationInfo?.canReactivate) return;
    setIsReactivating(true);
    setError('');
    try {
      const result = await authApi.reactivate({
        email,
        password,
        accessLevel: selectedRole.id,
      });
      setReactivationSuccess('Account successfully reactivated! Redirecting to workspace…');
      setTimeout(() => {
        onSuccess(result.user);
      }, 900);
    } catch (err) {
      setError(err.message);
      if (err.data?.accountStatus === 'expired') {
        setDeactivationInfo((prev) => ({ ...prev, canReactivate: false, accountStatus: 'expired' }));
      }
    } finally {
      setIsReactivating(false);
    }
  };

  const handleDismissRecovery = () => {
    setDeactivationInfo(null);
    setError('');
    setReactivationSuccess('');
  };

  if (!selectedRole) {
    return (
      <div className="wba-role-picker-overlay" onClick={onClose}>
        <section className="wba-access-chooser" role="dialog" aria-modal="true" aria-labelledby="access-title" onClick={(event) => event.stopPropagation()}>
          <button ref={closeButtonRef} type="button" className="wba-role-picker-close" onClick={onClose} aria-label="Close role selection">×</button>
          <div className="wba-access-intro">
            <h1 id="access-title">Choose your role</h1>
            <p>Select the workspace you use. You’ll sign in with your account on the next page.</p>
          </div>
          <div className="wba-access-role-list">
            {ROLES.map((option) => (
              <button key={option.id} type="button" className="wba-access-role" onClick={() => onSelectRole(option.id)}>
                <span className="wba-access-role-icon" aria-hidden="true">{option.initial}</span>
                <span className="wba-access-role-copy">
                  <strong>{option.name}</strong>
                  <span>{option.description}</span>
                </span>
                <span className="wba-access-role-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="wba-access-page">
      <header className="wba-access-header">
        <button type="button" className="wba-access-home" onClick={onHome} aria-label="Return to home">
          <Logo className="wba-access-logo" />
        </button>
        <div className="wba-access-header-actions">
          <button type="button" className="wba-theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
          </button>
          <button type="button" className="wba-access-header-link" onClick={onHome}>Back to site</button>
        </div>
      </header>

      <main className="wba-access-main">
        <section className="wba-access-login" aria-labelledby="role-login-title">
          <button type="button" className="wba-access-back" onClick={onBack}>← Choose another role</button>
          <div className="wba-access-login-heading">
            <span className="wba-access-role-icon" aria-hidden="true">{selectedRole.initial}</span>
            <h1 id="role-login-title">{selectedRole.name} sign in</h1>
            <p>Use your {selectedRole.name.toLowerCase()} account to continue.</p>
          </div>

          {deactivationInfo ? (
            <div className={`wba-recovery-card ${deactivationInfo.accountStatus === 'expired' || countdown?.expired ? 'expired' : ''}`}>
              <div className="wba-recovery-header">
                <span className="wba-recovery-badge">
                  {deactivationInfo.accountStatus === 'expired' || countdown?.expired
                    ? 'Permanent Deletion'
                    : '30-Day Recovery Period'}
                </span>
              </div>

              <h2 className="wba-recovery-title">
                {deactivationInfo.accountStatus === 'expired' || countdown?.expired
                  ? 'Account Permanently Expired'
                  : 'Account is Deactivated'}
              </h2>

              <p className="wba-recovery-desc">
                {deactivationInfo.accountStatus === 'expired' || countdown?.expired
                  ? 'The 30-day recovery window has passed. This account has reached its scheduled deletion deadline and cannot be reactivated.'
                  : 'This account is currently deactivated. You can restore full access now within the 30-day recovery period.'}
              </p>

              <div className="wba-recovery-dates">
                <div className="wba-recovery-date-item">
                  <span>Deactivated On</span>
                  <strong>
                    {deactivationInfo.deactivatedAt
                      ? new Date(deactivationInfo.deactivatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recently'}
                  </strong>
                </div>
                <div className="wba-recovery-date-item">
                  <span>Scheduled Deletion</span>
                  <strong>
                    {deactivationInfo.deletionAt
                      ? new Date(deactivationInfo.deletionAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'In 30 days'}
                  </strong>
                </div>
              </div>

              {deactivationInfo.canReactivate && !countdown?.expired && (
                <div className="wba-countdown-panel">
                  <span className="wba-countdown-label">Time Remaining to Recover:</span>
                  <div className="wba-countdown-grid">
                    <div className="wba-countdown-box">
                      <strong>{countdown ? countdown.days : '--'}</strong>
                      <span>Days</span>
                    </div>
                    <div className="wba-countdown-box">
                      <strong>{countdown ? String(countdown.hours).padStart(2, '0') : '--'}</strong>
                      <span>Hours</span>
                    </div>
                    <div className="wba-countdown-box">
                      <strong>{countdown ? String(countdown.minutes).padStart(2, '0') : '--'}</strong>
                      <span>Minutes</span>
                    </div>
                    <div className="wba-countdown-box">
                      <strong>{countdown ? String(countdown.seconds).padStart(2, '0') : '--'}</strong>
                      <span>Seconds</span>
                    </div>
                  </div>
                </div>
              )}

              {reactivationSuccess && (
                <div className="wba-recovery-success" role="status">
                  {reactivationSuccess}
                </div>
              )}

              {error && <p className="wba-modal-error" role="alert">{error}</p>}

              <div className="wba-recovery-actions">
                {deactivationInfo.canReactivate && !countdown?.expired && !reactivationSuccess && (
                  <button
                    type="button"
                    className="wba-reactivate-btn"
                    onClick={handleReactivate}
                    disabled={isReactivating}
                  >
                    {isReactivating ? 'Reactivating account…' : 'Reactivate My Account'}
                  </button>
                )}

                <button
                  type="button"
                  className="wba-recovery-cancel-btn"
                  onClick={handleDismissRecovery}
                >
                  ← Back to standard sign in
                </button>
              </div>
            </div>
          ) : (
            <form className="wba-access-form" onSubmit={handleSubmit}>
              <div className="wba-form-group">
                <label htmlFor="access-email">Work email</label>
                <input
                  id="access-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError('');
                  }}
                  autoComplete="username"
                  required
                  placeholder="name@wba.com"
                />
              </div>
              <div className="wba-form-group">
                <label htmlFor="access-password">Password</label>
                <div className="wba-password-input-wrap">
                  <input
                    id="access-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError('');
                    }}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="wba-password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              {error && <p className="wba-modal-error" role="alert">{error}</p>}
              <button type="submit" className="wba-access-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : `Sign in as ${selectedRole.name}`}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
