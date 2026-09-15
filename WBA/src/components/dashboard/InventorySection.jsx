import React, { useState } from 'react';
import RealTimeInventoryLedger from './RealTimeInventoryLedger';
import FifoExpiryQueue from './FifoExpiryQueue';
import AddProductModal from './AddProductModal';

export default function InventorySection({ onTriggerAudit }) {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const handleAddProduct = (newProduct) => {
    if (onTriggerAudit) {
      onTriggerAudit({
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString(),
        eventType: 'PRODUCT_CATALOG_ADDED',
        severity: 'good',
        actor: 'Admin Console',
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
            View and manage all product stock — track quantities, resolve mismatches, and monitor expiring batches.
          </p>
        </div>
        <button
          type="button"
          className="wba-btn-primary"
          onClick={() => setIsAddProductOpen(true)}
        >
          + Add Product
        </button>
      </div>

      {/* Real-Time Multi-State Ledger (Full Width) */}
      <section style={{ width: '100%' }}>
        <RealTimeInventoryLedger onTriggerAudit={onTriggerAudit} />
      </section>

      {/* FIFO / FEFO Expiry Queue */}
      <section style={{ width: '100%' }}>
        <FifoExpiryQueue />
      </section>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
}
