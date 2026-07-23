import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { Toolbar, Badge, EmptyState, IconButton, Modal, FormField, inputClass, formatDZD, formatDate, Spinner } from '../Shared/UI';

const STATUS_OPTIONS = ['nouveau', 'en_cours', 'documents_manquants', 'soumis_ambassade', 'approuve', 'refuse', 'annule'];
const STATUS_LABELS = {
  nouveau: '🆕 Nouveau', en_cours: '⏳ En cours', documents_manquants: '📋 Documents manquants',
  soumis_ambassade: '🏛 Soumis ambassade', approuve: '✅ Approuvé', refuse: '❌ Refusé', annule: '🚫 Annulé',
};
const STATUS_COLORS = {
  nouveau: 'blue', en_cours: 'amber', documents_manquants: 'amber', soumis_ambassade: 'purple',
  approuve: 'green', refuse: 'red', annule: 'red',
};

const PAYMENT_BADGES = {
  paid: { label: '💳 Payé', color: 'green' },
  pending: { label: '⏳ En attente', color: 'amber' },
  failed: { label: '❌ Échoué', color: 'red' },
  non_paye: { label: '🚫 Non payé', color: 'red' }
};

export default function EvisaApplications() {
  const [apps, setApps] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  function load() {
    api.get('/evisa/applications', { params: { limit: 100, status: statusFilter || undefined } })
      .then(({ data }) => setApps(data));
  }

  useEffect(load, [statusFilter]);

  if (!apps) return <div className="text-center py-20"><Spinner /></div>;

  const filtered = apps.filter((a) =>
    !search || JSON.stringify(a).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Toolbar>
        <input placeholder="Rechercher (nom, email, référence)..." value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputClass} max-w-[320px]`} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputClass} max-w-[220px]`}>
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </Toolbar>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-3">Référence</th><th className="p-3">Client</th><th className="p-3">Pays</th>
              <th className="p-3">Option</th><th className="p-3">Prix</th><th className="p-3">Paiement</th>{/* <-- AJOUTÉ */}
              <th className="p-3">Option</th><th className="p-3">Prix vente</th><th className="p-3">Bénéfice</th>
              <th className="p-3">Statut</th><th className="p-3">Date</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? filtered.map((a) => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-bold">{a.reference}</td>
                <td className="p-3">{a.first_name} {a.last_name}<br /><small className="text-gray-400">{a.email}</small></td>
                <td className="p-3">{a.country_name}</td>
                <td className="p-3">{a.option_label}</td>
                <td className="p-3">{formatDZD(a.sale_price_dzd)}</td>
                <td className="p-3 text-green font-bold">{formatDZD(a.benefit)}</td>
                <td className="p-3"><Badge color={STATUS_COLORS[a.status]}>{STATUS_LABELS[a.status]}</Badge></td>
                <td className="p-3">{formatDate(a.created_at)}</td>
                <td className="p-3"><IconButton title="Détails" onClick={() => setSelected(a)}>👁</IconButton></td>
                <td className="p-3">
                  <Badge color={PAYMENT_BADGES[a.payment_status]?.color || 'red'}>
                    {PAYMENT_BADGES[a.payment_status]?.label || 'Non payé'}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <IconButton title="Détails" onClick={() => setSelected(a)}>👁</IconButton>
                    <IconButton title="Supprimer" danger onClick={() => handleDelete(a)}>🗑️</IconButton> {/* <-- AJOUTÉ */}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={9}><EmptyState icon="📥" text="Aucune demande trouvée." /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <DetailModal application={selected} onClose={() => setSelected(null)} onSaved={() => { setSelected(null); load(); }} />
      )}
    </div>
  );
}

function DetailModal({ application, onClose, onSaved }) {
  const [status, setStatus] = useState(application.status);
  const [notes, setNotes] = useState(application.admin_notes || '');
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/evisa/applications/${application.id}`, { status, admin_notes: notes });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(a) {
    const confirmFirst = confirm(`⚠️ Attention : Voulez-vous vraiment supprimer définitivement la demande ${a.reference} de ${a.first_name} ${a.last_name} ?`);
    if (!confirmFirst) return;
    
    const confirmSecond = confirm(`💥 ACTION IRRÉVERSIBLE : Cela supprimera également tous les fichiers joints (passeport, photos) et l'historique de paiement. Confirmer la suppression définitive ?`);
    if (!confirmSecond) return;

    await api.delete(`/evisa/applications/${a.id}`);
    load();
  }

  return (
    <Modal title={`Demande eVisa — ${application.reference}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div><strong>Client :</strong> {application.first_name} {application.last_name}</div>
        <div><strong>Email :</strong> {application.email}</div>
        <div><strong>Téléphone :</strong> {application.phone}</div>
        <div><strong>Passeport :</strong> {application.passport_number || '—'}</div>
        <div><strong>Pays :</strong> {application.country_name}</div>
        <div><strong>Option :</strong> {application.option_label}</div>
        <div><strong>Voyageurs :</strong> {application.nb_travelers}</div>
        <div><strong>Date voyage :</strong> {application.travel_date ? formatDate(application.travel_date) : '—'}</div>
        <div><strong>Prix vente :</strong> {formatDZD(application.sale_price_dzd)}</div>
        <div><strong>Bénéfice :</strong> <span className="text-green">{formatDZD(application.benefit)}</span></div>
      </div>

      {application.message && <div className="mb-4 text-sm"><strong>Message :</strong><p className="text-gray-500">{application.message}</p></div>}

      {application.files?.length > 0 && (
        <div className="mb-4">
          <strong className="text-sm">Documents :</strong>
          <div className="flex gap-2 flex-wrap mt-2">
            {application.files.map((f) => (
              <a key={f.id} href={f.file_path} target="_blank" rel="noreferrer" className="px-3 py-1.5 border rounded-full text-xs">📄 {f.document_label}</a>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSave}>
        <FormField label="Statut">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </FormField>
        <FormField label="Notes internes">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} />
        </FormField>
        <button disabled={saving} className="w-full py-3 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold disabled:opacity-50">
          {saving ? 'Enregistrement...' : 'Mettre à jour'}
        </button>
      </form>
    </Modal>
  );
}
