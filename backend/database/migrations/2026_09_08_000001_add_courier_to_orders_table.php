<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Biteship shipping integration: courier is now chosen by the customer
     * at checkout (rate-checked server-side) rather than by the admin at
     * booking time — see BiteshipService::getRates().
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('courier_company', 50)->nullable()->after('shipping_cost');
            $table->string('courier_type', 50)->nullable()->after('courier_company');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['courier_company', 'courier_type']);
        });
    }
};
