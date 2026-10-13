import { useId } from 'react';
import Logo from './Logo';
import './session-loader.css';

export default function SessionLoader({ leaving = false }) {
  const gridId = useId();
  return <div className={`wba-access-page wba-session-loader${leaving ? ' is-leaving' : ''}`} role="status" aria-label="Loading page">
    <svg className="wba-inventory-backdrop" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id={gridId} width="240" height="160" patternUnits="userSpaceOnUse">
          <path d="M16 20V144H224V20M16 92H224" className="wba-inventory-shelf" />
          <path d="M34 42H86V90H34ZM96 30H148V90H96ZM158 50H210V90H158ZM50 106H102V142H50ZM116 106H186V142H116" className="wba-inventory-package" />
          <path d="M60 42V56M122 30V44M184 50V64M76 106V116M151 106V116" className="wba-inventory-shelf" />
        </pattern>
      </defs>
      <rect width="1200" height="800" fill={`url(#${gridId})`} />
      <g className="wba-inventory-highlight highlight-one"><rect x="96" y="190" width="52" height="60" rx="3" /><rect x="290" y="586" width="52" height="36" rx="3" /></g>
      <g className="wba-inventory-highlight highlight-two"><rect x="878" y="210" width="52" height="40" rx="3" /><rect x="1010" y="426" width="52" height="36" rx="3" /></g>
      <path className="wba-inventory-scan" d="M0 92H1200" />
    </svg>
    <div className="wba-session-loader-content">
      <div className="wba-session-orbit-scene" aria-hidden="true">
        <div className="wba-session-orbit-halo" />
        <div className="wba-session-orbit-plane orbit-primary">
          <svg className="wba-session-orbit-rotor" viewBox="0 0 200 200">
            <circle className="wba-session-orbit-track" cx="100" cy="100" r="90" />
            <circle className="wba-session-orbit-trail" cx="100" cy="100" r="90" strokeDasharray="100 466" transform="rotate(-154 100 100)" />
            <circle className="wba-session-orbit-moon" cx="100" cy="10" r="4" />
            <circle className="wba-session-orbit-satellite" cx="100" cy="190" r="2" />
          </svg>
        </div>
        <div className="wba-session-orbit-plane orbit-secondary">
          <svg className="wba-session-orbit-rotor" viewBox="0 0 200 200">
            <circle className="wba-session-orbit-track" cx="100" cy="100" r="90" />
            <circle className="wba-session-orbit-trail" cx="100" cy="100" r="90" strokeDasharray="65 501" transform="rotate(-131 100 100)" />
            <circle className="wba-session-orbit-moon" cx="100" cy="10" r="3" />
          </svg>
        </div>
        <div className="wba-session-logo-core"><Logo /></div>
      </div>
    </div>
  </div>;
}
