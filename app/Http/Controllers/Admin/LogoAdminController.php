<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class LogoAdminController extends Controller
{
    private const VARIANTS = ['color', 'white', 'bw'];

    /**
     * GET /api/admin/logos — état actuel des 3 versions
     */
    public function index()
    {
        $logos = [];
        foreach (self::VARIANTS as $variant) {
            $logos[$variant] = Setting::get("logo_{$variant}_url");
        }

        return response()->json($logos);
    }

    /**
     * POST /api/admin/logos/{variant} — téléverse/remplace une version du logo
     * {variant} = color | white | bw
     */
    public function store(Request $request, string $variant)
    {
        if (! in_array($variant, self::VARIANTS, true)) {
            return response()->json(['error' => 'Version de logo invalide.'], 422);
        }

        $request->validate([
            'logo' => ['required', 'image', 'max:4096'],
        ]);

        $path = $request->file('logo')->store('logo', 'public');
        $url = '/storage/'.$path;

        Setting::set("logo_{$variant}_url", $url);

        return response()->json(['success' => true, 'variant' => $variant, 'url' => $url]);
    }

    /**
     * DELETE /api/admin/logos/{variant} — retire une version (retour au fallback texte)
     */
    public function destroy(string $variant)
    {
        if (! in_array($variant, self::VARIANTS, true)) {
            return response()->json(['error' => 'Version de logo invalide.'], 422);
        }

        Setting::set("logo_{$variant}_url", null);

        return response()->json(['success' => true]);
    }
}
