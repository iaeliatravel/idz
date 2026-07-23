<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/healthz',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'admin.auth' => \App\Http\Middleware\HandleAdminAuth::class,
        ]);

        $middleware->trustProxies(at: '*');
        
        $middleware->validateCsrfTokens(except: [
            'api/evisa/payment/callback',
        ]);
        $middleware->validateCsrfTokens(except: [
            'api/evisa/payment/callback',
            'api/evisa/apply', // <-- AJOUTEZ CETTE LIGNE TEMPORAIREMENT
        ]);
    })
    
    ->withMiddleware(function ($middleware) {
        $middleware->append(\App\Http\Middleware\EvisaSubdomain::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();