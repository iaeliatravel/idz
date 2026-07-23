<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;

class SiteConfigController extends Controller
{
    /**
     * GET /api/config
     * Configuration publique nécessaire au frontend React :
     * clé reCAPTCHA, logos actifs (couleur / blanc / noir & blanc), nom du site.
     */
    public function show()
    {
        return response()->json([
            'recaptcha_site_key' => config('services.recaptcha.site_key'),
            'site_name' => Setting::get('site_name', 'Aelia Travel'),
            'logos' => [
                'color' => Setting::get('logo_color_url'),
                'white' => Setting::get('logo_white_url'),
                'bw' => Setting::get('logo_bw_url'),
            ],
        ]);
    }
}
