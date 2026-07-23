<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Une "formule" (package) représente UNE combinaison complète proposée
     * pour un départ donné : un hôtel à Mecque + un hôtel à Médine, chacun
     * avec son nombre de nuits. Un même départ peut proposer plusieurs
     * formules (ex: 3 hôtels Mecque différents combinés au même hôtel
     * Médine = 3 formules), chacune avec sa propre grille tarifaire.
     */
    public function up(): void
    {
        Schema::create('omra_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('departure_id')->constrained('omra_departures')->cascadeOnDelete();

            // Hôtel à Mecque (affiché en priorité pour distinguer les formules entre elles)
            $table->foreignId('mecque_hotel_id')->nullable()->constrained('omra_hotels')->nullOnDelete();
            $table->integer('mecque_nights')->default(0);

            // Hôtel à Médine (toujours présent également, mais secondaire à l'affichage)
            $table->foreignId('medine_hotel_id')->nullable()->constrained('omra_hotels')->nullOnDelete();
            $table->integer('medine_nights')->default(0);

            $table->string('label')->nullable(); // libellé optionnel pour la formule (ex: "Formule Confort")
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('omra_packages');
    }
};
