import { useEffect, useRef, useState } from 'react';
import { apiRequest, refreshData } from '../../services/api';
import useApiData from '../../services/useApiData';
import { hasPermission, PERMISSIONS } from '../../data/rbac';
import ApiStatus from '../ApiStatus';
import { SkeletonText } from '../SkeletonLoader';
import './inventory-ledger.css';

export default function ProductReportsDialog({ item, currentUser, onClose }) {
  const dialogRef = useRef(null);
  const [page, setPage] = useState(1);
  const [kind, setKind] = useState('info');
  const [message, setMessage] = useState('');
  const [counted, setCounted] = useState('');
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');
  const canAddReport = hasPermission(currentUser?.accessLevel, PERMISSIONS.ADD_PRODUCT_REPORT) && !item.isArchived;
  const { data, meta, fetching, loading, error, reload } = useApiData('items/' + item.id + '/reports?page=' + page);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  const submit = async event => {
    event.preventDefault();
    if (!canAddReport || pending || message.trim().length < 3) return;
    setPending(true); setSubmitError(''); setSuccess('');
    try {
      const result = await apiRequest('warehouse/items/' + item.id + '/reports', { method: 'POST', body: {
        kind, message: message.trim(), countedQuantity: kind === 'mismatch' && counted !== '' ? Number(counted) : null,
      } });
      setMessage(''); setCounted(''); setSuccess(result.message); setPage(1); refreshData();
    } catch (failure) {
      setSubmitError(failure.message);
    } finally {
      setPending(false);
    }
  };

  return <dialog ref={dialogRef} className="wba-product-dialog wba-product-reports-dialog" aria-labelledby="product-reports-title" aria-describedby="product-reports-description" onCancel={event => { event.preventDefault(); if (!pending) onClose(); }}>
    <button type="button" className="wba-modal-close-btn" aria-label="Close product reports" disabled={pending} onClick={onClose}>×</button>
    <div className="wba-product-reports-body">
      <h2 id="product-reports-title">Product reports</h2>
      <div className="wba-product-dialog-identity"><strong>{item.name}</strong><span>{item.sku} · {item.warehouseBin}</span></div>
      <p id="product-reports-description">Warehouse observations and reported mismatches. Saving a report does not change stock quantities.</p>
      {canAddReport && <form className="wba-report-form" onSubmit={submit} aria-busy={pending}>
        <label className="wba-input-group"><span className="wba-input-label">Report type</span>
          <select className="wba-input-field" value={kind} disabled={pending} onChange={event => { setKind(event.target.value); setCounted(''); }}>
            <option value="info">Info / note</option><option value="mismatch">Mismatch</option>
          </select>
        </label>
        {kind === 'mismatch' && <label className="wba-input-group"><span className="wba-input-label">Counted quantity (optional)</span>
          <input type="number" className="wba-input-field" min={0} max={100000000} step={1} value={counted} disabled={pending} onChange={event => setCounted(event.target.value)} />
        </label>}
        <label className="wba-input-group"><span className="wba-input-label">Description (required)</span>
          <textarea className="wba-input-field" rows={3} required minLength={3} maxLength={1000} value={message} disabled={pending} onChange={event => setMessage(event.target.value)} placeholder="Describe what you observed and where it happened." />
        </label>
        {submitError && <p className="wba-product-action-error" role="alert">{submitError}</p>}
        <div className="wba-product-dialog-actions"><button type="submit" className="wba-btn-primary" disabled={pending || message.trim().length < 3}>{pending ? 'Saving report…' : 'Save report'}</button></div>
      </form>}
      {success && <p className="wba-report-success" role="status">{success}</p>}
      <section className="wba-report-history" aria-label="Report history" aria-busy={fetching}>
        <h3>Report history</h3>
        {loading || error ? <ApiStatus loading={loading} error={error} onRetry={reload} loadingLabel="Loading product reports…"><SkeletonText lines={4} /></ApiStatus>
          : <>
            {data.length === 0 ? <p>No reports yet. Warehouse staff can add the first observation.</p> : <ol className="wba-report-list">
              {data.map(report => <li key={report.id}>
                <div className="wba-report-entry-header"><span className={'wba-report-type ' + report.kind}>{report.kind === 'mismatch' ? 'Mismatch' : 'Info'}</span><time dateTime={report.createdAt}>{new Date(report.createdAt).toLocaleString()}</time></div>
                <p className="wba-report-message">{report.message}</p>
                {report.countedQuantity !== null && <p>Counted: {report.countedQuantity} · Ledger: {report.ledgerQuantity} · Difference: {report.variance > 0 ? '+' : ''}{report.variance}</p>}
                <span className="wba-report-actor">Reported by {report.actor}</span>
              </li>)}
            </ol>}
            {meta && meta.lastPage > 1 && <div className="wba-report-pagination">
              <span>Page {meta.currentPage} of {meta.lastPage} · {meta.total} reports</span>
              <div><button type="button" className="wba-ledger-action" disabled={fetching || pending || page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button>
                <button type="button" className="wba-ledger-action" disabled={fetching || pending || page >= meta.lastPage} onClick={() => setPage(value => value + 1)}>Next</button></div>
            </div>}
          </>}
      </section>
      <div className="wba-product-dialog-actions"><button type="button" className="wba-pill-btn" disabled={pending} onClick={onClose}>Close</button></div>
    </div>
  </dialog>;
}
