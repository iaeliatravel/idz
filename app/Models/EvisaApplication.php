<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvisaApplication extends Model
{
    protected $table = 'evisa_applications';

    protected $fillable = [
        'reference', 'country_id', 'option_id', 'first_name', 'last_name',
        'email', 'phone', 'passport_number', 'travel_date', 'nb_travelers',
        'message', 'sale_price_dzd', 'cost_price_dzd', 'status', 'admin_notes',
    ];

    protected function casts(): array
    {
        return [
            'travel_date' => 'date',
            'sale_price_dzd' => 'decimal:2',
            'cost_price_dzd' => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(EvisaCountry::class, 'country_id');
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(EvisaOption::class, 'option_id');
    }

    public function files(): HasMany
    {
        return $this->hasMany(EvisaApplicationFile::class, 'application_id');
    }

    public function getBenefitAttribute(): float
    {
        return round((float) $this->sale_price_dzd - (float) $this->cost_price_dzd, 2);
    }

    public function travelers() { return $this->hasMany(EvisaApplicationTraveler::class); }

}
