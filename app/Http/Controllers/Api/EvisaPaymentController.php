<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EvisaApplication;
use App\Models\EvisaPayment;
use App\Services\SlickPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EvisaPaymentController extends Controller
{
    public function __construct(private SlickPayService $slickpay) {}

    public function initiate(EvisaApplication $application)
    {
        if (in_array($application->status, ['approuve', 'annule', 'refuse'])) {
            return response()->json(['error' => 'Cette demande ne peut plus être payée.'], 422);
        }

        $existing = EvisaPayment::where('application_id', $application->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        if ($existing?->payment_url) {
            return response()->json(['payment_url' => $existing->payment_url]);
        }

        $application->load(['country', 'option']);

        try {
            // Prix TOTAL = prix unitaire × nb_travelers
            $totalAmount = (float) $application->sale_price_dzd;
            $nbTravelers = $application->nb_travelers ?? 1;

            $result = $this->slickpay->createInvoice([
                'amount'       => $totalAmount,
                'firstname'    => $application->first_name,
                'lastname'     => $application->last_name,
                'phone'        => $application->phone,
                'email'        => $application->email,
                'address'      => 'Algérie',
                'description'  => "eVisa {$application->reference} — {$nbTravelers} voyageur(s) — {$application->option?->label_fr}",
                'callback_url' => url('/api/evisa/payment/callback'),
                'back_url'     => url('/evisa/payment/result') . '?app_id=' . $application->id,
            ]);

            EvisaPayment::create([
                'application_id'      => $application->id,
                'slickpay_invoice_id' => $result['invoice_id'],
                'payment_url'         => $result['payment_url'],
                'amount_dzd'          => $totalAmount,
                'status'              => 'pending',
            ]);

            return response()->json(['payment_url' => $result['payment_url']]);

        } catch (\Throwable $e) {
            Log::error('[SlickPay] Erreur initiation paiement', [
                'application_id' => $application->id,
                'error'          => $e->getMessage(),
            ]);
            return response()->json(['error' => "Impossible d'initier le paiement. Merci de réessayer."], 500);
        }
    }

    public function result(Request $request)
    {
        $appId   = (int) $request->query('app_id');
        $payment = null;
        $status  = 'unknown';

        if ($appId) {
            $payment = EvisaPayment::where('application_id', $appId)->latest()->first();
            if ($payment) {
                try {
                    $liveStatus = $this->slickpay->getInvoiceStatus($payment->slickpay_invoice_id);
                    if ($liveStatus) {
                        $status = $liveStatus;
                        if ($liveStatus === 'paid' && ! $payment->isPaid()) {
                            $payment->update(['status' => 'paid', 'paid_at' => now()]);
                            $payment->application?->update(['status' => 'en_cours']);
                        }
                    }
                } catch (\Throwable $e) {
                    $status = $payment->status;
                }
            }
        }

        return \Inertia\Inertia::render('Evisa/PaymentResult', [
            'status'       => $status,
            'reference'    => $payment?->application?->reference,
            'amount'       => $payment?->amount_dzd,
            'nb_travelers' => $payment?->application?->nb_travelers ?? 1,
        ]);
    }

    public function failure(Request $request)
    {
        return $this->result($request);
    }
}
