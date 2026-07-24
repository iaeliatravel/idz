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
              <th className="p-3">Date Départ</th><th className="p-3">Prix Adulte</th><th className="p-3">Statut</th><th className="p-3"></th>
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
                <td className="p-3 font-semibold">{formatDZD(t.price_dzd)}</td>
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
  const [form, setForm] = useState({
    title_fr: tour.title_fr || '', title_ar: tour.title_ar || '',
    destination: tour.destination || '', departure_date: tour.departure_date?.slice(0, 10) || '',
    return_date: tour.return_date?.slice(0, 10) || '', price_dzd: tour.price_dzd || 0,
    price_child_dzd: tour.price_child_dzd || 0, description_fr: tour.description_fr || '',
    description_ar: tour.description_ar || '', seats_total: tour.seats_total || '',
    seats_remaining: tour.seats_remaining || '', is_active: tour.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

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
    <Modal title={isNew ? 'Ajouter un voyage organisé' : 'Modifier le voyage'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Titre (FR)" required><input required value={form.title_fr} onChange={(e) => setForm({ ...form, title_fr: e.target.value })} className={inputClass} /></FormField>
        <FormField label="Titre (AR)"><input dir="rtl" value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} className={inputClass} /></FormField>
        <FormField label="Destination" required><input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className={inputClass} /></FormField>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date Départ" required><input type="date" required value={form.departure_date} onChange={(e) => setForm({ ...form, departure_date: e.target.value })} className={inputClass} /></FormField>
          <FormField label="Date Retour" required><input type="date" required value={form.return_date} onChange={(e) => setForm({ ...form, return_date: e.target.value })} className={inputClass} /></FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Prix Adulte (DZD)" required><input type="number" required value={form.price_dzd} onChange={(e) => setForm({ ...form, price_dzd: e.target.value })} className={inputClass} /></FormField>
          <FormField label="Prix Enfant (DZD)"><input type="number" value={form.price_child_dzd} onChange={(e) => setForm({ ...form, price_child_dzd: e.target.value })} className={inputClass} /></FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nombre de places total"><input type="number" value={form.seats_total} onChange={(e) => setForm({ ...form, seats_total: e.target.value })} className={inputClass} /></FormField>
          <FormField label="Places restantes"><input type="number" value={form.seats_remaining} onChange={(e) => setForm({ ...form, seats_remaining: e.target.value })} className={inputClass} /></FormField>
        </div>

        <FormField label="Description (FR)"><textarea rows={3} value={form.description_fr} onChange={(e) => setForm({ ...form, description_fr: e.target.value })} className={inputClass} /></FormField>
        <FormField label="Description (AR)"><textarea rows={3} dir="rtl" value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} className={inputClass} /></FormField>
        
        <FormField label="Statut">
          <select value={form.is_active ? '1' : '0'} onChange={(e) => setForm({ ...form, is_active: e.target.value === '1' })} className={inputClass}>
            <option value="1">Actif</option><option value="0">Inactif</option>
          </select>
        </FormField>

        <button disabled={saving} className="w-full py-3 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold disabled:opacity-50">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </Modal>
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
      <button disabled={!file || uploading} onClick={handleUpload} className="w-full py-3 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold disabled:opacity-50 mt-4">
        {uploading ? 'Envoi...' : 'Téléverser'}
      </button>
    </Modal>
  );
}