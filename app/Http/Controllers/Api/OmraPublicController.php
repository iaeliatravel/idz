<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OmraPrebookingAlert;
use App\Models\OmraDeparture;
use App\Models\OmraHotel;
use App\Models\OmraPackage;
use App\Models\OmraPrebooking;
use App\Models\OmraPrebookingTraveler;
use App\Models\OmraPricing;
use App\Models\OmraSimulation;
use App\Models\Setting;
use App\Support\RecaptchaVerifier;
use App\Support\RefGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class OmraPublicController extends Controller
{
    /**
     * GET /api/omra/departures
     * Liste des départs avec, pour chaque départ, un aperçu du prix le plus
     * bas parmi ses formules actives (utile pour l'affichage "à partir de").
     */
    public function departures()
    {
        $departures = OmraDeparture::with(['airline', 'activePackages.mecqueHotel', 'activePackages.pricing'])
            ->where('is_active', true)
            ->whereIn('status', ['ouvert', 'complet'])
            ->orderBy('departure_date')
            ->get()
            ->map(function ($d) {
                $packages = $d->activePackages;

                // Prix le plus bas tous packages/occupancy confondus, pour l'aperçu "à partir de".
                $lowestPrice = $packages
                    ->flatMap(fn ($p) => $p->pricing)
                    ->pluck('adult_sale_dzd')
                    ->filter(fn ($v) => $v > 0)
                    ->min();

                return [
                    'id' => $d->id,
                    'title_ar' => $d->title_ar,
                    'departure_date' => $d->departure_date,
                    'return_date' => $d->return_date,
                    'duration_nights' => $d->duration_nights,
                    'status' => $d->status,
                    'seats_remaining' => $d->seats_remaining,
                    'departure_airport' => $d->departure_airport,
                    'arrival_airport' => $d->arrival_airport,
                    'airline_name' => $d->airline->name ?? null,
                    'airline_logo' => $d->airline->logo_url ?? null,
                    'nb_packages' => $packages->count(),
                    'from_price_dzd' => $lowestPrice,
                ];
            });

        return response()->json($departures);
    }

    /**
     * GET /api/omra/departures/{id}
     * Détail d'un départ avec toutes ses formules (packages), chacune avec
     * son hôtel Mecque (affiché en priorité), son hôtel Médine, et sa propre
     * grille tarifaire.
     */
    public function show(int $id)
    {
        $departure = OmraDeparture::with([
            'airline',
            'activePackages.mecqueHotel.images',
            'activePackages.medineHotel.images',
            'activePackages.pricing',
        ])->findOrFail($id);

        $packages = $departure->activePackages->map(fn ($pkg) => $this->formatPackage($pkg));

        $data = $departure->toArray();
        unset($data['partner_id'], $data['packages'], $data['active_packages']);
        $data['packages'] = $packages;

        return response()->json($data);
    }

    /**
     * GET /api/omra/hotels — liste simplifiée publique (utilisée pour filtres divers)
     */
    public function hotels()
    {
        return response()->json(
            OmraHotel::where('is_active', true)
                ->select('id', 'name', 'city', 'stars', 'distance_haram')
                ->orderBy('city')->orderBy('name')
                ->get()
        );
    }

    /**
     * POST /api/omra/simulate
     * Le client choisit désormais un package_id (= une formule hôtel Mecque
     * + hôtel Médine précise) plutôt qu'un simple departure_id, car le prix
     * dépend de la formule.
     */
    public function simulate(Request $request)
    {
        $data = $request->validate([
            'package_id' => ['required', 'integer', 'exists:omra_packages,id'],
            'occupancy' => ['required', 'string', 'in:quintuple,quadruple,triple,double'],
            'nb_adults' => ['nullable', 'integer', 'min:0'],
            'nb_children_bed' => ['nullable', 'integer', 'min:0'],
            'nb_children_nobed' => ['nullable', 'integer', 'min:0'],
            'nb_infants' => ['nullable', 'integer', 'min:0'],
            'full_name' => ['nullable', 'string', 'max:160'],
            'phone' => ['nullable', 'string', 'max:40'],
        ]);

        $package = OmraPackage::findOrFail($data['package_id']);

        $pricing = OmraPricing::where('package_id', $package->id)
            ->where('occupancy', $data['occupancy'])
            ->first();

        if (! $pricing) {
            return response()->json(['error' => 'Tarif non trouvé pour cette configuration.'], 404);
        }

        $adults = $data['nb_adults'] ?? 1;
        $childBed = $data['nb_children_bed'] ?? 0;
        $childNoBed = $data['nb_children_nobed'] ?? 0;
        $infants = $data['nb_infants'] ?? 0;

        $total = $adults * $pricing->adult_sale_dzd
            + $childBed * $pricing->child_with_bed_sale_dzd
            + $childNoBed * $pricing->child_no_bed_sale_dzd
            + $infants * $pricing->infant_sale_dzd;

        $costTotal = $adults * $pricing->adult_cost_dzd
            + $childBed * $pricing->child_with_bed_cost_dzd
            + $childNoBed * $pricing->child_no_bed_cost_dzd
            + $infants * $pricing->infant_cost_dzd;

        OmraSimulation::create([
            'departure_id' => $package->departure_id,
            'package_id' => $package->id,
            'full_name' => $data['full_name'] ?? null,
            'phone' => $data['phone'] ?? null,
            'nb_adults' => $adults,
            'nb_children_bed' => $childBed,
            'nb_children_nobed' => $childNoBed,
            'nb_infants' => $infants,
            'occupancy' => $data['occupancy'],
            'estimated_total_dzd' => $total,
        ]);

        return response()->json([
            'total_dzd' => number_format($total, 2, '.', ''),
            'cost_dzd' => number_format($costTotal, 2, '.', ''),
            'breakdown' => [
                'adults' => ['count' => $adults, 'unit' => $pricing->adult_sale_dzd, 'subtotal' => $adults * $pricing->adult_sale_dzd],
                'children_with_bed' => ['count' => $childBed, 'unit' => $pricing->child_with_bed_sale_dzd, 'subtotal' => $childBed * $pricing->child_with_bed_sale_dzd],
                'children_no_bed' => ['count' => $childNoBed, 'unit' => $pricing->child_no_bed_sale_dzd, 'subtotal' => $childNoBed * $pricing->child_no_bed_sale_dzd],
                'infants' => ['count' => $infants, 'unit' => $pricing->infant_sale_dzd, 'subtotal' => $infants * $pricing->infant_sale_dzd],
            ],
        ]);
    }

    /**
     * POST /api/omra/prebook
     */
    public function prebook(Request $request)
    {
        $data = $request->validate([
            'departure_id' => ['required', 'integer', 'exists:omra_departures,id'],
            'package_id' => ['required', 'integer', 'exists:omra_packages,id'],
            'occupancy' => ['required', 'string', 'in:quintuple,quadruple,triple,double'],
            'contact_name' => ['required', 'string', 'max:160'],
            'contact_phone' => ['required', 'string', 'max:40'],
            'contact_email' => ['nullable', 'email', 'max:180'],
            'nb_adults' => ['nullable', 'integer', 'min:0'],
            'nb_children_bed' => ['nullable', 'integer', 'min:0'],
            'nb_children_nobed' => ['nullable', 'integer', 'min:0'],
            'nb_infants' => ['nullable', 'integer', 'min:0'],
            'travelers' => ['nullable', 'string'], // JSON encodé côté client
            'recaptcha_token' => ['nullable', 'string'],
        ]);

        if (! RecaptchaVerifier::verify($data['recaptcha_token'] ?? null, 'omra_prebook')) {
            return response()->json(['error' => 'Vérification anti-spam échouée. Merci de réessayer.'], 422);
        }

        $pricing = OmraPricing::where('package_id', $data['package_id'])
            ->where('occupancy', $data['occupancy'])
            ->first();

        $adults = $data['nb_adults'] ?? 1;
        $childBed = $data['nb_children_bed'] ?? 0;
        $childNoBed = $data['nb_children_nobed'] ?? 0;
        $infants = $data['nb_infants'] ?? 0;

        $total = $pricing
            ? $adults * $pricing->adult_sale_dzd + $childBed * $pricing->child_with_bed_sale_dzd
                + $childNoBed * $pricing->child_no_bed_sale_dzd + $infants * $pricing->infant_sale_dzd
            : 0;

        $costTotal = $pricing
            ? $adults * $pricing->adult_cost_dzd + $childBed * $pricing->child_with_bed_cost_dzd
                + $childNoBed * $pricing->child_no_bed_cost_dzd + $infants * $pricing->infant_cost_dzd
            : 0;

        $prebooking = DB::transaction(function () use ($data, $adults, $childBed, $childNoBed, $infants, $total, $costTotal, $request) {
            $prebooking = OmraPrebooking::create([
                'reference' => RefGenerator::omra(),
                'departure_id' => $data['departure_id'],
                'package_id' => $data['package_id'],
                'occupancy' => $data['occupancy'],
                'contact_name' => $data['contact_name'],
                'contact_phone' => $data['contact_phone'],
                'contact_email' => $data['contact_email'] ?? null,
                'nb_adults' => $adults,
                'nb_children_bed' => $childBed,
                'nb_children_nobed' => $childNoBed,
                'nb_infants' => $infants,
                'estimated_total_dzd' => $total,
                'cost_total_dzd' => $costTotal,
            ]);

            $travelers = [];
            if (! empty($data['travelers'])) {
                $travelers = json_decode($data['travelers'], true) ?: [];
            }

            foreach ($travelers as $i => $traveler) {
                $passportFile = $request->file("passport_{$i}");
                $passportPath = null;

                if ($passportFile) {
                    $path = $passportFile->store("passports/omra/{$prebooking->id}", 'public');
                    $passportPath = '/storage/'.$path;
                }

                OmraPrebookingTraveler::create([
                    'prebooking_id' => $prebooking->id,
                    'full_name' => $traveler['full_name'] ?? 'N/A',
                    'traveler_type' => $traveler['type'] ?? 'adulte',
                    'passport_scan_path' => $passportPath,
                ]);
            }

            return $prebooking;
        });

        $prebooking->load(['departure', 'package.mecqueHotel', 'package.medineHotel']);

        $alertTo = Setting::get('alert_email', config('mail.from.address'));
        Mail::to($alertTo)->send(new OmraPrebookingAlert($prebooking));

        return response()->json([
            'success' => true,
            'reference' => $prebooking->reference,
            'prebooking_id' => $prebooking->id,
        ], 201);
    }

    /**
     * Formate une formule (package) pour l'API publique :
     * l'hôtel Mecque est mis en avant (utilisé pour distinguer les formules
     * entre elles dans l'affichage), l'hôtel Médine reste secondaire mais
     * toujours présent.
     */
    private function formatPackage(OmraPackage $pkg): array
    {
        $mecque = $pkg->mecqueHotel;
        $medine = $pkg->medineHotel;

        $pricing = $pkg->pricing->map(function ($p) {
            $arr = $p->toArray();
            $arr['adult_benefit'] = $p->adult_benefit;
            $arr['child_bed_benefit'] = $p->child_bed_benefit;
            $arr['child_nobed_benefit'] = $p->child_nobed_benefit;
            $arr['infant_benefit'] = $p->infant_benefit;

            return $arr;
        });

        return [
            'id' => $pkg->id,
            'label' => $pkg->label,
            'mecque_hotel' => $mecque ? [
                'id' => $mecque->id,
                'name' => $mecque->name,
                'stars' => $mecque->stars,
                'distance_haram' => $mecque->distance_haram,
                'images' => $mecque->images->pluck('image_url')->toArray(),
                'nights' => $pkg->mecque_nights,
            ] : null,
            'medine_hotel' => $medine ? [
                'id' => $medine->id,
                'name' => $medine->name,
                'stars' => $medine->stars,
                'distance_haram' => $medine->distance_haram,
                'images' => $medine->images->pluck('image_url')->toArray(),
                'nights' => $pkg->medine_nights,
            ] : null,
            'pricing' => $pricing,
        ];
    }
}
