<?php

namespace App\Models;

use Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * 4.3_Table_Design.md — product_variants (kombinasi warna/ukuran/potongan +
 * mockup 3D).
 */
#[Fillable([
    'product_id', 'color', 'size', 'cut_type', 'print_areas', 'material',
    'price_modifier', 'mockup_asset_path',
])]
class ProductVariant extends Model
{
    /** @use HasFactory<ProductVariantFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'price_modifier' => 'decimal:2',
            'print_areas' => 'array',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
