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
     * 4.3_Table_Design.md — design_product (pivot: apparel kompatibel per
     * desain).
     */
    public function up(): void
    {
        Schema::create('design_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('design_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamp('preview_confirmed_at')->nullable(); // FR-037
            $table->timestamps();

            $table->unique(['design_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('design_product');
    }
};
