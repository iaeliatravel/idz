<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evisa_countries', function (Blueprint $table) {
            $table->id();
            $table->string('name_fr', 120);
            $table->string('name_en', 120)->nullable();
            $table->string('name_ar', 120)->nullable();
            $table->string('slug', 140)->unique();
            $table->string('flag_image_url', 255)->nullable();
            $table->string('flag_emoji', 10)->nullable();
            $table->string('region', 80)->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evisa_countries');
    }
};
