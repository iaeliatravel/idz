@component('emails.layout', ['title' => 'Confirmation de votre demande eVisa'])
<p>Bonjour <strong>{{ $app->first_name }}</strong>,</p>
<p>Votre demande de visa a bien été reçue. Notre équipe la traitera dans les meilleurs délais.</p>

<div class="field"><strong>Numéro de référence</strong><span>{{ $app->reference }}</span></div>
<div class="field"><strong>Pays concerné</strong><span>{{ $app->country->name_fr }}</span></div>
<div class="field"><strong>Type de visa</strong><span>{{ $app->option->label_fr }}</span></div>
<div class="field"><strong>Statut actuel</strong><span>En cours de traitement</span></div>

<p>Conservez cette référence pour tout suivi. Nous vous contacterons sur <strong>{{ $app->email }}</strong> ou au <strong>{{ $app->phone }}</strong> si des documents complémentaires sont nécessaires.</p>
<p>Merci de votre confiance,<br><strong>L'équipe Aelia Travel</strong></p>
@endcomponent
