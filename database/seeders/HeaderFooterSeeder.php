<?php

namespace Database\Seeders;

use App\Models\SiteContent;
use Illuminate\Database\Seeder;

/**
 * Ajoute les sections header et footer dans site_content.
 * Exécutez via : php artisan db:seed --class=HeaderFooterSeeder
 */
class HeaderFooterSeeder extends Seeder
{
    public function run(): void
    {
        // ── HEADER ──────────────────────────────────────────────────────────
        SiteContent::updateOrCreate(
            ['page' => 'header', 'section_key' => 'nav'],
            [
                'content' => [
                    'phone'         => '+213 XX XX XX XX',
                    'phone_display' => '+213 XX XX XX XX',
                    'cta_label'     => 'Demander un eVisa',
                    'cta_url'       => '/evisa',
                    'nav_links'     => [
                        ['label' => 'Accueil',       'url' => '/'],
                        ['label' => 'eVisa en ligne', 'url' => '/evisa'],
                        ['label' => 'عمرة Omra',     'url' => '/omra'],
                    ],
                ],
                'is_active'     => true,
                'display_order' => 0,
            ]
        );

        // ── FOOTER ──────────────────────────────────────────────────────────
        SiteContent::updateOrCreate(
            ['page' => 'footer', 'section_key' => 'info'],
            [
                'content' => [
                    'description'    => 'Agence de voyages à Alger spécialisée dans les eVisas en ligne, les voyages Omra et les séjours sur mesure.',
                    'phone'          => '+213 XX XX XX XX',
                    'email'          => 'contact@aeliatravelagency.dz',
                    'address'        => 'Alger, Algérie',
                    'whatsapp'       => '',
                    'facebook'       => '',
                    'instagram'      => '',
                    'agrement'       => 'Agence agréée · Alger, Algérie',
                    'copyright'      => '© {year} Aelia Travel — Tous droits réservés',
                    'services_links' => [
                        ['label' => 'eVisa en ligne',   'url' => '/evisa'],
                        ['label' => 'Voyages Omra',     'url' => '/omra'],
                        ["label" => "Billets d'avion",  'url' => '/#contact'],
                        ['label' => 'Assurance voyage', 'url' => '/#contact'],
                    ],
                    'destinations_links' => [
                        ['label' => 'eVisa Turquie',   'url' => '/evisa'],
                        ['label' => 'eVisa Émirats',   'url' => '/evisa'],
                        ['label' => 'eVisa Égypte',    'url' => '/evisa'],
                        ['label' => 'eVisa Jordanie',  'url' => '/evisa'],
                    ],
                ],
                'is_active'     => true,
                'display_order' => 0,
            ]
        );
    }
}
