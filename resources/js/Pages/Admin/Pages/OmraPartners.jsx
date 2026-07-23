import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { Toolbar, EmptyState, IconButton, Modal, FormField, inputClass, Spinner } from '../Shared/UI';

export default function OmraPartners() {
  const [partners, setPartners] = useState(null);
  const [editing, setEditing] = useState(null);

  function load() {
    api.get('/omra/partners').then(({ data }) => setPartners(data));
  }
  useEffect(load, []);

  if (!partners) return <div className="text-center py-20"><Spinner /></div>;

  async function handleDelete(p) {
    if (!confirm('Supprimer ce partenaire ?')) return;
    await api.delete(`/omra/partners/${p.id}`);
    load();
  }

  return (
    <div>
      <Toolbar>
        <p className="text-sm text-gray-400">🙈 Les partenaires sont masqués côté site public.</p>
        <button onClick={() => setEditing({})} className="px-5 py-2.5 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold text-sm">+ Ajouter un partenaire</button>
      </Toolbar>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
            <tr><th className="p-3">Nom</th><th className="p-3">Contact</th><th className="p-3">Téléphone</th><th className="p-3">Notes</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {partners.length ? partners.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3"><strong>{p.name}</strong></td>
                <td className="p-3">{p.contact || '—'}</td>
                <td className="p-3">{p.phone || '—'}</td>
                <td className="p-3">{p.notes || '—'}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <IconButton title="Modifier" onClick={() => setEditing(p)}>✏️</IconButton>
                    <IconButton title="Supprimer" danger onClick={() => handleDelete(p)}>🗑️</IconButton>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={5}><EmptyState icon="🤝" text="Aucun partenaire enregistré." /></td></tr>}
          </tbody>
        </table>
      </div>

      {editing !== null && <PartnerFormModal partner={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function PartnerFormModal({ partner, onClose, onSaved }) {
  const isNew = !partner.id;
  const [form, setForm] = useState({ name: partner.name || '', contact: partner.contact || '', phone: partner.phone || '', notes: partner.notes || '' });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) await api.post('/omra/partners', form);
      else await api.put(`/omra/partners/${partner.id}`, form);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isNew ? 'Ajouter un partenaire' : 'Modifier le partenaire'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <FormField label="Nom" required><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></FormField>
        <FormField label="Contact"><input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className={inputClass} /></FormField>
        <FormField label="Téléphone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} /></FormField>
        <FormField label="Notes"><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} /></FormField>
        <button disabled={saving} className="w-full py-3 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold disabled:opacity-50">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </Modal>
  );
}
