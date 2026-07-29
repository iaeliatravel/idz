<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TourBooking extends Model
{
    protected $fillable = [
        'reference', 'tour_departure_id', 'hotel_name', 'room_type',
        'customer_name', 'customer_phone', 'customer_email', 
        'nb_adults', 'nb_children_bed', 'nb_children_nobed', 'nb_infants',
        'total_price_dzd', 'nb_travelers', 'status', 'admin_notes'
    ];

    public function departure(): BelongsTo
    {
        return $this->belongsTo(TourDeparture::class, 'tour_departure_id');
    }
}