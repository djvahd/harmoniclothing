<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Admin-managed discount codes (#98). Redemptions are not counted in a
     * column: they are derived from non-cancelled orders, so cancelling an
     * order frees its quota without any counter to keep in sync.
     */
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();
            $table->string('type', 20); // nominal | percent | free_shipping
            $table->decimal('value', 12, 2)->default(0); // Rp for nominal, 1-100 for percent, unused for free_shipping
            $table->decimal('max_discount', 12, 2)->nullable(); // cap for percent / free_shipping
            $table->decimal('min_subtotal', 12, 2)->default(0);
            $table->unsignedInteger('quota')->nullable(); // total redemptions; null = unlimited
            $table->dateTime('starts_at')->nullable();
            $table->dateTime('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('voucher_id')->nullable()->after('courier_type')->constrained('vouchers')->nullOnDelete();
            $table->decimal('discount_amount', 12, 2)->default(0)->after('shipping_cost');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('voucher_id');
            $table->dropColumn('discount_amount');
        });

        Schema::dropIfExists('vouchers');
    }
};
