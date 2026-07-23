<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_media', function (Blueprint $table) {
            $table->id();
            $table->string('url', 255);
            $table->string('original_name', 255)->nullable();
            // Catégorie libre pour filtrer dans le dashboard : 'hero', 'flag', 'hotel', 'airline', 'general'...
            $table->string('category', 60)->nullable();
            $table->dateTime('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_media');
    }
};
