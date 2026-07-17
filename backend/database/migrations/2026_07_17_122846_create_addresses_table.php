<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 4.3_Table_Design.md — addresses (Address Book, FR-048).
     */
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('label', 50);
            $table->string('recipient_name', 150);
            $table->string('phone', 20);
            $table->string('province', 100);
            $table->string('city', 100);
            $table->string('district', 100);
            $table->string('postal_code', 10);
            $table->text('address_line'); // encrypted cast on the model — NFR-011
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
