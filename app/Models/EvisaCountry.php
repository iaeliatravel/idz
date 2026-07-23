<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvisaCountry extends Model
{
    protected $table = 'evisa_countries';

    protected $fillable = [
        'name_fr', 'name_en', 'name_ar', 'slug', 'flag_image_url', 'flag_emoji',
        'region', 'is_active', 'display_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function options(): HasMany
    {
        return $this->hasMany(EvisaOption::class, 'country_id');
    }

    public function activeOptions(): HasMany
    {
        return $this->options()->where('is_active', true)->orderBy('display_order');
    }
}
