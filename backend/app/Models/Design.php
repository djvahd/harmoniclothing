<?php

namespace App\Models;

use Database\Factories\DesignFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * 4.3_Table_Design.md — designs (desain yang diunggah Creator).
 */
#[Fillable([
    'creator_id', 'category_id', 'title', 'slug', 'description',
    'file_path', 'thumbnail_path', 'status', 'rejection_reason',
    'approved_by', 'approved_at',
])]
class Design extends Model
{
    /** @use HasFactory<DesignFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
        ];
    }

    /**
     * BR-002: only approved designs are visible in the public marketplace.
     * BR-019: banned creators' designs are pulled from the marketplace too.
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('status', 'aktif')
            ->whereDoesntHave('creator.creatorProfile', fn ($q) => $q->where('status', 'banned'));
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class)
            ->using(DesignProduct::class)
            ->withPivot('preview_confirmed_at')
            ->withTimestamps();
    }
}
