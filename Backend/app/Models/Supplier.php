<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Supplier Model
 *
 * Supplier directory tracking profiles, contact info, lead times,
 * and associated procurement catalogs.
 *
 * Authorization:
 * - Purchasing Manager & Admin: Full access
 * - Warehouse Staff / Sales: Restricted
 */
class Supplier extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'code',             // e.g. SUP-001
        'contact_person',
        'email',
        'phone',
        'address',
        'payment_terms',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ---------------------------------------------------------------------
    // Relationship Placeholders (No functionality yet)
    // ---------------------------------------------------------------------

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
