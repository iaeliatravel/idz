<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Chaque demande eVisa peut maintenant concerner plusieurs voyageurs.
        // Le demandeur principal reste dans evisa_applications,
        // les voyageurs supplémentaires sont dans cette table.
        Schema::create('evisa_application_travelers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')
                ->constrained('evisa_applications')
                ->cascadeOnDelete();

            // Informations du voyageur
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('passport_number', 60)->nullable();
            $table->date('travel_date')->nullable();

            // Ordre d'affichage (1 = premier voyageur supplémentaire)
            $table->integer('order')->default(1);

            $table->timestamps();
        });

        // Ajouter nb_travelers et sale_price_per_person dans evisa_applications
        // pour calculer le prix total correctement
        Schema::table('evisa_applications', function (Blueprint $table) {
            if (! Schema::hasColumn('evisa_applications', 'nb_travelers')) {
                $table->integer('nb_travelers')->default(1)->after('travel_date');
            }
            if (! Schema::hasColumn('evisa_applications', 'sale_price_per_person_dzd')) {
                $table->decimal('sale_price_per_person_dzd', 10, 2)->default(0)->after('sale_price_dzd');
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evisa_application_travelers');
        Schema::table('evisa_applications', function (Blueprint $table) {
            $table->dropColumnIfExists('nb_travelers');
            $table->dropColumnIfExists('sale_price_per_person_dzd');
        });
    }
};
