/**
 * WalangBrownout Appliances (WBA) - Enterprise Inventory Management & Logistics Engine
 * Real-time operational data tracking:
 * - Dynamic Demand & Capacity Optimization
 * - Multi-State Inventory Reconciliation (On-Hand, Reserved, Allocated, Available-to-Promise)
 * - Perishable Lot & Batch Shelf-Life Management (FIFO / FEFO Enforcement)
 */

export const INITIAL_INVENTORY_ITEMS = [
  {
    id: 'SKU-AC-101',
    sku: 'WBA-AC-INV-15',
    name: 'Portable Inverter AC 1.5HP',
    category: 'A', // High Value / High Turnover in Peak Season
    fsn: 'Fast', // High velocity during hot season, low velocity off-season
    unitPrice: 18500,
    storageCostPerMonth: 850, // Cubic footprint storage cost per unit
    isSeasonal: true,
    seasonMonths: ['April', 'May', 'June', 'July'],
    leadTimeDays: 21,
    avgDailyDemandOffPeak: 4,
    avgDailyDemandPeak: 38, // Demand peak velocity
    safetyStockOffPeak: 20,
    safetyStockPeak: 180,
    // Real-Time Warehouse State:
    physicalOnHand: 340, // High stock holding in warehouse
    reserved: 12,        // Active customer checkout holds
    allocated: 18,       // Pick list assigned to warehouse team
    paperSpreadsheetCount: 340,
    shelfLifeMonths: null, // Non-perishable
    warehouseBin: 'BAY-01 (Bulk Pallet Rack)',
    status: 'High Holding Cost',
    statusSeverity: 'warning',
    productLine: 'Climate Control',
  },
  {
    id: 'SKU-TH-202',
    sku: 'WBA-SMT-TH-PRO',
    name: 'Smart Climate Thermostat v2',
    category: 'A', // High Value Electronics
    fsn: 'Normal',
    unitPrice: 6200,
    storageCostPerMonth: 95,
    isSeasonal: false,
    seasonMonths: [],
    leadTimeDays: 14,
    avgDailyDemandOffPeak: 6,
    avgDailyDemandPeak: 7,
    safetyStockOffPeak: 25,
    safetyStockPeak: 25,
    // Real-Time Ledger Reconciliation:
    physicalOnHand: 12,  // Actual verified physical count on shelf
    reserved: 18,        // Orders placed online awaiting fulfillment
    allocated: 15,       // Dispatched picking orders
    paperSpreadsheetCount: 45, // Disconnected spreadsheet record
    shelfLifeMonths: null,
    warehouseBin: 'SEC-A2 (High Security Cage)',
    status: 'Stock Discrepancy',
    statusSeverity: 'critical',
    productLine: 'Smart Home Automation',
  },
  {
    id: 'SKU-AP-303',
    sku: 'WBA-PUR-H13-AIR',
    name: 'Medical-Grade Air Purifier H13',
    category: 'B', // Moderate Value
    fsn: 'Normal',
    unitPrice: 8900,
    storageCostPerMonth: 220,
    isSeasonal: false,
    seasonMonths: [],
    leadTimeDays: 18,
    avgDailyDemandOffPeak: 8,
    avgDailyDemandPeak: 12,
    safetyStockOffPeak: 30,
    safetyStockPeak: 45,
    physicalOnHand: 68,
    reserved: 8,
    allocated: 12,
    paperSpreadsheetCount: 68,
    shelfLifeMonths: null,
    warehouseBin: 'RACK-B4 (Zone 2 High-Bay)',
    status: 'Optimal Inventory',
    statusSeverity: 'good',
    productLine: 'Air Quality Solutions',
  },
  {
    id: 'SKU-FL-404',
    sku: 'WBA-CF-FLT-9M',
    name: 'Active Carbon Replacement Filter',
    category: 'C', // High Velocity Consumable / Strictly Shelf-Life Dependent
    fsn: 'Fast',
    unitPrice: 1250,
    storageCostPerMonth: 35,
    isSeasonal: false,
    seasonMonths: [],
    leadTimeDays: 10,
    avgDailyDemandOffPeak: 15,
    avgDailyDemandPeak: 22,
    safetyStockOffPeak: 50,
    safetyStockPeak: 60,
    physicalOnHand: 142,
    reserved: 24,
    allocated: 16,
    paperSpreadsheetCount: 142,
    shelfLifeMonths: 9, // Carbon lining degrades at 9 months
    warehouseBin: 'SHELF-C1 (FIFO Gravity Flow Rack)',
    status: 'Degradation Alert',
    statusSeverity: 'critical',
    productLine: 'Consumables & Spares',
  },
];

/**
 * Filter Batches for FIFO / FEFO Queue Engine
 * Prevents stock degradation and write-offs
 */
export const INITIAL_FILTER_BATCHES = [
  {
    batchId: 'LOT-2025-08-A',
    sku: 'WBA-CF-FLT-9M',
    receivedDate: '2025-09-10',
    currentAgeMonths: 8.2, // Degrades at 9.0 months
    maxShelfLifeMonths: 9.0,
    quantityRemaining: 34,
    binLocation: 'Rear Bin C-01 (Mandatory First-Pick)',
    status: 'Critical Expiry Risk',
    daysUntilDegraded: 24,
    writeOffRiskValue: 42500, // 34 units * ₱1,250
    dispatchPriority: 1, // Enforced FIFO priority
  },
  {
    batchId: 'LOT-2025-11-B',
    sku: 'WBA-CF-FLT-9M',
    receivedDate: '2025-11-20',
    currentAgeMonths: 5.9,
    maxShelfLifeMonths: 9.0,
    quantityRemaining: 48,
    binLocation: 'Mid Bin C-02',
    status: 'Moderate Aging',
    daysUntilDegraded: 93,
    writeOffRiskValue: 60000,
    dispatchPriority: 2,
  },
  {
    batchId: 'LOT-2026-03-C',
    sku: 'WBA-CF-FLT-9M',
    receivedDate: '2026-03-02',
    currentAgeMonths: 1.5,
    maxShelfLifeMonths: 9.0,
    quantityRemaining: 60,
    binLocation: 'Front Bin C-03 (Reserved for Stage 2)',
    status: 'Fresh Inventory',
    daysUntilDegraded: 225,
    writeOffRiskValue: 75000,
    dispatchPriority: 3,
  },
];

/**
 * Seasonal Demand Profile (Month-by-Month) for AC Units
 * Demonstrates demand spikes, dynamic reorder thresholds, and warehouse holding costs
 */
export const SEASONAL_DEMAND_PROFILES = [
  { month: 'Jan', demand: 90, actualOrders: 88, holdingCost: 12500, stockLevel: 280, surgeIndex: 0.8 },
  { month: 'Feb', demand: 110, actualOrders: 105, holdingCost: 11200, stockLevel: 250, surgeIndex: 0.9 },
  { month: 'Mar', demand: 220, actualOrders: 230, holdingCost: 9800, stockLevel: 210, surgeIndex: 1.4 },
  { month: 'Apr', demand: 580, actualOrders: 610, holdingCost: 8200, stockLevel: 190, surgeIndex: 2.8 },
  { month: 'May', demand: 920, actualOrders: 950, holdingCost: 6500, stockLevel: 120, surgeIndex: 3.5 },
  { month: 'Jun', demand: 1450, actualOrders: 1450, holdingCost: 2100, stockLevel: 45, surgeIndex: 4.5, isPeakMonth: true },
  { month: 'Jul', demand: 1200, actualOrders: 1150, holdingCost: 4500, stockLevel: 150, surgeIndex: 3.8 },
  { month: 'Aug', demand: 420, actualOrders: 380, holdingCost: 48500, stockLevel: 920, surgeIndex: 1.3, isExcessStock: true },
  { month: 'Sep', demand: 180, actualOrders: 170, holdingCost: 46200, stockLevel: 880, surgeIndex: 0.9 },
  { month: 'Oct', demand: 110, actualOrders: 100, holdingCost: 44100, stockLevel: 840, surgeIndex: 0.7 },
  { month: 'Nov', demand: 85, actualOrders: 80, holdingCost: 42000, stockLevel: 800, surgeIndex: 0.6 },
  { month: 'Dec', demand: 70, actualOrders: 65, holdingCost: 39500, stockLevel: 760, surgeIndex: 0.5 },
];

/**
 * Real-Time Event Audit Stream
 * Continuous transactional logging replacing manual batch spreadsheet logs
 */
export const INITIAL_AUDIT_LOGS = [
  {
    id: 'LOG-8841',
    timestamp: '10:44:12 AM',
    eventType: 'DISCREPANCY_ALERT',
    severity: 'critical',
    actor: 'Floor Scanner #04 (Jane D.)',
    sku: 'WBA-SMT-TH-PRO',
    description: 'Physical scan verified 12 units on shelf SEC-A2 vs 45 on legacy spreadsheet. Discrepancy logged: -33 units.',
    actionTaken: 'Available-to-Promise (ATP) locked to 0. Online sales halted for SKU-TH-202.',
  },
  {
    id: 'LOG-8840',
    timestamp: '10:32:05 AM',
    eventType: 'FIFO_DISPATCH_LOCK',
    severity: 'warning',
    actor: 'WMS Dispatch Optimizer',
    sku: 'WBA-CF-FLT-9M',
    description: 'Front pallet pick override blocked on Bin C-03. System routed picker to Rear Bin C-01 (Batch LOT-2025-08-A, 8.2 mo shelf age).',
    actionTaken: 'Enforced FIFO picking sequence. ₱42,500 inventory degradation prevented.',
  },
  {
    id: 'LOG-8839',
    timestamp: '09:55:18 AM',
    eventType: 'DYNAMIC_ROP_TRIGGER',
    severity: 'info',
    actor: 'Automated Replenishment Engine',
    sku: 'WBA-AC-INV-15',
    description: 'Seasonal demand coefficient applied (3.5x multiplier). Recommended replenishment: 750 units staggered over 60 days.',
    actionTaken: 'Draft Purchase Order #WBA-PO-2026-55 queued for review. Bulk panic-order restriction active.',
  },
  {
    id: 'LOG-8838',
    timestamp: '09:15:40 AM',
    eventType: 'REALTIME_RESERVATION',
    severity: 'info',
    actor: 'E-Commerce Gateway',
    sku: 'WBA-PUR-H13-AIR',
    description: 'Customer cart reservation locked 4 units for 15 minutes. ATP updated from 52 to 48.',
    actionTaken: 'Real-time sync broadcast to picking handhelds.',
  },
  {
    id: 'LOG-8837',
    timestamp: '08:30:22 AM',
    eventType: 'CYCLE_COUNT_VERIFIED',
    severity: 'good',
    actor: 'Auditor Lead (Mark R.)',
    sku: 'WBA-PUR-H13-AIR',
    description: 'Cycle count completed for RACK-B4. 68 on-hand matched ledger with 0 variance.',
    actionTaken: 'Confidence index updated to 100%.',
  },
];

/**
 * Enterprise KPI Summary
 */
export const DASHBOARD_METRICS = {
  holdingCosts: {
    totalMonthlyCost: 84200,
    excessHoldingFees: 48500, // Off-season holding penalties
    warehouseCapacityUsedPercent: 88,
    overstockUnits: 340,
    tag: 'Warehouse Utilization & Holding Cost',
    trend: '+34% vs Q1 Benchmark',
    severity: 'warning',
  },
  shrinkageStatus: {
    unresolvedDiscrepancyUnits: 33, // 45 recorded - 12 physically on-hand
    atRiskRevenue: 204600, // 33 * ₱6,200
    ghostInventorySkus: 1,
    onlineOversellIncidentsPrevented: 14,
    tag: 'Discrepancy & Shrinkage Control',
    trend: 'Real-Time Sync Active',
    severity: 'critical',
  },
  expiryStatus: {
    batchesNearDegradation: 1, // Batch LOT-2025-08-A
    unitsAtRisk: 34,
    historicalDegradationLoss: 15000,
    potentialWriteOffProtected: 42500,
    enforcementMode: 'FIFO / FEFO Enforced',
    tag: 'Perishable Shelf-Life Monitor',
    trend: '24 Days Remaining on Oldest Batch',
    severity: 'critical',
  },
};
