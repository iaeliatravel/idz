import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { Toolbar, Badge, EmptyState, IconButton, Modal, FormField, inputClass, Spinner } from '../Shared/UI';

export default function EvisaCountries() {
  const [countries, setCountries] = useState(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // null = fermé, {} = nouveau, {...} = édition
  const [flagTarget, setFlagTarget] = useState(null);

  function load() {
    api.get('/evisa/countries').then(({ data }) => setCountries(data));
  }
  useEffect(load, []);

  if (!countries) return <div className="text-center py-20"><Spinner /></div>;

  const filtered = countries.filter((c) => !search || c.name_fr.toLowerCase().includes(search.toLowerCase()));

  async function handleDelete(country) {
    if (!confirm('Supprimer ce pays et toutes ses options associées ?')) return;
    await api.delete(`/evisa/countries/${country.id}`);
    load();
  }

  return (
    <div>
      <Toolbar>
        <input placeholder="Rechercher un pays..." value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputClass} max-w-[320px]`} />
        <button onClick={() => setEditing({})} className="px-5 py-2.5 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold text-sm">+ Ajouter un pays</button>
      </Toolbar>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
            <tr><th className="p-3">Drapeau</th><th className="p-3">Nom (FR)</th><th className="p-3">Région</th><th className="p-3">Actif</th><th className="p-3">Ordre</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {filtered.length ? filtered.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  {c.flag_image_url ? <img src={c.flag_image_url} className="w-12 h-12 rounded-md object-cover" /> : <span className="text-3xl">{c.flag_emoji || '🌍'}</span>}
                </td>
                <td className="p-3"><strong>{c.name_fr}</strong><br /><small className="text-gray-400">{c.slug}</small></td>
                <td className="p-3">{c.region || '—'}</td>
                <td className="p-3">{c.is_active ? <Badge color="green">Actif</Badge> : <Badge color="red">Inactif</Badge>}</td>
                <td className="p-3">{c.display_order}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <IconButton title="Modifier" onClick={() => setEditing(c)}>✏️</IconButton>
                    <IconButton title="Drapeau" onClick={() => setFlagTarget(c)}>🖼️</IconButton>
                    <IconButton title="Supprimer" danger onClick={() => handleDelete(c)}>🗑️</IconButton>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={6}><EmptyState icon="🌍" text="Aucun pays configuré." /></td></tr>}
          </tbody>
        </table>
      </div>

      {editing !== null && <CountryFormModal country={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {flagTarget && <FlagModal country={flagTarget} onClose={() => setFlagTarget(null)} onSaved={() => { setFlagTarget(null); load(); }} />}
    </div>
  );
}

function CountryFormModal({ country, onClose, onSaved }) {
  const isNew = !country.id;
  const [form, setForm] = useState({
    name_fr: country.name_fr || '', name_en: country.name_en || '', name_ar: country.name_ar || '',
    slug: country.slug || '', flag_emoji: country.flag_emoji || '', region: country.region || '',
    display_order: country.display_order || 0, is_active: country.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) await api.post('/evisa/countries', form);
      else await api.put(`/evisa/countries/${country.id}`, form);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isNew ? 'Ajouter un pays' : 'Modifier le pays'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nom (FR)" required><input required value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} className={inputClass} /></FormField>
          <FormField label="Slug" required><input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="ex: turquie" className={inputClass} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nom (EN)"><input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className={inputClass} /></FormField>
          <FormField label="Nom (AR)"><input dir="rtl" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className={inputClass} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Emoji drapeau"><input value={form.flag_emoji} onChange={(e) => setForm({ ...form, flag_emoji: e.target.value })} placeholder="🇹🇷" className={inputClass} /></FormField>
          <FormField label="Région"><input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Europe, Asie..." className={inputClass} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ordre d'affichage"><input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} className={inputClass} /></FormField>
          <FormField label="Statut">
            <select value={form.is_active ? '1' : '0'} onChange={(e) => setForm({ ...form, is_active: e.target.value === '1' })} className={inputClass}>
              <option value="1">Actif</option><option value="0">Inactif</option>
            </select>
          </FormField>
        </div>
        <button disabled={saving} className="w-full py-3 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold disabled:opacity-50 mt-2">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </Modal>
  );
}

function FlagModal({ country, onClose, onSaved }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  function handleFile(f) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload() {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('flag', file);
      await api.post(`/evisa/countries/${country.id}/flag`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSaved();
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal title={`Drapeau — ${country.name_fr}`} onClose={onClose}>
      <div
        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-skyblue"
        onClick={() => document.getElementById('flagInput').click()}
      >
        <p className="text-gray-500">Cliquez ou glissez une image ici</p>
        <small className="text-gray-400">JPG, PNG, WEBP — recommandé : grande image (1200×800px min)</small>
        <input id="flagInput" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
      </div>
      {preview && <img src={preview} className="max-h-[200px] mx-auto mt-4 rounded-lg" />}
      <button disabled={!file || uploading} onClick={handleUpload} className="w-full py-3 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold disabled:opacity-50 mt-4">
        {uploading ? 'Téléversement...' : 'Téléverser'}
      </button>
    </Modal>
  );
}
