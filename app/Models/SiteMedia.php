<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteMedia extends Model
{
    protected $table = 'site_media';

    public $timestamps = false;

    protected $fillable = ['url', 'original_name', 'category'];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }
}
