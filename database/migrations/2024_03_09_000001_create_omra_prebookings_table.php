<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('omra_prebookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 30)->unique();
            $table->foreignId('departure_id')->constrained('omra_departures');
            $table->foreignId('package_id')->nullable()->constrained('omra_packages')->nullOnDelete();
            $table->enum('occupancy', ['quintuple', 'quadruple', 'triple', 'double']);
            $table->string('contact_name', 160);
            $table->string('contact_phone', 40);
            $table->string('contact_email', 180)->nullable();
            $table->integer('nb_adults')->default(1);
            $table->integer('nb_children_bed')->default(0);
            $table->integer('nb_children_nobed')->default(0);
            $table->integer('nb_infants')->default(0);
            $table->decimal('estimated_total_dzd', 10, 2)->default(0);
            $table->decimal('cost_total_dzd', 10, 2)->default(0);
            $table->enum('status', ['nouveau', 'contacte', 'confirme', 'annule'])->default('nouveau');
            $table->text('admin_notes')->nullable();
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('omra_prebookings');
    }
};
