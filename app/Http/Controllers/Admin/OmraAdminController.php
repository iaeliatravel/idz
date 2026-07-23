<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OmraAirline;
use App\Models\OmraDeparture;
use App\Models\OmraHotel;
use App\Models\OmraHotelImage;
use App\Models\OmraPackage;
use App\Models\OmraPartner;
use App\Models\OmraPrebooking;
use App\Models\OmraPricing;
use App\Models\OmraSimulation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OmraAdminController extends Controller
{
    // ── KPIs ────────────────────────────────────────────────────────────────
    public function kpis()
    {
        return response()->json([
            'totalPb'   => OmraPrebooking::count(),
            'nouveauPb' => OmraPrebooking::where('status', 'nouveau')->count(),
            'confirme'  => OmraPrebooking::where('status', 'confirme')->count(),
            'ca'        => OmraPrebooking::whereNotIn('status', ['annule'])->sum('estimated_total_dzd'),
            'benefice'  => OmraPrebooking::whereNotIn('status', ['annule'])
                ->selectRaw('COALESCE(SUM(estimated_total_dzd - cost_total_dzd),0) as total')
                ->value('total'),
            'totalSim'  => OmraSimulation::count(),
            'totalDep'  => OmraDeparture::where('is_active', true)->count(),
            'byStatus'  => OmraPrebooking::select('status', DB::raw('COUNT(*) as cnt'))->groupBy('status')->get(),
        ]);
    }

    // ── Partenaires ──────────────────────────────────────────────────────────
    public function partnersIndex()   { return response()->json(OmraPartner::orderBy('name')->get()); }
    public function partnersStore(Request $r)
    {
        $d = $r->validate(['name' => ['required','string','max:160'], 'contact' => ['nullable','string','max:160'], 'phone' => ['nullable','string','max:40'], 'notes' => ['nullable','string']]);
        return response()->json(OmraPartner::create($d), 201);
    }
    public function partnersUpdate(Request $r, OmraPartner $partner)
    {
        $d = $r->validate(['name' => ['required','string','max:160'], 'contact' => ['nullable','string','max:160'], 'phone' => ['nullable','string','max:40'], 'notes' => ['nullable','string']]);
        $partner->update($d);
        return response()->json(['success' => true]);
    }
    public function partnersDestroy(OmraPartner $partner) { $partner->delete(); return response()->json(['success' => true]); }

    // ── Compagnies aériennes ─────────────────────────────────────────────────
    public function airlinesIndex() { return response()->json(OmraAirline::orderBy('name')->get()); }

    public function airlinesStore(Request $request)
    {
        $data = $request->validate(['name' => ['required','string','max:120'], 'logo' => ['nullable','image','max:8192']]);
        $logoUrl = null;
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('airlines', 'public');
            $logoUrl = '/storage/'.$path;
        }
        return response()->json(OmraAirline::create(['name' => $data['name'], 'logo_url' => $logoUrl]), 201);
    }

    public function airlinesUpdate(Request $request, OmraAirline $airline)
    {
        $data = $request->validate(['name' => ['required','string','max:120'], 'logo' => ['nullable','image','max:8192']]);
        $update = ['name' => $data['name']];
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('airlines', 'public');
            $update['logo_url'] = '/storage/'.$path;
        }
        $airline->update($update);
        return response()->json(['success' => true]);
    }

    public function airlinesDestroy(OmraAirline $airline) { $airline->delete(); return response()->json(['success' => true]); }

    // ── Hôtels ───────────────────────────────────────────────────────────────
    public function hotelsIndex() { return response()->json(OmraHotel::with('images')->orderBy('city')->orderBy('name')->get()); }

    public function hotelsStore(Request $r)   { return response()->json(OmraHotel::create($this->validateHotel($r)), 201); }
    public function hotelsUpdate(Request $r, OmraHotel $hotel) { $hotel->update($this->validateHotel($r)); return response()->json(['success' => true]); }
    public function hotelsDestroy(OmraHotel $hotel) { $hotel->delete(); return response()->json(['success' => true]); }

    private function validateHotel(Request $r): array
    {
        return $r->validate([
            'name'           => ['required','string','max:160'],
            'city'           => ['required','string','in:mecque,medine'],
            'stars'          => ['nullable','integer','min:1','max:5'],
            'distance_haram' => ['nullable','string','max:80'],
            'map_url'        => ['nullable','string','max:500'],
            'latitude'       => ['nullable','numeric'],
            'longitude'      => ['nullable','numeric'],
            'description'    => ['nullable','string'],
            'is_active' => ['nullable','boolean'], 'cover_image_url' => ['nullable','string','max:500'],
        ]);
    }

    public function hotelsUploadImages(Request $request, OmraHotel $hotel)
    {
        $request->validate(['images' => ['required','array'], 'images.*' => ['image','max:8192']]);
        $inserted = [];
        foreach ($request->file('images') as $file) {
            $path = $file->store("hotels/{$hotel->id}", 'public');
            $inserted[] = OmraHotelImage::create(['hotel_id' => $hotel->id, 'image_url' => '/storage/'.$path]);
        }
        return response()->json(['success' => true, 'images' => $inserted]);
    }

    public function hotelImagesDestroy(OmraHotelImage $image) { $image->delete(); return response()->json(['success' => true]); }

    // ── Départs ──────────────────────────────────────────────────────────────
    public function departuresIndex()
    {
        return response()->json(
            OmraDeparture::with(['airline', 'partner', 'packages.mecqueHotel', 'packages.medineHotel', 'packages.pricing'])
                ->orderByDesc('departure_date')
                ->get()
                ->map(fn ($d) => $this->formatDepartureForAdmin($d))
        );
    }

    public function departuresStore(Request $request)
    {
        $data = $this->validateDeparture($request);
        $departure = DB::transaction(function () use ($data, $request) {
            $departure = OmraDeparture::create($data);
            $this->syncPackages($departure, $request);
            return $departure;
        });
        return response()->json($this->formatDepartureForAdmin($departure->fresh(['packages.mecqueHotel','packages.medineHotel','packages.pricing'])), 201);
    }

    public function departuresUpdate(Request $request, OmraDeparture $departure)
    {
        $data = $this->validateDeparture($request);
        DB::transaction(function () use ($data, $departure, $request) {
            $departure->update($data);
            // Supprime les anciennes formules (cascade supprime aussi leur pricing)
            $departure->packages()->delete();
            $this->syncPackages($departure, $request);
        });
        return response()->json(['success' => true]);
    }

    public function departuresDestroy(OmraDeparture $departure) { $departure->delete(); return response()->json(['success' => true]); }

    private function validateDeparture(Request $request): array
    {
        return $request->validate([
            'title_ar'                 => ['required','string','max:200'],
            'partner_id'               => ['nullable','integer','exists:omra_partners,id'],
            'airline_id'               => ['nullable','integer','exists:omra_airlines,id'],
            'departure_date'           => ['required','date'],
            'departure_time'           => ['nullable'],
            'departure_airport'        => ['nullable','string','max:160'],
            'arrival_airport'          => ['nullable','string','max:160'],
            'outbound_itinerary'       => ['nullable','string'],
            'return_date'              => ['required','date'],
            'return_time'              => ['nullable'],
            'return_departure_airport' => ['nullable','string','max:160'],
            'return_arrival_airport'   => ['nullable','string','max:160'],
            'return_itinerary'         => ['nullable','string'],
            'duration_nights'          => ['nullable','integer'],
            'status'                   => ['nullable','string','in:ouvert,complet,clos,brouillon'],
            'seats_total'              => ['nullable','integer'],
            'seats_remaining'          => ['nullable','integer'],
            'is_active' => ['nullable','boolean'], 'cover_image_url' => ['nullable','string','max:500'],
        ]);
    }

    /**
     * Crée les packages (formules) d'un départ depuis le payload JSON.
     * CORRECTION : on accepte le JSON soit en champ string (multipart)
     * soit en champ array (JSON request).
     */
    private function syncPackages(OmraDeparture $departure, Request $request): void
    {
        $packages = $request->input('packages');

        // Si le frontend envoie une string JSON (FormData), on la décode
        if (is_string($packages)) {
            $packages = json_decode($packages, true) ?: [];
        }

        if (empty($packages) || ! is_array($packages)) {
            Log::warning('[Omra] syncPackages : aucun package reçu', [
                'departure_id' => $departure->id,
                'raw'          => $request->input('packages'),
            ]);
            return;
        }

        foreach ($packages as $i => $pkgData) {
            if (empty($pkgData['mecque_hotel_id']) && empty($pkgData['medine_hotel_id'])) {
                continue;
            }

            $package = OmraPackage::create([
                'departure_id'    => $departure->id,
                'mecque_hotel_id' => $pkgData['mecque_hotel_id'] ?: null,
                'mecque_nights'   => (int) ($pkgData['mecque_nights'] ?? 0),
                'medine_hotel_id' => $pkgData['medine_hotel_id'] ?: null,
                'medine_nights'   => (int) ($pkgData['medine_nights'] ?? 0),
                'label'           => $pkgData['label'] ?? null,
                'is_active'       => true,
                'display_order'   => $i,
            ]);

            foreach ((array) ($pkgData['pricing'] ?? []) as $p) {
                if (empty($p['occupancy'])) continue;
                OmraPricing::create([
                    'package_id'               => $package->id,
                    'occupancy'                => $p['occupancy'],
                    'adult_cost_dzd'           => (float) ($p['adult_cost']      ?? 0),
                    'adult_sale_dzd'           => (float) ($p['adult_sale']      ?? 0),
                    'child_with_bed_cost_dzd'  => (float) ($p['child_bed_cost']  ?? 0),
                    'child_with_bed_sale_dzd'  => (float) ($p['child_bed_sale']  ?? 0),
                    'child_no_bed_cost_dzd'    => (float) ($p['child_nobed_cost']?? 0),
                    'child_no_bed_sale_dzd'    => (float) ($p['child_nobed_sale']?? 0),
                    'infant_cost_dzd'          => (float) ($p['infant_cost']     ?? 0),
                    'infant_sale_dzd'          => (float) ($p['infant_sale']     ?? 0),
                ]);
            }
        }
    }

    private function formatDepartureForAdmin(OmraDeparture $d): array
    {
        $arr = $d->toArray();
        $arr['airline_name'] = $d->airline->name ?? null;
        $arr['partner_name'] = $d->partner->name ?? null;
        $arr['packages'] = ($d->packages ?? collect())->map(function ($pkg) {
            return [
                'id'                => $pkg->id,
                'label'             => $pkg->label,
                'mecque_hotel_id'   => $pkg->mecque_hotel_id,
                'mecque_hotel_name' => $pkg->mecqueHotel->name ?? null,
                'mecque_nights'     => $pkg->mecque_nights,
                'medine_hotel_id'   => $pkg->medine_hotel_id,
                'medine_hotel_name' => $pkg->medineHotel->name ?? null,
                'medine_nights'     => $pkg->medine_nights,
                'pricing'           => $pkg->pricing ?? [],
            ];
        })->values();
        return $arr;
    }

    // ── Pré-réservations ────────────────────────────────────────────────────
    public function prebookingsIndex(Request $request)
    {
        $query = OmraPrebooking::with(['departure', 'package.mecqueHotel', 'package.medineHotel', 'travelers']);
        if ($request->filled('status')) $query->where('status', $request->input('status'));
        $limit = (int) $request->input('limit', 20);
        $page  = (int) $request->input('page', 1);
        return response()->json(
            $query->orderByDesc('created_at')->skip(($page - 1) * $limit)->take($limit)->get()
                ->map(function ($pb) {
                    $arr = $pb->toArray();
                    $arr['departure_title']    = $pb->departure->title_ar ?? null;
                    $arr['departure_date']     = $pb->departure->departure_date ?? null;
                    $arr['mecque_hotel_name']  = $pb->package->mecqueHotel->name ?? null;
                    $arr['medine_hotel_name']  = $pb->package->medineHotel->name ?? null;
                    $arr['benefit']            = $pb->benefit;
                    return $arr;
                })
        );
    }

    public function prebookingsUpdate(Request $request, OmraPrebooking $prebooking)
    {
        $data = $request->validate(['status' => ['required','string','in:nouveau,contacte,confirme,annule'], 'admin_notes' => ['nullable','string']]);
        $prebooking->update($data);
        return response()->json(['success' => true]);
    }

    // ── Simulations ──────────────────────────────────────────────────────────
    public function simulationsIndex()
    {
        return response()->json(
            OmraSimulation::with(['departure', 'package.mecqueHotel'])
                ->orderByDesc('created_at')->limit(200)->get()
                ->map(function ($s) {
                    $arr = $s->toArray();
                    $arr['departure_title']   = $s->departure->title_ar ?? null;
                    $arr['departure_date']    = $s->departure->departure_date ?? null;
                    $arr['mecque_hotel_name'] = $s->package->mecqueHotel->name ?? null;
                    return $arr;
                })
        );
    }
}
