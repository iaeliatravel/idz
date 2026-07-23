<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evisa_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained('evisa_countries')->cascadeOnDelete();
            $table->string('label_fr', 160);
            $table->string('label_en', 160)->nullable();
            $table->string('label_ar', 160)->nullable();
            $table->enum('type_color', ['green', 'blue', 'amber', 'purple', 'red'])->default('green');
            $table->string('delai_fr', 160)->nullable();
            $table->string('validite_fr', 160)->nullable();
            $table->decimal('cost_price_dzd', 10, 2)->default(0);
            $table->decimal('sale_price_dzd', 10, 2)->default(0);
            $table->text('note_fr')->nullable();
            $table->text('conditions_fr')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evisa_options');
    }
};
