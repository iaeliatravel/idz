<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MaritimeRoute extends Model
{
    protected $fillable = ['company_id', 'departure_port', 'arrival_port', 'is_round_trip'];

    protected $casts = [
        'is_round_trip' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(MaritimeCompany::class, 'company_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(MaritimeBooking::class, 'route_id');
    }
}