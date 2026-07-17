<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    /**
     * 4.3_Table_Design.md — bulk_pricing_tiers (BR-012). Deliberately no
     * product_id/category_id — global scheme, same for all products (MVP
     * simplification per the table design's own note).
     */
    public function up(): void
    {
        Schema::create('bulk_pricing_tiers', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('min_qty');
            $table->unsignedInteger('max_qty')->nullable(); // null = tanpa batas atas
            $table->decimal('price_per_unit', 12, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bulk_pricing_tiers');
    }
};
