import React from 'react';

export default function NotificationDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'NOTIF-1',
      title: 'Stock Discrepancy & Shrinkage Alert',
      severity: 'critical',
      time: '12m ago',
      description: 'Physical audit on Smart Thermostats confirmed 12 units on shelf SEC-A2 vs 45 in legacy records. Available-to-Promise locked to prevent online overselling.',
      actionText: 'Investigate Physical Cage',
    },
    {
      id: 'NOTIF-2',
      title: 'FIFO Expiry Risk (24 Days Remaining)',
      severity: 'critical',
      time: '45m ago',
      description: 'Active Carbon Filter Batch #LOT-2025-08-A is nearing the 9-month degradation threshold. WMS dispatch routing has prioritized Bin C-01 to protect ₱42,500 inventory.',
      actionText: 'Review FIFO Dispatch Order',
    },
    {
      id: 'NOTIF-3',
      title: 'Seasonal Holding Cost Surge Alert',
      severity: 'warning',
      time: '2h ago',
      description: 'Warehouse capacity at 88%. 340 overstock AC units stored off-peak generating ₱48,500/mo in excess holding fees. Dynamic ROP buffer recommendations updated.',
      actionText: 'View ROP Replenishment Plan',
    },
  ];

  return (
    <div className="wba-dash-modal-overlay" onClick={onClose}>
      <div className="wba-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              Operational Alerts
            </h3>
          </div>
          <button
            type="button"
            className="wba-modal-close-btn"
            style={{ position: 'static' }}
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
          {notifications.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'rgba(22, 9, 42, 0.7)',
                border: item.severity === 'critical' ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(245, 158, 11, 0.45)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: item.severity === 'critical' ? '#f87171' : '#fbbf24',
                  }}
                >
                  {item.severity}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#83759e', fontFamily: 'monospace' }}>
                  {item.time}
                </span>
              </div>

              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                {item.title}
              </h4>

              <p style={{ fontSize: '0.78rem', color: '#c4b5fd', lineHeight: 1.4 }}>
                {item.description}
              </p>

              <button
                type="button"
                className="wba-pill-btn"
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '4px',
                  background: 'rgba(147, 51, 234, 0.25)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  color: '#e9d5ff',
                  fontSize: '0.74rem',
                  padding: '4px 10px',
                }}
                onClick={onClose}
              >
                {item.actionText} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
