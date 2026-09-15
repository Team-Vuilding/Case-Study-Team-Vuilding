import React from 'react';
import MetricKpiCard from './MetricKpiCard';
import SeasonalForecastChart from './SeasonalForecastChart';
import { DASHBOARD_METRICS } from '../../data/mockInventoryData';

export default function DashboardOverview() {
  return (
    <div className="wba-grid-container">
      {/* Top Row: 3 KPI Summary Cards */}
      <section className="wba-top-metrics-row" aria-label="Key Performance Indicators">
        <MetricKpiCard
          title="Warehouse Capacity & Holding Cost"
          badgeText="88% CAPACITY"
          value="₱84,200 /mo"
          subtext={<>Excess fees: <strong>₱48,500</strong> — 340 off-peak AC units overstocked</>}
          meterPercent={DASHBOARD_METRICS.holdingCosts.warehouseCapacityUsedPercent}
          status={DASHBOARD_METRICS.holdingCosts.severity}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          }
        />
        <MetricKpiCard
          title="Real-Time Discrepancy Control"
          badgeText="-33 UNITS VARIANCE"
          value="12 vs 45 Units"
          subtext={<>Smart Thermostats: <strong>12 Physical</strong> vs 45 on legacy paper record</>}
          meterPercent={27}
          status={DASHBOARD_METRICS.shrinkageStatus.severity}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />
        <MetricKpiCard
          title="Perishable Shelf-Life Risk"
          badgeText="FIFO ENFORCED"
          value="24 Days to Expiry"
          subtext={<>Lot 2025-08-A (34 units): <strong>₱42,500</strong> write-off protected</>}
          meterPercent={91}
          status={DASHBOARD_METRICS.expiryStatus.severity}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 14 14" />
            </svg>
          }
        />
      </section>

      {/* Middle: Seasonal Demand & Dynamic ROP */}
      <section className="wba-middle-row" aria-label="Demand Forecasting">
        <SeasonalForecastChart />
      </section>

      {/* Summary Cards Row — quick stats grid */}
      <section className="wba-top-metrics-row" aria-label="Operational Quick Stats">
        <MetricKpiCard
          title="Total SKUs Tracked"
          badgeText="REAL-TIME"
          value="4 Active SKUs"
          subtext={<>Cat A: 2 · Cat B: 1 · Cat C: 1 perishable</>}
          meterPercent={65}
          status="info"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          }
        />
        <MetricKpiCard
          title="Online Oversell Incidents Prevented"
          badgeText="ATP ACTIVE"
          value="14 Blocked"
          subtext={<>Available-to-Promise engine active across <strong>all channels</strong></>}
          meterPercent={100}
          status="good"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />
        <MetricKpiCard
          title="Monthly Degradation Write-offs Prevented"
          badgeText="FIFO ENGINE ON"
          value="₱42,500 Saved"
          subtext={<>Carbon Filter Lot A: FIFO dispatch enforced on <strong>3 active batches</strong></>}
          meterPercent={80}
          status="good"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
      </section>
    </div>
  );
}
