import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../Layouts/MainLayout';
import { useRecaptcha } from '../Hooks/useRecaptcha';

export default function Quote() {
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    destination: '',
    departure_date: '',
    duration_nights: 7,
    nb_adults: 2,
    nb_children: 0,
    estimated_budget_dzd: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [ref, setRef] = useState(null);
  const [progress, setProgress] = useState(17);
  const { getToken } = useRecaptcha();

  // Calcul dynamique de la barre de progression en temps réel
  useEffect(() => {
    const fields = [
      form.destination,
      form.departure_date,
      form.customer_name,
      form.customer_phone,
      form.customer_email
    ];
    const filledCount = fields.filter(Boolean).length;
    // Commencer à 17% (comme sur l'image) et monter jusqu'à 100%
    const calculatedProgress = 17 + Math.round((filledCount / fields.length) * 83);
    setProgress(calculatedProgress);
  }, [form]);

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

  if (status === 'success') {
    return (
      <MainLayout alwaysSolid>
        <Head title="Demande reçue — Aelia Travel" />
        <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4 pt-28 pb-16">
          <div className="bg-white rounded-[28px] max-w-[460px] w-full p-10 text-center border border-[#EDE9E0] shadow-soft">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-[#0F6E56]/10 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-[#0F6E56]/15 flex items-center justify-center text-[#0F6E56] text-3xl">✓</div>
            </div>
            <h2 className="text-[#00143C] mb-2 font-bold">Demande reçue !</h2>
            <p className="text-[#8892A4] mb-4 text-sm">Votre numéro de dossier de réservation :</p>
            <div className="inline-block px-8 py-3 rounded-2xl bg-[#00143C] text-[#C9A84C] text-xl font-bold mono mb-5 shadow-sm">
              {ref}
            </div>
            <p className="text-[#8892A4] text-sm mb-6 leading-relaxed">
              Un conseiller d'Aelia Travel étudie votre demande. Nous vous recontacterons sous 24h avec la meilleure offre.
            </p>
            <Link href="/" className="w-full py-3 bg-[#00143C] text-white rounded-full font-bold text-center block">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout alwaysSolid>
      <Head title="Réservation de voyages & hôtels sur mesure — Aelia Travel" />

      <div className="bg-[#F7F5F0] pt-28 pb-32 min-h-screen">
        <div className="max-w-[560px] mx-auto px-4">

          {/* ── BÂNDEAU SUPÉRIEUR — TITRE & DESIGN PREMIUM ── */}
          <div className="text-center mb-6">
            <span className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-[0.25em] block mb-2">
              CONCOVANT VOTRE SÉJOUR
            </span>
            <h1 className="text-[#00143C] text-2xl md:text-3xl font-extrabold mb-3 leading-tight" style={{ fontFamily: 'Tajawal, sans-serif' }}>
              Réservez votre hôtel & séjour sur mesure
            </h1>
          </div>

          {/* Carte Verte de Réassurance */}
          <div className="bg-[#00143C] text-white rounded-[24px] p-6 mb-6 shadow-card">
            <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
              <span className="text-3xl">🏨</span>
              <p className="text-sm font-medium leading-snug text-white/90">
                Remplissez le formulaire, notre équipe revient vers vous avec la meilleure offre du marché.
              </p>
            </div>
            <div className="space-y-2.5 text-xs text-white/80">
              <div className="flex items-center gap-2">🕒 <span className="font-semibold">Devis rapide sous 24-48 h</span></div>
              <div className="flex items-center gap-2">✓ <span className="font-semibold">Gratuit & sans aucun engagement</span></div>
              <div className="flex items-center gap-2">🔒 <span className="font-semibold">Confidentialité 100% garantie</span></div>
            </div>
          </div>

          {/* ── BARRE DE PROGRESSION INTERACTIVE ── */}
          <div className="bg-white rounded-2xl border border-[#EDE9E0] p-4 mb-6 shadow-soft">
            <div className="flex justify-between items-center text-xs font-bold text-[#8892A4] uppercase tracking-wider mb-2">
              <span>Votre progression</span>
              <span className="mono text-[#C9A84C] text-sm">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-[#F7F5F0] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#C9A84C] to-[#E0C97A] transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>

          {/* Formulaire Principal */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Étape 1 : Destination */}
            <StepCard index={1} title="Quelle destination ?">
              <div className="relative flex items-center bg-[#F7F5F0] border border-[#EDE9E0] rounded-xl px-4 py-3 w-full">
                <span className="text-gray-400 ml-2">📍</span>
                <input 
                  required
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  placeholder="Choisir une destination (ex: Turquie, Tunisie...)"
                  className="w-full bg-transparent border-0 outline-none text-sm p-0 focus:ring-0 text-[#00143C]"
                />
              </div>
            </StepCard>

            {/* Étape 2 : Date de départ */}
            <StepCard index={2} title="Quand ?">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative flex flex-col justify-center bg-[#F7F5F0] border border-[#EDE9E0] rounded-xl px-4 py-2 w-full">
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">Date de départ</label>
                  <input 
                    type="date"
                    value={form.departure_date}
                    onChange={(e) => setForm({ ...form, departure_date: e.target.value })}
                    className="w-full bg-transparent border-0 outline-none text-sm p-0 focus:ring-0 text-[#00143C]"
                  />
                </div>
                <div className="relative flex flex-col justify-center bg-[#F7F5F0] border border-[#EDE9E0] rounded-xl px-4 py-2 w-full">
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">Nombre de nuits</label>
                  <input 
                    type="number"
                    min="1"
                    value={form.duration_nights}
                    onChange={(e) => setForm({ ...form, duration_nights: e.target.value })}
                    className="w-full bg-transparent border-0 outline-none text-sm p-0 focus:ring-0 text-[#00143C]"
                  />
                </div>
              </div>
            </StepCard>

            {/* Étape 3 : Voyageurs (Compteurs empilés pour mobile) */}
            <StepCard index={3} title="Combien de voyageurs ?" completed={form.nb_adults > 0}>
              <div className="grid grid-cols-2 gap-3">
                
                {/* Adultes */}
                <div className="flex flex-col items-center justify-center bg-[#F7F5F0] rounded-xl p-3 border border-[#EDE9E0] gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Adultes</span>
                  <div className="flex items-center justify-between w-full" dir="ltr">
                    <button type="button" onClick={() => setForm({ ...form, nb_adults: Math.max(1, form.nb_adults - 1) })}
                      className="w-8 h-8 rounded-lg bg-white border border-[#EDE9E0] font-bold text-[#8892A4] flex items-center justify-center text-lg select-none">−</button>
                    <span className="w-4 text-center font-bold text-[#00143C] text-sm">{form.nb_adults}</span>
                    <button type="button" onClick={() => setForm({ ...form, nb_adults: form.nb_adults + 1 })}
                      className="w-8 h-8 rounded-lg bg-white border border-[#EDE9E0] font-bold text-[#8892A4] flex items-center justify-center text-lg select-none">+</button>
                  </div>
                </div>

                {/* Enfants */}
                <div className="flex flex-col items-center justify-center bg-[#F7F5F0] rounded-xl p-3 border border-[#EDE9E0] gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enfants</span>
                  <div className="flex items-center justify-between w-full" dir="ltr">
                    <button type="button" onClick={() => setForm({ ...form, nb_children: Math.max(0, form.nb_children - 1) })}
                      className="w-8 h-8 rounded-lg bg-white border border-[#EDE9E0] font-bold text-[#8892A4] flex items-center justify-center text-lg select-none">−</button>
                    <span className="w-4 text-center font-bold text-[#00143C] text-sm">{form.nb_children}</span>
                    <button type="button" onClick={() => setForm({ ...form, nb_children: form.nb_children + 1 })}
                      className="w-8 h-8 rounded-lg bg-white border border-[#EDE9E0] font-bold text-[#8892A4] flex items-center justify-center text-lg select-none">+</button>
                  </div>
                </div>

              </div>
            </StepCard>

            {/* Étape 4 : Préférences */}
            <StepCard index={4} title="Vos préférences" optional>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Catégorie ou hôtel souhaité</label>
                  <div className="relative flex items-center bg-[#F7F5F0] border border-[#EDE9E0] rounded-xl px-4 py-3 w-full">
                    <span className="text-gray-400 ml-2">🏨</span>
                    <input 
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Ex. : Hilton, Rixos, hôtel 5 étoiles..."
                      className="w-full bg-transparent border-0 outline-none text-sm p-0 focus:ring-0 text-[#00143C]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Budget estimé par hôtel (DZD)</label>
                  <div className="relative flex items-center bg-[#F7F5F0] border border-[#EDE9E0] rounded-xl px-4 py-3 w-full">
                    <span className="text-gray-400 ml-2">💰</span>
                    <input 
                      type="number"
                      value={form.estimated_budget_dzd}
                      onChange={(e) => setForm({ ...form, estimated_budget_dzd: e.target.value })}
                      placeholder="Ex. : 250000"
                      className="w-full bg-transparent border-0 outline-none text-sm p-0 focus:ring-0 text-[#00143C]"
                    />
                  </div>
                  <span className="text-[10px] text-[#8892A4] mt-1 block">Indiquez le montant estimé en Dinars Algériens.</span>
                </div>
              </div>
            </StepCard>

            {/* Étape 5 : Coordonnées */}
            <StepCard index={5} title="Vos coordonnées">
              <p className="text-xs text-[#8892A4] mb-3 leading-relaxed">
                Dernière étape ! Laissez-nous vos coordonnées, un conseiller revient vers vous avec la meilleure offre.
              </p>
              <div className="space-y-3">
                <FormField label="Nom complet" required value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} placeholder="Votre nom" icon="👤" />
                <FormField label="Téléphone" required value={form.customer_phone} onChange={(v) => setForm({ ...form, customer_phone: v })} placeholder="Votre numéro" icon="📞" />
                <FormField label="E-mail" type="email" required value={form.customer_email} onChange={(v) => setForm({ ...form, customer_email: v })} placeholder="Votre adresse e-mail" icon="✉" />
              </div>
            </StepCard>

            {/* ── BOUTON ENVOYER FIXE (STIKY FOOTER SUR MOBILE) ── */}
            <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-[#EDE9E0] p-4 z-50 md:relative md:bg-transparent md:border-0 md:p-0 md:mt-8">
              <button 
                type="submit" 
                disabled={status === 'sending'}
                className="w-full max-w-[500px] mx-auto py-4 rounded-full font-bold text-white bg-gradient-to-br from-[#00143C] to-[#0F2D5C] hover:shadow-card transition-all duration-300 flex items-center justify-center gap-2"
                style={{ fontFamily: 'Tajawal, sans-serif' }}
              >
                {status === 'sending' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <span>✈</span>
                    <span>Envoyer ma demande de réservation</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </MainLayout>
  );
}

// Composant interne de mise en page des étapes
function StepCard({ index, title, optional, completed, children }) {
  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#EDE9E0] shadow-soft relative">
      <div className="flex items-center gap-3 mb-4">
        {completed ? (
          <div className="w-8 h-8 rounded-full bg-[#0F6E56]/10 text-[#0F6E56] flex items-center justify-center text-sm font-bold flex-shrink-0">✓</div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#F7F5F0] text-[#00143C] flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">{String(index).padStart(2, '0')}</div>
        )}
        <h4 className="font-extrabold text-[#00143C] text-sm md:text-base uppercase tracking-wider" style={{ fontFamily: 'Tajawal, sans-serif' }}>
          {title}
        </h4>
        {optional && (
          <span className="text-[10px] font-semibold text-[#8892A4] uppercase tracking-wider ml-auto">facultatif</span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

// Composant interne réutilisable pour styliser les champs du formulaire avec icônes
function FormField({ label, required, type = 'text', value, onChange, placeholder = '', icon }) {
  return (
    <div className="w-full">
      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
        {label} {required && <span className="text-[#C9A84C]">*</span>}
      </label>
      <div className="relative flex items-center bg-[#F7F5F0] border border-[#EDE9E0] rounded-xl px-4 py-3 w-full">
        {icon && <span className="text-gray-400 ml-2">{icon}</span>}
        <input
          type={type} required={required} value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border-0 outline-none text-sm p-0 focus:ring-0 text-[#00143C] placeholder-gray-400"
        />
      </div>
    </div>
  );
}