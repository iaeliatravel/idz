<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('omra_departures', function (Blueprint $table) {
            if (! Schema::hasColumn('omra_departures', 'cover_image_url')) {
                $table->string('cover_image_url', 500)->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('omra_departures', function (Blueprint $table) {
            $table->dropColumn('cover_image_url');
        });
    }
};
