<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tour;
use App\Models\TourBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TourAdminController extends Controller
{
    public function index()
    {
        // On charge hotelOptions ET departures, et on trie par ID (car departure_date n'est plus dans tours)
        return response()->json(Tour::with(['hotelOptions', 'departures'])->orderByDesc('id')->get());
    }

    public function store(Request $request)
    {
        $data = $this->validateTour($request);
        $data['slug'] = Str::slug($data['title_fr']) . '-' . rand(100, 999);
        
        $tour = DB::transaction(function () use ($data, $request) {
            $tour = Tour::create($data);
            $this->syncHotelOptions($tour, $request->input('hotel_options', []));
            $this->syncDepartures($tour, $request->input('departures', []));
            return $tour;
        });

        return response()->json($tour->load(['hotelOptions', 'departures']), 201);
    }

    public function update(Request $request, Tour $tour)
    {
        $data = $this->validateTour($request);
        
        DB::transaction(function () use ($data, $tour, $request) {
            $tour->update($data);
            
            $tour->hotelOptions()->delete();
            $this->syncHotelOptions($tour, $request->input('hotel_options', []));
            
            $this->syncDepartures($tour, $request->input('departures', []));
        });

        return response()->json(['success' => true]);
    }

    public function destroy(Tour $tour)
    {
        // Vérifie si des réservations existent pour un des départs de ce voyage
        $hasBookings = \App\Models\TourBooking::whereHas('departure', function($q) use ($tour) {
            $q->where('tour_id', $tour->id);
        })->exists();

        if ($hasBookings) {
            $tour->update(['is_active' => false]);
            return response()->json(['success' => true, 'message' => 'Voyage organisé désactivé car lié à des réservations.']);
        }
        $tour->delete();
        return response()->json(['success' => true]);
    }

    public function duplicate(Tour $tour)
    {
        $newTour = DB::transaction(function () use ($tour) {
            $clone = $tour->replicate();
            $clone->title_fr = $tour->title_fr . ' (Copie)';
            $clone->slug = Str::slug($clone->title_fr) . '-' . rand(100, 999);
            $clone->is_active = false;
            $clone->save();

            foreach ($tour->hotelOptions as $opt) {
                $newOpt = $opt->replicate();
                $newOpt->tour_id = $clone->id;
                $newOpt->save();
            }

            foreach ($tour->departures as $dep) {
                $newDep = $dep->replicate();
                $newDep->tour_id = $clone->id;
                $newDep->save();
            }

            return $clone;
        });

        return response()->json(['success' => true, 'tour' => $newTour]);
    }

    public function uploadCover(Request $request, Tour $tour)
    {
        $request->validate(['image' => ['required', 'image', 'max:8192']]);
        $path = $request->file('image')->store('tours', 'public');
        $url = '/storage/' . $path;
        $tour->update(['cover_image_url' => $url]);
        return response()->json(['success' => true, 'url' => $url]);
    }

    private function validateTour(Request $request): array
    {
        return $request->validate([
            'title_fr' => ['required', 'string', 'max:200'],
            'title_ar' => ['nullable', 'string', 'max:200'],
            'destination' => ['required', 'string', 'max:160'],
            'price_dzd' => ['required', 'numeric', 'min:0'],
            'price_child_dzd' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'remarks' => ['nullable', 'string'],
            'program' => ['nullable', 'array'],
            'included_pack' => ['nullable', 'array'],
            'excluded_pack' => ['nullable', 'array'],
        ]);
    }

    private function syncHotelOptions(Tour $tour, array $options): void
    {
        foreach ($options as $i => $opt) {
            if (empty($opt['hotel_name'])) continue;
            $tour->hotelOptions()->create([
                'hotel_name' => $opt['hotel_name'],
                'room_type' => $opt['room_type'] ?? null,
                'price_double_dzd' => (float) ($opt['price_double_dzd'] ?? 0),
                'price_triple_dzd' => (float) ($opt['price_triple_dzd'] ?? 0),
                'price_single_dzd' => (float) ($opt['price_single_dzd'] ?? 0),
                'price_child_with_bed_dzd' => (float) ($opt['price_child_with_bed_dzd'] ?? 0),
                'price_child_no_bed_dzd' => (float) ($opt['price_child_no_bed_dzd'] ?? 0),
                'price_infant_dzd' => (float) ($opt['price_infant_dzd'] ?? 0),
                'display_order' => $i,
            ]);
        }
    }

    private function syncDepartures(Tour $tour, array $departures): void
    {
        $keptIds = [];
        foreach ($departures as $dep) {
            if (empty($dep['departure_date']) || empty($dep['return_date'])) continue;

            $record = $tour->departures()->updateOrCreate(
                ['id' => $dep['id'] ?? null], // Met à jour si l'ID existe, sinon crée
                [
                    'departure_date' => substr($dep['departure_date'], 0, 10),
                    'return_date' => substr($dep['return_date'], 0, 10),
                    'flights' => $dep['flights'] ?? [],
                    'seats_total' => $dep['seats_total'] ?? null,
                    'seats_remaining' => $dep['seats_remaining'] ?? null,
                    'is_active' => $dep['is_active'] ?? true,
                ]
            );
            $keptIds[] = $record->id;
        }

        // On masque les départs supprimés au lieu de les détruire (pour garder l'historique des réservations)
        $tour->departures()->whereNotIn('id', $keptIds)->update(['is_active' => false]);
    }

    // ---- BOOKINGS ----
    public function bookingsIndex()
    {
        return response()->json(TourBooking::with('departure.tour')->orderByDesc('created_at')->get());
    }

    public function bookingsUpdate(Request $request, TourBooking $booking)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:nouveau,contacte,confirme,annule'],
            'admin_notes' => ['nullable', 'string']
        ]);
        $booking->update($data);
        return response()->json(['success' => true]);
    }

    public function bookingsDestroy(TourBooking $booking)
    {
        $booking->delete();
        return response()->json(['success' => true]);
    }
}