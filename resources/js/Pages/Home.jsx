import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MainLayout from '../Layouts/MainLayout';
import { usePageContent } from '../Hooks/usePageContent';
import { useRecaptcha } from '../Hooks/useRecaptcha';

/* ── Animated counter hook ── */
function useCountUp(target, duration = 1800, trigger = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger || !target) return;
    const num = parseInt(String(target).replace(/\D/g, '')) || 0;
    if (!num) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * num));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, trigger]);
  return value;
}

export default function Home() {
  const { content } = usePageContent('home');
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const hero = content.hero || {};
  const stats = content.stats || {};
  const services = content.services || {};
  const evisaCta = content.evisa_cta || {};
  const omraHighlight = content.omra_highlight || {};
  const why = content.why_choose || {};
  const contact = content.contact_info || {};

  return (
    <MainLayout>
      <Head title="Aelia Travel — Agence de voyages à Alger" />
      <HeroSection data={hero} />
      <StatsSection data={stats} statsRef={statsRef} visible={statsVisible} />
      <ServicesSection data={services} />
      <EvisaCtaSection data={evisaCta} />
      <OmraHighlightSection data={omraHighlight} />
      <WhyChooseSection data={why} />
      <ContactSection data={contact} />
    </MainLayout>
  );
}

/* ── Hero ── */
function HeroSection({ data }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({ x: (e.clientX - rect.left) / rect.width - 0.5, y: (e.clientY - rect.top) / rect.height - 0.5 });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const lines = (data.title || "Voyagez l'esprit\ntranquille avec Aelia").split('\n');

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden bg-[#00143C]">
      {/* Parallax background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[1200ms] ease-out"
        style={{
          backgroundImage: `url('${data.background_image || "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1920&q=80&auto=format&fit=crop"}')`,
          transform: `scale(1.08) translate(${mousePos.x * -12}px, ${mousePos.y * -12}px)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#00143C]/92 via-[#00143C]/70 to-[#0F6E56]/30" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#C9A84C]/40"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float-particle ${3 + i * 0.7}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Gold corner ornament */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-[0.06]"
           style={{ background: 'radial-gradient(circle at top right, #C9A84C, transparent 70%)' }} />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-32">
        <div className="max-w-[680px]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-[#C9A84C] text-xs font-semibold uppercase tracking-[0.15em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
            {data.eyebrow || '✈ Agence de voyages certifiée'}
          </div>

          <h1 className="text-white mb-6">
            {lines.map((line, i) => (
              <span key={i} className="block">
                {i === 1 ? <em className="not-italic text-[#C9A84C]">{line}</em> : line}
              </span>
            ))}
          </h1>

          <p className="text-white/65 text-lg leading-relaxed mb-10 max-w-[520px]" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}>
            {data.subtitle || "eVisa en ligne, Omra, billets d'avion, assurances — tout ce dont vous avez besoin, en quelques clics."}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href={data.cta_primary_url || '/evisa'}
              className="btn-magnetic group flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-[#00143C] bg-gradient-to-br from-[#C9A84C] to-[#E0C97A] shadow-[0_0_0_0_rgba(201,168,76,0.4)] hover:shadow-[0_0_32px_rgba(201,168,76,0.6)] transition-all duration-300"
            >
              {data.cta_primary_label || 'Demander un eVisa'}
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link
              href={data.cta_secondary_url || '/omra'}
              className="flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white border border-white/25 hover:border-white/50 hover:bg-white/8 transition-all duration-300"
            >
              {data.cta_secondary_label || 'Offres Omra'}
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-6 mt-12 pt-8 border-t border-white/10">
            {['5 000+ clients', 'Agence agréée', 'Traitement 48h'].map((badge) => (
              <div key={badge} className="flex items-center gap-2 text-white/50 text-sm">
                <span className="text-[#C9A84C]">✓</span> {badge}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs">
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/30 animate-pulse" />
      </div>
    </section>
  );
}

/* ── Stats ── */
function StatsSection({ data, statsRef, visible }) {
  const items = data.items || [
    { value: '5000', label: 'Clients satisfaits' },
    { value: '80', label: 'Destinations eVisa' },
    { value: '48', label: 'Délai traitement (h)' },
    { value: '100', label: '% en ligne' },
  ];

  return (
    <div ref={statsRef} className="bg-[#00143C]">
      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />
      <div className="max-w-[1280px] mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
        {items.map((item, i) => (
          <StatItem key={i} item={item} visible={visible} />
        ))}
      </div>
    </div>
  );
}

/* StatItem extrait en composant pour respecter les règles des hooks React
   (les hooks ne peuvent pas être appelés dans un .map()) */
function StatItem({ item, visible }) {
  const num = parseInt(String(item.value).replace(/\D/g, '')) || 0;
  const suffix = item.value.replace(/[\d\s]/g, '');
  const animated = useCountUp(num, 1800, visible);

  return (
    <div className="bg-[#00143C] text-center py-8 px-6">
      <div className="mono text-4xl font-medium text-[#C9A84C] mb-1">
        {visible ? animated.toLocaleString('fr-FR') : '0'}{suffix}
      </div>
      <div className="text-white/45 text-sm">{item.label}</div>
    </div>
  );
}

/* ── Services ── */
const ICONS = { 'id-card': '🛂', mosque: '🕌', plane: '✈', 'shield-alt': '🛡', hotel: '🏨', headset: '🎧' };
const ACCENT = { blue: '#3C8CB4', gold: '#C9A84C', green: '#0F6E56', navy: '#00143C', purple: '#7C3AED', red: '#DC2626' };

function ServicesSection({ data }) {
  const items = data.items || [];

  return (
    <section className="py-28 bg-[#F7F5F0]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <span className="text-[#C9A84C] text-xs font-semibold uppercase tracking-[0.2em]">{data.eyebrow || 'Ce que nous proposons'}</span>
          <div className="gold-line mx-auto mt-3 mb-4" />
          <h2>{data.title || 'Nos services'}</h2>
          <p className="text-[#8892A4] max-w-[480px] mx-auto mt-4">{data.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${Math.min(i + 1, 4)} card-hover relative bg-white rounded-[24px] p-8 border ${item.featured ? 'border-[#C9A84C]/40 shadow-[0_0_0_1px_rgba(201,168,76,0.2),0_8px_40px_rgba(201,168,76,0.1)]' : 'border-[#EDE9E0] shadow-[var(--shadow-soft)]'}`}
            >
              {item.featured && (
                <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-[#C9A84C] text-[#00143C] text-[10px] font-bold uppercase tracking-wider">
                  Populaire
                </div>
              )}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6"
                style={{ background: `${ACCENT[item.color] || ACCENT.blue}15` }}
              >
                {ICONS[item.icon] || '✦'}
              </div>
              <h3 className="text-xl mb-3">{item.title}</h3>
              <p className="text-[#8892A4] text-sm leading-relaxed mb-6">{item.text}</p>
              <Link
                href={item.link_url || '#'}
                className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300 hover:gap-3"
                style={{ color: ACCENT[item.color] || ACCENT.blue }}
              >
                {item.link_label} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── eVisa CTA ── */
function EvisaCtaSection({ data }) {
  const flags = data.flags || ['🇹🇷', '🇺🇸', '🇮🇳', '🇰🇭', '🇪🇹', '🇱🇰', '🇹🇭'];
  const lines = (data.title || "Obtenez votre eVisa\nen quelques clics").split('\n');

  return (
    <section className="py-16 bg-[#F7F5F0]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="reveal relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#00143C] via-[#00143C] to-[#0F2D5C] p-12 md:p-16">
          {/* Decorative blob */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
               style={{ background: 'radial-gradient(circle, #C9A84C, transparent 70%)', transform: 'translate(30%, -30%)' }} />

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[#C9A84C] text-xs font-semibold uppercase tracking-wider mb-6">
                {data.badge || '✨ 100% en ligne'}
              </span>
              <h2 className="text-white mb-4">
                {lines.map((l, i) => (
                  <span key={i} className="block">
                    {i === 0 ? l : <em className="not-italic text-[#C9A84C]">{l}</em>}
                  </span>
                ))}
              </h2>
              <p className="text-white/60 leading-relaxed mb-8">{data.text}</p>

              <div className="flex flex-wrap gap-2 mb-8">
                {flags.map((flag, i) => (
                  <span key={i} className="text-3xl hover:scale-125 transition-transform cursor-default" title="">{flag}</span>
                ))}
                <span className="self-center text-white/40 text-sm ml-1">+80 pays</span>
              </div>

              <Link
                href={data.cta_url || '/evisa'}
                className="btn-magnetic inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-[#00143C] bg-gradient-to-br from-[#C9A84C] to-[#E0C97A] hover:shadow-[0_0_32px_rgba(201,168,76,0.5)] transition-shadow"
              >
                {data.cta_label || 'Commencer ma demande'} →
              </Link>
            </div>

            {/* Steps mini */}
            <div className="space-y-4">
              {[
                { n: '01', title: 'Choisissez votre pays', desc: '+80 destinations disponibles avec tous types de visas' },
                { n: '02', title: 'Déposez vos documents', desc: 'Passeport, photo, justificatifs — en ligne, en quelques minutes' },
                { n: '03', title: 'Recevez votre visa', desc: 'Notre équipe traite votre dossier sous 48h en moyenne' },
              ].map((step) => (
                <div key={step.n} className="flex gap-4 items-start glass rounded-2xl p-4">
                  <div className="mono text-[#C9A84C] text-xs font-medium mt-0.5 flex-shrink-0">{step.n}</div>
                  <div>
                    <div className="text-white text-sm font-semibold mb-0.5">{step.title}</div>
                    <div className="text-white/45 text-xs">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Omra highlight ── */
function OmraHighlightSection({ data }) {
  return (
    <section className="py-16 bg-[#F7F5F0]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="reveal relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0F6E56] to-[#0a4d3c] p-12 md:p-16">
          <div className="absolute inset-0 opacity-5"
               style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 0 L40 20 L20 40 L0 20 Z\' fill=\'white\' fill-opacity=\'0.5\'/%3E%3C/svg%3E")', backgroundSize: '40px' }} />

          <div className="relative z-10 grid md:grid-cols-[1fr_auto] gap-10 items-center" dir="rtl">
            <div className="font-arabic">
              <h2 className="text-white text-2xl md:text-4xl font-bold mb-3 text-right">
                {data.title || 'برامج العمرة — رحلات روحانية لا تُنسى'}
              </h2>
              <p className="text-white/70 text-right mb-8">{data.text}</p>
              <div className="flex gap-3 justify-end flex-wrap">
                <Link href="/omra" className="px-6 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition font-bold text-sm">
                  {data.cta_browse_label || 'استعراض العروض'}
                </Link>
                <Link href="/omra#simulator" className="px-6 py-3 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#E0C97A] text-[#00143C] font-bold text-sm">
                  {data.cta_simulate_label || 'حساب السعر'}
                </Link>
              </div>
            </div>

            <div className="text-center bg-white/10 rounded-2xl p-8 min-w-[180px]">
              <div className="text-white/60 text-xs mb-1">{data.price_label || 'à partir de'}</div>
              <div className="text-[#C9A84C] text-4xl font-bold mono">{data.price_value || '195 000'}</div>
              <div className="text-white/50 text-xs mt-1">{data.price_currency || 'DZD / pers.'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Why choose ── */
function WhyChooseSection({ data }) {
  const items = data.items || [
    { icon: '⚡', title: 'Rapide & Simple', text: 'Procédure 100% en ligne, guidée étape par étape.' },
    { icon: '🔒', title: 'Sécurisé', text: 'Vos documents sont protégés avec le plus grand soin.' },
    { icon: '🏆', title: 'Expert agréé', text: 'Agence agréée, partenaire de confiance pour vos démarches.' },
    { icon: '💬', title: 'Support dédié', text: 'Une équipe disponible à chaque instant.' },
  ];

  return (
    <section className="py-28 bg-white">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <span className="text-[#C9A84C] text-xs font-semibold uppercase tracking-[0.2em]">{data.eyebrow || 'Notre engagement'}</span>
          <div className="gold-line mx-auto mt-3 mb-4" />
          <h2>{data.title || 'Pourquoi choisir Aelia Travel ?'}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1} text-center group`}>
              <div className="w-16 h-16 rounded-2xl bg-[#F7F5F0] flex items-center justify-center text-3xl mx-auto mb-5 group-hover:bg-[#EDE9E0] transition-colors duration-300">
                {item.icon}
              </div>
              <div className="gold-line mx-auto mb-4" />
              <h4 className="font-semibold mb-2 text-base">{item.title}</h4>
              <p className="text-[#8892A4] text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Contact ── */
function ContactSection({ data }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', service: '', message: '' });
  const [status, setStatus] = useState('idle');
  const { getToken } = useRecaptcha();

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const recaptcha_token = await getToken('contact');
      await axios.post('/api/contact', { ...form, recaptcha_token });
      setStatus('success');
      setForm({ first_name: '', last_name: '', phone: '', service: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="contact" className="py-28 bg-[#F7F5F0]">
      <div className="max-w-[1280px] mx-auto px-6 grid md:grid-cols-[1fr_1.4fr] gap-16 items-start">
        <div className="reveal">
          <span className="text-[#C9A84C] text-xs font-semibold uppercase tracking-[0.2em]">{data.eyebrow || 'Nous joindre'}</span>
          <div className="gold-line mt-3 mb-5" />
          <h2 className="mb-4">{data.title || 'Parlons de votre voyage'}</h2>
          <p className="text-[#8892A4] mb-10 leading-relaxed">{data.text}</p>

          <div className="space-y-5">
            {[
              { icon: '📍', label: 'Adresse', val: data.address },
              { icon: '📞', label: 'Téléphone', val: data.phone },
              { icon: '✉', label: 'Email', val: data.email },
              { icon: '💬', label: 'WhatsApp', val: data.whatsapp },
            ].filter((i) => i.val).map((item) => (
              <div key={item.label} className="flex gap-4 items-center">
                <div className="w-11 h-11 rounded-xl bg-white border border-[#EDE9E0] flex items-center justify-center text-[#C9A84C] flex-shrink-0 shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8892A4]">{item.label}</div>
                  <div className="text-sm text-[#1A1A2E] font-medium">{item.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal bg-white rounded-[28px] p-10 shadow-[var(--shadow-card)] border border-[#EDE9E0]">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#0F6E56]/10 text-[#0F6E56] text-2xl flex items-center justify-center mx-auto mb-4">✓</div>
              <h3 className="mb-2">Message envoyé !</h3>
              <p className="text-[#8892A4] text-sm">Nous vous répondrons très prochainement.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <PremiumInput label="Prénom" required value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} />
                <PremiumInput label="Nom" required value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} />
              </div>
              <PremiumInput label="Téléphone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#8892A4] block mb-2">Service</label>
                <select
                  value={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value })}
                  className="w-full border border-[#EDE9E0] rounded-xl px-4 py-3 text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#C9A84C] focus:bg-white transition-all"
                >
                  <option value="">Sélectionner...</option>
                  <option value="evisa">eVisa en ligne</option>
                  <option value="omra">Voyage Omra</option>
                  <option value="autre">Autre demande</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#8892A4] block mb-2">Message *</label>
                <textarea
                  required rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border border-[#EDE9E0] rounded-xl px-4 py-3 text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#C9A84C] focus:bg-white transition-all resize-none"
                />
              </div>
              {status === 'error' && <p className="text-red-500 text-sm">Erreur lors de l'envoi, merci de réessayer.</p>}
              <button
                disabled={status === 'sending'}
                className="w-full py-4 rounded-full font-semibold text-white bg-gradient-to-br from-[#00143C] to-[#0F2D5C] hover:shadow-[0_8px_32px_rgba(0,20,60,0.3)] transition-all duration-300 disabled:opacity-50"
              >
                {status === 'sending' ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function PremiumInput({ label, required, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-[#8892A4] block mb-2">
        {label} {required && <span className="text-[#C9A84C]">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#EDE9E0] rounded-xl px-4 py-3 text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#C9A84C] focus:bg-white transition-all"
      />
    </div>
  );
}
