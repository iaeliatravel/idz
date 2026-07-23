<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OmraPrebookingTraveler extends Model
{
    protected $table = 'omra_prebooking_travelers';

    public $timestamps = false;

    protected $fillable = ['prebooking_id', 'full_name', 'traveler_type', 'passport_scan_path'];

    public function prebooking(): BelongsTo
    {
        return $this->belongsTo(OmraPrebooking::class, 'prebooking_id');
    }
}
