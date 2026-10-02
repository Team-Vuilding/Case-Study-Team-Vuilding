<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for item catalog (SQLite compatible).
     * Reflects the enterprise properties from PROJECT_SCOPE.md and frontend WBA data.
     */
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();                          // e.g. WBA-AC-INV-15
            $table->string('name');                                   // e.g. Portable Inverter AC 1.5HP
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('category_classification')->default('A');  // A, B, C
            $table->string('fsn')->default('Normal');                 // Fast, Slow, Non-moving
            $table->decimal('unit_price', 12, 2)->default(0.00);      // Selling price
            $table->decimal('storage_cost_per_month', 10, 2)->default(0.00);
            $table->boolean('is_seasonal')->default(false);
            $table->json('season_months')->nullable();                // e.g. ["April", "May"]
            $table->integer('lead_time_days')->default(14);
            $table->integer('avg_daily_demand_off_peak')->default(0);
            $table->integer('avg_daily_demand_peak')->default(0);
            $table->integer('safety_stock_off_peak')->default(0);
            $table->integer('safety_stock_peak')->default(0);
            $table->integer('physical_on_hand')->default(0);          // Physical stock in warehouse
            $table->integer('reserved')->default(0);                  // Active checkout holds
            $table->integer('allocated')->default(0);                 // Assigned pick lists
            $table->integer('paper_spreadsheet_count')->default(0);
            $table->integer('shelf_life_months')->nullable();         // Perishable / shelf life
            $table->string('warehouse_bin')->nullable();              // e.g. BAY-01 (Bulk Pallet Rack)
            $table->string('status')->default('Optimal Stock');
            $table->string('status_severity')->default('success');    // success, warning, error
            $table->string('product_line')->nullable();               // e.g. Climate Control
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
