<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OmraPrebooking extends Model
{
    protected $table = 'omra_prebookings';

    protected $fillable = [
        'reference', 'departure_id', 'package_id', 'occupancy',
        'contact_name', 'contact_phone', 'contact_email',
        'nb_adults', 'nb_children_bed', 'nb_children_nobed', 'nb_infants',
        'estimated_total_dzd', 'cost_total_dzd', 'status', 'admin_notes',
    ];

    protected function casts(): array
    {
        return [
            'estimated_total_dzd' => 'decimal:2',
            'cost_total_dzd' => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
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

    public function travelers(): HasMany
    {
        return $this->hasMany(OmraPrebookingTraveler::class, 'prebooking_id');
    }

    public function getBenefitAttribute(): float
    {
        return round((float) $this->estimated_total_dzd - (float) $this->cost_total_dzd, 2);
    }
}
