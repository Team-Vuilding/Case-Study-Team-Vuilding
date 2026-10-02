<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * User Model
 *
 * Represents an authenticated user in the WBA system.
 * Supported roles based on docs/PROJECT_SCOPE.md:
 * - 'Admin': Full user management, catalog CRUD, approvals, audit logs
 * - 'Warehouse Staff': Receiving/shipping, counts, barcode scanning
 * - 'Purchasing Manager': Suppliers, purchase orders, reorder points
 * - 'Sales Staff': Read-only pricing, catalog, and stock availability
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',         // Admin | Warehouse Staff | Purchasing Manager | Sales Staff
        'department',   // e.g. System & User Management, Warehouse Operations, etc.
        'initials',     // e.g. CV, MC, BV, VA
        'access_level', // admin | warehouse | purchasing | sales
        'avatar',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // ---------------------------------------------------------------------
    // Relationships
    // ---------------------------------------------------------------------

    /**
     * Stock movements recorded by this user.
     */
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * Stock count reconciliation sessions performed by this user.
     */
    public function stockCounts()
    {
        return $this->hasMany(StockCount::class);
    }

    /**
     * Purchase orders created or managed by this user.
     */
    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
