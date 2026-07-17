<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 4.3_Table_Design.md — users cluster: adds phone/status/role/consent
     * timestamps on top of Laravel's default users table (name/email/password
     * already exist from the base migration, which is never edited directly
     * per 3.5_Coding_Standards.md's Migration Policy).
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->after('email_verified_at');
            $table->string('status', 20)->default('aktif')->after('phone');
            $table->string('role', 20)->default('customer')->after('status');
            $table->timestamp('privacy_accepted_at')->nullable()->after('role');
            $table->timestamp('terms_accepted_at')->nullable()->after('privacy_accepted_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'status', 'role', 'privacy_accepted_at', 'terms_accepted_at']);
        });
    }
};
