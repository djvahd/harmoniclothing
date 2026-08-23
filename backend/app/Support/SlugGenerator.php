<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Menghasilkan slug unik dari teks; menambah sufiks -1, -2, … bila slug
 * sudah dipakai model terkait.
 */
class SlugGenerator
{
    /**
     * @param  class-string<Model>  $modelClass
     */
    public static function unique(string $text, string $modelClass, string $column = 'slug'): string
    {
        $base = Str::slug($text);
        $slug = $base;
        $suffix = 1;

        while ($modelClass::query()->where($column, $slug)->exists()) {
            $slug = "{$base}-".$suffix++;
        }

        return $slug;
    }
}
