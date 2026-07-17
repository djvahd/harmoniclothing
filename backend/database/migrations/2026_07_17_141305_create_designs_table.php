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
     * 4.3_Table_Design.md — designs (desain yang diunggah Creator). `slug`
     * is added beyond the table spec: 5.2_API_List.md routes
     * GET /marketplace/designs/{slug}, same pattern as products.slug.
     */
    public function up(): void
    {
        Schema::create('designs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title', 150);
            $table->string('slug', 180)->unique();
            $table->text('description')->nullable();
            $table->string('file_path'); // R2, max 20MB PNG/SVG — 1.5 Bagian 9
            $table->string('thumbnail_path');
            $table->enum('status', ['draft', 'menunggu_approval', 'aktif', 'ditolak'])->default('draft'); // BR-002/028
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
        Schema::dropIfExists('designs');
    }
};
