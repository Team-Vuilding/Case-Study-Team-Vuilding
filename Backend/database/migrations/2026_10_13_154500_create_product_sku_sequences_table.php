<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_sku_sequences', function (Blueprint $table) {
            $table->string('prefix', 12)->primary();
            $table->unsignedBigInteger('next_number')->default(1);
        });
        foreach (['WBA-EXP-', 'WBA-NEX-'] as $prefix) {
            $maximum = 0;
            DB::table('items')->select('id', 'sku')->where('sku', 'like', $prefix.'%')
                ->chunkById(500, function ($items) use ($prefix, &$maximum) {
                    foreach ($items as $item) {
                        $suffix = substr($item->sku, strlen($prefix));
                        if (ctype_digit($suffix) && strlen($suffix) <= 12) {
                            $maximum = max($maximum, (int) $suffix);
                        }
                    }
                });
            DB::table('product_sku_sequences')->insert(['prefix' => $prefix, 'next_number' => $maximum + 1]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_sku_sequences');
    }
};
