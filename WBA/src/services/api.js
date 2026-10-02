/**
 * WBA REST API Service Client
 * 
 * Provides centralized REST API integration between the React frontend (WBA)
 * and the Laravel backend API.
 * 
 * Guides:
 * - When Vite proxy is active, calls use relative path '/api/...'
 * - If running on separate origins, fallback to VITE_API_BASE_URL (http://127.0.0.1:8000/api)
 * - Sanctum token or session cookies can be attached automatically
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Core HTTP Request Wrapper
 */
export async function apiRequest(endpoint, { method = 'GET', body = null, headers = {} } = {}) {
  const token = localStorage.getItem('wba_auth_token');

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    config.body = JSON.stringify(body);
  }

  // Ensure clean URL joining
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `API request failed with status ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json();
}

/**
 * 1. Authentication REST API Endpoints
 */
export const authApi = {
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),
};

/**
 * 2. Dashboard Metrics Endpoints
 */
export const dashboardApi = {
  getMetrics: () => apiRequest('/dashboard/metrics'),
  getLowStockAlerts: () => apiRequest('/dashboard/low-stock-alerts'),
  getPendingApprovals: () => apiRequest('/dashboard/pending-approvals'),
};

/**
 * 3. User Management Endpoints (Admin)
 */
export const userApi = {
  getUsers: () => apiRequest('/users'),
  createUser: (userData) => apiRequest('/users', { method: 'POST', body: userData }),
  getUser: (id) => apiRequest(`/users/${id}`),
  updateUser: (id, userData) => apiRequest(`/users/${id}`, { method: 'PUT', body: userData }),
  deleteUser: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
  getActivityLogs: () => apiRequest('/users/activity-logs'),
};

/**
 * 4. Item Catalog & Inventory Endpoints
 */
export const itemApi = {
  getItems: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/items${query ? `?${query}` : ''}`);
  },
  createItem: (itemData) => apiRequest('/items', { method: 'POST', body: itemData }),
  getItem: (id) => apiRequest(`/items/${id}`),
  updateItem: (id, itemData) => apiRequest(`/items/${id}`, { method: 'PUT', body: itemData }),
  deleteItem: (id) => apiRequest(`/items/${id}`, { method: 'DELETE' }),
  getValuationSummary: () => apiRequest('/items/valuation/summary'),
};

/**
 * 5. Category Management Endpoints
 */
export const categoryApi = {
  getCategories: () => apiRequest('/categories'),
  createCategory: (categoryData) => apiRequest('/categories', { method: 'POST', body: categoryData }),
  updateCategory: (id, categoryData) => apiRequest(`/categories/${id}`, { method: 'PUT', body: categoryData }),
  deleteCategory: (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),
};

/**
 * 6. Warehouse Operations Endpoints
 */
export const warehouseApi = {
  getMovements: () => apiRequest('/warehouse/movements'),
  recordMovement: (movementData) => apiRequest('/warehouse/movements', { method: 'POST', body: movementData }),
  scanBarcode: (scanData) => apiRequest('/warehouse/scan', { method: 'POST', body: scanData }),
  getCounts: () => apiRequest('/warehouse/counts'),
  createCount: (countData) => apiRequest('/warehouse/counts', { method: 'POST', body: countData }),
  reconcile: (countId, adjustments) => apiRequest(`/warehouse/counts/${countId}/reconcile`, { method: 'POST', body: adjustments }),
};

/**
 * 7. Purchasing Module Endpoints
 */
export const purchasingApi = {
  getSuppliers: () => apiRequest('/purchasing/suppliers'),
  createSupplier: (supplierData) => apiRequest('/purchasing/suppliers', { method: 'POST', body: supplierData }),
  getPurchaseOrders: () => apiRequest('/purchasing/purchase-orders'),
  createPurchaseOrder: (poData) => apiRequest('/purchasing/purchase-orders', { method: 'POST', body: poData }),
  updatePoStatus: (poId, statusData) => apiRequest(`/purchasing/purchase-orders/${poId}/status`, { method: 'PUT', body: statusData }),
  getForecasts: () => apiRequest('/purchasing/forecasting'),
};

export default {
  auth: authApi,
  dashboard: dashboardApi,
  users: userApi,
  items: itemApi,
  categories: categoryApi,
  warehouse: warehouseApi,
  purchasing: purchasingApi,
};
