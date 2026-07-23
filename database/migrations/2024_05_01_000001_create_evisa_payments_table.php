<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evisa_payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('application_id')
                ->constrained('evisa_applications')
                ->cascadeOnDelete();

            // ID de la facture côté SlickPay (reçu à la création)
            $table->unsignedBigInteger('slickpay_invoice_id')->nullable()->unique();

            // URL de paiement directe SATIM retournée par SlickPay
            // → PAS de page intermédiaire, on redirige directement vers SATIM
            $table->string('payment_url', 500)->nullable();

            // Montant en DZD
            $table->decimal('amount_dzd', 10, 2);

            // Statut local : pending | paid | failed | canceled
            $table->enum('status', ['pending', 'paid', 'failed', 'canceled'])
                ->default('pending');

            // Payload brut du callback SlickPay (pour audit/debug)
            $table->json('callback_payload')->nullable();

            // Date de confirmation du paiement
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evisa_payments');
    }
};
