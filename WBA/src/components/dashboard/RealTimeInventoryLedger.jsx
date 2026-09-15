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
              status: 'Synced',
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
          eventType: 'Stock Count Corrected',
          severity: 'good',
          actor: 'Admin',
          sku: id,
          description: `Stock count discrepancy resolved for ${id}. System count updated to match physical count.`,
          actionTaken: 'Records corrected and synced.',
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
            <span>Inventory Stock Ledger</span>
          </div>
          <span className="wba-card-desc">
            Live stock counts across all products — highlights mismatches between physical and system records
          </span>
        </div>
      </div>

      <div className="wba-table-container">
        <table className="wba-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>In Stock</th>
              <th>Reserved</th>
              <th>Being Picked</th>
              <th>Available to Sell</th>
              <th>Count Mismatch</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const available = Math.max(0, item.physicalOnHand - item.reserved - item.allocated);
              const variance = item.physicalOnHand - item.paperSpreadsheetCount;
              const hasDiscrepancy = variance !== 0;

              return (
                <tr key={item.id}>
                  <td>
                    <span className="wba-sku-name">{item.name}</span>
                    <span className="wba-sku-code">{item.sku} · {item.warehouseBin}</span>
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
                  <td style={{ fontWeight: 700, color: '#ffffff' }}>{item.physicalOnHand}</td>
                  <td style={{ color: '#fbbf24' }}>{item.reserved}</td>
                  <td style={{ color: '#38bdf8' }}>{item.allocated}</td>
                  <td>
                    <span className={`wba-atp-pill ${available === 0 ? 'wba-atp-zero' : 'wba-atp-positive'}`}>
                      {available} units
                    </span>
                  </td>
                  <td>
                    {hasDiscrepancy ? (
                      <span style={{ color: '#f87171', fontWeight: 700 }}>
                        ⚠️ {Math.abs(variance)} {variance < 0 ? 'missing' : 'extra'}
                      </span>
                    ) : (
                      <span style={{ color: '#34d399', fontWeight: 600 }}>✓ Accurate</span>
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
                        {reconcilingId === item.id ? 'Fixing...' : 'Fix Count'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: '#a78bfa' }}>✓ OK</span>
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
