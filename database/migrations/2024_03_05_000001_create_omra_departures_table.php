<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('omra_departures', function (Blueprint $table) {
            $table->id();
            $table->string('title_ar', 200);
            $table->foreignId('partner_id')->nullable()->constrained('omra_partners')->nullOnDelete();
            $table->foreignId('airline_id')->nullable()->constrained('omra_airlines')->nullOnDelete();

            // Aller
            $table->date('departure_date');
            $table->time('departure_time')->nullable();
            $table->string('departure_airport', 160)->nullable();
            $table->string('arrival_airport', 160)->nullable();
            $table->text('outbound_itinerary')->nullable();

            // Retour
            $table->date('return_date');
            $table->time('return_time')->nullable();
            $table->string('return_departure_airport', 160)->nullable();
            $table->string('return_arrival_airport', 160)->nullable();
            $table->text('return_itinerary')->nullable();

            $table->integer('duration_nights')->nullable();
            $table->enum('status', ['ouvert', 'complet', 'clos', 'brouillon'])->default('ouvert');
            $table->integer('seats_total')->nullable();
            $table->integer('seats_remaining')->nullable();
            $table->boolean('is_active')->default(true);
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('omra_departures');
    }
};
