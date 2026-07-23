<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('omra_hotels', function (Blueprint $table) {
            $table->id();
            $table->string('name', 160);
            $table->enum('city', ['mecque', 'medine']);
            $table->tinyInteger('stars')->nullable();
            $table->string('distance_haram', 80)->nullable();
            $table->string('map_url', 500)->nullable();
            $table->decimal('latitude', 10, 6)->nullable();
            $table->decimal('longitude', 10, 6)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('omra_hotels');
    }
};
