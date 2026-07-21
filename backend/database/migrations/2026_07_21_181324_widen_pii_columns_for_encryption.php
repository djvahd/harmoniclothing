<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * NFR-011 follow-up (2026-07-21): users.phone and addresses.recipient_name/
 * phone were missed when address_line/kyc_* got the `encrypted` Eloquent
 * cast - encrypted values are far longer than the plaintext (AES-256-CBC +
 * base64 + JSON envelope), so the original VARCHAR(20)/VARCHAR(150) columns
 * would truncate/fail. Widen to TEXT here (new migration per Migration
 * Policy 3.5_Coding_Standards.md - never edit an already-run migration).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('phone')->nullable()->change();
        });

        Schema::table('addresses', function (Blueprint $table) {
            $table->text('recipient_name')->change();
            $table->text('phone')->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->change();
        });

        Schema::table('addresses', function (Blueprint $table) {
            $table->string('recipient_name', 150)->change();
            $table->string('phone', 20)->change();
        });
    }
};
