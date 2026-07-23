import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { Toolbar, Badge, EmptyState, IconButton, Modal, FormField, inputClass, formatDZD, formatDate, Spinner } from '../Shared/UI';

const OCC_LABELS = { quintuple: 'Quintuple', quadruple: 'Quadruple', triple: 'Triple', double: 'Double' };
const STATUS_OPTIONS = ['nouveau', 'contacte', 'confirme', 'annule'];
const STATUS_LABELS = { nouveau: '🆕 Nouveau', contacte: '📞 Contacté', confirme: '✅ Confirmé', annule: '❌ Annulé' };
const STATUS_COLORS = { nouveau: 'blue', contacte: 'amber', confirme: 'green', annule: 'red' };
const TRAVELER_LABELS = { adulte: 'Adulte', enfant_avec_lit: 'Enfant (avec lit)', enfant_sans_lit: 'Enfant (sans lit)', bebe: 'Bébé' };

export default function OmraPrebookings() {
  const [list, setList] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  function load() {
    api.get('/omra/prebookings', { params: { limit: 100, status: statusFilter || undefined } }).then(({ data }) => setList(data));
  }
  useEffect(load, [statusFilter]);

  if (!list) return <div className="text-center py-20"><Spinner /></div>;

  const filtered = list.filter((pb) => !search || JSON.stringify(pb).toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <Toolbar>
        <input placeholder="Rechercher (nom, téléphone, référence)..." value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputClass} max-w-[320px]`} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputClass} max-w-[220px]`}>
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </Toolbar>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
            <tr><th className="p-3">Référence</th><th className="p-3">Contact</th><th className="p-3">Départ</th><th className="p-3">Chambre</th><th className="p-3">Pers.</th><th className="p-3">Total</th><th className="p-3">Bénéfice</th><th className="p-3">Statut</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {filtered.length ? filtered.map((pb) => (
              <tr key={pb.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-bold">{pb.reference}</td>
                <td className="p-3">{pb.contact_name}<br /><small className="text-gray-400">{pb.contact_phone}</small></td>
                <td className="p-3">{pb.departure_title || '—'}<br /><small className="text-gray-400">{pb.mecque_hotel_name || ''} {pb.departure_date ? '· ' + formatDate(pb.departure_date) : ''}</small></td>
                <td className="p-3">{OCC_LABELS[pb.occupancy] || pb.occupancy}</td>
                <td className="p-3">{pb.nb_adults}A / {pb.nb_children_bed + pb.nb_children_nobed}E / {pb.nb_infants}B</td>
                <td className="p-3">{formatDZD(pb.estimated_total_dzd)}</td>
                <td className="p-3 text-green font-bold">{formatDZD(pb.benefit)}</td>
                <td className="p-3"><Badge color={STATUS_COLORS[pb.status]}>{STATUS_LABELS[pb.status]}</Badge></td>
                <td className="p-3"><IconButton title="Détails" onClick={() => setSelected(pb)}>👁</IconButton></td>
              </tr>
            )) : <tr><td colSpan={9}><EmptyState icon="📥" text="Aucune pré-réservation." /></td></tr>}
          </tbody>
        </table>
      </div>

      {selected && <DetailModal prebooking={selected} onClose={() => setSelected(null)} onSaved={() => { setSelected(null); load(); }} />}
    </div>
  );
}

function DetailModal({ prebooking, onClose, onSaved }) {
  const [status, setStatus] = useState(prebooking.status);
  const [notes, setNotes] = useState(prebooking.admin_notes || '');
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/omra/prebookings/${prebooking.id}`, { status, admin_notes: notes });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Pré-réservation — ${prebooking.reference}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div><strong>Contact :</strong> {prebooking.contact_name}</div>
        <div><strong>Téléphone :</strong> {prebooking.contact_phone}</div>
        <div><strong>Email :</strong> {prebooking.contact_email || '—'}</div>
        <div><strong>Départ :</strong> {prebooking.departure_title || '—'}</div>
        <div><strong>Hôtel Mecque :</strong> {prebooking.mecque_hotel_name || '—'}</div>
        <div><strong>Hôtel Médine :</strong> {prebooking.medine_hotel_name || '—'}</div>
        <div><strong>Chambre :</strong> {prebooking.occupancy}</div>
        <div><strong>Total estimé :</strong> {formatDZD(prebooking.estimated_total_dzd)}</div>
        <div><strong>Bénéfice :</strong> <span className="text-green">{formatDZD(prebooking.benefit)}</span></div>
      </div>

      {prebooking.travelers?.length > 0 && (
        <div className="mb-4">
          <strong className="text-sm">Voyageurs ({prebooking.travelers.length}) :</strong>
          <table className="w-full text-sm mt-2">
            <thead><tr className="text-left text-gray-400 border-b"><th className="py-1">Nom</th><th>Type</th><th>Passeport</th></tr></thead>
            <tbody>
              {prebooking.travelers.map((t, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-1.5">{t.full_name}</td>
                  <td>{TRAVELER_LABELS[t.traveler_type] || t.traveler_type}</td>
                  <td>{t.passport_scan_path ? <a href={t.passport_scan_path} target="_blank" rel="noreferrer" className="text-skyblue underline">Voir</a> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
