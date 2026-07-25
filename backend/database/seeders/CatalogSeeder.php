<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CreatorProfile;
use App\Models\Design;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\Tag;
use Illuminate\Database\Seeder;

/** Local dev demo data for Product Catalog & Marketplace (no admin/creator upload UI yet). */
class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $productCategories = Category::factory()->product()->count(3)->create();
        $designCategories = Category::factory()->design()->count(3)->create();

        $products = Product::factory()
            ->count(10)
            ->recycle($productCategories)
            ->create()
            ->each(function (Product $product) {
                // Distinct colors per product sidestep the (product_id, color,
                // size, cut_type) unique constraint — ProductVariantFactory's
                // independent random draws occasionally collide otherwise.
                ProductVariant::factory()
                    ->count(3)
                    ->for($product)
                    ->sequence(['color' => 'Hitam'], ['color' => 'Putih'], ['color' => 'Navy'])
                    ->create();
            });

        // Completed orders against random variants give products a real
        // sold_count/rating_average — without this every card would show
        // "0 terjual" and no rating.
        Order::factory()
            ->count(30)
            ->state(['status' => 'selesai'])
            ->create()
            ->each(function (Order $order) use ($products) {
                foreach (range(1, random_int(1, 2)) as $ignored) {
                    $variant = $products->random()->variants()->inRandomOrder()->first();
                    $item = OrderItem::factory()->for($order, 'order')->for($variant, 'productVariant')->create();

                    if (fake()->boolean(60)) {
                        Review::factory()->for($item, 'orderItem')->create();
                    }
                }
            });

        // Active Creator profiles with a real brand_name — without these the
        // Creator tab of Marketplace Desain is permanently empty (only
        // status=aktif profiles are publicly listed) and designs fall back
        // to a plain fake user name instead of a brand.
        $creators = CreatorProfile::factory()
            ->aktif()
            ->count(8)
            ->state(fn () => [
                'brand_name' => fake()->unique()->company(),
                'bio' => fake()->sentence(12),
            ])
            ->create();
        $creatorUsers = $creators->map(fn (CreatorProfile $c) => $c->user);

        $tags = Tag::factory()
            ->count(10)
            ->state(fn () => ['name' => ucfirst(fake()->unique()->word())])
            ->create();

        $designs = Design::factory()
            ->count(15)
            ->recycle($designCategories)
            ->recycle($creatorUsers)
            ->create()
            ->each(function (Design $design) use ($products, $tags) {
                // Every design gets at least one apparel attached so
                // starting_price ("Mulai dari Rp ...") is never null.
                $design->products()->attach(
                    $products->random(random_int(1, 3))->pluck('id'),
                    ['preview_confirmed_at' => now()]
                );
                $design->tags()->attach($tags->random(random_int(0, 3))->pluck('id'));
            });

        // Completed orders against every design give them a real
        // sold_count/rating_average too, same reasoning as the products
        // block above — otherwise design cards show a blank row. The first
        // order's item always gets a review so rating_average is never
        // null for any design, not just sold_count.
        foreach ($designs as $design) {
            $variant = $design->products()->inRandomOrder()->first()?->variants()->inRandomOrder()->first();
            if (! $variant) {
                continue;
            }

            foreach (range(1, random_int(1, 3)) as $i) {
                $order = Order::factory()->state(['status' => 'selesai'])->create();
                $item = OrderItem::factory()
                    ->for($order, 'order')
                    ->for($variant, 'productVariant')
                    ->create(['design_id' => $design->id]);

                if ($i === 1 || fake()->boolean(70)) {
                    Review::factory()->for($item, 'orderItem')->create();
                }
            }
        }
    }
}
