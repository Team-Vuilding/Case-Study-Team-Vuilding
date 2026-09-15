import React, { useState } from 'react';

const PURCHASE_ORDERS = [
  {
    id: 'WBA-PO-2026-55',
    sku: 'WBA-AC-INV-15',
    product: 'Portable Inverter AC 1.5HP',
    supplier: 'CoolBreeze Manufacturing Corp.',
    quantity: 750,
    unitCost: 12800,
    totalCost: 9600000,
    orderDate: '2026-04-10',
    expectedDelivery: '2026-05-01',
    status: 'Delivered',
    notes: 'Pre-summer buffer order. Staggered: 400 units Apr, 350 units May.',
  },
  {
    id: 'WBA-PO-2026-48',
    sku: 'WBA-CF-FLT-9M',
    product: 'Active Carbon Replacement Filter',
    supplier: 'PureAir Filtration Supplies',
    quantity: 200,
    unitCost: 780,
    totalCost: 156000,
    orderDate: '2026-03-02',
    expectedDelivery: '2026-03-12',
    status: 'Delivered',
    notes: 'Replenishment order. FIFO lot LOT-2026-03-C created on arrival.',
  },
  {
    id: 'WBA-PO-2026-41',
    sku: 'WBA-PUR-H13-AIR',
    product: 'Medical-Grade Air Purifier H13',
    supplier: 'HealthAir Solutions Inc.',
    quantity: 50,
    unitCost: 6200,
    totalCost: 310000,
    orderDate: '2026-02-15',
    expectedDelivery: '2026-03-05',
    status: 'Delivered',
    notes: 'Standard cycle replenishment based on ROP threshold.',
  },
  {
    id: 'WBA-PO-2026-62',
    sku: 'WBA-SMT-TH-PRO',
    product: 'Smart Climate Thermostat v2',
    supplier: 'TechComfort Distributors',
    quantity: 40,
    unitCost: 4100,
    totalCost: 164000,
    orderDate: '2026-08-20',
    expectedDelivery: '2026-09-03',
    status: 'In Transit',
    notes: 'Emergency restock after physical discrepancy audit (−33 unit variance resolved).',
  },
  {
    id: 'WBA-PO-2025-88',
    sku: 'WBA-AC-INV-15',
    product: 'Portable Inverter AC 1.5HP',
    supplier: 'CoolBreeze Manufacturing Corp.',
    quantity: 920,
    unitCost: 12800,
    totalCost: 11776000,
    orderDate: '2025-08-05',
    expectedDelivery: '2025-08-28',
    status: 'Delivered',
    notes: '⚠️ Off-season panic order. Caused ₱48,500/mo holding cost penalty. ROP engine now prevents this.',
  },
];

const STATUS_STYLE = {
  Delivered: { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' },
  'In Transit': { background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)' },
  Pending: { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' },
};

export default function PurchaseHistorySection() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = PURCHASE_ORDERS.filter((po) => {
    const matchSearch =
      po.id.toLowerCase().includes(search.toLowerCase()) ||
      po.product.toLowerCase().includes(search.toLowerCase()) ||
      po.supplier.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || po.status === filter;
    return matchSearch && matchFilter;
  });

  const totalSpend = filtered.reduce((sum, po) => sum + po.totalCost, 0);

  return (
    <div className="wba-grid-container">
      {/* Header */}
      <div className="wba-section-page-header">
        <div>
          <h2 className="wba-section-page-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
            Purchase History
          </h2>
          <p className="wba-section-page-desc">
            All purchase orders — view supplier details, amounts, and delivery status.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <input
            className="wba-input-field"
            type="text"
            placeholder="Search PO, product, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '220px', fontSize: '0.84rem' }}
          />
          {['All', 'Delivered', 'In Transit', 'Pending'].map((f) => (
            <button
              key={f}
              type="button"
              className={`wba-pill-btn ${filter === f ? 'active' : ''}`}
              style={{ border: '1px solid rgba(168,85,247,0.3)', color: filter === f ? '#fff' : '#c4b5fd', fontSize: '0.8rem' }}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Strip */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total POs', val: filtered.length },
          { label: 'Total Spend', val: `₱${totalSpend.toLocaleString()}` },
          { label: 'Delivered', val: filtered.filter(p => p.status === 'Delivered').length },
          { label: 'In Transit', val: filtered.filter(p => p.status === 'In Transit').length },
        ].map((s) => (
          <div key={s.label} className="wba-glow-card" style={{ flex: '1', minWidth: '140px', padding: '14px 18px' }}>
            <div style={{ fontSize: '0.74rem', color: '#948aa8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Purchase Orders Table */}
      <div className="wba-glow-card" style={{ padding: '0' }}>
        <div className="wba-table-container" style={{ padding: '0 4px' }}>
          <table className="wba-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Product</th>
                <th>Supplier</th>
                <th>Qty</th>
                <th>Unit Cost</th>
                <th>Total Cost</th>
                <th>Order Date</th>
                <th>ETA / Delivered</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((po) => (
                <React.Fragment key={po.id}>
                  <tr>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: '#c084fc', fontWeight: 700 }}>{po.id}</span>
                    </td>
                    <td>
                      <span className="wba-sku-name">{po.product}</span>
                      <span className="wba-sku-code">{po.sku}</span>
                    </td>
                    <td style={{ color: '#c4b5fd' }}>{po.supplier}</td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>{po.quantity.toLocaleString()}</td>
                    <td>₱{po.unitCost.toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>₱{po.totalCost.toLocaleString()}</td>
                    <td>{po.orderDate}</td>
                    <td>{po.expectedDelivery}</td>
                    <td>
                      <span style={{
                        ...(STATUS_STYLE[po.status] || {}),
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        display: 'inline-block',
                      }}>
                        {po.status}
                      </span>
                    </td>
                  </tr>
                  {po.notes && (
                    <tr>
                      <td colSpan={9} style={{ paddingTop: '0', paddingBottom: '10px' }}>
                        <div style={{
                          fontSize: '0.75rem',
                          color: po.notes.includes('⚠️') ? '#fbbf24' : '#948aa8',
                          background: po.notes.includes('⚠️') ? 'rgba(245,158,11,0.08)' : 'transparent',
                          borderLeft: `2px solid ${po.notes.includes('⚠️') ? '#f59e0b' : 'rgba(168,85,247,0.3)'}`,
                          paddingLeft: '10px',
                          borderRadius: '2px',
                        }}>
                          {po.notes}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#948aa8' }}>
              No purchase orders match your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
