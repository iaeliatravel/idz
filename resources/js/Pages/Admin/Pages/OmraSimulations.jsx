import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { EmptyState, formatDZD, formatDate, KpiCard, Spinner } from '../Shared/UI';

export default function OmraSimulations() {
  const [sims, setSims] = useState(null);

  useEffect(() => { api.get('/omra/simulations').then(({ data }) => setSims(data)); }, []);

  if (!sims) return <div className="text-center py-20"><Spinner /></div>;

  return (
    <div>
      <div className="mb-5"><KpiCard icon="🧮" value={sims.length} label="Simulations enregistrées (200 dernières)" color="skyblue" /></div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
            <tr><th className="p-3">Départ</th><th className="p-3">Chambre</th><th className="p-3">Adultes</th><th className="p-3">Enfants</th><th className="p-3">Bébés</th><th className="p-3">Estimation</th><th className="p-3">Contact</th><th className="p-3">Date</th></tr>
          </thead>
          <tbody>
            {sims.length ? sims.map((s) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{s.departure_title || '—'}<br /><small className="text-gray-400">{s.mecque_hotel_name || ''}</small></td>
                <td className="p-3">{s.occupancy}</td>
                <td className="p-3">{s.nb_adults}</td>
                <td className="p-3">{s.nb_children_bed + s.nb_children_nobed}</td>
                <td className="p-3">{s.nb_infants}</td>
                <td className="p-3"><strong>{formatDZD(s.estimated_total_dzd)}</strong></td>
                <td className="p-3">{s.full_name || '—'}<br /><small className="text-gray-400">{s.phone || ''}</small></td>
                <td className="p-3">{formatDate(s.created_at)}</td>
              </tr>
            )) : <tr><td colSpan={8}><EmptyState icon="🧮" text="Aucune simulation enregistrée." /></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
