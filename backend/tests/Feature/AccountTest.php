<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * 5.2_API_List.md §2 — /account/profile & /account/addresses (FR-004/FR-048).
 */
class AccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_account_endpoints(): void
    {
        $this->getJson('/api/account/addresses')->assertUnauthorized();
    }

    public function test_user_can_update_own_profile(): void
    {
        $user = User::factory()->create(['name' => 'Old Name']);

        $this->actingAs($user)
            ->patchJson('/api/account/profile', ['name' => 'New Name', 'phone' => '081234567890'])
            ->assertOk()
            ->assertJsonPath('data.name', 'New Name');

        $this->assertSame('New Name', $user->fresh()->name);
        $this->assertSame('081234567890', $user->fresh()->phone);
    }

    public function test_user_can_upload_a_profile_photo(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/account/photo', ['file' => UploadedFile::fake()->image('me.jpg')]);

        $response->assertOk();
        $this->assertNotNull($user->fresh()->photo_path);
        $this->assertNotNull($response->json('data.photo_url'));
    }

    public function test_profile_photo_upload_rejects_wrong_mimetype(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/account/photo', ['file' => UploadedFile::fake()->create('resume.pdf', 100, 'application/pdf')])
            ->assertUnprocessable();
    }

    public function test_profile_photo_upload_rejects_oversized_file(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/account/photo', ['file' => UploadedFile::fake()->create('me.jpg', 5121, 'image/jpeg')])
            ->assertUnprocessable();
    }

    public function test_user_can_remove_their_profile_photo(): void
    {
        Storage::fake('public');
        $path = UploadedFile::fake()->image('me.jpg')->store('profile-photos', 'public');
        $user = User::factory()->create(['photo_path' => $path]);

        $this->actingAs($user)
            ->deleteJson('/api/account/photo')
            ->assertOk()
            ->assertJsonPath('data.photo_url', null);

        $this->assertNull($user->fresh()->photo_path);
    }

    public function test_first_address_is_forced_default_regardless_of_input(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/account/addresses', [
            'label' => 'Rumah',
            'recipient_name' => 'Budi',
            'phone' => '081234567890',
            'province' => 'DKI Jakarta',
            'city' => 'Jakarta Selatan',
            'district' => 'Kebayoran Baru',
            'postal_code' => '12180',
            'address_line' => 'Jl. Contoh No. 1',
            'is_default' => false,
        ]);

        $response->assertCreated()->assertJsonPath('data.is_default', true);
    }

    public function test_setting_a_new_default_address_clears_the_previous_one(): void
    {
        $user = User::factory()->create();
        $first = Address::factory()->for($user)->create(['is_default' => true]);

        $response = $this->actingAs($user)->postJson('/api/account/addresses', [
            'label' => 'Kantor',
            'recipient_name' => 'Budi',
            'phone' => '081234567890',
            'province' => 'DKI Jakarta',
            'city' => 'Jakarta Pusat',
            'district' => 'Gambir',
            'postal_code' => '10110',
            'address_line' => 'Jl. Contoh No. 2',
            'is_default' => true,
        ]);

        $response->assertCreated()->assertJsonPath('data.is_default', true);
        $this->assertFalse($first->fresh()->is_default);
    }

    public function test_deleting_the_default_address_promotes_another(): void
    {
        $user = User::factory()->create();
        $older = Address::factory()->for($user)->create(['is_default' => true]);
        $newer = Address::factory()->for($user)->create(['is_default' => false]);

        $this->actingAs($user)
            ->deleteJson("/api/account/addresses/{$older->id}")
            ->assertOk();

        $this->assertTrue($newer->fresh()->is_default);
    }

    public function test_user_cannot_modify_another_users_address(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $address = Address::factory()->for($owner)->create();

        $this->actingAs($intruder)
            ->patchJson("/api/account/addresses/{$address->id}", [
                'label' => 'Hacked',
                'recipient_name' => 'X',
                'phone' => '080000000000',
                'province' => 'X',
                'city' => 'X',
                'district' => 'X',
                'postal_code' => '00000',
                'address_line' => 'X',
            ])
            ->assertNotFound();

        $this->actingAs($intruder)
            ->deleteJson("/api/account/addresses/{$address->id}")
            ->assertNotFound();
    }

    public function test_user_can_list_only_their_own_addresses(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Address::factory()->for($user)->count(2)->create();
        Address::factory()->for($other)->create();

        $response = $this->actingAs($user)->getJson('/api/account/addresses');

        $response->assertOk()->assertJsonCount(2, 'data');
    }
}
