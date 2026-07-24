import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { Toolbar, Badge, EmptyState, IconButton, Modal, FormField, inputClass, formatDZD, formatDate, Spinner } from '../Shared/UI';

const STATUS_LABELS = {
  nouveau: '🆕 Nouveau', en_etude: '⏳ En étude', devis_envoye: '✉ Devis envoyé',
  accepte: '✅ Accepté', refuse: '❌ Refusé', annule: '🚫 Annulé'
};
const STATUS_COLORS = { nouveau: 'blue', en_etude: 'amber', devis_envoye: 'purple', accepte: 'green', refuse: 'red', annule: 'red' };

export default function QuotesManager() {
  const [quotes, setQuotes] = useState(null);
  const [selected, setSelected] = useState(null);

  function load() {
    api.get('/quotes').then(({ data }) => setQuotes(data));
  }
  useEffect(load, []);

  if (!quotes) return <div className="text-center py-20"><Spinner /></div>;

  async function handleDelete(q) {
    if (!confirm('Supprimer définitivement cette demande de devis ?')) return;
    await api.delete(`/quotes/${q.id}`);
    load();
  }

  return (
    <div>
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-3">Référence</th><th className="p-3">Client</th><th className="p-3">Destination</th>
              <th className="p-3">Nuits</th><th className="p-3">Budget</th><th className="p-3">Statut</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {quotes.length ? quotes.map((q) => (
              <tr key={q.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-bold">{q.reference}</td>
                <td className="p-3">{q.customer_name}<br /><small className="text-gray-400">{q.customer_phone}</small></td>
                <td className="p-3"><strong>{q.destination}</strong></td>
                <td className="p-3">{q.duration_nights || '—'} n</td>
                <td className="p-3">{q.estimated_budget_dzd ? formatDZD(q.estimated_budget_dzd) : '—'}</td>
                <td className="p-3"><Badge color={STATUS_COLORS[q.status]}>{STATUS_LABELS[q.status]}</Badge></td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <IconButton title="Détails" onClick={() => setSelected(q)}>👁</IconButton>
                    <IconButton title="Supprimer" danger onClick={() => handleDelete(q)}>🗑️</IconButton>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={7}><EmptyState icon="💼" text="Aucune demande de devis pour l'instant." /></td></tr>}
          </tbody>
        </table>
      </div>

      {selected && (
        <QuoteDetailModal quote={selected} onClose={() => setSelected(null)} onSaved={() => { setSelected(null); load(); }} />
      )}
    </div>
  );
}

function QuoteDetailModal({ quote, onClose, onSaved }) {
  const [status, setStatus] = useState(quote.status);
  const [notes, setNotes] = useState(quote.admin_notes || '');
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/quotes/${quote.id}`, { status, admin_notes: notes });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Demande de Devis — ${quote.reference}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div><strong>Nom du client :</strong> {quote.customer_name}</div>
        <div><strong>Téléphone :</strong> {quote.customer_phone}</div>
        <div><strong>E-mail :</strong> {quote.customer_email}</div>
        <div><strong>Destination :</strong> {quote.destination}</div>
        <div><strong>Voyageurs :</strong> {quote.nb_adults} Adultes, {quote.nb_children} Enfants</div>
        <div><strong>Durée :</strong> {quote.duration_nights || 'Non précisé'} nuits</div>
        <div><strong>Hôtel :</strong> {quote.hotel_stars ? `${quote.hotel_stars} étoiles ★` : 'Non précisé'}</div>
        <div><strong>Budget estimé :</strong> {quote.estimated_budget_dzd ? formatDZD(quote.estimated_budget_dzd) : 'Non précisé'}</div>
      </div>

      {quote.message && (
        <div className="mb-4 bg-gray-50 p-3 rounded-lg text-sm">
          <strong>Message client :</strong>
          <p className="text-gray-600 mt-1 whitespace-pre-line">{quote.message}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="border-t pt-4">
        <FormField label="Statut de l'étude">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            {Object.entries(STATUS_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </FormField>
        <FormField label="Notes internes de traitement">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} />
        </FormField>
        <button disabled={saving} className="w-full py-3 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold disabled:opacity-50">
          {saving ? 'Enregistrement...' : 'Mettre à jour'}
        </button>
      </form>
    </Modal>
  );
}