import React, { useState } from 'react';
import useApiData from '../../services/useApiData';
import ApiStatus from '../ApiStatus';
import { SkeletonHeading, SkeletonList, SkeletonSummary } from '../WorkspaceSkeletons';

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
    case 'critical': return { background: 'rgba(239,68,68,0.2)', color: 'var(--wba-inline-critical)' };
    case 'warning': return { background: 'rgba(245,158,11,0.2)', color: 'var(--wba-inline-warning)' };
    case 'good': return { background: 'rgba(16,185,129,0.2)', color: 'var(--wba-inline-good)' };
    default: return { background: 'rgba(56,189,248,0.2)', color: 'var(--wba-inline-info)' };
  }
};

export default function AuditLogsSection({ currentUser }) {
  const { data, loading, error, reload } = useApiData('audit-logs');
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('All');
  const accessLevel = currentUser?.accessLevel || 'admin';

  if (accessLevel === 'sales') {
    return (
      <div className="wba-grid-container">
        <div className="wba-glow-card" style={{ textAlign: 'center', padding: '60px 40px', border: '1px solid rgba(239, 68, 68, 0.45)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ color: 'var(--wba-inline-critical)', fontSize: '1.4rem', marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: 'var(--wba-inline-accent)', fontSize: '0.92rem' }}>
            Sales Staff accounts do not have permission to view administrative audit trails.
          </p>
        </div>
      </div>
    );
  }

  if (loading || error) return <ApiStatus loading={loading} error={error} onRetry={reload} loadingLabel="Loading audit logs…">
    <div className="wba-grid-container"><SkeletonHeading /><SkeletonSummary count={4} /><SkeletonList rows={4} /></div>
  </ApiStatus>;
  const allLogs = data || [];

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
      <div className="wba-audit-summary" aria-label="Filter audit logs by severity">
        {[
          { label: 'Total Entries', filter: 'All', val: allLogs.length, color: 'var(--wba-inline-accent)' },
          { label: 'Critical Alerts', filter: 'critical', val: allLogs.filter(l => l.severity === 'critical').length, color: 'var(--wba-inline-critical)' },
          { label: 'Warnings', filter: 'warning', val: allLogs.filter(l => l.severity === 'warning').length, color: 'var(--wba-inline-warning)' },
          { label: 'Resolved', filter: 'good', val: allLogs.filter(l => l.severity === 'good').length, color: 'var(--wba-inline-good)' },
        ].map((s) => (
          <button
            key={s.label}
            type="button"
            className={`wba-glow-card wba-audit-summary-card ${severity === s.filter ? 'active' : ''}`}
            onClick={() => setSeverity(s.filter)}
            aria-pressed={severity === s.filter}
            aria-label={`Show ${s.label.toLowerCase()} audit logs`}
          >
            <span className="wba-audit-summary-label">{s.label}</span>
            <strong className="wba-audit-summary-value" style={{ color: s.color }}>{s.val}</strong>
          </button>
        ))}
      </div>

      {/* Log Stream */}
      <div className="wba-glow-card">
        <div style={{ marginBottom: '14px', fontSize: '0.84rem', color: 'var(--wba-inline-accent)' }}>
          Showing <strong style={{ color: 'var(--wba-inline-strong)' }}>{filtered.length}</strong> entries
        </div>

        <div className="wba-audit-stream" style={{ maxHeight: 'none', overflow: 'visible' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--wba-inline-muted)' }}>
              No entries match the current filters.
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
                <strong style={{ color: 'var(--wba-inline-strong)' }}>{log.actor}</strong>
                <br />
                {log.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
