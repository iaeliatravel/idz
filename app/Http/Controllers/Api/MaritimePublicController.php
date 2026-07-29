<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaritimeCompany;
use App\Models\MaritimeRoute;
use App\Models\MaritimeBooking;
use App\Support\RecaptchaVerifier;
use App\Support\RefGenerator;
use Illuminate\Http\Request;

class MaritimePublicController extends Controller
{
    public function data()
    {
        // On récupère toutes les compagnies et leurs routes associées
        return response()->json(
            MaritimeCompany::with('routes')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'route_id' => ['required', 'integer', 'exists:maritime_routes,id'],
            'customer_name' => ['required', 'string', 'max:160'],
            'customer_phone' => ['required', 'string', 'max:40'],
            'customer_email' => ['nullable', 'email', 'max:180'],
            'departure_date' => ['required', 'date'],
            'return_date' => ['nullable', 'date'],
            'nb_passengers' => ['required', 'integer', 'min:1', 'max:9'],
            'has_vehicle' => ['required', 'boolean'],
            'vehicle_type' => ['nullable', 'string', 'max:100'],
            'recaptcha_token' => ['nullable', 'string']
        ]);

        if (!RecaptchaVerifier::verify($data['recaptcha_token'] ?? null, 'maritime_book')) {
            return response()->json(['error' => 'Vérification anti-spam échouée.'], 422);
        }

        $booking = MaritimeBooking::create([
            'reference' => RefGenerator::generate('MR'), // Référence Maritime (ex: MR-2026-XXXXXX)
            'route_id' => $data['route_id'],
            'customer_name' => $data['customer_name'],
            'customer_phone' => $data['customer_phone'],
            'customer_email' => $data['customer_email'],
            'departure_date' => $data['departure_date'],
            'return_date' => $data['return_date'] ?? null,
            'nb_passengers' => $data['nb_passengers'],
            'has_vehicle' => $data['has_vehicle'],
            'vehicle_type' => $data['has_vehicle'] ? $data['vehicle_type'] : null,
        ]);

        return response()->json(['success' => true, 'reference' => $booking->reference], 201);
    }
}