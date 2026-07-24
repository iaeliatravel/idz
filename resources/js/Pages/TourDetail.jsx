import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import MainLayout from '../Layouts/MainLayout';
import { useRecaptcha } from '../Hooks/useRecaptcha';

export default function TourDetail({ tour }) {
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '', nb_travelers: 1 });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [ref, setRef] = useState(null);
  const { getToken } = useRecaptcha();

  const fallbackImage = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop`;

  async function handleBook(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const recaptcha_token = await getToken('tour_book');
      const { data } = await axios.post('/api/tours/book', {
        tour_id: tour.id,
        ...form,
        recaptcha_token
      });
      setRef(data.reference);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <MainLayout alwaysSolid>
      <Head title={`${tour.title_fr} — Aelia Travel`} />

      <div className="bg-[#F7F5F0] pt-28 pb-16 min-h-screen">
        <div className="max-w-[1100px] mx-auto px-6 grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
          
          {/* Bloc Gauche — Détails du programme */}
          <div className="bg-white rounded-[24px] border border-[#EDE9E0] overflow-hidden shadow-soft">
            <div className="h-64 md:h-80 w-full overflow-hidden bg-gray-100 relative">
              <img src={tour.cover_image_url || fallbackImage} className="w-full h-full object-cover" alt={tour.title_fr} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-6 text-white">
                <span className="text-xs bg-[#C9A84C] text-[#00143C] font-bold px-3 py-1 rounded-full">📍 {tour.destination}</span>
                <h1 className="text-2xl md:text-3xl font-bold mt-2 text-white">{tour.title_fr}</h1>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Infos clés */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-[#F7F5F0] p-4 rounded-2xl text-sm">
                <div>
                  <div className="text-gray-400 text-xs">Date de départ</div>
                  <div className="font-bold text-[#00143C] mt-0.5">{new Date(tour.departure_date).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Date de retour</div>
                  <div className="font-bold text-[#00143C] mt-0.5">{new Date(tour.return_date).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <div className="text-gray-400 text-xs">Places disponibles</div>
                  <div className="font-bold text-[#0F6E56] mt-0.5">{tour.seats_remaining ?? 'Disponibles'}</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-navy mb-2">Description du programme</h3>
                <p className="text-[#8892A4] text-sm leading-relaxed whitespace-pre-line">{tour.description_fr || "Aucune description n'a été rédigée pour ce voyage. Veuillez contacter notre agence pour obtenir l'itinéraire complet."}</p>
              </div>
            </div>
          </div>

          {/* Bloc Droite — Réservation */}
          <div className="bg-white rounded-[24px] border border-[#EDE9E0] p-6 shadow-soft sticky top-24">
            <h3 className="text-lg font-bold text-navy mb-4">Réserver votre place</h3>
            
            <div className="bg-[#FFF9EC] p-4 rounded-xl border border-[#C9A84C]/30 mb-5">
              <div className="text-xs text-[#8892A4]">Tarif par Adulte</div>
              <div className="text-navy font-bold text-2xl mono mt-0.5">{Number(tour.price_dzd).toLocaleString('fr-DZ')} <span className="text-sm font-semibold">DZD</span></div>
              {tour.price_child_dzd > 0 && (
                <div className="text-xs text-navy/70 mt-1">Tarif Enfant : {Number(tour.price_child_dzd).toLocaleString('fr-DZ')} DZD</div>
              )}
            </div>

            {status === 'success' ? (
              <div className="text-center py-6 bg-green/5 border border-green/20 rounded-xl p-4">
                <div className="w-12 h-12 rounded-full bg-green/10 text-green flex items-center justify-center text-2xl mx-auto mb-3">✓</div>
                <h4 className="font-bold text-[#00143C] mb-1">Pré-réservation enregistrée !</h4>
                <p className="text-xs text-[#8892A4] mb-3">Votre référence est :</p>
                <div className="inline-block px-5 py-1.5 bg-[#00143C] text-[#C9A84C] font-bold rounded-lg mono mb-3 text-sm">{ref}</div>
                <p className="text-xs text-[#8892A4]">Notre équipe va vous appeler par téléphone sous 24h pour finaliser votre dossier de voyage.</p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Votre Nom Complet *</label>
                  <input required value={form.customer_name} onChange={(e) => setForm({...form, customer_name: e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm bg-cream" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Téléphone *</label>
                  <input required value={form.customer_phone} onChange={(e) => setForm({...form, customer_phone: e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm bg-cream" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">E-mail</label>
                  <input type="email" value={form.customer_email} onChange={(e) => setForm({...form, customer_email: e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm bg-cream" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Nombre de voyageurs *</label>
                  <input type="number" min="1" max="10" required value={form.nb_travelers} onChange={(e) => setForm({...form, nb_travelers: e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm bg-cream" />
                </div>

                {status === 'error' && (
                  <p className="text-xs text-red-500">Une erreur est survenue, merci de réessayer.</p>
                )}

                <button disabled={status === 'sending'} className="w-full py-3.5 bg-gradient-to-br from-[#0F6E56] to-[#17A882] text-white font-bold rounded-full disabled:opacity-50 transition-shadow hover:shadow-card">
                  {status === 'sending' ? 'Réservation en cours...' : 'Confirmer ma pré-réservation →'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </MainLayout>
  );
}