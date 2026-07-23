import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { Toolbar, EmptyState, IconButton, Modal, FormField, inputClass, Spinner } from '../Shared/UI';

export default function OmraAirlines() {
  const [airlines, setAirlines] = useState(null);
  const [editing, setEditing] = useState(null);

  function load() {
    api.get('/omra/airlines').then(({ data }) => setAirlines(data));
  }
  useEffect(load, []);

  if (!airlines) return <div className="text-center py-20"><Spinner /></div>;

  async function handleDelete(a) {
    if (!confirm('Supprimer cette compagnie ?')) return;
    await api.delete(`/omra/airlines/${a.id}`);
    load();
  }

  return (
    <div>
      <Toolbar>
        <div />
        <button onClick={() => setEditing({})} className="px-5 py-2.5 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold text-sm">+ Ajouter une compagnie</button>
      </Toolbar>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
            <tr><th className="p-3">Logo</th><th className="p-3">Nom</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {airlines.length ? airlines.map((a) => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{a.logo_url ? <img src={a.logo_url} className="h-8" /> : '—'}</td>
                <td className="p-3"><strong>{a.name}</strong></td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <IconButton title="Modifier" onClick={() => setEditing(a)}>✏️</IconButton>
                    <IconButton title="Supprimer" danger onClick={() => handleDelete(a)}>🗑️</IconButton>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={3}><EmptyState icon="✈" text="Aucune compagnie enregistrée." /></td></tr>}
          </tbody>
        </table>
      </div>

      {editing !== null && <AirlineFormModal airline={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function AirlineFormModal({ airline, onClose, onSaved }) {
  const isNew = !airline.id;
  const [name, setName] = useState(airline.name || '');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      if (file) fd.append('logo', file);
      if (isNew) {
        await api.post('/omra/airlines', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        fd.append('_method', 'PUT');
        await api.post(`/omra/airlines/${airline.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isNew ? 'Ajouter une compagnie' : 'Modifier la compagnie'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <FormField label="Nom" required><input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} /></FormField>
        <FormField label="Logo">
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          {airline.logo_url && <img src={airline.logo_url} className="h-10 mt-2" />}
        </FormField>
        <button disabled={saving} className="w-full py-3 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold disabled:opacity-50">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </Modal>
  );
}
