<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use Illuminate\Http\Request;

class QuoteAdminController extends Controller
{
    public function index()
    {
        return response()->json(Quote::orderByDesc('created_at')->get());
    }

    public function update(Request $request, Quote $quote)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:nouveau,en_etude,devis_envoye,accepte,refuse,annule'],
            'admin_notes' => ['nullable', 'string']
        ]);
        $quote->update($data);
        return response()->json(['success' => true]);
    }

    public function destroy(Quote $quote)
    {
        $quote->delete();
        return response()->json(['success' => true]);
    }
}