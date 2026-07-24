<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tour extends Model
{
    protected $fillable = [
        'title_fr', 'title_ar', 'slug', 'destination', 'departure_date', 'return_date',
        'price_dzd', 'price_child_dzd', 'description_fr', 'description_ar',
        'cover_image_url', 'seats_total', 'seats_remaining', 'is_active'
    ];

    protected $casts = [
        'departure_date' => 'date',
        'return_date' => 'date',
        'is_active' => 'boolean'
    ];

    public function bookings(): HasMany
    {
        return $this->hasMany(TourBooking::class);
    }
}