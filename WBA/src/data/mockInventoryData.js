/**
 * WalangBrownout Appliances (WBA) - Inventory Data Store
 * 
 * Mock dataset emptied to start with a clean zero-state.
 * Live data should be populated from the backend REST API endpoints.
 */

// Master Inventory Items (Empty initial state)
export const INITIAL_INVENTORY_ITEMS = [];

// Perishable Batches & Expiry Queue (Empty initial state)
export const INITIAL_FILTER_BATCHES = [];

// Seasonal Demand Profiles (Empty initial state)
export const SEASONAL_DEMAND_PROFILES = [];

// Audit Trail & Activity Logs (Empty initial state)
export const INITIAL_AUDIT_LOGS = [];

// Dashboard Overview Summary Metrics (Zeroed initial state)
export const DASHBOARD_METRICS = {
  holdingCosts: {
    totalMonthlyCost: 0,
    excessHoldingFees: 0,
    warehouseCapacityUsedPercent: 0,
    overstockUnits: 0,
    tag: 'Warehouse Utilization & Holding Cost',
    trend: 'No active stock',
    severity: 'info',
  },
  shrinkageStatus: {
    unresolvedDiscrepancyUnits: 0,
    atRiskRevenue: 0,
    ghostInventorySkus: 0,
    onlineOversellIncidentsPrevented: 0,
    tag: 'Discrepancy & Shrinkage Control',
    trend: 'No discrepancies',
    severity: 'info',
  },
  expiryStatus: {
    batchesNearDegradation: 0,
    unitsAtRisk: 0,
    historicalDegradationLoss: 0,
    potentialWriteOffProtected: 0,
    enforcementMode: 'FIFO / FEFO Enforced',
    tag: 'Perishable Shelf-Life Monitor',
    trend: 'No expiring batches',
    severity: 'info',
  },
};
