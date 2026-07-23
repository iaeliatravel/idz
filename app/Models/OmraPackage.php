<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OmraPackage extends Model
{
    protected $table = 'omra_packages';

    protected $fillable = [
        'departure_id', 'mecque_hotel_id', 'mecque_nights',
        'medine_hotel_id', 'medine_nights', 'label', 'is_active', 'display_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function departure(): BelongsTo
    {
        return $this->belongsTo(OmraDeparture::class, 'departure_id');
    }

    public function mecqueHotel(): BelongsTo
    {
        return $this->belongsTo(OmraHotel::class, 'mecque_hotel_id');
    }

    public function medineHotel(): BelongsTo
    {
        return $this->belongsTo(OmraHotel::class, 'medine_hotel_id');
    }

    public function pricing(): HasMany
    {
        return $this->hasMany(OmraPricing::class, 'package_id');
    }
}
