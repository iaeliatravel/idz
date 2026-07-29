<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tour;
use App\Models\TourBooking;
use App\Support\RecaptchaVerifier;
use App\Support\RefGenerator;
use Illuminate\Http\Request;

class TourPublicController extends Controller
{
    public function index()
    {
        return response()->json(Tour::with(['departures', 'hotelOptions'])->where('is_active', true)->orderBy('departure_date')->get());
    }

    public function show(string $slug)
    {
        // On charge la relation 'hotelOptions' pour que le simulateur reçoive les tarifs
        $tour = Tour::where('slug', $slug)
            ->where('is_active', true)
            ->with('hotelOptions') // <-- C'est cette ligne qui fait la magie !
            ->firstOrFail();

        return response()->json($tour);
    }

    public function book(Request $request)
    {
        $data = $request->validate([
            'tour_departure_id' => ['required', 'integer'],
            'hotel_name' => ['nullable', 'string'],
            'room_type' => ['nullable', 'string'],
            'nb_adults' => ['required', 'integer'],
            'nb_children_bed' => ['required', 'integer'],
            'nb_children_nobed' => ['required', 'integer'],
            'nb_infants' => ['required', 'integer'],
            'total_price_dzd' => ['required', 'numeric'],
            'customer_name' => ['required', 'string', 'max:160'],
            'customer_phone' => ['required', 'string', 'max:40'],
            'customer_email' => ['nullable', 'email', 'max:180'],
            'nb_travelers' => ['required', 'integer'],
            'recaptcha_token' => ['nullable', 'string']
        ]);

        if (!RecaptchaVerifier::verify($data['recaptcha_token'] ?? null, 'tour_book')) {
            return response()->json(['error' => 'Vérification anti-spam échouée.'], 422);
        }

        $booking = TourBooking::create([
            'reference' => RefGenerator::tourBooking(),
            'tour_departure_id' => $data['tour_departure_id'],
            'hotel_name' => $data['hotel_name'],
            'room_type' => $data['room_type'],
            'nb_adults' => $data['nb_adults'],
            'nb_children_bed' => $data['nb_children_bed'],
            'nb_children_nobed' => $data['nb_children_nobed'],
            'nb_infants' => $data['nb_infants'],
            'total_price_dzd' => $data['total_price_dzd'],
            'customer_name' => $data['customer_name'],
            'customer_phone' => $data['customer_phone'],
            'customer_email' => $data['customer_email'] ?? null,
            'nb_travelers' => $data['nb_travelers'],
        ]);

        return response()->json(['success' => true, 'reference' => $booking->reference], 201);
    }
}