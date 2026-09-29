import React, { useState } from 'react';
import Logo from './Logo';
import { authenticate, DUMMY_ACCOUNTS } from '../data/authAccounts';

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showHints, setShowHints] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const user = await authenticate(email, password);
    if (!user) {
      setError('Invalid email or password. Check the credentials below and try again.');
      return;
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail('');
      setPassword('');
      setError('');
      if (onSuccess) onSuccess(user);
    }, 1100);
  };

  const handleQuickFill = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="wba-modal-overlay" onClick={onClose}>
      <div className="wba-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="wba-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="wba-modal-header">
          <Logo className="wba-modal-logo" />
          <h2>Welcome Back!</h2>
          <p>Sign in to access the WBA Operations Platform</p>
        </div>

        {isSubmitted ? (
          <div className="wba-modal-success">
            <div className="wba-success-icon">✓</div>
            <h3>Signed In Successfully</h3>
            <p>Redirecting to your dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="wba-modal-form">
            <div className="wba-form-group">
              <label htmlFor="modal-email">Work Email</label>
              <input
                id="modal-email"
                type="email"
                required
                placeholder="name@wba.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
              />
            </div>

            <div className="wba-form-group">
              <label htmlFor="modal-password">Password</label>
              <div className="wba-password-input-wrap">
                <input
                  id="modal-password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                />
                <button
                  type="button"
                  className="wba-password-toggle"
                  onClick={() => setIsPasswordVisible((v) => !v)}
                  aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                  aria-pressed={isPasswordVisible}
                >
                  {isPasswordVisible ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.3 4.1 9.5 6-0.6 1-1.7 2.5-3.2 3.8M6.2 6.2C4.1 7.6 2.8 9.4 2.5 10c1.2 1.9 4.5 6 9.5 6 1.2 0 2.4-.2 3.4-.7" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
                      <circle cx="12" cy="12" r="2.8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="wba-modal-error" role="alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <div className="wba-form-meta">
              <label className="wba-checkbox-label">
                <input type="checkbox" /> Remember me
              </label>
              <button
                type="button"
                className="wba-forgot-link"
                onClick={() => setShowHints((v) => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showHints ? 'Hide credentials' : 'View demo credentials'}
              </button>
            </div>

            {/* Demo credential hints */}
            {showHints && (
              <div className="wba-credentials-hint">
                <p className="wba-hint-label">Click an account to auto-fill:</p>
                {DUMMY_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    className="wba-hint-item"
                    onClick={() => handleQuickFill(acc)}
                  >
                    <span className="wba-hint-avatar">{acc.initials}</span>
                    <span className="wba-hint-info">
                      <strong>{acc.name}</strong>
                      <span>{acc.role} · {acc.email}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            <button type="submit" className="wba-modal-submit">
              Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
