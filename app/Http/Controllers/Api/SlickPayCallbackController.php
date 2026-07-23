<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\EvisaPaymentConfirmation;
use App\Models\EvisaPayment;
use App\Services\SlickPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Callback SlickPay Pay.
 *
 * SlickPay appelle cette URL après chaque tentative de paiement,
 * que ce soit un succès ou un échec. Contrairement à un webhook signé,
 * SlickPay envoie les données en POST (JSON ou form-data).
 *
 * On vérifie TOUJOURS le statut auprès de l'API SlickPay directement
 * (GET /merchants/invoices/{id}) pour éviter toute falsification du callback.
 *
 * ⚠️  Cette route doit être EXCLUE de la vérification CSRF.
 */
class SlickPayCallbackController extends Controller
{
    public function __construct(private SlickPayService $slickpay) {}

    public function handle(Request $request)
    {
        $payload    = $request->all();
        $invoiceId  = (int) ($payload['invoice_id'] ?? $payload['id'] ?? 0);

        Log::info('[SlickPay Callback] Reçu', ['payload' => $payload]);

        if (! $invoiceId) {
            Log::warning('[SlickPay Callback] invoice_id manquant dans le payload');
            return response()->json(['received' => true]);
        }

        // ── Sécurité : on ne fait jamais confiance au statut du callback
        //    seul. On vérifie TOUJOURS auprès de l'API SlickPay. ─────────────
        try {
            $liveStatus = $this->slickpay->getInvoiceStatus($invoiceId);
        } catch (\Throwable $e) {
            Log::error('[SlickPay Callback] Impossible de vérifier le statut', [
                'invoice_id' => $invoiceId,
                'error'      => $e->getMessage(),
            ]);
            // On retourne 200 pour éviter les re-tentatives infinies
            return response()->json(['received' => true]);
        }

        // Normalise le statut SlickPay vers notre nomenclature interne
        $status = match (strtolower($liveStatus ?? '')) {
            'paid', 'success', 'succeeded'   => 'paid',
            'failed', 'error', 'declined'    => 'failed',
            'canceled', 'cancelled'          => 'canceled',
            default                          => 'pending',
        };

        $payment = EvisaPayment::where('slickpay_invoice_id', $invoiceId)->first();

        if (! $payment) {
            Log::warning('[SlickPay Callback] Aucun paiement trouvé', [
                'invoice_id' => $invoiceId,
            ]);
            return response()->json(['received' => true]);
        }

        // ── Idempotence : ne retraite pas un événement déjà traité ───────────
        if ($payment->status === $status) {
            return response()->json(['received' => true]);
        }

        // ── Met à jour le paiement ────────────────────────────────────────────
        $payment->update([
            'status'           => $status,
            'callback_payload' => $payload,
            'paid_at'          => $status === 'paid' ? now() : null,
        ]);

        $application = $payment->application()->with(['country', 'option'])->first();

        if (! $application) {
            Log::error('[SlickPay Callback] Application introuvable', [
                'payment_id' => $payment->id,
            ]);
            return response()->json(['received' => true]);
        }

        match ($status) {
            'paid'              => $this->handlePaid($application, $payment),
            'failed', 'canceled' => $this->handleFailed($application, $status),
            default             => null,
        };

        return response()->json(['received' => true]);
    }

    private function handlePaid($application, $payment): void
    {
        // Met la demande en cours de traitement
        $application->update(['status' => 'en_cours']);

        Log::info('[SlickPay] Paiement confirmé', [
            'reference'  => $application->reference,
            'amount'     => $payment->amount_dzd,
            'invoice_id' => $payment->slickpay_invoice_id,
        ]);

        // Envoie l'email de confirmation au client
        try {
            Mail::to($application->email)
                ->send(new EvisaPaymentConfirmation($application, $payment));
        } catch (\Throwable $e) {
            Log::error('[SlickPay] Envoi email confirmation échoué', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function handleFailed($application, string $status): void
    {
        // On laisse la demande en "nouveau" pour permettre une nouvelle tentative
        Log::warning('[SlickPay] Paiement '.$status, [
            'reference' => $application->reference,
        ]);
    }
}
