import React, { useState } from 'react';
import { apiRequest, refreshData } from '../../services/api';
import { hasPermission, PERMISSIONS } from '../../data/rbac';
import './inventory-ledger.css';

export default function RealTimeInventoryLedger({ items, currentUser, onArchive, onReports }) {
  const [reconcilingId, setReconcilingId] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [countFilter, setCountFilter] = useState('all');
  const accessLevel = currentUser.accessLevel;
  const canFixCount = hasPermission(accessLevel, PERMISSIONS.FIX_COUNT);
  const canManageProducts = hasPermission(accessLevel, PERMISSIONS.MANAGE_PRODUCTS);
  const canAddReport = hasPermission(accessLevel, PERMISSIONS.ADD_PRODUCT_REPORT);
  const canViewReports = hasPermission(accessLevel, PERMISSIONS.VIEW_PRODUCT_REPORTS);
  const hasActions = canFixCount || canManageProducts || canViewReports;
  const visibleItems = items.filter(item => {
    const matchesSearch = [item.name, item.sku, item.warehouseBin].join(' ').toLowerCase().includes(search.trim().toLowerCase());
    return matchesSearch && (countFilter === 'all' || item.physicalOnHand !== item.paperSpreadsheetCount);
  });
  const handleReconcile = async id => {
    const item = items.find(row => row.id === id);
    setReconcilingId(id); setError('');
    try { await apiRequest('warehouse/items/' + id + '/reconcile', { method: 'POST', body: { quantity: item.physicalOnHand, reason: 'Physical count verified by ' + currentUser.name } }); refreshData(); }
    catch (reason) { setError(reason.message); }
    finally { setReconcilingId(null); }
  };
  return (
    <div className="wba-glow-card wba-inventory-ledger">
      {error && <p role="alert">{error}</p>}
      <div className="wba-card-title-bar wba-ledger-toolbar">
        <div className="wba-card-title-group">
          <div className="wba-card-heading">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>{accessLevel === 'sales' ? 'Product Availability & Pricing Ledger' : 'Inventory Stock Ledger'}</span>
          </div>
        </div>
        <div className="wba-ledger-controls">
          <input type="search" className="wba-input-field" aria-label="Search inventory" placeholder="Search product, SKU, or bin" value={search} onChange={event => setSearch(event.target.value)} />
          <select className="wba-input-field" aria-label="Filter by count status" value={countFilter} onChange={event => setCountFilter(event.target.value)}>
            <option value="all">All count statuses</option><option value="mismatch">Count mismatches</option>
          </select>
        </div>
      </div>

      <p className="wba-ledger-result-count" role="status">Showing {visibleItems.length} of {items.length} products</p>
      <div className="wba-table-container" tabIndex={0} role="region" aria-label="Inventory stock ledger">
        <table className="wba-table">
          <caption className="wba-ledger-caption">Product stock balances</caption>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              {accessLevel === 'sales' && <th>Unit Price</th>}
              <th className="wba-ledger-number">In stock</th>
              <th className="wba-ledger-number">Reserved</th>
              <th className="wba-ledger-number">Being picked</th>
              <th className="wba-ledger-number">Available to sell</th>
              <th>Count status</th>
              {hasActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {visibleItems.length === 0 && <tr><td colSpan={7 + (accessLevel === 'sales' ? 1 : 0) + (hasActions ? 1 : 0)} className="wba-ledger-empty">
              {items.length === 0 ? 'No products yet.' : <>
                No products match these filters. <button type="button" className="wba-pill-btn" onClick={() => { setSearch(''); setCountFilter('all'); }}>Clear filters</button>
              </>}
            </td></tr>}
            {visibleItems.map((item) => {
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
                          : item.category === 'C' ? 'wba-cat-c' : ''
                      }`}
                    >
                      {item.category === 'A' ? 'High Value' : item.category === 'B' ? 'Mid Value' : item.category === 'C' ? 'Perishable' : 'Unclassified'}
                    </span>
                  </td>
                  {accessLevel === 'sales' && (
                    <td style={{ fontWeight: 700, color: 'var(--wba-inline-good)' }}>
                      ₱{item.unitPrice.toLocaleString()}
                    </td>
                  )}
                  <td className="wba-ledger-number" style={{ fontWeight: 700, color: 'var(--wba-inline-strong)' }}>{item.physicalOnHand}</td>
                  <td className="wba-ledger-number" style={{ color: 'var(--wba-inline-warning)' }}>{item.reserved}</td>
                  <td className="wba-ledger-number" style={{ color: 'var(--wba-inline-info)' }}>{item.allocated}</td>
                  <td className="wba-ledger-number">
                    <span className={`wba-atp-pill ${available === 0 ? 'wba-atp-zero' : 'wba-atp-positive'}`}>
                      {available} units
                    </span>
                  </td>
                  <td>
                    {hasDiscrepancy ? (
                      <span className="wba-ledger-count-status mismatch">
                        ⚠️ {Math.abs(variance)} {variance < 0 ? 'missing' : 'extra'}
                      </span>
                    ) : (
                      <span className="wba-ledger-count-status accurate">✓ Accurate</span>
                    )}
                  </td>
                  {hasActions && <td className="wba-ledger-actions-cell">
                    <div className="wba-product-row-actions">
                    {hasDiscrepancy && canFixCount && (
                      <button
                        type="button"
                        className="wba-ledger-action reconcile"
                        aria-label={'Fix count for ' + item.name}
                        onClick={() => handleReconcile(item.id)}
                        disabled={reconcilingId === item.id}
                      >
                        {reconcilingId === item.id ? 'Fixing...' : 'Fix Count'}
                      </button>
                    )}
                    {canAddReport && <button type="button" className="wba-ledger-action" aria-haspopup="dialog" aria-label={'Add report for ' + item.name} onClick={() => onReports(item)}>Add report</button>}
                    {canViewReports && <button type="button" className="wba-ledger-action" aria-haspopup="dialog" aria-label={'View reports for ' + item.name} onClick={() => onReports(item)}>Reports{item.reportCount > 0 && <span className="wba-ledger-report-count">{item.reportCount}</span>}</button>}
                    {canManageProducts && <button type="button" className="wba-ledger-action" disabled={reconcilingId !== null} aria-haspopup="dialog" aria-label={'Archive ' + item.name} onClick={() => onArchive(item)}>Archive</button>}
                    </div>
                  </td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

