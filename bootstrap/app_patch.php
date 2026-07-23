<?php

/*
|==========================================================================
|  MODIFICATION bootstrap/app.php — Exemption CSRF pour le webhook
|==========================================================================
|
|  Trouvez le bloc ->withMiddleware() dans votre bootstrap/app.php
|  et ajoutez l'exemption CSRF comme ci-dessous.
|
|  AVANT :
|     ->withMiddleware(function (Middleware $middleware) {
|         $middleware->alias([...]);
|         $middleware->trustProxies(at: '*');
|     })
|
|  APRÈS :
*/

use Illuminate\Foundation\Configuration\Middleware;

// Dans le callback withMiddleware, ajoutez :
$middleware->validateCsrfTokens(except: [
    'webhook/chargily', // Chargily ne peut pas envoyer de token CSRF
]);

/*
|==========================================================================
|  RÉSULTAT FINAL de bootstrap/app.php
|==========================================================================
*/

// return Application::configure(basePath: dirname(__DIR__))
//     ->withRouting(
//         web: __DIR__.'/../routes/web.php',
//         commands: __DIR__.'/../routes/console.php',
//         health: '/healthz',
//     )
//     ->withMiddleware(function (Middleware $middleware) {
//         $middleware->web(append: [
//             \App\Http\Middleware\HandleInertiaRequests::class,
//         ]);
//         $middleware->alias([
//             'admin.auth' => \App\Http\Middleware\HandleAdminAuth::class,
//         ]);
//         $middleware->trustProxies(at: '*');
//
//         // ← AJOUTER CECI :
//         $middleware->validateCsrfTokens(except: [
//             'webhook/chargily',
//         ]);
//     })
//     ->withExceptions(function (Exceptions $exceptions) {})
//     ->create();
