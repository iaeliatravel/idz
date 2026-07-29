<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Création de la table des départs (seulement si elle n'existe pas)
        if (!Schema::hasTable('tour_departures')) {
            Schema::create('tour_departures', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tour_id')->constrained('tours')->onDelete('cascade');
                $table->date('departure_date');
                $table->date('return_date');
                $table->json('flights')->nullable(); 
                $table->integer('seats_total')->nullable();
                $table->integer('seats_remaining')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 2. Mise à jour de la table tour_bookings
        Schema::table('tour_bookings', function (Blueprint $table) {
            // Si l'ancienne colonne existe, on l'enlève
            if (Schema::hasColumn('tour_bookings', 'tour_id')) {
                $table->dropForeign(['tour_id']); 
                $table->dropColumn('tour_id');
            }
            
            // Si la nouvelle colonne n'existe pas, on l'ajoute
            if (!Schema::hasColumn('tour_bookings', 'tour_departure_id')) {
                $table->foreignId('tour_departure_id')->after('reference')->constrained('tour_departures')->onDelete('cascade');
            }
        });

        // 3. Nettoyage de la table tours parent
        Schema::table('tours', function (Blueprint $table) {
            if (Schema::hasColumn('tours', 'departure_date')) {
                $table->dropColumn([
                    'departure_date', 
                    'return_date', 
                    'flights', 
                    'seats_total', 
                    'seats_remaining'
                ]);
            }
        });
    }

    public function down(): void
    {
        // Le rollback (optionnel)
    }
};