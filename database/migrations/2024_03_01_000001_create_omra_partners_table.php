<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('omra_partners', function (Blueprint $table) {
            $table->id();
            $table->string('name', 160);
            $table->string('contact', 160)->nullable();
            $table->string('phone', 40)->nullable();
            $table->text('notes')->nullable();
            $table->dateTime('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('omra_partners');
    }
};
