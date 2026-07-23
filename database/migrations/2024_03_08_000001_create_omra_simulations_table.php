<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('omra_simulations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('departure_id')->nullable()->constrained('omra_departures')->nullOnDelete();
            $table->foreignId('package_id')->nullable()->constrained('omra_packages')->nullOnDelete();
            $table->string('full_name', 160)->nullable();
            $table->string('phone', 40)->nullable();
            $table->integer('nb_adults')->default(1);
            $table->integer('nb_children_bed')->default(0);
            $table->integer('nb_children_nobed')->default(0);
            $table->integer('nb_infants')->default(0);
            $table->enum('occupancy', ['quintuple', 'quadruple', 'triple', 'double'])->default('double');
            $table->decimal('estimated_total_dzd', 10, 2)->default(0);
            $table->dateTime('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('omra_simulations');
    }
};
