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
     * 4.3_Table_Design.md — cart_items (isi keranjang, harga terkunci BR-025).
     */
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('design_id')->nullable()->constrained()->nullOnDelete(); // null = mode custom
            $table->string('custom_design_file_path')->nullable(); // mode custom — FR-010
            $table->json('design_position')->nullable(); // posisi/rotasi/ukuran di editor
            $table->unsignedInteger('quantity');
            $table->text('notes')->nullable(); // FR-013/019
            $table->decimal('unit_price_snapshot', 12, 2); // BR-025
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
