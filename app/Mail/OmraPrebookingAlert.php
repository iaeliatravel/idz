<?php

namespace App\Mail;

use App\Models\OmraPrebooking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OmraPrebookingAlert extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public OmraPrebooking $prebooking)
    {
    }

    public function build()
    {
        return $this->subject("[Aelia Travel] Nouvelle pré-réservation Omra — {$this->prebooking->reference}")
            ->view('emails.omra-alert', ['pb' => $this->prebooking]);
    }
}
