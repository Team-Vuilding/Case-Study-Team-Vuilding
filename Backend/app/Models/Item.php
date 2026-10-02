<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Item Model (Inventory Catalog Master)
 *
 * Represents catalog items, stock quantities, and valuation metadata.
 * Stores the persistent inventory catalog and stock balances.
 *
 * Authorization:
 * - Admin: Full catalog CRUD and pricing adjustments
 * - Warehouse Staff: Read-only for catalog; quantity updates only via traceable movements/counts
 * - Sales Staff: Read-only pricing, catalog, and availability
 */
class Item extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'sku',
        'name',
        'category_id',
        'category_classification', // 'A', 'B', 'C'
        'fsn',                     // 'Fast', 'Slow', 'Non-moving'
        'unit_price',
        'storage_cost_per_month',
        'is_seasonal',
        'season_months',           // JSON array: e.g. ["April", "May"]
        'lead_time_days',
        'avg_daily_demand_off_peak',
        'avg_daily_demand_peak',
        'safety_stock_off_peak',
        'safety_stock_peak',
        'physical_on_hand',
        'reserved',
        'allocated',
        'paper_spreadsheet_count',
        'shelf_life_months',
        'warehouse_bin',
        'status',
        'status_severity',
        'product_line',
    ];

    /**
     * Attribute casting.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_seasonal' => 'boolean',
        'season_months' => 'array',
        'unit_price' => 'decimal:2',
        'storage_cost_per_month' => 'decimal:2',
        'physical_on_hand' => 'integer',
        'reserved' => 'integer',
        'allocated' => 'integer',
        'lead_time_days' => 'integer',
    ];

    // ---------------------------------------------------------------------
    // Relationships
    // ---------------------------------------------------------------------

    /**
     * Category this item belongs to.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Movement history (stock in / stock out) for this item.
     */
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * Physical count auditing logs for this item.
     */
    public function countRecords()
    {
        return $this->hasMany(StockCountItem::class);
    }

    /**
     * Purchase order lines referencing this item.
     */
    public function purchaseOrderItems()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
