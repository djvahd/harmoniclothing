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
     * FE-038 — per-notification-type on/off switch, checked by
     * NotificationService::notify() before creating+broadcasting. A type
     * with no row here defaults to enabled (opt-out, not opt-in), so every
     * notification type already firing throughout the app keeps working
     * without needing to be pre-seeded here.
     */
    public function up(): void
    {
        Schema::create('notification_settings', function (Blueprint $table) {
            $table->id();
            $table->string('notification_type', 50)->unique();
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_settings');
    }
};
