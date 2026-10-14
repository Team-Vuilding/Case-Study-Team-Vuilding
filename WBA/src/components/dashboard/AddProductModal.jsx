import { useEffect, useRef, useState } from 'react';
import useApiData from '../../services/useApiData';
import './form-and-alerts.css';

export default function AddProductModal({ isOpen, onClose, onAddProduct }) {
  return isOpen ? <ProductForm onClose={onClose} onAddProduct={onAddProduct} /> : null;
}

function SkuPreview({ hasShelfLife }) {
  const { data, loading, error, reload } = useApiData('items/sku-preview?hasShelfLife=' + Number(hasShelfLife));
  return <div className="wba-input-group wba-sku-preview">
    <label className="wba-input-label" htmlFor="product-sku-preview">SKU</label>
    <input id="product-sku-preview" className="wba-input-field" readOnly value={data?.sku || ''} placeholder={loading ? 'Loading…' : error ? 'Unavailable' : ''} aria-busy={loading} aria-describedby={error ? 'product-sku-error' : undefined} />
    {error && <small id="product-sku-error" className="wba-field-help" role="alert">
      SKU preview unavailable. <button type="button" className="wba-pill-btn" onClick={reload}>Retry</button>
    </small>}
  </div>;
}

function ProductForm({ onClose, onAddProduct }) {
  const dialogRef = useRef(null);
  const [form, setForm] = useState({ name: '', fsn: 'Normal', unitPrice: '', physicalOnHand: '0', warehouseBin: '', hasShelfLife: false, expiresAt: '', storageCostPerMonth: '0', isSeasonal: false });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);
  const update = event => setForm({ ...form, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value });
  const submit = async event => {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError('');
    try {
      await onAddProduct({ ...form, unitPrice: Number(form.unitPrice), physicalOnHand: Number(form.physicalOnHand), storageCostPerMonth: Number(form.storageCostPerMonth), expiresAt: form.hasShelfLife && Number(form.physicalOnHand) > 0 ? form.expiresAt : null });
      onClose();
    } catch (reason) { setError(reason.message); } finally { setSaving(false); }
  };
  return <dialog ref={dialogRef} className="wba-dash-modal-card wba-product-form" aria-labelledby="add-product-title" onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}>
      <button type="button" className="wba-modal-close-btn" disabled={saving} onClick={onClose} aria-label="Close product form">×</button>
      <h2 id="add-product-title">Add inventory item</h2>
      <form onSubmit={submit}>
        <div className="wba-form-grid">
          <label className="wba-input-group"><span className="wba-input-label">Product name</span><input className="wba-input-field" name="name" required maxLength={200} value={form.name} onChange={update} autoFocus /></label>
          <SkuPreview key={String(form.hasShelfLife)} hasShelfLife={form.hasShelfLife} />
          {[['warehouseBin', 'Bin location', 'text'], ['unitPrice', 'Unit price (₱)', 'number'], ['physicalOnHand', 'Initial stock', 'number'], ['storageCostPerMonth', 'Cost', 'number']].map(([name, label, type]) =>
            <label className="wba-input-group" key={name}><span className="wba-input-label">{label}</span><input className="wba-input-field" name={name} type={type} required value={form[name]} onChange={update} min={type === 'number' ? 0 : undefined} step={name === 'physicalOnHand' ? 1 : type === 'number' ? '0.01' : undefined} /></label>)}
          <label className="wba-input-group wba-form-wide"><span className="wba-input-label">Movement rate</span><select className="wba-input-field" name="fsn" value={form.fsn} onChange={update}>{['Fast', 'Normal', 'Slow', 'Non-moving'].map(value => <option key={value}>{value}</option>)}</select></label>
          <label className="wba-expiry-toggle wba-form-wide"><input name="hasShelfLife" type="checkbox" checked={form.hasShelfLife} onChange={update} /> Track batches and expiry</label>
          {form.hasShelfLife && Number(form.physicalOnHand) > 0 && <label className="wba-input-group wba-form-wide"><span className="wba-input-label">Expiry date</span><input className="wba-input-field" name="expiresAt" type="date" required value={form.expiresAt} onChange={update} /></label>}
        </div>
        {error && <p role="alert" className="wba-modal-error">{error}</p>}
        <div className="wba-accounts-form-actions"><button type="button" className="wba-pill-btn" disabled={saving} onClick={onClose}>Cancel</button><button className="wba-btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add to catalog'}</button></div>
      </form>
  </dialog>;
}
