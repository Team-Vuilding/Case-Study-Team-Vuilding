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
            <span>Batch Expiry Tracker</span>
          </div>
          <span className="wba-card-desc">
            Active Carbon Filter batches — oldest stock is dispatched first to reduce waste
          </span>
        </div>
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
                  {isCritical ? '⚡ Dispatch First' : `Pick Order #${batch.dispatchPriority}`}
                </span>
              </div>

              <div className="wba-batch-bin">
                <span>Location:</span>
                <strong>{batch.binLocation}</strong>
              </div>

              {/* Shelf age progress bar */}
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
                  Age: <strong>{batch.currentAgeMonths} of 9 months</strong>
                </span>
                <span style={{ color: isCritical ? '#f87171' : 'inherit' }}>
                  {batch.daysUntilDegraded} days until expiry · {batch.quantityRemaining} units left
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="wba-fifo-instruction-box">
        <strong>⚠️ Dispatch Reminder:</strong>
        <p style={{ marginTop: '4px' }}>
          Always pull from <strong>Bin C-01 (Batch Aug 2025)</strong> first. This is the oldest batch and must go out before newer stock.
        </p>
      </div>
    </div>
  );
}
