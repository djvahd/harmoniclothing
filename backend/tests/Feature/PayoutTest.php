<?php

namespace Tests\Feature;

use App\Models\Commission;
use App\Models\CreatorProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** BR-007 (revised 2026-10-16): creator commission payout is manual, done by Admin. */
class PayoutTest extends TestCase
{
    use RefreshDatabase;

    private function owed(CreatorProfile $profile, int $amount): Commission
    {
        return Commission::factory()->for($profile->user, 'creator')->create(['status' => 'terhutang', 'amount' => $amount]);
    }

    public function test_customer_cannot_see_or_use_payouts(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/admin/payouts')->assertForbidden();
        $this->actingAs($user)->postJson('/api/admin/payouts/1', ['reference' => 'TRF-1'])->assertForbidden();
    }

    public function test_admin_sees_unpaid_commissions_grouped_per_creator(): void
    {
        config(['business.creator_payout_minimum' => 50000]);
        $admin = User::factory()->admin()->create();
        $rich = CreatorProfile::factory()->aktif()->create();
        $small = CreatorProfile::factory()->aktif()->create();
        $this->owed($rich, 40000);
        $this->owed($rich, 30000);
        $this->owed($small, 10000);

        $rows = $this->actingAs($admin)->getJson('/api/admin/payouts')->assertOk()->json('data');

        $this->assertCount(2, $rows);
        $this->assertSame($rich->user_id, $rows[0]['creator_id']);
        $this->assertSame('70000.00', $rows[0]['total_owed']);
        $this->assertTrue($rows[0]['meets_minimum']);
        $this->assertFalse($rows[1]['meets_minimum']);
    }

    public function test_admin_marks_a_creators_commissions_paid_with_a_reference(): void
    {
        config(['business.creator_payout_minimum' => 50000]);
        $admin = User::factory()->admin()->create();
        $profile = CreatorProfile::factory()->aktif()->create();
        $a = $this->owed($profile, 40000);
        $b = $this->owed($profile, 30000);

        $this->actingAs($admin)->postJson("/api/admin/payouts/{$profile->user_id}", ['reference' => 'TRF-BCA-0001'])
            ->assertOk()
            ->assertJsonPath('data.count', 2)
            ->assertJsonPath('data.total', '70000.00');

        foreach ([$a, $b] as $c) {
            $this->assertSame('dibayar', $c->fresh()->status);
            $this->assertSame('TRF-BCA-0001', $c->fresh()->payout_reference);
            $this->assertNotNull($c->fresh()->paid_at);
        }
        $this->assertDatabaseHas('audit_logs', ['action' => 'payout.paid', 'actor_id' => $admin->id]);
        $this->assertDatabaseHas('notifications', ['user_id' => $profile->user_id, 'type' => 'payout.paid']);
    }

    public function test_payout_below_the_minimum_is_rejected(): void
    {
        config(['business.creator_payout_minimum' => 50000]);
        $admin = User::factory()->admin()->create();
        $profile = CreatorProfile::factory()->aktif()->create();
        $commission = $this->owed($profile, 10000);

        $this->actingAs($admin)->postJson("/api/admin/payouts/{$profile->user_id}", ['reference' => 'TRF-1'])
            ->assertUnprocessable()->assertJsonValidationErrors('creator');

        $this->assertSame('terhutang', $commission->fresh()->status);
    }

    public function test_payout_needs_a_destination_and_a_reference(): void
    {
        config(['business.creator_payout_minimum' => 50000]);
        $admin = User::factory()->admin()->create();
        $profile = CreatorProfile::factory()->create(['payout_method' => null, 'payout_account_number' => null]);
        $this->owed($profile, 100000);

        $this->actingAs($admin)->postJson("/api/admin/payouts/{$profile->user_id}", ['reference' => 'TRF-1'])
            ->assertUnprocessable()->assertJsonValidationErrors('creator');
        $this->actingAs($admin)->postJson("/api/admin/payouts/{$profile->user_id}", [])
            ->assertUnprocessable()->assertJsonValidationErrors('reference');
    }

    public function test_paying_twice_does_not_pay_again(): void
    {
        config(['business.creator_payout_minimum' => 50000]);
        $admin = User::factory()->admin()->create();
        $profile = CreatorProfile::factory()->aktif()->create();
        $this->owed($profile, 100000);

        $this->actingAs($admin)->postJson("/api/admin/payouts/{$profile->user_id}", ['reference' => 'TRF-1'])->assertOk();
        $this->actingAs($admin)->postJson("/api/admin/payouts/{$profile->user_id}", ['reference' => 'TRF-2'])->assertUnprocessable();
    }
}
