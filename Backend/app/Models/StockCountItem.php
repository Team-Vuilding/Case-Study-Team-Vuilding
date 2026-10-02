<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * StockCountItem Model
 *
 * Records individual item counts during a physical count session,
 * tracking system quantity vs. physical count and calculated variance.
 */
class StockCountItem extends Model
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
        'system_quantity',   // Quantity in system when count started
        'counted_quantity',  // Physical quantity counted
        'variance',          // counted - system
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'system_quantity' => 'integer',
        'counted_quantity' => 'integer',
        'variance' => 'integer',
    ];

    // ---------------------------------------------------------------------
    // Relationship Placeholders (No functionality yet)
    // ---------------------------------------------------------------------

    public function stockCount()
    {
        return $this->belongsTo(StockCount::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
