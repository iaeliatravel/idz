<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvisaRequiredDocument extends Model
{
    protected $table = 'evisa_required_documents';

    public $timestamps = false;

    protected $fillable = [
        'option_id', 'label_fr', 'label_en', 'label_ar', 'category',
        'requires_upload', 'is_required', 'display_order',
    ];

    protected function casts(): array
    {
        return [
            'requires_upload' => 'boolean',
            'is_required' => 'boolean',
        ];
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(EvisaOption::class, 'option_id');
    }
}
