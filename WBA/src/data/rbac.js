/**
 * WBA Role-Based Access Control (RBAC) Module
 * Reuses the existing accessLevel defined in authAccounts.js:
 * - 'admin'      : Admin (Full administrative access)
 * - 'warehouse'  : Warehouse Staff (Operations, ledger, cycle counts, Fix Count, FIFO)
 * - 'purchasing' : Purchasing Manager (Procurement, POs, suppliers, ROP forecasting)
 * - 'sales'      : Sales Staff (Product availability, pricing, ATP, reservations)
 */

export const PERMISSIONS = {
  ADD_PRODUCT: 'ADD_PRODUCT',
  FIX_COUNT: 'FIX_COUNT',
  VIEW_PURCHASE_HISTORY: 'VIEW_PURCHASE_HISTORY',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  MANAGE_ACCOUNTS: 'MANAGE_ACCOUNTS',
  VIEW_FIFO_QUEUE: 'VIEW_FIFO_QUEUE',
  VIEW_FORECAST_ROP: 'VIEW_FORECAST_ROP',
  VIEW_SUPPLIER_COSTS: 'VIEW_SUPPLIER_COSTS',
};

// Allowed top-level navigation tabs per access level
export const ROLE_TABS = {
  admin: ['dashboard', 'inventory', 'purchase-history', 'audit-logs', 'manage-accounts', 'help-center'],
  warehouse: ['dashboard', 'inventory', 'purchase-history', 'help-center'],
  purchasing: ['dashboard', 'inventory', 'purchase-history', 'audit-logs', 'help-center'],
  sales: ['dashboard', 'inventory', 'help-center'],
};

// Explicit action permissions by accessLevel
const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.ADD_PRODUCT,
    PERMISSIONS.FIX_COUNT,
    PERMISSIONS.VIEW_PURCHASE_HISTORY,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_ACCOUNTS,
    PERMISSIONS.VIEW_FIFO_QUEUE,
    PERMISSIONS.VIEW_FORECAST_ROP,
    PERMISSIONS.VIEW_SUPPLIER_COSTS,
  ],
  warehouse: [
    PERMISSIONS.FIX_COUNT,
    PERMISSIONS.VIEW_PURCHASE_HISTORY, // Can view delivery receipts/ETA
    PERMISSIONS.VIEW_FIFO_QUEUE,
  ],
  purchasing: [
    PERMISSIONS.VIEW_PURCHASE_HISTORY,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_FORECAST_ROP,
    PERMISSIONS.VIEW_SUPPLIER_COSTS,
    PERMISSIONS.VIEW_FIFO_QUEUE,
  ],
  sales: [],
};

/**
 * Check if an accessLevel is permitted to view a given tab
 */
export function isTabAllowed(accessLevel, tab) {
  const allowed = ROLE_TABS[accessLevel] || [];
  return allowed.includes(tab);
}

/**
 * Check if an accessLevel has a specific action permission
 */
export function hasPermission(accessLevel, permission) {
  const perms = ROLE_PERMISSIONS[accessLevel] || [];
  return perms.includes(permission);
}

/**
 * Get fallback tab for an accessLevel if unauthorized tab is visited
 */
export function getDefaultTab(accessLevel) {
  const allowed = ROLE_TABS[accessLevel] || ['dashboard'];
  return allowed[0] || 'dashboard';
}
