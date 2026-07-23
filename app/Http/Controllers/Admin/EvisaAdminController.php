<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EvisaApplication;
use App\Models\EvisaCountry;
use App\Models\EvisaOption;
use App\Models\EvisaRequiredDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EvisaAdminController extends Controller
{
    // ===================================================================
    //  KPIs
    // ===================================================================
    public function kpis()
    {
        $total = EvisaApplication::count();
        $nouveau = EvisaApplication::where('status', 'nouveau')->count();
        $approuve = EvisaApplication::where('status', 'approuve')->count();
        $ca = EvisaApplication::whereNotIn('status', ['annule', 'refuse'])->sum('sale_price_dzd');
        $benefice = EvisaApplication::whereNotIn('status', ['annule', 'refuse'])
            ->select(DB::raw('COALESCE(SUM(sale_price_dzd - cost_price_dzd),0) as total'))
            ->value('total');

        $byStatus = EvisaApplication::select('status', DB::raw('COUNT(*) as cnt'))
            ->groupBy('status')->get();

        $topCountries = EvisaApplication::join('evisa_countries', 'evisa_applications.country_id', '=', 'evisa_countries.id')
            ->select('evisa_countries.name_fr', DB::raw('COUNT(evisa_applications.id) as cnt'))
            ->groupBy('evisa_applications.country_id', 'evisa_countries.name_fr')
            ->orderByDesc('cnt')
            ->limit(5)
            ->get();

        return response()->json([
            'total' => $total,
            'nouveau' => $nouveau,
            'approuve' => $approuve,
            'ca' => $ca,
            'benefice' => $benefice,
            'byStatus' => $byStatus,
            'topCountries' => $topCountries,
        ]);
    }

    // ===================================================================
    //  Pays
    // ===================================================================
    public function countriesIndex()
    {
        return response()->json(
            EvisaCountry::orderBy('display_order')->orderBy('name_fr')->get()
        );
    }

    public function countriesStore(Request $request)
    {
        $data = $request->validate([
            'name_fr' => ['required', 'string', 'max:120'],
            'name_en' => ['nullable', 'string', 'max:120'],
            'name_ar' => ['nullable', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:140', 'unique:evisa_countries,slug'],
            'flag_emoji' => ['nullable', 'string', 'max:10'],
            'region' => ['nullable', 'string', 'max:80'],
            'is_active' => ['nullable', 'boolean'],
            'display_order' => ['nullable', 'integer'],
        ]);

        $country = EvisaCountry::create($data);

        return response()->json($country, 201);
    }

    public function countriesUpdate(Request $request, EvisaCountry $country)
    {
        $data = $request->validate([
            'name_fr' => ['required', 'string', 'max:120'],
            'name_en' => ['nullable', 'string', 'max:120'],
            'name_ar' => ['nullable', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:140', 'unique:evisa_countries,slug,'.$country->id],
            'flag_emoji' => ['nullable', 'string', 'max:10'],
            'region' => ['nullable', 'string', 'max:80'],
            'is_active' => ['nullable', 'boolean'],
            'display_order' => ['nullable', 'integer'],
        ]);

        $country->update($data);

        return response()->json(['success' => true]);
    }

    public function countriesDestroy(EvisaCountry $country)
    {
        $country->delete();

        return response()->json(['success' => true]);
    }

    public function countriesUploadFlag(Request $request, EvisaCountry $country)
    {
        $request->validate([
            'flag' => ['required', 'image', 'max:8192'],
        ]);

        $path = $request->file('flag')->store('flags', 'public');
        $url = '/storage/'.$path;

        $country->update(['flag_image_url' => $url]);

        return response()->json(['success' => true, 'url' => $url]);
    }

    // ===================================================================
    //  Options
    // ===================================================================
    public function optionsIndex(Request $request)
    {
        $query = EvisaOption::with('country');

        if ($request->filled('country_id')) {
            $query->where('country_id', $request->input('country_id'));
        }

        $options = $query->orderBy('display_order')->get()->map(function ($o) {
            $arr = $o->toArray();
            $arr['country_name'] = $o->country->name_fr ?? null;

            return $arr;
        });

        return response()->json($options);
    }

    public function optionsStore(Request $request)
    {
        $data = $this->validateOption($request);
        $option = EvisaOption::create($data);

        return response()->json($option, 201);
    }

    public function optionsUpdate(Request $request, EvisaOption $option)
    {
        $data = $this->validateOption($request);
        $option->update($data);

        return response()->json(['success' => true]);
    }

    public function optionsDestroy(EvisaOption $option)
    {
        // Vérifie si l'option est liée à des demandes de visa existantes
        if (\App\Models\EvisaApplication::where('option_id', $option->id)->exists()) {
           // Désactive simplement l'option pour préserver l'historique financier et client
            $option->update(['is_active' => false]);
            return response()->json([
                'success' => true, 
                'message' => 'L\'option est liée à des demandes existantes. Elle a été désactivée (masquée du site) pour préserver vos données.'
            ]);
        }

        $option->delete();
        return response()->json(['success' => true]);
    }

    private function validateOption(Request $request): array
    {
        return $request->validate([
            'country_id' => ['required', 'integer', 'exists:evisa_countries,id'],
            'label_fr' => ['required', 'string', 'max:160'],
            'label_en' => ['nullable', 'string', 'max:160'],
            'label_ar' => ['nullable', 'string', 'max:160'],
            'type_color' => ['nullable', 'string', 'in:green,blue,amber,purple,red'],
            'delai_fr' => ['nullable', 'string', 'max:160'],
            'validite_fr' => ['nullable', 'string', 'max:160'],
            'cost_price_dzd' => ['nullable', 'numeric', 'min:0'],
            'sale_price_dzd' => ['nullable', 'numeric', 'min:0'],
            'note_fr' => ['nullable', 'string'],
            'conditions_fr' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
            'display_order' => ['nullable', 'integer'],
        ]);
    }

    // ===================================================================
    //  Documents requis
    // ===================================================================
    public function documentsIndex(Request $request)
    {
        $query = EvisaRequiredDocument::query();

        if ($request->filled('option_id')) {
            $query->where('option_id', $request->input('option_id'));
        }

        return response()->json($query->orderBy('display_order')->get());
    }

    public function documentsStore(Request $request)
    {
        $data = $request->validate([
            'option_id' => ['required', 'integer', 'exists:evisa_options,id'],
            'label_fr' => ['required', 'string', 'max:200'],
            'label_en' => ['nullable', 'string', 'max:200'],
            'label_ar' => ['nullable', 'string', 'max:200'],
            'category' => ['nullable', 'string', 'in:client,mineur,agence,autre'],
            'requires_upload' => ['nullable', 'boolean'],
            'is_required' => ['nullable', 'boolean'],
            'display_order' => ['nullable', 'integer'],
        ]);

        $doc = EvisaRequiredDocument::create($data);

        return response()->json($doc, 201);
    }

    public function documentsUpdate(Request $request, EvisaRequiredDocument $document)
    {
        $data = $request->validate([
            'label_fr' => ['required', 'string', 'max:200'],
            'label_en' => ['nullable', 'string', 'max:200'],
            'label_ar' => ['nullable', 'string', 'max:200'],
            'category' => ['nullable', 'string', 'in:client,mineur,agence,autre'],
            'requires_upload' => ['nullable', 'boolean'],
            'is_required' => ['nullable', 'boolean'],
            'display_order' => ['nullable', 'integer'],
        ]);

        $document->update($data);

        return response()->json(['success' => true]);
    }

    public function documentsDestroy(EvisaRequiredDocument $document)
    {
        $document->delete();

        return response()->json(['success' => true]);
    }

    // ===================================================================
    //  Demandes
    // ===================================================================
    public function applicationsIndex(Request $request)
    {
        $query = EvisaApplication::with(['country', 'option', 'files', 'payments']); // <-- AJOUTEZ 'payments' ici

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('country_id')) {
            $query->where('country_id', $request->input('country_id'));
        }

        $limit = (int) $request->input('limit', 20);
        $page = (int) $request->input('page', 1);

        $applications = $query->orderByDesc('created_at')
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->get()
            ->map(function ($app) {
                $arr = $app->toArray();
                $arr['country_name'] = $app->country->name_fr ?? null;
                $arr['option_label'] = $app->option->label_fr ?? null;
                $arr['benefit'] = $app->benefit;
                
                // Récupère l'état du paiement associé
                $lastPayment = $app->payments->first();
                $arr['payment_status'] = $lastPayment ? $lastPayment->status : 'non_paye';
                
                return $arr;
            });

        return response()->json($applications);
    }

    public function applicationsUpdate(Request $request, EvisaApplication $application)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:nouveau,en_cours,documents_manquants,soumis_ambassade,approuve,refuse,annule'],
            'admin_notes' => ['nullable', 'string'],
        ]);

        $application->update($data);

        return response()->json(['success' => true]);
    }

    public function applicationsDestroy(EvisaApplication $application)
    {
        DB::transaction(function () use ($application) {
            // 1. Supprime les fichiers joints associés
            $application->files()->delete();
            // 2. Supprime l'historique des transactions de paiement
            $application->payments()->delete();
            // 3. Supprime les voyageurs secondaires rattachés
            $application->travelers()->delete();
            // 4. Supprime la demande principale
            $application->delete();
        });

        return response()->json(['success' => true]);
    }
    
}
