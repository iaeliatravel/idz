<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service SlickPay — implémentation native Laravel HTTP.
 * Le SDK v1.0.0 est obsolète (mauvais endpoint + pas de JSON).
 * On appelle directement l'API REST documentée.
 */
class SlickPayService
{
    private string $baseUrl;
    private string $publicKey;

    public function __construct()
    {
        $sandbox = config('slickpay.sandbox', true);
        $this->baseUrl   = $sandbox
            ? 'https://devapi.slick-pay.com/api/v2'
            : 'https://prodapi.slick-pay.com/api/v2';
        $this->publicKey = config('slickpay.public_key', '');
    }

/**
     * Crée une facture et retourne l'URL SATIM directe.
     *
     * @return array{invoice_id: int, payment_url: string}
     */
    public function createInvoice(array $params): array
    {
        $account = config('slickpay.account');
        $fees    = config('slickpay.fees', 0);

        $payload = [
            'amount'      => (int) $params['amount'],
            'firstname'   => $params['firstname'] ?? explode(' ', $params['name'] ?? '')[0] ?? '',
            'lastname'    => $params['lastname'] ?? implode(' ', array_slice(explode(' ', $params['name'] ?? ''), 1)) ?: $params['firstname'] ?? 'N/A',
            'phone'       => $params['phone'],
            'email'       => $params['email'],
            'address'     => $params['address'] ?? 'Algérie',
            'url'         => $params['back_url'] ?? $params['callback_url'] ?? '',
            'webhook_url' => $params['callback_url'] ?? '',
            'fees'        => (int) $fees,
            'items'       => [[
                'name'     => $params['description'] ?? 'eVisa',
                'price'    => (int) $params['amount'],
                'quantity' => 1,
            ]],
        ];

        // Si un compte bancaire spécifique (UUID) est configuré, on l'envoie
        if (!empty($account)) {
            $payload['account'] = $account;
        }

        $response = Http::withToken($this->publicKey)
            ->acceptJson()
            ->post("{$this->baseUrl}/users/invoices", $payload);

        Log::info('[SlickPay] Create Invoice Response', [
            'status' => $response->status(),
            'body'   => $response->json(),
        ]);

        if ($response->failed()) {
            $errors = $response->json('errors') ?? $response->json('message') ?? 'Erreur API';
            throw new \RuntimeException('SlickPay : ' . (is_array($errors) ? json_encode($errors) : $errors));
        }

        $data = $response->json();

        if (empty($data['id']) || empty($data['url'])) {
            throw new \RuntimeException('SlickPay : réponse invalide (id ou url manquant).');
        }

        return [
            'invoice_id'  => (int) $data['id'],
            'payment_url' => $data['url'], // URL racine = redirection directe SATIM
        ];
    }

    /**
     * Récupère le statut d'une facture.
     */
    /**
     * Récupère le statut d'une facture de manière robuste et indépendante de la langue.
     */
    public function getInvoiceStatus(int $invoiceId): ?string
    {
        $response = Http::withToken($this->publicKey)
            ->acceptJson()
            ->get("{$this->baseUrl}/users/invoices/{$invoiceId}");

        if ($response->failed()) {
            return null;
        }

        // 1. Utilisation du champ de succès universel 'completed'
        $completed = $response->json('completed');
        if ($completed === 1 || $completed === '1') {
            return 'paid';
        }

        // 2. Analyse des statuts d'annulation ou d'échec (gestion du français et de l'anglais)
        $rawStatus = mb_strtolower($response->json('data.status') ?? '');

        if (in_array($rawStatus, ['annulé', 'annule', 'canceled', 'cancelled'])) {
            return 'canceled';
        }

        if (in_array($rawStatus, ['échoué', 'echoue', 'failed', 'error', 'refusé', 'refuse'])) {
            return 'failed';
        }

        return 'pending';
    }
}
