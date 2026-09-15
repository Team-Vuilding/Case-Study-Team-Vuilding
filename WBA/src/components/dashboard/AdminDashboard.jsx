import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import MetricKpiCard from './MetricKpiCard';
import SeasonalForecastChart from './SeasonalForecastChart';
import RealTimeInventoryLedger from './RealTimeInventoryLedger';
import FifoExpiryQueue from './FifoExpiryQueue';
import LiveAuditTrail from './LiveAuditTrail';
import AddProductModal from './AddProductModal';
import NotificationDrawer from './NotificationDrawer';
import { DASHBOARD_METRICS } from '../../data/mockInventoryData';
import './dashboard.css';

export default function AdminDashboard({ onViewLandingPage }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [liveLogs, setLiveLogs] = useState([]);

  const handleAddAuditLog = (newLog) => {
    setLiveLogs((prev) => [newLog, ...prev]);
  };

  const handleAddProduct = (newProduct) => {
    handleAddAuditLog({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      eventType: 'PRODUCT_CATALOG_ADDED',
      severity: 'good',
      actor: 'Admin Console',
      sku: newProduct.sku,
      description: `Added ${newProduct.name} to warehouse catalog (${newProduct.warehouseBin}).`,
      actionTaken: 'Real-time ledger synced across handhelds.',
    });
  };

  return (
    <div className="wba-dashboard-app">
      {/* Background Ambient Violet Glows */}
      <div className="wba-ambient-blur-1" />
      <div className="wba-ambient-blur-2" />

      {/* Left Sidebar Navigation */}
      <DashboardSidebar
        isCollapsed={isSidebarCollapsed}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
      />

      {/* Main Content Area */}
      <div className="wba-main-wrapper">
        <div className="wba-dashboard-frame">
          {/* Header Bar */}
          <DashboardHeader
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
            currentRole="Admin"
            unreadAlertCount={3}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenAddProduct={() => setIsAddProductOpen(true)}
            onViewLandingPage={onViewLandingPage}
          />

          {/* Grid Layout (Matches Reference Screenshot Structure) */}
          <main className="wba-grid-container">
            {/* Top Row: 3 Metric Cards */}
            <section className="wba-top-metrics-row" aria-label="Key Performance Indicators">
              <MetricKpiCard
                title="Warehouse Capacity & Holding Cost"
                badgeText="88% CAPACITY"
                value="₱84,200 /mo"
                subtext={
                  <>
                    Excess fees: <strong>₱48,500</strong> (340 Off-Peak AC Units)
                  </>
                }
                meterPercent={DASHBOARD_METRICS.holdingCosts.warehouseCapacityUsedPercent}
                status={DASHBOARD_METRICS.holdingCosts.severity}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3h18v18H3z" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                }
              />

              <MetricKpiCard
                title="Real-Time Discrepancy Control"
                badgeText="-33 UNITS DISCREPANCY"
                value="12 vs 45 Units"
                subtext={
                  <>
                    Smart Thermostats: <strong>12 Physical</strong> vs 45 Paper
                  </>
                }
                meterPercent={27} // 12 / 45
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
                subtext={
                  <>
                    Lot 2025-08-A (34 Units): <strong>₱42,500</strong> protected
                  </>
                }
                meterPercent={91} // 8.2 / 9 months
                status={DASHBOARD_METRICS.expiryStatus.severity}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 14 14" />
                  </svg>
                }
              />
            </section>

            {/* Middle Row: 1 Wide Card (Seasonal Demand & Dynamic ROP Hub) */}
            <section className="wba-middle-row" aria-label="Demand Forecasting & Reorder Points">
              <SeasonalForecastChart />
            </section>

            {/* Bottom Row: 3 Cards (Ledger ~48%, FIFO ~26%, Audit Trail ~26%) */}
            <section className="wba-bottom-row" aria-label="Operational Execution Panels">
              <RealTimeInventoryLedger onTriggerAudit={handleAddAuditLog} />
              <FifoExpiryQueue />
              <LiveAuditTrail externalLogs={liveLogs} />
            </section>
          </main>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
