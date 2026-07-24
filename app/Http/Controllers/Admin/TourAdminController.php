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
    // ---- TOURS (Voyages organisés) ----
    public function index()
    {
        // On charge la relation hotelOptions pour l'affichage et l'édition dans l'admin
        return response()->json(Tour::with('hotelOptions')->orderByDesc('departure_date')->get());
    }

    public function store(Request $request)
    {
        $data = $this->validateTour($request);
        $data['slug'] = Str::slug($data['title_fr']) . '-' . rand(100, 999);
        
        $tour = DB::transaction(function () use ($data, $request) {
            $tour = Tour::create($data);
            $this->syncHotelOptions($tour, $request->input('hotel_options', []));
            return $tour;
        });

        return response()->json($tour->load('hotelOptions'), 201);
    }

    public function update(Request $request, Tour $tour)
    {
        $data = $this->validateTour($request);
        
        DB::transaction(function () use ($data, $tour, $request) {
            $tour->update($data);
            // On supprime les anciennes options d'hôtels et tarifs pour ré-enregistrer les nouvelles
            $tour->hotelOptions()->delete();
            $this->syncHotelOptions($tour, $request->input('hotel_options', []));
        });

        return response()->json(['success' => true]);
    }

    public function destroy(Tour $tour)
    {
        if ($tour->bookings()->exists()) {
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

            // Duplication des formules d'hôtels et tarifs associées
            foreach ($tour->hotelOptions as $opt) {
                $newOpt = $opt->replicate();
                $newOpt->tour_id = $clone->id;
                $newOpt->save();
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
            'departure_date' => ['required', 'date'],
            'return_date' => ['required', 'date'],
            'price_dzd' => ['required', 'numeric', 'min:0'],
            'seats_total' => ['nullable', 'integer'],
            'seats_remaining' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
            'remarks' => ['nullable', 'string'],
            'flights' => ['nullable', 'array'],         // Validé comme tableau JSON
            'program' => ['nullable', 'array'],         // Validé comme tableau JSON
            'included_pack' => ['nullable', 'array'],   // Validé comme tableau JSON
            'excluded_pack' => ['nullable', 'array'],   // Validé comme tableau JSON
        ]);
    }

    /**
     * Enregistre les options d'hôtels et tarifs du voyage organisé
     */
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

    // ---- BOOKINGS ----
    public function bookingsIndex()
    {
        return response()->json(TourBooking::with('tour')->orderByDesc('created_at')->get());
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