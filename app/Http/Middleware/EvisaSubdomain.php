<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EvisaSubdomain
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->getHost() === 'evisa.aeliatravelagency.dz') {

            // Si on est à la racine du sous-domaine,
            // on fait croire à Laravel que l'URL est /evisa
            if ($request->path() === '/') {
                $request->server->set('REQUEST_URI', '/evisa');
                $request->server->set('PATH_INFO', '/evisa');
            }

            // Toutes les autres URL deviennent :
            // /api/...      => /api/...
            // /admin/...    => /admin/...
            // etc.
        }

        return $next($request);
    }
}