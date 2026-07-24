<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tour extends Model
{
    protected $fillable = [
        'title_fr', 'title_ar', 'slug', 'destination', 'departure_date', 'return_date',
        'flights', 'program', 'included_pack', 'excluded_pack', 'remarks',
        'cover_image_url', 'seats_total', 'seats_remaining', 'is_active'
    ];

    protected $casts = [
        'departure_date' => 'date',
        'return_date' => 'date',
        'is_active' => 'boolean',
        'flights' => 'array',         // Cast JSON automatique en tableau PHP
        'program' => 'array',         // Cast JSON automatique en tableau PHP
        'included_pack' => 'array',   // Cast JSON automatique en tableau PHP
        'excluded_pack' => 'array',   // Cast JSON automatique en tableau PHP
    ];

    public function hotelOptions(): HasMany
    {
        return $this->hasMany(TourHotelOption::class)->orderBy('display_order');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(TourBooking::class);
    }
}