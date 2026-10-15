<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Keep the Snap redirect URL so a customer who left the payment page can
     * resume paying (Midtrans rejects a second Snap transaction for the same
     * order_id, so the first URL must be reused, not regenerated).
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->text('snap_redirect_url')->nullable()->after('method');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('snap_redirect_url');
        });
    }
};
