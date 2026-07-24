import { Head } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import MainLayout from '../Layouts/MainLayout';
import { useRecaptcha } from '../Hooks/useRecaptcha';

export default function Quote() {
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', customer_email: '', destination: '',
    departure_date: '', duration_nights: '', nb_adults: 1, nb_children: 0, 
    hotel_stars: 4, estimated_budget_dzd: '', message: ''
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [ref, setRef] = useState(null);
  const { getToken } = useRecaptcha();

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const recaptcha_token = await getToken('quote_request');
      const { data } = await axios.post('/api/quotes', { ...form, recaptcha_token });
      setRef(data.reference);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <MainLayout alwaysSolid>
      <Head title="Demande de Devis Personnalisé — Aelia Travel" />

      {/* Hero Header */}
      <section className="relative bg-[#00143C] pt-28 pb-12 overflow-hidden text-center">
        <div className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 50% 50%, #C9A84C 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#C9A84C] text-xs font-semibold uppercase tracking-[0.15em] mb-4">
            ✈ Séjours sur-mesure
          </span>
          <h1 className="text-white text-3xl md:text-5xl font-bold mb-3">Créons le voyage de vos rêves</h1>
          <p className="text-white/60 max-w-[500px] mx-auto text-sm md:text-base">
            Remplissez notre formulaire de devis en 2 minutes. Nos experts conçoivent pour vous un itinéraire entièrement personnalisé d'ici 24h.
          </p>
        </div>
      </section>

      {/* Formulaire */}
      <section className="py-12 bg-[#F7F5F0] min-h-[60vh] flex items-center justify-center">
        <div className="max-w-[640px] w-full mx-auto px-4">
          {status === 'success' ? (
            <div className="bg-white rounded-3xl p-10 border border-[#EDE9E0] text-center shadow-soft">
              <div className="w-16 h-16 rounded-full bg-[#0F6E56]/10 text-[#0F6E56] flex items-center justify-center text-3xl mx-auto mb-5">✓</div>
              <h3 className="text-2xl font-bold text-[#00143C] mb-2">Demande de devis reçue !</h3>
              <p className="text-[#8892A4] text-sm mb-4">Votre référence de dossier est :</p>
              <div className="inline-block px-8 py-3 bg-[#00143C] text-[#C9A84C] text-xl font-bold rounded-2xl mono mb-6 shadow-sm">{ref}</div>
              <p className="text-[#8892A4] text-sm leading-relaxed">
                Un conseiller de voyage spécialisé étudie votre demande. Nous vous contacterons sur <strong>{form.customer_email}</strong> ou par téléphone pour vous envoyer notre proposition tarifaire détaillée.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-10 border border-[#EDE9E0] shadow-soft space-y-5 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Nom Complet" required value={form.customer_name} onChange={(v) => setForm({...form, customer_name: v})} />
                <FormField label="Téléphone" required value={form.customer_phone} onChange={(v) => setForm({...form, customer_phone: v})} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Adresse E-mail" type="email" required value={form.customer_email} onChange={(v) => setForm({...form, customer_email: v})} />
                <FormField label="Destination Souhaitée" required value={form.destination} onChange={(v) => setForm({...form, destination: v})} placeholder="ex: Turquie, Malaisie, Dubaï..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Date de départ souhaitée" type="date" value={form.departure_date} onChange={(v) => setForm({...form, departure_date: v})} />
                <FormField label="Nombre de nuits" type="number" min="1" value={form.duration_nights} onChange={(v) => setForm({...form, duration_nights: v})} placeholder="ex: 7, 10, 15..." />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField label="Adultes" type="number" min="1" required value={form.nb_adults} onChange={(v) => setForm({...form, nb_adults: v})} />
                <FormField label="Enfants" type="number" min="0" value={form.nb_children} onChange={(v) => setForm({...form, nb_children: v})} />
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#8892A4] block mb-1.5">Hôtel</label>
                  <select value={form.hotel_stars} onChange={(e) => setForm({...form, hotel_stars: e.target.value})} className="w-full border border-[#EDE9E0] rounded-xl px-3 py-2.5 text-sm bg-[#F7F5F0]">
                    <option value="3">3 étoiles ★★★</option>
                    <option value="4">4 étoiles ★★★★</option>
                    <option value="5">5 étoiles ★★★★★</option>
                  </select>
                </div>
              </div>

              <FormField label="Budget estimé (DZD)" type="number" placeholder="Optionnel" value={form.estimated_budget_dzd} onChange={(v) => setForm({...form, estimated_budget_dzd: v})} />

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#8892A4] block mb-1.5">Décrivez votre voyage idéal ou des besoins spécifiques</label>
                <textarea rows={4} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} placeholder="Activités préférées, type de chambre, visites guidées souhaitées..." className="w-full border border-[#EDE9E0] rounded-xl px-3 py-2.5 text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#C9A84C] focus:bg-white transition-all resize-none" />
              </div>

              {status === 'error' && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm">
                  Erreur lors de la soumission de la demande. Merci de réessayer.
                </div>
              )}

              <button disabled={status === 'sending'} className="w-full py-4 bg-gradient-to-br from-[#00143C] to-[#0F2D5C] text-white font-bold rounded-full disabled:opacity-50 transition-shadow hover:shadow-card">
                {status === 'sending' ? 'Envoi de votre projet...' : 'Soumettre ma demande de devis →'}
              </button>
            </form>
          )}
        </div>
      </section>
    </MainLayout>
  );
}

// Composant interne réutilisable pour styliser les champs du formulaire
function FormField({ label, required, type = 'text', value, onChange, placeholder = '' }) {
  return (
    <div className="w-full">
      <label className="text-xs font-semibold uppercase tracking-wider text-[#8892A4] block mb-1.5">
        {label} {required && <span className="text-[#C9A84C]">*</span>}
      </label>
      <input
        type={type} required={required} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#EDE9E0] rounded-xl px-3 py-2.5 text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#C9A84C] focus:bg-white transition-all"
      />
    </div>
  );
}