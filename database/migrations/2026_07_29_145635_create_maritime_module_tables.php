<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Table des compagnies maritimes
        Schema::create('maritime_companies', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('logo_url', 255)->nullable();
            $table->text('notes')->nullable(); // Ex: Jours de départs réguliers
            $table->timestamps();
        });

        // 2. Table des traversées (Lignes)
        Schema::create('maritime_routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('maritime_companies')->onDelete('cascade');
            $table->string('departure_port', 100); // Alger, Oran, Marseille, Alicante, etc.
            $table->string('arrival_port', 100);
            $table->boolean('is_round_trip')->default(true);
            $table->timestamps();
        });

        // 3. Table des réservations de billets maritimes
        Schema::create('maritime_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 30)->unique();
            $table->foreignId('route_id')->constrained('maritime_routes')->onDelete('cascade');
            
            // Client
            $table->string('customer_name', 160);
            $table->string('customer_phone', 40);
            $table->string('customer_email', 180)->nullable();
            
            // Voyage
            $table->date('departure_date');
            $table->date('return_date')->nullable(); // null si aller-simple
            
            // Participants & Véhicule
            $table->integer('nb_passengers')->default(1);
            $table->boolean('has_vehicle')->default(false);
            $table->string('vehicle_type', 100)->nullable(); // Voiture, Moto, Fourgon, etc.
            
            // Statut & Notes
            $table->enum('status', ['nouveau', 'contacte', 'attente_paiement', 'confirme', 'annule'])->default('nouveau');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maritime_bookings');
        Schema::dropIfExists('maritime_routes');
        Schema::dropIfExists('maritime_companies');
    }
};