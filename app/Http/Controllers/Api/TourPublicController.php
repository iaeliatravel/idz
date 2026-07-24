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
        return response()->json(Tour::where('is_active', true)->orderBy('departure_date')->get());
    }

    public function show(string $slug)
    {
        return response()->json(Tour::where('slug', $slug)->where('is_active', true)->firstOrFail());
    }

    public function book(Request $request)
    {
        $data = $request->validate([
            'tour_id' => ['required', 'integer', 'exists:tours,id'],
            'customer_name' => ['required', 'string', 'max:160'],
            'customer_phone' => ['required', 'string', 'max:40'],
            'customer_email' => ['nullable', 'email', 'max:180'],
            'nb_travelers' => ['required', 'integer', 'min:1', 'max:10'],
            'recaptcha_token' => ['nullable', 'string']
        ]);

        if (!RecaptchaVerifier::verify($data['recaptcha_token'] ?? null, 'tour_book')) {
            return response()->json(['error' => 'Vérification anti-spam échouée.'], 422);
        }

        $booking = TourBooking::create([
            'reference' => RefGenerator::tourBooking(),
            'tour_id' => $data['tour_id'],
            'customer_name' => $data['customer_name'],
            'customer_phone' => $data['customer_phone'],
            'customer_email' => $data['customer_email'] ?? null,
            'nb_travelers' => $data['nb_travelers'],
        ]);

        return response()->json(['success' => true, 'reference' => $booking->reference], 201);
    }
}