<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for physical stock counts and discrepancy reconciliation logs.
     */
    public function up(): void
    {
        // 1. Stock Count Sessions
        Schema::create('stock_counts', function (Blueprint $table) {
            $table->id();
            $table->string('count_reference')->unique();        // e.g. COUNT-2026-001
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('in_progress');   // in_progress, completed, reconciled
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 2. Count Item Line Records
        Schema::create('stock_count_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_count_id')->constrained('stock_counts')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('items')->cascadeOnDelete();
            $table->integer('system_quantity')->default(0);
            $table->integer('counted_quantity')->default(0);
            $table->integer('variance')->default(0);            // counted - system
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 3. Reconciliation Logs
        Schema::create('reconciliation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_count_id')->constrained('stock_counts')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('items')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('previous_quantity');
            $table->integer('adjusted_quantity');
            $table->integer('variance');
            $table->string('reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reconciliation_logs');
        Schema::dropIfExists('stock_count_items');
        Schema::dropIfExists('stock_counts');
    }
};
