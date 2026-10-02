import ApiStatus from '../ApiStatus';

export default function NotificationDrawer({ isOpen, onClose, notifications, loading, error, onRetry }) {
  if (!isOpen) return null;
  return <div className="wba-dash-modal-overlay" onClick={onClose}><section className="wba-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="alerts-title" onClick={event => event.stopPropagation()}>
    <button type="button" className="wba-modal-close-btn" aria-label="Close alerts" onClick={onClose}>×</button>
    <h3 id="alerts-title">Operational alerts</h3>
    {loading || error ? <ApiStatus loading={loading} error={error} onRetry={onRetry} /> : !notifications.length ? <p>No active alerts.</p> : notifications.map(item => <article className="wba-glow-card" key={item.id}><h4>{item.title}</h4><p>{item.description}</p><span>{item.severity}</span></article>)}
  </section></div>;
}
