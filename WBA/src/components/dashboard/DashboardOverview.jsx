import React from 'react';
import MetricKpiCard from './MetricKpiCard';
import SeasonalForecastChart from './SeasonalForecastChart';
import { DASHBOARD_METRICS } from '../../data/mockInventoryData';

export default function DashboardOverview({ currentUser }) {
  const accessLevel = currentUser?.accessLevel || 'admin';
  const isSales = accessLevel === 'sales';

  return (
    <div className="wba-grid-container">
      {/* Top Row: 3 KPI Summary Cards Tailored to Role */}
      <section className="wba-top-metrics-row" aria-label="Key Performance Indicators">
        {isSales ? (
          <>
            <MetricKpiCard
              title="Available-to-Promise (ATP)"
              badgeText="READY TO SHIP"
              value="204 Units"
              subtext={<>Sellable inventory after customer cart & pick reservations</>}
              meterPercent={82}
              status="good"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              }
            />
            <MetricKpiCard
              title="Customer Reservations"
              badgeText="CART LOCKS"
              value="62 Units"
              subtext={<>Items held in active checkout carts across digital storefronts</>}
              meterPercent={40}
              status="info"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              }
            />
            <MetricKpiCard
              title="Online Oversells Blocked"
              badgeText="PROTECTED"
              value="14 Prevented"
              subtext={<>Automated stock threshold prevented unfulfillable orders</>}
              meterPercent={100}
              status="good"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
            />
          </>
        ) : (
          <>
            <MetricKpiCard
              title="Monthly Storage Cost"
              badgeText="88% FULL"
              value="₱84,200 /mo"
              subtext={<>Excess storage fees: <strong>₱48,500</strong> from overstock</>}
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
              title="Stock Count Mismatch"
              badgeText="NEEDS ATTENTION"
              value="−33 Units"
              subtext={<>Smart Thermostat: system shows <strong>45</strong>, actual count is <strong>12</strong></>}
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
              title="Nearest Product Expiry"
              badgeText="24 DAYS LEFT"
              value="₱42,500 At Risk"
              subtext={<>Carbon Filter — Batch Aug 2025 (34 units) expiring soon</>}
              meterPercent={91}
              status={DASHBOARD_METRICS.expiryStatus.severity}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 14 14" />
                </svg>
              }
            />
          </>
        )}
      </section>

      {/* Middle: Demand Chart */}
      <section className="wba-middle-row" aria-label="Demand Overview">
        <SeasonalForecastChart currentUser={currentUser} />
      </section>

      {/* Bottom Quick Stats */}
      <section className="wba-top-metrics-row" aria-label="Quick Stats">
        {isSales ? (
          <>
            <MetricKpiCard
              title="Catalog Products"
              badgeText="ACTIVE"
              value="4 SKUs"
              subtext={<>3 High & Mid-Value lines · 1 Consumable accessory</>}
              meterPercent={100}
              status="good"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              }
            />
            <MetricKpiCard
              title="Stockout Prevention Lock"
              badgeText="ACTIVE"
              value="1 SKU Paused"
              subtext={<>Smart Thermostat sales locked until physical count verifies</>}
              meterPercent={25}
              status="critical"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              }
            />
            <MetricKpiCard
              title="Top Grossing Product Line"
              badgeText="CATEGORY A"
              value="₱18,500 /unit"
              subtext={<>Portable Inverter AC 1.5HP — High Summer Velocity</>}
              meterPercent={88}
              status="good"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
            />
          </>
        ) : (
          <>
            <MetricKpiCard
              title="Products Being Tracked"
              badgeText="ACTIVE"
              value="4 Products"
              subtext={<>3 non-perishable · 1 perishable with expiry tracking</>}
              meterPercent={65}
              status="info"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              }
            />
            <MetricKpiCard
              title="Online Oversells Blocked"
              badgeText="PROTECTED"
              value="14 Prevented"
              subtext={<>System automatically stops selling when stock is low</>}
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
              title="Spoilage Losses Prevented"
              badgeText="THIS MONTH"
              value="₱42,500 Saved"
              subtext={<>Older batches dispatched first to reduce waste</>}
              meterPercent={80}
              status="good"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
            />
          </>
        )}
      </section>
    </div>
  );
}

