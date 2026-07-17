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
     * 4.3_Table_Design.md — payments (transaksi Midtrans per order).
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('midtrans_transaction_id', 100)->nullable();
            $table->string('method', 50)->nullable();
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['belum_dibayar', 'berhasil', 'gagal'])->default('belum_dibayar');
            $table->timestamp('paid_at')->nullable();
            $table->json('raw_response')->nullable(); // payload webhook Midtrans
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
