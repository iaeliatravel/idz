@component('emails.layout', ['title' => 'Paiement reçu — Demande eVisa'])
<p>Bonjour <strong>{{ $app->first_name }}</strong>,</p>
<p>Votre paiement a bien été reçu et validé via <strong>CIB / EDAHABIA</strong>. Votre dossier eVisa est maintenant en cours de traitement.</p>

<p><span class="badge" style="background:#0F6E56;">✅ Paiement confirmé</span></p>

<div class="field"><strong>Référence dossier</strong><span>{{ $app->reference }}</span></div>
<div class="field"><strong>Pays</strong><span>{{ $app->country->name_fr }}</span></div>
<div class="field"><strong>Type de visa</strong><span>{{ $app->option->label_fr }}</span></div>
<div class="field"><strong>Montant payé</strong><span>{{ number_format($payment->amount_dzd, 0, ',', ' ') }} DZD</span></div>
<div class="field"><strong>Mode de paiement</strong><span>CIB / EDAHABIA (SATIM via Slick-Pay)</span></div>
<div class="field"><strong>N° facture Slick-Pay</strong><span>#{{ $payment->slickpay_invoice_id }}</span></div>
<div class="field"><strong>Date de paiement</strong><span>{{ $payment->paid_at?->format('d/m/Y à H:i') }}</span></div>

<p style="margin-top:16px;">
    Notre équipe traitera votre dossier dans les meilleurs délais.
    Vous serez contacté(e) sur <strong>{{ $app->email }}</strong>
    ou au <strong>{{ $app->phone }}</strong> pour toute information complémentaire.
</p>

<a href="{{ config('app.url') }}" class="btn">Retour à l'accueil →</a>

<p style="margin-top:20px;">Merci de votre confiance,<br><strong>L'équipe Aelia Travel</strong></p>
@endcomponent
