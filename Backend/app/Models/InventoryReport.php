<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryReport extends Model
{
    protected $fillable = ['item_id', 'user_id', 'actor', 'kind', 'message', 'recorded_quantity', 'ledger_quantity', 'counted_quantity'];

    protected function casts(): array
    {
        return ['recorded_quantity' => 'integer', 'ledger_quantity' => 'integer', 'counted_quantity' => 'integer'];
    }
}
