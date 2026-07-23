<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RecaptchaVerifier
{
    /**
     * Vérifie un token reCAPTCHA v3 auprès de l'API Google.
     * Retourne true si le score est suffisant ET que l'action correspond.
     */
    public static function verify(?string $token, string $expectedAction): bool
    {
        $secret = config('services.recaptcha.secret_key');

        if (! $secret) {
            // Pas de clé configurée -> on laisse passer pour ne pas bloquer le site
            // (mais on logge pour que ce soit visible dans les logs serveur).
            Log::warning('reCAPTCHA non configuré (RECAPTCHA_SECRET_KEY manquante) — vérification ignorée.');

            return true;
        }

        if (! $token) {
            return false;
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secret,
                'response' => $token,
            ]);

            $result = $response->json();

            if (! ($result['success'] ?? false)) {
                return false;
            }

            // L'action doit correspondre à ce qui a été déclaré côté client
            // (protège contre la réutilisation d'un token d'une autre action).
            if (($result['action'] ?? null) !== $expectedAction) {
                return false;
            }

            $threshold = config('services.recaptcha.score_threshold', 0.5);

            return ($result['score'] ?? 0) >= $threshold;
        } catch (\Throwable $e) {
            Log::error('Erreur de vérification reCAPTCHA : '.$e->getMessage());

            // En cas d'erreur réseau côté Google, on ne bloque pas le visiteur légitime.
            return true;
        }
    }
}
