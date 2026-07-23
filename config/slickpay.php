<?php

return [
    /*
    | Mode Sandbox / Production
    */
    'sandbox' => (bool) env('SLICKPAY_SANDBOX', true),

    /*
    | Clé publique SlickPay
    */
    'public_key' => env('SLICKPAY_PUBLIC_KEY', ''),

    /*
    | UUID du compte bancaire spécifique (Optionnel)
    | Laissez vide pour utiliser le compte par défaut configuré sur SlickPay.
    */
    'account' => env('SLICKPAY_ACCOUNT_UUID', ''),

    /*
    | Répartition des frais de commission (0 - 100)
    | 0   = L'agence absorbe 100% de la commission (le client paie le prix exact).
    | 100 = Le client paie 100% de la commission en plus du prix du visa.
    */
    'fees' => (int) env('SLICKPAY_FEES', 0), 
];