<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\Request;

class SiteContentAdminController extends Controller
{
    // Liste toutes les sections d'une page (home, evisa, omra, header, footer)
    public function index(string $page)
    {
        $sections = SiteContent::where('page', $page)
            ->orderBy('display_order')
            ->get()
            ->map(fn ($s) => [
                'section_key'   => $s->section_key,
                'content'       => $s->content,
                'is_active'     => $s->is_active,
                'display_order' => $s->display_order,
            ]);

        return response()->json($sections);
    }

    // Met à jour une section spécifique
    public function update(Request $request, string $page, string $sectionKey)
    {
        $data = $request->validate([
            'content'       => ['required', 'array'],
            'is_active'     => ['nullable', 'boolean'],
            'display_order' => ['nullable', 'integer'],
        ]);

        SiteContent::updateOrCreate(
            ['page' => $page, 'section_key' => $sectionKey],
            [
                'content'       => $data['content'],
                'is_active'     => $data['is_active'] ?? true,
                'display_order' => $data['display_order'] ?? 0,
            ]
        );

        return response()->json(['success' => true]);
    }
}
