import React from 'react';

/* ─────────────────────────────────────────────────────────────
   Icon 1 – Know what is available
   64px inventory box with glowing pulsing checkmark
───────────────────────────────────────────────────────────── */
export function InventoryCheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="check-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Box body */}
      <rect x="6" y="22" width="52" height="36" rx="5" fill="#3b1f6e" />
      {/* Box lid */}
      <rect x="4" y="13" width="56" height="12" rx="3" fill="#6d28d9" />
      {/* Lid strap */}
      <rect x="24" y="13" width="16" height="12" rx="2" fill="#7c3aed" />
      {/* Lid centre line */}
      <line x1="32" y1="13" x2="32" y2="25" stroke="#c4b5fd" strokeWidth="2" />
      {/* Box crease */}
      <rect x="20" y="32" width="24" height="4" rx="2" fill="#5b21b6" />
      {/* Animated checkmark badge */}
      <g className="wba-icon-check" filter="url(#check-glow)">
        <circle cx="32" cy="46" r="10" fill="#7c3aed" />
        <polyline
          points="27,46 30.5,49.5 37,41"
          stroke="#e9d5ff"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Icon 2 – Plan for demand
   64px bar chart with staggered bars + glowing trend dot
───────────────────────────────────────────────────────────── */
export function DemandChartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="dot-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Axes */}
      <line x1="10" y1="52" x2="56" y2="52" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="10" x2="10" y2="52" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" />
      {/* Bar 1 – short */}
      <rect x="14" y="38" width="9" height="14" rx="2.5" fill="#7c3aed" className="wba-bar wba-bar-1" />
      {/* Bar 2 – medium */}
      <rect x="27" y="26" width="9" height="26" rx="2.5" fill="#8b5cf6" className="wba-bar wba-bar-2" />
      {/* Bar 3 – tall */}
      <rect x="40" y="16" width="9" height="36" rx="2.5" fill="#a78bfa" className="wba-bar wba-bar-3" />
      {/* Trend line */}
      <polyline
        points="18.5,36 31.5,24 44.5,14"
        stroke="#c4b5fd"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Trend dot – animated glow ping */}
      <circle cx="44.5" cy="14" r="3.5" fill="#ede9fe" className="wba-trend-dot" filter="url(#dot-glow)" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Icon 3 – Protect older stock
   64px storage box + clock with spinning minute hand
───────────────────────────────────────────────────────────── */
export function StockAgeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="clock-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Box body */}
      <rect x="4" y="28" width="36" height="30" rx="5" fill="#3b1f6e" />
      {/* Box lid */}
      <rect x="2" y="18" width="40" height="13" rx="3" fill="#6d28d9" />
      {/* Lid strap */}
      <rect x="12" y="18" width="16" height="13" rx="2" fill="#7c3aed" />
      {/* Lid centre line */}
      <line x1="20" y1="18" x2="20" y2="31" stroke="#c4b5fd" strokeWidth="2" />
      {/* Box crease */}
      <rect x="10" y="37" width="18" height="3.5" rx="1.5" fill="#5b21b6" />
      {/* Clock outer ring (animated glow) */}
      <circle cx="48" cy="20" r="14" fill="#4c1d95" className="wba-clock-ring" filter="url(#clock-glow)" />
      {/* Clock face */}
      <circle cx="48" cy="20" r="11.5" fill="#5b21b6" />
      {/* Tick marks – 12,3,6,9 */}
      <line x1="48" y1="10"  x2="48" y2="12.5" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="48" y1="27.5" x2="48" y2="30" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="37.5" y1="20" x2="40" y2="20" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="56"  y1="20" x2="58.5" y2="20" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" />
      {/* Hour hand – static */}
      <line x1="48" y1="20" x2="44.5" y2="14" stroke="#ddd6fe" strokeWidth="2.2" strokeLinecap="round" />
      {/* Minute hand – spins */}
      <line
        x1="48" y1="20" x2="48" y2="11"
        stroke="#f0abfc"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="wba-clock-hand"
        style={{ transformOrigin: '48px 20px' }}
      />
      {/* Centre dot */}
      <circle cx="48" cy="20" r="2" fill="#ede9fe" />
    </svg>
  );
}

