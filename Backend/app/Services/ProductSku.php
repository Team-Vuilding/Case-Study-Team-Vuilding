<?php

namespace App\Services;

use App\Models\Item;
use Illuminate\Support\Facades\DB;

class ProductSku
{
    public function preview(bool $hasShelfLife): string
    {
        $prefix = $hasShelfLife ? 'WBA-EXP-' : 'WBA-NEX-';

        return $this->format($prefix, $this->nextNumber($prefix));
    }

    /** Allocate inside the product creation transaction so failures roll back the counter. */
    public function allocate(bool $hasShelfLife): string
    {
        $prefix = $hasShelfLife ? 'WBA-EXP-' : 'WBA-NEX-';
        $number = $this->nextNumber($prefix, true);
        DB::table('product_sku_sequences')->where('prefix', $prefix)->update(['next_number' => $number + 1]);

        return $this->format($prefix, $number);
    }

    private function nextNumber(string $prefix, bool $lock = false): int
    {
        $query = DB::table('product_sku_sequences')->where('prefix', $prefix);
        if ($lock) {
            $query->lockForUpdate();
        }
        $number = (int) $query->value('next_number');
        while (Item::where('sku', $this->format($prefix, $number))->exists()) {
            $number++;
        }

        return $number;
    }

    private function format(string $prefix, int $number): string
    {
        return $prefix.str_pad((string) $number, 3, '0', STR_PAD_LEFT);
    }
}
