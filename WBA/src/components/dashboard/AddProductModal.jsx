import { useState } from 'react';

export default function AddProductModal({ isOpen, onClose, onAddProduct }) {
  const [form, setForm] = useState({ name: '', sku: '', category: 'A', fsn: 'Normal', unitPrice: '', physicalOnHand: '0', warehouseBin: '', hasShelfLife: false, shelfLifeMonths: '', expiresAt: '', storageCostPerMonth: '0', isSeasonal: false });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  if (!isOpen) return null;
  const update = event => setForm({ ...form, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value });
  const submit = async event => {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError('');
    try {
      await onAddProduct({ ...form, unitPrice: Number(form.unitPrice), physicalOnHand: Number(form.physicalOnHand), storageCostPerMonth: Number(form.storageCostPerMonth), shelfLifeMonths: form.hasShelfLife ? Number(form.shelfLifeMonths) : null, expiresAt: form.hasShelfLife && Number(form.physicalOnHand) > 0 ? form.expiresAt : null });
      setForm({ name: '', sku: '', category: 'A', fsn: 'Normal', unitPrice: '', physicalOnHand: '0', warehouseBin: '', hasShelfLife: false, shelfLifeMonths: '', expiresAt: '', storageCostPerMonth: '0', isSeasonal: false });
      onClose();
    } catch (reason) { setError(reason.message); } finally { setSaving(false); }
  };
  return <div className="wba-dash-modal-overlay" onClick={() => { if (!saving) onClose(); }}>
    <section className="wba-dash-modal-card" role="dialog" aria-modal="true" aria-labelledby="add-product-title" onClick={event => event.stopPropagation()}>
      <button type="button" className="wba-modal-close-btn" disabled={saving} onClick={onClose} aria-label="Close product form">×</button>
      <h2 id="add-product-title">Add inventory item</h2><p>Enter the product details and initial stock.</p>
      <form onSubmit={submit}>
        <div className="wba-form-grid">
          {[['name', 'Product name', 'text'], ['sku', 'SKU', 'text'], ['warehouseBin', 'Bin location', 'text'], ['unitPrice', 'Unit price (₱)', 'number'], ['physicalOnHand', 'Initial stock', 'number'], ['storageCostPerMonth', 'Storage cost per unit / month (₱)', 'number']].map(([name, label, type]) =>
            <label className="wba-input-group" key={name}><span className="wba-input-label">{label}</span><input className="wba-input-field" name={name} type={type} required value={form[name]} onChange={update} min={type === 'number' ? 0 : undefined} step={name === 'physicalOnHand' ? 1 : type === 'number' ? '0.01' : undefined} /></label>)}
          <label className="wba-input-group"><span className="wba-input-label">Classification</span><select className="wba-input-field" name="category" value={form.category} onChange={update}><option value="A">A — High value</option><option value="B">B — Mid value</option><option value="C">C — Consumable</option></select></label>
          <label className="wba-input-group"><span className="wba-input-label">Stock movement</span><select className="wba-input-field" name="fsn" value={form.fsn} onChange={update}>{['Fast', 'Normal', 'Slow', 'Non-moving'].map(value => <option key={value}>{value}</option>)}</select></label>
          <label><input name="hasShelfLife" type="checkbox" checked={form.hasShelfLife} onChange={update} /> Track batches and expiry</label>
          {form.hasShelfLife && <>
            <label className="wba-input-group"><span className="wba-input-label">Shelf life (months)</span><input className="wba-input-field" name="shelfLifeMonths" type="number" min="1" max="120" required value={form.shelfLifeMonths} onChange={update} /></label>
            {Number(form.physicalOnHand) > 0 && <label className="wba-input-group"><span className="wba-input-label">Initial batch expiry date</span><input className="wba-input-field" name="expiresAt" type="date" required value={form.expiresAt} onChange={update} /></label>}
          </>}
        </div>
        {error && <p role="alert" className="wba-modal-error">{error}</p>}
        <div className="wba-accounts-form-actions"><button type="button" className="wba-pill-btn" disabled={saving} onClick={onClose}>Cancel</button><button className="wba-btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add to catalog'}</button></div>
      </form>
    </section>
  </div>;
}
