import React, { useState } from 'react';
import { SEASONAL_DEMAND_PROFILES } from '../../data/mockInventoryData';

export default function SeasonalForecastChart() {
  const [activeMode, setActiveMode] = useState('summer');
  const [selectedMonth, setSelectedMonth] = useState(5);

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
            Compare monthly sales demand with stock on hand. Tap any month to inspect details.
          </span>
        </div>

        <div className="wba-pill-toggle">
          <button
            type="button"
            className={`wba-pill-btn ${activeMode === 'summer' ? 'active' : ''}`}
            onClick={() => {
              setActiveMode('summer');
              setSelectedMonth(5); // Jun peak
            }}
          >
            Peak Season
          </button>
          <button
            type="button"
            className={`wba-pill-btn ${activeMode === 'standard' ? 'active' : ''}`}
            onClick={() => {
              setActiveMode('standard');
              setSelectedMonth(7); // Aug excess stock
            }}
          >
            Off-Season
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ position: 'relative', width: '100%', marginTop: '12px' }}>
        {/* Top-right stats indicator matching reference */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '8px',
            paddingRight: '12px',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffffff', display: 'inline-block' }} />
            <span style={{ color: '#ffffff' }}>Stock: {selectedData.stockLevel} units</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
            <span style={{ color: '#38bdf8' }}>Demand: {selectedData.demand} units</span>
          </div>
        </div>

        <svg
          viewBox="0 0 960 215"
          style={{ width: '100%', height: 'auto', minHeight: '190px', display: 'block' }}
        >
          <defs>
            <linearGradient id="selectedColGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6b21a8" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Alternating Shaded Column Bands (Matching Reference Zebra Stripes) */}
          {SEASONAL_DEMAND_PROFILES.map((_, idx) => {
            const axisX = 45;
            const axisEndX = 925;
            const colWidth = (axisEndX - axisX) / 12;
            const colX = axisX + idx * colWidth;
            const topY = 24;
            const bottomY = 168;
            const isShaded = idx % 2 === 1;
            const isSelected = selectedMonth === idx;

            return (
              <g key={`col-band-${idx}`}>
                {isShaded && (
                  <rect
                    x={colX}
                    y={topY}
                    width={colWidth}
                    height={bottomY - topY}
                    fill="rgba(30, 41, 59, 0.45)"
                  />
                )}
                {isSelected && (
                  <rect
                    x={colX}
                    y={topY}
                    width={colWidth}
                    height={bottomY - topY}
                    fill="url(#selectedColGrad)"
                    stroke="rgba(192, 132, 252, 0.55)"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}

          {/* Horizontal Grid Lines */}
          <line x1="45" y1="60" x2="925" y2="60" stroke="rgba(148, 163, 184, 0.18)" strokeWidth="1.5" />
          <line x1="45" y1="96" x2="925" y2="96" stroke="rgba(148, 163, 184, 0.18)" strokeWidth="1.5" />
          <line x1="45" y1="132" x2="925" y2="132" stroke="rgba(148, 163, 184, 0.18)" strokeWidth="1.5" />

          {/* Y-Axis (Solid line with Upward Triangular Arrow) */}
          <line x1="45" y1="168" x2="45" y2="18" stroke="#475569" strokeWidth="2.2" />
          <polygon points="40,20 50,20 45,9" fill="#64748b" />

          {/* X-Axis (Solid line with Rightward Triangular Arrow) */}
          <line x1="45" y1="168" x2="938" y2="168" stroke="#475569" strokeWidth="2.2" />
          <polygon points="936,163 936,173 947,168" fill="#64748b" />

          {/* Dual Polylines & Nodes */}
          {(() => {
            const axisX = 45;
            const axisEndX = 925;
            const colWidth = (axisEndX - axisX) / 12;
            const bottomY = 168;
            const topY = 24;
            const maxScale = 1600;
            const usableHeight = bottomY - topY - 16;

            const scaleY = (val) => {
              const clamped = Math.max(0, Math.min(maxScale, Number(val) || 0));
              return bottomY - 6 - (clamped / maxScale) * usableHeight;
            };

            const points = SEASONAL_DEMAND_PROFILES.map((p, idx) => {
              const x = axisX + idx * colWidth + colWidth / 2;
              const stockY = scaleY(p.stockLevel);
              const demandY = scaleY(p.demand);
              return { x, stockY, demandY, p, idx };
            });

            const stockPointsStr = points.map((pt) => `${pt.x},${pt.stockY}`).join(' ');
            const demandPointsStr = points.map((pt) => `${pt.x},${pt.demandY}`).join(' ');

            return (
              <>
                {/* Stock Level Polyline (White Series) */}
                <polyline
                  points={stockPointsStr}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Demand Polyline (Electric Cyan Series) */}
                <polyline
                  points={demandPointsStr}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Nodes & Interactive Targets */}
                {points.map(({ x, stockY, demandY, p, idx }) => {
                  const isSelected = selectedMonth === idx;
                  return (
                    <g
                      key={`pt-${p.month}`}
                      onClick={() => setSelectedMonth(idx)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Click target across column */}
                      <rect
                        x={x - colWidth / 2}
                        y={topY}
                        width={colWidth}
                        height={bottomY - topY + 36}
                        fill="transparent"
                      />

                      {/* Stock Node (White) */}
                      <circle
                        cx={x}
                        cy={stockY}
                        r={isSelected ? 6 : 4}
                        fill="#ffffff"
                        stroke="#0f172a"
                        strokeWidth="2"
                      />

                      {/* Demand Node (Cyan Blue) */}
                      <circle
                        cx={x}
                        cy={demandY}
                        r={isSelected ? 6 : 4}
                        fill="#38bdf8"
                        stroke="#0f172a"
                        strokeWidth="2"
                      />

                      {/* X-Axis Month Label */}
                      <text
                        x={x}
                        y={bottomY + 24}
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : '#94a3b8'}
                        fontSize="12"
                        fontWeight={isSelected ? '700' : '500'}
                        fontFamily="'Plus Jakarta Sans', sans-serif"
                      >
                        {p.month}
                      </text>
                    </g>
                  );
                })}
              </>
            );
          })()}
        </svg>
      </div>

      {/* Selected Month Info with Dynamic ROP Evaluation */}
      {selectedData && (() => {
        const leadTimeDays = 21;
        const isSummer = ['Apr', 'May', 'Jun', 'Jul'].includes(selectedData.month);
        const safetyStock = isSummer ? 180 : 20;
        const dailyDemand = selectedData.demand / 30;
        const rop = Math.round(dailyDemand * leadTimeDays + safetyStock);
        const isBelowRop = selectedData.stockLevel < rop;
        const isExcess = selectedData.stockLevel > rop * 2.2;

        return (
          <div
            style={{
              marginTop: '14px',
              padding: '12px 18px',
              borderRadius: '10px',
              background: 'rgba(28, 12, 52, 0.85)',
              border: `1px solid ${isBelowRop ? 'rgba(239, 68, 68, 0.45)' : isExcess ? 'rgba(245, 158, 11, 0.45)' : 'rgba(168, 85, 247, 0.35)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.84rem',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <strong style={{ color: '#ffffff' }}>{selectedData.month}:</strong>{' '}
              <span style={{ color: '#c4b5fd' }}>
                Expected sales: <strong style={{ color: '#38bdf8' }}>{selectedData.demand} units</strong> &nbsp;·&nbsp;
                Stock on hand: <strong style={{ color: '#ffffff' }}>{selectedData.stockLevel} units</strong> &nbsp;·&nbsp;
                Reorder Point (ROP): <strong style={{ color: '#c084fc' }}>{rop} units</strong> &nbsp;·&nbsp;
                Storage cost: <strong>₱{selectedData.holdingCost.toLocaleString()}</strong>
              </span>
            </div>
            <div>
              {isBelowRop ? (
                <span style={{ color: '#f87171', fontWeight: 700 }}>
                  ⚠️ Under-Stocked — Stock on hand ({selectedData.stockLevel}) is below the Reorder Point ({rop} units). High stockout risk.
                </span>
              ) : isExcess ? (
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                  ⚠️ Excess Stock — Stock on hand ({selectedData.stockLevel}) exceeds the Reorder Point ({rop} units), driving up warehouse holding costs.
                </span>
              ) : (
                <span style={{ color: '#34d399', fontWeight: 600 }}>
                  ✓ Healthy Stock Level — Stock ({selectedData.stockLevel}) safely covers the Reorder Point ({rop} units) with adequate buffer.
                </span>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
