<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OmraPricing extends Model
{
    protected $table = 'omra_pricing';

    public $timestamps = false;

    protected $fillable = [
        'package_id', 'occupancy',
        'adult_cost_dzd', 'adult_sale_dzd',
        'child_with_bed_cost_dzd', 'child_with_bed_sale_dzd',
        'child_no_bed_cost_dzd', 'child_no_bed_sale_dzd',
        'infant_cost_dzd', 'infant_sale_dzd',
    ];

    protected function casts(): array
    {
        return [
            'adult_cost_dzd' => 'decimal:2',
            'adult_sale_dzd' => 'decimal:2',
            'child_with_bed_cost_dzd' => 'decimal:2',
            'child_with_bed_sale_dzd' => 'decimal:2',
            'child_no_bed_cost_dzd' => 'decimal:2',
            'child_no_bed_sale_dzd' => 'decimal:2',
            'infant_cost_dzd' => 'decimal:2',
            'infant_sale_dzd' => 'decimal:2',
        ];
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(OmraPackage::class, 'package_id');
    }

    public function getAdultBenefitAttribute(): float
    {
        return round((float) $this->adult_sale_dzd - (float) $this->adult_cost_dzd, 2);
    }

    public function getChildBedBenefitAttribute(): float
    {
        return round((float) $this->child_with_bed_sale_dzd - (float) $this->child_with_bed_cost_dzd, 2);
    }

    public function getChildNobedBenefitAttribute(): float
    {
        return round((float) $this->child_no_bed_sale_dzd - (float) $this->child_no_bed_cost_dzd, 2);
    }

    public function getInfantBenefitAttribute(): float
    {
        return round((float) $this->infant_sale_dzd - (float) $this->infant_cost_dzd, 2);
    }
}
