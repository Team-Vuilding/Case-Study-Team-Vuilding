<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * PurchaseOrder Model
 *
 * Manages procurement orders, reorder point replenishments,
 * and high-value budget approvals.
 *
 * Authorization:
 * - Purchasing Manager: Create and manage POs, configure reorder points
 * - Admin: High-value approvals, budgets, demand forecasts
 * - Warehouse Staff: Linked receiving movements only
 */
class PurchaseOrder extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'po_number',          // e.g. PO-2026-0001
        'supplier_id',
        'user_id',            // Created by Purchasing Manager
        'approved_by_id',     // Approved by Admin (for high value)
        'status',             // 'draft', 'pending_approval', 'approved', 'received', 'cancelled'
        'order_date',
        'expected_delivery_date',
        'total_amount',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'order_date' => 'date',
        'expected_delivery_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    // ---------------------------------------------------------------------
    // Relationship Placeholders (No functionality yet)
    // ---------------------------------------------------------------------

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by_id');
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
