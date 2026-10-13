import { useCallback, useEffect, useRef, useState } from 'react';
import { apiRequest } from '../../services/api';
import ApiStatus from '../ApiStatus';
import { SkeletonList } from '../WorkspaceSkeletons';
import './form-and-alerts.css';

export default function NotificationDrawer({ isOpen, ...props }) {
  return isOpen ? <AlertsPanel {...props} /> : null;
}

const alertKey = alert => alert.id + ':' + alert.version;
function expiryLabel(value) {
  const expiry = new Date(value.slice(0, 10) + 'T00:00:00');
  const today = new Date();
  const days = Math.round((Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate()) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
  return days < 0 ? 'Expired' : days === 0 ? 'Expires today' : days === 1 ? 'Expires tomorrow' : 'Expires in ' + days + ' days';
}
const formatDate = value => new Date(value.slice(0, 10) + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

function AlertCard({ alert }) {
  return <article className="wba-alert-card">
    <div className="wba-alert-meta">
      <span className={'wba-alert-severity ' + (['critical', 'warning'].includes(alert.severity) ? alert.severity : 'info')}>{alert.severity === 'critical' ? 'Critical' : alert.severity === 'warning' ? 'Warning' : 'Info'}</span>
      <span>{alert.type === 'expiry' ? 'Batch expiry' : alert.type === 'stock' ? 'Low stock' : 'Operational update'}</span>
    </div>
    <h3>{alert.product || alert.title}</h3>
    {alert.sku && <p className="wba-alert-sku">{alert.sku}</p>}
    {alert.type === 'expiry' ? <>
      <p className="wba-alert-summary">{expiryLabel(alert.expiresAt)} · {alert.quantity} {alert.quantity === 1 ? 'unit' : 'units'}</p>
      <dl><div><dt>Expiry date</dt><dd><time dateTime={alert.expiresAt}>{formatDate(alert.expiresAt)}</time></dd></div>
        <div className="wba-alert-lot"><dt>Batch</dt><dd>{alert.lot}</dd></div></dl>
    </> : alert.type === 'stock' ? <dl>
      <div><dt>On hand</dt><dd>{alert.quantity} units</dd></div>
      <div><dt>Safety stock</dt><dd>{alert.safetyStock} units</dd></div>
    </dl> : <p className="wba-alert-summary">{alert.description}</p>}
  </article>;
}

function AlertsPanel({ onClose, notifications, loading, error, onRetry, onViewed }) {
  const dialogRef = useRef(null);
  const attempted = useRef('');
  const [shownThisVisit, setShownThisVisit] = useState(() => new Set(notifications.filter(alert => !alert.isRead).map(alertKey)));
  const [readError, setReadError] = useState('');
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  const markViewed = useCallback(async unread => {
    setMarking(true); setReadError('');
    setShownThisVisit(previous => new Set([...previous, ...unread.map(alertKey)]));
    try {
      for (let offset = 0; offset < unread.length; offset += 500) {
        await apiRequest('dashboard/alerts/viewed', { method: 'POST', body: {
          alerts: unread.slice(offset, offset + 500).map(({ id, version }) => ({ id, version })),
        } });
      }
      onViewed();
    } catch {
      setReadError('Could not mark notifications as viewed. Please retry.');
    } finally {
      setMarking(false);
    }
  }, [onViewed]);

  useEffect(() => {
    if (loading || error) return;
    const unread = notifications.filter(alert => !alert.isRead && alert.version);
    const signature = unread.map(alertKey).sort().join('|');
    if (!signature || signature === attempted.current) return;
    attempted.current = signature;
    void markViewed(unread);
  }, [notifications, loading, error, markViewed]);

  const current = notifications.filter(alert => !alert.isRead || shownThisVisit.has(alertKey(alert)));
  const viewed = notifications.filter(alert => alert.isRead && !shownThisVisit.has(alertKey(alert)));
  return <dialog ref={dialogRef} className="wba-drawer-panel wba-alert-drawer" aria-labelledby="alerts-title" onCancel={event => { event.preventDefault(); onClose(); }}>
    <header className="wba-alert-header">
      <div><h2 id="alerts-title">Notifications</h2><p>Stock levels and batch expiry updates.</p></div>
      <button type="button" className="wba-alert-close" aria-label="Close notifications" onClick={onClose}>×</button>
    </header>
    <div className="wba-alert-scroll">
      {loading || error ? <ApiStatus loading={loading} error={error} onRetry={onRetry} loadingLabel="Loading notifications…"><SkeletonList /></ApiStatus> : <>
        {readError && <div role="alert" className="wba-alert-read-error">{readError} <button type="button" className="wba-pill-btn" disabled={marking} onClick={() => markViewed(notifications.filter(alert => !alert.isRead && alert.version))}>Retry</button></div>}
        {current.length > 0 ? <section aria-label="New notifications" className="wba-alert-list">{current.map(alert => <AlertCard key={alertKey(alert)} alert={alert} />)}</section> : <div className="wba-alert-empty"><h3>You're all caught up</h3><p>No new notifications.</p></div>}
        {viewed.length > 0 && <details className="wba-viewed-alerts"><summary>Viewed alerts <span>{viewed.length}</span></summary><div className="wba-alert-list">{viewed.map(alert => <AlertCard key={alertKey(alert)} alert={alert} />)}</div></details>}
        <p className="wba-alert-footer" role="status">{marking ? 'Marking notifications as viewed…' : readError ? 'Unread notifications are still highlighted.' : 'New notifications are marked as viewed when opened.'}</p>
      </>}
    </div>
  </dialog>;
}
