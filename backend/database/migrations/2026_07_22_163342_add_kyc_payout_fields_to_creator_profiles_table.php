<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Expands the "sederhana" KYC (FR-035/BR-008) into a fuller flow per an
 * explicit product decision (2026-07-22): full identity + payout details,
 * a guardian branch for Creators under 18, and public-facing brand/bio
 * fields on the become-creator step. BR-007 also changes here from manual
 * to automatic payout — payout_method/account fields are the disbursement
 * destination the weekly payout job reads.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('creator_profiles', function (Blueprint $table) {
            // Ajukan Jadi Creator (public-facing, not encrypted — shown on the public profile).
            $table->string('brand_name', 150)->nullable()->after('slug');
            $table->text('bio')->nullable()->after('brand_name');
            $table->string('portfolio_url', 255)->nullable()->after('bio');
            $table->timestamp('terms_accepted_at')->nullable()->after('portfolio_url');

            // Verifikasi Data Diri — identity (encrypted per NFR-011 pattern).
            $table->date('birth_date')->nullable()->after('kyc_id_number');
            $table->text('address')->nullable()->after('birth_date'); // encrypted
            $table->string('ktp_photo_path', 255)->nullable()->after('address'); // private disk, not public URL

            // Payout destination (BR-007 automatic disbursement).
            $table->enum('payout_method', ['bank_transfer', 'gopay', 'ovo', 'dana', 'shopeepay'])
                ->nullable()->after('ktp_photo_path');
            $table->text('payout_account_number')->nullable()->after('payout_method'); // encrypted
            $table->text('payout_account_holder')->nullable()->after('payout_account_number'); // encrypted

            // Guardian branch — required only when the Creator is under 18 at submission time.
            $table->text('guardian_name')->nullable()->after('payout_account_holder'); // encrypted
            $table->text('guardian_id_number')->nullable()->after('guardian_name'); // encrypted
            $table->timestamp('guardian_consent_at')->nullable()->after('guardian_id_number');
        });
    }

    public function down(): void
    {
        Schema::table('creator_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'brand_name', 'bio', 'portfolio_url', 'terms_accepted_at',
                'birth_date', 'address', 'ktp_photo_path',
                'payout_method', 'payout_account_number', 'payout_account_holder',
                'guardian_name', 'guardian_id_number', 'guardian_consent_at',
            ]);
        });
    }
};
