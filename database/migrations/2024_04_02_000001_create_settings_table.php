<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->string('setting_key', 100)->primary();
            $table->text('setting_value')->nullable();
        });

        // Réglages par défaut
        \Illuminate\Support\Facades\DB::table('settings')->insert([
            ['setting_key' => 'alert_email', 'setting_value' => 'contact@aeliatravelagency.dz'],
            ['setting_key' => 'site_name', 'setting_value' => 'Aelia Travel'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
