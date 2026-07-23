import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { Toolbar, Badge, EmptyState, IconButton, Modal, FormField, inputClass, formatDate, Spinner } from '../Shared/UI';

const STATUS_BADGE   = { ouvert: 'green', complet: 'amber', clos: 'red', brouillon: 'blue' };
const STATUS_LABELS  = { ouvert: 'Ouvert', complet: 'Complet', clos: 'Clos', brouillon: 'Brouillon' };
const OCCUPANCIES    = ['quintuple', 'quadruple', 'triple', 'double'];
const OCC_LABELS     = { quintuple: 'Quintuple (5)', quadruple: 'Quadruple (4)', triple: 'Triple (3)', double: 'Double (2)' };

export default function OmraDepartures() {
  const [departures,  setDepartures]  = useState(null);
  const [airlines,    setAirlines]    = useState([]);
  const [partners,    setPartners]    = useState([]);
  const [hotels,      setHotels]      = useState([]);
  const [editing,     setEditing]     = useState(null);

  function load() {
    api.get('/omra/departures').then(({ data }) => setDepartures(data));
  }

  useEffect(() => {
    load();
    api.get('/omra/airlines').then(({ data }) => setAirlines(data));
    api.get('/omra/partners').then(({ data }) => setPartners(data));
    api.get('/omra/hotels').then(({ data }) => setHotels(data));
  }, []);

  if (!departures) return <div className="text-center py-20"><Spinner /></div>;

  const mecqueHotels = hotels.filter((h) => h.city === 'mecque');
  const medineHotels = hotels.filter((h) => h.city === 'medine');

  async function handleDelete(d) {
    if (!confirm('Supprimer ce départ et toutes ses formules/tarifs ?')) return;
    await api.delete(`/omra/departures/${d.id}`);
    load();
  }

  async function handleDuplicate(d) {
    if (!confirm('Voulez-vous dupliquer ce départ et toutes ses formules ?')) return;
    await api.post(`/omra/departures/${d.id}/duplicate`);
    load();
  }

  return (
    <div>
      <Toolbar>
        <div />
        <button onClick={() => setEditing({})}
          className="px-5 py-2.5 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold text-sm">
          + Ajouter un départ
        </button>
      </Toolbar>

      <div className="space-y-3">
        {departures.length ? departures.map((d) => (
          <div key={d.id} className="bg-white rounded-xl border overflow-hidden">
            {/* Image du départ */}
            {d.cover_image_url && (
              <div className="relative h-32 overflow-hidden">
                <img src={d.cover_image_url} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white font-arabic font-bold">{d.title_ar}</div>
              </div>
            )}
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  {!d.cover_image_url && (
                    <strong dir="rtl" className="font-arabic text-lg block">{d.title_ar}</strong>
                  )}
                  <div className="text-sm text-gray-500 mt-1">
                    {d.airline_name || '—'} · {formatDate(d.departure_date)} → {formatDate(d.return_date)}
                  </div>
                </div>
                <div className="flex gap-2 items-center flex-shrink-0">
                  <Badge color={STATUS_BADGE[d.status]}>{STATUS_LABELS[d.status]}</Badge>
                  <IconButton title="Modifier" onClick={() => setEditing(d)}>✏️</IconButton>
                  <IconButton title="Dupliquer" onClick={() => handleDuplicate(d)}>📋</IconButton> {/* <-- AJOUTÉ */}
                  <IconButton title="Supprimer" danger onClick={() => handleDelete(d)}>🗑️</IconButton>
                </div>
              </div>

              {d.packages?.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-3 mt-3 pt-3 border-t">
                  {d.packages.map((pkg) => (
                    <div key={pkg.id} className="bg-gray-50 rounded-lg p-3 text-sm flex gap-3">
                      {/* Miniature hôtel Mecque */}
                      {pkg.mecque_hotel_image && (
                        <img src={pkg.mecque_hotel_image} className="w-16 h-14 rounded-lg object-cover flex-shrink-0" alt="" />
                      )}
                      <div>
                        <div className="font-bold text-navy">🕋 {pkg.mecque_hotel_name || '—'} ({pkg.mecque_nights}n)</div>
                        <div className="text-gray-500 text-xs">🕌 {pkg.medine_hotel_name || '—'} ({pkg.medine_nights}n)</div>
                        <div className="text-xs text-gray-400 mt-1">{pkg.pricing?.length || 0} tarif(s)</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-2">Aucune formule configurée.</p>
              )}
            </div>
          </div>
        )) : <EmptyState icon="✈" text="Aucun départ configuré." />}
      </div>

      {editing !== null && (
        <DepartureFormModal
          departure={editing} airlines={airlines} partners={partners}
          mecqueHotels={mecqueHotels} medineHotels={medineHotels}
          onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function emptyPricing() {
  return OCCUPANCIES.map((occ) => ({
    occupancy: occ,
    adult_cost: 0, adult_sale: 0,
    child_bed_cost: 0, child_bed_sale: 0,
    child_nobed_cost: 0, child_nobed_sale: 0,
    infant_cost: 0, infant_sale: 0,
  }));
}

function emptyPackage() {
  return {
    label: '', mecque_hotel_id: '', mecque_nights: 7,
    medine_hotel_id: '', medine_nights: 3,
    pricing: emptyPricing(),
  };
}

function DepartureFormModal({ departure, airlines, partners, mecqueHotels, medineHotels, onClose, onSaved }) {
  const isNew = !departure.id;

  const [form, setForm] = useState({
    title_ar:                 departure.title_ar || '',
    airline_id:               departure.airline_id || '',
    partner_id:               departure.partner_id || '',
    departure_date:           departure.departure_date?.slice(0, 10) || '',
    return_date:              departure.return_date?.slice(0, 10) || '',
    departure_airport:        departure.departure_airport || '',
    arrival_airport:          departure.arrival_airport || '',
    return_departure_airport: departure.return_departure_airport || '',
    return_arrival_airport:   departure.return_arrival_airport || '',
    duration_nights:          departure.duration_nights || '',
    status:                   departure.status || 'ouvert',
    seats_total:              departure.seats_total || '',
    seats_remaining:          departure.seats_remaining || '',
    // Image de couverture du départ (optionnelle)
    cover_image_url:          departure.cover_image_url || '',
    // Source d'image pour les cartes : 'hotel' = première image hôtel Mecque, 'custom' = URL personnalisée
    image_source:             departure.cover_image_url ? 'custom' : 'hotel',
  });

  const [packages, setPackages] = useState(() => {
    const existing = departure.packages || [];
    if (!existing.length) return [emptyPackage()];
    return existing.map((pkg) => ({
      label:           pkg.label || '',
      mecque_hotel_id: pkg.mecque_hotel_id || '',
      mecque_nights:   pkg.mecque_nights || 7,
      medine_hotel_id: pkg.medine_hotel_id || '',
      medine_nights:   pkg.medine_nights || 3,
      pricing: OCCUPANCIES.map((occ) => {
        const p = (pkg.pricing || []).find((x) => x.occupancy === occ) || {};
        return {
          occupancy:       occ,
          adult_cost:      p.adult_cost_dzd       || 0,
          adult_sale:      p.adult_sale_dzd        || 0,
          child_bed_cost:  p.child_with_bed_cost_dzd || 0,
          child_bed_sale:  p.child_with_bed_sale_dzd || 0,
          child_nobed_cost:p.child_no_bed_cost_dzd  || 0,
          child_nobed_sale:p.child_no_bed_sale_dzd  || 0,
          infant_cost:     p.infant_cost_dzd       || 0,
          infant_sale:     p.infant_sale_dzd        || 0,
        };
      }),
    }));
  });

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);
  const [coverPreview, setCoverPreview] = useState(departure.cover_image_url || '');

  // Prévisualisation de l'image selon la source choisie
  const firstMecqueHotelImage = (() => {
    if (packages[0]?.mecque_hotel_id) {
      const h = mecqueHotels.find((h) => String(h.id) === String(packages[0].mecque_hotel_id));
      return h?.images?.[0]?.image_url || null;
    }
    return null;
  })();

  const previewImage = form.image_source === 'hotel' ? firstMecqueHotelImage : coverPreview;

  function updatePackageField(i, field, value) {
    setPackages((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }

  function updatePricingField(pkgIdx, occ, field, value) {
    setPackages((prev) => prev.map((p, i) => {
      if (i !== pkgIdx) return p;
      return { ...p, pricing: p.pricing.map((pr) => pr.occupancy === occ ? { ...pr, [field]: value } : pr) };
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      // Détermine l'URL d'image à sauvegarder
      const coverImageUrl = form.image_source === 'hotel'
        ? (firstMecqueHotelImage || '')
        : form.cover_image_url;

      const payload = {
        ...form,
        cover_image_url: coverImageUrl,
        packages: packages.filter((p) => p.mecque_hotel_id || p.medine_hotel_id),
      };

      if (isNew) await api.post('/omra/departures', payload);
      else       await api.put(`/omra/departures/${departure.id}`, payload);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isNew ? 'Ajouter un départ' : 'Modifier le départ'} onClose={onClose} maxWidth="960px">
      <form onSubmit={handleSubmit}>
        <FormField label="عنوان العرض (Titre en arabe)" required>
          <input dir="rtl" required value={form.title_ar}
            onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
            placeholder="عمرة شهر رمضان - 10 أيام" className={inputClass} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Compagnie aérienne">
            <select value={form.airline_id} onChange={(e) => setForm({ ...form, airline_id: e.target.value })} className={inputClass}>
              <option value="">-- Non spécifié --</option>
              {airlines.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </FormField>
          <FormField label="Partenaire (masqué public)">
            <select value={form.partner_id} onChange={(e) => setForm({ ...form, partner_id: e.target.value })} className={inputClass}>
              <option value="">-- Non spécifié --</option>
              {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date de départ" required>
            <input type="date" required value={form.departure_date} onChange={(e) => setForm({ ...form, departure_date: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="Date de retour" required>
            <input type="date" required value={form.return_date} onChange={(e) => setForm({ ...form, return_date: e.target.value })} className={inputClass} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Aéroport départ">
            <input value={form.departure_airport} onChange={(e) => setForm({ ...form, departure_airport: e.target.value })} placeholder="Alger (ALG)" className={inputClass} />
          </FormField>
          <FormField label="Aéroport arrivée">
            <input value={form.arrival_airport} onChange={(e) => setForm({ ...form, arrival_airport: e.target.value })} placeholder="Djeddah (JED)" className={inputClass} />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Durée (nuits)">
            <input type="number" value={form.duration_nights} onChange={(e) => setForm({ ...form, duration_nights: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="Statut">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </FormField>
          <FormField label="Places">
            <div className="flex gap-2">
              <input type="number" value={form.seats_total} onChange={(e) => setForm({ ...form, seats_total: e.target.value })} placeholder="Total" className={inputClass} />
              <input type="number" value={form.seats_remaining} onChange={(e) => setForm({ ...form, seats_remaining: e.target.value })} placeholder="Restantes" className={inputClass} />
            </div>
          </FormField>
        </div>

        {/* ── Image de couverture ── */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-bold text-sm mb-3">🖼 Image affichée sur les cartes de départ</h4>
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="hotel" checked={form.image_source === 'hotel'}
                onChange={() => setForm({ ...form, image_source: 'hotel' })} />
              <span className="text-sm">Image de l'hôtel Mecque (automatique)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="custom" checked={form.image_source === 'custom'}
                onChange={() => setForm({ ...form, image_source: 'custom' })} />
              <span className="text-sm">Image personnalisée (URL)</span>
            </label>
          </div>

          {form.image_source === 'custom' && (
            <FormField label="URL de l'image personnalisée">
              <input value={form.cover_image_url}
                onChange={(e) => { setForm({ ...form, cover_image_url: e.target.value }); setCoverPreview(e.target.value); }}
                placeholder="https://..." className={inputClass} />
            </FormField>
          )}

          {form.image_source === 'hotel' && !firstMecqueHotelImage && (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              ⚠ Configurez d'abord les images de l'hôtel Mecque dans la section Hôtels pour qu'elles apparaissent automatiquement.
            </p>
          )}

          {previewImage && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1.5">Aperçu :</p>
              <img src={previewImage} className="h-32 rounded-xl object-cover w-full" alt="Aperçu" />
            </div>
          )}
        </div>

        {/* ── Formules ── */}
        <h4 className="font-bold mt-6 mb-3 pt-4 border-t">🏨 Formules d'hébergement</h4>
        <p className="text-sm text-gray-500 mb-4">Chaque formule = hôtel Mecque + hôtel Médine + sa propre grille tarifaire.</p>

        {packages.map((pkg, pkgIdx) => (
          <div key={pkgIdx} className="border-2 border-gray-100 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-sm">Formule {pkgIdx + 1}</span>
              {packages.length > 1 && (
                <button type="button" onClick={() => setPackages((p) => p.filter((_, i) => i !== pkgIdx))} className="text-xs text-red-500">Retirer</button>
              )}
            </div>

            <FormField label="Libellé (optionnel)">
              <input value={pkg.label} onChange={(e) => updatePackageField(pkgIdx, 'label', e.target.value)}
                placeholder="ex: Formule Confort" className={inputClass} />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 rounded-lg p-3">
                <label className="text-xs font-bold block mb-1">🕋 Hôtel Mecque (mis en avant)</label>
                <select value={pkg.mecque_hotel_id}
                  onChange={(e) => updatePackageField(pkgIdx, 'mecque_hotel_id', e.target.value)}
                  className={`${inputClass} mb-2`}>
                  <option value="">-- Choisir --</option>
                  {mecqueHotels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
                <input type="number" placeholder="Nuits à Mecque" value={pkg.mecque_nights}
                  onChange={(e) => updatePackageField(pkgIdx, 'mecque_nights', e.target.value)} className={inputClass} />
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <label className="text-xs font-bold block mb-1">🕌 Hôtel Médine</label>
                <select value={pkg.medine_hotel_id}
                  onChange={(e) => updatePackageField(pkgIdx, 'medine_hotel_id', e.target.value)}
                  className={`${inputClass} mb-2`}>
                  <option value="">-- Choisir --</option>
                  {medineHotels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
                <input type="number" placeholder="Nuits à Médine" value={pkg.medine_nights}
                  onChange={(e) => updatePackageField(pkgIdx, 'medine_nights', e.target.value)} className={inputClass} />
              </div>
            </div>

            <h5 className="font-bold text-sm mt-4 mb-2">💰 Grille tarifaire</h5>
            {pkg.pricing.map((p) => (
              <div key={p.occupancy} className="bg-gray-50 rounded-lg p-3 mb-2">
                <span className="text-xs font-bold block mb-2">{OCC_LABELS[p.occupancy]}</span>
                <div className="grid grid-cols-4 gap-2 mb-1.5">
                  <PriceField label="Adulte Coût"   value={p.adult_cost}       onChange={(v) => updatePricingField(pkgIdx, p.occupancy, 'adult_cost', v)} />
                  <PriceField label="Adulte Vente"  value={p.adult_sale}       onChange={(v) => updatePricingField(pkgIdx, p.occupancy, 'adult_sale', v)} />
                  <PriceField label="Enf+lit Coût"  value={p.child_bed_cost}   onChange={(v) => updatePricingField(pkgIdx, p.occupancy, 'child_bed_cost', v)} />
                  <PriceField label="Enf+lit Vente" value={p.child_bed_sale}   onChange={(v) => updatePricingField(pkgIdx, p.occupancy, 'child_bed_sale', v)} />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <PriceField label="S.lit Coût"    value={p.child_nobed_cost} onChange={(v) => updatePricingField(pkgIdx, p.occupancy, 'child_nobed_cost', v)} />
                  <PriceField label="S.lit Vente"   value={p.child_nobed_sale} onChange={(v) => updatePricingField(pkgIdx, p.occupancy, 'child_nobed_sale', v)} />
                  <PriceField label="Bébé Coût"     value={p.infant_cost}      onChange={(v) => updatePricingField(pkgIdx, p.occupancy, 'infant_cost', v)} />
                  <PriceField label="Bébé Vente"    value={p.infant_sale}      onChange={(v) => updatePricingField(pkgIdx, p.occupancy, 'infant_sale', v)} />
                </div>
              </div>
            ))}
          </div>
        ))}

        <button type="button" onClick={() => setPackages((p) => [...p, emptyPackage()])}
          className="px-4 py-2 border rounded-full text-sm mb-4">
          + Ajouter une autre formule
        </button>

        {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl mb-3">{error}</div>}

        <button disabled={saving} className="w-full py-3 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold disabled:opacity-50">
          {saving ? 'Enregistrement...' : 'Enregistrer le départ'}
        </button>
      </form>
    </Modal>
  );
}

function PriceField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-[10px] font-semibold block mb-0.5">{label}</label>
      <input type="number" step="0.01" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-2 py-1 text-sm" />
    </div>
  );
}
