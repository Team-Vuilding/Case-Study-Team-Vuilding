import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { isDialogBackdrop } from '../utils/dialogBackdrop';

export default function WorkspaceDialog({ children, onClose, labelledBy, describedBy, label, closeLabel = 'Close dialog', busy = false, className = '' }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);
  const close = () => { if (!busy) onClose(); };
  const content = <dialog ref={dialogRef} className={'wba-dash-modal-card wba-workspace-dialog ' + className} aria-label={label} aria-labelledby={labelledBy} aria-describedby={describedBy} aria-busy={busy} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (isDialogBackdrop(event)) close(); }}>
    <button type="button" className="wba-modal-close-btn" aria-label={closeLabel} disabled={busy} onClick={close}>×</button>
    {children}
  </dialog>;
  return typeof document === 'undefined' ? content : createPortal(content, document.body);
}
