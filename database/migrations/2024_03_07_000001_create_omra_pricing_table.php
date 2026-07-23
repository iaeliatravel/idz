<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('omra_pricing', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained('omra_packages')->cascadeOnDelete();
            $table->enum('occupancy', ['quintuple', 'quadruple', 'triple', 'double']);
            $table->decimal('adult_cost_dzd', 10, 2)->default(0);
            $table->decimal('adult_sale_dzd', 10, 2)->default(0);
            $table->decimal('child_with_bed_cost_dzd', 10, 2)->default(0);
            $table->decimal('child_with_bed_sale_dzd', 10, 2)->default(0);
            $table->decimal('child_no_bed_cost_dzd', 10, 2)->default(0);
            $table->decimal('child_no_bed_sale_dzd', 10, 2)->default(0);
            $table->decimal('infant_cost_dzd', 10, 2)->default(0);
            $table->decimal('infant_sale_dzd', 10, 2)->default(0);

            $table->unique(['package_id', 'occupancy'], 'uniq_package_occupancy');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('omra_pricing');
    }
};
