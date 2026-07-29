import { Head, Link } from '@inertiajs/react';
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
  const options = Array.isArray(tour.hotel_options) ? tour.hotel_options : (Array.isArray(tour.hotelOptions) ? tour.hotelOptions : []);
  const departures = Array.isArray(tour.departures) ? tour.departures : [];
  
  // États du Simulateur
  const [selectedDepartureId, setSelectedDepartureId] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [occupancy, setOccupancy] = useState('price_double_dzd');
  const [adults, setAdults] = useState(2);
  const [childWithBed, setChildWithBed] = useState(0);
  const [childNoBed, setChildNoBed] = useState(0);
  const [infants, setInfants] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // États du Formulaire de Réservation
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '' });
  const [status, setStatus] = useState('idle');
  const [ref, setRef] = useState(null);
  const { getToken } = useRecaptcha();

  // Initialisation des sélecteurs au chargement
  useEffect(() => {
    if (options.length > 0 && !selectedHotelId) setSelectedHotelId(String(options[0].id));
    if (departures.length > 0 && !selectedDepartureId) setSelectedDepartureId(String(departures[0].id));
  }, [options, departures]);

  // Recalcul du prix en temps réel
  useEffect(() => {
    if (options.length === 0 || !selectedHotelId) {
        setTotalPrice(0);
        return;
    }
    const hotel = options.find(h => String(h.id) === String(selectedHotelId));
    if (!hotel) return;

    const adultUnitPrice = Number(hotel[occupancy]) || 0;
    const childWithBedPrice = Number(hotel.price_child_with_bed_dzd) || 0;
    const childNoBedPrice = Number(hotel.price_child_no_bed_dzd) || 0;
    const infantPrice = Number(hotel.price_infant_dzd) || 0;

    const calculated = (adults * adultUnitPrice) + (childWithBed * childWithBedPrice) + (childNoBed * childNoBedPrice) + (infants * infantPrice);
    setTotalPrice(calculated);
  }, [selectedHotelId, occupancy, adults, childWithBed, childNoBed, infants, options]);

  async function handleBook(e) {
    e.preventDefault();
    if (!selectedDepartureId) return alert("Veuillez sélectionner une date de départ.");
    
    setStatus('sending');
    try {
      const recaptcha_token = await getToken('tour_book');
      const hotel = options.find(h => String(h.id) === String(selectedHotelId)); // On récupère l'hôtel
      
      const { data } = await axios.post('/api/tours/book', {
        tour_departure_id: selectedDepartureId,
        hotel_name: hotel?.hotel_name || '',
        room_type: OCC_LABELS[occupancy]?.label || occupancy,
        nb_adults: adults,
        nb_children_bed: childWithBed,
        nb_children_nobed: childNoBed,
        nb_infants: infants,
        total_price_dzd: totalPrice,
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

  // Trouve le départ actif pour afficher les bonnes dates et bons vols
  const activeDeparture = departures.find(d => String(d.id) === String(selectedDepartureId)) || departures[0] || {};
  const activeFlights = activeDeparture.flights || [];

  const fallbackImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop';

  const safeFormatDateShort = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(/-/g, '/');
      const d = new Date(normalized);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <MainLayout alwaysSolid>
      <Head>
        <title>{`${tour.title_fr} — Aelia Travel`}</title>
        <meta name="description" content={`Découvrez notre voyage organisé vers ${tour.destination}. À partir de ${Number(tour.price_dzd).toLocaleString('fr-DZ')} DZD.`} />
        <meta property="og:image" content={tour.cover_image_url || fallbackImage} />
      </Head>

      <div className="bg-[#F7F5F0] pt-28 pb-32 min-h-screen">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-8 items-start">
          
          {/* ---- COLONNE GAUCHE : DÉTAILS DU VOYAGE ---- */}
          <div className="space-y-6 w-full overflow-hidden">
            
            {/* Header / Bannière Dynamique */}
            <div className="bg-white rounded-[24px] border border-[#EDE9E0] overflow-hidden shadow-soft">
              <div className="h-64 md:h-80 w-full overflow-hidden bg-gray-100 relative">
                <img src={tour.cover_image_url || fallbackImage} className="w-full h-full object-cover" alt={tour.title_fr} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 md:left-6 text-white text-left">
                  <span className="text-[10px] md:text-xs bg-[#C9A84C] text-[#00143C] font-bold px-3 py-1 rounded-full inline-block mb-2">
                    📍 {tour.destination}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{tour.title_fr}</h1>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#F7F5F0] border-t border-[#EDE9E0]">
                <div className="p-4 text-center">
                  <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Départ</div>
                  <div className="font-bold text-navy text-sm">
                    {safeFormatDateShort(activeDeparture.departure_date)}
                  </div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Retour</div>
                  <div className="font-bold text-navy text-sm">
                    {safeFormatDateShort(activeDeparture.return_date)}
                  </div>
                </div>
                <div className="p-4 text-center col-span-2 md:col-span-2 bg-[#FFF9EC]">
                  <div className="text-[10px] text-[#C9A84C] font-bold uppercase mb-1">À partir de</div>
                  <div className="font-bold text-navy text-lg mono">{Number(tour.price_dzd).toLocaleString('fr-DZ')} DZD</div>
                </div>
              </div>
            </div>

            {/* SECTION 1 : PROGRAMME */}
            <div className="bg-white rounded-[24px] border border-[#EDE9E0] p-5 md:p-8 shadow-soft">
              <h3 className="text-lg font-bold text-navy mb-6 uppercase tracking-wider border-b border-[#F7F5F0] pb-3">🗺️ Programme détaillé</h3>
              <div className="space-y-6 text-left">
                {Array.isArray(tour.program) && tour.program.length > 0 ? (
                  tour.program.map((day, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
                      <div className="w-auto sm:w-16 h-8 sm:h-16 px-3 sm:px-0 rounded-lg sm:rounded-xl bg-[#0F6E56]/10 text-[#0F6E56] flex items-center justify-center font-bold flex-shrink-0">
                        <span className="text-xs sm:text-sm">Jour {day.day || idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-navy text-sm md:text-base">{day.title}</h4>
                        <p className="text-gray-500 text-xs md:text-sm mt-1.5 leading-relaxed">{day.description}</p>
                      </div>
                    </div>
                  ))
                ) : <p className="text-gray-400 text-sm">Le programme détaillé sera fourni par nos conseillers.</p>}
              </div>
            </div>

            {/* SECTION 2 : PLAN DE VOL DYNAMIQUE */}
            {activeFlights.length > 0 && (
              <div className="bg-white rounded-[24px] border border-[#EDE9E0] p-5 md:p-8 shadow-soft">
                <h3 className="text-lg font-bold text-navy mb-6 uppercase tracking-wider border-b border-[#F7F5F0] pb-3">✈️ Plan de Vol</h3>
                <div className="space-y-4 text-left">
                  {activeFlights.map((flight, idx) => (
                    <div key={idx} className="bg-[#F7F5F0] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-[#EDE9E0]">
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Vol {idx === 0 ? 'Aller' : 'Retour'}</div>
                        <div className="font-bold text-navy text-sm">{flight.from} ➔ {flight.to}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Compagnie : <span className="font-semibold">{flight.airline || 'Non spécifiée'}</span></div>
                        {flight.escale && (
                          <div className="mt-2 text-[10px] font-bold text-amber-700 bg-amber-100 inline-block px-2 py-1 rounded border border-amber-200">
                            ⏱ Escale : {flight.escale} ({flight.escale_duration || '?'})
                          </div>
                        )}
                      </div>
                      <div className="w-full sm:w-auto border-t sm:border-t-0 border-[#EDE9E0] pt-2 sm:pt-0 text-left sm:text-right">
                        <div className="text-[10px] text-[#C9A84C] font-bold uppercase">{flight.date}</div>
                        <div className="text-base font-bold text-navy mono mt-0.5">{flight.time || '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3 : INCLUS / EXCLUS */}
            <div className="bg-white rounded-[24px] border border-[#EDE9E0] p-5 md:p-8 shadow-soft">
              <h3 className="text-lg font-bold text-navy mb-6 uppercase tracking-wider border-b border-[#F7F5F0] pb-3">✅ Le pack comprend</h3>
              <div className="grid sm:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-bold text-[#0F6E56] text-sm mb-3">🟢 Inclus</h4>
                  <ul className="space-y-2 text-xs md:text-sm text-gray-500">
                    {Array.isArray(tour.included_pack) && tour.included_pack.length > 0 ? 
                      tour.included_pack.map((item, idx) => <li key={idx} className="flex gap-2"><span className="text-[#0F6E56] flex-shrink-0">✓</span> <span>{item}</span></li>) : <li>Veuillez vous référer au contrat de voyage.</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-red-500 text-sm mb-3">🔴 Non inclus</h4>
                  <ul className="space-y-2 text-xs md:text-sm text-gray-500">
                    {Array.isArray(tour.excluded_pack) && tour.excluded_pack.length > 0 ? 
                      tour.excluded_pack.map((item, idx) => <li key={idx} className="flex gap-2"><span className="text-red-500 flex-shrink-0">✕</span> <span>{item}</span></li>) : <li>Frais personnels, assurances optionnelles.</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ---- COLONNE DROITE : SIMULATEUR & RÉSERVATION ---- */}
          <div className="bg-white rounded-[28px] border border-[#EDE9E0] p-5 shadow-soft w-full lg:sticky lg:top-24">
            <h3 className="text-base md:text-lg font-bold text-navy mb-4">Réservez votre place</h3>
            
            {options.length > 0 && departures.length > 0 ? (
              <>
                {/* Nouveau Selecteur de Date de Départ */}
                <div className="mb-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Date de départ</label>
                  <select 
                    value={selectedDepartureId} 
                    onChange={(e) => setSelectedDepartureId(e.target.value)}
                    className="w-full border border-[#EDE9E0] rounded-xl px-3 py-2.5 text-xs md:text-sm bg-[#F7F5F0] font-semibold text-navy focus:outline-none focus:border-[#C9A84C]"
                  >
                    {departures.map((dep) => (
                      <option key={dep.id} value={dep.id}>
                        Du {new Date(dep.departure_date).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short' })} au {new Date(dep.return_date).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short' })}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Choix de l'hébergement</label>
                  <select 
                    value={selectedHotelId} 
                    onChange={(e) => setSelectedHotelId(e.target.value)}
                    className="w-full border border-[#EDE9E0] rounded-xl px-3 py-2.5 text-xs md:text-sm bg-[#F7F5F0] font-semibold text-navy focus:outline-none focus:border-[#C9A84C]"
                  >
                    {options.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.hotel_name} {opt.room_type ? `(${opt.room_type})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Type de Chambre</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(OCC_LABELS).map(([key, item]) => (
                      <button 
                        key={key} type="button" onClick={() => setOccupancy(key)}
                        className={`p-2 rounded-lg border text-[10px] md:text-xs font-bold transition-all ${occupancy === key ? 'bg-navy text-white border-navy shadow-md' : 'bg-white border-[#EDE9E0] text-gray-500 hover:border-gray-300'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t border-[#F7F5F0] pt-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Nombre de participants</label>
                  <Counter label="Adultes" value={adults} min={1} onChange={setAdults} />
                  <Counter label="Enfant (avec lit)" value={childWithBed} min={0} onChange={setChildWithBed} />
                  <Counter label="Enfant (sans lit)" value={childNoBed} min={0} onChange={setChildNoBed} />
                  <Counter label="Bébé (-2 ans)" value={infants} min={0} onChange={setInfants} />
                </div>

                <div className="bg-gradient-to-br from-navy to-navy-light rounded-2xl p-5 text-center text-white mt-6 shadow-md">
                  <div className="text-white/60 text-[10px] uppercase tracking-wider font-bold mb-1">Estimation du prix total :</div>
                  <div className="text-gold text-3xl font-extrabold mono">{totalPrice.toLocaleString('fr-DZ')} <span className="text-sm">DZD</span></div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-amber-50 text-amber-700 text-xs rounded-xl border border-amber-100">
                Les dates et tarifs ne sont pas encore disponibles.
              </div>
            )}

            {/* Formulaire */}
            {status === 'success' ? (
              <div className="mt-6 bg-green/10 border border-green/20 rounded-2xl p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-green/10 text-green flex items-center justify-center text-2xl mx-auto mb-3">✓</div>
                <h4 className="font-bold text-[#00143C] text-sm mb-1">Réservation transmise !</h4>
                <div className="inline-block px-4 py-1.5 bg-navy text-gold font-bold rounded-lg text-sm mb-2 mono">{ref}</div>
                <p className="text-[10px] text-[#8892A4]">Nous vous appelons sous 24h pour finaliser.</p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="mt-5 space-y-3 border-t border-[#F7F5F0] pt-5 text-left">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Nom Complet *</label>
                  <input required value={form.customer_name} onChange={(e) => setForm({...form, customer_name: e.target.value})} className="w-full border border-[#EDE9E0] rounded-xl px-3 py-2.5 text-xs bg-gray-50 focus:bg-white focus:border-[#C9A84C] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Téléphone *</label>
                  <input required value={form.customer_phone} onChange={(e) => setForm({...form, customer_phone: e.target.value})} className="w-full border border-[#EDE9E0] rounded-xl px-3 py-2.5 text-xs bg-gray-50 focus:bg-white focus:border-[#C9A84C] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Adresse E-mail</label>
                  <input type="email" value={form.customer_email} onChange={(e) => setForm({...form, customer_email: e.target.value})} className="w-full border border-[#EDE9E0] rounded-xl px-3 py-2.5 text-xs bg-gray-50 focus:bg-white focus:border-[#C9A84C] outline-none" />
                </div>
                
                <button disabled={status === 'sending' || options.length === 0 || departures.length === 0} className="w-full py-3 rounded-full font-bold text-white bg-[#0F6E56] hover:bg-[#17A882] disabled:opacity-50 transition-colors shadow-sm mt-2 text-sm">
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

function Counter({ label, value, min, onChange }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-[#EDE9E0]">
      <span className="text-[10px] md:text-xs font-bold text-navy truncate w-[130px]">{label}</span>
      <div className="flex items-center gap-2" dir="ltr">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-7 h-7 rounded bg-gray-50 border border-gray-200 font-bold text-gray-500 hover:bg-gray-100 flex items-center justify-center text-sm select-none"> − </button>
        <span className="w-4 text-center font-bold text-navy text-xs mono">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="w-7 h-7 rounded bg-gray-50 border border-gray-200 font-bold text-gray-500 hover:bg-gray-100 flex items-center justify-center text-sm select-none"> + </button>
      </div>
    </div>
  );
}