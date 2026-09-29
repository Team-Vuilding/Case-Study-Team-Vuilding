import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { INITIAL_INVENTORY_ITEMS } from '../../data/mockInventoryData';
import { hasPermission, PERMISSIONS } from '../../data/rbac';

const RealTimeInventoryLedger = forwardRef(function RealTimeInventoryLedger({ currentUser, onTriggerAudit }, ref) {
  const [items, setItems] = useState(INITIAL_INVENTORY_ITEMS);
  const [reconcilingId, setReconcilingId] = useState(null);

  const accessLevel = currentUser?.accessLevel || 'admin';
  const canFixCount = hasPermission(accessLevel, PERMISSIONS.FIX_COUNT);

  const receiveQrScan = useCallback((scan) => {
    if (accessLevel !== 'warehouse') return;
    if (!Number.isSafeInteger(scan?.quantity) || scan.quantity < 1 || typeof scan.code !== 'string') return;
    const scanCode = scan.code.toLowerCase();
    const matchingItem = items.find((item) => item.sku.toLowerCase() === scanCode);
    if (!matchingItem) {
      if (onTriggerAudit) {
        onTriggerAudit({
          id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toLocaleTimeString(),
          eventType: 'QR_SCAN_NOT_FOUND',
          severity: 'warning',
          actor: `${currentUser?.name || 'Warehouse Staff'} (${currentUser?.role || 'Warehouse Staff'})`,
          sku: scan.code,
          description: `QR scan could not be added because SKU ${scan.code} is not in the inventory ledger.`,
          actionTaken: 'No stock count was changed.',
        });
      }
      return;
    }
    setItems((previousItems) => previousItems.map((item) => item.id === matchingItem.id ? {
      ...item,
      physicalOnHand: item.physicalOnHand + scan.quantity,
      paperSpreadsheetCount: item.paperSpreadsheetCount + scan.quantity,
      status: 'Synced',
      statusSeverity: 'good',
    } : item));
    if (onTriggerAudit) {
      onTriggerAudit({
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString(),
        eventType: 'QR_STOCK_RECEIVED',
        severity: 'good',
        actor: `${currentUser?.name || 'Warehouse Staff'} (${currentUser?.role || 'Warehouse Staff'})`,
        sku: matchingItem.sku,
        description: `${scan.quantity} unit${scan.quantity === 1 ? '' : 's'} added to ${matchingItem.name} from a QR scan.${scan.originalLabel && scan.originalLabel.toLowerCase() !== matchingItem.sku.toLowerCase() ? ` Confirmed label: ${scan.originalLabel}.` : ''}`,
        actionTaken: 'On-hand and ledger counts were updated.',
      });
    }
  }, [accessLevel, currentUser?.name, currentUser?.role, items, onTriggerAudit]);

  useImperativeHandle(ref, () => ({ receiveQrScan }), [receiveQrScan]);

  const handleReconcile = (id) => {
    // Action guard: abort if unauthorized role tries to reconcile
    if (!canFixCount) {
      console.warn(`[RBAC] Reconciliation action blocked for accessLevel: ${accessLevel}`);
      return;
    }

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
          actor: `${currentUser?.name || 'Staff'} (${currentUser?.role || 'User'})`,
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
                    <td style={{ fontWeight: 700, color: '#34d399' }}>
                      ₱{item.unitPrice.toLocaleString()}
                    </td>
                  )}
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
                    {hasDiscrepancy && canFixCount ? (
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
                    ) : hasDiscrepancy && !canFixCount ? (
                      <span style={{ fontSize: '0.74rem', color: '#f87171', fontStyle: 'italic' }}>
                        Audit Req.
                      </span>
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
});

export default RealTimeInventoryLedger;

