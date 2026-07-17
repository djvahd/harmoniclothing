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
     * 4.3_Table_Design.md — creator_profiles (KYC & status Creator, 1:1
     * opsional). `slug` added beyond spec: 5.2_API_List.md GET
     * /marketplace/creators/{slug} needs a route key, same reasoning as
     * products.slug/designs.slug.
     */
    public function up(): void
    {
        Schema::create('creator_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('slug', 180)->unique();
            $table->text('kyc_full_name')->nullable(); // encrypted cast — NFR-011
            $table->text('kyc_id_number')->nullable(); // encrypted cast — NFR-011
            $table->enum('status', ['menunggu_approval', 'aktif', 'ditolak', 'nonaktif', 'banned'])->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('creator_profiles');
    }
};
