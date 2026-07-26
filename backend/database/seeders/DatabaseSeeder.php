<?php

namespace Database\Seeders;

use App\Models\CreatorProfile;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Fixed test accounts (stable credentials, password: "password") so
        // every seed run gives the same login for each role instead of
        // random fake emails.
        User::factory()->admin()->create([
            'name' => 'Admin Harmoni',
            'email' => 'admin@harmoni.test',
        ]);

        $creatorUser = User::factory()->create([
            'name' => 'Creator Harmoni',
            'email' => 'creator@harmoni.test',
        ]);
        CreatorProfile::factory()->aktif()->for($creatorUser, 'user')->create([
            'brand_name' => 'Harmoni Creator Studio',
            'bio' => 'Akun creator tetap untuk keperluan testing.',
        ]);

        $this->call(CatalogSeeder::class);
        $this->call(BulkPricingTierSeeder::class);
        $this->call(NotificationSettingSeeder::class);
    }
}
