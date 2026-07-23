<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvisaApplicationFile extends Model
{
    protected $table = 'evisa_application_files';

    public $timestamps = false;

    protected $fillable = [
        'application_id', 'document_label', 'file_path', 'original_name', 'uploaded_at',
    ];

    protected function casts(): array
    {
        return [
            'uploaded_at' => 'datetime',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(EvisaApplication::class, 'application_id');
    }
}
