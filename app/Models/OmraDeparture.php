<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OmraDeparture extends Model
{
    protected $table = 'omra_departures';

    protected $fillable = [
        'title_ar', 'partner_id', 'airline_id',
        'departure_date', 'departure_time', 'departure_airport', 'arrival_airport', 'outbound_itinerary',
        'return_date', 'return_time', 'return_departure_airport', 'return_arrival_airport', 'return_itinerary',
        'duration_nights', 'status', 'seats_total', 'seats_remaining', 'cover_image_url', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'departure_date' => 'date',
            'return_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(OmraPartner::class, 'partner_id');
    }

    public function airline(): BelongsTo
    {
        return $this->belongsTo(OmraAirline::class, 'airline_id');
    }

    public function packages(): HasMany
    {
        return $this->hasMany(OmraPackage::class, 'departure_id')->orderBy('display_order');
    }

    public function activePackages(): HasMany
    {
        return $this->packages()->where('is_active', true);
    }
}
