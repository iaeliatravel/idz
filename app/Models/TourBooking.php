<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TourBooking extends Model
{
    protected $fillable = [
        'reference', 'tour_departure_id', 'customer_name', 'customer_phone', 
        'customer_email', 'nb_travelers', 'status', 'admin_notes'
    ];

    public function departure(): BelongsTo
    {
        return $this->belongsTo(TourDeparture::class, 'tour_departure_id');
    }
}