@component('emails.layout', ['title' => 'Nouvelle demande eVisa'])
<p>🆕 Nouvelle demande eVisa reçue sur le site.</p>
<p><span class="badge">Réf : {{ $app->reference }}</span></p>

<div class="field"><strong>Client</strong><span>{{ $app->first_name }} {{ $app->last_name }}</span></div>
<div class="field"><strong>Email</strong><span>{{ $app->email }}</span></div>
<div class="field"><strong>Téléphone</strong><span>{{ $app->phone }}</span></div>
<div class="field"><strong>Pays</strong><span>{{ $app->country->name_fr }}</span></div>
<div class="field"><strong>Type de visa</strong><span>{{ $app->option->label_fr }}</span></div>
<div class="field"><strong>Prix de vente</strong><span>{{ number_format($app->sale_price_dzd, 0, ',', ' ') }} DZD</span></div>
<div class="field"><strong>Nombre de voyageurs</strong><span>{{ $app->nb_travelers }}</span></div>
<div class="field"><strong>Date de voyage souhaitée</strong><span>{{ $app->travel_date?->format('d/m/Y') ?? 'Non précisée' }}</span></div>
<div class="field"><strong>Date de demande</strong><span>{{ $app->created_at->format('d/m/Y H:i') }}</span></div>

<a href="{{ config('app.url') }}/admin/evisa/applications" class="btn">Voir dans le Dashboard →</a>
@endcomponent
