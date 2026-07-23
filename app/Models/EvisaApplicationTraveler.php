<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvisaApplicationTraveler extends Model
{
    protected $table = 'evisa_application_travelers';

    protected $fillable = [
        'application_id',
        'first_name',
        'last_name',
        'passport_number',
        'travel_date',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'travel_date' => 'date',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(EvisaApplication::class, 'application_id');
    }

    public function files()
    {
        return $this->hasMany(EvisaApplicationFile::class, 'traveler_id');
    }
}
