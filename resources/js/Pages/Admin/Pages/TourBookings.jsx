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
                <td className="p-3">
                  <strong>{b.departure?.tour?.title_fr || '—'}</strong><br />
                  <small className="text-gray-400">Départ du : {formatDate(b.departure?.departure_date)}</small>
                </td>
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
      <div className="grid grid-cols-2 gap-4 text-sm mb-4 bg-gray-50 p-4 rounded-xl">
        <div><strong className="text-xs text-gray-500 block uppercase">Client</strong> {booking.customer_name}</div>
        <div><strong className="text-xs text-gray-500 block uppercase">Téléphone</strong> {booking.customer_phone}</div>
        <div><strong className="text-xs text-gray-500 block uppercase">E-mail</strong> {booking.customer_email || '—'}</div>
        <div><strong className="text-xs text-gray-500 block uppercase">Nb Places</strong> {booking.nb_travelers} pers.</div>
        
        <div className="col-span-2 border-t pt-2 mt-2">
            <strong className="text-xs text-gray-500 block uppercase">Voyage Sélectionné</strong>
            <span className="font-bold text-navy">{booking.departure?.tour?.title_fr || '—'}</span> ({booking.departure?.tour?.destination || '—'})
        </div>
        <div className="col-span-2">
            <strong className="text-xs text-gray-500 block uppercase">Date du départ</strong>
            {booking.departure?.departure_date ? formatDate(booking.departure.departure_date) : '—'} 
            <span className="text-gray-400 mx-2">au</span> 
            {booking.departure?.return_date ? formatDate(booking.departure.return_date) : '—'}
        </div>
      </div>

      {/* NOUVEAU BLOC : Détails de facturation */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 grid grid-cols-2 gap-4 text-sm">
        <div>
           <strong className="text-[10px] text-blue-800 uppercase block mb-1">Hébergement Choisi</strong>
           <span className="font-bold text-navy">{booking.hotel_name || 'Non précisé'}</span> <br/>
           <span className="text-gray-500 text-xs">Chambre : {booking.room_type || '—'}</span>
        </div>
        <div>
           <strong className="text-[10px] text-blue-800 uppercase block mb-1">Total affiché au client</strong>
           <span className="text-xl font-bold text-blue-900 mono">
              {booking.total_price_dzd ? `${Number(booking.total_price_dzd).toLocaleString('fr-DZ')} DZD` : '—'}
           </span>
        </div>
        <div className="col-span-2 border-t border-blue-200/50 pt-3">
           <strong className="text-[10px] text-blue-800 uppercase block mb-1">Répartition des voyageurs ({booking.nb_travelers} total)</strong>
           <div className="flex gap-4 text-gray-700">
              <span>🧑 {booking.nb_adults} Adultes</span>
              <span>👦 {booking.nb_children_bed} Enf (avec lit)</span>
              <span>🧒 {booking.nb_children_nobed} Enf (sans lit)</span>
              <span>👶 {booking.nb_infants} Bébés</span>
           </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="border-t pt-4">
        <FormField label="Statut">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            <option value="nouveau">🆕 Nouveau</option>
            <option value="contacte">📞 Contacté</option>
            <option value="confirme">✅ Confirmé</option>
            <option value="annule">❌ Annulé</option>
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