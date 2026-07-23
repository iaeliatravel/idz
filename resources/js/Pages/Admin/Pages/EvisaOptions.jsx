import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { Toolbar, Badge, EmptyState, IconButton, Modal, FormField, inputClass, formatDZD, Spinner } from '../Shared/UI';

const COLORS = ['green', 'blue', 'amber', 'purple', 'red'];

export default function EvisaOptions() {
  const [countries, setCountries] = useState(null);
  const [options, setOptions] = useState(null);
  const [countryFilter, setCountryFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [docsTarget, setDocsTarget] = useState(null);

  function load() {
    Promise.all([api.get('/evisa/countries'), api.get('/evisa/options')]).then(([c, o]) => {
      setCountries(c.data);
      setOptions(o.data);
    });
  }
  useEffect(load, []);

  if (!countries || !options) return <div className="text-center py-20"><Spinner /></div>;

  const filtered = options.filter((o) => !countryFilter || String(o.country_id) === countryFilter);

  async function handleDelete(option) {
    if (!confirm('Supprimer cette option de visa ?')) return;
    await api.delete(`/evisa/options/${option.id}`);
    load();
  }

  return (
    <div>
      <Toolbar>
        <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className={`${inputClass} max-w-[280px]`}>
          <option value="">Tous les pays</option>
          {countries.map((c) => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
        </select>
        <button onClick={() => setEditing({})} className="px-5 py-2.5 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold text-sm">+ Ajouter une option</button>
      </Toolbar>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
            <tr><th className="p-3">Pays</th><th className="p-3">Option</th><th className="p-3">Délai</th><th className="p-3">Coût</th><th className="p-3">Vente</th><th className="p-3">Bénéfice</th><th className="p-3">Actif</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {filtered.length ? filtered.map((o) => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{o.country_name}</td>
                <td className="p-3"><strong>{o.label_fr}</strong></td>
                <td className="p-3">{o.delai_fr || '—'}</td>
                <td className="p-3">{formatDZD(o.cost_price_dzd)}</td>
                <td className="p-3">{formatDZD(o.sale_price_dzd)}</td>
                <td className="p-3 text-green font-bold">{formatDZD(Number(o.sale_price_dzd) - Number(o.cost_price_dzd))}</td>
                <td className="p-3">{o.is_active ? <Badge color="green">Actif</Badge> : <Badge color="red">Inactif</Badge>}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <IconButton title="Modifier" onClick={() => setEditing(o)}>✏️</IconButton>
                    <IconButton title="Documents requis" onClick={() => setDocsTarget(o)}>📄</IconButton>
                    <IconButton title="Supprimer" danger onClick={() => handleDelete(o)}>🗑️</IconButton>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={8}><EmptyState icon="📋" text="Aucune option configurée." /></td></tr>}
          </tbody>
        </table>
      </div>

      {editing !== null && <OptionFormModal option={editing} countries={countries} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {docsTarget && <DocumentsModal option={docsTarget} onClose={() => setDocsTarget(null)} />}
    </div>
  );
}

function OptionFormModal({ option, countries, onClose, onSaved }) {
  const isNew = !option.id;
  const [form, setForm] = useState({
    country_id: option.country_id || (countries[0]?.id ?? ''),
    label_fr: option.label_fr || '', label_en: option.label_en || '', label_ar: option.label_ar || '',
    type_color: option.type_color || 'green', delai_fr: option.delai_fr || '', validite_fr: option.validite_fr || '',
    cost_price_dzd: option.cost_price_dzd || 0, sale_price_dzd: option.sale_price_dzd || 0,
    note_fr: option.note_fr || '', conditions_fr: option.conditions_fr || '',
    display_order: option.display_order || 0, is_active: option.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) await api.post('/evisa/options', form);
      else await api.put(`/evisa/options/${option.id}`, form);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isNew ? 'Ajouter une option' : "Modifier l'option"} onClose={onClose} maxWidth="700px">
      <form onSubmit={handleSubmit}>
        <FormField label="Pays" required>
          <select required value={form.country_id} onChange={(e) => setForm({ ...form, country_id: e.target.value })} className={inputClass}>
            {countries.map((c) => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
          </select>
        </FormField>
        <FormField label="Libellé (FR)" required>
          <input required value={form.label_fr} onChange={(e) => setForm({ ...form, label_fr: e.target.value })} placeholder="ex: E-Visa Touristique 30 jours" className={inputClass} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Libellé (EN)"><input value={form.label_en} onChange={(e) => setForm({ ...form, label_en: e.target.value })} className={inputClass} /></FormField>
          <FormField label="Libellé (AR)"><input dir="rtl" value={form.label_ar} onChange={(e) => setForm({ ...form, label_ar: e.target.value })} className={inputClass} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Délai de traitement"><input value={form.delai_fr} onChange={(e) => setForm({ ...form, delai_fr: e.target.value })} placeholder="3 à 5 jours ouvrés" className={inputClass} /></FormField>
          <FormField label="Durée de validité"><input value={form.validite_fr} onChange={(e) => setForm({ ...form, validite_fr: e.target.value })} placeholder="90 jours" className={inputClass} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Prix d'achat (coût) DZD" required><input type="number" step="0.01" required value={form.cost_price_dzd} onChange={(e) => setForm({ ...form, cost_price_dzd: e.target.value })} className={inputClass} /></FormField>
          <FormField label="Prix de vente DZD" required><input type="number" step="0.01" required value={form.sale_price_dzd} onChange={(e) => setForm({ ...form, sale_price_dzd: e.target.value })} className={inputClass} /></FormField>
        </div>
        <FormField label="Couleur du badge">
          <select value={form.type_color} onChange={(e) => setForm({ ...form, type_color: e.target.value })} className={inputClass}>
            {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="Note (affichée au client)"><textarea value={form.note_fr} onChange={(e) => setForm({ ...form, note_fr: e.target.value })} rows={2} className={inputClass} /></FormField>
        <FormField label="Conditions"><textarea value={form.conditions_fr} onChange={(e) => setForm({ ...form, conditions_fr: e.target.value })} rows={2} className={inputClass} /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ordre d'affichage"><input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} className={inputClass} /></FormField>
          <FormField label="Statut">
            <select value={form.is_active ? '1' : '0'} onChange={(e) => setForm({ ...form, is_active: e.target.value === '1' })} className={inputClass}>
              <option value="1">Actif</option><option value="0">Inactif</option>
            </select>
          </FormField>
        </div>
        <button disabled={saving} className="w-full py-3 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold disabled:opacity-50">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </Modal>
  );
}

function DocumentsModal({ option, onClose }) {
  const [docs, setDocs] = useState(null);
  const [form, setForm] = useState({ label_fr: '', category: 'client', is_required: true, requires_upload: true });

  function load() {
    api.get('/evisa/documents', { params: { option_id: option.id } }).then(({ data }) => setDocs(data));
  }
  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault();
    await api.post('/evisa/documents', { ...form, option_id: option.id });
    setForm({ label_fr: '', category: 'client', is_required: true, requires_upload: true });
    load();
  }

  async function handleDelete(doc) {
    if (!confirm('Supprimer ce document ?')) return;
    await api.delete(`/evisa/documents/${doc.id}`);
    load();
  }

  return (
    <Modal title={`Documents requis — ${option.label_fr}`} onClose={onClose}>
      {docs === null ? <Spinner /> : (
        <div className="space-y-2 mb-5">
          {docs.length ? docs.map((d) => (
            <div key={d.id} className="flex justify-between items-center border rounded-lg p-3">
              <div>
                <strong className="text-sm">{d.label_fr}</strong>
                <div className="text-xs text-gray-400">{d.category} — {d.is_required ? 'Obligatoire' : 'Optionnel'} — {d.requires_upload ? 'Upload requis' : 'Sans upload'}</div>
              </div>
              <IconButton danger title="Supprimer" onClick={() => handleDelete(d)}>🗑️</IconButton>
            </div>
          )) : <p className="text-gray-400 text-center py-4">Aucun document configuré.</p>}
        </div>
      )}

      <form onSubmit={handleAdd} className="pt-4 border-t">
        <h4 className="font-bold mb-3">Ajouter un document</h4>
        <FormField label="Libellé" required>
          <input required value={form.label_fr} onChange={(e) => setForm({ ...form, label_fr: e.target.value })} placeholder="ex: Scan du passeport" className={inputClass} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Catégorie">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
              <option value="client">Client</option><option value="mineur">Mineur</option><option value="agence">Agence</option><option value="autre">Autre</option>
            </select>
          </FormField>
          <FormField label="Obligatoire ?">
            <select value={form.is_required ? '1' : '0'} onChange={(e) => setForm({ ...form, is_required: e.target.value === '1' })} className={inputClass}>
              <option value="1">Oui</option><option value="0">Non</option>
            </select>
          </FormField>
        </div>
        <FormField label="Nécessite un téléversement ?">
          <select value={form.requires_upload ? '1' : '0'} onChange={(e) => setForm({ ...form, requires_upload: e.target.value === '1' })} className={inputClass}>
            <option value="1">Oui</option><option value="0">Non</option>
          </select>
        </FormField>
        <button className="w-full py-2.5 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold text-sm">+ Ajouter</button>
      </form>
    </Modal>
  );
}
