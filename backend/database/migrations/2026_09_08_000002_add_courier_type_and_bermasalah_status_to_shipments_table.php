<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Biteship shipping integration: `courier` has meant "courier company"
     * (e.g. "jne") since it was created — booking/rate-checking Biteship
     * needs the service level too (e.g. "reg"), so it gets its own column
     * rather than overloading `courier` with a combined value.
     *
     * `bermasalah` covers Biteship's onHold/rejected/courierNotFound/
     * returned/cancelled/disposed/returnInTransit statuses — see
     * BiteshipWebhookService's status map. Deliberately does NOT touch
     * orders.status (BR-014's state machine) — admin resolves manually,
     * notified via NotificationService.
     */
    public function up(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->string('courier_type', 50)->nullable()->after('courier');
            $table->enum('status', ['menunggu_pickup', 'dikirim', 'delivered', 'bermasalah'])
                ->default('menunggu_pickup')->change();
        });
    }

    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropColumn('courier_type');
            $table->enum('status', ['menunggu_pickup', 'dikirim', 'delivered'])
                ->default('menunggu_pickup')->change();
        });
    }
};
