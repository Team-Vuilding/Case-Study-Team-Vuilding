import { useSyncExternalStore } from 'react';
import darkLogo from '../assets/wba-logo-dark.png';
import lightLogo from '../assets/wba-logo-light.png';
import './logo.css';

function subscribeTheme(onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

const getTheme = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
const getServerTheme = () => 'dark';

export default function Logo({ className = '' }) {
  // Follow the app's theme without requiring every branding surface to pass it down.
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);
  return <img
    className={`wba-logo-image ${className}`}
    src={theme === 'light' ? lightLogo : darkLogo}
    alt="WBA"
    width={1500}
    height={1500}
  />;
}
