<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evisa_application_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('evisa_applications')->cascadeOnDelete();
            $table->string('document_label', 200);
            $table->string('file_path', 255);
            $table->string('original_name', 255)->nullable();
            $table->dateTime('uploaded_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evisa_application_files');
    }
};
