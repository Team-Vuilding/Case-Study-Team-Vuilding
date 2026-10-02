import React, { useState } from 'react';

export default function AddProductModal({ isOpen, onClose, onAddProduct }) {
  const [review, setReview] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'A',
    fsn: 'Normal',
    unitPrice: '',
    physicalOnHand: '',
    warehouseBin: '',
    isSeasonal: false,
    hasShelfLife: false,
    shelfLifeMonths: '',
  });

  const signature = JSON.stringify(formData);
  const currentReview = review?.signature === signature ? review : null;
  const flags = currentReview?.scores && Object.entries(currentReview.scores).filter(([, score]) => score >= 0.65);

  const handleReview = async () => {
    setReviewing(true);
    setAcknowledged(false);
    try {
      const response = await fetch('/api/typesafe/catalog-review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Review unavailable');
      setReview({ signature, scores: data.scores });
    } catch (error) {
      setReview({ signature, error: error.message });
    } finally {
      setReviewing(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentReview || ((currentReview.error || flags?.length) && !acknowledged)) return;
    if (onAddProduct) {
      onAddProduct({
        ...formData,
        id: `SKU-${Math.floor(100 + Math.random() * 900)}`,
        unitPrice: Number(formData.unitPrice) || 0,
        physicalOnHand: Number(formData.physicalOnHand) || 0,
        reserved: 0,
        allocated: 0,
        paperSpreadsheetCount: Number(formData.physicalOnHand) || 0,
        shelfLifeMonths: formData.hasShelfLife ? Number(formData.shelfLifeMonths) || 9 : null,
        status: 'Optimal Inventory',
        statusSeverity: 'good',
      });
    }
    onClose();
  };

  return (
    <div className="wba-dash-modal-overlay" onClick={onClose}>
      <div className="wba-dash-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="wba-modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--wba-inline-strong)' }}>
            Add Inventory Item
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--wba-inline-accent)', marginTop: '4px' }}>
            Configure item classification, warehouse bin location, and shelf-life tracking parameters.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="wba-form-grid">
            <div className="wba-input-group full-width">
              <label className="wba-input-label">Product Name</label>
              <input
                className="wba-input-field"
                type="text"
                required
                placeholder="e.g. Smart Climate Controller Pro"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="wba-input-group">
              <label className="wba-input-label">SKU Code</label>
              <input
                className="wba-input-field"
                type="text"
                required
                placeholder="WBA-SKU-..."
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>

            <div className="wba-input-group">
              <label className="wba-input-label">Bin Location</label>
              <input
                className="wba-input-field"
                type="text"
                required
                placeholder="e.g. BAY-03 (Zone 1)"
                value={formData.warehouseBin}
                onChange={(e) => setFormData({ ...formData, warehouseBin: e.target.value })}
              />
            </div>

            <div className="wba-input-group">
              <label className="wba-input-label">ABC Classification</label>
              <select
                className="wba-input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="A">Category A (High Value / Critical Control)</option>
                <option value="B">Category B (Moderate Velocity & Value)</option>
                <option value="C">Category C (Fast Moving / Consumable)</option>
              </select>
            </div>

            <div className="wba-input-group">
              <label className="wba-input-label">Initial Scanned On-Hand</label>
              <input
                className="wba-input-field"
                type="number"
                required
                min="0"
                placeholder="0"
                value={formData.physicalOnHand}
                onChange={(e) => setFormData({ ...formData, physicalOnHand: e.target.value })}
              />
            </div>

            <div className="wba-input-group">
              <label className="wba-input-label">Unit Price (₱)</label>
              <input
                className="wba-input-field"
                type="number"
                required
                min="0"
                placeholder="0.00"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              />
            </div>

            <div className="wba-input-group">
              <label className="wba-input-label">Perishable / Shelf Life?</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '42px' }}>
                <input
                  type="checkbox"
                  id="hasShelfLife"
                  checked={formData.hasShelfLife}
                  onChange={(e) => setFormData({ ...formData, hasShelfLife: e.target.checked })}
                />
                <label htmlFor="hasShelfLife" style={{ fontSize: '0.82rem', color: 'var(--wba-inline-accent)', cursor: 'pointer' }}>
                  Enable FIFO / FEFO Tracking
                </label>
              </div>
            </div>

            {formData.hasShelfLife && (
              <div className="wba-input-group full-width">
                <label className="wba-input-label">Shelf Life Limit (Months)</label>
                <input
                  className="wba-input-field"
                  type="number"
                  placeholder="e.g. 9 months"
                  value={formData.shelfLifeMonths}
                  onChange={(e) => setFormData({ ...formData, shelfLifeMonths: e.target.value })}
                />
              </div>
            )}
          </div>

          <div style={{ marginTop: '18px', padding: '14px', border: '1px solid rgba(168, 85, 247, 0.35)', borderRadius: '10px', color: 'var(--wba-inline-accent)', fontSize: '0.82rem' }}>
            <strong style={{ color: 'var(--wba-inline-strong)' }}>Jev catalog guardrail</strong>
            <p style={{ margin: '6px 0 10px' }}>Review product identity, shelf-life tracking, and bin location before adding. This is advice; verify flagged details yourself.</p>
            <button type="button" className="wba-pill-btn" onClick={handleReview} disabled={reviewing || !formData.name.trim() || !formData.sku.trim() || !formData.warehouseBin.trim()}>
              {reviewing ? 'Reviewing…' : currentReview ? 'Review again' : 'Review with Jev'}
            </button>
            {currentReview?.scores && (
              <p role="status" style={{ marginTop: '10px', color: flags.length ? 'var(--wba-inline-warning)' : 'var(--wba-inline-good)' }}>
                {flags.length ? `Check: ${flags.map(([key]) => ({ shelf_life_mismatch: 'shelf-life tracking', vague_identity: 'product name', location_mismatch: 'bin location' })[key]).join(', ')}.` : 'No semantic concerns flagged. Please confirm the item details.'}
              </p>
            )}
            {currentReview?.error && <p role="status" style={{ marginTop: '10px', color: 'var(--wba-inline-warning)' }}>{currentReview.error}</p>}
            {currentReview && (currentReview.error || flags?.length > 0) && (
              <label style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
                <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
                I checked these details and want to continue.
              </label>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              className="wba-pill-btn"
              style={{ border: '1px solid rgba(168, 85, 247, 0.3)', color: 'var(--wba-inline-accent)' }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="wba-btn-primary" disabled={reviewing || !currentReview || ((currentReview.error || flags?.length > 0) && !acknowledged)}>
              Add to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
