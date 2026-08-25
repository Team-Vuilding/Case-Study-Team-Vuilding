import React, { useState } from 'react';
import Logo from './Logo';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="wba-modal-overlay" onClick={onClose}>
      <div
        className="wba-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
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
          <h2>Welcome Back Team Vuilding!</h2>
          <p>Login your credentials</p>
        </div>

        {isSubmitted ? (
          <div className="wba-modal-success">
            <div className="wba-success-icon">✓</div>
            <h3>Signed In Successfully</h3>
            <p>Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="wba-modal-form">
            <div className="wba-form-group">
              <label htmlFor="modal-email">Work Email</label>
              <input
                id="modal-email"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
              />
                <button
                  type="button"
                  className="wba-password-toggle"
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
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

            <div className="wba-form-meta">
              <label className="wba-checkbox-label">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#forgot" className="wba-forgot-link">Forgot password?</a>
            </div>

            <button type="submit" className="wba-modal-submit">
              Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
