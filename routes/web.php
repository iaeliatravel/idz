<?php

use App\Http\Controllers\Admin\EvisaAdminController;
use App\Http\Controllers\Admin\GeneralAdminController;
use App\Http\Controllers\Admin\LogoAdminController;
use App\Http\Controllers\Admin\OmraAdminController;
use App\Http\Controllers\Admin\SiteContentAdminController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\EvisaPublicController;
use App\Http\Controllers\Api\OmraPublicController;
use App\Http\Controllers\Api\SiteConfigController;
use App\Http\Controllers\Api\SiteContentPublicController;
use App\Http\Controllers\Admin\TourAdminController;
use App\Http\Controllers\Admin\QuoteAdminController;
use App\Http\Controllers\Api\TourPublicController;
use App\Http\Controllers\Api\QuotePublicController;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Api\EvisaPaymentController;
use App\Http\Controllers\Api\SlickPayCallbackController;

/*
|--------------------------------------------------------------------------
| PAGES PUBLIQUES
|--------------------------------------------------------------------------
*/

Route::get('/', function () {

    if (request()->getHost() === 'evisa.aeliatravelagency.dz') {
        return Inertia::render('Evisa');
    }

    return Inertia::render('Home');

})->name('home');

Route::get('/evisa', fn () => Inertia::render('Evisa'))
    ->name('evisa');

Route::get('/omra', fn () => Inertia::render('Omra'))
    ->name('omra');

Route::get('/devis', fn () => Inertia::render('Quote'))
    ->name('quote');

Route::get('/voyages', function () {
    return Inertia::render('Tours', [
        'tours' => \App\Models\Tour::where('is_active', true)->orderBy('departure_date')->get()
    ]);
})->name('tours.index');

Route::get('/voyages/{slug}', function ($slug) {
    $tour = \App\Models\Tour::where('slug', $slug)->where('is_active', true)->firstOrFail();
    return Inertia::render('TourDetail', [
        'tour' => $tour
    ]);
})->name('tours.show');    

/*
|--------------------------------------------------------------------------
|  PAGE ADMIN (SPA React monté une seule fois, le routing interne
|  est géré côté client par React Router)
|--------------------------------------------------------------------------
*/
Route::get('/admin/{any?}', fn () => Inertia::render('Admin/App'))
    ->where('any', '.*')
    ->name('admin');

/*
|--------------------------------------------------------------------------
|  API — CONTENU PUBLIC (lecture)
|--------------------------------------------------------------------------
*/
Route::prefix('api')->group(function () {

    // Voyages organisés publics
    Route::get('/tours', [TourPublicController::class, 'index']);
    Route::get('/tours/{slug}', [TourPublicController::class, 'show']);
    Route::post('/tours/book', [TourPublicController::class, 'book'])->middleware('throttle:5,1');

    // Demande de devis publique
    Route::post('/quotes', [QuotePublicController::class, 'store'])->middleware('throttle:5,1');

    Route::get('/content/{page}', [SiteContentPublicController::class, 'show']);
    Route::get('/config', [SiteConfigController::class, 'show']);

    // ---- eVisa public ----
    Route::get('/evisa/countries', [EvisaPublicController::class, 'countries']);
    Route::get('/evisa/countries/{slug}', [EvisaPublicController::class, 'country']);
    Route::post('/evisa/apply', [EvisaPublicController::class, 'apply'])
        ->middleware('throttle:5,1');

    // ---- Omra public ----
    Route::get('/omra/departures', [OmraPublicController::class, 'departures']);
    Route::get('/omra/departures/{id}', [OmraPublicController::class, 'show']);
    Route::get('/omra/hotels', [OmraPublicController::class, 'hotels']);
    Route::post('/omra/simulate', [OmraPublicController::class, 'simulate'])
        ->middleware('throttle:30,1');
    Route::post('/omra/prebook', [OmraPublicController::class, 'prebook'])
        ->middleware('throttle:5,1');

    // ---- Contact ----
    Route::post('/contact', [ContactController::class, 'store'])
        ->middleware('throttle:5,1');

    // ---- Auth admin ----
    Route::post('/admin/login', [AdminAuthController::class, 'login'])
        ->middleware('throttle:10,1');
    Route::post('/admin/logout', [AdminAuthController::class, 'logout']);
    Route::get('/admin/me', [AdminAuthController::class, 'me'])->middleware('admin.auth');
    
    /*
    |--------------------------------------------------------------------
    |  API ADMIN (protégée)
    |--------------------------------------------------------------------
    */
    Route::middleware('admin.auth')->prefix('admin')->group(function () {

        // Voyages Organisés (Tours)
        Route::get('/tours', [TourAdminController::class, 'index']);
        Route::post('/tours', [TourAdminController::class, 'store']);
        Route::put('/tours/{tour}', [TourAdminController::class, 'update']);
        Route::delete('/tours/{tour}', [TourAdminController::class, 'destroy']);
        Route::post('/tours/{tour}/duplicate', [TourAdminController::class, 'duplicate']);
        Route::post('/tours/{tour}/upload-cover', [TourAdminController::class, 'uploadCover']);

        // Réservations de Voyages Organisés
        Route::get('/tour-bookings', [TourAdminController::class, 'bookingsIndex']);
        Route::put('/tour-bookings/{booking}', [TourAdminController::class, 'bookingsUpdate']);
        Route::delete('/tour-bookings/{booking}', [TourAdminController::class, 'bookingsDestroy']);

        // Demandes de Devis (Quotes)
        Route::get('/quotes', [QuoteAdminController::class, 'index']);
        Route::put('/quotes/{quote}', [QuoteAdminController::class, 'update']);
        Route::delete('/quotes/{quote}', [QuoteAdminController::class, 'destroy']);

        // Contenu éditable & médiathèque
        Route::get('/content/{page}', [SiteContentAdminController::class, 'index']);
        Route::put('/content/{page}/{sectionKey}', [SiteContentAdminController::class, 'update']);
        Route::delete('/content/{page}/{sectionKey}', [SiteContentAdminController::class, 'destroy']);
        Route::get('/media', [SiteContentAdminController::class, 'mediaIndex']);
        Route::post('/media', [SiteContentAdminController::class, 'mediaStore']);
        Route::delete('/media/{media}', [SiteContentAdminController::class, 'mediaDestroy']);

        // Logos (3 versions : couleur, blanc, noir & blanc)
        Route::get('/logos', [LogoAdminController::class, 'index']);
        Route::post('/logos/{variant}', [LogoAdminController::class, 'store']);
        Route::delete('/logos/{variant}', [LogoAdminController::class, 'destroy']);

        // eVisa admin
        Route::get('/evisa/kpis', [EvisaAdminController::class, 'kpis']);
        Route::get('/evisa/countries', [EvisaAdminController::class, 'countriesIndex']);
        Route::post('/evisa/countries', [EvisaAdminController::class, 'countriesStore']);
        Route::put('/evisa/countries/{country}', [EvisaAdminController::class, 'countriesUpdate']);
        Route::delete('/evisa/countries/{country}', [EvisaAdminController::class, 'countriesDestroy']);
        Route::post('/evisa/countries/{country}/flag', [EvisaAdminController::class, 'countriesUploadFlag']);

        Route::get('/evisa/options', [EvisaAdminController::class, 'optionsIndex']);
        Route::post('/evisa/options', [EvisaAdminController::class, 'optionsStore']);
        Route::put('/evisa/options/{option}', [EvisaAdminController::class, 'optionsUpdate']);
        Route::delete('/evisa/options/{option}', [EvisaAdminController::class, 'optionsDestroy']);

        Route::get('/evisa/documents', [EvisaAdminController::class, 'documentsIndex']);
        Route::post('/evisa/documents', [EvisaAdminController::class, 'documentsStore']);
        Route::put('/evisa/documents/{document}', [EvisaAdminController::class, 'documentsUpdate']);
        Route::delete('/evisa/documents/{document}', [EvisaAdminController::class, 'documentsDestroy']);

        Route::get('/evisa/applications', [EvisaAdminController::class, 'applicationsIndex']);
        Route::put('/evisa/applications/{application}', [EvisaAdminController::class, 'applicationsUpdate']);

        Route::delete('/evisa/applications/{application}', [EvisaAdminController::class, 'applicationsDestroy']);

        // Omra admin
        Route::get('/omra/kpis', [OmraAdminController::class, 'kpis']);

        Route::get('/omra/partners', [OmraAdminController::class, 'partnersIndex']);
        Route::post('/omra/partners', [OmraAdminController::class, 'partnersStore']);
        Route::put('/omra/partners/{partner}', [OmraAdminController::class, 'partnersUpdate']);
        Route::delete('/omra/partners/{partner}', [OmraAdminController::class, 'partnersDestroy']);

        Route::get('/omra/airlines', [OmraAdminController::class, 'airlinesIndex']);
        Route::post('/omra/airlines', [OmraAdminController::class, 'airlinesStore']);
        Route::post('/omra/airlines/{airline}', [OmraAdminController::class, 'airlinesUpdate']); // POST + _method=PUT (upload fichier)
        Route::delete('/omra/airlines/{airline}', [OmraAdminController::class, 'airlinesDestroy']);

        Route::get('/omra/hotels', [OmraAdminController::class, 'hotelsIndex']);
        Route::post('/omra/hotels', [OmraAdminController::class, 'hotelsStore']);
        Route::put('/omra/hotels/{hotel}', [OmraAdminController::class, 'hotelsUpdate']);
        Route::delete('/omra/hotels/{hotel}', [OmraAdminController::class, 'hotelsDestroy']);
        Route::post('/omra/hotels/{hotel}/images', [OmraAdminController::class, 'hotelsUploadImages']);
        Route::delete('/omra/hotel-images/{image}', [OmraAdminController::class, 'hotelImagesDestroy']);

        Route::get('/omra/departures', [OmraAdminController::class, 'departuresIndex']);
        Route::post('/omra/departures', [OmraAdminController::class, 'departuresStore']);
        Route::put('/omra/departures/{departure}', [OmraAdminController::class, 'departuresUpdate']);
        Route::delete('/omra/departures/{departure}', [OmraAdminController::class, 'departuresDestroy']);

        Route::get('/omra/prebookings', [OmraAdminController::class, 'prebookingsIndex']);
        Route::put('/omra/prebookings/{prebooking}', [OmraAdminController::class, 'prebookingsUpdate']);

        Route::get('/omra/simulations', [OmraAdminController::class, 'simulationsIndex']);
        
        Route::post('/omra/departures/{departure}/duplicate', [OmraAdminController::class, 'duplicate']);

        // Général
        Route::get('/messages', [GeneralAdminController::class, 'messagesIndex']);
        Route::put('/messages/{message}/read', [GeneralAdminController::class, 'messagesMarkRead']);
        Route::get('/settings', [GeneralAdminController::class, 'settingsIndex']);
        Route::put('/settings', [GeneralAdminController::class, 'settingsUpdate']);
    });
});

// Page de retour après paiement SATIM
Route::get('/evisa/payment/result', [EvisaPaymentController::class, 'result'])
    ->name('evisa.payment.result');

Route::prefix('api')->group(function () {
    // Initiation paiement
    Route::post('/evisa/pay/{application}', [EvisaPaymentController::class, 'initiate'])
        ->middleware('throttle:10,1')
        ->name('evisa.payment.initiate');

    // Réessai
    Route::post('/evisa/pay-by-ref/{reference}', function ($reference) {
        $app = \App\Models\EvisaApplication::where('reference', $reference)->firstOrFail();
        return app(\App\Http\Controllers\Api\EvisaPaymentController::class)->initiate($app);
    })->middleware('throttle:10,1');

    // Callback SlickPay (SANS CSRF)
    Route::post('/evisa/payment/callback', [SlickPayCallbackController::class, 'handle'])
        ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])
        ->name('evisa.payment.callback');
});