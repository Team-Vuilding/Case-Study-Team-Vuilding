import Logo from './Logo';
import './session-loader.css';

export default function SessionLoader() {
  return <main className="wba-access-page wba-session-loader" aria-busy="true">
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
      <p className="wba-session-loader-title" role="status">Checking your session…</p>
      <p className="wba-session-loader-caption">Preparing your workspace.</p>
    </div>
  </main>;
}
