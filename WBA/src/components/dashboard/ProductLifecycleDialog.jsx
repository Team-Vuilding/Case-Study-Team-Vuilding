import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../../services/api';

const ACTIONS = {
  archive: { title: 'Archive product', description: 'Remove this product from the active catalog. Its stock history and purchase records will remain available.', pending: 'Archiving…' },
  restore: { title: 'Restore product', description: 'Return this product to the active catalog with its original SKU and history.', pending: 'Restoring…' },
  delete: { title: 'Delete permanently', description: 'This unused product record will be permanently removed. This action cannot be undone. The audit record will remain.', pending: 'Deleting…' },
};

export default function ProductLifecycleDialog({ action, item, onClose, onComplete }) {
  const dialogRef = useRef(null);
  const reasonRef = useRef(null);
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const copy = ACTIONS[action];

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    reasonRef.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  const submit = async event => {
    event.preventDefault();
    if (pending || reason.trim().length < 3) return;
    setPending(true);
    setError('');
    try {
      const endpoint = 'items/' + item.id + (action === 'delete' ? '' : '/' + action);
      const response = await apiRequest(endpoint, { method: action === 'delete' ? 'DELETE' : 'POST', body: { reason: reason.trim() } });
      onComplete(response.message);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setPending(false);
    }
  };

  const cancel = event => {
    event.preventDefault();
    if (!pending) onClose();
  };

  return <dialog ref={dialogRef} className="wba-product-dialog" aria-labelledby="product-action-title" aria-describedby="product-action-description" onCancel={cancel}>
    <button type="button" className="wba-modal-close-btn" aria-label="Close product action" disabled={pending} onClick={onClose}>×</button>
    <form onSubmit={submit} aria-busy={pending}>
      <h2 id="product-action-title">{copy.title}</h2>
      <div className="wba-product-dialog-identity"><strong>{item.name}</strong><span>{item.sku}</span></div>
      <p id="product-action-description">{copy.description}</p>
      <label className="wba-input-group" htmlFor="product-action-reason">
        <span className="wba-input-label">Reason (required)</span>
        <textarea ref={reasonRef} id="product-action-reason" className="wba-input-field" rows={3} required minLength={3} maxLength={500} value={reason} disabled={pending} onChange={event => setReason(event.target.value)} />
      </label>
      {error && <p className="wba-product-action-error" role="alert">{error}</p>}
      <div className="wba-product-dialog-actions">
        <button type="button" className="wba-pill-btn" disabled={pending} onClick={onClose}>Cancel</button>
        <button type="submit" className={'wba-btn-primary' + (action === 'delete' ? ' wba-product-delete-btn' : '')} disabled={pending || reason.trim().length < 3}>{pending ? copy.pending : copy.title}</button>
      </div>
    </form>
  </dialog>;
}
