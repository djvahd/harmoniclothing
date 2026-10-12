<?php

namespace Tests\Feature;

use App\Models\Commission;
use App\Models\CreatorProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** BR-007 (2026-07-22 revision): automatic weekly creator commission payout. */
class PayoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_commissions_below_the_minimum_are_not_paid(): void
    {
        config(['business.creator_payout_minimum' => 50000]);
        $profile = CreatorProfile::factory()->aktif()->create();
        $commission = Commission::factory()->for($profile->user, 'creator')->create([
            'status' => 'terhutang', 'amount' => 10000,
        ]);

        $this->artisan('commissions:payout')->assertExitCode(0);

        $this->assertSame('terhutang', $commission->fresh()->status);
    }

    public function test_eligible_commissions_stay_pending_without_a_payout_destination(): void
    {
        config(['business.creator_payout_minimum' => 50000]);
        $profile = CreatorProfile::factory()->create(); // no payout_method set
        $commission = Commission::factory()->for($profile->user, 'creator')->create([
            'status' => 'terhutang', 'amount' => 100000,
        ]);

        $this->artisan('commissions:payout');

        $this->assertSame('terhutang', $commission->fresh()->status);
    }

    public function test_eligible_commissions_stay_pending_without_a_disbursement_provider_configured(): void
    {
        config(['business.creator_payout_minimum' => 50000, 'services.disbursement.api_key' => null]);
        $profile = CreatorProfile::factory()->aktif()->create(); // has payout_method/account from the factory state
        $commission = Commission::factory()->for($profile->user, 'creator')->create([
            'status' => 'terhutang', 'amount' => 100000,
        ]);

        $this->artisan('commissions:payout');

        $this->assertSame('terhutang', $commission->fresh()->status);
        $this->assertNull($commission->fresh()->payout_reference);
    }

    public function test_eligible_commissions_are_paid_once_a_provider_is_configured(): void
    {
        config(['business.creator_payout_minimum' => 50000, 'services.disbursement.api_key' => 'test-key']);
        $profile = CreatorProfile::factory()->aktif()->create();
        $commission = Commission::factory()->for($profile->user, 'creator')->create([
            'status' => 'terhutang', 'amount' => 100000,
        ]);

        $this->artisan('commissions:payout');

        $fresh = $commission->fresh();
        $this->assertSame('dibayar', $fresh->status);
        $this->assertNotNull($fresh->paid_at);
        $this->assertNotNull($fresh->payout_reference);
    }
}
