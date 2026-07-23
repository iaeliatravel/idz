<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OmraHotelImage extends Model
{
    protected $table = 'omra_hotel_images';

    public $timestamps = false;

    protected $fillable = ['hotel_id', 'image_url', 'display_order'];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(OmraHotel::class, 'hotel_id');
    }
}
