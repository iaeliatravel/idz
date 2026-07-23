<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvisaPayment extends Model
{
    protected $table = 'evisa_payments';

    protected $fillable = [
        'application_id',
        'slickpay_invoice_id',
        'payment_url',
        'amount_dzd',
        'status',
        'callback_payload',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount_dzd'       => 'decimal:2',
            'callback_payload' => 'array',
            'paid_at'          => 'datetime',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(EvisaApplication::class, 'application_id');
    }

    public function isPaid(): bool    { return $this->status === 'paid'; }
    public function isPending(): bool { return $this->status === 'pending'; }
}
