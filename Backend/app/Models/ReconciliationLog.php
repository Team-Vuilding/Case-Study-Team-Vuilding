<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * ReconciliationLog Model
 *
 * Audit trail for approved inventory discrepancy reconciliations.
 * Ensures all quantity adjustments have full traceability.
 */
class ReconciliationLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'stock_count_id',
        'item_id',
        'user_id',            // Approving user / Admin
        'previous_quantity',
        'adjusted_quantity',
        'variance',
        'reason',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'previous_quantity' => 'integer',
        'adjusted_quantity' => 'integer',
        'variance' => 'integer',
    ];

    // ---------------------------------------------------------------------
    // Relationships
    // ---------------------------------------------------------------------

    public function stockCount()
    {
        return $this->belongsTo(StockCount::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
