import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { Toolbar, Badge, EmptyState, IconButton, Modal, FormField, inputClass, formatDate, Spinner } from '../Shared/UI';

export default function ToursManager() {
  const [tours, setTours] = useState(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [coverTarget, setCoverTarget] = useState(null);

  function load() {
    api.get('/tours').then(({ data }) => setTours(data));
  }
  useEffect(load, []);

  if (!tours) return <div className="text-center py-20"><Spinner /></div>;

  const filtered = tours.filter((t) => !search || t.title_fr.toLowerCase().includes(search.toLowerCase()) || t.destination.toLowerCase().includes(search.toLowerCase()));

  async function handleDelete(t) {
    if (!confirm('Voulez-vous supprimer ce voyage organisé ?')) return;
    await api.delete(`/tours/${t.id}`);
    load();
  }

  async function handleDuplicate(t) {
    await api.post(`/tours/${t.id}/duplicate`);
    load();
  }

  return (
    <div>
      <Toolbar>
        <input placeholder="Rechercher un voyage ou destination..." value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputClass} max-w-[320px]`} />
        <button onClick={() => setEditing({})} className="px-5 py-2.5 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold text-sm">+ Ajouter un voyage</button>
      </Toolbar>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-3">Image</th><th className="p-3">Titre (FR)</th><th className="p-3">Destination</th>
              <th className="p-3">Départs</th><th className="p-3">Hôtels</th><th className="p-3">Statut</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? filtered.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  {t.cover_image_url ? <img src={t.cover_image_url} className="w-12 h-12 rounded-md object-cover" /> : <span className="text-gray-300">🌍</span>}
                </td>
                <td className="p-3"><strong>{t.title_fr}</strong></td>
                <td className="p-3">{t.destination}</td>
                <td className="p-3 font-semibold text-xs text-blue-600">{t.departures?.length || 0} date(s)</td>
                <td className="p-3 font-semibold text-xs text-gray-500">{t.hotel_options?.length || 0} formule(s)</td>
                <td className="p-3">{t.is_active ? <Badge color="green">Actif</Badge> : <Badge color="red">Inactif</Badge>}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <IconButton title="Modifier" onClick={() => setEditing(t)}>✏️</IconButton>
                    <IconButton title="Image de couverture" onClick={() => setCoverTarget(t)}>🖼️</IconButton>
                    <IconButton title="Dupliquer" onClick={() => handleDuplicate(t)}>📋</IconButton>
                    <IconButton title="Supprimer" danger onClick={() => handleDelete(t)}>🗑️</IconButton>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={7}><EmptyState icon="🌍" text="Aucun voyage organisé trouvé." /></td></tr>}
          </tbody>
        </table>
      </div>

      {editing && <TourModal tour={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {coverTarget && <CoverModal tour={coverTarget} onClose={() => setCoverTarget(null)} onSaved={() => { setCoverTarget(null); load(); }} />}
    </div>
  );
}

function TourModal({ tour, onClose, onSaved }) {
  const isNew = !tour.id;
  const [modalTab, setModalTab] = useState('general'); // general | departures | program | hotels | inclusions

  const [form, setForm] = useState({
    title_fr: tour.title_fr || '', title_ar: tour.title_ar || '', destination: tour.destination || '', 
    price_dzd: tour.price_dzd || 0, remarks: tour.remarks || '', is_active: tour.is_active ?? true,
    program: tour.program || [], included_pack: tour.included_pack || [], excluded_pack: tour.excluded_pack || [],
    
    // GESTION DES DÉPARTS (Dates + Vols)
    departures: (tour.departures || []).map(d => ({
        id: d.id,
        departure_date: d.departure_date?.slice(0, 10) || '',
        return_date: d.return_date?.slice(0, 10) || '',
        seats_total: d.seats_total || '',
        seats_remaining: d.seats_remaining || '',
        is_active: d.is_active ?? true,
        flights: d.flights || []
    })),

    hotel_options: (tour.hotel_options || []).map(opt => ({
      hotel_name: opt.hotel_name || '', room_type: opt.room_type || '',
      price_double_dzd: opt.price_double_dzd || 0, price_triple_dzd: opt.price_triple_dzd || 0,
      price_single_dzd: opt.price_single_dzd || 0, price_child_with_bed_dzd: opt.price_child_with_bed_dzd || 0,
      price_child_no_bed_dzd: opt.price_child_no_bed_dzd || 0, price_infant_dzd: opt.price_infant_dzd || 0,
    }))
  });
  
  const [saving, setSaving] = useState(false);

  // Initialiser un départ vide si création
  useEffect(() => {
      if (isNew && form.departures.length === 0) {
          addDeparture();
      }
  }, []);

  // ---- DEPARTURES HANDLERS ----
  function addDeparture() {
      setForm({ ...form, departures: [...form.departures, { id: null, departure_date: '', return_date: '', seats_total: '', seats_remaining: '', is_active: true, flights: [] }] });
  }
  function removeDeparture(idx) {
      setForm({ ...form, departures: form.departures.filter((_, i) => i !== idx) });
  }
  function updateDeparture(idx, field, val) {
      const copy = [...form.departures];
      copy[idx] = { ...copy[idx], [field]: val };
      setForm({ ...form, departures: copy });
  }

  // ---- FLIGHTS HANDLERS (DANS UN DEPART) ----
  function addFlight(depIdx) {
      const copy = [...form.departures];
      copy[depIdx].flights.push({ from: '', to: '', airline: '', date: '', time: '' });
      setForm({ ...form, departures: copy });
  }
  function removeFlight(depIdx, flightIdx) {
      const copy = [...form.departures];
      copy[depIdx].flights = copy[depIdx].flights.filter((_, i) => i !== flightIdx);
      setForm({ ...form, departures: copy });
  }
  function updateFlight(depIdx, flightIdx, field, val) {
      const copy = [...form.departures];
      copy[depIdx].flights[flightIdx][field] = val;
      setForm({ ...form, departures: copy });
  }

  // ---- PROGRAM HANDLERS ----
  function addProgramDay() {
    setForm({ ...form, program: [...form.program, { day: form.program.length + 1, title: '', description: '' }] });
  }
  function removeProgramDay(idx) {
    setForm({ ...form, program: form.program.filter((_, i) => i !== idx).map((day, i) => ({ ...day, day: i + 1 })) });
  }
  function updateProgramDay(idx, field, val) {
    const copy = [...form.program];
    copy[idx] = { ...copy[idx], [field]: val };
    setForm({ ...form, program: copy });
  }

  // ---- HOTEL HANDLERS ----
  function addHotelOption() {
    setForm({ ...form, hotel_options: [...form.hotel_options, { hotel_name: '', room_type: 'Chambre Standard', price_double_dzd: 0, price_triple_dzd: 0, price_single_dzd: 0, price_child_with_bed_dzd: 0, price_child_no_bed_dzd: 0, price_infant_dzd: 0 }] });
  }
  function removeHotelOption(idx) {
    setForm({ ...form, hotel_options: form.hotel_options.filter((_, i) => i !== idx) });
  }
  function updateHotelOption(idx, field, val) {
    const copy = [...form.hotel_options];
    copy[idx] = { ...copy[idx], [field]: val };
    setForm({ ...form, hotel_options: copy });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) await api.post('/tours', form);
      else await api.put(`/tours/${tour.id}`, form);
      onSaved();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isNew ? 'Ajouter un voyage' : 'Modifier le voyage'} onClose={onClose} maxWidth="900px">
      
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <TabBtn active={modalTab === 'general'} onClick={() => setModalTab('general')} label="Général" />
        <TabBtn active={modalTab === 'departures'} onClick={() => setModalTab('departures')} label="📅 Départs & Vols" />
        <TabBtn active={modalTab === 'program'} onClick={() => setModalTab('program')} label="🗺️ Programme" />
        <TabBtn active={modalTab === 'hotels'} onClick={() => setModalTab('hotels')} label="🏨 Hôtels & Tarifs" />
        <TabBtn active={modalTab === 'inclusions'} onClick={() => setModalTab('inclusions')} label="✅ Inclusions" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* ONGLET 1 : GÉNÉRAL */}
        {modalTab === 'general' && (
          <div className="space-y-4">
            <FormField label="Titre du voyage (FR)" required><input required value={form.title_fr} onChange={(e) => setForm({ ...form, title_fr: e.target.value })} className={inputClass} /></FormField>
            <FormField label="Titre du voyage (AR)"><input dir="rtl" value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} className={inputClass} /></FormField>
            <div className="grid grid-cols-2 gap-4">
                <FormField label="Destination (Pays / Ville)" required><input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className={inputClass} /></FormField>
                <FormField label="Prix d'affichage minimum (DZD)" required><input type="number" required value={form.price_dzd} onChange={(e) => setForm({ ...form, price_dzd: e.target.value })} className={inputClass} /></FormField>
            </div>
            <FormField label="Remarques additionnelles"><textarea rows={3} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className={inputClass} /></FormField>
            <FormField label="Statut">
              <select value={form.is_active ? '1' : '0'} onChange={(e) => setForm({ ...form, is_active: e.target.value === '1' })} className={inputClass}>
                <option value="1">Actif</option><option value="0">Inactif</option>
              </select>
            </FormField>
          </div>
        )}

        {/* ONGLET 2 : DÉPARTS & VOLS */}
        {modalTab === 'departures' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800">Un voyage peut avoir plusieurs dates de départ. Chaque départ possède son propre plan de vol.</p>
                <button type="button" onClick={addDeparture} className="px-4 py-2 border border-blue-200 bg-white rounded-full text-xs font-bold text-blue-700 shadow-sm whitespace-nowrap">+ Ajouter une Date</button>
            </div>
            
            {form.departures.map((dep, dIdx) => (
              <div key={dIdx} className="border-2 border-gray-200 p-4 rounded-xl bg-white relative space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b pb-2">
                    <h5 className="font-bold text-navy">📅 Départ #{dIdx + 1}</h5>
                    <button type="button" onClick={() => removeDeparture(dIdx)} className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded">Retirer cette date</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Date de départ" required><input type="date" required value={dep.departure_date} onChange={(e) => updateDeparture(dIdx, 'departure_date', e.target.value)} className={inputClass} /></FormField>
                  <FormField label="Date de retour" required><input type="date" required value={dep.return_date} onChange={(e) => updateDeparture(dIdx, 'return_date', e.target.value)} className={inputClass} /></FormField>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Places total"><input type="number" value={dep.seats_total} onChange={(e) => updateDeparture(dIdx, 'seats_total', e.target.value)} className={inputClass} /></FormField>
                  <FormField label="Places restantes"><input type="number" value={dep.seats_remaining} onChange={(e) => updateDeparture(dIdx, 'seats_remaining', e.target.value)} className={inputClass} /></FormField>
                  <FormField label="Statut">
                      <select value={dep.is_active ? '1' : '0'} onChange={(e) => updateDeparture(dIdx, 'is_active', e.target.value === '1')} className={inputClass}>
                          <option value="1">Actif (Visible)</option><option value="0">Inactif (Masqué)</option>
                      </select>
                  </FormField>
                </div>

                {/* Vols à l'intérieur du départ */}
                <div className="bg-gray-50 p-4 rounded-xl border">
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-sm text-gray-700">✈️ Plan de vol pour cette date</span>
                        <button type="button" onClick={() => addFlight(dIdx)} className="text-xs bg-white border px-3 py-1 rounded-full">+ Ajouter un vol</button>
                    </div>

                    {dep.flights.length === 0 && <p className="text-xs text-gray-400 italic mb-2">Aucun vol configuré pour cette date.</p>}

                    {dep.flights.map((f, fIdx) => (
                        <div key={fIdx} className="bg-white border p-3 rounded-lg mb-3 relative">
                            <button type="button" onClick={() => removeFlight(dIdx, fIdx)} className="absolute top-2 right-2 text-red-500 text-xs font-bold">X</button>
                            <span className="text-[10px] font-bold text-blue-600 block mb-2 uppercase">Vol {fIdx + 1}</span>
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <MiniField label="De (Aéroport)" value={f.from} onChange={(v) => updateFlight(dIdx, fIdx, 'from', v)} />
                                <MiniField label="Vers (Aéroport)" value={f.to} onChange={(v) => updateFlight(dIdx, fIdx, 'to', v)} />
                            </div>
                            <div className="grid grid-cols-3 gap-3 mb-2">
                                <MiniField label="Compagnie" value={f.airline} onChange={(v) => updateFlight(dIdx, fIdx, 'airline', v)} />
                                <MiniField label="Date affichée" value={f.date} placeholder="Ex: 30 juillet" onChange={(v) => updateFlight(dIdx, fIdx, 'date', v)} />
                                <MiniField label="Heure" value={f.time} placeholder="Ex: 06:10 ➔ 10:55" onChange={(v) => updateFlight(dIdx, fIdx, 'time', v)} />
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ONGLET 3 : PROGRAMME */}
        {modalTab === 'program' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h4 className="font-bold text-sm">Itinéraire du voyage</h4><button type="button" onClick={addProgramDay} className="px-3 py-1.5 border rounded-full text-xs bg-gray-50">+ Ajouter un jour</button></div>
            {form.program.map((day, i) => (
              <div key={i} className="border p-4 rounded-xl bg-gray-50 relative space-y-2">
                <button type="button" onClick={() => removeProgramDay(i)} className="absolute top-2 right-3 text-red-500 text-xs">Retirer</button>
                <div className="font-bold text-xs text-navy">Jour {day.day}</div>
                <FormField label="Titre du jour"><input value={day.title} onChange={(e) => updateProgramDay(i, 'title', e.target.value)} className={inputClass} /></FormField>
                <FormField label="Description de la journée"><textarea rows={3} value={day.description} onChange={(e) => updateProgramDay(i, 'description', e.target.value)} className={inputClass} /></FormField>
              </div>
            ))}
          </div>
        )}

        {/* ONGLET 4 : HÔTELS & TARIFS */}
        {modalTab === 'hotels' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h4 className="font-bold text-sm">Hôtels et tarifs par chambre</h4><button type="button" onClick={addHotelOption} className="px-3 py-1.5 border rounded-full text-xs bg-gray-50">+ Ajouter une formule</button></div>
            {form.hotel_options.map((opt, i) => (
              <div key={i} className="border-2 border-gray-100 p-4 rounded-xl bg-white relative space-y-3">
                <button type="button" onClick={() => removeHotelOption(i)} className="absolute top-2 right-3 text-red-500 text-xs">Retirer</button>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Nom de l'hôtel" required><input required value={opt.hotel_name} onChange={(e) => updateHotelOption(i, 'hotel_name', e.target.value)} placeholder="ex: Hilton" className={inputClass} /></FormField>
                  <FormField label="Type de chambre / vue"><input value={opt.room_type} onChange={(e) => updateHotelOption(i, 'room_type', e.target.value)} placeholder="ex: Standard" className={inputClass} /></FormField>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="text-xs font-bold text-navy border-b pb-1">Grille des Tarifs (DZD / Pers)</div>
                  <div className="grid grid-cols-3 gap-2">
                    <MiniPrice label="Single" value={opt.price_single_dzd} onChange={(v) => updateHotelOption(i, 'price_single_dzd', v)} />
                    <MiniPrice label="Double" value={opt.price_double_dzd} onChange={(v) => updateHotelOption(i, 'price_double_dzd', v)} />
                    <MiniPrice label="Triple" value={opt.price_triple_dzd} onChange={(v) => updateHotelOption(i, 'price_triple_dzd', v)} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <MiniPrice label="Enf (avec lit)" value={opt.price_child_with_bed_dzd} onChange={(v) => updateHotelOption(i, 'price_child_with_bed_dzd', v)} />
                    <MiniPrice label="Enf (sans lit)" value={opt.price_child_no_bed_dzd} onChange={(v) => updateHotelOption(i, 'price_child_no_bed_dzd', v)} />
                    <MiniPrice label="Bébé (-2 ans)" value={opt.price_infant_dzd} onChange={(v) => updateHotelOption(i, 'price_infant_dzd', v)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ONGLET 5 : INCLUSIONS */}
        {modalTab === 'inclusions' && (
          <div className="space-y-4">
            <FormField label="Ce qui est INCLUS (virgules)"><textarea rows={3} value={form.included_pack.join(', ')} onChange={(e) => setForm({ ...form, included_pack: e.target.value.split(',').map(s => s.trim()) })} className={inputClass} /></FormField>
            <FormField label="Ce qui est EXCLUS (virgules)"><textarea rows={3} value={form.excluded_pack.join(', ')} onChange={(e) => setForm({ ...form, excluded_pack: e.target.value.split(',').map(s => s.trim()) })} className={inputClass} /></FormField>
          </div>
        )}

        <button disabled={saving} className="w-full py-3 bg-gradient-to-br from-[#00143C] to-[#0F2D5C] text-white rounded-full font-bold disabled:opacity-50">
          {saving ? 'Enregistrement...' : 'Enregistrer le voyage organisé'}
        </button>
      </form>
    </Modal>
  );
}

// Helpers
function TabBtn({ active, onClick, label }) {
  return <button type="button" onClick={onClick} className={`px-4 py-2.5 font-bold text-xs uppercase border-b-2 whitespace-nowrap ${active ? 'border-[#C9A84C] text-[#00143C]' : 'border-transparent text-gray-400'}`}>{label}</button>;
}
function MiniPrice({ label, value, onChange }) {
  return <div><label className="text-[10px] text-gray-400 font-semibold block mb-0.5">{label}</label><input type="number" step="0.01" value={value} onChange={(e) => onChange(e.target.value)} className="w-full border rounded-lg px-2 py-1 text-xs" /></div>;
}
function MiniField({ label, value, placeholder, onChange }) {
  return <div><label className="text-[10px] text-gray-500 font-semibold block mb-0.5">{label}</label><input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full border rounded-lg px-2 py-1 text-xs" /></div>;
}

function CoverModal({ tour, onClose, onSaved }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await api.post(`/tours/${tour.id}/upload-cover`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSaved();
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal title="Image de couverture" onClose={onClose}>
      <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer" onClick={() => document.getElementById('tourImgInput').click()}>
        <p className="text-gray-500">Sélectionnez une image de couverture</p>
        <input id="tourImgInput" type="file" accept="image/*" className="hidden" onChange={(e) => { setFile(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); }} />
      </div>
      {preview && <img src={preview} className="max-h-[200px] mx-auto mt-4 rounded-lg object-cover" />}
      <button disabled={!file || uploading} onClick={handleUpload} className="w-full py-3 bg-gradient-to-br from-[#00143C] to-[#0F2D5C] text-white rounded-full font-bold disabled:opacity-50 mt-4">
        {uploading ? 'Envoi...' : 'Téléverser'}
      </button>
    </Modal>
  );
}