<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('omra_hotel_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained('omra_hotels')->cascadeOnDelete();
            $table->string('image_url', 255);
            $table->integer('display_order')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('omra_hotel_images');
    }
};
