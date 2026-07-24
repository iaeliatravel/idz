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
    // ---- TOURS (Voyages) ----
    public function index()
    {
        return response()->json(Tour::orderByDesc('departure_date')->get());
    }

    public function store(Request $request)
    {
        $data = $this->validateTour($request);
        $data['slug'] = Str::slug($data['title_fr']) . '-' . rand(100, 999);
        $tour = Tour::create($data);
        return response()->json($tour, 201);
    }

    public function update(Request $request, Tour $tour)
    {
        $data = $this->validateTour($request);
        $tour->update($data);
        return response()->json(['success' => true]);
    }

    public function destroy(Tour $tour)
    {
        if ($tour->bookings()->exists()) {
            $tour->update(['is_active' => false]);
            return response()->json(['success' => true, 'message' => 'Voyage désactivé car lié à des réservations.']);
        }
        $tour->delete();
        return response()->json(['success' => true]);
    }

    public function duplicate(Tour $tour)
    {
        $clone = $tour->replicate();
        $clone->title_fr = $tour->title_fr . ' (Copie)';
        $clone->slug = Str::slug($clone->title_fr) . '-' . rand(100, 999);
        $clone->is_active = false;
        $clone->save();
        return response()->json(['success' => true, 'tour' => $clone]);
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
            'price_child_dzd' => ['nullable', 'numeric', 'min:0'],
            'description_fr' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'seats_total' => ['nullable', 'integer'],
            'seats_remaining' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);
    }

    // ---- BOOKINGS (Réservations) ----
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