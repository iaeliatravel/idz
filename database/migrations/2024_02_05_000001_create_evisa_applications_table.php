<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evisa_applications', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 30)->unique();
            $table->foreignId('country_id')->constrained('evisa_countries');
            $table->foreignId('option_id')->constrained('evisa_options');
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email', 180);
            $table->string('phone', 40);
            $table->string('passport_number', 40)->nullable();
            $table->date('travel_date')->nullable();
            $table->integer('nb_travelers')->default(1);
            $table->text('message')->nullable();
            $table->decimal('sale_price_dzd', 10, 2)->default(0);
            $table->decimal('cost_price_dzd', 10, 2)->default(0);
            $table->enum('status', [
                'nouveau', 'en_cours', 'documents_manquants',
                'soumis_ambassade', 'approuve', 'refuse', 'annule',
            ])->default('nouveau');
            $table->text('admin_notes')->nullable();
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evisa_applications');
    }
};
