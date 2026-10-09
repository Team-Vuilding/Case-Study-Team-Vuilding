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
        'account_status', // 'active' | 'deactivated'
        'deactivated_at',
        'deletion_at',
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
            'deactivated_at' => 'datetime',
            'deletion_at' => 'datetime',
        ];
    }

    /**
     * Check if account is currently marked as deactivated.
     */
    public function isDeactivated(): bool
    {
        return $this->account_status === 'deactivated' || ! $this->is_active;
    }

    /**
     * Check if the account's 30-day recovery deadline has passed.
     */
    public function isExpired(): bool
    {
        return $this->isDeactivated() && $this->deletion_at && $this->deletion_at->isPast();
    }

    /**
     * Seconds remaining before permanent deletion.
     */
    public function remainingSeconds(): ?int
    {
        if (! $this->deletion_at) {
            return null;
        }

        return max(0, now()->diffInSeconds($this->deletion_at, false));
    }

    /**
     * Days remaining before permanent deletion.
     */
    public function remainingDays(): ?int
    {
        $seconds = $this->remainingSeconds();
        if ($seconds === null) {
            return null;
        }

        return (int) ceil($seconds / 86400);
    }

    /**
     * Deactivate this account and set the 30-day deletion deadline.
     */
    public function deactivate(int $days = 30): void
    {
        $deactivatedAt = now();
        $this->update([
            'is_active' => false,
            'account_status' => 'deactivated',
            'deactivated_at' => $deactivatedAt,
            'deletion_at' => $deactivatedAt->copy()->addDays($days),
        ]);
    }

    /**
     * Reactivate this account and clear deactivation deadlines.
     */
    public function reactivate(): void
    {
        $this->update([
            'is_active' => true,
            'account_status' => 'active',
            'deactivated_at' => null,
            'deletion_at' => null,
        ]);
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
