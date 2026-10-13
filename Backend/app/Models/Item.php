<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

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
        'paper_spreadsheet_count' => 'integer',
        'archived_at' => 'datetime',
        'has_batch_stock' => 'boolean',
        'has_batch_history' => 'boolean',
        'report_count' => 'integer',
        'lead_time_days' => 'integer',
    ];

    public function scopeActive(Builder $query): void
    {
        $query->whereNull('archived_at');
    }

    public function scopeWithArchiveEligibility(Builder $query): void
    {
        $query->select('items.*')->selectRaw('EXISTS (SELECT 1 FROM batches WHERE batches.item_id = items.id AND batches.quantity > 0) as has_batch_stock')
            ->selectRaw('EXISTS (SELECT 1 FROM batches WHERE batches.item_id = items.id) as has_batch_history')
            ->withCount(['inventoryReports as report_count'])
            ->withExists(['stockMovements as has_movements', 'purchaseOrderItems as has_order_history', 'countRecords as has_count_history',
                'purchaseOrderItems as has_open_orders' => fn (Builder $lines) => $lines->whereHas('purchaseOrder', fn (Builder $orders) => $orders->whereIn('status', ['draft', 'pending_approval', 'approved']))]);
    }

    public function hasStockBalance(): bool
    {
        return $this->physical_on_hand !== 0 || $this->paper_spreadsheet_count !== 0 || $this->reserved !== 0 || $this->allocated !== 0;
    }

    public function archiveBlockReason(): ?string
    {
        if ($this->archived_at) {
            return 'This product is already archived.';
        }
        if ($this->hasStockBalance()) {
            return 'Stock, ledger count, reservations, and picking allocations must be zero.';
        }
        if ($this->has_batch_stock ?? DB::table('batches')->where('item_id', $this->id)->where('quantity', '>', 0)->exists()) {
            return 'Resolve remaining batch stock before archiving.';
        }
        if ($this->has_open_orders ?? $this->purchaseOrderItems()->whereHas('purchaseOrder', fn (Builder $orders) => $orders->whereIn('status', ['draft', 'pending_approval', 'approved']))->exists()) {
            return 'Finish or cancel open purchase orders before archiving.';
        }

        return null;
    }

    public function canDeletePermanently(): bool
    {
        return ! $this->hasStockBalance()
            && ! ($this->has_movements ?? $this->stockMovements()->exists())
            && ! ($this->has_order_history ?? $this->purchaseOrderItems()->exists())
            && ! ($this->has_count_history ?? $this->countRecords()->exists())
            && ($this->report_count ?? $this->inventoryReports()->count()) === 0
            && ! ($this->has_batch_history ?? DB::table('batches')->where('item_id', $this->id)->exists());
    }

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

    public function inventoryReports(): HasMany
    {
        return $this->hasMany(InventoryReport::class);
    }
}
