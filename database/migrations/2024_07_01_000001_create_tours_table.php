<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Table des voyages organisés disponibles
        Schema::create('tours', function (Blueprint $table) {
            $table->id();
            $table->string('title_fr', 200);
            $table->string('title_ar', 200)->nullable();
            $table->string('slug', 220)->unique();
            $table->string('destination', 160);
            $table->date('departure_date');
            $table->date('return_date');
            $table->decimal('price_dzd', 10, 2);
            $table->decimal('price_child_dzd', 10, 2)->nullable();
            $table->text('description_fr')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('cover_image_url', 500)->nullable();
            $table->integer('seats_total')->nullable();
            $table->integer('seats_remaining')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Table des réservations sur ces voyages
        Schema::create('tour_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 30)->unique();
            $table->foreignId('tour_id')->constrained('tours')->onDelete('cascade');
            $table->string('customer_name', 160);
            $table->string('customer_phone', 40);
            $table->string('customer_email', 180)->nullable();
            $table->integer('nb_travelers')->default(1);
            $table->enum('status', ['nouveau', 'contacte', 'confirme', 'annule'])->default('nouveau');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_bookings');
        Schema::dropIfExists('tours');
    }
};