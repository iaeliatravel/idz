import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { Toolbar, Badge, EmptyState, IconButton, Modal, FormField, inputClass, formatDZD, formatDate, Spinner } from '../Shared/UI';

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
              <th className="p-3">Date Départ</th><th className="p-3">Formules</th><th className="p-3">Statut</th><th className="p-3"></th>
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
                <td className="p-3">{formatDate(t.departure_date)}</td>
                <td className="p-3 font-semibold text-xs text-gray-400">{t.hotel_options?.length || 0} hôtel(s) lié(s)</td>
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
  const [modalTab, setModalTab] = useState('general'); // general | flights | program | hotels | inclusions

  const [form, setForm] = useState({
    title_fr: tour.title_fr || '', title_ar: tour.title_ar || '', destination: tour.destination || '', 
    departure_date: tour.departure_date?.slice(0, 10) || '', return_date: tour.return_date?.slice(0, 10) || '', 
    price_dzd: tour.price_dzd || 0, remarks: tour.remarks || '', seats_total: tour.seats_total || '',
    seats_remaining: tour.seats_remaining || '', is_active: tour.is_active ?? true,
    flights: tour.flights || [], program: tour.program || [], 
    included_pack: tour.included_pack || [], excluded_pack: tour.excluded_pack || [],
    hotel_options: (tour.hotel_options || []).map(opt => ({
      hotel_name: opt.hotel_name || '', room_type: opt.room_type || '',
      price_double_dzd: opt.price_double_dzd || 0, price_triple_dzd: opt.price_triple_dzd || 0,
      price_single_dzd: opt.price_single_dzd || 0, price_child_with_bed_dzd: opt.price_child_with_bed_dzd || 0,
      price_child_no_bed_dzd: opt.price_child_no_bed_dzd || 0, price_infant_dzd: opt.price_infant_dzd || 0,
    }))
  });
  
  const [saving, setSaving] = useState(false);

  // ---- FLIGHTS HANDLERS ----
  function addFlight() {
    setForm({ ...form, flights: [...form.flights, { from: '', to: '', airline: '', date: '', time: '' }] });
  }
  function removeFlight(idx) {
    setForm({ ...form, flights: form.flights.filter((_, i) => i !== idx) });
  }
  function updateFlight(idx, field, val) {
    const copy = [...form.flights];
    copy[idx] = { ...copy[idx], [field]: val };
    setForm({ ...form, flights: copy });
  }

  // ---- PROGRAM HANDLERS ----
  function addProgramDay() {
    const nextDay = form.program.length + 1;
    setForm({ ...form, program: [...form.program, { day: nextDay, title: '', description: '' }] });
  }
  function removeProgramDay(idx) {
    setForm({ ...form, program: form.program.filter((_, i) => i !== idx).map((day, i) => ({ ...day, day: i + 1 })) });
  }
  function updateProgramDay(idx, field, val) {
    const copy = [...form.program];
    copy[idx] = { ...copy[idx], [field]: val };
    setForm({ ...form, program: copy });
  }

  // ---- HOTEL & PRICING OPTIONS HANDLERS ----
  function addHotelOption() {
    setForm({ ...form, hotel_options: [...form.hotel_options, {
      hotel_name: '', room_type: 'Chambre Standard',
      price_double_dzd: 0, price_triple_dzd: 0, price_single_dzd: 0,
      price_child_with_bed_dzd: 0, price_child_no_bed_dzd: 0, price_infant_dzd: 0,
    }] });
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
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isNew ? 'Ajouter un voyage' : 'Modifier le voyage'} onClose={onClose} maxWidth="900px">
      
      {/* Sélecteur d'onglets interne */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <TabBtn active={modalTab === 'general'} onClick={() => setModalTab('general')} label="Général" />
        <TabBtn active={modalTab === 'flights'} onClick={() => setModalTab('flights')} label="✈️ Vols" />
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
            <FormField label="Destination (Pays / Ville)" required><input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className={inputClass} /></FormField>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Date de départ" required><input type="date" required value={form.departure_date} onChange={(e) => setForm({ ...form, departure_date: e.target.value })} className={inputClass} /></FormField>
              <FormField label="Date de retour" required><input type="date" required value={form.return_date} onChange={(e) => setForm({ ...form, return_date: e.target.value })} className={inputClass} /></FormField>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField label="Prix d'affichage minimum (DZD)" required><input type="number" required value={form.price_dzd} onChange={(e) => setForm({ ...form, price_dzd: e.target.value })} className={inputClass} /></FormField>
              <FormField label="Places total"><input type="number" value={form.seats_total} onChange={(e) => setForm({ ...form, seats_total: e.target.value })} className={inputClass} /></FormField>
              <FormField label="Places restantes"><input type="number" value={form.seats_remaining} onChange={(e) => setForm({ ...form, seats_remaining: e.target.value })} className={inputClass} /></FormField>
            </div>

            <FormField label="Remarques additionnelles"><textarea rows={3} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className={inputClass} /></FormField>
            
            <FormField label="Statut">
              <select value={form.is_active ? '1' : '0'} onChange={(e) => setForm({ ...form, is_active: e.target.value === '1' })} className={inputClass}>
                <option value="1">Actif</option><option value="0">Inactif</option>
              </select>
            </FormField>
          </div>
        )}

        {/* ONGLET 2 : VOLS */}
        {modalTab === 'flights' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h4 className="font-bold text-sm">Gestion des vols</h4><button type="button" onClick={addFlight} className="px-3 py-1.5 border rounded-full text-xs bg-gray-50">+ Ajouter un vol</button></div>
            
            {form.flights.map((f, i) => (
              <div key={i} className="border p-4 rounded-xl bg-gray-50 relative space-y-3">
                <button type="button" onClick={() => removeFlight(i)} className="absolute top-2 right-3 text-red-500 text-xs">Retirer</button>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Aéroport départ"><input value={f.from || ''} onChange={(e) => updateFlight(i, 'from', e.target.value)} className={inputClass} /></FormField>
                  <FormField label="Aéroport arrivée"><input value={f.to || ''} onChange={(e) => updateFlight(i, 'to', e.target.value)} className={inputClass} /></FormField>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <FormField label="Compagnie"><input value={f.airline || ''} onChange={(e) => updateFlight(i, 'airline', e.target.value)} className={inputClass} /></FormField>
                  <FormField label="Date"><input type="date" value={f.date || ''} onChange={(e) => updateFlight(i, 'date', e.target.value)} className={inputClass} /></FormField>
                  <FormField label="Heure"><input type="time" value={f.time || ''} onChange={(e) => updateFlight(i, 'time', e.target.value)} className={inputClass} /></FormField>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded-lg border">
                  <FormField label="Escale (Optionnel)"><input value={f.escale || ''} onChange={(e) => updateFlight(i, 'escale', e.target.value)} placeholder="Ex: Istanbul" className={inputClass} /></FormField>
                  <FormField label="Durée de l'escale"><input value={f.escale_duration || ''} onChange={(e) => updateFlight(i, 'escale_duration', e.target.value)} placeholder="Ex: 3h 30m" className={inputClass} /></FormField>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ONGLET 3 : PROGRAMME JOUR PAR JOUR */}
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

        {/* ONGLET 4 : HÔTELS ET GRILLES TARIFAIRES DYNAMIQUES */}
        {modalTab === 'hotels' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h4 className="font-bold text-sm">Hôtels ou combinés d'hôtels et tarifs par chambre</h4><button type="button" onClick={addHotelOption} className="px-3 py-1.5 border rounded-full text-xs bg-gray-50">+ Ajouter une formule hôtel</button></div>
            
            {form.hotel_options.map((opt, i) => (
              <div key={i} className="border-2 border-gray-100 p-4 rounded-xl bg-white relative space-y-3">
                <button type="button" onClick={() => removeHotelOption(i)} className="absolute top-2 right-3 text-red-500 text-xs">Retirer</button>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Nom de l'hôtel (ou combiné d'hôtels)" required><input required value={opt.hotel_name} onChange={(e) => updateHotelOption(i, 'hotel_name', e.target.value)} placeholder="ex: Hilton Cairo + Tivoli 4*" className={inputClass} /></FormField>
                  <FormField label="Type de chambre / vue"><input value={opt.room_type} onChange={(e) => updateHotelOption(i, 'room_type', e.target.value)} placeholder="ex: Chambre Standard, Vue terre..." className={inputClass} /></FormField>
                </div>
                
                {/* Grille des tarifs */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="text-xs font-bold text-navy border-b pb-1">Grille des Tarifs (DZD / Pers)</div>
                  <div className="grid grid-cols-3 gap-2">
                    <MiniPrice label="Single" value={opt.price_single_dzd} onChange={(v) => updateHotelOption(i, 'price_single_dzd', v)} />
                    <MiniPrice label="Double" value={opt.price_double_dzd} onChange={(v) => updateHotelOption(i, 'price_double_dzd', v)} />
                    <MiniPrice label="Triple" value={opt.price_triple_dzd} onChange={(v) => updateHotelOption(i, 'price_triple_dzd', v)} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <MiniPrice label="Enfant (avec lit)" value={opt.price_child_with_bed_dzd} onChange={(v) => updateHotelOption(i, 'price_child_with_bed_dzd', v)} />
                    <MiniPrice label="Enfant (sans lit)" value={opt.price_child_no_bed_dzd} onChange={(v) => updateHotelOption(i, 'price_child_no_bed_dzd', v)} />
                    <MiniPrice label="Bébé (-2 ans)" value={opt.price_infant_dzd} onChange={(v) => updateHotelOption(i, 'price_infant_dzd', v)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ONGLET 5 : INCLUSIONS / EXCLUSIONS */}
        {modalTab === 'inclusions' && (
          <div className="space-y-4">
            <FormField label="Ce qui est INCLUS (séparez par des virgules)">
              <textarea rows={3} value={form.included_pack.join(', ')} onChange={(e) => setForm({ ...form, included_pack: e.target.value.split(',').map(s => s.trim()) })} className={inputClass} placeholder="Billet d'avion, Hébergement, Transferts..." />
            </FormField>
            <FormField label="Ce qui est EXCLUS (séparez par des virgules)">
              <textarea rows={3} value={form.excluded_pack.join(', ')} onChange={(e) => setForm({ ...form, excluded_pack: e.target.value.split(',').map(s => s.trim()) })} className={inputClass} placeholder="Frais de visa, Boissons, Pourboires..." />
            </FormField>
          </div>
        )}

        <button disabled={saving} className="w-full py-3 bg-gradient-to-br from-[#00143C] to-[#0F2D5C] text-white rounded-full font-bold disabled:opacity-50">
          {saving ? 'Enregistrement...' : 'Enregistrer le voyage organisé'}
        </button>
      </form>
    </Modal>
  );
}

// Composants internes spécifiques
function TabBtn({ active, onClick, label }) {
  return (
    <button type="button" onClick={onClick} className={`px-4 py-2.5 font-bold text-xs uppercase border-b-2 whitespace-nowrap ${active ? 'border-[#C9A84C] text-[#00143C]' : 'border-transparent text-gray-400'}`}>
      {label}
    </button>
  );
}

function MiniPrice({ label, value, onChange }) {
  return (
    <div>
      <label className="text-[10px] text-gray-400 font-semibold block mb-0.5">{label}</label>
      <input type="number" step="0.01" value={value} onChange={(e) => onChange(e.target.value)} className="w-full border rounded-lg px-2 py-1 text-xs" />
    </div>
  );
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