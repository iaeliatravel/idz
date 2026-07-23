<?php

namespace Database\Seeders;

use App\Models\SiteContent;
use Illuminate\Database\Seeder;

class SiteContentSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            // ===================== PAGE HOME =====================
            ['page' => 'home', 'section_key' => 'hero', 'display_order' => 1, 'content' => [
                'eyebrow' => '✈ Agence de voyages certifiée',
                'title' => "Voyagez l'esprit\ntranquille avec Aelia",
                'subtitle' => "eVisa en ligne, Omra, billets d'avion, assurances — tout ce dont vous avez besoin pour votre voyage, en quelques clics.",
                'background_image' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80&auto=format&fit=crop',
                'cta_primary_label' => 'Demander un eVisa',
                'cta_primary_url' => '/evisa',
                'cta_secondary_label' => 'Offres Omra',
                'cta_secondary_url' => '/omra',
            ]],
            ['page' => 'home', 'section_key' => 'stats', 'display_order' => 2, 'content' => [
                'items' => [
                    ['value' => '+5 000', 'label' => 'Clients satisfaits'],
                    ['value' => '+80', 'label' => 'Destinations eVisa'],
                    ['value' => '48h', 'label' => 'Délai traitement moyen'],
                    ['value' => '100%', 'label' => 'En ligne, sans déplacement'],
                ],
            ]],
            ['page' => 'home', 'section_key' => 'services', 'display_order' => 3, 'content' => [
                'eyebrow' => 'Ce que nous proposons',
                'title' => 'Nos services',
                'subtitle' => 'De la demande de visa à la réservation complète — un accompagnement à chaque étape de votre voyage.',
                'items' => [
                    ['icon' => 'id-card', 'color' => 'blue', 'featured' => true, 'title' => 'eVisa en ligne', 'text' => 'Demandez votre visa électronique pour +80 pays directement depuis notre plateforme. Traitement rapide, sans rendez-vous.', 'link_label' => 'Commencer ma demande', 'link_url' => '/evisa'],
                    ['icon' => 'mosque', 'color' => 'green', 'featured' => false, 'title' => 'Voyages Omra', 'text' => 'Offres Omra tout compris depuis Alger — vols, hôtels 5★ à La Mecque et Médine, accompagnement spirituel.', 'link_label' => 'Voir les départs', 'link_url' => '/omra'],
                    ['icon' => 'plane', 'color' => 'gold', 'featured' => false, 'title' => "Billets d'avion", 'text' => "Recherche et réservation de billets d'avion aux meilleurs tarifs. Vols domestiques et internationaux.", 'link_label' => 'Nous contacter', 'link_url' => '/#contact'],
                    ['icon' => 'shield-alt', 'color' => 'navy', 'featured' => false, 'title' => 'Assurance voyage', 'text' => "Protégez votre voyage avec nos contrats d'assurance adaptés — annulation, bagages, rapatriement médical.", 'link_label' => 'En savoir plus', 'link_url' => '/#contact'],
                    ['icon' => 'hotel', 'color' => 'blue', 'featured' => false, 'title' => 'Hôtels & Séjours', 'text' => "Réservation d'hôtels dans le monde entier. Séjours balnéaires, city breaks, voyages organisés.", 'link_label' => 'Demander un devis', 'link_url' => '/#contact'],
                    ['icon' => 'headset', 'color' => 'gold', 'featured' => false, 'title' => 'Assistance 24/7', 'text' => "Notre équipe reste joignable avant, pendant et après votre voyage. Un doute ? Nous sommes là.", 'link_label' => 'Nous joindre', 'link_url' => '/#contact'],
                ],
            ]],
            ['page' => 'home', 'section_key' => 'evisa_cta', 'display_order' => 4, 'content' => [
                'badge' => '✨ 100% en ligne',
                'title' => "Obtenez votre eVisa\nen quelques clics",
                'text' => "Plus de 80 pays disponibles : Turquie, USA, Schengen, Cambodge, Sri Lanka, Inde, Éthiopie... Déposez vos documents, nous nous occupons du reste.",
                'flags' => ['🇹🇷', '🇺🇸', '🇮🇳', '🇰🇭', '🇪🇹', '🇱🇰', '🇹🇭', '🇨🇦'],
                'cta_label' => 'Commencer ma demande',
                'cta_url' => '/evisa',
            ]],
            ['page' => 'home', 'section_key' => 'omra_highlight', 'display_order' => 5, 'content' => [
                'title' => 'برامج العمرة — رحلات روحانية لا تُنسى',
                'text' => 'رحلات العمرة من الجزائر — طيران مباشر، فنادق 5 نجوم بمكة المكرمة والمدينة المنورة',
                'price_label' => 'à partir de',
                'price_value' => '195 000',
                'price_currency' => 'DZD / pers.',
                'cta_browse_label' => 'استعراض العروض',
                'cta_simulate_label' => 'حساب السعر',
            ]],
            ['page' => 'home', 'section_key' => 'why_choose', 'display_order' => 6, 'content' => [
                'eyebrow' => 'Notre engagement',
                'title' => 'Pourquoi choisir Aelia Travel ?',
                'items' => [
                    ['icon' => '⚡', 'title' => 'Rapide & Simple', 'text' => 'Procédure 100% en ligne, guidée étape par étape. Aucun déplacement requis.'],
                    ['icon' => '🔒', 'title' => 'Sécurisé', 'text' => 'Vos documents et données personnelles sont protégés avec le plus grand soin.'],
                    ['icon' => '🏆', 'title' => 'Expert agréé', 'text' => 'Agence de voyages agréée, partenaire de confiance pour vos démarches consulaires.'],
                    ['icon' => '💬', 'title' => 'Support dédié', 'text' => 'Une équipe disponible pour répondre à toutes vos questions, à chaque instant.'],
                ],
            ]],
            ['page' => 'home', 'section_key' => 'contact_info', 'display_order' => 7, 'content' => [
                'eyebrow' => 'Nous joindre',
                'title' => 'Parlons de votre voyage',
                'text' => 'Notre équipe est à votre écoute pour tout projet de voyage, demande de visa ou devis sur mesure.',
                'address' => 'Alger, Algérie',
                'phone' => '+213 XX XX XX XX',
                'email' => 'contact@aeliatravelagency.dz',
                'whatsapp' => '+213 XX XX XX XX',
            ]],
            ['page' => 'home', 'section_key' => 'footer', 'display_order' => 8, 'content' => [
                'tagline' => "Agence de voyages à Alger spécialisée dans les eVisas en ligne, les voyages Omra et les séjours sur mesure.",
                'social' => ['facebook' => '#', 'instagram' => '#', 'whatsapp' => '#', 'youtube' => '#'],
                'agreement_number' => 'XXXXXXX',
            ]],

            // ===================== PAGE EVISA =====================
            ['page' => 'evisa', 'section_key' => 'hero', 'display_order' => 1, 'content' => [
                'badge' => '🛂 Visa électronique en ligne',
                'title' => "Demandez votre eVisa\nen 3 étapes simples",
                'subtitle' => "Choisissez votre destination, sélectionnez le type de visa, déposez vos documents. Notre équipe traite votre dossier rapidement.",
            ]],

            // ===================== PAGE OMRA =====================
            ['page' => 'omra', 'section_key' => 'hero', 'display_order' => 1, 'content' => [
                'title' => 'رحلة العمرة تبدأ من هنا',
                'subtitle' => 'برامج عمرة متكاملة من الجزائر — طيران مباشر، فنادق 5 نجوم قريبة من الحرمين الشريفين، وخدمة مرافقة كاملة',
                'cta_browse_label' => 'استعراض المواعيد المتوفرة',
                'cta_simulate_label' => 'احسب السعر التقريبي',
            ]],
        ];

        foreach ($rows as $row) {
            SiteContent::updateOrCreate(
                ['page' => $row['page'], 'section_key' => $row['section_key']],
                ['content' => $row['content'], 'display_order' => $row['display_order'], 'is_active' => true]
            );
        }
    }
}
