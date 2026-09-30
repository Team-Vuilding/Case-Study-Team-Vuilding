import React, { useRef, useState } from 'react';
import RealTimeInventoryLedger from './RealTimeInventoryLedger';
import FifoExpiryQueue from './FifoExpiryQueue';
import AddProductModal from './AddProductModal';
import QrInventoryScanner from './QrInventoryScanner';
import ProductQrGenerator from './ProductQrGenerator';
import { hasPermission, PERMISSIONS } from '../../data/rbac';

export default function InventorySection({ currentUser, onTriggerAudit }) {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isQrGeneratorOpen, setIsQrGeneratorOpen] = useState(false);
  const inventoryLedgerRef = useRef(null);
  const accessLevel = currentUser?.accessLevel || 'admin';
  const canAddProduct = hasPermission(accessLevel, PERMISSIONS.ADD_PRODUCT);
  const canViewFifo = hasPermission(accessLevel, PERMISSIONS.VIEW_FIFO_QUEUE);
  const isWarehouseStaff = accessLevel === 'warehouse';
  const canGenerateQr = isWarehouseStaff || accessLevel === 'admin';

  const handleQrScan = (scan) => {
    if (!isWarehouseStaff) return;
    inventoryLedgerRef.current?.receiveQrScan(scan);
  };

  const handleAddProduct = (newProduct) => {
    // Action guard: abort if unauthorized role tries to trigger
    if (!canAddProduct) {
      console.warn(`[RBAC] Add product blocked for accessLevel: ${accessLevel}`);
      return;
    }

    if (onTriggerAudit) {
      onTriggerAudit({
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString(),
        eventType: 'PRODUCT_CATALOG_ADDED',
        severity: 'good',
        actor: `${currentUser?.name || 'Admin'} (${currentUser?.role || 'Admin'})`,
        sku: newProduct.sku,
        description: `New SKU ${newProduct.name} added to warehouse catalog at ${newProduct.warehouseBin}.`,
        actionTaken: 'Real-time ledger and ATP engine synced.',
      });
    }
    setIsAddProductOpen(false);
  };

  return (
    <div className="wba-grid-container">
      {/* Section Header */}
      <div className="wba-section-page-header">
        <div>
          <h2 className="wba-section-page-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            Inventory
          </h2>
          <p className="wba-section-page-desc">
            {accessLevel === 'sales'
              ? 'Real-time product availability, pricing, and Available-to-Promise (ATP) inventory levels.'
              : 'View and manage product stock — track quantities, resolve mismatches, and monitor expiring batches.'}
          </p>
        </div>
        {canAddProduct && (
          <button
            type="button"
            className="wba-btn-primary"
            onClick={() => setIsAddProductOpen(true)}
          >
            + Add Product
          </button>
        )}
      </div>

      {canGenerateQr && (
        <section className="wba-qr-tools" aria-label="Product QR tools">
          <div className="wba-qr-tools-copy">
            <span className="wba-qr-tools-icon" aria-hidden="true">▦</span>
            <div>
              <h3>Product QR tools</h3>
              <p>{isWarehouseStaff ? 'Create SKU labels or scan one to receive stock.' : 'Create a scannable SKU code for any catalog product.'}</p>
            </div>
          </div>
          <div className="wba-qr-tools-actions">
            {isWarehouseStaff && (
              <button type="button" className="wba-btn-primary" onClick={() => setIsQrScannerOpen(true)}>
                Scan to receive
              </button>
            )}
            <button type="button" className={isWarehouseStaff ? 'wba-qr-secondary-btn' : 'wba-btn-primary'} onClick={() => setIsQrGeneratorOpen(true)}>
              Generate QR
            </button>
          </div>
        </section>
      )}

      {/* Real-Time Multi-State Ledger (Full Width) */}
      <section style={{ width: '100%' }}>
        <RealTimeInventoryLedger ref={inventoryLedgerRef} currentUser={currentUser} onTriggerAudit={onTriggerAudit} />
      </section>

      {/* FIFO / FEFO Expiry Queue (Warehouse & Admin) OR Sales ATP Reservation Summary */}
      <section style={{ width: '100%' }}>
        {canViewFifo ? (
          <FifoExpiryQueue />
        ) : (
          <div className="wba-glow-card">
            <div className="wba-card-title-bar">
              <div className="wba-card-title-group">
                <div className="wba-card-heading">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Sales Order & ATP Reservation Monitor</span>
                </div>
                <span className="wba-card-desc">
                  Active customer checkout locks and Available-to-Promise stock status across online channels
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
              <div style={{ flex: '1', minWidth: '180px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--wba-inline-info)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Active Reservations</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--wba-inline-strong)' }}>62 Units</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--wba-inline-muted)', marginTop: '4px' }}>Customer cart holds protected for checkout</div>
              </div>
              <div style={{ flex: '1', minWidth: '180px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--wba-inline-good)', textTransform: 'uppercase', marginBottom: '4px' }}>Oversell Incidents Blocked</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--wba-inline-strong)' }}>14 Prevented</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--wba-inline-muted)', marginTop: '4px' }}>Zero unfulfillable online orders recorded</div>
              </div>
              <div style={{ flex: '1', minWidth: '180px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--wba-inline-critical)', textTransform: 'uppercase', marginBottom: '4px' }}>Stockout ATP Lock</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--wba-inline-strong)' }}>1 Product Locked</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--wba-inline-muted)', marginTop: '4px' }}>Smart Thermostat ATP locked at 0</div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Add Product Modal (Only rendered when permitted) */}
      {canAddProduct && (
        <AddProductModal
          isOpen={isAddProductOpen}
          onClose={() => setIsAddProductOpen(false)}
          onAddProduct={handleAddProduct}
        />
      )}
      {isWarehouseStaff && (
        <QrInventoryScanner isOpen={isQrScannerOpen} onClose={() => setIsQrScannerOpen(false)} onScan={handleQrScan} />
      )}
      {canGenerateQr && (
        <ProductQrGenerator isOpen={isQrGeneratorOpen} onClose={() => setIsQrGeneratorOpen(false)} />
      )}
    </div>
  );
}

