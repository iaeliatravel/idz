<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\EvisaApplicationAlert;
use App\Mail\EvisaApplicationConfirmation;
use App\Models\EvisaApplication;
use App\Models\EvisaApplicationFile;
use App\Models\EvisaApplicationTraveler;
use App\Models\EvisaCountry;
use App\Models\EvisaOption;
use App\Support\RecaptchaVerifier;
use App\Support\RefGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class EvisaPublicController extends Controller
{
    public function countries()
    {
        return response()->json(
            EvisaCountry::where('is_active', true)
                ->orderBy('display_order')
                ->orderBy('name_fr')
                ->get()
                ->map(fn ($c) => [
                    'id'             => $c->id,
                    'name_fr'        => $c->name_fr,
                    'slug'           => $c->slug,
                    'flag_emoji'     => $c->flag_emoji,
                    'flag_image_url' => $c->flag_image_url,
                    'region'         => $c->region,
                    'nb_options'     => $c->options()->where('is_active', true)->count(),
                ])
        );
    }

    public function country(string $slug)
    {
        $country = EvisaCountry::where('slug', $slug)
            ->where('is_active', true)
            ->with(['options' => fn ($q) => $q->where('is_active', true)->orderBy('display_order'), 'options.requiredDocuments'])
            ->firstOrFail();

        return response()->json([
            'id'          => $country->id,
            'name_fr'     => $country->name_fr,
            'name_ar'     => $country->name_ar,
            'flag_emoji'  => $country->flag_emoji,
            'flag_image_url' => $country->flag_image_url,
            'options'     => $country->options->map(fn ($o) => [
                'id'                 => $o->id,
                'label_fr'           => $o->label_fr,
                'label_ar'           => $o->label_ar,
                'type_color'         => $o->type_color,
                'delai_fr'           => $o->delai_fr,
                'validite_fr'        => $o->validite_fr,
                'sale_price_dzd'     => $o->sale_price_dzd,
                'cost_price_dzd'     => $o->cost_price_dzd,
                'note_fr'            => $o->note_fr,
                'conditions_fr'      => $o->conditions_fr,
                'required_documents' => $o->requiredDocuments->map(fn ($d) => [
                    'id'              => $d->id,
                    'label_fr'        => $d->label_fr,
                    'category'        => $d->category,
                    'is_required'     => $d->is_required,
                    'requires_upload' => $d->requires_upload,
                ]),
            ]),
        ]);
    }

    /**
     * POST /api/evisa/apply
     *
     * Gestion multi-voyageurs :
     * - Le voyageur principal est enregistré dans evisa_applications
     * - Les voyageurs supplémentaires dans evisa_application_travelers
     * - Chaque voyageur a ses propres fichiers (passeport, photo, etc.)
     * - Le prix total = nb_voyageurs × prix_unitaire
     * - sale_price_dzd = prix total (utilisé pour le paiement SlickPay)
     * - sale_price_per_person_dzd = prix unitaire (affiché par personne)
     */
    public function apply(Request $request)
    {
        $data = $request->validate([
            'country_id'      => ['required', 'integer', 'exists:evisa_countries,id'],
            'option_id'       => ['required', 'integer', 'exists:evisa_options,id'],
            'first_name'      => ['required', 'string', 'max:100'],
            'last_name'       => ['required', 'string', 'max:100'],
            'email'           => ['required', 'email', 'max:180'],
            'phone'           => ['required', 'string', 'max:40'],
            'passport_number' => ['required', 'string', 'max:60'],  // ← OBLIGATOIRE
            'travel_date'     => ['required', 'date'],               // ← OBLIGATOIRE
            'nb_travelers'    => ['nullable', 'integer', 'min:1', 'max:9'], // Limité à 9 ici aussi
            'message'         => ['nullable', 'string'],
            'recaptcha_token' => ['nullable', 'string'],
            // Voyageurs supplémentaires (JSON encodé)
            'extra_travelers' => ['nullable', 'string'],
        ]);

        if (! RecaptchaVerifier::verify($data['recaptcha_token'] ?? null, 'evisa_apply')) {
            return response()->json(['error' => 'Vérification anti-spam échouée.'], 422);
        }

        $option      = EvisaOption::findOrFail($data['option_id']);
        $nbTravelers = max(1, (int) ($data['nb_travelers'] ?? 1));

        // Prix total = prix unitaire × nombre de voyageurs
        $pricePerPerson = $option->sale_price_dzd;
        $totalPrice     = $pricePerPerson * $nbTravelers;
        $totalCost      = $option->cost_price_dzd * $nbTravelers;

        $application = DB::transaction(function () use ($data, $option, $nbTravelers, $pricePerPerson, $totalPrice, $totalCost, $request) {

            // ── Créer la demande principale ──────────────────────────────
            $application = EvisaApplication::create([
                'reference'                => RefGenerator::evisa(),
                'country_id'               => $data['country_id'],
                'option_id'                => $data['option_id'],
                'first_name'               => $data['first_name'],
                'last_name'                => $data['last_name'],
                'email'                    => $data['email'],
                'phone'                    => $data['phone'],
                'passport_number'          => $data['passport_number'],
                'travel_date'              => $data['travel_date'],
                'nb_travelers'             => $nbTravelers,
                'sale_price_dzd'           => $totalPrice,
                'sale_price_per_person_dzd'=> $pricePerPerson,
                'cost_price_dzd'           => $totalCost,
                'message'                  => $data['message'] ?? null,
                'status'                   => 'nouveau',
            ]);

            // ── Fichiers du voyageur principal ───────────────────────────
            $this->storeFiles($request, $application->id, null, 'main_');

            // ── Voyageurs supplémentaires ────────────────────────────────
            $extraTravelers = [];
            if (! empty($data['extra_travelers'])) {
                $extraTravelers = json_decode($data['extra_travelers'], true) ?: [];
            }

            foreach ($extraTravelers as $i => $t) {
                $traveler = EvisaApplicationTraveler::create([
                    'application_id'  => $application->id,
                    'first_name'      => $t['first_name'] ?? '',
                    'last_name'       => $t['last_name']  ?? '',
                    'passport_number' => $t['passport_number'] ?? null,
                    'travel_date'     => $t['travel_date'] ?? $data['travel_date'],
                    'order'           => $i + 1,
                ]);

                // Fichiers propres à ce voyageur (préfixés par traveler_{i}_)
                $this->storeFiles($request, $application->id, $traveler->id, "traveler_{$i}_");
            }

            return $application;
        });

        $application->load(['country', 'option']);

        /* // Emails
        try {
            $alertTo = \App\Models\Setting::get('alert_email', config('mail.from.address'));
            Mail::to($alertTo)->send(new EvisaApplicationAlert($application));
            Mail::to($application->email)->send(new EvisaApplicationConfirmation($application));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('[eVisa] Email envoi échoué: ' . $e->getMessage());
        }
        */
        return response()->json([
            'success'        => true,
            'reference'      => $application->reference,
            'application_id' => $application->id,
            'total_price'    => $totalPrice,
            'nb_travelers'   => $nbTravelers,
        ], 201);
    }

    /**
     * Enregistre les fichiers uploadés pour un voyageur donné.
     * Le préfixe permet de distinguer les fichiers de chaque voyageur.
     */
    private function storeFiles(Request $request, int $applicationId, ?int $travelerId, string $prefix): void
    {
        foreach ($request->allFiles() as $fieldName => $file) {
            if (! str_starts_with($fieldName, $prefix)) continue;
            if (is_array($file)) $file = $file[0];

            $path    = $file->store("evisa/{$applicationId}", 'public');
            $docLabel = str_replace([$prefix, '_'], ['', ' '], $fieldName);

            EvisaApplicationFile::create([
                'application_id' => $applicationId,
                'traveler_id'    => $travelerId,
                'document_label' => $docLabel,
                'file_path'      => '/storage/' . $path,
            ]);
        }
    }
}
