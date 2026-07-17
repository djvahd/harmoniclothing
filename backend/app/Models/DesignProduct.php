<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * 4.3_Table_Design.md — design_product (pivot: apparel kompatibel per
 * desain, FR-037 preview_confirmed_at).
 */
#[Fillable(['design_id', 'product_id', 'preview_confirmed_at'])]
class DesignProduct extends Pivot
{
    protected function casts(): array
    {
        return [
            'preview_confirmed_at' => 'datetime',
        ];
    }
}
