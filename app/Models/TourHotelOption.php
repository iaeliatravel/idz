<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TourHotelOption extends Model
{
    protected $table = 'tour_hotel_options';

    protected $fillable = [
        'tour_id', 'hotel_name', 'room_type', 
        'price_double_dzd', 'price_triple_dzd', 'price_single_dzd',
        'price_child_with_bed_dzd', 'price_child_no_bed_dzd', 'price_infant_dzd',
        'display_order'
    ];

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }
}