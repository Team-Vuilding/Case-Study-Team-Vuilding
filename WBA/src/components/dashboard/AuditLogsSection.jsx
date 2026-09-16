import React, { useState } from 'react';
import { INITIAL_AUDIT_LOGS } from '../../data/mockInventoryData';

const SEVERITY_LABELS = ['All', 'critical', 'warning', 'good', 'info'];

// Map technical event codes to human-readable labels
const FRIENDLY_EVENT = {
  DISCREPANCY_ALERT: 'Stock Mismatch Detected',
  FIFO_DISPATCH_LOCK: 'Dispatch Order Enforced',
  DYNAMIC_ROP_TRIGGER: 'Reorder Recommended',
  REALTIME_RESERVATION: 'Stock Reserved (Online Order)',
  CYCLE_COUNT_VERIFIED: 'Stock Count Verified',
  LEDGER_RECONCILED: 'Count Corrected',
  PRODUCT_CATALOG_ADDED: 'New Product Added',
};

const getSeverityStyle = (sev) => {
  switch (sev) {
    case 'critical': return { background: 'rgba(239,68,68,0.2)', color: '#fca5a5' };
    case 'warning': return { background: 'rgba(245,158,11,0.2)', color: '#fde047' };
    case 'good': return { background: 'rgba(16,185,129,0.2)', color: '#6ee7b7' };
    default: return { background: 'rgba(56,189,248,0.2)', color: '#7dd3fc' };
  }
};

export default function AuditLogsSection({ currentUser, externalLogs = [] }) {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('All');
  const accessLevel = currentUser?.accessLevel || 'admin';

  if (accessLevel === 'sales') {
    return (
      <div className="wba-grid-container">
        <div className="wba-glow-card" style={{ textAlign: 'center', padding: '60px 40px', border: '1px solid rgba(239, 68, 68, 0.45)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ color: '#f87171', fontSize: '1.4rem', marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: '#c4b5fd', fontSize: '0.92rem' }}>
            Sales Staff accounts do not have permission to view administrative audit trails.
          </p>
        </div>
      </div>
    );
  }

  const allLogs = [...externalLogs, ...INITIAL_AUDIT_LOGS];

  const filtered = allLogs.filter((log) => {
    const friendlyLabel = FRIENDLY_EVENT[log.eventType] || log.eventType;
    const matchSearch =
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      friendlyLabel.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase());
    const matchSev = severity === 'All' || log.severity === severity;
    return matchSearch && matchSev;
  });

  return (
    <div className="wba-grid-container">
      {/* Header */}
      <div className="wba-section-page-header">
        <div>
          <h2 className="wba-section-page-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Audit Logs
          </h2>
          <p className="wba-section-page-desc">
            A record of all stock changes, corrections, orders, and system actions.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <input
            className="wba-input-field"
            type="text"
            placeholder="Search by product, action, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '230px', fontSize: '0.84rem' }}
          />
          <div className="wba-pill-toggle">
            {SEVERITY_LABELS.map((s) => (
              <button
                key={s}
                type="button"
                className={`wba-pill-btn ${severity === s ? 'active' : ''}`}
                onClick={() => setSeverity(s)}
                style={{ textTransform: 'capitalize' }}
              >
                {s === 'All' ? 'All' : s === 'critical' ? 'Critical' : s === 'warning' ? 'Warning' : s === 'good' ? 'Resolved' : 'Info'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Entries', val: allLogs.length, color: '#c084fc' },
          { label: 'Critical Alerts', val: allLogs.filter(l => l.severity === 'critical').length, color: '#f87171' },
          { label: 'Warnings', val: allLogs.filter(l => l.severity === 'warning').length, color: '#fbbf24' },
          { label: 'Resolved', val: allLogs.filter(l => l.severity === 'good').length, color: '#34d399' },
        ].map((s) => (
          <div key={s.label} className="wba-glow-card" style={{ flex: '1', minWidth: '130px', padding: '14px 18px' }}>
            <div style={{ fontSize: '0.72rem', color: '#948aa8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Log Stream */}
      <div className="wba-glow-card">
        <div style={{ marginBottom: '14px', fontSize: '0.84rem', color: '#c4b5fd' }}>
          Showing <strong style={{ color: '#fff' }}>{filtered.length}</strong> entries
        </div>

        <div className="wba-audit-stream" style={{ maxHeight: 'none', overflow: 'visible' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#948aa8' }}>
              No entries match your search.
            </div>
          )}
          {filtered.map((log) => (
            <div key={log.id} className="wba-audit-item">
              <div className="wba-audit-top">
                <span className="wba-audit-time">{log.timestamp}</span>
                <span className="wba-audit-event" style={getSeverityStyle(log.severity)}>
                  {FRIENDLY_EVENT[log.eventType] || log.eventType}
                </span>
              </div>
              <div className="wba-audit-desc">
                <strong style={{ color: '#e9d5ff' }}>{log.actor}</strong>
                <br />
                {log.description}
              </div>
              <div className="wba-audit-action">↳ {log.actionTaken}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
