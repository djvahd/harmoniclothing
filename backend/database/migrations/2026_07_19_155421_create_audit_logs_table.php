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
     * 4.3_Table_Design.md — audit_logs (log aksi Admin). 5.6_Security_Planning.md
     * §8 / 2.5_Permission_Matrix.md §10: every sensitive Admin action
     * (approve/reject, ban, price changes, manual payment/shipment changes,
     * notification-config changes) always operates on a concrete entity in
     * this codebase, so entity_type/entity_id stay not-null per the table spec.
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->constrained('users')->cascadeOnDelete();
            $table->string('action', 100); // e.g. "order.reject", "creator.approve"
            $table->string('entity_type');
            $table->unsignedBigInteger('entity_id');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
