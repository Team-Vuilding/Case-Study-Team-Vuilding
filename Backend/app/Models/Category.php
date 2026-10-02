<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Category Model
 *
 * Represents item categories (e.g., Category A - High Value, Category B, Category C)
 * and product groupings in the WBA inventory catalog.
 *
 * Authorization:
 * - Admin: Full CRUD
 * - Warehouse / Purchasing / Sales: Read-only
 */
class Category extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',         // e.g. "Category A - High Turnover", "Climate Control"
        'code',         // e.g. "CAT-A", "CC"
        'description',  // Optional summary of category criteria
    ];

    // ---------------------------------------------------------------------
    // Relationship Placeholders (No functionality yet)
    // ---------------------------------------------------------------------

    /**
     * Items belonging to this category.
     */
    public function items()
    {
        return $this->hasMany(Item::class);
    }
}
