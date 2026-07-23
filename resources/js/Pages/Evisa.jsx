import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import MainLayout from '../Layouts/MainLayout';
import { usePageContent } from '../Hooks/usePageContent';
import { useRecaptcha } from '../Hooks/useRecaptcha';
import { SlickPayButton, SuccessStep } from '../Components/SlickPayButton';

export default function Evisa() {
  const { content } = usePageContent('evisa');
  const hero = content.hero || {};
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [countryDetail, setCountryDetail] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading] = useState(true);
  const topRef = useRef(null);

  useEffect(() => {
    axios.get('/api/evisa/countries').then(({ data }) => { setCountries(data); setLoading(false); });
  }, []);

  const regions = [...new Set(countries.map((c) => c.region).filter(Boolean))].sort();
  const filtered = countries.filter((c) => {
    const matchSearch = !search || c.name_fr.toLowerCase().includes(search.toLowerCase());
    const matchRegion = !regionFilter || c.region === regionFilter;
    return matchSearch && matchRegion;
  });

  async function selectCountry(country) {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const { data } = await axios.get(`/api/evisa/countries/${country.slug}`);
    setCountryDetail(data);
    setStep(2);
  }

  function goBack(toStep) {
    setStep(toStep);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <MainLayout alwaysSolid>
      <Head title="eVisa en ligne — Aelia Travel" />

      {/* Hero */}
      <section className="relative bg-[#00143C] pt-28 pb-14 overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, #3C8CB4 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, #0F6E56 0%, transparent 50%)' }} />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-[#C9A84C] text-xs font-semibold uppercase tracking-[0.15em] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
            {hero.badge || '🛂 Visa électronique en ligne'}
          </span>
          <h1 className="text-white mb-4">
            {(hero.title || "Demandez votre eVisa\nen 3 étapes simples").split('\n').map((l, i) => (
              <span key={i} className="block">{i === 1 ? <em className="not-italic text-[#C9A84C]">{l}</em> : l}</span>
            ))}
          </h1>
          <p className="text-white/60 max-w-[520px] mx-auto text-sm md:text-base">{hero.subtitle}</p>
        </div>
      </section>

      {/* Wizard */}
      <div ref={topRef} className="bg-[#F7F5F0] min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 py-8 md:py-12">
          <WizardProgress step={step} />
          <div className="mt-8">
            {step === 1 && (
              <StepCountry countries={filtered} all={countries} regions={regions}
                search={search} setSearch={setSearch} regionFilter={regionFilter}
                setRegionFilter={setRegionFilter} loading={loading} onSelect={selectCountry} />
            )}
            {step === 2 && countryDetail && (
              <StepOption country={countryDetail} onBack={() => goBack(1)}
                onSelect={(opt) => { setSelectedOption(opt); setStep(3); }} />
            )}
            {step === 3 && selectedOption && !submitted && (
              <StepForm country={countryDetail} option={selectedOption}
                onBack={() => goBack(2)} onSuccess={(data) => setSubmitted(data)} />
            )}
            {submitted && (
              <SuccessStep reference={submitted.reference} applicationId={submitted.applicationId}
                amount={submitted.total_price} nbTravelers={submitted.nb_travelers} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

/* ── Progress ── */
function WizardProgress({ step }) {
  const steps = ['Choisir le pays', 'Type de visa', 'Dossier & infos'];
  return (
    <div className="flex items-center max-w-[560px] mx-auto">
      {steps.map((label, i) => {
        const n = i + 1; const done = n < step; const active = n === step;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                done ? 'bg-[#0F6E56] text-white' : active ? 'bg-[#00143C] text-[#C9A84C]' : 'bg-white border-2 border-[#EDE9E0] text-[#8892A4]'
              }`}>
                {done ? '✓' : <span className="mono text-xs">{String(n).padStart(2,'0')}</span>}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block whitespace-nowrap ${active ? 'text-[#00143C]' : 'text-[#8892A4]'}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 mx-2 mb-4 h-[2px] bg-[#EDE9E0] relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r from-[#C9A84C] to-[#E0C97A] transition-all duration-700 ${done ? 'w-full' : 'w-0'}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 1 ── */
function StepCountry({ countries, all, regions, search, setSearch, regionFilter, setRegionFilter, loading, onSelect }) {
  return (
    <div>
      <div className="max-w-[700px] mx-auto mb-6">
        <div className="relative bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[#EDE9E0] flex items-center gap-3 px-4 py-3">
          <svg className="w-5 h-5 text-[#8892A4] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un pays..."
            className="flex-1 outline-none text-sm bg-transparent placeholder-[#8892A4]" />
          {search && <button onClick={() => setSearch('')} className="text-[#8892A4] text-lg">×</button>}
        </div>
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          <FilterPill active={!regionFilter} onClick={() => setRegionFilter('')} label={`Toutes (${all.length})`} />
          {regions.map((r) => <FilterPill key={r} active={regionFilter === r} onClick={() => setRegionFilter(r === regionFilter ? '' : r)} label={r} />)}
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-10 h-10 border-2 border-[#EDE9E0] border-t-[#C9A84C] rounded-full animate-spin" /></div>
      ) : countries.length === 0 ? (
        <div className="text-center py-12 text-[#8892A4]">Aucun pays trouvé pour "{search}"</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {countries.map((c, i) => <PassportCard key={c.id} country={c} delay={i % 12} onSelect={onSelect} />)}
        </div>
      )}
    </div>
  );
}

function FilterPill({ active, onClick, label }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${active ? 'bg-[#00143C] text-white' : 'bg-white text-[#8892A4] border border-[#EDE9E0] hover:border-[#C9A84C]'}`}>
      {label}
    </button>
  );
}

function PassportCard({ country, delay, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="passport-card cursor-pointer" style={{ transitionDelay: `${delay * 40}ms` }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => onSelect(country)}>
      <div className="relative h-[90px] overflow-hidden bg-gradient-to-br from-[#F7F5F0] to-[#EDE9E0]">
        {country.flag_image_url
          ? <img src={country.flag_image_url} alt={country.name_fr} className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? 'scale-110' : 'scale-100'}`} />
          : <div className="w-full h-full flex items-center justify-center text-4xl">{country.flag_emoji || '🌍'}</div>}
        <div className={`absolute inset-0 bg-gradient-to-t from-[#00143C]/60 to-transparent transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`} />
        {hovered && <div className="absolute bottom-1.5 left-0 right-0 text-center text-white text-[10px] font-semibold">Voir →</div>}
      </div>
      <div className="relative z-10 p-2.5">
        <div className="text-[#00143C] font-semibold text-xs leading-tight mb-1">{country.name_fr}</div>
        <div className="flex items-center justify-between">
          <span className="text-[#8892A4] text-[9px]">{country.region || ''}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#F7F5F0] text-[#8892A4]">{country.nb_options || 0} visa{country.nb_options !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Step 2 ── */
function StepOption({ country, onBack, onSelect }) {
  const colors = { green: '#0F6E56', blue: '#3C8CB4', amber: '#C9A84C', purple: '#7C3AED', red: '#DC2626' };
  return (
    <div className="max-w-[720px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#8892A4] hover:text-[#00143C] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Changer
        </button>
        <span className="text-2xl">{country.flag_emoji || '🌍'}</span>
        <h3 className="text-[#00143C]">{country.name_fr}</h3>
      </div>
      <div className="space-y-3">
        {(country.options || []).map((opt) => (
          <div key={opt.id} onClick={() => onSelect(opt)}
            className="card-hover bg-white rounded-2xl border border-[#EDE9E0] p-4 md:p-6 cursor-pointer flex gap-4 items-start hover:border-[#C9A84C]/40">
            <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: colors[opt.type_color] || colors.blue }} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#00143C] mb-2 text-sm md:text-base">{opt.label_fr}</h4>
                  <div className="flex flex-wrap gap-2">
                    {opt.delai_fr && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F7F5F0] text-[#8892A4]">⏱ {opt.delai_fr}</span>}
                    {opt.validite_fr && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: `${colors[opt.type_color] || colors.blue}15`, color: colors[opt.type_color] || colors.blue }}>✓ {opt.validite_fr}</span>}
                  </div>
                  {opt.note_fr && <p className="text-[#8892A4] text-xs mt-2">{opt.note_fr}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl md:text-2xl font-semibold text-[#00143C] mono">{Number(opt.sale_price_dzd).toLocaleString('fr-DZ')}</div>
                  <div className="text-xs text-[#8892A4]">DZD / pers.</div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#F7F5F0] flex items-center justify-center text-[#8892A4] self-center text-sm">→</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Step 3 — Formulaire multi-voyageurs ── */
function StepForm({ country, option, onBack, onSuccess }) {
  const [nbTravelers, setNbTravelers] = useState(1);
  // Voyageur principal
  const [main, setMain] = useState({ first_name: '', last_name: '', email: '', phone: '', passport_number: '', travel_date: '', message: '' });
  // Voyageurs supplémentaires
  const [extras, setExtras] = useState([]);
  // Fichiers : clé = "main_{label}" ou "traveler_{i}_{label}"
  const [files, setFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useRecaptcha();

  const totalPrice = nbTravelers * Number(option.sale_price_dzd);

  function updateNbTravelers(n) {
    const nb = Math.max(1, Math.min(10, n));
    setNbTravelers(nb);
    const extraCount = nb - 1;
    if (extraCount > extras.length) {
      const toAdd = Array.from({ length: extraCount - extras.length }, () => ({
        first_name: '', last_name: '', passport_number: '', travel_date: '',
      }));
      setExtras([...extras, ...toAdd]);
    } else {
      setExtras(extras.slice(0, extraCount));
    }
  }

  function updateExtra(i, field, value) {
    const copy = [...extras]; copy[i] = { ...copy[i], [field]: value }; setExtras(copy);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      const recaptcha_token = await getToken('evisa_apply');
      const fd = new FormData();
      // Champs voyageur principal
      Object.entries(main).forEach(([k, v]) => fd.append(k, v));
      fd.append('country_id', country.id);
      fd.append('option_id', option.id);
      fd.append('nb_travelers', nbTravelers);
      if (recaptcha_token) fd.append('recaptcha_token', recaptcha_token);
      // Voyageurs supplémentaires
      if (extras.length) fd.append('extra_travelers', JSON.stringify(extras));
      // Fichiers — chaque fichier préfixé pour être rattaché au bon voyageur
      Object.entries(files).forEach(([key, file]) => { if (file) fd.append(key, file); });

      const { data } = await axios.post('/api/evisa/apply', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSuccess({
        reference:     data.reference,
        applicationId: data.application_id,
        total_price:   data.total_price,
        nb_travelers:  data.nb_travelers,
      });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors
        ? Object.values(err.response?.data?.errors || {}).flat().join(' — ')
        : 'Erreur lors de la soumission. Merci de réessayer.');
    } finally {
      setSubmitting(false);
    }
  }

  const docs = option.required_documents || [];

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* Formulaire principal */}
        <div className="bg-white rounded-[24px] border border-[#EDE9E0] p-5 md:p-7 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#F7F5F0]">
            <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-[#F7F5F0] text-[#8892A4]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-sm text-[#8892A4]">Étape 3 / 3 — Informations & documents</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre de voyageurs */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8892A4] block mb-2">
                Nombre de voyageurs
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                  <button key={n} type="button" onClick={() => updateNbTravelers(n)}
                    className={`w-9 h-9 rounded-xl font-semibold text-sm transition-all ${nbTravelers === n ? 'bg-[#00143C] text-white' : 'bg-[#F7F5F0] text-[#8892A4] hover:bg-[#EDE9E0]'}`}>
                    {n}
                  </button>
                ))}
              </div>
              {nbTravelers > 1 && (
                <div className="mt-2 px-3 py-2 bg-[#F7F5F0] rounded-xl text-sm text-[#8892A4]">
                  💡 {nbTravelers} voyageurs × {Number(option.sale_price_dzd).toLocaleString('fr-DZ')} DZD =
                  <strong className="text-[#00143C] ml-1">{totalPrice.toLocaleString('fr-DZ')} DZD</strong>
                </div>
              )}
            </div>

            {/* Voyageur principal */}
            <TravelerSection
              title={nbTravelers > 1 ? 'Voyageur 1 (contact principal)' : 'Vos informations'}
              showEmail showPhone showMessage
              data={main}
              onChange={(f, v) => setMain({ ...main, [f]: v })}
              docs={docs}
              filePrefix="main_"
              files={files}
              onFile={(key, file) => setFiles({ ...files, [key]: file })}
              onRemoveFile={(key) => setFiles((prev) => { const n = { ...prev }; delete n[key]; return n; })}
            />

            {/* Voyageurs supplémentaires */}
            {extras.map((extra, i) => (
              <TravelerSection
                key={i}
                title={`Voyageur ${i + 2}`}
                showEmail={false} showPhone={false} showMessage={false}
                data={extra}
                onChange={(f, v) => updateExtra(i, f, v)}
                docs={docs}
                filePrefix={`traveler_${i}_`}
                files={files}
                onFile={(key, file) => setFiles({ ...files, [key]: file })}
                onRemoveFile={(key) => setFiles((prev) => { const n = { ...prev }; delete n[key]; return n; })}
              />
            ))}

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                <span className="text-lg flex-shrink-0">⚠</span> {error}
              </div>
            )}

            <button disabled={submitting}
              className="w-full py-4 rounded-full font-semibold text-white bg-gradient-to-br from-[#00143C] to-[#0F2D5C] hover:shadow-[0_8px_32px_rgba(0,20,60,0.3)] transition-all duration-300 disabled:opacity-50">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Envoi en cours...
                </span>
              ) : `Soumettre ${nbTravelers > 1 ? `(${nbTravelers} voyageurs)` : ''} →`}
            </button>
          </form>
        </div>

        {/* Sticky summary */}
        <div className="bg-[#00143C] rounded-[20px] overflow-hidden sticky top-24">
          <div className="px-5 py-4 border-b border-white/10">
            <h4 className="text-white font-semibold text-sm">Récapitulatif</h4>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: 'Pays',      value: `${country.name_fr} ${country.flag_emoji || ''}` },
              { label: 'Visa',      value: option.label_fr },
              { label: 'Délai',     value: option.delai_fr || '—' },
              { label: 'Validité',  value: option.validite_fr || '—' },
              { label: 'Voyageurs', value: `${nbTravelers} pers.` },
            ].map((row) => (
              <div key={row.label}>
                <span className="text-white/40 text-[10px] uppercase tracking-wider block">{row.label}</span>
                <span className="text-white/90 text-sm font-medium">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 bg-white/5 border-t border-white/10">
            <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Total à payer</div>
            <div className="text-[#C9A84C] text-2xl font-semibold mono">{totalPrice.toLocaleString('fr-DZ')}</div>
            <div className="text-white/40 text-xs mt-0.5">DZD ({nbTravelers} × {Number(option.sale_price_dzd).toLocaleString('fr-DZ')})</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Section voyageur (principal ou supplémentaire) ── */
function TravelerSection({ title, showEmail, showPhone, showMessage, data, onChange, docs, filePrefix, files, onFile, onRemoveFile }) {
  return (
    <div className="border border-[#EDE9E0] rounded-2xl p-4 md:p-5">
      <h4 className="font-semibold text-[#00143C] mb-4 text-sm flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-[#00143C] text-white text-xs flex items-center justify-center">👤</span>
        {title}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PremiumField label="Prénom" required value={data.first_name} onChange={(v) => onChange('first_name', v)} />
        <PremiumField label="Nom" required value={data.last_name} onChange={(v) => onChange('last_name', v)} />
        {showEmail && <PremiumField label="Email" type="email" required value={data.email} onChange={(v) => onChange('email', v)} />}
        {showPhone && <PremiumField label="Téléphone" required value={data.phone} onChange={(v) => onChange('phone', v)} />}
        <PremiumField label="N° de passeport" required value={data.passport_number} onChange={(v) => onChange('passport_number', v)} />
        <PremiumField label="Date de voyage" type="date" required value={data.travel_date} onChange={(v) => onChange('travel_date', v)} />
      </div>

      {showMessage && (
        <div className="mt-3">
          <PremiumField label="Message / remarque" textarea value={data.message} onChange={(v) => onChange('message', v)} />
        </div>
      )}

      {/* Documents de ce voyageur */}
      {docs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#F7F5F0]">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-[#8892A4] mb-3">Documents requis</h5>
          <div className="space-y-2">
            {docs.map((doc) => {
              const key = `${filePrefix}${doc.label_fr}`;
              return (
                <DropZone key={doc.id} doc={doc} file={files[key]}
                  onFile={(f) => onFile(key, f)} onRemove={() => onRemoveFile(key)} />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Drag & Drop ── */
function DropZone({ doc, file, onFile, onRemove }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const handleDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }, [onFile]);
  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setDragOver(false), []);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-[#1A1A2E]">{doc.label_fr}</label>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${doc.is_required ? 'bg-[#00143C]/10 text-[#00143C]' : 'bg-[#F7F5F0] text-[#8892A4]'}`}>
          {doc.is_required ? 'Obligatoire' : 'Optionnel'}
        </span>
      </div>
      {doc.requires_upload ? (
        file ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0F6E56]/8 border border-[#0F6E56]/30">
            <div className="w-7 h-7 rounded-lg bg-[#0F6E56]/15 flex items-center justify-center text-[#0F6E56] flex-shrink-0">
              {file.type?.includes('image') ? '🖼' : '📄'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#0F6E56] truncate">{file.name}</div>
              <div className="text-xs text-[#0F6E56]/60">{(file.size / 1024).toFixed(0)} KB</div>
            </div>
            <button onClick={onRemove} className="text-[#8892A4] hover:text-red-500 transition-colors p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ) : (
          <div className={`drop-zone p-4 text-center cursor-pointer ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={() => inputRef.current?.click()}>
            <div className={`w-8 h-8 rounded-xl mx-auto mb-1.5 flex items-center justify-center ${dragOver ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'bg-[#EDE9E0] text-[#8892A4]'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <p className="text-xs font-medium text-[#1A1A2E]">{dragOver ? 'Relâchez' : 'Glissez ou'} <span className="text-[#C9A84C]">parcourez</span></p>
            <p className="text-[10px] text-[#8892A4] mt-0.5">PDF, JPG, PNG — max 8 Mo</p>
            <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
          </div>
        )
      ) : (
        <div className="p-2.5 rounded-xl bg-[#F7F5F0] text-xs text-[#8892A4]">Sera demandé par notre équipe.</div>
      )}
    </div>
  );
}

function PremiumField({ label, required, type = 'text', value, onChange, textarea }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-[#8892A4] block mb-1.5">
        {label} {required && <span className="text-[#C9A84C]">*</span>}
      </label>
      {textarea ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full border border-[#EDE9E0] rounded-xl px-3 py-2.5 text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#C9A84C] focus:bg-white transition-all resize-none" />
      ) : (
        <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full border border-[#EDE9E0] rounded-xl px-3 py-2.5 text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#C9A84C] focus:bg-white transition-all" />
      )}
    </div>
  );
}
