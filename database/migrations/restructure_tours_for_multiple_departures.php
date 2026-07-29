<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Création de la table des départs
        Schema::create('tour_departures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_id')->constrained('tours')->onDelete('cascade');
            $table->date('departure_date');
            $table->date('return_date');
            $table->json('flights')->nullable(); // Les vols sont spécifiques à la date
            $table->integer('seats_total')->nullable();
            $table->integer('seats_remaining')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Mise à jour de la table tour_bookings (la réservation est liée à un départ, pas juste au voyage)
        Schema::table('tour_bookings', function (Blueprint $table) {
            $table->dropForeign(['tour_id']); // On enlève l'ancienne clé étrangère
            $table->dropColumn('tour_id');
            $table->foreignId('tour_departure_id')->after('reference')->constrained('tour_departures')->onDelete('cascade');
        });

        // 3. Nettoyage de la table tours parent (on enlève ce qui a été bougé dans tour_departures)
        Schema::table('tours', function (Blueprint $table) {
            $table->dropColumn(['departure_date', 'return_date', 'flights', 'seats_total', 'seats_remaining']);
        });
    }

    public function down(): void
    {
        // ... (code de rollback omis pour la clarté)
    }
};