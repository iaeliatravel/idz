import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../Layouts/MainLayout';
import { useRecaptcha } from '../Hooks/useRecaptcha';

const OCC_LABELS = {
  price_double_dzd: { label: 'Double', desc: 'Tarif par adulte' },
  price_triple_dzd: { label: 'Triple', desc: 'Tarif par adulte' },
  price_single_dzd: { label: 'Single', desc: 'Tarif par adulte' }
};

export default function TourDetail({ tour }) {
  // Gère de manière sécurisée les options d'hôtel
  const options = tour.hotel_options || tour.hotelOptions || [];
  const [selectedHotelId, setSelectedHotelId] = useState(options.length > 0 ? String(options[0].id) : '');
  const [occupancy, setOccupancy] = useState('price_double_dzd');
  const [activeTab, setActiveTab] = useState('program');
  
  // Compteurs
  const [adults, setAdults] = useState(2);
  const [childWithBed, setChildWithBed] = useState(0);
  const [childNoBed, setChildNoBed] = useState(0);
  const [infants, setInfants] = useState(0);
  
  // Estimation du prix total en direct
  const [totalPrice, setTotalPrice] = useState(0);

  // Formulaire
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '' });
  const [status, setStatus] = useState('idle');
  const [ref, setRef] = useState(null);
  const { getToken } = useRecaptcha();

  // Recalcul du prix en temps réel
  useEffect(() => {
    if (options.length === 0 || !selectedHotelId) {
        setTotalPrice(0);
        return;
    }
    const hotel = options.find(h => String(h.id) === selectedHotelId);
    if (!hotel) {
        setTotalPrice(0);
        return;
    }

    const adultUnitPrice = Number(hotel[occupancy] || 0);
    const childWithBedPrice = Number(hotel.price_child_with_bed_dzd || 0);
    const childNoBedPrice = Number(hotel.price_child_no_bed_dzd || 0);
    const infantPrice = Number(hotel.price_infant_dzd || 0);

    const calculated = (adults * adultUnitPrice) +
                       (childWithBed * childWithBedPrice) +
                       (childNoBed * childNoBedPrice) +
                       (infants * infantPrice);

    setTotalPrice(calculated);
  }, [selectedHotelId, occupancy, adults, childWithBed, childNoBed, infants, options]);

  async function handleBook(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const recaptcha_token = await getToken('tour_book');
      const { data } = await axios.post('/api/tours/book', {
        tour_id: tour.id,
        nb_travelers: adults + childWithBed + childNoBed + infants,
        ...form,
        recaptcha_token
      });
      setRef(data.reference);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop';

  return (
    <MainLayout alwaysSolid>
      <Head title={`${tour.title_fr} — Aelia Travel`} />

      <div className="bg-[#F7F5F0] pt-28 pb-32 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4 grid lg:grid-cols-[1.6fr_1fr] gap-8 items-start">
          
          {/* ---- COLONNE GAUCHE : DÉTAILS DU VOYAGE ---- */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-[24px] border border-[#EDE9E0] overflow-hidden shadow-soft">
              <div className="h-64 md:h-[400px] w-full relative">
                <img src={tour.cover_image_url || fallbackImage} className="w-full h-full object-cover" alt={tour.title_fr} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#00143C]/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-xs bg-[#C9A84C] text-[#00143C] font-bold px-3 py-1 rounded-full mb-3 inline-block">
                    📍 {tour.destination}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{tour.title_fr}</h1>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#F7F5F0] border-t border-[#EDE9E0]">
                <div className="p-4 text-center">
                  <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Départ</div>
                  <div className="font-bold text-navy text-sm">{new Date(tour.departure_date).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short' })}</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Retour</div>
                  <div className="font-bold text-navy text-sm">{new Date(tour.return_date).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short' })}</div>
                </div>
                <div className="p-4 text-center col-span-2 md:col-span-2 bg-[#FFF9EC]">
                  <div className="text-[10px] text-[#C9A84C] font-bold uppercase mb-1">À partir de</div>
                  <div className="font-bold text-navy text-lg mono">{Number(tour.price_dzd).toLocaleString('fr-DZ')} DZD</div>
                </div>
              </div>
            </div>

            {/* Onglets Scrollables pour mobile */}
            <div className="flex border-b border-[#EDE9E0] overflow-x-auto bg-white rounded-t-2xl whitespace-nowrap scrollbar-hide w-full">
              <TabButton active={activeTab === 'program'} onClick={() => setActiveTab('program')} label="🗺️ Programme" />
              <TabButton active={activeTab === 'flights'} onClick={() => setActiveTab('flights')} label="✈️ Plan de Vol" />
              <TabButton active={activeTab === 'included'} onClick={() => setActiveTab('included')} label="✅ Inclus dans le Pack" />
              <TabButton active={activeTab === 'remarks'} onClick={() => setActiveTab('remarks')} label="📌 Infos & Remarques" />
            </div>

            <div className="bg-white rounded-b-2xl border border-t-0 border-[#EDE9E0] p-6 shadow-soft">
              {activeTab === 'program' && (
                <div className="space-y-6 text-left">
                  {Array.isArray(tour.program) && tour.program.length > 0 ? (
                    tour.program.map((day, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00143C] to-[#0F2D5C] text-[#C9A84C] flex flex-col items-center justify-center font-bold flex-shrink-0 shadow-md">
                          <span className="text-[9px] uppercase">Jour</span>
                          <span className="text-lg leading-none">{day.day || idx + 1}</span>
                        </div>
                        <div className="flex-1 mt-1">
                          <h4 className="font-bold text-navy text-base">{day.title}</h4>
                          <p className="text-gray-600 text-sm mt-2 leading-relaxed">{day.description}</p>
                        </div>
                      </div>
                    ))
                  ) : <p className="text-gray-400 text-sm">Le programme détaillé sera fourni par nos conseillers.</p>}
                </div>
              )}

              {activeTab === 'flights' && (
                <div className="space-y-4 text-left">
                  {Array.isArray(tour.flights) && tour.flights.length > 0 ? (
                    tour.flights.map((flight, idx) => (
                      <div key={idx} className="bg-[#F7F5F0] rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-[#EDE9E0]">
                        <div>
                          <div className="text-xs text-gray-400 font-bold uppercase mb-1">Vol {idx === 0 ? 'Aller' : 'Retour'}</div>
                          <div className="font-bold text-navy text-base">{flight.from} ➔ {flight.to}</div>
                          <div className="text-xs text-gray-500 mt-1">Compagnie : <span className="font-semibold">{flight.airline || 'Non spécifiée'}</span></div>
                          {flight.escale && (
                            <div className="mt-2 text-[11px] font-bold text-amber-700 bg-amber-100 inline-block px-2.5 py-1 rounded-md border border-amber-200">
                              ⏱ Escale à {flight.escale} ({flight.escale_duration || '?'})
                            </div>
                          )}
                        </div>
                        <div className="w-full md:w-auto border-t md:border-t-0 border-[#EDE9E0] pt-3 md:pt-0 text-left md:text-right">
                          <div className="text-xs text-[#C9A84C] font-bold uppercase">{flight.date}</div>
                          <div className="text-lg font-bold text-navy mono mt-0.5">{flight.time || '—'}</div>
                        </div>
                      </div>
                    ))
                  ) : <p className="text-gray-400 text-sm">Les détails des vols vous seront communiqués lors de la validation.</p>}
                </div>
              )}

              {activeTab === 'included' && (
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h4 className="font-bold text-[#0F6E56] text-sm mb-3">🟢 Compris</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {Array.isArray(tour.included_pack) && tour.included_pack.length > 0 ? 
                        tour.included_pack.map((item, idx) => <li key={idx}>✓ {item}</li>) : <li>Voir contrat.</li>}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-red-500 text-sm mb-3">🔴 Non Compris</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {Array.isArray(tour.excluded_pack) && tour.excluded_pack.length > 0 ? 
                        tour.excluded_pack.map((item, idx) => <li key={idx}>✕ {item}</li>) : <li>Frais personnels.</li>}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'remarks' && (
                <div className="text-left text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                  {tour.remarks || "Aucune remarque particulière."}
                </div>
              )}
            </div>
          </div>

          {/* ---- COLONNE DROITE : SIMULATEUR ---- */}
          <div className="bg-white rounded-[28px] border border-[#EDE9E0] p-6 shadow-soft lg:sticky lg:top-24">
            <h3 className="text-lg font-bold text-navy mb-5 uppercase tracking-wide">Simulateur de Tarif</h3>
            
            {options.length > 0 ? (
              <>
                <div className="mb-5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Choix de l'hébergement</label>
                  <select 
                    value={selectedHotelId} 
                    onChange={(e) => setSelectedHotelId(e.target.value)}
                    className="w-full border border-[#EDE9E0] rounded-xl px-4 py-3 text-sm bg-[#F7F5F0] font-bold text-navy focus:outline-none focus:border-[#C9A84C]"
                  >
                    {options.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.hotel_name} {opt.room_type ? `(${opt.room_type})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Type de Chambre</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(OCC_LABELS).map(([key, item]) => (
                      <button 
                        key={key} type="button" onClick={() => setOccupancy(key)}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all ${occupancy === key ? 'bg-navy text-white border-navy shadow-md' : 'bg-white border-[#EDE9E0] text-gray-500 hover:border-gray-300'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#F7F5F0] pt-5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">Nombre de participants</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Counter label="Adultes" value={adults} min={1} onChange={setAdults} />
                    <Counter label="Enfant (avec lit)" value={childWithBed} min={0} onChange={setChildWithBed} />
                    <Counter label="Enfant (sans lit)" value={childNoBed} min={0} onChange={setChildNoBed} />
                    <Counter label="Bébé (-2 ans)" value={infants} min={0} onChange={setInfants} />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-navy to-navy-light rounded-2xl p-5 text-center text-white mt-6 shadow-md">
                  <div className="text-white/60 text-[10px] uppercase tracking-wider font-bold mb-1">Estimation totale</div>
                  <div className="text-gold text-3xl font-extrabold mono">{totalPrice.toLocaleString('fr-DZ')} <span className="text-sm">DZD</span></div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-amber-50 text-amber-700 text-sm rounded-xl border border-amber-100">
                Les tarifs détaillés ne sont pas encore disponibles pour ce voyage.
              </div>
            )}

            {/* Formulaire */}
            {status === 'success' ? (
              <div className="mt-6 bg-green/10 border border-green/20 rounded-2xl p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-green/10 text-green flex items-center justify-center text-2xl mx-auto mb-3">✓</div>
                <h4 className="font-bold text-[#00143C] mb-1">Réservation transmise !</h4>
                <p className="text-xs text-[#8892A4] mb-2">Référence dossier :</p>
                <div className="inline-block px-4 py-1.5 bg-navy text-gold font-bold rounded-lg text-sm mb-3 mono">{ref}</div>
                <p className="text-xs text-gray-400 leading-relaxed">Notre agence va étudier vos choix et vous appeler sous 24h.</p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="mt-6 space-y-4 border-t border-[#F7F5F0] pt-6 text-left">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Nom Complet *</label>
                  <input required value={form.customer_name} onChange={(e) => setForm({...form, customer_name: e.target.value})} className="w-full border border-[#EDE9E0] rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:border-[#C9A84C] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Téléphone *</label>
                  <input required value={form.customer_phone} onChange={(e) => setForm({...form, customer_phone: e.target.value})} className="w-full border border-[#EDE9E0] rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:border-[#C9A84C] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Adresse E-mail</label>
                  <input type="email" value={form.customer_email} onChange={(e) => setForm({...form, customer_email: e.target.value})} className="w-full border border-[#EDE9E0] rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:border-[#C9A84C] outline-none" />
                </div>
                
                <button disabled={status === 'sending' || options.length === 0} className="w-full py-4 rounded-full font-bold text-white bg-[#0F6E56] hover:bg-[#17A882] disabled:opacity-50 transition-colors shadow-md mt-2">
                  {status === 'sending' ? 'Envoi...' : 'Demander cette formule →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button type="button" onClick={onClick} className={`px-5 py-3.5 font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${active ? 'border-[#C9A84C] text-[#00143C]' : 'border-transparent text-gray-400 hover:text-navy'}`}>
      {label}
    </button>
  );
}

// Le Compteur Superposé (Idéal pour mobile)
function Counter({ label, value, min, onChange }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-xl p-3 border border-[#EDE9E0] gap-2 shadow-sm">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center w-full">{label}</span>
      <div className="flex items-center justify-center gap-3 w-full" dir="ltr">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded-lg bg-[#F7F5F0] font-bold text-gray-400 hover:bg-[#EDE9E0] transition-colors text-xl flex items-center justify-center select-none shadow-sm border border-[#EDE9E0]"> − </button>
        <span className="w-5 text-center font-bold text-[#00143C] text-sm mono">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-lg bg-[#F7F5F0] font-bold text-gray-400 hover:bg-[#EDE9E0] transition-colors text-xl flex items-center justify-center select-none shadow-sm border border-[#EDE9E0]"> + </button>
      </div>
    </div>
  );
}