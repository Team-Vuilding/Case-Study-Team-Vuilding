import React, { useState } from 'react';

import { INITIAL_AUDIT_LOGS } from '../../data/mockInventoryData';

const SEVERITY_LABELS = ['All', 'critical', 'warning', 'good', 'info'];

export default function AuditLogsSection({ externalLogs = [] }) {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('All');

  const allLogs = [...externalLogs, ...INITIAL_AUDIT_LOGS];

  const filtered = allLogs.filter((log) => {
    const matchSearch =
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.eventType.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.sku.toLowerCase().includes(search.toLowerCase());
    const matchSev = severity === 'All' || log.severity === severity;
    return matchSearch && matchSev;
  });

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'critical': return { background: 'rgba(239,68,68,0.25)', color: '#fca5a5' };
      case 'warning': return { background: 'rgba(245,158,11,0.25)', color: '#fde047' };
      case 'good': return { background: 'rgba(16,185,129,0.25)', color: '#6ee7b7' };
      default: return { background: 'rgba(56,189,248,0.25)', color: '#7dd3fc' };
    }
  };

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
            Full transactional event history — inventory scans, discrepancy triggers, FIFO dispatches, and concurrency reservations.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <input
            className="wba-input-field"
            type="text"
            placeholder="Search logs, events, actors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '220px', fontSize: '0.84rem' }}
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
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Events', val: allLogs.length, color: '#c084fc' },
          { label: 'Critical', val: allLogs.filter(l => l.severity === 'critical').length, color: '#f87171' },
          { label: 'Warnings', val: allLogs.filter(l => l.severity === 'warning').length, color: '#fbbf24' },
          { label: 'Verified Good', val: allLogs.filter(l => l.severity === 'good').length, color: '#34d399' },
        ].map((s) => (
          <div key={s.label} className="wba-glow-card" style={{ flex: '1', minWidth: '130px', padding: '14px 18px' }}>
            <div style={{ fontSize: '0.72rem', color: '#948aa8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Full Audit Log Stream */}
      <div className="wba-glow-card">
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.84rem', color: '#c4b5fd' }}>
            Showing <strong style={{ color: '#fff' }}>{filtered.length}</strong> events
          </span>
        </div>
        <div className="wba-audit-stream" style={{ maxHeight: 'none', overflow: 'visible' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#948aa8' }}>
              No audit events match your filter.
            </div>
          )}
          {filtered.map((log) => (
            <div key={log.id} className="wba-audit-item">
              <div className="wba-audit-top">
                <span className="wba-audit-time">{log.timestamp} · <span style={{ color: '#c084fc', fontFamily: 'monospace' }}>{log.id}</span></span>
                <span className="wba-audit-event" style={getSeverityStyle(log.severity)}>
                  {log.eventType}
                </span>
              </div>
              <div className="wba-audit-desc">
                <strong style={{ color: '#e9d5ff' }}>{log.actor}</strong>{' · '}
                <span style={{ fontFamily: 'monospace', fontSize: '0.74rem', color: '#a78bfa' }}>{log.sku}</span>
                <br />{log.description}
              </div>
              <div className="wba-audit-action">↳ {log.actionTaken}</div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
