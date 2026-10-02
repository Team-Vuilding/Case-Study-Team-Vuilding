<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for Stock Movements (Stock In / Stock Out).
     * Traceable receiving and shipping movements with barcode / QR capture.
     */
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type');                            // 'stock_in' | 'stock_out'
            $table->integer('quantity');
            $table->string('reference_number')->nullable();    // PO number or dispatch ID
            $table->string('scanned_barcode')->nullable();     // Captured during QR/barcode scan
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
