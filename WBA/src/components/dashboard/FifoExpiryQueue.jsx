import React from 'react';
import { INITIAL_FILTER_BATCHES } from '../../data/mockInventoryData';

export default function FifoExpiryQueue() {
  return (
    <div className="wba-glow-card">
      <div className="wba-card-title-bar">
        <div className="wba-card-title-group">
          <div className="wba-card-heading">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 14 14" />
            </svg>
            <span>FIFO / FEFO Expiry Queue</span>
          </div>
          <span className="wba-card-desc">
            Active Carbon Filters (9-month maximum shelf life)
          </span>
        </div>

        <span
          className="wba-kpi-badge wba-badge-critical"
          style={{ fontSize: '0.72rem' }}
        >
          FIFO Enforced
        </span>
      </div>

      <div className="wba-fifo-queue-list">
        {INITIAL_FILTER_BATCHES.map((batch) => {
          const agePercent = (batch.currentAgeMonths / batch.maxShelfLifeMonths) * 100;
          const isCritical = batch.dispatchPriority === 1;

          return (
            <div
              key={batch.batchId}
              className={`wba-batch-card ${isCritical ? 'priority-pick' : ''}`}
            >
              <div className="wba-batch-header">
                <span className="wba-batch-id">{batch.batchId}</span>
                <span
                  className={`wba-batch-priority-tag ${
                    isCritical ? 'wba-tag-urgent' : 'wba-kpi-badge wba-badge-good'
                  }`}
                >
                  Priority #{batch.dispatchPriority} {isCritical ? '• PULL FIRST' : ''}
                </span>
              </div>

              <div className="wba-batch-bin">
                <span>Location:</span>
                <strong>{batch.binLocation}</strong>
              </div>

              <div className="wba-shelf-age-bar">
                <div
                  className="wba-shelf-age-fill"
                  style={{
                    width: `${Math.min(100, agePercent)}%`,
                    background:
                      agePercent > 85
                        ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                        : agePercent > 55
                        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #10b981, #059669)',
                  }}
                />
              </div>

              <div className="wba-batch-meta">
                <span>
                  Age: <strong>{batch.currentAgeMonths} mo / 9 mo</strong>
                </span>
                <span style={{ color: isCritical ? '#f87171' : 'inherit' }}>
                  {batch.daysUntilDegraded} days left ({batch.quantityRemaining} units)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="wba-fifo-instruction-box">
        <strong>⚠️ WMS Picking Policy Enforced:</strong>
        <p style={{ marginTop: '4px' }}>
          Floor teams must pull from <strong>Rear Bin C-01 (Lot 2025-08-A)</strong> first. Front pallet picking is system-blocked to eliminate rotting stock write-offs.
        </p>
      </div>
    </div>
  );
}
