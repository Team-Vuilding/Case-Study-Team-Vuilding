<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * StockMovement Model
 *
 * Tracks traceable receiving and shipping movements (Stock In / Stock Out).
 * Required by PROJECT_SCOPE.md to ensure all inventory updates are auditable.
 *
 * Authorization:
 * - Warehouse Staff & Admin: Process stock movements and scan barcodes/QRs
 * - Sales / Purchasing: Read-only access or restricted
 */
class StockMovement extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'item_id',
        'user_id',
        'type',             // 'stock_in' | 'stock_out'
        'quantity',
        'reference_number', // e.g. PO-2026-001 or DISPATCH-8942
        'scanned_barcode',  // Recorded during barcode/QR scan workflow
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'integer',
    ];

    // ---------------------------------------------------------------------
    // Relationship Placeholders (No functionality yet)
    // ---------------------------------------------------------------------

    /**
     * Item affected by this movement.
     */
    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * Warehouse staff or user who executed the movement.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
