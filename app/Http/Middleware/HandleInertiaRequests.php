<?php
namespace App\Http\Middleware;
use Inertia\Middleware;
class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';
    public function handle(\Illuminate\Http\Request $request, \Closure $next): \Symfony\Component\HttpFoundation\Response
    {
        $response = parent::handle($request, $next);
        $response->headers->set(
            'Content-Security-Policy',
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:;"
        );
        return $response;
    }
    public function version(\Illuminate\Http\Request $request): ?string
    {
        return parent::version($request);
    }
    public function share(\Illuminate\Http\Request $request): array
    {
        return [
            ...parent::share($request),
        ];
    }
}