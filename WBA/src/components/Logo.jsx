import React from 'react';

export default function Logo({ className = '' }) {
  return (
    <div className={`wba-logo-container ${className}`}>
      <svg
        viewBox="0 0 240 70"
        className="wba-logo-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sphere Gradients */}
          <radialGradient id="sphereGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#4a154b" />
            <stop offset="40%" stopColor="#2c0c3a" />
            <stop offset="85%" stopColor="#15051e" />
            <stop offset="100%" stopColor="#08020c" />
          </radialGradient>

          <linearGradient id="crescentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d946ef" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6b21a8" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="swooshGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fdf4ff" stopOpacity="1" />
            <stop offset="30%" stopColor="#f472b6" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#c084fc" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
          </linearGradient>

          {/* Letter Neon Stroke Gradients */}
          <linearGradient id="neonPinkViolet" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Crescent Sphere on the Left */}
        <g transform="translate(10, 5)">
          {/* Main Dark Sphere */}
          <circle cx="30" cy="30" r="26" fill="url(#sphereGrad)" />
          {/* Outer Glowing Rim / Arc */}
          <path
            d="M 12 42 A 26 26 0 0 1 30 4 A 26 26 0 0 0 12 42 Z"
            fill="url(#crescentGrad)"
            opacity="0.85"
            filter="url(#neonGlow)"
          />
          <path
            d="M 8 36 A 27 27 0 0 1 24 8"
            stroke="#f472b6"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            filter="url(#neonGlow)"
          />
        </g>

        {/* WBA Typography with futuristic outlined neon effect */}
        <g
          transform="translate(42, 45) skewX(-12)"
          fontFamily="'Barlow Condensed', 'Oswald', 'Inter', sans-serif"
          fontWeight="800"
          fontSize="40"
          letterSpacing="3"
        >
          {/* Shadow/Glow Pass */}
          <text
            x="0"
            y="0"
            fill="#100318"
            stroke="#c084fc"
            strokeWidth="3.5"
            strokeLinejoin="round"
            opacity="0.9"
            filter="url(#softGlow)"
          >
            WBA
          </text>
          {/* Inner Accent Fill */}
          <text
            x="0"
            y="0"
            fill="#1a0b26"
            stroke="url(#neonPinkViolet)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          >
            WBA
          </text>
          {/* Core White Outline Highlight */}
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
        </g>

        {/* Dynamic Glowing Underline / Swoosh extending to the right */}
        <path
          d="M 6 56 C 25 55, 60 52, 110 52 C 160 52, 210 55, 235 56 C 180 54, 110 55, 6 58 Z"
          fill="url(#swooshGrad)"
          filter="url(#neonGlow)"
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
  );
}
