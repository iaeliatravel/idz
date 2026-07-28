<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evisa_countries', function (Blueprint $table) {
            $table->integer('views')->default(0)->after('is_active');
        });

        Schema::table('evisa_options', function (Blueprint $table) {
            $table->integer('views')->default(0)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('evisa_countries', function (Blueprint $table) {
            $table->dropColumn('views');
        });

        Schema::table('evisa_options', function (Blueprint $table) {
            $table->dropColumn('views');
        });
    }
};