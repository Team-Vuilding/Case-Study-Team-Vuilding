import React, { useState } from 'react';
import Logo from './Logo';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          <h2>Welcome Back</h2>
          <p>Access your real-time inventory intelligence dashboard</p>
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
              <input
                id="modal-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
