<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TourDeparture extends Model
{
    protected $fillable = [
        'tour_id', 'departure_date', 'return_date', 'flights', 
        'seats_total', 'seats_remaining', 'is_active'
    ];
    
    protected $casts = [
        'departure_date' => 'date',
        'return_date' => 'date',
        'flights' => 'array',
        'is_active' => 'boolean',
    ];

    public function tour(): BelongsTo { return $this->belongsTo(Tour::class); }
}