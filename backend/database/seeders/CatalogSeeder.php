<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Design;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

/** Local dev demo data for Product Catalog & Marketplace (no admin/creator upload UI yet). */
class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $productCategories = Category::factory()->product()->count(3)->create();
        $designCategories = Category::factory()->design()->count(3)->create();

        Product::factory()
            ->count(10)
            ->recycle($productCategories)
            ->create()
            ->each(function (Product $product) {
                ProductVariant::factory()->count(3)->for($product)->create();
            });

        Design::factory()->count(15)->recycle($designCategories)->create();
    }
}
