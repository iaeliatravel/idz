<?php

/*
|==========================================================================
|  ROUTES SLICKPAY — à ajouter dans routes/web.php
|==========================================================================
|
|  Ajoutez ces imports USE en haut de web.php :
|
|     use App\Http\Controllers\Api\EvisaPaymentController;
|     use App\Http\Controllers\Api\SlickPayCallbackController;
|
*/

use App\Http\Controllers\Api\EvisaPaymentController;
use App\Http\Controllers\Api\SlickPayCallbackController;
use Illuminate\Support\Facades\Route;

// ─── Page de retour client après paiement SATIM ───────────────────────────
// SlickPay redirige ici après paiement (succès ou échec)
// avec ?invoice_id=xxx en paramètre.
Route::get('/evisa/payment/result', [EvisaPaymentController::class, 'result'])
    ->name('evisa.payment.result');

// ─── API paiement ─────────────────────────────────────────────────────────
Route::prefix('api')->group(function () {

    // Initie un paiement — retourne l'URL directe SATIM
    Route::post('/evisa/pay/{application}', [EvisaPaymentController::class, 'initiate'])
        ->middleware('throttle:10,1')
        ->name('evisa.payment.initiate');

    // Réessai de paiement depuis la page de résultat
    Route::post('/evisa/pay-by-ref/{reference}', function ($reference) {
        $app = \App\Models\EvisaApplication::where('reference', $reference)->firstOrFail();
        return app(\App\Http\Controllers\Api\EvisaPaymentController::class)->initiate($app);
    })->middleware('throttle:10,1')
      ->name('evisa.payment.retry');

    // ── Callback SlickPay (SANS CSRF) ──────────────────────────────────────
    //
    //  ⚠️  SlickPay ne peut pas envoyer de token CSRF.
    //      Cette route doit être exclue du middleware VerifyCsrfToken.
    //
    //  Dans bootstrap/app.php, ajoutez dans withMiddleware() :
    //      $middleware->validateCsrfTokens(except: ['api/evisa/payment/callback']);
    //
    Route::post('/evisa/payment/callback', [SlickPayCallbackController::class, 'handle'])
        ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])
        ->name('evisa.payment.callback');
});
