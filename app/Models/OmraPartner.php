<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OmraPartner extends Model
{
    protected $table = 'omra_partners';

    public $timestamps = false;

    protected $fillable = ['name', 'contact', 'phone', 'notes'];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }
}
