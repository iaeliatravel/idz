<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MaritimeCompany extends Model
{
    protected $fillable = ['name', 'logo_url', 'notes'];

    public function routes(): HasMany
    {
        return $this->hasMany(MaritimeRoute::class, 'company_id');
    }
}