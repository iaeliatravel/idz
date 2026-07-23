<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('omra_prebooking_travelers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prebooking_id')->constrained('omra_prebookings')->cascadeOnDelete();
            $table->string('full_name', 160);
            $table->enum('traveler_type', ['adulte', 'enfant_avec_lit', 'enfant_sans_lit', 'bebe'])->default('adulte');
            $table->string('passport_scan_path', 255)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('omra_prebooking_travelers');
    }
};
