<?php

namespace App\Models;

use App\Enums\UserStatus;
use Database\Factories\CartItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 4.3_Table_Design.md — cart_items (isi keranjang, harga terkunci BR-025).
 */
#[Fillable([
    'user_id', 'product_variant_id', 'design_id', 'custom_design_file_path',
    'design_position', 'quantity', 'notes', 'unit_price_snapshot',
])]
class CartItem extends Model
{
    /** @use HasFactory<CartItemFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'design_position' => 'array',
            'unit_price_snapshot' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function design(): BelongsTo
    {
        return $this->belongsTo(Design::class);
    }

    /**
     * BR-024: an item can be bought only while its product is active and, for a
     * marketplace design, while that design is live and its creator not banned.
     */
    public function isAvailable(): bool
    {
        if (! $this->productVariant->product->is_active) {
            return false;
        }

        if ($this->design_id === null) {
            return true;
        }

        $design = $this->design;

        return $design !== null
            && $design->status === 'aktif'
            && $design->creator?->status !== UserStatus::Banned;
    }

    public function subtotal(): string
    {
        return bcmul((string) $this->unit_price_snapshot, (string) $this->quantity, 2);
    }
}
