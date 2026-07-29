import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../Layouts/MainLayout';
import { useRecaptcha } from '../Hooks/useRecaptcha';

export default function Maritime() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', customer_email: '',
    departure_date: '', return_date: '', nb_passengers: 1,
    has_vehicle: false, vehicle_type: ''
  });

  const [status, setStatus] = useState('idle');
  const [ref, setRef] = useState(null);
  const [error, setError] = useState(null); // <-- CORRECTION : Déclaration de l'état d'erreur
  const { getToken } = useRecaptcha();

  useEffect(() => {
    axios.get('/api/maritime/data').then(({ data }) => setCompanies(data));
  }, []);

  const activeCompany = companies.find(c => String(c.id) === String(selectedCompanyId));
  const routes = activeCompany?.routes || [];

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setError(null); // On réinitialise l'erreur
    try {
      const token = await getToken('maritime_book');
      const payload = {
        route_id: selectedRouteId,
        has_vehicle: form.has_vehicle,
        vehicle_type: form.has_vehicle ? form.vehicle_type : null,
        departure_date: form.departure_date,
        return_date: isRoundTrip ? form.return_date : null,
        nb_passengers: form.nb_passengers,
        recaptcha_token: token,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email,
      };

      const { data } = await axios.post('/api/maritime/book', payload);
      setRef(data.reference);
      setStatus('success');
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur est survenue lors de l'envoi de la demande. Merci de réessayer.");
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <MainLayout alwaysSolid>
        <Head title="Demande de traversée enregistrée — UrPlanet" />
        <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4 pt-28 pb-16">
          <div className="bg-white rounded-[28px] max-w-[550px] w-full p-8 border border-[#EDE9E0] shadow-soft text-center">
            <div className="w-16 h-16 rounded-full bg-[#0F6E56]/10 text-[#0F6E56] text-3xl flex items-center justify-center mx-auto mb-4">🚢</div>
            <h2 className="text-[#00143C] mb-2 font-bold">Demande de billet reçue !</h2>
            <p className="text-[#8892A4] text-xs mb-3">Référence de votre dossier de réservation :</p>
            <div className="inline-block px-8 py-3 rounded-2xl bg-navy text-gold font-bold text-lg mono mb-5 shadow-sm">{ref}</div>
            
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Un conseiller va vérifier les disponibilités et vous contacter sous peu. Vous pourrez effectuer votre règlement via l'un de nos canaux.
            </p>

            {/* Méthodes de paiement de la page 4 du PDF */}
            <div className="bg-[#F7F5F0] rounded-2xl p-4 text-left text-xs text-gray-500 mb-6 space-y-2 border">
              <strong className="text-navy uppercase text-[10px] tracking-wider block mb-2">💳 Méthodes de paiement acceptées :</strong>
              <div className="grid grid-cols-2 gap-2 font-semibold">
                <div>• CCP</div>
                <div>• BARIDIMOB</div>
                <div>• Société Générale</div>
                <div>• BDL</div>
                <div className="col-span-2">• CPA (Crédit Populaire d'Algérie)</div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 border-t pt-2">
                Envoyez votre reçu de paiement à : <strong className="text-navy">paiement@urplanethotels.com</strong>
              </p>
            </div>

            <Link href="/" className="w-full py-3 bg-navy text-white rounded-full font-bold block text-sm">Retour à l'accueil</Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout alwaysSolid>
      <Head title="Réservation de Billets Maritimes — UrPlanet" />
      <div className="bg-[#F7F5F0] pt-28 pb-32 min-h-screen">
        <div className="max-w-[560px] mx-auto px-4">
          
          <div className="text-center mb-6">
            <span className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-[0.25em] block mb-2">⚓ Traversées confortables</span>
            <h1 className="text-navy text-2xl md:text-3xl font-extrabold mb-3">Billetterie Maritime</h1>
            <p className="text-gray-500 text-xs md:text-sm">Réservez facilement vos traversées entre l'Algérie et l'Europe (France, Espagne).</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ÉTAPE 1 : Choix Compagnie & Route */}
            <div className="bg-white rounded-2xl p-5 border border-[#EDE9E0] shadow-soft">
              <div className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">1. Choix du trajet</div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">Compagnie Maritime</label>
                  <select required value={selectedCompanyId} onChange={(e) => { setSelectedCompanyId(e.target.value); setSelectedRouteId(''); }} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white outline-none">
                    <option value="">-- Sélectionner la compagnie --</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {selectedCompanyId && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">Traversée Disponible</label>
                    <select required value={selectedRouteId} onChange={(e) => setSelectedRouteId(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white outline-none">
                      <option value="">-- Sélectionner le trajet --</option>
                      {routes.map(r => (
                        <option key={r.id} value={r.id}>{r.departure_port} ↔ {r.arrival_port}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* ÉTAPE 2 : Dates & Voyageurs */}
            <div className="bg-white rounded-2xl p-5 border border-[#EDE9E0] shadow-soft">
              <div className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">2. Dates & Voyageurs</div>
              
              <div className="space-y-4">
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                    <input type="radio" checked={isRoundTrip} onChange={() => setIsRoundTrip(true)} /> Aller-Retour
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                    <input type="radio" checked={!isRoundTrip} onChange={() => setIsRoundTrip(false)} /> Aller Simple
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Date de départ</label>
                    <input type="date" required value={form.departure_date} onChange={(e) => setForm({...form, departure_date: e.target.value})} className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-sm focus:bg-white outline-none" />
                  </div>
                  {isRoundTrip && (
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold block mb-1">Date de retour</label>
                      <input type="date" required={isRoundTrip} value={form.return_date} onChange={(e) => setForm({...form, return_date: e.target.value})} className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-sm focus:bg-white outline-none" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Nombre de passagers</label>
                    <input type="number" min={1} max={9} required value={form.nb_passengers} onChange={(e) => setForm({...form, nb_passengers: parseInt(e.target.value)})} className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-sm focus:bg-white outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Voyagez-vous avec un véhicule ?</label>
                    <select value={form.has_vehicle ? 'yes' : 'no'} onChange={(e) => setForm({...form, has_vehicle: e.target.value === 'yes'})} className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-sm focus:bg-white outline-none">
                      <option value="no">Non (Piéton)</option>
                      <option value="yes">Oui (Avec véhicule)</option>
                    </select>
                  </div>
                </div>

                {form.has_vehicle && (
                  <div className="bg-[#FFF9EC] border border-[#C9A84C]/20 p-3 rounded-xl">
                    <label className="text-[10px] text-[#C9A84C] font-bold block mb-1">Type de véhicule / Dimensions</label>
                    <input type="text" placeholder="Ex: Peugeot 3008, Fourgon hauteur < 2m" value={form.vehicle_type} onChange={(e) => setForm({...form, vehicle_type: e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none" />
                  </div>
                )}
              </div>
            </div>

            {/* ÉTAPE 3 : Coordonnées */}
            <div className="bg-white rounded-2xl p-5 border border-[#EDE9E0] shadow-soft">
              <div className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">3. Vos Coordonnées</div>
              <div className="space-y-3">
                <input required value={form.customer_name} onChange={(e) => setForm({...form, customer_name: e.target.value})} placeholder="Nom complet" className="w-full border rounded-xl px-4 py-2.5 text-sm bg-[#F7F5F0] focus:bg-white focus:border-[#C9A84C] outline-none" />
                <input required value={form.customer_phone} onChange={(e) => setForm({...form, customer_phone: e.target.value})} placeholder="Numéro de téléphone" className="w-full border rounded-xl px-4 py-2.5 text-sm bg-[#F7F5F0] focus:bg-white focus:border-[#C9A84C] outline-none" />
                <input type="email" value={form.customer_email} onChange={(e) => setForm({...form, customer_email: e.target.value})} placeholder="Adresse email (facultatif)" className="w-full border rounded-xl px-4 py-2.5 text-sm bg-[#F7F5F0] focus:bg-white focus:border-[#C9A84C] outline-none" />
              </div>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">{error}</div>}

            <button type="submit" disabled={status === 'sending'} className="w-full py-4 rounded-full font-bold text-white bg-gradient-to-br from-[#00143C] to-[#0F2D5C] disabled:opacity-50">
              {status === 'sending' ? 'Envoi de votre demande...' : 'Soumettre ma demande de traversée ➔'}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}