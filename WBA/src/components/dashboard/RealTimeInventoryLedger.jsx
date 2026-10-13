import React, { useState } from 'react';
import { apiRequest, refreshData } from '../../services/api';
import { hasPermission, PERMISSIONS } from '../../data/rbac';

export default function RealTimeInventoryLedger({ items, currentUser, onArchive }) {
  const [reconcilingId, setReconcilingId] = useState(null);
  const [error, setError] = useState('');
  const accessLevel = currentUser.accessLevel;
  const canFixCount = hasPermission(accessLevel, PERMISSIONS.FIX_COUNT);
  const canManageProducts = hasPermission(accessLevel, PERMISSIONS.MANAGE_PRODUCTS);
  const handleReconcile = async id => {
    const item = items.find(row => row.id === id);
    setReconcilingId(id); setError('');
    try { await apiRequest('warehouse/items/' + id + '/reconcile', { method: 'POST', body: { quantity: item.physicalOnHand, reason: 'Physical count verified by ' + currentUser.name } }); refreshData(); }
    catch (reason) { setError(reason.message); }
    finally { setReconcilingId(null); }
  };
  return (
    <div className="wba-glow-card">
      {error && <p role="alert">{error}</p>}
      <div className="wba-card-title-bar">
        <div className="wba-card-title-group">
          <div className="wba-card-heading">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>{accessLevel === 'sales' ? 'Product Availability & Pricing Ledger' : 'Inventory Stock Ledger'}</span>
          </div>
          <span className="wba-card-desc">
            {accessLevel === 'sales'
              ? 'Real-time sellable inventory (Available-to-Promise), customer reservations, and unit pricing'
              : 'Live stock counts across all products — highlights mismatches between physical and system records'}
          </span>
        </div>
      </div>

      <div className="wba-table-container">
        <table className="wba-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              {accessLevel === 'sales' && <th>Unit Price</th>}
              <th>In Stock</th>
              <th>Reserved</th>
              <th>Being Picked</th>
              <th>Available to Sell</th>
              <th>Count Mismatch</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={9}>No products yet. An administrator can add the first product.</td></tr>}
            {items.map((item) => {
              const available = Math.max(0, item.physicalOnHand - item.reserved - item.allocated);
              const variance = item.physicalOnHand - item.paperSpreadsheetCount;
              const hasDiscrepancy = variance !== 0;

              return (
                <tr key={item.id}>
                  <td>
                    <span className="wba-sku-name">{item.name}</span>
                    <span className="wba-sku-code">
                      {item.sku} {accessLevel !== 'sales' && `· ${item.warehouseBin}`}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`wba-category-tag ${
                        item.category === 'A'
                          ? 'wba-cat-a'
                          : item.category === 'B'
                          ? 'wba-cat-b'
                          : 'wba-cat-c'
                      }`}
                    >
                      {item.category === 'A' ? 'High Value' : item.category === 'B' ? 'Mid Value' : 'Perishable'}
                    </span>
                  </td>
                  {accessLevel === 'sales' && (
                    <td style={{ fontWeight: 700, color: 'var(--wba-inline-good)' }}>
                      ₱{item.unitPrice.toLocaleString()}
                    </td>
                  )}
                  <td style={{ fontWeight: 700, color: 'var(--wba-inline-strong)' }}>{item.physicalOnHand}</td>
                  <td style={{ color: 'var(--wba-inline-warning)' }}>{item.reserved}</td>
                  <td style={{ color: 'var(--wba-inline-info)' }}>{item.allocated}</td>
                  <td>
                    <span className={`wba-atp-pill ${available === 0 ? 'wba-atp-zero' : 'wba-atp-positive'}`}>
                      {available} units
                    </span>
                  </td>
                  <td>
                    {hasDiscrepancy ? (
                      <span style={{ color: 'var(--wba-inline-critical)', fontWeight: 700 }}>
                        ⚠️ {Math.abs(variance)} {variance < 0 ? 'missing' : 'extra'}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--wba-inline-good)', fontWeight: 600 }}>✓ Accurate</span>
                    )}
                  </td>
                  <td>
                    <div className="wba-product-row-actions">
                    {hasDiscrepancy && canFixCount ? (
                      <button
                        type="button"
                        className="wba-pill-btn"
                        style={{
                          background: 'rgba(239, 68, 68, 0.25)',
                          border: '1px solid rgba(239, 68, 68, 0.5)',
                          color: 'var(--wba-inline-critical)',
                          fontSize: '0.72rem',
                          padding: '4px 8px',
                        }}
                        onClick={() => handleReconcile(item.id)}
                        disabled={reconcilingId === item.id}
                      >
                        {reconcilingId === item.id ? 'Fixing...' : 'Fix Count'}
                      </button>
                    ) : hasDiscrepancy && !canFixCount ? (
                      <span style={{ fontSize: '0.74rem', color: 'var(--wba-inline-critical)', fontStyle: 'italic' }}>
                        Audit Req.
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: 'var(--wba-inline-accent)' }}>✓ OK</span>
                    )}
                    {canManageProducts && <button type="button" className="wba-pill-btn" disabled={reconcilingId !== null} aria-haspopup="dialog" aria-label={'Archive ' + item.name} aria-describedby={item.archiveBlockReason ? 'archive-blocked-' + item.id : undefined} onClick={() => onArchive(item)}>Archive</button>}
                    </div>
                    {canManageProducts && item.archiveBlockReason && <span className="wba-product-action-hint" id={'archive-blocked-' + item.id}>{item.archiveBlockReason}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

