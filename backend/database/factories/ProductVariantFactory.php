<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    private const COLORS = ['Hitam', 'Putih', 'Navy', 'Merah', 'Abu-abu'];

    private const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

    private const CUT_TYPES = ['Regular Fit', 'Oversize'];

    /** (color, size, cut_type) combos already claimed per product_id, seeded from the DB on first use. */
    private array $claimedCombos = [];

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'color' => fake()->randomElement(self::COLORS),
            'size' => fake()->randomElement(self::SIZES),
            'cut_type' => fake()->randomElement(self::CUT_TYPES),
            'print_areas' => fake()->randomElements(['depan', 'belakang', 'lengan'], fake()->numberBetween(1, 3)),
            'material' => fake()->randomElement(['Cotton Combed 24s', 'Cotton Combed 30s', 'Fleece']),
            'price_modifier' => 0,
            'mockup_asset_path' => $this->placeholderMockupPath(),
        ];
    }

    /**
     * Seed data has no real admin-uploaded photo (that flow didn't exist until
     * FE-046), so point every fake variant at one shared checked-in placeholder
     * image instead of a fabricated path nothing ever wrote to disk — the
     * latter 403'd through Next's image optimizer on every product card/detail
     * page site-wide.
     */
    private function placeholderMockupPath(): string
    {
        $disk = config('filesystems.public_disk');
        $relativePath = 'mockups/placeholder.png';

        if (! Storage::disk($disk)->exists($relativePath)) {
            Storage::disk($disk)->put(
                $relativePath,
                file_get_contents(__DIR__.'/../seeders/assets/product-placeholder.png')
            );
        }

        return $relativePath;
    }

    /**
     * definition() draws color/size/cut_type independently, so two variants for the
     * same product can roll the same triple and violate the DB unique constraint on
     * product_variants(product_id, color, size, cut_type). afterMaking runs once per
     * model in the batch — with product_id already resolved via for()/relations — and
     * before any row is saved, so it's the first point we can detect and fix a clash.
     */
    public function configure(): static
    {
        return $this->afterMaking(function (ProductVariant $variant) {
            $this->avoidDuplicateCombo($variant);
        });
    }

    private function avoidDuplicateCombo(ProductVariant $variant): void
    {
        $productId = $variant->product_id;

        if (! isset($this->claimedCombos[$productId])) {
            $this->claimedCombos[$productId] = ProductVariant::query()
                ->where('product_id', $productId)
                ->get(['color', 'size', 'cut_type'])
                ->map(fn ($v) => $this->comboKey($v->color, $v->size, $v->cut_type))
                ->all();
        }

        $key = $this->comboKey($variant->color, $variant->size, $variant->cut_type);

        if (! in_array($key, $this->claimedCombos[$productId], true)) {
            $this->claimedCombos[$productId][] = $key;

            return;
        }

        $available = (new Collection(self::COLORS))
            ->crossJoin(self::SIZES, self::CUT_TYPES)
            ->map(fn (array $combo) => array_combine(['color', 'size', 'cut_type'], $combo))
            ->reject(fn (array $combo) => in_array(
                $this->comboKey($combo['color'], $combo['size'], $combo['cut_type']),
                $this->claimedCombos[$productId],
                true
            ));

        if ($available->isEmpty()) {
            // All 50 combos already claimed for this product — extremely unlikely in
            // practice; leave as-is and let the DB constraint surface the real problem.
            return;
        }

        $combo = $available->random();

        $variant->forceFill($combo);

        $this->claimedCombos[$productId][] = $this->comboKey($combo['color'], $combo['size'], $combo['cut_type']);
    }

    private function comboKey(string $color, string $size, string $cutType): string
    {
        return "{$color}|{$size}|{$cutType}";
    }
}
