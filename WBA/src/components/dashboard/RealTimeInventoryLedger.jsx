import React, { useState } from 'react';
import { INITIAL_INVENTORY_ITEMS } from '../../data/mockInventoryData';

export default function RealTimeInventoryLedger({ onTriggerAudit }) {
  const [items, setItems] = useState(INITIAL_INVENTORY_ITEMS);
  const [reconcilingId, setReconcilingId] = useState(null);

  const handleReconcile = (id) => {
    setReconcilingId(id);
    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              paperSpreadsheetCount: item.physicalOnHand,
              status: 'Reconciled & Locked',
              statusSeverity: 'good',
            };
          }
          return item;
        })
      );
      setReconcilingId(null);
      if (onTriggerAudit) {
        onTriggerAudit({
          id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toLocaleTimeString(),
          eventType: 'LEDGER_RECONCILED',
          severity: 'good',
          actor: 'Admin Console (Instant Sync)',
          sku: id,
          description: `Discrepancy reconciled for ${id}. Available-to-Promise locked to real-time physical count.`,
          actionTaken: 'Legacy paper discrepancy cleared.',
        });
      }
    }, 800);
  };

  return (
    <div className="wba-glow-card">
      <div className="wba-card-title-bar">
        <div className="wba-card-title-group">
          <div className="wba-card-heading">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>Real-Time Multi-State Inventory Ledger</span>
          </div>
          <span className="wba-card-desc">
            Continuous reconciliation across Physical On-Hand, Reserved, and Allocated states to prevent overselling
          </span>
        </div>

        <div className="wba-formula-capsule" style={{ fontSize: '0.76rem' }}>
          ATP = Physical − (Reserved + Allocated)
        </div>
      </div>

      <div className="wba-table-container">
        <table className="wba-table">
          <thead>
            <tr>
              <th>SKU / Product</th>
              <th>Cat</th>
              <th>Physical On-Hand</th>
              <th>Reserved (Online)</th>
              <th>Allocated (Picking)</th>
              <th>Available (ATP)</th>
              <th>Legacy Paper Variance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              // Calculate real-time Available to Promise (ATP)
              const atp = Math.max(0, item.physicalOnHand - item.reserved - item.allocated);
              const variance = item.physicalOnHand - item.paperSpreadsheetCount;
              const hasDiscrepancy = variance !== 0;

              return (
                <tr key={item.id}>
                  <td>
                    <span className="wba-sku-name">{item.name}</span>
                    <span className="wba-sku-code">{item.sku} • {item.warehouseBin}</span>
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
                      Cat {item.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#ffffff' }}>
                    {item.physicalOnHand}
                  </td>
                  <td style={{ color: '#fbbf24' }}>
                    {item.reserved}
                  </td>
                  <td style={{ color: '#38bdf8' }}>
                    {item.allocated}
                  </td>
                  <td>
                    <span className={`wba-atp-pill ${atp === 0 ? 'wba-atp-zero' : 'wba-atp-positive'}`}>
                      {atp} Units
                    </span>
                  </td>
                  <td>
                    {hasDiscrepancy ? (
                      <span style={{ color: '#f87171', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>⚠️ {variance}</span>
                        <span style={{ fontSize: '0.7rem', color: '#fca5a5' }}>(Paper: {item.paperSpreadsheetCount})</span>
                      </span>
                    ) : (
                      <span style={{ color: '#34d399', fontWeight: 600 }}>0 (Synced)</span>
                    )}
                  </td>
                  <td>
                    {hasDiscrepancy ? (
                      <button
                        type="button"
                        className="wba-pill-btn"
                        style={{
                          background: 'rgba(239, 68, 68, 0.25)',
                          border: '1px solid rgba(239, 68, 68, 0.5)',
                          color: '#fca5a5',
                          fontSize: '0.72rem',
                          padding: '4px 8px',
                        }}
                        onClick={() => handleReconcile(item.id)}
                        disabled={reconcilingId === item.id}
                      >
                        {reconcilingId === item.id ? 'Syncing...' : 'Reconcile'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: '#a78bfa' }}>Verified</span>
                    )}
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
