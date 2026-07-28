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
        // Fixed test accounts (stable credentials, password: "password") so
        // every seed run gives the same login for each role instead of
        // random fake emails. CatalogSeeder and DemoDataSeeder attach real
        // demo data to these three instead of only creating random users.
        $customer = User::factory()->create([
            'name' => 'Customer Harmoni',
            'email' => 'test@example.com',
        ]);

        $admin = User::factory()->admin()->create([
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

        $this->call(CatalogSeeder::class, parameters: [
            'testCustomer' => $customer,
            'fixedCreator' => $creatorUser,
        ]);
        $this->call(BulkPricingTierSeeder::class);
        $this->call(NotificationSettingSeeder::class);
        $this->call(DemoDataSeeder::class, parameters: [
            'customer' => $customer,
            'admin' => $admin,
            'creatorUser' => $creatorUser,
        ]);
    }
}
