<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tours', function (Blueprint $table) {
            $table->id();
            $table->string('title_fr', 200);
            $table->string('title_ar', 200)->nullable();
            $table->string('slug', 220)->unique();
            $table->string('destination', 160);
            $table->date('departure_date');
            $table->date('return_date');
            
            // Détails du vol (JSON : compagnie, n° de vol, heures, escales)
            $table->json('flights')->nullable(); 
            
            // Programme jour par jour (JSON : [{jour: 1, titre: "...", description: "..."}])
            $table->json('program')->nullable(); 
            
            // Ce qui est inclus / non inclus (JSON : ["Vol aller-retour", "Hébergement", ...])
            $table->json('included_pack')->nullable();
            $table->json('excluded_pack')->nullable();
            
            // Remarques et conditions
            $table->text('remarks')->nullable();
            
            $table->string('cover_image_url', 500)->nullable();
            $table->integer('seats_total')->nullable();
            $table->integer('seats_remaining')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Grille tarifaire dynamique par hôtel / formule d'hôtel pour le voyage
        Schema::create('tour_hotel_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_id')->constrained('tours')->onDelete('cascade');
            
            // Nom de l'hôtel ou du combiné (ex: "Hilton Le Caire 5* + Tivoli 4*")
            $table->string('hotel_name', 200); 
            $table->string('room_type', 160)->nullable(); // ex: "Chambre Standard", "Family Suite"
            
            // Tarifs Adultes (par personne)
            $table->decimal('price_double_dzd', 10, 2)->default(0); // Chambre Double
            $table->decimal('price_triple_dzd', 10, 2)->default(0); // Chambre Triple
            $table->decimal('price_single_dzd', 10, 2)->default(0); // Chambre Single
            
            // Tarifs Enfants et Bébés
            $table->decimal('price_child_with_bed_dzd', 10, 2)->default(0); // Enfant avec lit
            $table->decimal('price_child_no_bed_dzd', 10, 2)->default(0);   // Enfant sans lit
            $table->decimal('price_infant_dzd', 10, 2)->default(0);         // Bébé (-2 ans)
            
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_hotel_options');
        Schema::dropIfExists('tours');
    }
};