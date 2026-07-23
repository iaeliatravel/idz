<?php

namespace App\Mail;

use App\Models\EvisaApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EvisaApplicationAlert extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public EvisaApplication $application)
    {
    }

    public function build()
    {
        return $this->subject("[Aelia Travel] Nouvelle demande eVisa — {$this->application->reference}")
            ->view('emails.evisa-alert', ['app' => $this->application]);
    }
}
