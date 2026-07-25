<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Design;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
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

        Design::factory()
            ->count(15)
            ->recycle($designCategories)
            ->create()
            ->each(function (Design $design) use ($products) {
                $design->products()->attach(
                    $products->random(random_int(1, 3))->pluck('id'),
                    ['preview_confirmed_at' => now()]
                );
            });
    }
}
