<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    protected $table = 'site_content';

    protected $fillable = ['page', 'section_key', 'content', 'is_active', 'display_order'];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Récupère tout le contenu actif d'une page, indexé par section_key.
     */
    public static function forPage(string $page): array
    {
        return static::where('page', $page)
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get()
            ->keyBy('section_key')
            ->map(fn ($row) => $row->content)
            ->toArray();
    }
}
