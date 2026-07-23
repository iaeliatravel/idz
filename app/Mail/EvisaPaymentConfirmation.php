<?php

namespace App\Mail;

use App\Models\EvisaApplication;
use App\Models\EvisaPayment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EvisaPaymentConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public EvisaApplication $application,
        public EvisaPayment $payment,
    ) {}

    public function build()
    {
        return $this
            ->subject("✅ Paiement confirmé — Demande eVisa {$this->application->reference}")
            ->view('emails.evisa-payment-confirmation', [
                'app'     => $this->application,
                'payment' => $this->payment,
            ]);
    }
}
