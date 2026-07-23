<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OmraHotel extends Model
{
    protected $table = 'omra_hotels';

    protected $fillable = [
        'name', 'city', 'stars', 'distance_haram', 'map_url',
        'latitude', 'longitude', 'description', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'latitude' => 'decimal:6',
            'longitude' => 'decimal:6',
        ];
    }

    public function images(): HasMany
    {
        return $this->hasMany(OmraHotelImage::class, 'hotel_id')->orderBy('display_order');
    }
}
