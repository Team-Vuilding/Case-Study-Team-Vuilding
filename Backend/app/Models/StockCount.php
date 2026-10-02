<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * StockCount Model
 *
 * Represents physical stock count audits and inventory reconciliation sessions.
 * Allows Warehouse Staff to record manual counts and identify discrepancies
 * against recorded system quantities.
 */
class StockCount extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'count_reference', // e.g. AUDIT-2026-Q1
        'user_id',         // Warehouse staff conducting the count
        'status',          // 'in_progress', 'completed', 'reconciled'
        'started_at',
        'completed_at',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // ---------------------------------------------------------------------
    // Relationship Placeholders (No functionality yet)
    // ---------------------------------------------------------------------

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(StockCountItem::class);
    }

    public function reconciliationLogs()
    {
        return $this->hasMany(ReconciliationLog::class);
    }
}
