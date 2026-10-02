import React, { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import { authenticate, DUMMY_ACCOUNTS } from '../data/authAccounts';
import '../workspace-access.css';

const ROLES = [
  { id: 'admin', name: 'Admin', initial: 'A', description: 'Manage accounts, stock, and system activity.' },
  { id: 'warehouse', name: 'Warehouse staff', initial: 'W', description: 'Receive stock, verify counts, and track batches.' },
  { id: 'purchasing', name: 'Purchasing manager', initial: 'P', description: 'Review supply, demand, and purchase history.' },
  { id: 'sales', name: 'Sales staff', initial: 'S', description: 'Check sellable stock and customer reservations.' },
];

export default function WorkspaceAccess({ role, onSelectRole, onClose, onBack, onHome, onSuccess, theme, onToggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const closeButtonRef = useRef(null);
  const selectedRole = ROLES.find((item) => item.id === role);
  const demoAccount = DUMMY_ACCOUNTS.find((item) => item.accessLevel === role);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedRole || isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      const user = await authenticate(email, password, selectedRole.id);
      if (!user) {
        setError(`These credentials do not match an active ${selectedRole.name.toLowerCase()} account.`);
        return;
      }
      onSuccess(user);
    } catch {
      setError('Sign in is unavailable right now. Try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            <form className="wba-access-form" onSubmit={handleSubmit}>
              <div className="wba-form-group">
                <label htmlFor="access-email">Work email</label>
                <input id="access-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} autoComplete="username" required placeholder="name@wba.com" />
              </div>
              <div className="wba-form-group">
                <label htmlFor="access-password">Password</label>
                <div className="wba-password-input-wrap">
                  <input id="access-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} autoComplete="current-password" required placeholder="Enter your password" />
                  <button type="button" className="wba-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              {error && <p className="wba-modal-error" role="alert">{error}</p>}
              <button type="submit" className="wba-access-submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : `Sign in as ${selectedRole.name}`}</button>
            </form>
            {demoAccount && (
              <div className="wba-access-demo">
                <button type="button" onClick={() => setShowDemo((shown) => !shown)} aria-expanded={showDemo}>{showDemo ? 'Hide' : 'Use'} demo credentials</button>
                {showDemo && (
                  <div>
                    <p>Demo account for {selectedRole.name.toLowerCase()}</p>
                    <code>{demoAccount.email}</code>
                    <button type="button" onClick={() => { setEmail(demoAccount.email); setPassword(demoAccount.password); setError(''); }}>Fill demo credentials</button>
                  </div>
                )}
              </div>
            )}
          </section>
      </main>
    </div>
  );
}
