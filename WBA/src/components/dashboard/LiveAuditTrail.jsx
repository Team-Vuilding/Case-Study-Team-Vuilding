import React, { useState } from 'react';
import { INITIAL_AUDIT_LOGS } from '../../data/mockInventoryData';

export default function LiveAuditTrail({ externalLogs = [] }) {
  const [logs, setLogs] = useState(INITIAL_AUDIT_LOGS);

  const allLogs = [...externalLogs, ...logs];

  const handleSimulateEvent = () => {
    const events = [
      {
        eventType: 'CART_RESERVATION_LOCK',
        severity: 'info',
        actor: 'E-Store API Gateway',
        sku: 'WBA-AC-INV-15',
        description: 'Customer cart reservation locked 2 units of Inverter AC. Temporary checkout hold: 15m.',
        actionTaken: 'ATP adjusted in real time.',
      },
      {
        eventType: 'FIFO_SCAN_CONFIRMED',
        severity: 'good',
        actor: 'Handheld Scanner #12 (Carlos T.)',
        sku: 'WBA-CF-FLT-9M',
        description: 'Confirmed pick from Rear Bin C-01 (Lot LOT-2025-08-A). Barcode verified.',
        actionTaken: 'Batch remaining quantity decremented.',
      },
      {
        eventType: 'CYCLE_COUNT_MATCH',
        severity: 'good',
        actor: 'Warehouse Supervisor',
        sku: 'WBA-PUR-H13-AIR',
        description: 'Physical cycle count completed for Zone 2. 68 on-hand verified.',
        actionTaken: 'Audited confidence 100%.',
      },
    ];

    const randomEvt = events[Math.floor(Math.random() * events.length)];
    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      ...randomEvt,
    };

    setLogs((prev) => [newLog, ...prev]);
  };

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'critical':
        return { background: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5' };
      case 'warning':
        return { background: 'rgba(245, 158, 11, 0.25)', color: '#fde047' };
      case 'good':
        return { background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7' };
      default:
        return { background: 'rgba(56, 189, 248, 0.25)', color: '#7dd3fc' };
    }
  };

  return (
    <div className="wba-glow-card">
      <div className="wba-card-title-bar">
        <div className="wba-card-title-group">
          <div className="wba-card-heading">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Live Audit Trail & Triggers</span>
          </div>
          <span className="wba-card-desc">
            Continuous event stream eliminating weekly spreadsheet blind spots
          </span>
        </div>

        <button
          type="button"
          className="wba-pill-btn"
          style={{
            background: 'rgba(56, 189, 248, 0.2)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38bdf8',
            fontSize: '0.72rem',
          }}
          onClick={handleSimulateEvent}
          title="Simulate incoming warehouse scanner event"
        >
          + Trigger Event
        </button>
      </div>

      <div className="wba-audit-stream">
        {allLogs.map((log) => (
          <div key={log.id} className="wba-audit-item">
            <div className="wba-audit-top">
              <span className="wba-audit-time">{log.timestamp}</span>
              <span className="wba-audit-event" style={getSeverityStyle(log.severity)}>
                {log.eventType}
              </span>
            </div>

            <div className="wba-audit-desc">
              <strong>{log.actor}:</strong> {log.description}
            </div>

            <div className="wba-audit-action">
              ↳ {log.actionTaken}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
