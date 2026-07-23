import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MainLayout from '../Layouts/MainLayout';
import { usePageContent } from '../Hooks/usePageContent';
import { useRecaptcha } from '../Hooks/useRecaptcha';

const OCC_LABELS_AR = { quintuple: 'خماسية', quadruple: 'رباعية', triple: 'ثلاثية', double: 'ثنائية' };
const OCC_LABELS_FR = { quintuple: '5 pers.', quadruple: '4 pers.', triple: '3 pers.', double: '2 pers.' };

const HOTEL_IMGS = [
  'https://images.unsplash.com/photo-1564769625392-651b94fad3ea?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80&auto=format&fit=crop',
];

function getHotelImg(hotel, i = 0) { return hotel?.images?.[0] || HOTEL_IMGS[i % HOTEL_IMGS.length]; }
function fmtDZD(n) { return Number(n || 0).toLocaleString('fr-DZ'); }
// Dans resources/js/Pages/Omra.jsx (autour de la ligne 10) :
function fmtDate(d) {
  if (!d) return '—';
  // Utilise la locale arabe algérienne 'ar-DZ' pour un formatage localisé
  return new Date(d).toLocaleDateString('ar-DZ', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}
function breakdownLabel(k) {
  return { adults: 'بالغ', children_with_bed: 'طفل (بسرير)', children_no_bed: 'طفل (بدون سرير)', infants: 'رضيع' }[k] || k;
}

export default function Omra() {
  const { content } = usePageContent('omra');
  const hero = content.hero || {};
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState(null);
  const [simDepartureId, setSimDepartureId] = useState('');
  const [simPackageId, setSimPackageId] = useState('');
  const [packagesForSim, setPackagesForSim] = useState([]);
  const [occupancy, setOccupancy] = useState('double');
  const [counters, setCounters] = useState({ adults: 1, childBed: 0, childNoBed: 0, infants: 0 });
  const [simResult, setSimResult] = useState(null);
  const [prebookOpen, setPrebookOpen] = useState(false);
  const [successRef, setSuccessRef] = useState(null);
  const simRef = useRef(null);

  useEffect(() => {
    axios.get('/api/omra/departures').then(({ data }) => { setDepartures(data); setLoading(false); });
  }, []);

  async function openDetail(id) {
    const { data } = await axios.get(`/api/omra/departures/${id}`);
    setDetailModal(data);
  }

  async function selectDeparture(depId) {
    setSimDepartureId(depId);
    setSimPackageId('');
    setSimResult(null);
    if (!depId) { setPackagesForSim([]); return; }
    const { data } = await axios.get(`/api/omra/departures/${depId}`);
    setPackagesForSim(data.packages || []);
  }

  async function openSimWithPackage(departureId, packageId) {
    setDetailModal(null);
    const { data } = await axios.get(`/api/omra/departures/${departureId}`);
    setPackagesForSim(data.packages || []);
    setSimDepartureId(String(departureId));
    setSimPackageId(String(packageId));
    setSimResult(null);
    setTimeout(() => simRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  async function runSim() {
    if (!simPackageId) return;
    try {
      const { data } = await axios.post('/api/omra/simulate', {
        package_id: simPackageId, occupancy,
        nb_adults: counters.adults, nb_children_bed: counters.childBed,
        nb_children_nobed: counters.childNoBed, nb_infants: counters.infants,
      });
      setSimResult(data);
    } catch (e) {
      alert(e.response?.data?.error || 'تعذر حساب السعر');
    }
  }

  const selectedPkg = packagesForSim.find((p) => String(p.id) === String(simPackageId));

  return (
    <MainLayout alwaysSolid rtl>
      <Head title="عمرة | Aelia Travel" />

      {/* Hero */}
      <section className="relative bg-[#0F6E56] pt-28 pb-20 overflow-hidden font-arabic">
        <div className="absolute inset-0 opacity-15" style={{ background: 'radial-gradient(ellipse at 20% 50%, #C9A84C 0%, transparent 50%)' }} />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 text-center">
          <h1 className="text-white mb-4" style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            {hero.title || 'رحلة العمرة تبدأ من هنا'}
          </h1>
          <p className="text-white/75 max-w-[600px] mx-auto mb-10 text-lg" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
            {hero.subtitle || 'برامج عمرة متكاملة من الجزائر'}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#departures" className="px-8 py-4 rounded-full font-bold text-[#00143C] bg-gradient-to-br from-[#C9A84C] to-[#E0C97A]">
              {hero.cta_browse_label || 'استعراض العروض'}
            </a>
            <button
              onClick={() => { setTimeout(() => simRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              className="px-8 py-4 rounded-full font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-colors"
            >
              {hero.cta_simulate_label || 'احسب السعر'}
            </button>
          </div>
        </div>
      </section>

      {/* Départs */}
      <section id="departures" className="py-20 bg-[#F7F5F0] font-arabic">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-12" dir="rtl">
            <span className="text-[#0F6E56] text-xs font-bold uppercase tracking-[0.2em]" style={{ fontFamily: 'Tajawal, sans-serif' }}>المواعيد المتاحة</span>
            <div className="w-12 h-0.5 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E0C97A] mx-auto mt-3 mb-4" />
            <h2 className="text-[#00143C]" style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800 }}>عروض العمرة القادمة</h2>
            <p className="text-[#8892A4] mt-3" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>كل رحلة تتضمن عدة صيغ إقامة بأسعار مختلفة</p>
          </div>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-2 border-[#EDE9E0] border-t-[#0F6E56] rounded-full animate-spin" />
            </div>
          ) : !departures.length ? (
            <div className="text-center py-16 text-[#8892A4]">لا توجد عروض متاحة حاليًا</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departures.map((d, i) => <DepartureCard key={d.id} d={d} index={i} onDetail={() => openDetail(d.id)} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Simulateur — layout responsive amélioré ── */}
      <section ref={simRef} id="simulator" className="py-16 bg-white font-arabic">
        <div className="max-w-[900px] mx-auto px-4">
          <div className="text-center mb-8" dir="rtl">
            <span className="text-[#0F6E56] text-xs font-bold uppercase tracking-[0.2em]" style={{ fontFamily: 'Tajawal, sans-serif' }}>محاكي الأسعار</span>
            <div className="w-12 h-0.5 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E0C97A] mx-auto mt-3 mb-4" />
            <h2 className="text-[#00143C]" style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800 }}>احسب تكلفة رحلتك</h2>
          </div>

          <div className="bg-[#F7F5F0] rounded-[28px] border border-[#EDE9E0] overflow-hidden" dir="rtl">
            {/* Sélecteurs */}
            <div className="p-6 border-b border-[#EDE9E0]">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#1A1A2E] block mb-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>اختر تاريخ السفر</label>
                  <select value={simDepartureId} onChange={(e) => selectDeparture(e.target.value)}
                    className="w-full border border-[#EDE9E0] rounded-xl px-4 py-3 bg-white text-sm focus:outline-none focus:border-[#0F6E56] transition-colors">
                    <option value="">-- اختر الرحلة --</option>
                    {departures.map((d) => <option key={d.id} value={d.id}>{d.title_ar} — {fmtDate(d.departure_date)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#1A1A2E] block mb-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>صيغة الإقامة (فندق مكة)</label>
                  <select value={simPackageId} onChange={(e) => { setSimPackageId(e.target.value); setSimResult(null); }}
                    disabled={!packagesForSim.length}
                    className="w-full border border-[#EDE9E0] rounded-xl px-4 py-3 bg-white text-sm focus:outline-none focus:border-[#0F6E56] transition-colors disabled:opacity-50">
                    <option value="">-- اختر الصيغة --</option>
                    {packagesForSim.map((p) => (
                      <option key={p.id} value={p.id}>
                        {'★'.repeat(p.mecque_hotel?.stars || 0)} {p.mecque_hotel?.name || 'فندق'} ({p.mecque_hotel?.nights || p.mecque_nights || 0}ن)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Aperçu hôtel sélectionné */}
              {selectedPkg && (
                <div className="flex gap-3 mt-4 p-3 bg-white rounded-xl border border-[#EDE9E0]">
                  <img src={getHotelImg(selectedPkg.mecque_hotel)} className="w-16 h-14 rounded-lg object-cover flex-shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[#00143C] truncate">🕋 {selectedPkg.mecque_hotel?.name} <span className="text-[#C9A84C]">{'★'.repeat(selectedPkg.mecque_hotel?.stars || 0)}</span></div>
                    <div className="text-xs text-[#8892A4]">مكة · {selectedPkg.mecque_hotel?.nights || selectedPkg.mecque_nights}ن</div>
                    <div className="text-xs text-[#8892A4]">🕌 {selectedPkg.medine_hotel?.name} · {selectedPkg.medine_hotel?.nights || selectedPkg.medine_nights}ن بالمدينة</div>
                  </div>
                </div>
              )}
            </div>

            {/* Type de chambre */}
            <div className="p-6 border-b border-[#EDE9E0]">
              <label className="text-xs font-bold text-[#1A1A2E] block mb-3" style={{ fontFamily: 'Tajawal, sans-serif' }}>نوع الغرفة</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(OCC_LABELS_AR).map(([key, ar]) => (
                  <button key={key} type="button" onClick={() => setOccupancy(key)}
                    className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                      occupancy === key ? 'bg-[#00143C] text-white shadow-md' : 'bg-white border border-[#EDE9E0] text-[#8892A4] hover:border-[#0F6E56]'
                    }`}>
                    <div>{ar}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{OCC_LABELS_FR[key]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Compteurs — grille 2×2 sur mobile */}
            <div className="p-6 border-b border-[#EDE9E0]">
              <label className="text-xs font-bold text-[#1A1A2E] block mb-3" style={{ fontFamily: 'Tajawal, sans-serif' }}>عدد المسافرين</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'adults',    label: 'بالغ',              min: 1 },
                  { key: 'childBed',  label: 'طفل (بسرير)',       min: 0 },
                  { key: 'childNoBed',label: 'طفل (بدون سرير)',   min: 0 },
                  { key: 'infants',   label: 'رضيع',              min: 0 },
                ].map(({ key, label, min }) => (
                  <div key={key} className="flex items-center justify-between bg-white rounded-xl p-3 border border-[#EDE9E0] gap-3">
                    {/* RETRAIT de truncate et ml-2 / AJOUT de whitespace-nowrap et mr-2 pour le RTL */}
                    <span className="text-xs sm:text-sm font-medium text-[#1A1A2E] whitespace-nowrap mr-2">
                      {label}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button type="button"
                        onClick={() => setCounters((c) => ({ ...c, [key]: Math.max(min, c[key] - 1) }))}
                        className="w-7 h-7 rounded-lg bg-[#F7F5F0] font-bold text-[#8892A4] hover:bg-[#EDE9E0] transition-colors text-lg leading-none flex items-center justify-center">−</button>
                      <span className="w-5 text-center font-bold text-[#00143C] mono text-sm">{counters[key]}</span>
                      <button type="button"
                        onClick={() => setCounters((c) => ({ ...c, [key]: c[key] + 1 }))}
                        className="w-7 h-7 rounded-lg bg-[#F7F5F0] font-bold text-[#8892A4] hover:bg-[#EDE9E0] transition-colors text-lg leading-none flex items-center justify-center">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bouton calcul */}
            <div className="p-6">
              <button onClick={runSim} disabled={!simPackageId}
                className="w-full py-4 rounded-full font-bold text-white bg-gradient-to-br from-[#0F6E56] to-[#17A882] hover:shadow-[0_8px_32px_rgba(15,110,86,0.3)] transition-all duration-300 disabled:opacity-40"
                style={{ fontFamily: 'Tajawal, sans-serif' }}>
                احسب السعر التقديري
              </button>

              {/* Résultat */}
              {simResult && (
                <div className="mt-5 rounded-2xl overflow-hidden border border-[#EDE9E0]">
                  <div className="bg-gradient-to-br from-[#00143C] to-[#0F2D5C] p-5 text-center">
                    <div className="text-white/60 text-sm mb-1">التكلفة التقديرية الإجمالية</div>
                    <div className="text-[#C9A84C] font-bold mono" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)' }}>
                      {fmtDZD(simResult.total_dzd)} <span className="text-xl">DZD</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 space-y-2">
                    {Object.entries(simResult.breakdown).filter(([, b]) => b.count > 0).map(([key, b]) => (
                      <div key={key} className="flex justify-between items-center py-1.5 border-b border-[#F7F5F0] last:border-0 text-sm">
                        <span className="text-[#8892A4]">{breakdownLabel(key)} × {b.count}</span>
                        <span className="font-bold text-[#00143C] mono">{fmtDZD(b.subtotal)} DZD</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#F7F5F0] p-4">
                    <button onClick={() => setPrebookOpen(true)}
                      className="w-full py-3 rounded-full font-bold text-[#00143C] bg-gradient-to-br from-[#C9A84C] to-[#E0C97A]"
                      style={{ fontFamily: 'Tajawal, sans-serif' }}>
                      أكمل الحجز المسبق ←
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {detailModal && (
        <DetailModal data={detailModal} onClose={() => setDetailModal(null)}
          onSimulate={(depId, pkgId) => openSimWithPackage(depId, pkgId)} />
      )}
      {prebookOpen && (
        <PrebookModal simDepartureId={simDepartureId} simPackageId={simPackageId}
          occupancy={occupancy} counters={counters}
          onClose={() => setPrebookOpen(false)}
          onSuccess={(ref) => { setPrebookOpen(false); setSuccessRef(ref); }} />
      )}
      {successRef && <SuccessModal reference={successRef} onClose={() => setSuccessRef(null)} />}
    </MainLayout>
  );
}

/* ── DepartureCard ── */
function DepartureCard({ d, index, onDetail }) {
  const [hovered, setHovered] = useState(false);
    const fallbackImage = `https://images.unsplash.com/photo-1579305796288-c534f6cf17ab?w=800&q=80&auto=format&fit=crop`;
    const bgImage = d.cover_image_url || fallbackImage;
  return (
    <div className="omra-card card-hover cursor-pointer" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onDetail}>
      <div className="relative overflow-hidden h-52">
        <img src={bgImage} className="omra-card-img w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00143C]/80 via-[#00143C]/20 to-transparent" />
        <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-full">
          {d.airline_logo ? <img src={d.airline_logo} className="h-5 brightness-0 invert" alt="" /> : <span className="text-white text-xs font-bold">{d.airline_name || 'شركة الطيران'}</span>}
        </div>
        <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold ${d.status === 'complet' ? 'bg-red-500 text-white' : 'bg-[#0F6E56] text-white'}`}>
          {d.status === 'complet' ? 'مكتمل' : 'متاح'}
        </div>
        {d.from_price_dzd && (
          <div className="absolute bottom-4 left-4 font-arabic">
            <div className="text-white/60 text-[10px]">ابتداءً من</div>
            <div className="text-[#C9A84C] font-bold mono text-lg">{fmtDZD(d.from_price_dzd)} <span className="text-sm opacity-70">DZD</span></div>
          </div>
        )}
        {d.nb_packages > 1 && <div className="absolute bottom-4 right-4 glass text-white text-[10px] font-bold px-2 py-1 rounded-full">{d.nb_packages} صيغ</div>}
      </div>
      <div className="p-5 font-arabic" dir="rtl">
        <h4 className="font-bold text-[#00143C] mb-3" style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 700 }}>{d.title_ar}</h4>
        <div className="flex items-center justify-between bg-[#F7F5F0] rounded-xl px-4 py-3 mb-4">
          <div className="text-center"><div className="text-[10px] text-[#8892A4] mb-0.5">الذهاب</div><div className="text-sm font-bold text-[#00143C]">{fmtDate(d.departure_date)}</div></div>
          <span className="text-[#0F6E56] text-xs bg-[#F7F5F0] px-1">✈</span>
          <div className="text-center"><div className="text-[10px] text-[#8892A4] mb-0.5">العودة</div><div className="text-sm font-bold text-[#00143C]">{fmtDate(d.return_date)}</div></div>
        </div>
        <button className={`w-full py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${hovered ? 'bg-[#0F6E56] text-white shadow-[0_4px_16px_rgba(15,110,86,0.3)]' : 'bg-[#F7F5F0] text-[#0F6E56]'}`}>
          عرض التفاصيل والأسعار ←
        </button>
      </div>
    </div>
  );
}

/* ── DetailModal ── */
function DetailModal({ data, onClose, onSimulate }) {
  const packages = data.packages || [];
  const [activeTab, setActiveTab] = useState(0);
  const activePkg = packages[activeTab];
  return (
    <div className="fixed inset-0 z-[2000] modal-backdrop flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-[760px] max-h-[92vh] overflow-y-auto rounded-t-[32px] md:rounded-[28px]" dir="rtl"
        style={{ fontFamily: "'Tajawal', 'Noto Naskh Arabic', sans-serif" }} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-[#F7F5F0] px-6 py-4 flex justify-between items-center z-10">
          <h3 className="text-[#00143C]" style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 700 }}>{data.title_ar}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#F7F5F0] flex items-center justify-center text-[#8892A4] text-xl">×</button>
        </div>
        {packages.length > 1 && (
          <div className="px-6 pt-4 flex gap-2 overflow-x-auto pb-2">
            {packages.map((pkg, i) => (
              <button key={pkg.id} onClick={() => setActiveTab(i)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === i ? 'bg-[#00143C] text-white' : 'bg-[#F7F5F0] text-[#8892A4]'}`}>
                {'★'.repeat(pkg.mecque_hotel?.stars || 0)} {pkg.mecque_hotel?.name?.split(' ')[0] || `صيغة ${i + 1}`}
              </button>
            ))}
          </div>
        )}
        {activePkg && (
          <div className="p-6">
            <div className="grid grid-cols-[1.6fr_1fr] gap-4 mb-6">
              <div className="rounded-2xl overflow-hidden border-2 border-[#C9A84C]/30">
                <div className="relative h-40 overflow-hidden">
                  <img src={getHotelImg(activePkg.mecque_hotel, 0)} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#C9A84C] text-[#00143C] text-[10px] font-black">مكة 🕋</div>
                </div>
                <div className="p-3 bg-[#FFF9EC]">
                  <div className="font-bold text-[#00143C] text-sm">{activePkg.mecque_hotel?.name}</div>
                  <div className="text-xs text-[#8892A4]">{activePkg.mecque_hotel?.distance_haram}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-bold">{activePkg.mecque_hotel?.nights || activePkg.mecque_nights} ليالي</span>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border border-[#EDE9E0]">
                <div className="relative h-24 overflow-hidden">
                  <img src={getHotelImg(activePkg.medine_hotel, 1)} className="w-full h-full object-cover opacity-90" alt="" />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#0F6E56] text-white text-[10px] font-black">المدينة 🕌</div>
                </div>
                <div className="p-3 bg-[#F7F5F0]">
                  <div className="font-bold text-[#00143C] text-sm">{activePkg.medine_hotel?.name}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#0F6E56]/10 text-[#0F6E56] text-[10px] font-bold">{activePkg.medine_hotel?.nights || activePkg.medine_nights} ليالي</span>
                </div>
              </div>
            </div>
            <h4 className="font-bold text-[#00143C] mb-3">جدول الأسعار</h4>
            <div className="rounded-2xl overflow-hidden border border-[#EDE9E0] overflow-x-auto">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="bg-[#00143C] text-white">
                    {['الغرفة','بالغ','طفل+سرير','بدون سرير','رضيع'].map((h) => (
                      <th key={h} className="p-3 text-center font-medium text-[10px] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(activePkg.pricing || []).map((p, i) => (
                    <tr key={p.occupancy} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}>
                      <td className="p-3 font-bold text-[#00143C] text-center">{OCC_LABELS_AR[p.occupancy]}</td>
                      <td className="p-3 text-center font-medium mono text-[#0F6E56]">{fmtDZD(p.adult_sale_dzd)}</td>
                      <td className="p-3 text-center text-[#8892A4] mono text-xs">{fmtDZD(p.child_with_bed_sale_dzd)}</td>
                      <td className="p-3 text-center text-[#8892A4] mono text-xs">{fmtDZD(p.child_no_bed_sale_dzd)}</td>
                      <td className="p-3 text-center text-[#8892A4] mono text-xs">{fmtDZD(p.infant_sale_dzd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => onSimulate(data.id, activePkg.id)}
              className="mt-5 w-full py-4 rounded-full font-bold text-[#00143C] bg-gradient-to-br from-[#C9A84C] to-[#E0C97A]"
              style={{ fontFamily: 'Tajawal, sans-serif' }}>
              احسب السعر لهذه الصيغة →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── PrebookModal ── */
function PrebookModal({ simDepartureId, simPackageId, occupancy, counters, onClose, onSuccess }) {
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [travelers, setTravelers] = useState(() => {
    const list = [];
    for (let i = 0; i < counters.adults; i++) list.push({ name: '', type: 'adulte' });
    for (let i = 0; i < counters.childBed; i++) list.push({ name: '', type: 'enfant_avec_lit' });
    for (let i = 0; i < counters.childNoBed; i++) list.push({ name: '', type: 'enfant_sans_lit' });
    for (let i = 0; i < counters.infants; i++) list.push({ name: '', type: 'bebe' });
    return list;
  });
  const [files, setFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { getToken } = useRecaptcha();
  const tLabel = { adulte: 'بالغ', enfant_avec_lit: 'طفل (بسرير)', enfant_sans_lit: 'طفل (بدون سرير)', bebe: 'رضيع' };

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await getToken('omra_prebook');
      const fd = new FormData();
      fd.append('departure_id', simDepartureId);
      fd.append('package_id', simPackageId);
      fd.append('occupancy', occupancy);
      fd.append('nb_adults', counters.adults);
      fd.append('nb_children_bed', counters.childBed);
      fd.append('nb_children_nobed', counters.childNoBed);
      fd.append('nb_infants', counters.infants);
      fd.append('contact_name', contact.name);
      fd.append('contact_phone', contact.phone);
      fd.append('contact_email', contact.email || '');
      fd.append('travelers', JSON.stringify(travelers.map((t) => ({ full_name: t.name, type: t.type }))));
      if (token) fd.append('recaptcha_token', token);
      Object.entries(files).forEach(([i, f]) => { if (f) fd.append(`passport_${i}`, f); });
      const { data } = await axios.post('/api/omra/prebook', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSuccess(data.reference);
    } catch (err) {
      alert(err.response?.data?.error || 'حدث خطأ أثناء الإرسال');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] modal-backdrop flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-[640px] max-h-[92vh] overflow-y-auto rounded-t-[32px] md:rounded-[28px]"
        dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-[#F7F5F0] px-6 py-4 flex justify-between items-center">
          <h3 className="text-[#00143C]" style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 700 }}>إتمام الحجز المسبق</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#F7F5F0] flex items-center justify-center text-[#8892A4] text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <PrebookField label="الاسم الكامل" required value={contact.name} onChange={(v) => setContact({ ...contact, name: v })} />
            <PrebookField label="رقم الهاتف" required value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} />
          </div>
          <PrebookField label="البريد الإلكتروني" type="email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} />
          <div className="pt-3 border-t border-[#F7F5F0]">
            <h4 className="font-bold text-[#00143C] mb-3">قائمة المسافرين</h4>
            <div className="space-y-3">
              {travelers.map((t, i) => (
                <div key={i} className="flex gap-3 items-end">
                  <div className="w-8 h-8 rounded-lg bg-[#F7F5F0] flex items-center justify-center text-xs font-bold text-[#8892A4] mono flex-shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <div className="text-[10px] text-[#8892A4] mb-1">{tLabel[t.type]}</div>
                    <input required value={t.name} onChange={(e) => { const c = [...travelers]; c[i].name = e.target.value; setTravelers(c); }}
                      placeholder="الاسم الكامل كما في الجواز"
                      className="w-full border border-[#EDE9E0] rounded-xl px-3 py-2 text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#0F6E56] focus:bg-white transition-all" />
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-[10px] text-[#8892A4] mb-1">جواز</div>
                    <label className="flex items-center justify-center gap-1 h-9 w-20 border border-dashed border-[#EDE9E0] rounded-xl cursor-pointer hover:border-[#C9A84C] bg-white text-xs text-[#8892A4]">
                      {files[i] ? <span className="text-[#0F6E56] text-[10px]">✓</span> : '+'}
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setFiles({ ...files, [i]: e.target.files[0] })} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button disabled={submitting} className="w-full py-4 rounded-full font-bold text-white bg-gradient-to-br from-[#0F6E56] to-[#17A882] disabled:opacity-50">
            {submitting ? (
              <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري الإرسال...</span>
            ) : 'تأكيد الحجز المسبق ←'}
          </button>
        </form>
      </div>
    </div>
  );
}

function PrebookField({ label, required, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8892A4] block mb-1.5">{label}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#EDE9E0] rounded-xl px-3 py-2.5 text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#0F6E56] focus:bg-white transition-all" />
    </div>
  );
}

function SuccessModal({ reference, onClose }) {
  return (
    <div className="fixed inset-0 z-[2000] modal-backdrop flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] max-w-[420px] w-full p-10 text-center font-arabic" dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}>
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-[#0F6E56]/10 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-[#0F6E56]/15 flex items-center justify-center text-[#0F6E56] text-3xl">✓</div>
        </div>
        <h2 className="text-[#00143C] mb-2" style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800 }}>تم استلام طلبك!</h2>
        <p className="text-[#8892A4] mb-4 text-sm">رقم مرجع حجزك:</p>
        <div className="inline-block px-8 py-3 rounded-2xl bg-[#00143C] text-[#C9A84C] text-xl font-bold mono mb-5">{reference}</div>
        <p className="text-[#8892A4] text-sm mb-6">سيتصل بك فريقنا قريبًا لتأكيد التفاصيل</p>
        <button onClick={onClose} className="w-full py-3 rounded-full font-bold text-white bg-[#0F6E56]">إغلاق</button>
      </div>
    </div>
  );
}
