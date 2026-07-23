<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;

class SiteContentPublicController extends Controller
{
    /**
     * GET /api/content/{page}
     * Retourne tout le contenu éditable actif d'une page, prêt à consommer par React.
     */
    public function show(string $page)
    {
        return response()->json(SiteContent::forPage($page));
    }
}
