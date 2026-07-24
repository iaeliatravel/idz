import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../Layouts/MainLayout';
import { useRecaptcha } from '../Hooks/useRecaptcha';

const OCC_LABELS = {
  price_double_dzd: { label: 'Chambre Double', desc: 'Tarif par adulte' },
  price_triple_dzd: { label: 'Chambre Triple', desc: 'Tarif par adulte' },
  price_single_dzd: { label: 'Chambre Individuelle (Single)', desc: 'Tarif par adulte' }
};

export default function TourDetail({ tour }) {
  const [hotelOptions, setHotelOptions] = useState(tour.hotel_options || []);
  const [selectedHotel, setSelectedHotel] = useState(tour.hotel_options?.[0] || null);
  const [occupancy, setOccupancy] = useState('price_double_dzd'); // price_double_dzd | price_triple_dzd | price_single_dzd
  const [activeTab, setActiveTab] = useState('program'); // program | flights | included | remarks
  
  // Compteurs voyageurs
  const [adults, setAdults] = useState(2);
  const [childWithBed, setChildWithBed] = useState(0);
  const [childNoBed, setChildNoBed] = useState(0);
  const [infants, setInfants] = useState(0);

  // Estimation du prix total en direct
  const [totalPrice, setTotalPrice] = useState(0);

  // Formulaire de réservation
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '' });
  const [status, setStatus] = useState('idle');
  const [ref, setRef] = useState(null);
  const { getToken } = useRecaptcha();

  // Recalculer le tarif total dès qu'une option change
  useEffect(() => {
    if (!selectedHotel) return;

    const adultUnitPrice = Number(selectedHotel[occupancy] || 0);
    const childWithBedPrice = Number(selectedHotel.price_child_with_bed_dzd || 0);
    const childNoBedPrice = Number(selectedHotel.price_child_no_bed_dzd || 0);
    const infantPrice = Number(selectedHotel.price_infant_dzd || 0);

    const calculated = (adults * adultUnitPrice) +
                       (childWithBed * childWithBedPrice) +
                       (childNoBed * childNoBedPrice) +
                       (infants * infantPrice);

    setTotalPrice(calculated);
  }, [selectedHotel, occupancy, adults, childWithBed, childNoBed, infants]);

  async function handleBook(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const recaptcha_token = await getToken('tour_book');
      const { data } = await axios.post('/api/tours/book', {
        tour_id: tour.id,
        nb_travelers: Number(adults) + Number(childWithBed) + Number(childNoBed) + Number(infants),
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
        <div className="max-w-[1150px] mx-auto px-4 grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
          
          {/* ---- BLOC GAUCHE : DÉTAILS DU VOYAGE & PROGRAMME ---- */}
          <div className="space-y-6">
            
            {/* Bannière principale */}
            <div className="bg-white rounded-3xl border border-[#EDE9E0] overflow-hidden shadow-soft">
              <div className="h-64 md:h-80 w-full overflow-hidden bg-gray-100 relative">
                <img src={tour.cover_image_url || fallbackImage} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-6 text-white text-left">
                  <span className="text-xs bg-[#C9A84C] text-[#00143C] font-bold px-3 py-1 rounded-full">📍 {tour.destination}</span>
                  <h1 className="text-2xl md:text-3xl font-extrabold mt-2 text-white">{tour.title_fr}</h1>
                </div>
              </div>

              {/* Barre d'onglets de navigation du programme */}
              <div className="flex border-b border-[#F7F5F0] overflow-x-auto bg-white whitespace-nowrap hide-scrollbar">
                <TabButton active={activeTab === 'program'} onClick={() => setActiveTab('program')} label="🗺️ Programme" />
                <TabButton active={activeTab === 'flights'} onClick={() => setActiveTab('flights')} label="✈️ Plan de Vol" />
                <TabButton active={activeTab === 'included'} onClick={() => setActiveTab('included')} label="✅ Inclus dans le Pack" />
                <TabButton active={activeTab === 'remarks'} onClick={() => setActiveTab('remarks')} label="📌 Infos & Remarques" />
              </div>

              {/* Contenu des onglets */}
              <div className="p-6 md:p-8">
                
                {/* Onglet Programme */}
                {activeTab === 'program' && (
                  <div className="space-y-6 text-left">
                    {tour.program && tour.program.length > 0 ? (
                      tour.program.map((day, idx) => (
                        <div key={idx} className="flex gap-4 items-start">
                          <div className="w-10 h-10 rounded-xl bg-[#0F6E56]/10 text-[#0F6E56] flex items-center justify-center font-bold font-mono flex-shrink-0">
                            Jour {day.day || idx + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-navy text-base">{day.title}</h4>
                            <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">{day.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">Le programme détaillé jour par jour sera fourni par nos conseillers.</p>
                    )}
                  </div>
                )}

                {/* Onglet Plan de Vol */}
                {activeTab === 'flights' && (
                  <div className="space-y-4 text-left">
                    {tour.flights && tour.flights.length > 0 ? (
                      tour.flights.map((flight, idx) => (
                        <div key={idx} className="bg-[#F7F5F0] p-4 rounded-2xl border border-[#EDE9E0] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <div className="text-xs text-gray-400 font-bold uppercase mb-1">Vol {idx === 0 ? 'Aller' : 'Retour'}</div>
                            <div className="font-bold text-navy text-sm">{flight.from} ➔ {flight.to}</div>
                            <div className="text-xs text-gray-500 mt-1">Compagnie : {flight.airline || 'Non spécifiée'}</div>
                            
                            {/* Affichage de l'escale */}
                            {flight.escale && (
                              <div className="mt-2 text-xs font-semibold text-amber-600 bg-amber-50 inline-block px-2 py-1 rounded-md border border-amber-200">
                                ⏱ Escale à {flight.escale} ({flight.escale_duration || 'Durée non précisée'})
                              </div>
                            )}
                          </div>
                          <div className="text-left md:text-right w-full md:w-auto border-t md:border-0 pt-2 md:pt-0 border-gray-200">
                            <div className="text-xs text-[#C9A84C] font-semibold">{flight.date}</div>
                            <div className="text-sm font-bold text-navy mt-0.5">{flight.time || '—'}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">Les détails des vols et des transferts vous seront communiqués lors de la validation.</p>
                    )}
                  </div>
                )}

                {/* Onglet Inclus / Exclus */}
                {activeTab === 'included' && (
                  <div className="grid md:grid-cols-2 gap-6 text-left">
                    <div>
                      <h4 className="font-bold text-[#0F6E56] text-sm mb-3">🟢 Ce qui est inclus :</h4>
                      <ul className="space-y-2 text-sm text-gray-500">
                        {tour.included_pack?.map((item, idx) => <li key={idx}>✓ {item}</li>) ?? <li>Veuillez vous référer au contrat de voyage.</li>}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-red-600 text-sm mb-3">🔴 Ce qui n'est pas inclus :</h4>
                      <ul className="space-y-2 text-sm text-gray-500">
                        {tour.excluded_pack?.map((item, idx) => <li key={idx}>✕ {item}</li>) ?? <li>Frais personnels, assurances optionnelles.</li>}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Onglet Remarques */}
                {activeTab === 'remarks' && (
                  <div className="text-left text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                    {tour.remarks || "Aucune remarque ou condition particulière n'est spécifiée pour ce séjour."}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* ---- BLOC DROITE : SIMULATEUR DE TARIF & RÉSERVATION ---- */}
          <div className="bg-white rounded-[28px] border border-[#EDE9E0] p-6 shadow-soft space-y-6 sticky top-24">
            <div>
              <h3 className="text-lg font-bold text-[#00143C] mb-3">Simulateur de Tarif</h3>
              
              {/* Choix de l'hôtel ou du combiné d'hôtels */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Choix de l'hébergement</label>
                <select 
                  value={selectedHotel?.id || ''} 
                  onChange={(e) => setSelectedHotel(hotelOptions.find(h => String(h.id) === e.target.value))}
                  className="w-full border border-[#EDE9E0] rounded-xl px-3 py-2.5 text-sm bg-[#F7F5F0] font-semibold text-[#00143C]"
                >
                  {hotelOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.hotel_name} {opt.room_type ? `(${opt.room_type})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Choix de l'occupation de la chambre */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Type de Chambre</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(OCC_LABELS).map(([key, item]) => (
                    <button 
                      key={key} 
                      type="button" 
                      onClick={() => setOccupancy(key)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all ${
                        occupancy === key ? 'bg-[#00143C] text-white border-transparent' : 'bg-[#F7F5F0] border-[#EDE9E0] text-[#8892A4]'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre de voyageurs */}
              <div className="space-y-2.5 border-t border-[#F7F5F0] pt-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Nombre de participants</label>
                
                <Counter label="Adultes" value={adults} min={1} onChange={setAdults} />
                <Counter label="Enfant (avec lit d'appoint)" value={childWithBed} min={0} onChange={setChildWithBed} />
                <Counter label="Enfant (sans lit)" value={childNoBed} min={0} onChange={setChildNoBed} />
                <Counter label="Bébé (-2 ans)" value={infants} min={0} onChange={setInfants} />
              </div>
            </div>

            {/* Affichage du prix total simulé */}
            <div className="bg-gradient-to-br from-[#00143C] to-[#0F2D5C] rounded-2xl p-5 text-center text-white">
              <div className="text-white/60 text-xs">Estimation du prix total :</div>
              <div className="text-[#C9A84C] text-3xl font-extrabold mono mt-1">
                {totalPrice.toLocaleString('fr-DZ')} <span className="text-sm font-semibold">DZD</span>
              </div>
            </div>

            {/* Formulaire d'envoi final */}
            {status === 'success' ? (
              <div className="bg-green/5 border border-green/20 rounded-2xl p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-green/10 text-green flex items-center justify-center text-2xl mx-auto mb-3">✓</div>
                <h4 className="font-bold text-[#00143C] mb-1">Réservation transmise !</h4>
                <p className="text-xs text-[#8892A4] mb-2">Référence dossier :</p>
                <div className="inline-block px-4 py-1.5 bg-navy text-gold font-bold rounded-lg text-sm mb-3 mono">{ref}</div>
                <p className="text-xs text-gray-400 leading-relaxed">Notre agence va étudier vos choix et vous appeler sous 24h pour valider votre inscription.</p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-3.5 border-t border-[#F7F5F0] pt-4 text-left">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Nom Complet *</label>
                  <input required value={form.customer_name} onChange={(e) => setForm({...form, customer_name: e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm bg-[#F7F5F0]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Téléphone *</label>
                  <input required value={form.customer_phone} onChange={(e) => setForm({...form, customer_phone: e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm bg-[#F7F5F0]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Adresse E-mail</label>
                  <input type="email" value={form.customer_email} onChange={(e) => setForm({...form, customer_email: e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm bg-[#F7F5F0]" />
                </div>

                <button disabled={status === 'sending'} className="w-full py-4 rounded-full font-bold text-white bg-gradient-to-br from-[#0F6E56] to-[#17A882] hover:shadow-green transition-all duration-300">
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

// Composant interne pour les boutons d'onglets
function TabButton({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick} 
      className={`px-5 py-3.5 font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${
        active ? 'border-[#C9A84C] text-[#00143C]' : 'border-transparent text-gray-400 hover:text-navy'
      }`}
    >
      {label}
    </button>
  );
}

// Composant interne réutilisable de compteur (Boutons +/- horizontaux)
function Counter({ label, value, min, onChange }) {
  return (
    <div className="flex items-center justify-between bg-[#F7F5F0] rounded-xl px-4 py-2.5 border border-[#EDE9E0]">
      <span className="text-xs font-bold text-gray-500">{label}</span>
      <div className="flex items-center gap-3" dir="ltr">
        <button 
          type="button" 
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-lg bg-white border border-[#EDE9E0] font-bold text-[#8892A4] hover:bg-[#EDE9E0] transition-colors flex items-center justify-center text-lg select-none"
        >
          −
        </button>
        <span className="w-4 text-center font-bold text-[#00143C] text-sm mono">{value}</span>
        <button 
          type="button" 
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-lg bg-white border border-[#EDE9E0] font-bold text-[#8892A4] hover:bg-[#EDE9E0] transition-colors flex items-center justify-center text-lg select-none"
        >
          +
        </button>
      </div>
    </div>
  );
}