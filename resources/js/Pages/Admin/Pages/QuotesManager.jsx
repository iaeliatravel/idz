import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { Badge, EmptyState, IconButton, Modal, FormField, inputClass, formatDZD, formatDate, Spinner } from '../Shared/UI';

const STATUS_LABELS = {
  nouveau: '🆕 Nouveau', 
  en_etude: '⏳ En étude', 
  devis_envoye: '✉ Devis envoyé',
  accepte: '✅ Accepté', 
  refuse: '❌ Refusé', 
  annule: '🚫 Annulé'
};

const STATUS_COLORS = { 
  nouveau: 'blue', 
  en_etude: 'amber', 
  devis_envoye: 'purple', 
  accepte: 'green', 
  refuse: 'red', 
  annule: 'red' 
};

export default function QuotesManager() {
  const [quotes, setQuotes] = useState(null);
  const [selected, setSelected] = useState(null);

  // Charge la liste des demandes de devis depuis l'API protégée
  function load() {
    api.get('/quotes').then(({ data }) => setQuotes(data));
  }
  
  useEffect(load, []);

  if (!quotes) return <div className="text-center py-20"><Spinner /></div>;

  async function handleDelete(q) {
    if (!confirm(`Supprimer définitivement la demande de devis de ${q.customer_name} ?`)) return;
    await api.delete(`/quotes/${q.id}`);
    load();
  }

  return (
    <div>
      <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4">Référence</th>
              <th className="p-4">Client</th>
              <th className="p-4">Destination</th>
              <th className="p-4">Durée</th>
              <th className="p-4">Budget estimé</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quotes.length ? quotes.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-mono font-bold text-navy">{q.reference}</td>
                <td className="p-4">
                  <div className="font-semibold text-gray-900">{q.customer_name}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{q.customer_phone}</div>
                </td>
                <td className="p-4 font-semibold text-gray-700">{q.destination}</td>
                <td className="p-4">{q.duration_nights ? `${q.duration_nights} nuits` : '—'}</td>
                <td className="p-4 font-mono text-green-700 font-semibold">
                  {q.estimated_budget_dzd ? formatDZD(q.estimated_budget_dzd) : '—'}
                </td>
                <td className="p-4">
                  <Badge color={STATUS_COLORS[q.status]}>{STATUS_LABELS[q.status]}</Badge>
                </td>
                <td className="p-4 text-gray-500">{formatDate(q.created_at)}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <IconButton title="Voir les détails" onClick={() => setSelected(q)}>👁</IconButton>
                    <IconButton title="Supprimer" danger onClick={() => handleDelete(q)}>🗑️</IconButton>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8}>
                  <EmptyState icon="💼" text="Aucune demande de devis pour l'instant." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <QuoteDetailModal 
          quote={selected} 
          onClose={() => setSelected(null)} 
          onSaved={() => { setSelected(null); load(); }} 
        />
      )}
    </div>
  );
}

function QuoteDetailModal({ quote, onClose, onSaved }) {
  const [status, setStatus] = useState(quote.status);
  const [notes, setNotes] = useState(quote.admin_notes || '');
  const [saving, setSaving] = useState(false);

  // Analyse sécurisée des âges des enfants (stockés en JSON dans la DB)
  let parsedAges = [];
  if (quote.children_ages) {
    try {
      parsedAges = JSON.parse(quote.children_ages);
    } catch (e) {
      console.error("Erreur de lecture des âges enfants", e);
    }
  }

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
    <Modal title={`Traitement Devis — ${quote.reference}`} onClose={onClose} maxWidth="600px">
      
      {/* ── PANNEAU D'INFORMATIONS DU CLIENT ── */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-5 grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
        <div>
          <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Client</span>
          <strong className="text-navy">{quote.customer_name}</strong>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Contact</span>
          <div className="text-gray-800 font-semibold">{quote.customer_phone}</div>
          {quote.customer_email && <div className="text-blue-600 mt-0.5">{quote.customer_email}</div>}
        </div>
        
        <div>
          <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Destination Souhaitée</span>
          <strong className="text-gray-800">{quote.destination}</strong>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Date & Durée</span>
          <div className="text-gray-800">
            {quote.departure_date ? formatDate(quote.departure_date) : 'Date flexible'} 
            {quote.duration_nights && <span className="text-gray-500"> ({quote.duration_nights} nuits)</span>}
          </div>
        </div>

        <div>
          <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Voyageurs</span>
          <div className="text-gray-800 font-medium">
            {quote.nb_adults} Adulte(s) {quote.nb_children > 0 && `, ${quote.nb_children} Enfant(s)`}
          </div>
          {parsedAges.length > 0 && (
            <div className="text-xs font-bold text-[#C9A84C] mt-1 bg-[#FFF9EC] inline-block px-2 py-1 rounded-md border border-[#C9A84C]/20">
              Âges enfants : {parsedAges.map(a => a === 0 ? 'Bébé (<1an)' : `${a} an(s)`).join(' / ')}
            </div>
          )}
        </div>
        
        <div>
          <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Budget Estimatif</span>
          <strong className="text-green-600 text-lg mono">
            {quote.estimated_budget_dzd ? formatDZD(quote.estimated_budget_dzd) : 'Non défini'}
          </strong>
        </div>
      </div>

      {/* ── MESSAGE ET PRÉFÉRENCES (HÔTEL) ── */}
      {quote.message && (
        <div className="mb-5 bg-amber-50 border border-amber-100 p-4 rounded-xl text-sm">
          <strong className="text-amber-800 flex items-center gap-2 mb-2">
            <span>📝</span> Demande spéciale / Hôtel souhaité
          </strong>
          <p className="text-amber-900/80 leading-relaxed whitespace-pre-line">
            {quote.message}
          </p>
        </div>
      )}

      {/* ── FORMULAIRE DE MISE À JOUR (STATUT & NOTES) ── */}
      <form onSubmit={handleSave} className="border-t border-gray-100 pt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField label="Statut du dossier">
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              className={`${inputClass} font-semibold`}
            >
              {Object.entries(STATUS_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Notes internes (visibles uniquement par l'équipe)">
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            rows={3} 
            placeholder="Ex: Client rappelé le 14/05, devis envoyé par email..."
            className={`${inputClass} bg-yellow-50 resize-none`} 
          />
        </FormField>
        
        <button 
          disabled={saving} 
          className="w-full mt-2 py-3 bg-gradient-to-br from-navy to-navy-light text-white rounded-xl font-bold disabled:opacity-50 hover:shadow-md transition-shadow"
        >
          {saving ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </Modal>
  );
}