import React from 'react';

export const ThinkingIcon = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Yellow background shape */}
    <circle cx="36" cy="24" r="14" fill="#FACC15" />
    
    {/* Blue question marks */}
    <path d="M12 16 C12 12, 20 12, 20 16 C20 20, 16 22, 16 26" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
    <circle cx="16" cy="34" r="2.5" fill="#38BDF8" />
    
    <path d="M54 12 C54 8, 62 8, 62 12 C62 16, 58 18, 58 22" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
    <circle cx="58" cy="30" r="2.5" fill="#38BDF8" />
    
    {/* Person face and body */}
    <circle cx="30" cy="26" r="14" stroke="currentColor" strokeWidth="3" fill="none" />
    <path d="M10 58 C10 44, 20 40, 30 40 C40 40, 50 44, 50 58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    
    {/* Finger / hand pointing at chin */}
    <path d="M30 40 L30 50 C30 52, 24 52, 24 50 L24 44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    {/* Using fill="none" instead of white to avoid hardcoded colors, or rely on page background. */}
    <path d="M30 38 L34 26 C35 24, 38 24, 38 26 L34 44" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChecklistIcon = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Clipboard body */}
    <rect x="12" y="8" width="40" height="48" rx="6" stroke="currentColor" strokeWidth="3" fill="none" />
    
    {/* Clip */}
    <rect x="24" y="4" width="16" height="8" rx="4" stroke="currentColor" strokeWidth="3" fill="none" />
    
    {/* Checklist items */}
    <path d="M20 24 L24 28 L30 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <line x1="34" y1="24" x2="46" y2="24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    
    <circle cx="24" cy="34" r="3" stroke="currentColor" strokeWidth="3" />
    <line x1="34" y1="34" x2="46" y2="34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    
    <circle cx="24" cy="44" r="3" stroke="currentColor" strokeWidth="3" />
    <line x1="34" y1="44" x2="46" y2="44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    
    {/* Pen */}
    <path d="M50 56 L38 44 L44 38 L56 50 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    <path d="M38 44 L32 46 L36 40 Z" fill="currentColor" />
  </svg>
);

export const TargetIcon = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Target */}
    <circle cx="32" cy="18" r="14" stroke="currentColor" strokeWidth="3" fill="none" />
    <circle cx="32" cy="18" r="6" stroke="currentColor" strokeWidth="3" fill="none" />
    <circle cx="32" cy="18" r="2" fill="currentColor" />
    
    {/* Arrow in target */}
    <line x1="32" y1="18" x2="48" y2="6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M40 6 L48 6 L48 14" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Blocks */}
    <rect x="8" y="36" width="48" height="6" rx="1.5" stroke="currentColor" strokeWidth="3" fill="none" />
    <rect x="8" y="46" width="32" height="6" rx="1.5" stroke="currentColor" strokeWidth="3" fill="none" />
    <rect x="8" y="56" width="32" height="6" rx="1.5" stroke="currentColor" strokeWidth="3" fill="none" />
    
    {/* Arrow pointing up */}
    <path d="M50 58 L50 48 M50 48 L44 54 M50 48 L56 54" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
