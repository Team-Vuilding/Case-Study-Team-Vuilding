import React, { useState, useEffect } from 'react';
import Logo from './Logo';

/**
 * LogoLoader - Futuristic WBA Brand Loader
 *
 * Props:
 * @param {'fullscreen' | 'card' | 'inline' | 'compact'} variant - Display mode
 * @param {'sm' | 'md' | 'lg' | 'xl'} size - Scale size
 * @param {string | string[]} message - Static message or array of cycling status strings
 * @param {boolean} showProgress - Whether to show the glowing indeterminate progress bar
 * @param {boolean} showOrbital - Whether to show the rotating outer particle/orbital rings
 * @param {boolean} blurBackdrop - Whether to apply backdrop-blur in fullscreen mode
 * @param {() => void} onClose - Optional close/cancel callback
 * @param {string} className - Additional CSS class names
 */
export default function LogoLoader({
  variant = 'card',
  size = 'md',
  message = 'Synchronizing telemetry data...',
  showProgress = true,
  showOrbital = true,
  blurBackdrop = true,
  onClose,
  className = '',
}) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // If message is an array, cycle through the messages smoothly
  useEffect(() => {
    if (Array.isArray(message) && message.length > 1) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % message.length);
      }, 2200);
      return () => clearInterval(interval);
    }
  }, [message]);

  const activeMessage = Array.isArray(message)
    ? message[currentMessageIndex]
    : message;

  return (
    <div
      className={`wba-logo-loader-wrap variant-${variant} size-${size} ${
        blurBackdrop ? 'has-blur' : ''
      } ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading..."
    >
      <div className="wba-logo-loader-container">
        {/* Glow ambient background aura */}
        <div className="wba-loader-aura"></div>

        {/* Outer Orbital Rings (Rotating SVG) */}
        {showOrbital && (
          <div className="wba-loader-orbital-wrap">
            <svg
              className="wba-loader-orbit-svg orbit-outer"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="100"
                cy="100"
                r="92"
                stroke="url(#orbitGradOuter)"
                strokeWidth="2"
                strokeDasharray="12 18"
                strokeLinecap="round"
                opacity="0.8"
              />
              <circle cx="100" cy="8" r="4" fill="#f472b6" filter="url(#glowOrbital)" />
              <circle cx="100" cy="192" r="3" fill="#c084fc" filter="url(#glowOrbital)" />
              <defs>
                <linearGradient id="orbitGradOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
                <filter id="glowOrbital" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>

            <svg
              className="wba-loader-orbit-svg orbit-inner"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="100"
                cy="100"
                r="76"
                stroke="url(#orbitGradInner)"
                strokeWidth="1.5"
                strokeDasharray="6 24"
                strokeLinecap="round"
                opacity="0.6"
              />
              <circle cx="24" cy="100" r="3" fill="#ec4899" />
              <circle cx="176" cy="100" r="3" fill="#38bdf8" />
              <defs>
                <linearGradient id="orbitGradInner" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        {/* Center Animated Logo Graphic */}
        <div className="wba-loader-logo-core">
          <Logo className="wba-loader-brand-svg" />
        </div>

        {/* Dynamic Status Message with Live Subtitle */}
        {activeMessage && (
          <div className="wba-loader-message-wrap">
            <span className="wba-loader-pulse-dot"></span>
            <p className="wba-loader-message">{activeMessage}</p>
          </div>
        )}

        {/* Glowing Linear Indeterminate Progress Indicator */}
        {showProgress && (
          <div className="wba-loader-progress-track">
            <div className="wba-loader-progress-bar">
              <div className="wba-loader-progress-glow"></div>
            </div>
          </div>
        )}

        {/* Close Button for Fullscreen / Modal variants */}
        {onClose && (
          <button
            type="button"
            className="wba-loader-close-btn"
            onClick={onClose}
            aria-label="Dismiss loader"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
