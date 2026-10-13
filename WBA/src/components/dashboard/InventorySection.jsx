import React, { useEffect, useRef, useState } from 'react';
import { apiRequest, refreshData } from '../../services/api';
import useApiData from '../../services/useApiData';
import ApiStatus from '../ApiStatus';
import { SkeletonMetrics, SkeletonTable } from '../WorkspaceSkeletons';
import RealTimeInventoryLedger from './RealTimeInventoryLedger';
import FifoExpiryQueue from './FifoExpiryQueue';
import AddProductModal from './AddProductModal';
import QrInventoryScanner from './QrInventoryScanner';
import ProductQrGenerator from './ProductQrGenerator';
import ArchivedProducts from './ArchivedProducts';
import ProductLifecycleDialog from './ProductLifecycleDialog';
import ProductReportsDialog from './ProductReportsDialog';
import { hasPermission, PERMISSIONS } from '../../data/rbac';
import './product-lifecycle.css';

export default function InventorySection({ currentUser }) {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isQrGeneratorOpen, setIsQrGeneratorOpen] = useState(false);
  const [catalogView, setCatalogView] = useState('active');
  const [productAction, setProductAction] = useState(null);
  const [reportItem, setReportItem] = useState(null);
  const [notice, setNotice] = useState('');
  const headingRef = useRef(null);
  const { data, loading, error, reload } = useApiData('items');
  const items = data || [];
  const accessLevel = currentUser?.accessLevel || 'admin';
  const canAddProduct = hasPermission(accessLevel, PERMISSIONS.ADD_PRODUCT);
  const canManageProducts = hasPermission(accessLevel, PERMISSIONS.MANAGE_PRODUCTS);
  const canViewReports = hasPermission(accessLevel, PERMISSIONS.VIEW_PRODUCT_REPORTS);
  const canViewFifo = hasPermission(accessLevel, PERMISSIONS.VIEW_FIFO_QUEUE);
  const isWarehouseStaff = accessLevel === 'warehouse';
  const canGenerateQr = isWarehouseStaff || accessLevel === 'admin';

  useEffect(() => {
    if (notice && !productAction) headingRef.current?.focus();
  }, [notice, productAction]);

  const handleQrScan = async (scan) => {
    if (!isWarehouseStaff) return;
    await apiRequest('warehouse/movements', { method: 'POST', body: scan });
    refreshData();
  };

  const handleAddProduct = async (newProduct) => {
    // Action guard: abort if unauthorized role tries to trigger
    if (!canAddProduct) {
      console.warn(`[RBAC] Add product blocked for accessLevel: ${accessLevel}`);
      return;
    }

    await apiRequest('items', { method: 'POST', body: newProduct });
    refreshData();
    setIsAddProductOpen(false);
    setCatalogView('active');
  };

  const openProductAction = (action, item) => {
    if (!canManageProducts) return;
    setNotice('');
    setProductAction({ action, item });
  };

  const openReports = item => {
    if (!canViewReports) return;
    setNotice('');
    setReportItem(item);
  };

  const completeProductAction = message => {
    setProductAction(null);
    setNotice(message);
    refreshData();
  };

  return (
    <div className="wba-grid-container">
      {/* Section Header */}
      <div className="wba-section-page-header">
        <div>
          <h2 ref={headingRef} tabIndex={-1} className="wba-section-page-title wba-toolbar-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            Inventory
          </h2>
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

      {notice && <p className="wba-product-notice" role="status">{notice}</p>}
      {canManageProducts && <div className="wba-product-catalog-toggle" role="group" aria-label="Product catalog view">
        <button type="button" className={'wba-pill-btn' + (catalogView === 'active' ? ' active' : '')} aria-pressed={catalogView === 'active'} onClick={() => setCatalogView('active')}>Active products</button>
        <button type="button" className={'wba-pill-btn' + (catalogView === 'archived' ? ' active' : '')} aria-pressed={catalogView === 'archived'} onClick={() => setCatalogView('archived')}>Archived products</button>
      </div>}

      {/* Real-Time Multi-State Ledger (Full Width) */}
      <section style={{ width: '100%' }}>
        {canManageProducts && catalogView === 'archived' ? <ArchivedProducts onRestore={item => openProductAction('restore', item)} onDelete={item => openProductAction('delete', item)} onReports={openReports} />
          : loading || error ? <ApiStatus loading={loading} error={error} onRetry={reload} loadingLabel="Loading inventory ledger…"><SkeletonTable columns={8} /></ApiStatus> : <RealTimeInventoryLedger items={items} currentUser={currentUser} onArchive={item => openProductAction('archive', item)} onReports={openReports} />}
      </section>

      {canGenerateQr && catalogView === 'active' && (
        <section className="wba-qr-tools" aria-label="Product QR tools">
          <div className="wba-qr-tools-copy">
            <span className="wba-qr-tools-icon" aria-hidden="true">▦</span>
            <div>
              <h3>Product QR tools</h3>
            </div>
          </div>
          <div className="wba-qr-tools-actions">
            {isWarehouseStaff && (
              <button type="button" className="wba-btn-primary" disabled={loading || Boolean(error)} onClick={() => setIsQrScannerOpen(true)}>
                Scan Product
              </button>
            )}
            <button type="button" className="wba-qr-secondary-btn" disabled={loading || Boolean(error)} onClick={() => setIsQrGeneratorOpen(true)}>
              Generate QR
            </button>
          </div>
        </section>
      )}

      {/* FIFO / FEFO Expiry Queue (Warehouse & Admin) OR Sales ATP Reservation Summary */}
      {catalogView === 'active' && <section style={{ width: '100%' }}>
        {canViewFifo ? (
          <FifoExpiryQueue />
        ) : loading || error ? (
          <ApiStatus loading={loading} error={error} onRetry={reload} loadingLabel="Loading available stock and reservations…"><SkeletonMetrics /></ApiStatus>
        ) : (
          <div className="wba-glow-card">
            <div className="wba-card-title-bar">
              <div className="wba-card-title-group">
                <div className="wba-card-heading">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Stock availability</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
              <div style={{ flex: '1', minWidth: '180px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--wba-inline-info)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Active Reservations</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--wba-inline-strong)' }}>{items.reduce((sum, item) => sum + item.reserved, 0)} Units</div>
              </div>
              <div style={{ flex: '1', minWidth: '180px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--wba-inline-good)', textTransform: 'uppercase', marginBottom: '4px' }}>Available to sell</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--wba-inline-strong)' }}>{items.reduce((sum, item) => sum + Math.max(0, item.physicalOnHand - item.reserved - item.allocated), 0)} Units</div>
              </div>
              <div style={{ flex: '1', minWidth: '180px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--wba-inline-critical)', textTransform: 'uppercase', marginBottom: '4px' }}>Out of stock</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--wba-inline-strong)' }}>{items.filter(item => item.physicalOnHand - item.reserved - item.allocated <= 0).length} Products</div>
              </div>
            </div>
          </div>
        )}
      </section>}

      {canManageProducts && productAction && <ProductLifecycleDialog key={productAction.action + '-' + productAction.item.id} {...productAction} onClose={() => setProductAction(null)} onComplete={completeProductAction} />}
      {canViewReports && reportItem && <ProductReportsDialog key={reportItem.id} item={reportItem} currentUser={currentUser} onClose={() => setReportItem(null)} />}

      {/* Add Product Modal (Only rendered when permitted) */}
      {canAddProduct && (
        <AddProductModal
          isOpen={isAddProductOpen}
          onClose={() => setIsAddProductOpen(false)}
          onAddProduct={handleAddProduct}
        />
      )}
      {isWarehouseStaff && (
        <QrInventoryScanner products={items} isOpen={isQrScannerOpen} onClose={() => setIsQrScannerOpen(false)} onScan={handleQrScan} />
      )}
      {canGenerateQr && (
        <ProductQrGenerator products={items} isOpen={isQrGeneratorOpen} onClose={() => setIsQrGeneratorOpen(false)} />
      )}
    </div>
  );
}

