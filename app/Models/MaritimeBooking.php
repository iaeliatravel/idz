<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaritimeBooking extends Model
{
    protected $fillable = [
        'reference', 'route_id', 'customer_name', 'customer_phone', 'customer_email',
        'departure_date', 'return_date', 'nb_passengers', 'has_vehicle', 'vehicle_type', 'status', 'admin_notes'
    ];

    protected $casts = [
        'departure_date' => 'date',
        'return_date' => 'date',
        'has_vehicle' => 'boolean',
    ];

    public function route(): BelongsTo
    {
        return $this->belongsTo(MaritimeRoute::class, 'route_id');
    }
}