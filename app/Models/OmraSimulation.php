<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OmraSimulation extends Model
{
    protected $table = 'omra_simulations';

    public $timestamps = false;

    protected $fillable = [
        'departure_id', 'package_id', 'full_name', 'phone', 'nb_adults', 'nb_children_bed',
        'nb_children_nobed', 'nb_infants', 'occupancy', 'estimated_total_dzd',
    ];

    protected function casts(): array
    {
        return [
            'estimated_total_dzd' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    public function departure(): BelongsTo
    {
        return $this->belongsTo(OmraDeparture::class, 'departure_id');
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(OmraPackage::class, 'package_id');
    }
}
