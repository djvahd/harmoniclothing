<?php

namespace App\Models;

use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * 4.3_Table_Design.md — categories (kategori produk/desain, dwibahasa).
 */
#[Fillable(['name_id', 'name_en', 'slug', 'type'])]
class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory;

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function designs(): HasMany
    {
        return $this->hasMany(Design::class);
    }
}
