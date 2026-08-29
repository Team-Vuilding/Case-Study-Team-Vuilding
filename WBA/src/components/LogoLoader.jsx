import React, { useState, useEffect } from 'react';

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
          <svg
            viewBox="0 0 240 70"
            className="wba-loader-brand-svg"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Sphere Gradient with pulsing shine */}
              <radialGradient id="loaderSphereGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#6b21a8" />
                <stop offset="45%" stopColor="#3b0764" />
                <stop offset="85%" stopColor="#1e052d" />
                <stop offset="100%" stopColor="#08020c" />
              </radialGradient>

              <linearGradient id="loaderCrescentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#c084fc" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.2" />
              </linearGradient>

              <linearGradient id="loaderSwooshGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="25%" stopColor="#f472b6" stopOpacity="0.95" />
                <stop offset="65%" stopColor="#c084fc" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="loaderNeonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>

              {/* Shimmer sweep animation over the logo */}
              <linearGradient id="logoShimmerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0">
                  <animate
                    attributeName="offset"
                    values="-1; 2"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="30%" stopColor="#ffffff" stopOpacity="0.8">
                  <animate
                    attributeName="offset"
                    values="-0.7; 2.3"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="60%" stopColor="#ffffff" stopOpacity="0">
                  <animate
                    attributeName="offset"
                    values="-0.4; 2.6"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </stop>
              </linearGradient>

              <filter id="loaderNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="loaderSuperGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing Crescent Planet Mark on Left */}
            <g className="wba-loader-sphere-group" transform="translate(10, 5)">
              {/* Main Sphere */}
              <circle cx="30" cy="30" r="26" fill="url(#loaderSphereGrad)" />
              
              {/* Outer Glowing Arc */}
              <path
                d="M 12 42 A 26 26 0 0 1 30 4 A 26 26 0 0 0 12 42 Z"
                fill="url(#loaderCrescentGrad)"
                filter="url(#loaderNeonGlow)"
                className="wba-loader-crescent-pulse"
              />
              
              {/* Intense Neon Rim Light */}
              <path
                d="M 8 36 A 27 27 0 0 1 24 8"
                stroke="#f472b6"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                filter="url(#loaderSuperGlow)"
              />
              
              {/* Shimmer Sparkle Dot */}
              <circle cx="24" cy="8" r="2.5" fill="#ffffff" filter="url(#loaderNeonGlow)" />
            </g>

            {/* Futuristic Skewed WBA Typography */}
            <g
              transform="translate(42, 45) skewX(-12)"
              fontFamily="'Barlow Condensed', 'Oswald', 'Inter', sans-serif"
              fontWeight="800"
              fontSize="40"
              letterSpacing="3"
            >
              {/* Outer Neon Blur Pass */}
              <text
                x="0"
                y="0"
                fill="#100318"
                stroke="#c084fc"
                strokeWidth="3.5"
                strokeLinejoin="round"
                opacity="0.9"
                filter="url(#loaderSuperGlow)"
              >
                WBA
              </text>
              
              {/* Inner Gradient Stroke */}
              <text
                x="0"
                y="0"
                fill="#1a0b26"
                stroke="url(#loaderNeonGradient)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              >
                WBA
              </text>
              
              {/* Sharp White Outline Highlight */}
              <text
                x="0"
                y="0"
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.6"
                strokeLinejoin="round"
                opacity="0.9"
              >
                WBA
              </text>

              {/* Shimmer Sweep Layer */}
              <text
                x="0"
                y="0"
                fill="url(#logoShimmerGrad)"
                opacity="0.9"
                pointerEvents="none"
              >
                WBA
              </text>
            </g>

            {/* Glowing Swoosh Underline */}
            <path
              d="M 6 56 C 25 55, 60 52, 110 52 C 160 52, 210 55, 235 56 C 180 54, 110 55, 6 58 Z"
              fill="url(#loaderSwooshGrad)"
              filter="url(#loaderNeonGlow)"
              className="wba-loader-swoosh-pulse"
            />
            <path
              d="M 12 55.5 L 140 53.5"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.95"
            />
          </svg>
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
