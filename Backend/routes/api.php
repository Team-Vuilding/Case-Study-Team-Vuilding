<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\StockCountController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TypeSafeProxyController;

/*
|--------------------------------------------------------------------------
| REST API Routes for WBA (WalangBrownout Appliances)
|--------------------------------------------------------------------------
|
| These routes define the REST API endpoints connecting the backend to the
| WBA React frontend. No functionality is implemented yet; these serve as
| architectural route definitions with role-access guidelines.
|
| Role Boundaries Reference (from docs/PROJECT_SCOPE.md):
| - Admin: Full access (Users, Catalog CRUD, Approvals, System Logs)
| - Warehouse Staff: Stock In/Out, Counts, Reconcile, Barcode/QR scanning
| - Purchasing Manager: Suppliers, Purchase Orders, Forecasting
| - Sales Staff: Read-only pricing, stock availability, and categories
|
*/

// =========================================================================
// 1. Authentication & Session Endpoints
// =========================================================================
Route::prefix('auth')->group(function () {
    // POST /api/auth/login - Authenticate credentials (email, password) and return token/session
    Route::post('/login', [AuthController::class, 'login']);

    // POST /api/auth/logout - Revoke current user session or token
    Route::post('/logout', [AuthController::class, 'logout']);

    // GET /api/auth/me - Retrieve currently authenticated user profile & role permissions
    Route::get('/me', [AuthController::class, 'me']);
});

// =========================================================================
// 2. Dashboard Endpoints (Role-specific summaries)
// =========================================================================
Route::prefix('dashboard')->group(function () {
    // GET /api/dashboard/metrics - Role-filtered KPIs, alerts, and system summary
    Route::get('/metrics', [DashboardController::class, 'metrics']);

    // GET /api/dashboard/low-stock-alerts - List items below safety stock thresholds
    Route::get('/low-stock-alerts', [DashboardController::class, 'lowStockAlerts']);

    // GET /api/dashboard/pending-approvals - POs or counts awaiting Admin/Manager review
    Route::get('/pending-approvals', [DashboardController::class, 'pendingApprovals']);
});

// =========================================================================
// 3. User Management Endpoints (Admin only)
// =========================================================================
Route::prefix('users')->group(function () {
    // GET /api/users - List all users with their roles (Admin)
    Route::get('/', [UserController::class, 'index']);

    // POST /api/users - Create new user account (Admin)
    Route::post('/', [UserController::class, 'store']);

    // GET /api/users/{id} - Get single user details (Admin)
    Route::get('/{id}', [UserController::class, 'show']);

    // PUT/PATCH /api/users/{id} - Update user profile and role assignment (Admin)
    Route::put('/{id}', [UserController::class, 'update']);

    // DELETE /api/users/{id} - Deactivate or remove user (Admin)
    Route::delete('/{id}', [UserController::class, 'destroy']);

    // GET /api/users/activity-logs - Retrieve user audit activity logs (Admin only)
    Route::get('/activity-logs', [UserController::class, 'activityLogs']);
});

// =========================================================================
// 4. Inventory & Item Catalog Endpoints
// =========================================================================
Route::prefix('items')->group(function () {
    // GET /api/items - Master catalog of items with stock quantities and valuation
    // Authorized: Admin, Warehouse Staff (read), Sales Staff (read)
    Route::get('/', [ItemController::class, 'index']);

    // POST /api/items - Add a new item to catalog (Admin only)
    Route::post('/', [ItemController::class, 'store']);

    // GET /api/items/{id} - Retrieve single item details
    Route::get('/{id}', [ItemController::class, 'show']);

    // PUT/PATCH /api/items/{id} - Update item details, pricing, or metadata (Admin only)
    Route::put('/{id}', [ItemController::class, 'update']);

    // DELETE /api/items/{id} - Remove or archive an item (Admin only)
    Route::delete('/{id}', [ItemController::class, 'destroy']);

    // GET /api/items/valuation - Inventory evaluation, FIFO tracking, and category metrics
    Route::get('/valuation/summary', [ItemController::class, 'valuationSummary']);
});

// =========================================================================
// 5. Category Management Endpoints
// =========================================================================
Route::prefix('categories')->group(function () {
    // GET /api/categories - List item categories (All roles read access)
    Route::get('/', [CategoryController::class, 'index']);

    // POST /api/categories - Create category (Admin only)
    Route::post('/', [CategoryController::class, 'store']);

    // PUT/PATCH /api/categories/{id} - Update category name/description (Admin only)
    Route::put('/{id}', [CategoryController::class, 'update']);

    // DELETE /api/categories/{id} - Delete category (Admin only)
    Route::delete('/{id}', [CategoryController::class, 'destroy']);
});

// =========================================================================
// 6. Warehouse Operations Endpoints (Warehouse Staff / Admin)
// =========================================================================
Route::prefix('warehouse')->group(function () {
    // GET /api/warehouse/movements - Movement history (Stock In / Stock Out)
    Route::get('/movements', [StockMovementController::class, 'index']);

    // POST /api/warehouse/movements - Record new Stock In or Stock Out movement
    Route::post('/movements', [StockMovementController::class, 'store']);

    // POST /api/warehouse/scan - Process barcode / QR code scanning in receiving/shipping
    Route::post('/scan', [StockMovementController::class, 'scanBarcode']);

    // GET /api/warehouse/counts - List physical stock count sessions
    Route::get('/counts', [StockCountController::class, 'index']);

    // POST /api/warehouse/counts - Initiate a new physical count session
    Route::post('/counts', [StockCountController::class, 'store']);

    // POST /api/warehouse/counts/{id}/reconcile - Audit discrepancies & reconcile stock
    Route::post('/counts/{id}/reconcile', [StockCountController::class, 'reconcile']);
});

// =========================================================================
// 7. Purchasing Module Endpoints (Purchasing Manager / Admin)
// =========================================================================
Route::prefix('purchasing')->group(function () {
    // --- Suppliers ---
    // GET /api/purchasing/suppliers - Supplier directory
    Route::get('/suppliers', [SupplierController::class, 'index']);

    // POST /api/purchasing/suppliers - Create supplier profile
    Route::post('/suppliers', [SupplierController::class, 'store']);

    // PUT/PATCH /api/purchasing/suppliers/{id} - Update supplier profile
    Route::put('/suppliers/{id}', [SupplierController::class, 'update']);

    // DELETE /api/purchasing/suppliers/{id} - Remove supplier
    Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy']);

    // --- Purchase Orders ---
    // GET /api/purchasing/purchase-orders - List purchase orders
    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);

    // POST /api/purchasing/purchase-orders - Create purchase order
    Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);

    // GET /api/purchasing/purchase-orders/{id} - Get PO details
    Route::get('/purchase-orders/{id}', [PurchaseOrderController::class, 'show']);

    // PUT /api/purchasing/purchase-orders/{id}/status - Update status (e.g. approve, receive)
    Route::put('/purchase-orders/{id}/status', [PurchaseOrderController::class, 'updateStatus']);

    // GET /api/purchasing/forecasting - Demand forecasting & reorder point suggestions
    Route::get('/forecasting', [PurchaseOrderController::class, 'forecasting']);
});

// =========================================================================
// 8. TypeSafe AI & Scanner Proxy Endpoints (matches frontend WBA calls)
// =========================================================================
Route::prefix('typesafe')->group(function () {
    // POST /api/typesafe/catalog-review - Review proposed catalog additions
    Route::post('/catalog-review', [TypeSafeProxyController::class, 'catalogReview']);

    // POST /api/typesafe/scan-match - Match scanned label/QR against inventory
    Route::post('/scan-match', [TypeSafeProxyController::class, 'scanMatch']);
});
