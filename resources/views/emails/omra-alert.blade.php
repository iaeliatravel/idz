@component('emails.layout', ['title' => 'Nouvelle pré-réservation Omra'])
<p>🕌 Nouvelle pré-réservation Omra reçue.</p>
<p><span class="badge">Réf : {{ $pb->reference }}</span></p>

<div class="field"><strong>Contact</strong><span>{{ $pb->contact_name }}</span></div>
<div class="field"><strong>Téléphone</strong><span>{{ $pb->contact_phone }}</span></div>
<div class="field"><strong>Email</strong><span>{{ $pb->contact_email ?? 'Non renseigné' }}</span></div>
<div class="field"><strong>Départ</strong><span>{{ $pb->departure?->departure_date?->format('d/m/Y') ?? '—' }}</span></div>
<div class="field"><strong>Hôtel Mecque</strong><span>{{ $pb->package?->mecqueHotel?->name ?? '—' }}</span></div>
<div class="field"><strong>Hôtel Médine</strong><span>{{ $pb->package?->medineHotel?->name ?? '—' }}</span></div>
<div class="field"><strong>Chambre</strong><span>{{ $pb->occupancy }}</span></div>
<div class="field"><strong>Adultes</strong><span>{{ $pb->nb_adults }}</span></div>
<div class="field"><strong>Enfants (avec lit)</strong><span>{{ $pb->nb_children_bed }}</span></div>
<div class="field"><strong>Enfants (sans lit)</strong><span>{{ $pb->nb_children_nobed }}</span></div>
<div class="field"><strong>Bébés</strong><span>{{ $pb->nb_infants }}</span></div>
<div class="field"><strong>Total estimé</strong><span>{{ number_format($pb->estimated_total_dzd, 0, ',', ' ') }} DZD</span></div>

<a href="{{ config('app.url') }}/admin/omra/prebookings" class="btn">Voir dans le Dashboard →</a>
@endcomponent
