<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evisa_required_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('option_id')->constrained('evisa_options')->cascadeOnDelete();
            $table->string('label_fr', 200);
            $table->string('label_en', 200)->nullable();
            $table->string('label_ar', 200)->nullable();
            $table->enum('category', ['client', 'mineur', 'agence', 'autre'])->default('client');
            $table->boolean('requires_upload')->default(true);
            $table->boolean('is_required')->default(true);
            $table->integer('display_order')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evisa_required_documents');
    }
};
