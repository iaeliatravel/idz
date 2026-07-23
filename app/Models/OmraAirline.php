<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OmraAirline extends Model
{
    protected $table = 'omra_airlines';

    public $timestamps = false;

    protected $fillable = ['name', 'logo_url'];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }
}
