<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evisa_application_files', function (Blueprint $table) {
            // Lie un fichier à un voyageur spécifique (null = voyageur principal)
            if (! Schema::hasColumn('evisa_application_files', 'traveler_id')) {
                $table->foreignId('traveler_id')
                    ->nullable()
                    ->after('application_id')
                    ->constrained('evisa_application_travelers')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('evisa_application_files', function (Blueprint $table) {
            $table->dropConstrainedForeignId('traveler_id');
        });
    }
};
