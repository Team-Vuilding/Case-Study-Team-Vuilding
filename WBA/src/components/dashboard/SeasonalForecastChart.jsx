import React, { useState } from 'react';
import { SEASONAL_DEMAND_PROFILES } from '../../data/mockInventoryData';

export default function SeasonalForecastChart() {
  const [activeMode, setActiveMode] = useState('summer');
  const [selectedMonth, setSelectedMonth] = useState(5);

  const maxVal = Math.max(...SEASONAL_DEMAND_PROFILES.map((p) => Math.max(p.demand, p.stockLevel, 1500)));

  const selectedData = SEASONAL_DEMAND_PROFILES[selectedMonth];

  return (
    <div className="wba-glow-card wba-forecast-card">
      <div className="wba-card-title-bar">
        <div className="wba-card-title-group">
          <div className="wba-card-heading">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            <span>Monthly Demand & Stock Overview</span>
          </div>
          <span className="wba-card-desc">
            Tap a month to see demand and stock details. Red bars indicate overstock periods.
          </span>
        </div>

        <div className="wba-pill-toggle">
          <button
            type="button"
            className={`wba-pill-btn ${activeMode === 'summer' ? 'active' : ''}`}
            onClick={() => setActiveMode('summer')}
          >
            Peak Season
          </button>
          <button
            type="button"
            className={`wba-pill-btn ${activeMode === 'standard' ? 'active' : ''}`}
            onClick={() => setActiveMode('standard')}
          >
            Off-Season
          </button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', height: '170px', width: '100%', marginTop: '8px' }}>
        <svg
          viewBox="0 0 960 170"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="demandAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c026d3" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#9333ea" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="stockBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="30" x2="960" y2="30" stroke="rgba(168, 85, 247, 0.15)" strokeDasharray="4 4" />
          <line x1="0" y1="80" x2="960" y2="80" stroke="rgba(168, 85, 247, 0.15)" strokeDasharray="4 4" />
          <line x1="0" y1="130" x2="960" y2="130" stroke="rgba(168, 85, 247, 0.15)" strokeDasharray="4 4" />

          {SEASONAL_DEMAND_PROFILES.map((p, idx) => {
            const x = (idx / 11) * 880 + 40;
            const barHeight = (p.stockLevel / maxVal) * 110;
            const demandY = 140 - (p.demand / maxVal) * 110;
            const isSelected = selectedMonth === idx;

            return (
              <g key={p.month} onClick={() => setSelectedMonth(idx)} style={{ cursor: 'pointer' }}>
                <rect
                  x={x - 14}
                  y={140 - barHeight}
                  width="28"
                  height={barHeight}
                  rx="4"
                  fill={p.isExcessStock ? 'rgba(239, 68, 68, 0.65)' : 'url(#stockBarGrad)'}
                  stroke={p.isExcessStock ? '#ef4444' : 'rgba(56, 189, 248, 0.4)'}
                  strokeWidth="1"
                  opacity={isSelected ? 1 : 0.75}
                />
                <circle
                  cx={x}
                  cy={demandY}
                  r={isSelected ? 6 : 4}
                  fill={p.isPeakMonth ? '#ec4899' : '#c084fc'}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 2 : 1}
                />
                <text
                  x={x}
                  y="160"
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : '#9487b3'}
                  fontSize="11"
                  fontWeight={isSelected ? '700' : '500'}
                  fontFamily="sans-serif"
                >
                  {p.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Month Info */}
      {selectedData && (
        <div
          style={{
            marginTop: '14px',
            padding: '10px 16px',
            borderRadius: '10px',
            background: 'rgba(28, 12, 52, 0.8)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.84rem',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <strong style={{ color: '#ffffff' }}>{selectedData.month}:</strong>{' '}
            <span style={{ color: '#c4b5fd' }}>
              Expected sales: <strong>{selectedData.demand} units</strong> &nbsp;·&nbsp;
              Stock on hand: <strong>{selectedData.stockLevel} units</strong> &nbsp;·&nbsp;
              Storage cost: <strong>₱{selectedData.holdingCost.toLocaleString()}</strong>
            </span>
          </div>
          <div>
            {selectedData.isPeakMonth && (
              <span style={{ color: '#ec4899', fontWeight: 700 }}>
                ⚡ High-demand month — reorder early to avoid stockouts.
              </span>
            )}
            {selectedData.isExcessStock && (
              <span style={{ color: '#f87171', fontWeight: 700 }}>
                ⚠️ Too much stock — excess units are driving up storage costs.
              </span>
            )}
            {!selectedData.isPeakMonth && !selectedData.isExcessStock && (
              <span style={{ color: '#34d399', fontWeight: 600 }}>
                ✓ Stock levels are healthy for this period.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
