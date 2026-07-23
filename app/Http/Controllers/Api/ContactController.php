<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Setting;
use App\Support\RecaptchaVerifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:40'],
            'service' => ['nullable', 'string', 'max:60'],
            'message' => ['required', 'string'],
            'recaptcha_token' => ['nullable', 'string'],
        ]);

        if (! RecaptchaVerifier::verify($data['recaptcha_token'] ?? null, 'contact')) {
            return response()->json(['error' => 'Vérification anti-spam échouée. Merci de réessayer.'], 422);
        }

        $message = ContactMessage::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'phone' => $data['phone'] ?? null,
            'service' => $data['service'] ?? null,
            'message' => $data['message'],
        ]);

        $alertTo = Setting::get('alert_email', config('mail.from.address'));

        Mail::html(
            "<p>Nouveau message de contact :</p><p><b>{$message->first_name} {$message->last_name}</b> — ".
            ($message->phone ?? '—')."<br>Service : ".($message->service ?? '—')."</p><blockquote>".
            e($message->message).'</blockquote>',
            function ($mail) use ($alertTo, $message) {
                $mail->to($alertTo)
                    ->subject("[Aelia Travel] Nouveau message de contact — {$message->first_name} {$message->last_name}");
            }
        );

        return response()->json(['success' => true], 201);
    }
}
