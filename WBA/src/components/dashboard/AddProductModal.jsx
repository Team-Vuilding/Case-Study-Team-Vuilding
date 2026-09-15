import React, { useState } from 'react';

export default function AddProductModal({ isOpen, onClose, onAddProduct }) {
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

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
            Add Inventory Item
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#c4b5fd', marginTop: '4px' }}>
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
                <label htmlFor="hasShelfLife" style={{ fontSize: '0.82rem', color: '#c4b5fd', cursor: 'pointer' }}>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              className="wba-pill-btn"
              style={{ border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c4b5fd' }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="wba-btn-primary">
              Add to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
