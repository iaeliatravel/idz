<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    protected $fillable = [
        'reference', 'customer_name', 'customer_phone', 'customer_email',
        'destination', 'departure_date', 'duration_nights', 'nb_adults',
        'nb_children', 'hotel_stars', 'estimated_budget_dzd', 'message',
        'status', 'admin_notes'
    ];

    protected $casts = [
        'departure_date' => 'date',
    ];
}