<?php

use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\ReferenceController;
use App\Http\Controllers\Api\StockCountController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
Route::post('auth/reactivate', [AuthController::class, 'reactivate'])->middleware('throttle:6,1');
Route::middleware('access')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::post('auth/deactivate', [AuthController::class, 'deactivate']);
    Route::get('items', [ItemController::class, 'items']);
    Route::get('items/{item}', [ItemController::class, 'item'])->whereNumber('item');
    Route::get('dashboard/metrics', [DashboardController::class, 'metrics']);
    Route::get('dashboard/alerts', [DashboardController::class, 'alerts']);
    Route::get('dashboard/activity', [DashboardController::class, 'activity']);
    Route::get('categories', [ReferenceController::class, 'references'])->defaults('kind', 'categories');
});
Route::middleware('access:admin')->group(function () {
    Route::get('audit-logs', [AuditController::class, 'audits']);
    Route::get('items/archived', [ItemController::class, 'archived']);
    Route::post('items/{item}/archive', [ItemController::class, 'archive'])->whereNumber('item');
    Route::post('items/{item}/restore', [ItemController::class, 'restore'])->whereNumber('item');
    Route::get('users', [UserController::class, 'users']);
    Route::get('users/activity-logs', [AuditController::class, 'audits']);
    Route::post('users', [UserController::class, 'saveUser']);
    Route::put('users/{user}', [UserController::class, 'saveUser'])->whereNumber('user');
    Route::delete('users/{user}', [UserController::class, 'deactivateUser'])->whereNumber('user');
    Route::post('users/{user}/reactivate', [UserController::class, 'reactivateUser'])->whereNumber('user');
    Route::post('items', [ItemController::class, 'saveItem']);
    Route::put('items/{item}', [ItemController::class, 'saveItem'])->whereNumber('item');
    Route::delete('items/{item}', [ItemController::class, 'deleteItem'])->whereNumber('item');
    Route::post('categories', [ReferenceController::class, 'saveReference'])->defaults('kind', 'categories');
    Route::put('categories/{id}', [ReferenceController::class, 'saveReference'])->defaults('kind', 'categories')->whereNumber('id');
    Route::delete('categories/{id}', [ReferenceController::class, 'deleteReference'])->defaults('kind', 'categories')->whereNumber('id');
});
Route::middleware('access:admin,warehouse')->group(function () {
    Route::get('warehouse/movements', [StockMovementController::class, 'movements']);
    Route::get('warehouse/counts', [StockCountController::class, 'counts']);
    Route::post('warehouse/items/{item}/reconcile', [StockCountController::class, 'reconcile'])->whereNumber('item');
});
Route::middleware('access:warehouse')->group(function () {
    Route::post('warehouse/movements', [StockMovementController::class, 'stock']);
    Route::post('warehouse/scan', [StockMovementController::class, 'scan']);
});
Route::middleware('access:admin,warehouse,purchasing')->group(function () {
    Route::get('batches', [DashboardController::class, 'batches']);
    Route::get('purchasing/purchase-orders', [PurchaseOrderController::class, 'orders']);
    Route::put('purchasing/purchase-orders/{id}/status', [PurchaseOrderController::class, 'orderStatus'])->whereNumber('id');
});
Route::middleware('access:admin,purchasing')->group(function () {
    Route::get('purchasing/suppliers', [ReferenceController::class, 'references'])->defaults('kind', 'suppliers');
    Route::post('purchasing/suppliers', [ReferenceController::class, 'saveReference'])->defaults('kind', 'suppliers');
    Route::put('purchasing/suppliers/{id}', [ReferenceController::class, 'saveReference'])->defaults('kind', 'suppliers')->whereNumber('id');
    Route::delete('purchasing/suppliers/{id}', [ReferenceController::class, 'deleteReference'])->defaults('kind', 'suppliers')->whereNumber('id');
    Route::post('purchasing/purchase-orders', [PurchaseOrderController::class, 'createOrder']);
});
