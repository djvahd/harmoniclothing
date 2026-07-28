<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Category;
use App\Models\CreatorProfile;
use App\Models\Design;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

/** Local dev demo data for Product Catalog & Marketplace (no admin/creator upload UI yet). */
class CatalogSeeder extends Seeder
{
    /**
     * $testCustomer and $fixedCreator are the fixed test accounts from
     * DatabaseSeeder. Recycling orders/designs onto them (plus a small
     * sample pool) keeps demo data attached to real logins instead of
     * spawning a brand-new throwaway user per order (audit report §3.2/§3.3).
     */
    public function run(User $testCustomer, User $fixedCreator): void
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

        // Sample customer pool (fixed test account + a handful of extras) so
        // the ~75 "sold" orders below attach to a small, recognizable set of
        // users instead of a brand-new random user per order (§3.3).
        $customers = User::factory()->count(6)->create()->push($testCustomer);
        $addresses = Address::factory()->count(6)->recycle($customers)->create();

        // Completed orders against random variants give products a real
        // sold_count/rating_average — without this every card would show
        // "0 terjual" and no rating.
        Order::factory()
            ->count(30)
            ->recycle($customers)
            ->recycle($addresses)
            ->state(['status' => 'selesai'])
            ->create()
            ->each(function (Order $order) use ($products) {
                foreach (range(1, random_int(1, 2)) as $ignored) {
                    $variant = $products->random()->variants()->inRandomOrder()->first();
                    $item = OrderItem::factory()->for($order, 'order')->for($variant, 'productVariant')->create();

                    if (fake()->boolean(60)) {
                        // The reviewer is whoever bought the item — also
                        // sidesteps ReviewFactory's own unrecycled
                        // User::factory() spawning another throwaway user.
                        Review::factory()->for($item, 'orderItem')->create(['user_id' => $order->user_id]);
                    }
                }
            });

        // Active Creator profiles with a real brand_name — without these the
        // Creator tab of Marketplace Desain is permanently empty (only
        // status=aktif profiles are publicly listed) and designs fall back
        // to a plain fake user name instead of a brand.
        $creators = CreatorProfile::factory()
            ->aktif()
            ->count(7)
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

        // Every design gets at least one apparel attached so starting_price
        // ("Mulai dari Rp ...") is never null, plus a few tags for filters.
        $attachDesignExtras = function (Design $design) use ($products, $tags) {
            $design->products()->attach(
                $products->random(random_int(1, 3))->pluck('id'),
                ['preview_confirmed_at' => now()]
            );
            $design->tags()->attach($tags->random(random_int(0, 3))->pluck('id'));
        };

        $designs = Design::factory()
            ->count(12)
            ->recycle($designCategories)
            ->recycle($creatorUsers)
            ->create()
            ->each($attachDesignExtras);

        // Deterministically give the fixed creator@harmoni.test account a
        // few designs of its own — leaving this to chance via recycle() risks
        // it landing with zero designs and Kelola Desain/Statistik staying
        // empty (audit report §3.2).
        $fixedCreatorDesigns = Design::factory()
            ->count(3)
            ->for($fixedCreator, 'creator')
            ->recycle($designCategories)
            ->create()
            ->each($attachDesignExtras);

        $designs = $designs->concat($fixedCreatorDesigns);

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
                $order = Order::factory()->recycle($customers)->recycle($addresses)->state(['status' => 'selesai'])->create();
                $item = OrderItem::factory()
                    ->for($order, 'order')
                    ->for($variant, 'productVariant')
                    ->create(['design_id' => $design->id]);

                if ($i === 1 || fake()->boolean(70)) {
                    Review::factory()->for($item, 'orderItem')->create(['user_id' => $order->user_id]);
                }
            }
        }
    }
}
