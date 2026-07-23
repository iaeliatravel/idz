import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { Toolbar, Badge, EmptyState, IconButton, Modal, FormField, inputClass, Spinner } from '../Shared/UI';

export default function OmraHotels() {
  const [hotels, setHotels] = useState(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [imagesTarget, setImagesTarget] = useState(null);

  function load() {
    api.get('/omra/hotels').then(({ data }) => setHotels(data));
  }
  useEffect(load, []);

  if (!hotels) return <div className="text-center py-20"><Spinner /></div>;

  const filtered = hotels.filter((h) => !search || h.name.toLowerCase().includes(search.toLowerCase()));

  async function handleDelete(h) {
    if (!confirm('Supprimer cet hôtel ?')) return;
    await api.delete(`/omra/hotels/${h.id}`);
    load();
  }

  return (
    <div>
      <Toolbar>
        <input placeholder="Rechercher un hôtel..." value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputClass} max-w-[320px]`} />
        <button onClick={() => setEditing({})} className="px-5 py-2.5 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold text-sm">+ Ajouter un hôtel</button>
      </Toolbar>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
            <tr><th className="p-3">Image</th><th className="p-3">Nom</th><th className="p-3">Ville</th><th className="p-3">Étoiles</th><th className="p-3">Distance Haram</th><th className="p-3">Actif</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {filtered.length ? filtered.map((h) => (
              <tr key={h.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{h.images?.[0] ? <img src={h.images[0].image_url} className="w-12 h-12 rounded-md object-cover" /> : <span className="text-gray-300">—</span>}</td>
                <td className="p-3"><strong>{h.name}</strong></td>
                <td className="p-3">{h.city === 'mecque' ? '🕋 Mecque' : '🕌 Médine'}</td>
                <td className="p-3">{'★'.repeat(h.stars || 0)}</td>
                <td className="p-3">{h.distance_haram || '—'}</td>
                <td className="p-3">{h.is_active ? <Badge color="green">Actif</Badge> : <Badge color="red">Inactif</Badge>}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <IconButton title="Modifier" onClick={() => setEditing(h)}>✏️</IconButton>
                    <IconButton title="Images" onClick={() => setImagesTarget(h)}>🖼️</IconButton>
                    <IconButton title="Supprimer" danger onClick={() => handleDelete(h)}>🗑️</IconButton>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={7}><EmptyState icon="🏨" text="Aucun hôtel enregistré." /></td></tr>}
          </tbody>
        </table>
      </div>

      {editing !== null && <HotelFormModal hotel={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {imagesTarget && <ImagesModal hotel={imagesTarget} onClose={() => setImagesTarget(null)} onSaved={load} />}
    </div>
  );
}

function HotelFormModal({ hotel, onClose, onSaved }) {
  const isNew = !hotel.id;
  const [form, setForm] = useState({
    name: hotel.name || '', city: hotel.city || 'mecque', stars: hotel.stars || 5,
    distance_haram: hotel.distance_haram || '', map_url: hotel.map_url || '',
    latitude: hotel.latitude || '', longitude: hotel.longitude || '',
    description: hotel.description || '', is_active: hotel.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) await api.post('/omra/hotels', form);
      else await api.put(`/omra/hotels/${hotel.id}`, form);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isNew ? 'Ajouter un hôtel' : "Modifier l'hôtel"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <FormField label="Nom" required><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ville" required>
            <select required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass}>
              <option value="mecque">Mecque</option><option value="medine">Médine</option>
            </select>
          </FormField>
          <FormField label="Étoiles">
            <select value={form.stars} onChange={(e) => setForm({ ...form, stars: e.target.value })} className={inputClass}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} ★</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Distance du Haram"><input value={form.distance_haram} onChange={(e) => setForm({ ...form, distance_haram: e.target.value })} placeholder="350m du Haram" className={inputClass} /></FormField>
        <FormField label="Lien Google Maps"><input value={form.map_url} onChange={(e) => setForm({ ...form, map_url: e.target.value })} placeholder="https://maps.google.com/..." className={inputClass} /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Latitude"><input type="number" step="0.000001" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className={inputClass} /></FormField>
          <FormField label="Longitude"><input type="number" step="0.000001" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className={inputClass} /></FormField>
        </div>
        <FormField label="Description"><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} /></FormField>
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

function ImagesModal({ hotel, onClose, onSaved }) {
  const [images, setImages] = useState(hotel.images || []);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('images[]', f));
      const { data } = await api.post(`/omra/hotels/${hotel.id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImages([...images, ...data.images]);
      setFiles([]);
      onSaved();
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteImage(img) {
    await api.delete(`/omra/hotel-images/${img.id}`);
    setImages(images.filter((i) => i.id !== img.id));
    onSaved();
  }

  return (
    <Modal title={`Images — ${hotel.name}`} onClose={onClose}>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {images.length ? images.map((img) => (
          <div key={img.id} className="relative">
            <img src={img.image_url} className="w-full h-[90px] object-cover rounded-md" />
            <button onClick={() => handleDeleteImage(img)} className="absolute top-1 right-1 bg-white rounded-md w-7 h-7 shadow text-red-500">🗑️</button>
          </div>
        )) : <p className="text-gray-400 col-span-3 text-center py-4">Aucune image.</p>}
      </div>
      <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-skyblue" onClick={() => document.getElementById('hotelImgInput').click()}>
        <p className="text-gray-500">Cliquez ou glissez des images ici</p>
        <small className="text-gray-400">Plusieurs fichiers acceptés — JPG, PNG, WEBP</small>
        <input id="hotelImgInput" type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files))} />
      </div>
      {files.length > 0 && <p className="text-sm text-gray-500 mt-2">{files.length} fichier(s) sélectionné(s)</p>}
      <button disabled={!files.length || uploading} onClick={handleUpload} className="w-full py-3 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold disabled:opacity-50 mt-4">
        {uploading ? 'Téléversement...' : 'Téléverser'}
      </button>
    </Modal>
  );
}
