<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleAdminAuth
{
    /**
     * Vérifie qu'une session admin valide existe avant d'autoriser l'accès.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->session()->get('admin_id')) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['error' => 'Authentification requise.'], 401);
            }

            return redirect('/admin/login');
        }

        return $next($request);
    }
}
