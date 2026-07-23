<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Mode Sandbox / Production
    |--------------------------------------------------------------------------
    | true  → devapi.slick-pay.com  (tests, pas de vrai débit)
    | false → prodapi.slick-pay.com (production, vrai paiement CIB/EDAHABIA)
    */
    'sandbox' => (bool) env('SLICKPAY_SANDBOX', true),

    /*
    |--------------------------------------------------------------------------
    | Clé publique SlickPay
    |--------------------------------------------------------------------------
    | Récupérable depuis votre dashboard SlickPay → section API Keys
    */
    'public_key' => env('SLICKPAY_PUBLIC_KEY', ''),
];
