<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvisaOption extends Model
{
    protected $table = 'evisa_options';

    protected $fillable = [
        'country_id', 'label_fr', 'label_en', 'label_ar', 'type_color',
        'delai_fr', 'validite_fr', 'cost_price_dzd', 'sale_price_dzd',
        'note_fr', 'conditions_fr', 'is_active', 'display_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'cost_price_dzd' => 'decimal:2',
            'sale_price_dzd' => 'decimal:2',
        ];
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(EvisaCountry::class, 'country_id');
    }

    public function requiredDocuments(): HasMany
    {
        return $this->hasMany(EvisaRequiredDocument::class, 'option_id')->orderBy('display_order');
    }

    public function getBenefitAttribute(): float
    {
        return round((float) $this->sale_price_dzd - (float) $this->cost_price_dzd, 2);
    }
}
