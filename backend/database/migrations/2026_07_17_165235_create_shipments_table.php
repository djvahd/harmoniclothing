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
     * 4.3_Table_Design.md — shipments (data pengiriman & resi Biteship).
     */
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('biteship_order_id')->nullable();
            $table->string('courier')->nullable();
            $table->string('tracking_number')->nullable();
            $table->enum('status', ['menunggu_pickup', 'dikirim', 'delivered'])->default('menunggu_pickup');
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable(); // trigger BR-014
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
