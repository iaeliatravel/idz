<?php

namespace App\Mail;

use App\Models\EvisaApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EvisaApplicationConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public EvisaApplication $application)
    {
    }

    public function build()
    {
        return $this->subject("Votre demande eVisa — {$this->application->reference}")
            ->view('emails.evisa-confirmation', ['app' => $this->application]);
    }
}
