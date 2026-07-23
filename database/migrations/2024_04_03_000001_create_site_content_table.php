<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_content', function (Blueprint $table) {
            $table->id();
            // Page concernée : 'home', 'evisa', 'omra'
            $table->string('page', 40);
            // Identifiant unique de la section dans la page : 'hero', 'services', 'stats', 'why_choose', 'footer'...
            $table->string('section_key', 60);
            // Contenu structuré (titres, textes, listes d'items, urls d'images...)
            $table->json('content');
            // Permet de désactiver une section sans la supprimer (ex: masquer temporairement)
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['page', 'section_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_content');
    }
};
