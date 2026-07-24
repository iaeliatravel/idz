<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Support\RecaptchaVerifier;
use App\Support\RefGenerator;
use Illuminate\Http\Request;

class QuotePublicController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:160'],
            'customer_phone' => ['required', 'string', 'max:40'],
            'customer_email' => ['required', 'email', 'max:180'],
            'destination' => ['required', 'string', 'max:160'],
            'departure_date' => ['nullable', 'date'],
            'duration_nights' => ['nullable', 'integer', 'min:1'],
            'nb_adults' => ['required', 'integer', 'min:1'],
            'nb_children' => ['nullable', 'integer', 'min:0'],
            'hotel_stars' => ['nullable', 'integer', 'min:1', 'max:5'],
            'estimated_budget_dzd' => ['nullable', 'numeric', 'min:0'],
            'message' => ['nullable', 'string'],
            'recaptcha_token' => ['nullable', 'string']
        ]);

        if (!RecaptchaVerifier::verify($data['recaptcha_token'] ?? null, 'quote_request')) {
            return response()->json(['error' => 'Vérification anti-spam échouée.'], 422);
        }

        $quote = Quote::create([
            'reference' => RefGenerator::quote(),
            'customer_name' => $data['customer_name'],
            'customer_phone' => $data['customer_phone'],
            'customer_email' => $data['customer_email'],
            'destination' => $data['destination'],
            'departure_date' => $data['departure_date'] ?? null,
            'duration_nights' => $data['duration_nights'] ?? null,
            'nb_adults' => $data['nb_adults'],
            'nb_children' => $data['nb_children'] ?? 0,
            'hotel_stars' => $data['hotel_stars'] ?? null,
            'estimated_budget_dzd' => $data['estimated_budget_dzd'] ?? null,
            'message' => $data['message'] ?? null,
        ]);

        return response()->json(['success' => true, 'reference' => $quote->reference], 201);
    }
}