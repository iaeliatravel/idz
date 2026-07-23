<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evisa_payments', function (Blueprint $table) {
            // Supprime les colonnes Chargily
            $table->dropColumn(['chargily_checkout_id', 'checkout_url', 'webhook_payload']);
        });

        Schema::table('evisa_payments', function (Blueprint $table) {
            // Ajoute les colonnes SlickPay
            $table->unsignedBigInteger('slickpay_invoice_id')->nullable()->unique()->after('application_id');
            $table->string('payment_url', 500)->nullable()->after('slickpay_invoice_id');
            $table->json('callback_payload')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('evisa_payments', function (Blueprint $table) {
            $table->dropColumn(['slickpay_invoice_id', 'payment_url', 'callback_payload']);
        });

        Schema::table('evisa_payments', function (Blueprint $table) {
            $table->string('chargily_checkout_id')->nullable()->unique()->after('application_id');
            $table->string('checkout_url', 500)->nullable()->after('slickpay_invoice_id');
            $table->json('webhook_payload')->nullable()->after('status');
        });
    }
};
