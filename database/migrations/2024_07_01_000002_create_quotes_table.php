<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 30)->unique();
            $table->string('customer_name', 160);
            $table->string('customer_phone', 40);
            $table->string('customer_email', 180);
            $table->string('destination', 160);
            $table->date('departure_date')->nullable();
            $table->integer('duration_nights')->nullable();
            $table->integer('nb_adults')->default(1);
            $table->integer('nb_children')->default(0);
            $table->integer('hotel_stars')->nullable(); // 3*, 4*, 5*
            $table->decimal('estimated_budget_dzd', 10, 2)->nullable();
            $table->text('message')->nullable();
            $table->enum('status', ['nouveau', 'en_etude', 'devis_envoye', 'accepte', 'refuse', 'annule'])->default('nouveau');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};