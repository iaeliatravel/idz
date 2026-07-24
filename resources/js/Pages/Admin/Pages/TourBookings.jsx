import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { Toolbar, Badge, EmptyState, IconButton, Modal, FormField, inputClass, formatDate, Spinner } from '../Shared/UI';

const STATUS_LABELS = { nouveau: '🆕 Nouveau', contacte: '📞 Contacté', confirme: '✅ Confirmé', annule: '❌ Annulé' };
const STATUS_COLORS = { nouveau: 'blue', contacte: 'amber', confirme: 'green', annule: 'red' };

export default function TourBookings() {
  const [bookings, setBookings] = useState(null);
  const [selected, setSelected] = useState(null);

  function load() {
    api.get('/tour-bookings').then(({ data }) => setBookings(data));
  }
  useEffect(load, []);

  if (!bookings) return <div className="text-center py-20"><Spinner /></div>;

  async function handleDelete(b) {
    if (!confirm('Supprimer définitivement cette réservation de voyage organisé ?')) return;
    await api.delete(`/tour-bookings/${b.id}`);
    load();
  }

  return (
    <div>
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-3">Référence</th><th className="p-3">Client</th><th className="p-3">Voyage</th>
              <th className="p-3">Voyageurs</th><th className="p-3">Statut</th><th className="p-3">Date</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.length ? bookings.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-bold">{b.reference}</td>
                <td className="p-3">{b.customer_name}<br /><small className="text-gray-400">{b.customer_phone}</small></td>
                <td className="p-3"><strong>{b.tour?.title_fr || '—'}</strong><br /><small className="text-gray-400">{b.tour?.destination || ''}</small></td>
                <td className="p-3 font-semibold">{b.nb_travelers} pers.</td>
                <td className="p-3"><Badge color={STATUS_COLORS[b.status]}>{STATUS_LABELS[b.status]}</Badge></td>
                <td className="p-3">{formatDate(b.created_at)}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <IconButton title="Détails" onClick={() => setSelected(b)}>👁</IconButton>
                    <IconButton title="Supprimer" danger onClick={() => handleDelete(b)}>🗑️</IconButton>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={7}><EmptyState icon="📝" text="Aucune réservation pour l'instant." /></td></tr>}
          </tbody>
        </table>
      </div>

      {selected && (
        <BookingDetailModal booking={selected} onClose={() => setSelected(null)} onSaved={() => { setSelected(null); load(); }} />
      )}
    </div>
  );
}

function BookingDetailModal({ booking, onClose, onSaved }) {
  const [status, setStatus] = useState(booking.status);
  const [notes, setNotes] = useState(booking.admin_notes || '');
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/tour-bookings/${booking.id}`, { status, admin_notes: notes });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Réservation — ${booking.reference}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div><strong>Client :</strong> {booking.customer_name}</div>
        <div><strong>Téléphone :</strong> {booking.customer_phone}</div>
        <div><strong>E-mail :</strong> {booking.customer_email || '—'}</div>
        <div><strong>Voyage :</strong> {booking.tour?.title_fr || '—'}</div>
        <div><strong>Destination :</strong> {booking.tour?.destination || '—'}</div>
        <div><strong>Nombre de places réservées :</strong> {booking.nb_travelers}</div>
        <div><strong>Date de départ :</strong> {booking.tour?.departure_date ? formatDate(booking.tour.departure_date) : '—'}</div>
      </div>

      <form onSubmit={handleSave} className="border-t pt-4">
        <FormField label="Statut">
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